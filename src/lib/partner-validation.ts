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
 * Section A: Basic Business Details (Questions 1 - 12)
 */
export function validateSectionA(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  // 1. Registered business name
  if (!data.registeredBusinessName?.trim()) {
    errors.registeredBusinessName = "Registered business name is required.";
  }

  // 2. Business registration number
  if (!data.businessRegistrationNumber?.trim()) {
    errors.businessRegistrationNumber = "Business registration number is required.";
  }

  // 3. Business website URL (Optional, but validated if provided)
  if (data.businessWebsite?.trim() && !URL_REGEX.test(data.businessWebsite.trim())) {
    errors.businessWebsite = "Please enter a valid website URL (e.g., https://yourbar.co.ke).";
  }

  // 4. Official business phone number
  if (!data.businessPhone?.trim()) {
    errors.businessPhone = "Official business phone number is required.";
  } else if (!PHONE_REGEX.test(data.businessPhone.trim())) {
    errors.businessPhone = "Please enter a valid phone number (e.g., +254 712 345 678).";
  }

  // 5. Full name of business manager
  const managerName = data.managerFullName?.trim() || data.ownerFullName?.trim();
  if (!managerName) {
    errors.managerFullName = "Full name of the business manager is required.";
  }

  // 6. Phone number of business manager
  const managerPhone = data.managerPhone?.trim() || data.ownerPhone?.trim();
  if (!managerPhone) {
    errors.managerPhone = "Phone number of the business manager is required.";
  } else if (!PHONE_REGEX.test(managerPhone)) {
    errors.managerPhone = "Please enter a valid manager phone number.";
  }

  // 7. Business type
  if (!data.businessType?.trim()) {
    errors.businessType = "Please select your business type.";
  } else if (data.businessType === "Other" && !data.businessTypeOther?.trim()) {
    errors.businessTypeOther = "Please specify your business type.";
  }

  // 8. Trading name or bar name
  if (!data.tradingName?.trim()) {
    errors.tradingName = "Trading name or bar name is required.";
  }

  // 9. Date established
  if (!data.dateOfEstablishment?.trim()) {
    errors.dateOfEstablishment = "Date or year established is required.";
  }

  // 10. Business email address
  if (!data.businessEmail?.trim()) {
    errors.businessEmail = "Official business email is required.";
  } else if (!EMAIL_REGEX.test(data.businessEmail.trim())) {
    errors.businessEmail = "Please enter a valid email address.";
  }

  // 11. Number of outlets
  if (!data.numberOfOutlets || data.numberOfOutlets < 1) {
    errors.numberOfOutlets = "Please specify at least 1 outlet.";
  }

  // 12. Monthly sales volume is Optional

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Section B: Business Address (Questions 13 - 18)
 */
export function validateSectionB(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  // 13. Country
  if (!data.country?.trim()) {
    errors.country = "Country is required.";
  }

  // 14. County
  if (!data.county?.trim()) {
    errors.county = data.country === "Kenya" ? "County is required." : "Region / Province is required.";
  }

  // 15. Town or City
  if (!data.townCity?.trim()) {
    errors.townCity = "Town or city is required.";
  }

  // 16. Estate or Area
  if (!data.estateArea?.trim()) {
    errors.estateArea = "Estate or area is required.";
  }

  // 17. Street Name or Building Name
  if (!data.streetBuilding?.trim()) {
    errors.streetBuilding = "Street name or building name is required.";
  }

  // 18. Postal Address
  if (!data.postalAddress?.trim()) {
    errors.postalAddress = "Postal address is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Section C: Business Operations (Questions 19 - 23)
 */
export function validateSectionC(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  // 19. Opening hours
  if (!data.openingHours?.trim()) {
    errors.openingHours = "Opening hours are required (e.g., 12:00 PM - 02:00 AM).";
  }

  // 20. Operating days of the week
  if (!data.operatingDays || data.operatingDays.length === 0) {
    errors.operatingDays = "Please select at least one operating day.";
  }

  // 21. Category best describing outlet
  if (!data.outletCategory?.trim()) {
    errors.outletCategory = "Please select the category that best describes your outlet.";
  }

  // 22. Sells alcohol
  if (data.sellsAlcohol === undefined || data.sellsAlcohol === null) {
    errors.sellsAlcohol = "Please indicate if your business currently sells alcoholic beverages.";
  }

  // 23. Has designated bar manager
  if (data.hasBarManager === undefined || data.hasBarManager === null) {
    errors.hasBarManager = "Please indicate if your business has a designated bar manager.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Section D: Business Documents (Questions 24 - 25)
 */
export function validateSectionD(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};

  const docs = data.documents || [];
  const hasRegCert = docs.some((d) =>
    d.documentType?.toLowerCase().includes("registration") ||
    d.documentType?.toLowerCase().includes("incorporation")
  );
  const hasKraPin = docs.some((d) =>
    d.documentType?.toLowerCase().includes("kra") ||
    d.documentType?.toLowerCase().includes("pin")
  );

  // 24. Certificate of Business Registration or Incorporation
  if (!hasRegCert) {
    errors.regCertificate = "Please upload your Certificate of Business Registration or Incorporation.";
  }

  // 25. KRA PIN Certificate
  if (!hasKraPin) {
    errors.kraPinCertificate = "Please upload your KRA PIN Certificate for the business.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Legacy Step Validators (for automated test suite compatibility)
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
    errors.businessPhone = "Please enter a valid phone number.";
  }
  if (!data.country?.trim()) {
    errors.country = "Country is required.";
  }
  if (!data.county?.trim()) {
    errors.county = data.country === "Kenya" || !data.country ? "County is required." : "Region, State or Province is required.";
  }
  if (!data.townCity?.trim()) {
    errors.townCity = "Town or city is required.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};
  const name = data.ownerFullName?.trim() || data.managerFullName?.trim() || data.authContactName?.trim();
  if (!name) {
    errors.ownerFullName = "Contact person / Owner full name is required.";
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep3(data: Partial<PartnerFormData>): StepValidationResult {
  return validateSectionC(data);
}

export function validateStep4(data: Partial<PartnerFormData>): StepValidationResult {
  return validateSectionD(data);
}

export function validateStep5(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};
  if (data.campaignStartDate && data.campaignEndDate) {
    if (new Date(data.campaignEndDate) < new Date(data.campaignStartDate)) {
      errors.campaignEndDate = "Campaign end date must not precede start date.";
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep6(data: Partial<PartnerFormData>): StepValidationResult {
  const errors: Record<string, string> = {};
  if (data.acknowledgedRedemptionRules) {
    const hasUnchecked = data.acknowledgedRedemptionRules.some((r) => !r);
    if (hasUnchecked) {
      errors.acknowledgedRedemptionRules = "All rules must be acknowledged.";
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function validateStep7(data: Partial<PartnerFormData>): StepValidationResult {
  return { isValid: true, errors: {} };
}

export function validateStep8(_data: Partial<PartnerFormData>): StepValidationResult {
  return { isValid: true, errors: {} };
}

export function validateStep9(data: Partial<PartnerFormData>): StepValidationResult {
  return { isValid: true, errors: {} };
}

export function validateDocumentsOptional(_documents: DocumentUploadRecord[] = []): StepValidationResult {
  return { isValid: true, errors: {} };
}

/**
 * Full Application Validation (Sections A, B, C, D)
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
