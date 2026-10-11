import fs from "fs";
import path from "path";
import {
  PartnerApplicationRecord,
  PartnerFormData,
  PartnerApplicationStatus,
  VerificationChecklist,
  PartnerAuditLog,
} from "./partner-types";
import { hasSupabaseServerEnv } from "./env";
import { getSupabaseClient } from "./supabase/server";
import { REDEMPTION_RULES } from "./kenya-data";
import { getCountryDeclarationConfig } from "./country-declarations";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "partner_applications.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readLocalApplications(): PartnerApplicationRecord[] {
  try {
    ensureDirectoryExists();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as PartnerApplicationRecord[];
  } catch (err) {
    console.error("[Storage] Failed to read local applications file:", err);
    return [];
  }
}

function writeLocalApplications(apps: PartnerApplicationRecord[]) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  } catch (err) {
    console.error("[Storage] Failed to write local applications file:", err);
  }
}

export function generateApplicationReference(): string {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `SAGO-PTR-${year}-${randomChars}${timestamp}`;
}

export function generatePartnerId(seq: number): string {
  const pad = String(seq).padStart(4, "0");
  return `SAGO-PRT-${pad}`;
}

function getNextPartnerSequence(apps: PartnerApplicationRecord[]): number {
  let maxSeq = 0;
  for (const app of apps) {
    if (app.partnerIdAssigned) {
      const match = app.partnerIdAssigned.match(/SAGO-PRT-(\d+)/);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) maxSeq = seq;
      }
    }
  }
  return maxSeq + 1;
}

export function generateOutletId(partnerId: string, outletIndex: number): string {
  const pad = String(outletIndex + 1).padStart(2, "0");
  return `${partnerId}-OUT-${pad}`;
}

