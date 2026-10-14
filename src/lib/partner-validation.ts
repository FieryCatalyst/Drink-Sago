import { PartnerFormData, DocumentUploadRecord } from "./partner-types";
import { getCountryDeclarationConfig } from "./country-declarations";

export interface StepValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;
export const URL_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;

/**
 * Step 1: Venue & Business Information
 * Only truly essential venue details are required.
 */
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

  if (!data.country?.trim()) {
    errors.country = "Country is required.";
  }

  if (!data.county?.trim()) {
    errors.county = data.country === "Kenya" ? "County is required." : "Region, State or Province is required.";
  }

  if (!data.townCity?.trim()) {
    errors.townCity = "Town or city is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Step 2: Contact & Key Representative
 * Streamlined: only requires primary contact/owner details.
 */
export function validateStep2(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  const name = data.ownerFullName?.trim() || data.authContactName?.trim();
  if (!name) {
    errors.ownerFullName = "Contact person / Owner full name is required.";
  }

  if (!data.ownerPosition?.trim() && !data.authContactTitle?.trim()) {
    errors.ownerPosition = "Position or job title is required.";
  }

  const email = data.ownerEmail?.trim() || data.authContactEmail?.trim();
  if (!email) {
    errors.ownerEmail = "Contact email is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.ownerEmail = "Please enter a valid email address.";
  }

  const phone = data.ownerPhone?.trim() || data.authContactPhone?.trim();
  if (!phone) {
    errors.ownerPhone = "Contact phone number is required.";
  } else if (!PHONE_REGEX.test(phone)) {
    errors.ownerPhone = "Please enter a valid phone number.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Step 3: Partnership Model & SAGO Products
 */
export function validateStep3(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.partnershipType?.trim()) {
    errors.partnershipType = "Please select a partnership type.";
  }

  const selectedProducts = data.products?.filter((p) => p.selected) || [];
  if (selectedProducts.length === 0) {
    errors.products = "Please select at least one participating SAGO product.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Step 4: Operations & Settlement
 * Document uploads are 100% OPTIONAL (never mandatory).
 */
export function validateStep4(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  // If requiresSettlement is true (commission or reimbursement model)
  if (data.requiresSettlement) {
    if (!data.settlementBankName?.trim()) {
      errors.settlementBankName = "Bank or payment provider name is required.";
    }
    if (!data.settlementAccountName?.trim()) {
      errors.settlementAccountName = "Account holder / Beneficiary name is required.";
    }
    if (!data.settlementAccountNumber?.trim()) {
      errors.settlementAccountNumber = "Account number or Paybill/Till number is required.";
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Step 5: Review, Declarations & Signature
 */
export function validateStep5(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  if (!data.privacyNoticeAcknowledged) {
    errors.privacyNoticeAcknowledged = "You must acknowledge and agree to the SAGO Partnership Terms.";
  }

  const signatory = data.signatoryFullName?.trim() || data.ownerFullName?.trim();
  if (!signatory) {
    errors.signatoryFullName = "Signatory full name is required.";
  }

  if (!data.signatureData?.trim()) {
    errors.signatureData = "An authorized digital signature or typed name confirmation is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep6(data: Partial<PartnerFormData>): StepValidationResult {
  return { isValid: true, errors: {} };
}

export function validateStep7(data: Partial<PartnerFormData>): StepValidationResult {
  return validateStep4(data);
}

export function validateStep8(data: Partial<PartnerFormData>): StepValidationResult {
  return { isValid: true, errors: {} };
}

export function validateStep9(data: Partial<PartnerFormData>): StepValidationResult {
  return validateStep5(data);
}

/**
 * Document uploads validation: completely optional (never fails)
 */
export function validateDocumentsOptional(_documents: DocumentUploadRecord[] = []): StepValidationResult {
  return { isValid: true, errors: {} };
}

/**
 * Full Application Validation (5-Step Form)
 */
export function validateFullApplication(data: PartnerFormData): {
  isValid: boolean;
  stepErrors: Record<number, Record<string, string>>;
} {
  const stepErrors: Record<number, Record<string, string>> = {};

  const s1 = validateStep1(data);
  if (!s1.isValid) stepErrors[1] = s1.errors;

  const s2 = validateStep2(data);
  if (!s2.isValid) stepErrors[2] = s2.errors;

  const s3 = validateStep3(data);
  if (!s3.isValid) stepErrors[3] = s3.errors;

  const s4 = validateStep4(data);
  if (!s4.isValid) stepErrors[4] = s4.errors;

  const s5 = validateStep5(data);
  if (!s5.isValid) stepErrors[5] = s5.errors;

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
