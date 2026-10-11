import { PartnerFormData, DocumentUploadRecord } from "./partner-types";
import { KENYA_COUNTIES, DOCUMENT_TYPES, REDEMPTION_RULES, DECLARATION_STATEMENTS } from "./kenya-data";
import { getCountryDeclarationConfig } from "./country-declarations";

export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;
export const URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;

export function validateStep1(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.registeredBusinessName?.trim()) {
    errors.registeredBusinessName = "Registered business name is required.";
  }

  if (!data.tradingName?.trim()) {
    errors.tradingName = "Trading / Bar name is required.";
  }

  if (!data.businessType?.trim()) {
    errors.businessType = "Please select a business type.";
  } else if (data.businessType === "Other" && !data.businessTypeOther?.trim()) {
    errors.businessTypeOther = "Please specify the business type.";
  }

  if (!data.businessRegistrationNumber?.trim()) {
    errors.businessRegistrationNumber = "Business registration / incorporation number is required.";
  }

  if (!data.businessEmail?.trim()) {
    errors.businessEmail = "Official business email is required.";
  } else if (!EMAIL_REGEX.test(data.businessEmail.trim())) {
    errors.businessEmail = "Please enter a valid email address.";
  }

  if (!data.businessPhone?.trim()) {
    errors.businessPhone = "Official business phone number is required.";
  } else if (!PHONE_REGEX.test(data.businessPhone.trim())) {
    errors.businessPhone = "Please enter a valid phone number (e.g., +254 712 345 678).";
  }

  if (data.businessWebsite?.trim() && !URL_REGEX.test(data.businessWebsite.trim())) {
    errors.businessWebsite = "Please enter a valid website URL or leave blank.";
  }

  if (!data.country?.trim()) {
    errors.country = "Country is required.";
  }

  if (!data.county?.trim()) {
    errors.county = data.country === "Kenya" ? "County is required." : "Region, State or Province is required.";
  }

  if (!data.townCity?.trim()) {
    errors.townCity = "Town or city is required.";
  }

  if (!data.streetBuilding?.trim()) {
    errors.streetBuilding = "Street or building name is required.";
  }

  if (data.googleMapsLink?.trim() && !URL_REGEX.test(data.googleMapsLink.trim())) {
    errors.googleMapsLink = "Please enter a valid Google Maps URL or leave blank.";
  }

  if (!data.numberOfOutlets || data.numberOfOutlets < 1) {
    errors.numberOfOutlets = "Operating outlets must be at least 1.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.ownerFullName?.trim()) {
    errors.ownerFullName = "Business owner legal name is required.";
  }

  if (!data.ownerPosition?.trim()) {
    errors.ownerPosition = "Owner position or designation is required.";
  }

  if (!data.ownerEmail?.trim()) {
    errors.ownerEmail = "Owner business email is required.";
  } else if (!EMAIL_REGEX.test(data.ownerEmail.trim())) {
    errors.ownerEmail = "Please enter a valid owner email.";
  }

  if (!data.ownerPhone?.trim()) {
    errors.ownerPhone = "Owner phone number is required.";
  } else if (!PHONE_REGEX.test(data.ownerPhone.trim())) {
    errors.ownerPhone = "Please enter a valid owner phone number.";
  }

  if (!data.authContactName?.trim()) {
    errors.authContactName = "Authorized contact full name is required.";
  }

  if (!data.authContactTitle?.trim()) {
    errors.authContactTitle = "Authorized contact job title is required.";
  }

  if (!data.authContactEmail?.trim()) {
    errors.authContactEmail = "Authorized contact email is required.";
  } else if (!EMAIL_REGEX.test(data.authContactEmail.trim())) {
    errors.authContactEmail = "Please enter a valid authorized contact email.";
  }

  if (!data.authContactPhone?.trim()) {
    errors.authContactPhone = "Authorized contact phone number is required.";
  } else if (!PHONE_REGEX.test(data.authContactPhone.trim())) {
    errors.authContactPhone = "Please enter a valid contact phone number.";
  }

  if (!data.authAgreementPerson?.trim()) {
    errors.authAgreementPerson = "Please provide the name of the person authorized to enter into agreements.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep3(documents: DocumentUploadRecord[] = []): StepValidationResult {
  const errors: Record<string, string> = {};

  const requiredTypes = DOCUMENT_TYPES.filter((d) => d.required).map((d) => d.type);

  for (const reqType of requiredTypes) {
    const found = documents.find((doc) => doc.documentType === reqType && doc.fileUrl);
    if (!found) {
      errors[`doc_${reqType}`] = `Required document: ${reqType} is missing.`;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep4(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.partnershipType?.trim()) {
    errors.partnershipType = "Please select a partnership type.";
  } else if (data.partnershipType === "Other" && !data.partnershipTypeOther?.trim()) {
    errors.partnershipTypeOther = "Please specify the partnership type.";
  }

  if (!data.outletsJoiningCount || data.outletsJoiningCount < 1) {
    errors.outletsJoiningCount = "Outlets joining must be at least 1.";
  }

  const selectedProducts = data.products?.filter((p) => p.selected) || [];
  if (selectedProducts.length === 0) {
    errors.products = "Please select at least one participating SAGO product.";
  } else {
    selectedProducts.forEach((p, idx) => {
      if (!p.standardPrice || p.standardPrice <= 0) {
        errors[`prod_${idx}_standardPrice`] = `${p.productName}: Standard price must be greater than zero.`;
      }
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep5(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.campaignStartDate?.trim()) {
    errors.campaignStartDate = "Campaign start date is required.";
  }

  if (!data.campaignEndDate?.trim()) {
    errors.campaignEndDate = "Campaign end date is required.";
  } else if (data.campaignStartDate && new Date(data.campaignEndDate) < new Date(data.campaignStartDate)) {
    errors.campaignEndDate = "Campaign end date must not precede the start date.";
  }

  if (data.redemptionLimit !== undefined && data.redemptionLimit < 1) {
    errors.redemptionLimit = "Redemption limit must be a positive number.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep6(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.outletDisplayName?.trim()) {
    errors.outletDisplayName = "Outlet display name is required.";
  }

  if (!data.redemptionMethod?.trim()) {
    errors.redemptionMethod = "Please select a redemption method.";
  }

  if (!data.staffAccessCount || data.staffAccessCount < 1) {
    errors.staffAccessCount = "Staff access count must be at least 1.";
  }

  const acknowledged = data.acknowledgedRedemptionRules || [];
  const allAcknowledged =
    acknowledged.length === REDEMPTION_RULES.length && acknowledged.every(Boolean);

  if (!allAcknowledged) {
    errors.acknowledgedRedemptionRules = "You must acknowledge all 8 redemption operating rules.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep7(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  // Step 7 is conditional: only required if requiresSettlement is true
  if (data.requiresSettlement) {
    if (!data.settlementBankName?.trim()) {
      errors.settlementBankName = "Bank or payment provider name is required.";
    }

    if (!data.settlementAccountName?.trim()) {
      errors.settlementAccountName = "Account holder / Beneficiary name is required.";
    }

    if (!data.settlementAccountNumber?.trim()) {
      errors.settlementAccountNumber = "Account number or Till/Paybill number is required.";
    }

    if (!data.settlementContactName?.trim()) {
      errors.settlementContactName = "Payment contact person name is required.";
    }

    if (!data.settlementContactEmail?.trim()) {
      errors.settlementContactEmail = "Payment contact email is required.";
    } else if (!EMAIL_REGEX.test(data.settlementContactEmail.trim())) {
      errors.settlementContactEmail = "Please enter a valid payment contact email.";
    }

    if (!data.settlementContactPhone?.trim()) {
      errors.settlementContactPhone = "Payment contact phone number is required.";
    } else if (!PHONE_REGEX.test(data.settlementContactPhone.trim())) {
      errors.settlementContactPhone = "Please enter a valid payment contact phone.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep8(data: Partial<PartnerFormData>): StepValidationResult {
  // Step 8 marketing permissions are boolean toggles; all have defaults
  return { isValid: true, errors: {} };
}

export function validateStep9(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  const declarations = data.declarations || [];
  const expectedCount = getCountryDeclarationConfig(data.country || "Kenya").declarations.length;
  const allDeclarations =
    declarations.length >= expectedCount && declarations.slice(0, expectedCount).every(Boolean);

  if (!allDeclarations) {
    errors.declarations = "You must explicitly confirm and accept all declarations.";
  }

  if (!data.privacyNoticeAcknowledged) {
    errors.privacyNoticeAcknowledged = "You must acknowledge and agree to the SAGO Privacy Notice.";
  }

  if (!data.signatoryFullName?.trim()) {
    errors.signatoryFullName = "Signatory full legal name is required.";
  }

  if (!data.signatoryDesignation?.trim()) {
    errors.signatoryDesignation = "Signatory official position / designation is required.";
  }

  if (!data.signatoryBusinessName?.trim()) {
    errors.signatoryBusinessName = "Signatory business name is required.";
  }

  if (!data.signatureData?.trim()) {
    errors.signatureData = "An authorized signature (drawn or typed) is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateFullApplication(data: PartnerFormData): {
  isValid: boolean;
  stepErrors: Record<number, Record<string, string>>;
} {
  const stepErrors: Record<number, Record<string, string>> = {};

  const s1 = validateStep1(data);
  if (!s1.isValid) stepErrors[1] = s1.errors;

  const s2 = validateStep2(data);
  if (!s2.isValid) stepErrors[2] = s2.errors;

  const s3 = validateStep3(data.documents);
  if (!s3.isValid) stepErrors[3] = s3.errors;

  const s4 = validateStep4(data);
  if (!s4.isValid) stepErrors[4] = s4.errors;

  const s5 = validateStep5(data);
  if (!s5.isValid) stepErrors[5] = s5.errors;

  const s6 = validateStep6(data);
  if (!s6.isValid) stepErrors[6] = s6.errors;

  const s7 = validateStep7(data);
  if (!s7.isValid) stepErrors[7] = s7.errors;

  const s8 = validateStep8(data);
  if (!s8.isValid) stepErrors[8] = s8.errors;

  const s9 = validateStep9(data);
  if (!s9.isValid) stepErrors[9] = s9.errors;

  return {
    isValid: Object.keys(stepErrors).length === 0,
    stepErrors,
  };
}

export function calculatePromotionalPrice(
  standardPrice: number,
  discountType: "Percentage" | "Fixed Amount",
  discountValue: number
): number {
  if (discountType === "Percentage") {
    const discounted = standardPrice * (1 - discountValue / 100);
    return Math.max(0, Math.round(discounted));
  } else {
    const discounted = standardPrice - discountValue;
    return Math.max(0, Math.round(discounted));
  }
}

export function getSlotRewardRange(servingType: string) {
  if (servingType === "Bottle") {
    return {
      minPercent: 5,
      maxPercent: 25,
      label: "5% – 25% Off",
      description: "Low (5%) to Jackpot (25%) on full bottles",
    };
  }
  if (servingType === "Glass") {
    return {
      minPercent: 10,
      maxPercent: 50,
      label: "10% – 50% Off",
      description: "Low (10%) to Jackpot (50%) on doubles / neat pours",
    };
  }
  return {
    minPercent: 5,
    maxPercent: 25,
    label: "5% – 25% Off",
    description: "Standard campaign voucher tier on craft serves",
  };
}