export const DEFAULT_CHECKLIST: VerificationChecklist = {
  business_registration_verified: false,
  business_address_verified: false,
  owner_rep_verified: false,
  licences_verified: false,
  tax_docs_reviewed: false,
  terms_reviewed: false,
  agreement_signed: false,
  outlet_access_configured: false,
  staff_accounts_configured: false,
  training_completed: false,
  test_coupon_redeemed: false,
  final_approval_granted: false,
};

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function saveApplication(
  formData: PartnerFormData,
  isDraft: boolean = false,
  existingReference?: string,
  ownershipToken?: string
): Promise<{ record: PartnerApplicationRecord; reference: string; newOwnershipToken?: string }> {
  const now = new Date().toISOString();

  // Resolve existing record by reference using authoritative source (Supabase first, then local)
  let existingRecord: PartnerApplicationRecord | null = null;
  if (existingReference) {
    existingRecord = await getApplicationByReference(existingReference);
  }

  // If updating an existing record, validate ownership and status
  if (existingRecord) {
    // Require ownership token for updates
    if (!ownershipToken) {
      throw new Error("Ownership token required to update existing application.");
    }
    
    // Verify ownership token against stored hash using constant-time comparison
    const storedHash = existingRecord.data.ownershipTokenHash;
    if (!storedHash) {
      throw new Error("Invalid ownership token for this application.");
    }
    
    const providedHash = await hashToken(ownershipToken);
    if (!constantTimeEqual(storedHash, providedHash)) {
      throw new Error("Invalid ownership token for this application.");
    }
    
    // Reject updates to records under review or approved
    if (existingRecord.status !== "draft") {
      throw new Error(`Cannot update application with status: ${existingRecord.status}. Only drafts can be modified.`);
    }
  }

  const isUpdating = !!existingRecord;
  
  // If existingReference was provided but no record found, reject instead of creating new
  if (existingReference && !existingRecord) {
    throw new Error(`Application with reference ${existingReference} not found. Cannot create new application with existing reference.`);
  }
  
  const reference = isUpdating
    ? existingRecord!.applicationReference
    : generateApplicationReference();

  const id = isUpdating ? existingRecord!.id : crypto.randomUUID();

  const status: PartnerApplicationStatus = isDraft
    ? "draft"
    : "pending_review";

  // Generate ownership token for new drafts
  const newOwnershipToken = isDraft && !isUpdating ? crypto.randomUUID() : undefined;
  const ownershipTokenHash = newOwnershipToken ? await hashToken(newOwnershipToken) : (isUpdating ? existingRecord!.data.ownershipTokenHash : undefined);

  const initialAuditLog: PartnerAuditLog = {
    id: crypto.randomUUID(),
    applicationId: id,
    actorName: formData.signatoryFullName || "Applicant",
    action: isDraft ? "DRAFT_SAVED" : "APPLICATION_SUBMITTED",
    newValue: { status, tradingName: formData.tradingName },
    timestamp: now,
  };

  // Merge formData with ownership token hash
  // For updates: preserve existing ownershipTokenHash if formData doesn't provide one
  // For new drafts: use newly generated hash
  const dataWithToken = isUpdating
    ? { ...formData, ownershipTokenHash: existingRecord!.data.ownershipTokenHash }
    : newOwnershipToken
      ? { ...formData, ownershipTokenHash }
      : formData;

  const newRecord: PartnerApplicationRecord = {
    id,
    applicationReference: reference,
    status,
    submittedAt: now,
    createdAt: isUpdating ? existingRecord!.createdAt : now,
    updatedAt: now,
    data: dataWithToken,
    checklist: isUpdating ? existingRecord!.checklist : { ...DEFAULT_CHECKLIST },
    auditLogs:
      isUpdating
        ? [initialAuditLog, ...existingRecord!.auditLogs]
        : [initialAuditLog],
    assignedOfficerId: isUpdating ? existingRecord!.assignedOfficerId : undefined,
    assignedOfficerName: isUpdating ? existingRecord!.assignedOfficerName : undefined,
    // Do not retain partnerIdAssigned when updating a draft
    partnerIdAssigned: undefined,
    outletIdsAssigned: undefined,
    agreementReference: isUpdating ? existingRecord!.agreementReference : undefined,
    activationDate: isUpdating ? existingRecord!.activationDate : undefined,
    renewalDate: isUpdating ? existingRecord!.renewalDate : undefined,
    internalNotes: isUpdating ? existingRecord!.internalNotes : undefined,
    decisionReason: isUpdating ? existingRecord!.decisionReason : undefined,
  };

  // 1. Try Supabase if configured
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const { error: sbError } = await supabase.from("partner_applications").upsert({
        id: newRecord.id,
        application_reference: newRecord.applicationReference,
        registered_business_name: formData.registeredBusinessName,
        trading_name: formData.tradingName,
        business_type: formData.businessType,
        business_type_other: formData.businessTypeOther,
        business_registration_number: formData.businessRegistrationNumber,
        date_of_establishment: formData.dateOfEstablishment || null,
        business_website: formData.businessWebsite || null,
        business_email: formData.businessEmail,
        business_phone: formData.businessPhone,
        country: formData.country,
        county: formData.county,
        town_city: formData.townCity,
        estate_area: formData.estateArea,
        street_building: formData.streetBuilding,
        postal_address: formData.postalAddress,
        gps_coordinates: formData.gpsCoordinates,
        google_maps_link: formData.googleMapsLink,
        number_of_outlets: formData.numberOfOutlets,
        daily_customer_footfall: formData.dailyCustomerFootfall,
        operating_days: formData.operatingDays,
        opening_hours: formData.openingHours,
        monthly_sales_volume: formData.monthlySalesVolume,
        sells_alcohol: formData.sellsAlcohol,
        has_bar_manager: formData.hasBarManager,
        owner_full_name: formData.ownerFullName,
        owner_position: formData.ownerPosition,
        owner_nationality: formData.ownerNationality,
        owner_email: formData.ownerEmail,
        owner_phone: formData.ownerPhone,
        owner_alt_phone: formData.ownerAltPhone,
        auth_contact_name: formData.authContactName,
        auth_contact_title: formData.authContactTitle,
        auth_contact_email: formData.authContactEmail,
        auth_contact_phone: formData.authContactPhone,
        auth_contact_can_sign: formData.authContactCanSign,
        ownership_structure: formData.ownershipStructure,
        directors_partners: formData.directors,
        auth_agreement_person: formData.authAgreementPerson,
        partnership_type: formData.partnershipType,
        partnership_type_other: formData.partnershipTypeOther,
        preferred_start_date: formData.preferredStartDate || null,
        agreement_duration: formData.agreementDuration,
        outlets_joining_count: formData.outletsJoiningCount,
        campaign_discount_type: formData.campaignDiscountType,
        proposed_discount_rates: formData.proposedDiscountRates,
        minimum_purchase_req: formData.minimumPurchaseReq,
        max_discount_per_tx: formData.maxDiscountPerTx,
        eligible_products_terms: formData.eligibleProductsTerms,
        discount_days_hours: formData.discountDaysHours,
        campaign_start_date: formData.campaignStartDate || null,
        campaign_end_date: formData.campaignEndDate || null,
        redemption_limit: formData.redemptionLimit || null,
        combinable_with_offers: formData.combinableWithOffers,
        campaign_exclusions: formData.campaignExclusions,
        outlet_display_name: formData.outletDisplayName,
        redemption_method: formData.redemptionMethod,
        staff_access_count: formData.staffAccessCount,
        designated_outlet_manager: formData.designatedOutletManager,
        staff_training_status: formData.staffTrainingStatus,
        has_smartphone_tablet: formData.hasSmartphoneTablet,
        has_reliable_internet: formData.hasReliableInternet,
        has_computer_device: formData.hasComputerDevice,
        preferred_redemption_device: formData.preferredRedemptionDevice,
        requires_onboarding_assistance: formData.requiresOnboardingAssistance,
        redemption_rules_acknowledged: true,
        requires_settlement: formData.requiresSettlement,
        settlement_arrangement: formData.settlementArrangement,
        settlement_bank_name: formData.settlementBankName,
        settlement_account_name: formData.settlementAccountName,
        settlement_account_number: formData.settlementAccountNumber,
        settlement_branch: formData.settlementBranch,
        settlement_currency: formData.settlementCurrency,
        settlement_alt_method: formData.settlementAltMethod,
        settlement_contact_name: formData.settlementContactName,
        settlement_contact_email: formData.settlementContactEmail,
        settlement_contact_phone: formData.settlementContactPhone,
        settlement_agreed_terms: formData.settlementAgreedTerms,
        settlement_frequency: formData.settlementFrequency,
        settlement_invoice_req: formData.settlementInvoiceReq,
        perm_list_partner: formData.permListPartner,
        perm_display_name_address: formData.permDisplayNameAddress,
        perm_use_photos: formData.permUsePhotos,
        perm_display_promo_materials: formData.permDisplayPromoMaterials,
        perm_social_channels: formData.permSocialChannels,
        marketing_social_handles: formData.marketingSocialHandles,
        marketing_contact_person: formData.marketingContactPerson,
        marketing_contact_email: formData.marketingContactEmail,
        marketing_contact_phone: formData.marketingContactPhone,
        declarations_acknowledged: true,
        privacy_notice_acknowledged: true,
        marketing_comms_consent: formData.marketingCommsConsent,
        signatory_full_name: formData.signatoryFullName,
        signatory_designation: formData.signatoryDesignation,
        signatory_business_name: formData.signatoryBusinessName,
        signature_data: formData.signatureData,
        signature_date: formData.signatureDate || now.split("T")[0],
        status,
        updated_at: now,
        ownership_token_hash: ownershipTokenHash,
      });
      if (sbError) {
        console.error("[Storage] Supabase upsert error:", sbError);
        throw new Error(`Database write failed: ${sbError.message}`);
      }

      // Persist documents directly to Supabase partner_documents table
      if (Array.isArray(formData.documents) && formData.documents.length > 0) {
        try {
          await supabase.from("partner_documents").delete().eq("application_id", newRecord.id);
        } catch {
          // Ignored
        }

        for (const doc of formData.documents) {
          if (!doc || !doc.fileName) continue;
          try {
            await supabase.from("partner_documents").insert({
              application_id: newRecord.id,
              document_type: doc.documentType || "Compliance Document",
              document_number: doc.documentNumber || null,
              file_name: doc.fileName,
              file_size: doc.fileSize || 0,
              mime_type: doc.mimeType || "application/pdf",
              storage_path: doc.storagePath || doc.fileUrl || "",
              verification_status: "pending",
            });
          } catch (docErr) {
            console.warn("[Storage] Document insert warning:", docErr);
          }
        }
      }
    } catch (sbErr) {
      console.error("[Storage] Supabase upsert failed:", sbErr);
      throw sbErr;
    }
  }

  // 2. Persist to local JSON file store
  const apps = readLocalApplications();
  const localIndex = apps.findIndex((a) => a.applicationReference === reference);
  if (localIndex >= 0) {
    apps[localIndex] = newRecord;
  } else {
    apps.unshift(newRecord);
  }
  writeLocalApplications(apps);

  return { record: newRecord, reference, newOwnershipToken };
}

