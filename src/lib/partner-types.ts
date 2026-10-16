export type PartnerApplicationStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "additional_info_required"
  | "approved"
  | "rejected"
  | "on_hold";

export type DocVerificationStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "rejected"
  | "expired";

export interface DirectorPartner {
  id: string;
  fullName: string;
  nationality: string;
  idNumber: string;
  ownershipPercentage: number;
  role: string;
}

export interface ParticipatingProductItem {
  id: string;
  productName: string;
  servingType: "Bottle" | "Glass" | "Cocktail" | "Other";
  standardPrice: number;
  currency: string;
  discountType?: "Percentage" | "Fixed Amount";
  proposedDiscount?: number;
  proposedPromotionalPrice?: number;
  selected: boolean;
}

export interface AdditionalOutlet {
  id: string;
  outletDisplayName: string;
  county: string;
  townCity: string;
  streetAddress: string;
  gpsCoordinates?: string;
  managerName: string;
  managerPhone: string;
  operatingHours: string;
  redemptionMethod: string;
}

export interface DocumentUploadRecord {
  id: string;
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  mimeType: string;
  storagePath?: string;
  verificationStatus: DocVerificationStatus;
  verificationNotes?: string;
}

export interface PartnerFormData {
  // Step 1: Business Information
  registeredBusinessName: string;
  tradingName: string;
  businessType: string;
  businessTypeOther: string;
  businessRegistrationNumber: string;
  dateOfEstablishment: string;
  businessWebsite: string;
  businessEmail: string;
  businessPhone: string;
  country: string;
  county: string;
  townCity: string;
  estateArea: string;
  streetBuilding: string;
  postalAddress: string;
  gpsCoordinates: string;
  googleMapsLink: string;
  numberOfOutlets: number;
  dailyCustomerFootfall: string;
  operatingDays: string[];
  openingHours: string;
  monthlySalesVolume: string;
  sellsAlcohol: boolean;
  hasBarManager: boolean;
  managerFullName?: string;
  managerPhone?: string;
  outletCategory?: string;
  additionalOutlets: AdditionalOutlet[];

  // Step 2: Owner and Authorized Representative
  ownerFullName: string;
  ownerPosition: string;
  ownerNationality: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAltPhone: string;
  authContactName: string;
  authContactTitle: string;
  authContactEmail: string;
  authContactPhone: string;
  authContactCanSign: boolean;
  ownershipStructure: string;
  directors: DirectorPartner[];
  authAgreementPerson: string;

  // Step 3: Documents
  documents: DocumentUploadRecord[];

  // Step 4: Partnership Details and Products
  partnershipType: string;
  partnershipTypeOther: string;
  preferredStartDate: string;
  agreementDuration: string;
  outletsJoiningCount: number;
  products: ParticipatingProductItem[];

  // Step 5: Campaign Terms
  campaignDiscountType: "Percentage" | "Fixed Amount" | "Other";
  proposedDiscountRates: string;
  minimumPurchaseReq: string;
  maxDiscountPerTx: string;
  eligibleProductsTerms: string;
  discountDaysHours: string;
  campaignStartDate: string;
  campaignEndDate: string;
  redemptionLimit: number;
  combinableWithOffers: boolean;
  campaignExclusions: string;

  // Step 6: Redemption Setup
  outletDisplayName: string;
  redemptionMethod: string;
  staffAccessCount: number;
  designatedOutletManager: string;
  staffTrainingStatus: string;
  hasSmartphoneTablet: boolean;
  hasReliableInternet: boolean;
  hasComputerDevice: boolean;
  preferredRedemptionDevice: string;
  requiresOnboardingAssistance: boolean;
  acknowledgedRedemptionRules: boolean[];

  // Step 7: Payment and Settlement (conditional)
  requiresSettlement: boolean;
  settlementArrangement: string;
  settlementBankName: string;
  settlementAccountName: string;
  settlementAccountNumber: string;
  settlementBranch: string;
  settlementCurrency: string;
  settlementAltMethod: string;
  settlementContactName: string;
  settlementContactEmail: string;
  settlementContactPhone: string;
  settlementAgreedTerms: string;
  settlementFrequency: string;
  settlementInvoiceReq: string;

  // Step 8: Marketing Permissions
  permListPartner: boolean;
  permDisplayNameAddress: boolean;
  permUsePhotos: boolean;
  permDisplayPromoMaterials: boolean;
  permSocialChannels: boolean;
  marketingSocialHandles: string;
  marketingContactPerson: string;
  marketingContactEmail: string;
  marketingContactPhone: string;

  // Step 9: Declarations and Signature
  declarations: boolean[];
  privacyNoticeAcknowledged: boolean;
  marketingCommsConsent: boolean;
  signatoryFullName: string;
  signatoryDesignation: string;
  signatoryBusinessName: string;
  signatureData: string; // Base64 png or typed signature
  signatureDate: string;

  // Internal: ownership token hash for draft authorization
  ownershipTokenHash?: string;
}

export interface VerificationChecklist {
  business_registration_verified: boolean;
  business_address_verified: boolean;
  owner_rep_verified: boolean;
  licences_verified: boolean;
  tax_docs_reviewed: boolean;
  terms_reviewed: boolean;
  agreement_signed: boolean;
  outlet_access_configured: boolean;
  staff_accounts_configured: boolean;
  training_completed: boolean;
  test_coupon_redeemed: boolean;
  final_approval_granted: boolean;
}

export interface PartnerAuditLog {
  id: string;
  applicationId: string;
  actorUserId?: string;
  actorName: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  timestamp: string;
}

export interface PartnerApplicationRecord {
  id: string;
  applicationReference: string;
  status: PartnerApplicationStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  data: PartnerFormData;
  // Admin fields
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  partnerIdAssigned?: string;
  outletIdsAssigned?: Record<string, string>;
  agreementReference?: string;
  activationDate?: string;
  renewalDate?: string;
  internalNotes?: string;
  decisionReason?: string;
  checklist: VerificationChecklist;
  auditLogs: PartnerAuditLog[];
}
