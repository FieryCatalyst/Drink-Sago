import { NextResponse } from "next/server";
import { PartnerFormData } from "@/lib/partner-types";
import { validateFullApplication } from "@/lib/partner-validation";
import { saveApplication } from "@/lib/partner-storage";

export const dynamic = "force-dynamic";

function normalizeString(value: unknown, defaultValue = ""): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return defaultValue;
}

function normalizeDataShape(data: unknown): PartnerFormData {
  if (!data || typeof data !== "object") {
    throw new Error("Application data must be an object.");
  }

  const d = data as Record<string, unknown>;

  return {
    // Step 1
    registeredBusinessName: normalizeString(d.registeredBusinessName),
    tradingName: normalizeString(d.tradingName),
    businessType: normalizeString(d.businessType),
    businessTypeOther: normalizeString(d.businessTypeOther),
    businessRegistrationNumber: normalizeString(d.businessRegistrationNumber),
    dateOfEstablishment: normalizeString(d.dateOfEstablishment),
    businessWebsite: normalizeString(d.businessWebsite),
    businessEmail: normalizeString(d.businessEmail),
    businessPhone: normalizeString(d.businessPhone),
    country: normalizeString(d.country),
    county: normalizeString(d.county),
    townCity: normalizeString(d.townCity),
    estateArea: normalizeString(d.estateArea),
    streetBuilding: normalizeString(d.streetBuilding),
    postalAddress: normalizeString(d.postalAddress),
    gpsCoordinates: normalizeString(d.gpsCoordinates),
    googleMapsLink: normalizeString(d.googleMapsLink),
    numberOfOutlets: typeof d.numberOfOutlets === "number" && d.numberOfOutlets > 0 ? d.numberOfOutlets : 1,
    dailyCustomerFootfall: normalizeString(d.dailyCustomerFootfall),
    operatingDays: Array.isArray(d.operatingDays) ? d.operatingDays.filter((x): x is string => typeof x === "string") : ["Thursday", "Friday", "Saturday", "Sunday"],
    openingHours: normalizeString(d.openingHours, "12:00 PM - 02:00 AM"),
    monthlySalesVolume: normalizeString(d.monthlySalesVolume),
    sellsAlcohol: typeof d.sellsAlcohol === "boolean" ? d.sellsAlcohol : true,
    hasBarManager: typeof d.hasBarManager === "boolean" ? d.hasBarManager : true,
    managerFullName: normalizeString(d.managerFullName || d.ownerFullName),
    managerPhone: normalizeString(d.managerPhone || d.ownerPhone),
    outletCategory: normalizeString(d.outletCategory),
    additionalOutlets: Array.isArray(d.additionalOutlets) ? d.additionalOutlets : [],

    // Step 2
    ownerFullName: normalizeString(d.managerFullName || d.ownerFullName),
    ownerPosition: normalizeString(d.ownerPosition, "Business Manager"),
    ownerNationality: normalizeString(d.ownerNationality),
    ownerEmail: normalizeString(d.ownerEmail || d.businessEmail),
    ownerPhone: normalizeString(d.managerPhone || d.ownerPhone || d.businessPhone),
    ownerAltPhone: normalizeString(d.ownerAltPhone),
    authContactName: normalizeString(d.authContactName),
    authContactTitle: normalizeString(d.authContactTitle),
    authContactEmail: normalizeString(d.authContactEmail),
    authContactPhone: normalizeString(d.authContactPhone),
    authContactCanSign: typeof d.authContactCanSign === "boolean" ? d.authContactCanSign : true,
    ownershipStructure: normalizeString(d.ownershipStructure, "Individually Owned"),
    directors: Array.isArray(d.directors) ? d.directors : [],
    authAgreementPerson: normalizeString(d.authAgreementPerson),

    // Step 3
    documents: Array.isArray(d.documents) ? d.documents : [],

    // Step 4
    partnershipType: normalizeString(d.partnershipType, "Promotional Discount Partner"),
    partnershipTypeOther: normalizeString(d.partnershipTypeOther),
    preferredStartDate: normalizeString(d.preferredStartDate),
    agreementDuration: normalizeString(d.agreementDuration, "12 Months (Annual Partner)"),
    outletsJoiningCount: typeof d.outletsJoiningCount === "number" && d.outletsJoiningCount > 0 ? d.outletsJoiningCount : 1,
    products: Array.isArray(d.products) ? d.products : [],

    // Step 5
    campaignDiscountType: normalizeString(d.campaignDiscountType, "Percentage") as "Percentage" | "Fixed Amount" | "Other",
    proposedDiscountRates: normalizeString(d.proposedDiscountRates, "15% - 20% on selected SAGO products"),
    minimumPurchaseReq: normalizeString(d.minimumPurchaseReq, "1 Drink or Bottle"),
    maxDiscountPerTx: normalizeString(d.maxDiscountPerTx),
    eligibleProductsTerms: normalizeString(d.eligibleProductsTerms, "All participating SAGO Whisky bottles and signature cocktails"),
    discountDaysHours: normalizeString(d.discountDaysHours, "Wednesdays to Sundays, 5:00 PM to Close"),
    campaignStartDate: normalizeString(d.campaignStartDate),
    campaignEndDate: normalizeString(d.campaignEndDate),
    redemptionLimit: typeof d.redemptionLimit === "number" && d.redemptionLimit > 0 ? d.redemptionLimit : 25,
    combinableWithOffers: typeof d.combinableWithOffers === "boolean" ? d.combinableWithOffers : false,
    campaignExclusions: normalizeString(d.campaignExclusions),

    // Step 6
    outletDisplayName: normalizeString(d.outletDisplayName),
    redemptionMethod: normalizeString(d.redemptionMethod, "Both Methods"),
    staffAccessCount: typeof d.staffAccessCount === "number" && d.staffAccessCount > 0 ? d.staffAccessCount : 2,
    designatedOutletManager: normalizeString(d.designatedOutletManager),
    staffTrainingStatus: normalizeString(d.staffTrainingStatus, "Pending"),
    hasSmartphoneTablet: typeof d.hasSmartphoneTablet === "boolean" ? d.hasSmartphoneTablet : true,
    hasReliableInternet: typeof d.hasReliableInternet === "boolean" ? d.hasReliableInternet : true,
    hasComputerDevice: typeof d.hasComputerDevice === "boolean" ? d.hasComputerDevice : true,
    preferredRedemptionDevice: normalizeString(d.preferredRedemptionDevice, "Smartphone / Tablet"),
    requiresOnboardingAssistance: typeof d.requiresOnboardingAssistance === "boolean" ? d.requiresOnboardingAssistance : true,
    acknowledgedRedemptionRules: Array.isArray(d.acknowledgedRedemptionRules) ? d.acknowledgedRedemptionRules.map(Boolean) : [],

    // Step 7
    requiresSettlement: typeof d.requiresSettlement === "boolean" ? d.requiresSettlement : false,
    settlementArrangement: normalizeString(d.settlementArrangement, "No Payment or Reimbursement Required"),
    settlementBankName: normalizeString(d.settlementBankName),
    settlementAccountName: normalizeString(d.settlementAccountName),
    settlementAccountNumber: normalizeString(d.settlementAccountNumber),
    settlementBranch: normalizeString(d.settlementBranch),
    settlementCurrency: normalizeString(d.settlementCurrency, "KES"),
    settlementAltMethod: normalizeString(d.settlementAltMethod),
    settlementContactName: normalizeString(d.settlementContactName),
    settlementContactEmail: normalizeString(d.settlementContactEmail),
    settlementContactPhone: normalizeString(d.settlementContactPhone),
    settlementAgreedTerms: normalizeString(d.settlementAgreedTerms),
    settlementFrequency: normalizeString(d.settlementFrequency, "Monthly"),
    settlementInvoiceReq: normalizeString(d.settlementInvoiceReq),

    // Step 8
    permListPartner: typeof d.permListPartner === "boolean" ? d.permListPartner : true,
    permDisplayNameAddress: typeof d.permDisplayNameAddress === "boolean" ? d.permDisplayNameAddress : true,
    permUsePhotos: typeof d.permUsePhotos === "boolean" ? d.permUsePhotos : true,
    permDisplayPromoMaterials: typeof d.permDisplayPromoMaterials === "boolean" ? d.permDisplayPromoMaterials : true,
    permSocialChannels: typeof d.permSocialChannels === "boolean" ? d.permSocialChannels : true,
    marketingSocialHandles: normalizeString(d.marketingSocialHandles),
    marketingContactPerson: normalizeString(d.marketingContactPerson),
    marketingContactEmail: normalizeString(d.marketingContactEmail),
    marketingContactPhone: normalizeString(d.marketingContactPhone),

    // Step 9
    declarations: Array.isArray(d.declarations) ? d.declarations.map(Boolean) : [],
    privacyNoticeAcknowledged: typeof d.privacyNoticeAcknowledged === "boolean" ? d.privacyNoticeAcknowledged : false,
    marketingCommsConsent: typeof d.marketingCommsConsent === "boolean" ? d.marketingCommsConsent : false,
    signatoryFullName: normalizeString(d.signatoryFullName),
    signatoryDesignation: normalizeString(d.signatoryDesignation),
    signatoryBusinessName: normalizeString(d.signatoryBusinessName),
    signatureData: normalizeString(d.signatureData),
    signatureDate: normalizeString(d.signatureDate, new Date().toISOString().split("T")[0]),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, isDraft, existingReference, ownershipToken } = body as {
      data: unknown;
      isDraft?: boolean;
      existingReference?: string;
      ownershipToken?: string;
    };

    if (!data) {
      return NextResponse.json(
        { error: "Invalid request payload. Application data is required." },
        { status: 400 }
      );
    }

    // Normalize and validate basic shape
    let normalizedData: PartnerFormData;
    try {
      normalizedData = normalizeDataShape(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid data format.";
      return NextResponse.json(
        { error: msg },
        { status: 400 }
      );
    }

    // Server-side validation for final submissions
    if (!isDraft) {
      const validation = validateFullApplication(normalizedData);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error:
              "Application validation failed. Please check the indicated sections.",
            stepErrors: validation.stepErrors,
          },
          { status: 422 }
        );
      }
    }

    // Persist application
    const result = await saveApplication(normalizedData, Boolean(isDraft), existingReference, ownershipToken);

    return NextResponse.json({
      success: true,
      reference: result.reference,
      recordId: result.record.id,
      status: result.record.status,
      submittedAt: result.record.submittedAt,
      isDraft: Boolean(isDraft),
      message: isDraft
        ? "Draft application saved successfully."
        : "Partner application submitted successfully for SAGO review.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed.";
    console.error("[Partner Register API] Error:", msg);
    
    // Map specific errors to appropriate HTTP status codes
    if (msg.includes("Ownership token required") || msg.includes("Invalid ownership token")) {
      return NextResponse.json(
        { error: msg },
        { status: 403 }
      );
    }
    if (msg.includes("Cannot update application with status") || msg.includes("status-conflict")) {
      return NextResponse.json(
        { error: msg },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "An error occurred while processing your application." },
      { status: 500 }
    );
  }
}