export async function getApplicationByReference(
  reference: string
): Promise<PartnerApplicationRecord | null> {
  // Use Supabase as authoritative source when available
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .eq("application_reference", reference.toUpperCase())
        .single();
      
      if (!error && data) {
        const { data: docs } = await supabase
          .from("partner_documents")
          .select("*")
          .eq("application_id", data.id);

        return mapSupabaseRecordToApplication(data, docs || []);
      }
    } catch (sbErr) {
      console.warn("[Storage] Supabase read failed, falling back to local:", sbErr);
    }
  }
  
  // Fallback to local storage
  const apps = readLocalApplications();
  const found = apps.find(
    (a) => a.applicationReference.toUpperCase() === reference.trim().toUpperCase()
  );
  return found || null;
}

export async function getApplicationById(
  id: string
): Promise<PartnerApplicationRecord | null> {
  // Use Supabase as authoritative source when available
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        const { data: docs } = await supabase
          .from("partner_documents")
          .select("*")
          .eq("application_id", data.id);

        return mapSupabaseRecordToApplication(data, docs || []);
      }
    } catch (sbErr) {
      console.warn("[Storage] Supabase read failed, falling back to local:", sbErr);
    }
  }
  
  // Fallback to local storage
  const apps = readLocalApplications();
  const found = apps.find((a) => a.id === id);
  return found || null;
}

