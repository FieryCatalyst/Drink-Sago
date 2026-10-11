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

export function generateOutletId(partnerId: string, outletIndex: number): string {
  const pad = String(outletIndex + 1).padStart(2, "0");
  return `${partnerId}-OUT-${pad}`;
}

const DEFAULT_CHECKLIST: VerificationChecklist = {
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

export async function saveApplication(
  formData: PartnerFormData,
  isDraft: boolean = false,
  existingReference?: string
): Promise<{ record: PartnerApplicationRecord; reference: string }> {
  const now = new Date().toISOString();
  const apps = readLocalApplications();

  let existingIndex = -1;
  if (existingReference) {
    existingIndex = apps.findIndex((a) => a.applicationReference === existingReference);
  }

  const reference =
    existingIndex >= 0
      ? apps[existingIndex].applicationReference
      : generateApplicationReference();

  const id =
    existingIndex >= 0 ? apps[existingIndex].id : crypto.randomUUID();

  const status: PartnerApplicationStatus = isDraft
    ? "draft"
    : "pending_review";

  const initialAuditLog: PartnerAuditLog = {
    id: crypto.randomUUID(),
    applicationId: id,
    actorName: formData.signatoryFullName || "Applicant",
    action: isDraft ? "DRAFT_SAVED" : "APPLICATION_SUBMITTED",
    newValue: { status, tradingName: formData.tradingName },
    timestamp: now,
  };

  const newRecord: PartnerApplicationRecord = {
    id,
    applicationReference: reference,
    status,
    submittedAt: now,
    createdAt: existingIndex >= 0 ? apps[existingIndex].createdAt : now,
    updatedAt: now,
    data: formData,
    checklist: existingIndex >= 0 ? apps[existingIndex].checklist : { ...DEFAULT_CHECKLIST },
    auditLogs:
      existingIndex >= 0
        ? [initialAuditLog, ...apps[existingIndex].auditLogs]
        : [initialAuditLog],
    assignedOfficerId: existingIndex >= 0 ? apps[existingIndex].assignedOfficerId : undefined,
    assignedOfficerName: existingIndex >= 0 ? apps[existingIndex].assignedOfficerName : undefined,
    partnerIdAssigned: existingIndex >= 0 ? apps[existingIndex].partnerIdAssigned : undefined,
    outletIdsAssigned: existingIndex >= 0 ? apps[existingIndex].outletIdsAssigned : undefined,
    agreementReference: existingIndex >= 0 ? apps[existingIndex].agreementReference : undefined,
    activationDate: existingIndex >= 0 ? apps[existingIndex].activationDate : undefined,
    renewalDate: existingIndex >= 0 ? apps[existingIndex].renewalDate : undefined,
    internalNotes: existingIndex >= 0 ? apps[existingIndex].internalNotes : undefined,
    decisionReason: existingIndex >= 0 ? apps[existingIndex].decisionReason : undefined,
  };

  // 1. Try Supabase if configured
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from("partner_applications").upsert({
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
      });
    } catch (sbErr) {
      console.warn("[Storage] Supabase insert warning, persisting to local storage:", sbErr);
    }
  }

  // 2. Persist to local JSON file store
  if (existingIndex >= 0) {
    apps[existingIndex] = newRecord;
  } else {
    apps.unshift(newRecord);
  }
  writeLocalApplications(apps);

  return { record: newRecord, reference };
}

export async function getApplicationByReference(
  reference: string
): Promise<PartnerApplicationRecord | null> {
  const apps = readLocalApplications();
  const found = apps.find(
    (a) => a.applicationReference.toUpperCase() === reference.trim().toUpperCase()
  );
  return found || null;
}

export async function getApplicationById(
  id: string
): Promise<PartnerApplicationRecord | null> {
  const apps = readLocalApplications();
  const found = apps.find((a) => a.id === id);
  return found || null;
}

export async function getAllApplications(
  statusFilter?: string,
  searchQuery?: string
): Promise<PartnerApplicationRecord[]> {
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
  if (
    updates.status === "approved" &&
    !updatedRecord.partnerIdAssigned
  ) {
    const totalApproved = apps.filter((a) => a.partnerIdAssigned).length + 1;
    const pId = generatePartnerId(totalApproved);
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

  apps[index] = updatedRecord;
  writeLocalApplications(apps);

  return updatedRecord;
}
