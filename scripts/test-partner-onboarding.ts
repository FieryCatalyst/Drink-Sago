import {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  validateStep9,
  validateFullApplication,
  calculatePromotionalPrice,
} from "../src/lib/partner-validation";

import {
  generateApplicationReference,
  generatePartnerId,
  generateOutletId,
  saveApplication,
  getApplicationByReference,
  getAllApplications,
  updateApplicationVerification,
} from "../src/lib/partner-storage";

import { PartnerFormData } from "../src/lib/partner-types";
import { REDEMPTION_RULES, DECLARATION_STATEMENTS } from "../src/lib/kenya-data";
import { getCountryDeclarationConfig } from "../src/lib/country-declarations";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runTests() {
  console.log("\n══════════════════════════════════════════════════════");
  console.log("  SAGO BUSINESS PARTNER ONBOARDING - TEST SUITE");
  console.log("══════════════════════════════════════════════════════\n");

  // ── 1. Promotional Price Calculation Tests ──
  console.log("▶ Testing Product Price Calculations...");
  // Percentage discount: 3800 standard, 15% discount -> 3230
  const promoPercent = calculatePromotionalPrice(3800, "Percentage", 15);
  assert(promoPercent === 3230, `Percentage promo price: expected 3230, got ${promoPercent}`);

  // Fixed discount: 450 standard, 100 discount -> 350
  const promoFixed = calculatePromotionalPrice(450, "Fixed Amount", 100);
  assert(promoFixed === 350, `Fixed promo price: expected 350, got ${promoFixed}`);

  // Extreme bound: discount >= standard price -> 0 min bound
  const promoCapped = calculatePromotionalPrice(500, "Fixed Amount", 600);
  assert(promoCapped === 0, `Non-negative cap promo price: expected 0, got ${promoCapped}`);

  // ── 2. Reference & ID Generation Tests ──
  console.log("\n▶ Testing Reference and ID Generators...");
  const ref = generateApplicationReference();
  assert(
    ref.startsWith("SAGO-PTR-") && ref.length >= 18,
    `Valid reference generated: ${ref}`
  );

  const partnerId = generatePartnerId(42);
  assert(partnerId === "SAGO-PRT-0042", `Partner ID format: expected SAGO-PRT-0042, got ${partnerId}`);

  const outletId = generateOutletId(partnerId, 1);
  assert(outletId === "SAGO-PRT-0042-OUT-02", `Outlet ID format: expected SAGO-PRT-0042-OUT-02, got ${outletId}`);

  // ── 3. Step Validation Tests ──
  console.log("\n▶ Testing Form Step Validation...");

  // Step 1: Empty should fail
  const s1Empty = validateStep1({});
  assert(!s1Empty.isValid, "Step 1 empty validation correctly fails");
  assert(Boolean(s1Empty.errors.registeredBusinessName), "Requires registered business name");
  assert(Boolean(s1Empty.errors.county), "Requires Kenyan county");

  // Step 1: Valid Kenya details
  const s1ValidKenya = validateStep1({
    registeredBusinessName: "Nairobi Lounge Ltd",
    tradingName: "The Velvet Oak",
    businessType: "Bar / Pub",
    businessRegistrationNumber: "CPR/2021/12345",
    businessEmail: "info@velvetoak.co.ke",
    businessPhone: "+254 712 345 678",
    country: "Kenya",
    county: "Nairobi",
    townCity: "Westlands",
    streetBuilding: "Woodvale Grove",
    numberOfOutlets: 1,
  });
  assert(s1ValidKenya.isValid, "Step 1 with valid Kenyan details passes validation");

  // Step 1: Valid Pan-African details (Zambia)
  const s1ValidZambia = validateStep1({
    registeredBusinessName: "Lusaka Hospitality Enterprises Ltd",
    tradingName: "The Copperbelt Bar & Grill",
    businessType: "Restaurant with Bar",
    businessRegistrationNumber: "PACRA/2023/5544",
    businessEmail: "partners@copperbelt.co.zm",
    businessPhone: "+260 977 123 456",
    country: "Zambia",
    county: "Lusaka Province",
    townCity: "Lusaka",
    streetBuilding: "Cairo Road, Commercial Plaza",
    numberOfOutlets: 1,
  });
  assert(s1ValidZambia.isValid, "Step 1 with valid Zambian details passes validation");

  // Step 1: Valid Pan-African details (South Africa)
  const s1ValidSA = validateStep1({
    registeredBusinessName: "Cape Spirits & Lounges Pty Ltd",
    tradingName: "Table Mountain Sky Bar",
    businessType: "Nightclub / Lounge",
    businessRegistrationNumber: "2021/123456/07",
    businessEmail: "info@skybar.co.za",
    businessPhone: "+27 11 234 5678",
    country: "South Africa",
    county: "Western Cape",
    townCity: "Cape Town",
    streetBuilding: "Bree Street",
    numberOfOutlets: 1,
  });
  assert(s1ValidSA.isValid, "Step 1 with valid South African details passes validation");

  // Step 2: Owner & Authorized Rep
  const s2Valid = validateStep2({
    ownerFullName: "Peter Kamau",
    ownerPosition: "Managing Director",
    ownerEmail: "peter@velvetoak.co.ke",
    ownerPhone: "+254 722 000 000",
    authContactName: "Mercy Otieno",
    authContactTitle: "Beverage Manager",
    authContactEmail: "mercy@velvetoak.co.ke",
    authContactPhone: "+254 711 000 000",
    authAgreementPerson: "Peter Kamau",
  });
  assert(s2Valid.isValid, "Step 2 valid owner and contact details pass");

  // Step 5: Campaign Dates (End date must not precede start date)
  const s5InvalidDates = validateStep5({
    campaignStartDate: "2026-12-01",
    campaignEndDate: "2026-11-01",
  });
  assert(!s5InvalidDates.isValid, "Step 5 invalid end date preceding start date caught");

  const s5ValidDates = validateStep5({
    campaignStartDate: "2026-11-01",
    campaignEndDate: "2026-12-31",
    redemptionLimit: 25,
  });
  assert(s5ValidDates.isValid, "Step 5 valid dates pass");

  // Step 6: 8 Rules Acknowledgment
  const s6IncompleteRules = validateStep6({
    outletDisplayName: "Velvet Oak",
    redemptionMethod: "Both Methods",
    staffAccessCount: 2,
    acknowledgedRedemptionRules: [true, true, true, false, true, true, true, true],
  });
  assert(!s6IncompleteRules.isValid, "Step 6 incomplete rules acknowledgment fails");

  const s6CompleteRules = validateStep6({
    outletDisplayName: "Velvet Oak",
    redemptionMethod: "Both Methods",
    staffAccessCount: 2,
    acknowledgedRedemptionRules: new Array(REDEMPTION_RULES.length).fill(true),
  });
  assert(s6CompleteRules.isValid, "Step 6 with all 8 rules acknowledged passes");

  // ── 3B. Country-Specific Declarations & Privacy Notices ──
  console.log("\n▶ Testing Country-Specific Declarations & Privacy Notices...");
  const kenyaDecl = getCountryDeclarationConfig("Kenya");
  assert(kenyaDecl.demonym === "Kenyan", "Kenya demonym is Kenyan");
  assert(kenyaDecl.actName.includes("Kenya Data Protection Act, 2019"), "Kenya references 2019 Data Protection Act");
  assert(kenyaDecl.declarations.length === 8, "Kenya has 8 official declarations");

  const saDecl = getCountryDeclarationConfig("South Africa");
  assert(saDecl.demonym === "South African", "South Africa demonym is South African");
  assert(saDecl.actName.includes("POPIA"), "South Africa references POPIA");
  assert(saDecl.regulatoryAuthority.includes("Information Regulator"), "South Africa references Information Regulator");

  const nigeriaDecl = getCountryDeclarationConfig("Nigeria");
  assert(nigeriaDecl.demonym === "Nigerian", "Nigeria demonym is Nigerian");
  assert(nigeriaDecl.actName.includes("NDPA"), "Nigeria references NDPA");

  const zambiaDecl = getCountryDeclarationConfig("Zambia");
  assert(zambiaDecl.demonym === "Zambian", "Zambia demonym is Zambian");
  assert(zambiaDecl.actName.includes("Data Protection Act No. 3 of 2021"), "Zambia references 2021 Act");

  // Step 9: Validation with country-specific declarations
  const s9ValidSA = validateStep9({
    country: "South Africa",
    declarations: new Array(8).fill(true),
    privacyNoticeAcknowledged: true,
    signatoryFullName: "Thabo Mbeki",
    signatoryDesignation: "Director",
    signatoryBusinessName: "Cape Spirits Pty Ltd",
    signatureData: "data:image/svg+xml;base64,mockSig",
  });
  assert(s9ValidSA.isValid, "Step 9 South Africa valid declaration passes");

  // ── 4. Full Application Flow & Persistence ──
  console.log("\n▶ Testing End-to-End Application Save & Status Updates...");

  const mockApp: PartnerFormData = {
    registeredBusinessName: "Mombasa Coastal Resort Ltd",
    tradingName: "SAGO Horizon Beach Lounge",
    businessType: "Hotel / Resort",
    businessTypeOther: "",
    businessRegistrationNumber: "CPR/2022/99887",
    dateOfEstablishment: "2022-03-15",
    businessWebsite: "https://www.horizonbeach.co.ke",
    businessEmail: "partners@horizonbeach.co.ke",
    businessPhone: "+254 722 111 222",
    country: "Kenya",
    county: "Mombasa",
    townCity: "Nyali",
    estateArea: "Beachfront Road",
    streetBuilding: "Horizon Suites",
    postalAddress: "P.O. Box 402 - 80100 Mombasa",
    gpsCoordinates: "-4.0435, 39.6682",
    googleMapsLink: "https://maps.app.goo.gl/horizon",
    numberOfOutlets: 2,
    dailyCustomerFootfall: "150 - 300 patrons/day",
    operatingDays: ["Thursday", "Friday", "Saturday", "Sunday"],
    openingHours: "12:00 PM - 02:00 AM",
    monthlySalesVolume: "KES 800,000 - 2,000,000",
    sellsAlcohol: true,
    hasBarManager: true,
    additionalOutlets: [
      {
        id: "outlet_2",
        outletDisplayName: "SAGO Horizon Diani",
        county: "Kwale",
        townCity: "Diani Beach",
        streetAddress: "Diani Beach Road",
        managerName: "Ali Hassan",
        managerPhone: "+254 733 999 888",
        operatingHours: "12:00 PM - 01:00 AM",
        redemptionMethod: "Both Methods",
      },
    ],
    ownerFullName: "Fatima Omar",
    ownerPosition: "Chief Executive Officer",
    ownerNationality: "Kenyan",
    ownerEmail: "fatima@horizonbeach.co.ke",
    ownerPhone: "+254 722 111 222",
    ownerAltPhone: "",
    authContactName: "Daniel Mwangi",
    authContactTitle: "General Manager",
    authContactEmail: "daniel@horizonbeach.co.ke",
    authContactPhone: "+254 711 222 333",
    authContactCanSign: true,
    ownershipStructure: "Registered Company",
    directors: [
      {
        id: "dir_1",
        fullName: "Fatima Omar",
        nationality: "Kenyan",
        idNumber: "12345678",
        ownershipPercentage: 60,
        role: "Managing Director",
      },
      {
        id: "dir_2",
        fullName: "Hassan Omar",
        nationality: "Kenyan",
        idNumber: "87654321",
        ownershipPercentage: 40,
        role: "Director",
      },
    ],
    authAgreementPerson: "Fatima Omar",
    documents: [
      {
        id: "doc_1",
        documentType: "Certificate of Business Registration or Incorporation",
        documentNumber: "CPR/2022/99887",
        issuingAuthority: "BRS",
        issueDate: "2022-03-15",
        fileName: "incorporation_cert.pdf",
        fileSize: 1024500,
        fileUrl: "/uploads/partner-docs/inc_cert.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
      {
        id: "doc_2",
        documentType: "Current County Single Business Permit",
        documentNumber: "MSA-SBP-2026",
        issuingAuthority: "Mombasa County Government",
        issueDate: "2026-01-10",
        fileName: "sbp_2026.pdf",
        fileSize: 520000,
        fileUrl: "/uploads/partner-docs/sbp_2026.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
      {
        id: "doc_3",
        documentType: "Valid County Liquor Licence / Alcoholic Beverage Licence",
        documentNumber: "LIQ-2026-90",
        issuingAuthority: "Mombasa Liquor Board",
        issueDate: "2026-01-15",
        fileName: "liquor_licence_2026.pdf",
        fileSize: 840000,
        fileUrl: "/uploads/partner-docs/liquor_2026.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
      {
        id: "doc_4",
        documentType: "KRA PIN Certificate for the Business",
        documentNumber: "P051234567Z",
        issuingAuthority: "Kenya Revenue Authority",
        issueDate: "2022-03-20",
        fileName: "kra_pin.pdf",
        fileSize: 310000,
        fileUrl: "/uploads/partner-docs/kra_pin.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
      {
        id: "doc_5",
        documentType: "Proof of Business Address",
        documentNumber: "LEASE-2022-44",
        issuingAuthority: "Commercial Lease",
        issueDate: "2022-01-01",
        fileName: "lease_agreement.pdf",
        fileSize: 1450000,
        fileUrl: "/uploads/partner-docs/lease.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
      {
        id: "doc_6",
        documentType: "Ownership / Director / Authorized-Signatory ID Document",
        documentNumber: "ID-12345678",
        issuingAuthority: "National Registration Bureau",
        issueDate: "2015-05-10",
        fileName: "director_id.pdf",
        fileSize: 670000,
        fileUrl: "/uploads/partner-docs/director_id.pdf",
        mimeType: "application/pdf",
        verificationStatus: "pending",
      },
    ],
    partnershipType: "Multiple-Outlet Partner",
    partnershipTypeOther: "",
    preferredStartDate: "2026-11-01",
    agreementDuration: "12 Months (Annual Partner)",
    outletsJoiningCount: 2,
    products: [
      {
        id: "sago_bottle_750",
        productName: "SAGO Whisky Bottle (750ml)",
        servingType: "Bottle",
        standardPrice: 4200,
        currency: "KES",
        discountType: "Percentage",
        proposedDiscount: 15,
        proposedPromotionalPrice: 3570,
        selected: true,
      },
    ],
    campaignDiscountType: "Percentage",
    proposedDiscountRates: "15% discount on bottles",
    minimumPurchaseReq: "1 Bottle",
    maxDiscountPerTx: "KES 2,000",
    eligibleProductsTerms: "SAGO Whisky Bottles (750ml)",
    discountDaysHours: "All Operating Hours",
    campaignStartDate: "2026-11-01",
    campaignEndDate: "2027-10-31",
    redemptionLimit: 50,
    combinableWithOffers: false,
    campaignExclusions: "Not valid during closed VIP private functions.",
    outletDisplayName: "SAGO Horizon Beach Lounge",
    redemptionMethod: "Both Methods",
    staffAccessCount: 4,
    designatedOutletManager: "Daniel Mwangi",
    staffTrainingStatus: "Pending",
    hasSmartphoneTablet: true,
    hasReliableInternet: true,
    hasComputerDevice: true,
    preferredRedemptionDevice: "Smartphone / Tablet",
    requiresOnboardingAssistance: true,
    acknowledgedRedemptionRules: new Array(REDEMPTION_RULES.length).fill(true),
    requiresSettlement: true,
    settlementArrangement: "Discount Reimbursement Arrangement",
    settlementBankName: "NCBA Bank Kenya",
    settlementAccountName: "Mombasa Coastal Resort Ltd",
    settlementAccountNumber: "1002003004",
    settlementBranch: "Nyali Branch",
    settlementCurrency: "KES",
    settlementAltMethod: "Till: 987654",
    settlementContactName: "Amina Yusuf",
    settlementContactEmail: "finance@horizonbeach.co.ke",
    settlementContactPhone: "+254 722 333 444",
    settlementAgreedTerms: "Monthly reconciliation and reimbursement within 7 business days",
    settlementFrequency: "Monthly",
    settlementInvoiceReq: "Monthly statement with redeemed coupon logs",
    permListPartner: true,
    permDisplayNameAddress: true,
    permUsePhotos: true,
    permDisplayPromoMaterials: true,
    permSocialChannels: true,
    marketingSocialHandles: "@horizonbeach_msa",
    marketingContactPerson: "Daniel Mwangi",
    marketingContactEmail: "marketing@horizonbeach.co.ke",
    marketingContactPhone: "+254 711 222 333",
    declarations: new Array(DECLARATION_STATEMENTS.length).fill(true),
    privacyNoticeAcknowledged: true,
    marketingCommsConsent: true,
    signatoryFullName: "Fatima Omar",
    signatoryDesignation: "Chief Executive Officer",
    signatoryBusinessName: "Mombasa Coastal Resort Ltd",
    signatureData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    signatureDate: "2026-10-11",
  };

  // 1. Submit Application
  const submitResult = await saveApplication(mockApp, false);
  assert(Boolean(submitResult.reference), `Application saved with reference: ${submitResult.reference}`);
  assert(submitResult.record.status === "pending_review", "Initial status is pending_review");
  assert(submitResult.record.auditLogs.length > 0, "Initial submission audit log created");

  // 2. Retrieve Application by Reference
  const retrieved = await getApplicationByReference(submitResult.reference);
  assert(Boolean(retrieved), "Application successfully retrieved by reference");
  assert(retrieved?.data.tradingName === "SAGO Horizon Beach Lounge", "Trading name matches exactly");

  // 3. Admin Verification Update
  const updated = await updateApplicationVerification(
    submitResult.record.id,
    {
      status: "approved",
      decisionReason: "All statutory licences verified. Commercial terms confirmed.",
      checklist: {
        business_registration_verified: true,
        business_address_verified: true,
        owner_rep_verified: true,
        licences_verified: true,
        tax_docs_reviewed: true,
        terms_reviewed: true,
        agreement_signed: true,
        final_approval_granted: true,
      },
    },
    { id: "admin@drinksago.com", name: "SAGO Verification Officer" }
  );

  assert(updated.status === "approved", "Status transitioned to approved");
  assert(Boolean(updated.partnerIdAssigned), `Server auto-generated Partner ID: ${updated.partnerIdAssigned}`);
  assert(Boolean(updated.outletIdsAssigned?.primary), `Server auto-generated primary Outlet ID: ${updated.outletIdsAssigned?.primary}`);
  assert(Boolean(updated.outletIdsAssigned?.outlet_2), `Server auto-generated branch Outlet ID: ${updated.outletIdsAssigned?.outlet_2}`);
  assert(updated.checklist.final_approval_granted === true, "Verification checklist updated");
  // Clean up mock test application so fake test entries are not left in the admin portal
  const fs = await import("fs");
  const path = await import("path");
  const dataFile = path.join(process.cwd(), ".data", "partner_applications.json");
  if (fs.existsSync(dataFile)) {
    const remaining = JSON.parse(fs.readFileSync(dataFile, "utf-8")).filter(
      (a: any) => a.id !== submitResult.record.id
    );
    fs.writeFileSync(dataFile, JSON.stringify(remaining, null, 2), "utf-8");
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS!");
  console.log("══════════════════════════════════════════════════════\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