function mapSupabaseRecordToApplication(
  data: Record<string, unknown>,
  docs: any[] = []
): PartnerApplicationRecord {
  // Helper to normalize nullable strings to empty strings
  const ns = (value: unknown): string => (value ?? "").toString();

  return {
    id: ns(data.id),
    applicationReference: ns(data.application_reference),
    status: data.status as PartnerApplicationStatus,
    submittedAt: ns(data.submitted_at),
    createdAt: ns(data.created_at),
    updatedAt: ns(data.updated_at),
    data: {
      registeredBusinessName: ns(data.registered_business_name),
      tradingName: ns(data.trading_name),
      businessType: ns(data.business_type),
      businessTypeOther: ns(data.business_type_other),
      businessRegistrationNumber: ns(data.business_registration_number),
      dateOfEstablishment: ns(data.date_of_establishment),
      businessWebsite: ns(data.business_website),
      businessEmail: ns(data.business_email),
      businessPhone: ns(data.business_phone),
      country: ns(data.country),
      county: ns(data.county),
      townCity: ns(data.town_city),
      estateArea: ns(data.estate_area),
      streetBuilding: ns(data.street_building),
      postalAddress: ns(data.postal_address),
      gpsCoordinates: ns(data.gps_coordinates),
      googleMapsLink: ns(data.google_maps_link),
      numberOfOutlets: (data.number_of_outlets as number) ?? 1,
      dailyCustomerFootfall: ns(data.daily_customer_footfall),
      operatingDays: (data.operating_days as string[]) ?? [],
      openingHours: ns(data.opening_hours),
      monthlySalesVolume: ns(data.monthly_sales_volume),
      sellsAlcohol: (data.sells_alcohol as boolean) ?? true,
      hasBarManager: (data.has_bar_manager as boolean) ?? true,
      additionalOutlets: (data.additional_outlets as any[]) ?? [],
      documents: (docs && docs.length > 0 ? docs : (data.documents as any[]) ?? []).map((d) => ({
        id: ns(d.id),
        documentType: ns(d.document_type || d.documentType) || "Compliance Document",
        documentNumber: ns(d.document_number || d.documentNumber),
        issuingAuthority: ns(d.issuing_authority || d.issuingAuthority),
        issueDate: ns(d.issue_date || d.issueDate),
        expiryDate: ns(d.expiry_date || d.expiryDate),
        fileName: ns(d.file_name || d.fileName),
        fileSize: typeof d.file_size === "number" ? d.file_size : typeof d.fileSize === "number" ? d.fileSize : 0,
        mimeType: ns(d.mime_type || d.mimeType) || "application/pdf",
        fileUrl: ns(d.storage_path || d.fileUrl),
        storagePath: ns(d.storage_path || d.storagePath),
        uploadedAt: ns(d.created_at || d.uploadedAt) || new Date().toISOString(),
        verificationStatus: (ns(d.verification_status || d.verificationStatus) || "pending") as any,
      })),
      ownerFullName: ns(data.owner_full_name),
      ownerPosition: ns(data.owner_position),
      ownerNationality: ns(data.owner_nationality),
      ownerEmail: ns(data.owner_email),
      ownerPhone: ns(data.owner_phone),
      ownerAltPhone: ns(data.owner_alt_phone),
      authContactName: ns(data.auth_contact_name),
      authContactTitle: ns(data.auth_contact_title),
      authContactEmail: ns(data.auth_contact_email),
      authContactPhone: ns(data.auth_contact_phone),
      authContactCanSign: (data.auth_contact_can_sign as boolean) ?? true,
      ownershipStructure: ns(data.ownership_structure),
      directors: (data.directors_partners as any[]) ?? [],
      authAgreementPerson: ns(data.auth_agreement_person),
      partnershipType: ns(data.partnership_type),
      partnershipTypeOther: ns(data.partnership_type_other),
      preferredStartDate: ns(data.preferred_start_date),
      agreementDuration: ns(data.agreement_duration),
      outletsJoiningCount: (data.outlets_joining_count as number) ?? 1,
      products: (data.products as any[]) ?? [],
      campaignDiscountType: data.campaign_discount_type as "Percentage" | "Fixed Amount" | "Other",
      proposedDiscountRates: ns(data.proposed_discount_rates),
      minimumPurchaseReq: ns(data.minimum_purchase_req),
      maxDiscountPerTx: ns(data.max_discount_per_tx),
      eligibleProductsTerms: ns(data.eligible_products_terms),
      discountDaysHours: ns(data.discount_days_hours),
      campaignStartDate: ns(data.campaign_start_date),
      campaignEndDate: ns(data.campaign_end_date),
      redemptionLimit: (data.redemption_limit as number) ?? 0,
      combinableWithOffers: (data.combinable_with_offers as boolean) ?? false,
      campaignExclusions: ns(data.campaign_exclusions),
      outletDisplayName: ns(data.outlet_display_name),
      redemptionMethod: ns(data.redemption_method),
      staffAccessCount: (data.staff_access_count as number) ?? 0,
      designatedOutletManager: ns(data.designated_outlet_manager),
      staffTrainingStatus: ns(data.staff_training_status),
      hasSmartphoneTablet: (data.has_smartphone_tablet as boolean) ?? true,
      hasReliableInternet: (data.has_reliable_internet as boolean) ?? true,
      hasComputerDevice: (data.has_computer_device as boolean) ?? true,
      preferredRedemptionDevice: ns(data.preferred_redemption_device),
      requiresOnboardingAssistance: (data.requires_onboarding_assistance as boolean) ?? true,
      acknowledgedRedemptionRules: (() => {
        const val = data.redemption_rules_acknowledged;
        if (Array.isArray(val)) return val;
        if (val === true) return new Array(REDEMPTION_RULES.length).fill(true);
        return new Array(REDEMPTION_RULES.length).fill(false);
      })(),
      requiresSettlement: (data.requires_settlement as boolean) ?? false,
      settlementArrangement: ns(data.settlement_arrangement),
      settlementBankName: ns(data.settlement_bank_name),
      settlementAccountName: ns(data.settlement_account_name),
      settlementAccountNumber: ns(data.settlement_account_number),
      settlementBranch: ns(data.settlement_branch),
      settlementCurrency: ns(data.settlement_currency),
      settlementAltMethod: ns(data.settlement_alt_method),
      settlementContactName: ns(data.settlement_contact_name),
      settlementContactEmail: ns(data.settlement_contact_email),
      settlementContactPhone: ns(data.settlement_contact_phone),
      settlementAgreedTerms: ns(data.settlement_agreed_terms),
      settlementFrequency: ns(data.settlement_frequency),
      settlementInvoiceReq: ns(data.settlement_invoice_req),
      permListPartner: (data.perm_list_partner as boolean) ?? true,
      permDisplayNameAddress: (data.perm_display_name_address as boolean) ?? true,
      permUsePhotos: (data.perm_use_photos as boolean) ?? true,
      permDisplayPromoMaterials: (data.perm_display_promo_materials as boolean) ?? true,
      permSocialChannels: (data.perm_social_channels as boolean) ?? true,
      marketingSocialHandles: ns(data.marketing_social_handles),
      marketingContactPerson: ns(data.marketing_contact_person),
      marketingContactEmail: ns(data.marketing_contact_email),
      marketingContactPhone: ns(data.marketing_contact_phone),
      declarations: (() => {
        const val = data.declarations_acknowledged;
        const country = ns(data.country) || "Kenya";
        const expectedCount = getCountryDeclarationConfig(country).declarations.length;
        if (Array.isArray(val)) return val;
        if (val === true) return new Array(expectedCount).fill(true);
        return new Array(expectedCount).fill(false);
      })(),
      privacyNoticeAcknowledged: (data.privacy_notice_acknowledged as boolean) ?? false,
      marketingCommsConsent: (data.marketing_comms_consent as boolean) ?? false,
      signatoryFullName: ns(data.signatory_full_name),
      signatoryDesignation: ns(data.signatory_designation),
      signatoryBusinessName: ns(data.signatory_business_name),
      signatureData: ns(data.signature_data),
      signatureDate: ns(data.signature_date),
      ownershipTokenHash: ns(data.ownership_token_hash) || undefined,
    },
    assignedOfficerId: ns(data.assigned_officer_id),
    assignedOfficerName: ns(data.assigned_officer_name),
    partnerIdAssigned: ns(data.partner_id_assigned),
    outletIdsAssigned: (data.outlet_ids_assigned as Record<string, string>) ?? {},
    agreementReference: ns(data.agreement_reference),
    activationDate: ns(data.activation_date),
    renewalDate: ns(data.renewal_date),
    internalNotes: ns(data.internal_notes),
    decisionReason: ns(data.decision_reason),
    checklist: data.checklist as VerificationChecklist,
    auditLogs: [],
  };
}

