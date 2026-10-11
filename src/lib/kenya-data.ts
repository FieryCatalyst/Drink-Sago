import { AFRICAN_COUNTRIES } from "./countries";

export { AFRICAN_COUNTRIES };

export const ALL_AFRICAN_COUNTRIES = AFRICAN_COUNTRIES;

export const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo-Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita-Taveta",
  "Tana River",
  "Tharaka-Nithi",
  "Trans-Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  Kenya: "KES",
  Zambia: "ZMW",
  "South Africa": "ZAR",
  Nigeria: "NGN",
  Ghana: "GHS",
  Tanzania: "TZS",
  Uganda: "UGX",
  Rwanda: "RWF",
  Botswana: "BWP",
  Namibia: "NAD",
  Zimbabwe: "USD",
  Mozambique: "MZN",
  Angola: "AOA",
  Egypt: "EGP",
  Morocco: "MAD",
  Ethiopia: "ETB",
  Cameroon: "XAF",
  "Ivory Coast": "XOF",
  Senegal: "XOF",
  "Congo (Kinshasa)": "USD",
  "Congo (Brazzaville)": "XAF",
  Gabon: "XAF",
  Mauritius: "MUR",
  Seychelles: "SCR",
  Malawi: "MWK",
  Burundi: "BIF",
  Eswatini: "SZL",
  Lesotho: "LSL",
};

export const AFRICAN_CURRENCIES = [
  "KES", // Kenyan Shilling
  "ZMW", // Zambian Kwacha
  "ZAR", // South African Rand
  "NGN", // Nigerian Naira
  "GHS", // Ghanaian Cedi
  "TZS", // Tanzanian Shilling
  "UGX", // Ugandan Shilling
  "RWF", // Rwandan Franc
  "BWP", // Botswana Pula
  "NAD", // Namibian Dollar
  "EGP", // Egyptian Pound
  "MAD", // Moroccan Dirham
  "ETB", // Ethiopian Birr
  "XOF", // West African CFA Franc
  "XAF", // Central African CFA Franc
  "MZN", // Mozambican Metical
  "USD", // US Dollar
  "EUR", // Euro
  "GBP", // British Pound
] as const;

export const BUSINESS_TYPES = [
  "Bar / Pub",
  "Restaurant with Bar",
  "Hotel / Resort",
  "Liquor Store / Retail Outlet",
  "Nightclub / Lounge",
  "Supermarket",
  "Other",
] as const;

export const OWNERSHIP_STRUCTURES = [
  "Individually Owned",
  "Partnership",
  "Registered Company",
  "Other",
] as const;

export const PARTNERSHIP_TYPES = [
  "Promotional Discount Partner",
  "Bottle Sales Partner",
  "Drinks / By-the-Glass Partner",
  "Multiple-Outlet Partner",
  "Other",
] as const;

export const REDEMPTION_METHODS = [
  "QR Code Scanning Using a Camera",
  "Manual Coupon-Code Entry",
  "Both Methods",
] as const;

export const SETTLEMENT_ARRANGEMENTS = [
  "No Payment or Reimbursement Required",
  "Commission-Based Arrangement",
  "Discount Reimbursement Arrangement",
  "Other Agreed Settlement Arrangement",
] as const;

export const PAN_AFRICAN_BANKS = [
  // Pan-African banking groups
  "Standard Bank / Stanbic Bank",
  "Absa Bank Group",
  "Ecobank Transnational",
  "United Bank for Africa (UBA)",
  "Access Bank",
  "First Bank of Nigeria / FBNBank",
  "Zenith Bank",
  "Equity Bank Group",
  "KCB Bank Group",
  "Nedbank Group",
  "First National Bank (FNB)",
  "Standard Chartered Bank",
  "Bank of Africa (BOA)",
  "Attijariwafa Bank",
  "Diamond Trust Bank (DTB)",
  "I&M Bank",
  "Commercial International Bank (CIB)",
  "Co-operative Bank",
  "NCBA Group",
  "Zambia National Commercial Bank (Zanaco)",
  "Capitec Bank",
  "Investec",
  "Fidelity Bank",
  "CRDB Bank",
  "NMB Bank",
  "Stanbic IBTC Bank",
  "Guaranty Trust Bank (GTBank)",
  // Mobile Money networks
  "Safaricom M-PESA (Paybill / Till / Buy Goods)",
  "MTN Mobile Money (MoMo)",
  "Airtel Money",
  "Vodacom M-Pesa",
  "Orange Money",
  "Other Local Commercial Bank",
] as const;