export async function getAllApplications(
  statusFilter?: string,
  searchQuery?: string
): Promise<PartnerApplicationRecord[]> {
  // Use Supabase as authoritative source when available
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from("partner_applications").select("*");
      
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query.order("submitted_at", { ascending: false });
      
      if (!error && data) {
        const appIds = data.map((d) => d.id);
        const { data: allDocs } = await supabase
          .from("partner_documents")
          .select("*")
          .in("application_id", appIds);

        const docsByApp: Record<string, any[]> = {};
        if (allDocs) {
          for (const d of allDocs) {
            const appId = d.application_id;
            docsByApp[appId] = docsByApp[appId] || [];
            docsByApp[appId].push(d);
          }
        }

        let results = data.map((d) =>
          mapSupabaseRecordToApplication(d, docsByApp[d.id] || [])
        );
        
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          results = results.filter((app) => {
            const ref = app.applicationReference.toLowerCase();
            const name = app.data.registeredBusinessName.toLowerCase();
            const trading = app.data.tradingName.toLowerCase();
            const email = app.data.businessEmail.toLowerCase();
            const county = app.data.county.toLowerCase();
            return (
              ref.includes(q) ||
              name.includes(q) ||
              trading.includes(q) ||
              email.includes(q) ||
              county.includes(q)
            );
          });
        }
        
        return results;
      }
    } catch (sbErr) {
      console.warn("[Storage] Supabase read failed, falling back to local:", sbErr);
    }
  }
  
  // Fallback to local storage
  const apps = readLocalApplications();

  return apps.filter((app) => {
    if (statusFilter && statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const ref = app.applicationReference.toLowerCase();
      const name = app.data.registeredBusinessName.toLowerCase();
      const trading = app.data.tradingName.toLowerCase();
      const email = app.data.businessEmail.toLowerCase();
      const county = app.data.county.toLowerCase();
      return (
        ref.includes(q) ||
        name.includes(q) ||
        trading.includes(q) ||
        email.includes(q) ||
        county.includes(q)
      );
    }

    return true;
  });
}