export const KENYA_BANKS = PAN_AFRICAN_BANKS;

export const DOCUMENT_TYPES = [
  {
    type: "Certificate of Business Registration or Incorporation",
    required: true,
    description: "Official certificate from National Business Registrar (e.g., BRS, PACRA, CIPC, CAC, RDB, BRELA)",
  },
  {
    type: "Current Single Business Permit / Municipal Operating Licence",
    required: true,
    description: "Valid trade licence issued by the relevant City, County, or Municipal Council",
  },
  {
    type: "Valid Liquor Licence / Alcoholic Beverage Licence",
    required: true,
    description: "Statutory licence authorizing the sale and dispensing of alcoholic beverages",
  },
  {
    type: "Tax Identification Certificate / Tax PIN",
    required: true,
    description: "National Tax Identification Number (e.g., KRA PIN, ZRA TPIN, SARS Tax Number, TIN, URA PIN)",
  },
  {
    type: "Tax Compliance Certificate",
    required: false,
    description: "Current tax compliance clearance issued by national revenue authority (if required by policy)",
  },
  {
    type: "Proof of Business Premises Address",
    required: true,
    description: "Commercial lease agreement, utility bill, or title deed confirming operational premises",
  },
  {
    type: "Ownership / Director / Authorized-Signatory ID Document",
    required: true,
    description: "Valid National Identity Card or International Passport of director or authorized signatory",
  },
  {
    type: "Other Regulatory Approvals",
    required: false,
    description: "Public health certificate, fire clearance, or municipal zoning approval",
  },
] as const;

export const DEFAULT_SAGO_PRODUCTS = [
  {
    id: "sago_bottle_750",
    name: "SAGO Whisky Bottle (750ml)",
    servingType: "Bottle",
    standardPrice: 3800,
    discountType: "Percentage",
    proposedDiscount: 15,
  },
  {
    id: "sago_bottle_1000",
    name: "SAGO Whisky Bottle (1000ml)",
    servingType: "Bottle",
    standardPrice: 4800,
    discountType: "Percentage",
    proposedDiscount: 15,
  },
  {
    id: "sago_glass_double",
    name: "SAGO Whisky Double (50ml / Neat or On The Rocks)",
    servingType: "Glass",
    standardPrice: 450,
    discountType: "Fixed Amount",
    proposedDiscount: 100,
  },
  {
    id: "sago_cocktail_special",
    name: "SAGO Signature Cocktail (Highball / Sour / Toddy)",
    servingType: "Cocktail",
    standardPrice: 650,
    discountType: "Percentage",
    proposedDiscount: 20,
  },
] as const;

export const REDEMPTION_RULES = [
  "Every coupon must be verified through the official SAGO redemption system.",
  "A coupon may be redeemed only if it is valid, unexpired, unused, and eligible at that outlet.",
  "A successfully redeemed coupon must not be accepted a second time.",
  "Staff must not manually create, duplicate, alter, or approve unauthorized coupons.",
  "Partner login credentials must not be shared under any circumstances.",
  "Suspicious, expired, invalid, or previously redeemed coupons must be rejected immediately.",
  "Redemption discrepancies, suspected fraud, or technical problems must be promptly reported to SAGO.",
  "The customer's eligible purchase must satisfy the campaign terms before any discount is applied.",
] as const;

export const DECLARATION_STATEMENTS = [
  "The information provided in this application is accurate, true, and complete to the best of my knowledge.",
  "All submitted business documents and licences are genuine, valid, and legally unexpired.",
  "The business holds all valid statutory licences and regional approvals required for its operational activities.",
  "I am duly authorized to submit this application and enter into negotiations on behalf of the business.",
  "The business agrees to abide by all approved SAGO promotional standards and coupon-redemption protocols.",
  "The business undertakes to promptly notify SAGO in writing of any material changes to its registration, licensing, ownership, premises address, or designated contacts.",
  "I acknowledge that application submission does not guarantee partnership approval or promotional activation.",
  "SAGO reserves the right to conduct independent verification, request supplemental documentation, and suspend partner access if verification fails or material terms are violated.",
] as const;