export async function updateApplicationVerification(
  id: string,
  updates: {
    status?: PartnerApplicationStatus;
    assignedOfficerId?: string;
    assignedOfficerName?: string;
    partnerIdAssigned?: string;
    outletIdsAssigned?: Record<string, string>;
    agreementReference?: string;
    activationDate?: string;
    renewalDate?: string;
    internalNotes?: string;
    decisionReason?: string;
    checklist?: Partial<VerificationChecklist>;
  },
  actor: { id?: string; name: string }
): Promise<PartnerApplicationRecord> {
  const apps = readLocalApplications();
  const index = apps.findIndex((a) => a.id === id);

  if (index === -1) {
    throw new Error(`Application with ID ${id} not found.`);
  }

  const existing = apps[index];
  const now = new Date().toISOString();

  const auditLog: PartnerAuditLog = {
    id: crypto.randomUUID(),
    applicationId: id,
    actorUserId: actor.id,
    actorName: actor.name,
    action: `ADMIN_UPDATE_${updates.status ? updates.status.toUpperCase() : "DETAILS"}`,
    previousValue: {
      status: existing.status,
      assignedOfficerName: existing.assignedOfficerName,
      partnerIdAssigned: existing.partnerIdAssigned,
    },
    newValue: updates,
    timestamp: now,
  };

  const updatedRecord: PartnerApplicationRecord = {
    ...existing,
    status: updates.status || existing.status,
    assignedOfficerId:
      updates.assignedOfficerId !== undefined
        ? updates.assignedOfficerId
        : existing.assignedOfficerId,
    assignedOfficerName:
      updates.assignedOfficerName !== undefined
        ? updates.assignedOfficerName
        : existing.assignedOfficerName,
    partnerIdAssigned:
      updates.partnerIdAssigned !== undefined
        ? updates.partnerIdAssigned
        : existing.partnerIdAssigned,
    outletIdsAssigned:
      updates.outletIdsAssigned !== undefined
        ? updates.outletIdsAssigned
        : existing.outletIdsAssigned,
    agreementReference:
      updates.agreementReference !== undefined
        ? updates.agreementReference
        : existing.agreementReference,
    activationDate:
      updates.activationDate !== undefined
        ? updates.activationDate
        : existing.activationDate,
    renewalDate:
      updates.renewalDate !== undefined
        ? updates.renewalDate
        : existing.renewalDate,
    internalNotes:
      updates.internalNotes !== undefined
        ? updates.internalNotes
        : existing.internalNotes,
    decisionReason:
      updates.decisionReason !== undefined
        ? updates.decisionReason
        : existing.decisionReason,
    checklist: updates.checklist
      ? { ...existing.checklist, ...updates.checklist }
      : existing.checklist,
    auditLogs: [auditLog, ...existing.auditLogs],
    updatedAt: now,
  };

  // If status is being set to approved and no partnerId has been assigned, auto-generate one!
  // Use Supabase as source of truth for partner ID sequencing
  if (
    updates.status === "approved" &&
    !updatedRecord.partnerIdAssigned
  ) {
    let nextSeq: number;
    if (hasSupabaseServerEnv()) {
      const supabase = getSupabaseClient();
      
      // Use Postgres sequence via RPC for atomic allocation
      const { data: rpcData, error: rpcError } = await supabase.rpc("get_next_partner_sequence");
      
      if (rpcError) {
        throw new Error(`Partner ID sequence allocation failed: ${rpcError.message}`);
      }
      
      if (rpcData === null || rpcData === undefined) {
        throw new Error("Partner ID sequence allocation failed: RPC returned no value");
      }
      
      const parsed = Number(rpcData);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error(`Partner ID sequence allocation failed: invalid sequence value ${rpcData}`);
      }
      
      nextSeq = parsed;
    } else {
      nextSeq = getNextPartnerSequence(apps);
    }
    
    const pId = generatePartnerId(nextSeq);
    updatedRecord.partnerIdAssigned = pId;

    // Also auto-generate outlet IDs for primary and additional outlets
    const outletMap: Record<string, string> = {
      primary: generateOutletId(pId, 0),
    };
    (existing.data.additionalOutlets || []).forEach((out, idx) => {
      outletMap[out.id] = generateOutletId(pId, idx + 1);
    });
    updatedRecord.outletIdsAssigned = outletMap;
  }

  // Persist to Supabase if configured
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const updatePayload: Record<string, unknown> = {
        updated_at: now,
      };
      
      if (updates.status) updatePayload.status = updates.status;
      if (updates.assignedOfficerId !== undefined) updatePayload.assigned_officer_id = updates.assignedOfficerId;
      if (updates.assignedOfficerName !== undefined) updatePayload.assigned_officer_name = updates.assignedOfficerName;
      
      // Persist generated partnerIdAssigned and outletIdsAssigned from updatedRecord when they differ from existing
      if (updatedRecord.partnerIdAssigned !== existing.partnerIdAssigned) {
        updatePayload.partner_id_assigned = updatedRecord.partnerIdAssigned;
      }
      if (updatedRecord.outletIdsAssigned !== existing.outletIdsAssigned) {
        updatePayload.outlet_ids_assigned = updatedRecord.outletIdsAssigned;
      }
      
      if (updates.agreementReference !== undefined) updatePayload.agreement_reference = updates.agreementReference;
      if (updates.activationDate !== undefined) updatePayload.activation_date = updates.activationDate;
      if (updates.renewalDate !== undefined) updatePayload.renewal_date = updates.renewalDate;
      if (updates.internalNotes !== undefined) updatePayload.internal_notes = updates.internalNotes;
      if (updates.decisionReason !== undefined) updatePayload.decision_reason = updates.decisionReason;
      if (updates.checklist) updatePayload.checklist = updatedRecord.checklist;

      const { error: sbError } = await supabase
        .from("partner_applications")
        .update(updatePayload)
        .eq("id", id);
      
      if (sbError) {
        console.error("[Storage] Supabase update error:", sbError);
        throw new Error(`Database update failed: ${sbError.message}`);
      }
    } catch (sbErr) {
      console.error("[Storage] Supabase update failed:", sbErr);
      throw sbErr;
    }
  }

  // 2. Persist to local JSON file store
  apps[index] = updatedRecord;
  writeLocalApplications(apps);

  return updatedRecord;
}
