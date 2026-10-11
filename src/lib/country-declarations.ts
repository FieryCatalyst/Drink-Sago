export interface CountryDeclarationConfig {
  country: string;
  demonym: string;
  dataProtectionTitle: string;
  dataProtectionSubtitle: string;
  actName: string;
  regulatoryAuthority: string;
  registryAuthority: string;
  liquorAuthority: string;
  privacyConsentStatement: string;
  declarations: string[];
}

export const COUNTRY_DATA_PROTECTION_MAP: Record<
  string,
  {
    demonym: string;
    actName: string;
    regulatoryAuthority: string;
    registryAuthority: string;
    liquorAuthority: string;
  }
> = {
  Kenya: {
    demonym: "Kenyan",
    actName: "Kenya Data Protection Act, 2019",
    regulatoryAuthority: "Office of the Data Protection Commissioner (ODPC)",
    registryAuthority: "Business Registration Service (BRS) & KRA",
    liquorAuthority: "Sub-County Alcoholic Drinks Regulation Committee & County Government",
  },
  "South Africa": {
    demonym: "South African",
    actName: "Protection of Personal Information Act, 2013 (POPIA, Act 4 of 2013)",
    regulatoryAuthority: "Information Regulator of South Africa",
    registryAuthority: "Companies and Intellectual Property Commission (CIPC) & SARS",
    liquorAuthority: "Provincial Liquor Board & Local Municipal Council",
  },
  Nigeria: {
    demonym: "Nigerian",
    actName: "Nigeria Data Protection Act, 2023 (NDPA)",
    regulatoryAuthority: "Nigeria Data Protection Commission (NDPC)",
    registryAuthority: "Corporate Affairs Commission (CAC) & FIRS",
    liquorAuthority: "State Liquor Licensing Board & Local Government Council",
  },
  Zambia: {
    demonym: "Zambian",
    actName: "Data Protection Act No. 3 of 2021",
    regulatoryAuthority: "Office of the Data Protection Commissioner (ODPC Zambia)",
    registryAuthority: "Patents and Companies Registration Agency (PACRA) & ZRA",
    liquorAuthority: "Local City/Municipal Council & Provincial Liquor Licensing Board",
  },
  Ghana: {
    demonym: "Ghanaian",
    actName: "Data Protection Act, 2012 (Act 843)",
    regulatoryAuthority: "Data Protection Commission (DPC Ghana)",
    registryAuthority: "Registrar General's Department (RGD) & GRA",
    liquorAuthority: "Metropolitan/Municipal/District Assembly (MMDA) Licensing Committee",
  },
  Uganda: {
    demonym: "Ugandan",
    actName: "Data Protection and Privacy Act, 2019",
    regulatoryAuthority: "Personal Data Protection Office (PDPO Uganda)",
    registryAuthority: "Uganda Registration Services Bureau (URSB) & URA",
    liquorAuthority: "Local City/Town Council & KCCA Commercial Department",
  },
  Tanzania: {
    demonym: "Tanzanian",
    actName: "Personal Data Protection Act, 2022 (PDPA)",
    regulatoryAuthority: "Personal Data Protection Commission (PDPC Tanzania)",
    registryAuthority: "Business Registrations and Licensing Agency (BRELA) & TRA",
    liquorAuthority: "Municipal Trade Office & Regional Liquor Licensing Board",
  },
  Rwanda: {
    demonym: "Rwandan",
    actName: "Law No. 058/2021 on Personal Data Protection and Privacy",
    regulatoryAuthority: "National Cyber Security Authority (NCSA Rwanda)",
    registryAuthority: "Rwanda Development Board (RDB) & RRA",
    liquorAuthority: "District Administration & Rwanda National Police Clearance",
  },
  Zimbabwe: {
    demonym: "Zimbabwean",
    actName: "Cyber and Data Protection Act, 2021 [Chapter 12:07]",
    regulatoryAuthority: "Postal and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ)",
    registryAuthority: "Companies and Intellectual Property Office & ZIMRA",
    liquorAuthority: "Liquor Licensing Board of Zimbabwe & Local Municipality",
  },
  Botswana: {
    demonym: "Batswana",
    actName: "Data Protection Act, 2018 (Act No. 32 of 2018)",
    regulatoryAuthority: "Information and Data Protection Commission (IDPC)",
    registryAuthority: "Companies and Intellectual Property Authority (CIPA) & BURS",
    liquorAuthority: "Local District Liquor Licensing Authority",
  },
  Egypt: {
    demonym: "Egyptian",
    actName: "Personal Data Protection Law No. 151 of 2020",
    regulatoryAuthority: "Personal Data Protection Center (Egypt)",
    registryAuthority: "General Authority for Investment and Free Zones (GAFI) & ETA",
    liquorAuthority: "Ministry of Tourism and Antiquities Licensing Directorate",
  },
  Mauritius: {
    demonym: "Mauritian",
    actName: "Data Protection Act 2017 (Act No. 20 of 2017)",
    regulatoryAuthority: "Data Protection Office (DPO Mauritius)",
    registryAuthority: "Corporate and Business Registration Department (CBRD) & MRA",
    liquorAuthority: "Mauritius Revenue Authority (MRA) Liquor Licensing Directorate",
  },
  Morocco: {
    demonym: "Moroccan",
    actName: "Law No. 09-08 on Protection of Personal Data",
    regulatoryAuthority: "Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP)",
    registryAuthority: "Moroccan Office of Industrial and Commercial Property (OMPIC) & DGI",
    liquorAuthority: "Wilaya / Provincial Licensing Authority",
  },
  "Ivory Coast": {
    demonym: "Ivorian",
    actName: "Law No. 2013-450 on the Protection of Personal Data",
    regulatoryAuthority: "Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire (ARTCI)",
    registryAuthority: "Centre de Promotion des Investissements en Côte d'Ivoire (CEPICI) & DGI",
    liquorAuthority: "Ministère du Commerce et de l'Industrie",
  },
  Senegal: {
    demonym: "Senegalese",
    actName: "Law No. 2008-12 on the Protection of Personal Data",
    regulatoryAuthority: "Commission de Protection des Données Personnelles (CDP Senegal)",
    registryAuthority: "Registre du Commerce et du Crédit Mobilier (RCCM) & DGID",
    liquorAuthority: "Gouvernance Régionale & Direction du Commerce Intérieur",
  },
  Cameroon: {
    demonym: "Cameroonian",
    actName: "Law No. 2010/012 on Cybersecurity and Electronic Privacy Regulations",
    regulatoryAuthority: "National Agency for Information and Communication Technologies (ANTIC)",
    registryAuthority: "Greffe du Tribunal de Première Instance & DGI",
    liquorAuthority: "Délégation Régionale du Commerce et de la Préfecture",
  },
  Ethiopia: {
    demonym: "Ethiopian",
    actName: "Personal Data Protection Standards & Proclamation No. 1110/2019",
    regulatoryAuthority: "Information Network Security Administration (INSA Ethiopia)",
    registryAuthority: "Ministry of Trade and Regional Integration (MoTRI) & ERCA",
    liquorAuthority: "Addis Ababa City Administration / Regional Trade Bureaus",
  },
  Angola: {
    demonym: "Angolan",
    actName: "Data Protection Law (Law No. 22/11)",
    regulatoryAuthority: "Agência de Proteção de Dados (APD Angola)",
    registryAuthority: "Guiché Único da Empresa & AGT",
    liquorAuthority: "Governo Provincial & Ministério do Comércio",
  },
  Mozambique: {
    demonym: "Mozambican",
    actName: "Electronic Transactions and Data Protection Law No. 3/2017",
    regulatoryAuthority: "National Data Governance Authority (Mozambique)",
    registryAuthority: "Conservatória do Registo Comercial & Autoridade Tributária (AT)",
    liquorAuthority: "Conselho Municipal & Direcção Provincial da Indústria e Comércio",
  },
  Namibia: {
    demonym: "Namibian",
    actName: "Namibian Data Governance Framework and Electronic Communications Standards",
    regulatoryAuthority: "Communications Regulatory Authority of Namibia (CRAN)",
    registryAuthority: "Business and Intellectual Property Authority (BIPA) & NamRA",
    liquorAuthority: "Regional Liquor Licensing Committee & Ministry of Industrialisation and Trade",
  },
  Tunisia: {
    demonym: "Tunisian",
    actName: "Organic Law No. 2004-63 on the Protection of Personal Data",
    regulatoryAuthority: "Instance Nationale de Protection des Données Personnelles (INPDP)",
    registryAuthority: "Registre National des Entreprises (RNE)",
    liquorAuthority: "Ministère des Finances & Ministère du Tourisme",
  },
  Algeria: {
    demonym: "Algerian",
    actName: "Law No. 18-07 on the Protection of Individuals in Personal Data Processing",
    regulatoryAuthority: "Autorité Nationale de Protection des Données à Caractère Personnel (ANPDP)",
    registryAuthority: "Centre National du Registre du Commerce (CNRC) & DGI",
    liquorAuthority: "Direction du Commerce de la Wilaya",
  },
  Benin: {
    demonym: "Beninese",
    actName: "Digital Code of Benin (Law No. 2017-20 Book V)",
    regulatoryAuthority: "Autorité de Protection des Données Personnelles (APDP Bénin)",
    registryAuthority: "Agence Nationale de Promotion des Investissements (APIEx)",
    liquorAuthority: "Direction Départementale du Commerce et de l'Industrie",
  },
  "Burkina Faso": {
    demonym: "Burkinabé",
    actName: "Law No. 001-2021/AN on Personal Data Protection",
    regulatoryAuthority: "Commission de l'Informatique et des Libertés (CIL Burkina Faso)",
    registryAuthority: "Maison de l'Entreprise du Burkina Faso (MEBF)",
    liquorAuthority: "Ministère du Développement Industriel et du Commerce",
  },
  Gabon: {
    demonym: "Gabonese",
    actName: "Law No. 001/2011 on the Protection of Personal Data",
    regulatoryAuthority: "Commission Nationale de Protection des Données à Caractère Personnel (CNPDCP)",
    registryAuthority: "Agence Nationale de Promotion des Investissements (ANPI-Gabon)",
    liquorAuthority: "Direction Générale du Commerce",
  },
  Mali: {
    demonym: "Malian",
    actName: "Law No. 2013-015 on the Protection of Personal Data",
    regulatoryAuthority: "Autorité de Protection des Données à Caractère Personnel (APDP Mali)",
    registryAuthority: "Agence pour la Promotion des Investissements (API-Mali)",
    liquorAuthority: "Direction Nationale du Commerce et de la Concurrence",
  },
  Niger: {
    demonym: "Nigerien",
    actName: "Law No. 2017-28 on the Protection of Personal Data",
    regulatoryAuthority: "Haute Autorité de Protection des Données à Caractère Personnel (HAPDP)",
    registryAuthority: "Maison de l'Entreprise du Niger",
    liquorAuthority: "Direction Générale du Commerce et de la Concurrence",
  },
  Chad: {
    demonym: "Chadian",
    actName: "Law No. 007/PR/2015 on the Protection of Personal Data",
    regulatoryAuthority: "Agence Nationale de Sécurité Informatique et de Certification Électronique (ANSICE)",
    registryAuthority: "Agence Nationale des Investissements et des Exportations (ANIE)",
    liquorAuthority: "Ministère du Commerce et de l'Industrie",
  },
  Togo: {
    demonym: "Togolese",
    actName: "Law No. 2019-014 on the Protection of Personal Data",
    regulatoryAuthority: "Instance de Protection des Données à Caractère Personnel (IPDCP Togo)",
    registryAuthority: "Centre de Formalités des Entreprises (CFE Togo)",
    liquorAuthority: "Ministère du Commerce, de l'Industrie et de la Consommation Locale",
  },
  Eswatini: {
    demonym: "EmaSwati",
    actName: "Data Protection Act, 2022",
    regulatoryAuthority: "Eswatini Communications Commission (ESCCOM)",
    registryAuthority: "Registrar of Companies & Eswatini Revenue Service (ERS)",
    liquorAuthority: "Liquor Licensing Board of Eswatini",
  },
  Lesotho: {
    demonym: "Mosotho",
    actName: "Data Protection Act, 2012",
    regulatoryAuthority: "Lesotho Communications Authority (LCA)",
    registryAuthority: "One Stop Business Facilitation Centre (OBFC) & LRA",
    liquorAuthority: "Ministry of Trade, Industry, Business Development & Tourism",
  },
  Malawi: {
    demonym: "Malawian",
    actName: "Data Protection Act, 2023",
    regulatoryAuthority: "Malawi Communications Regulatory Authority (MACRA)",
    registryAuthority: "Registrar General's Department & MRA",
    liquorAuthority: "Local District/City Council Liquor Licensing Board",
  },
  Seychelles: {
    demonym: "Seychellois",
    actName: "Data Protection Act, 2023",
    regulatoryAuthority: "Information Commission (Seychelles)",
    registryAuthority: "Registration Division & Seychelles Revenue Commission (SRC)",
    liquorAuthority: "Seychelles Licensing Authority (SLA)",
  },
  Madagascar: {
    demonym: "Malagasy",
    actName: "Law No. 2014-038 on Personal Data Protection",
    regulatoryAuthority: "Commission Nationale de l'Informatique et des Libertés (CNIL Madagascar)",
    registryAuthority: "Economic Development Board of Madagascar (EDBM)",
    liquorAuthority: "Direction Générale des Impôts & Préfecture",
  },
  "Congo (Kinshasa)": {
    demonym: "Congolese (DRC)",
    actName: "Law No. 20/017 on Telecommunications and ICT Personal Data Standards",
    regulatoryAuthority: "Autorité de Régulation de la Poste et des Télécommunications du Congo (ARPTC)",
    registryAuthority: "Guichet Unique de Création d'Entreprise (GUCE) & DGI",
    liquorAuthority: "Division Urbaine du Commerce et de l'Économie",
  },
  "Congo (Brazzaville)": {
    demonym: "Congolese",
    actName: "Law No. 29-2019 on the Protection of Personal Data",
    regulatoryAuthority: "Agence de Régulation des Postes et des Communications Électroniques (ARPCE)",
    registryAuthority: "Agence Congolaise pour la Création des Entreprises (ACPE)",
    liquorAuthority: "Direction Générale du Commerce Intérieur",
  },
};

/**
 * Returns country-tailored legal declarations, statutory data privacy act names,
 * and regulatory authority references for any selected African nation.
 */
export function getCountryDeclarationConfig(countryName: string = "Kenya"): CountryDeclarationConfig {
  const normCountry = countryName?.trim() || "Kenya";
  const mapped = COUNTRY_DATA_PROTECTION_MAP[normCountry];

  const demonym = mapped?.demonym || `${normCountry}`;
  const actName = mapped?.actName || `${normCountry} Data Protection Regulations & SAGO Continental Standards`;
  const regulatoryAuthority = mapped?.regulatoryAuthority || `National Data Protection Authority of ${normCountry}`;
  const registryAuthority = mapped?.registryAuthority || `National Corporate Registry & Revenue Authority of ${normCountry}`;
  const liquorAuthority = mapped?.liquorAuthority || `Competent Municipal & Statutory Alcohol Licensing Authority of ${normCountry}`;

  const dataProtectionTitle = `${demonym} Data Protection Compliance & Privacy Notice`;
  const dataProtectionSubtitle = `In compliance with the ${actName} and SAGO's Pan-African data governance standards.`;
  const privacyConsentStatement = `I have read and agree to the SAGO Privacy Policy. I consent to SAGO processing submitted commercial records, director identity details, and venue data in accordance with the ${actName} and relevant commercial statutes of ${normCountry}.`;

  const declarations = [
    `The information provided in this application is accurate, true, and complete to the best of my knowledge under the legal standards of ${normCountry}.`,
    `All submitted business documents and operating records (${registryAuthority}) are genuine, valid, and legally unexpired.`,
    `The business holds all valid statutory liquor dispensing licences and trade permits issued by ${liquorAuthority}.`,
    `I am duly authorized by the applicant business entity in ${normCountry} to submit this application and enter into negotiations on its behalf.`,
    `The business agrees to abide by all approved SAGO promotional standards, anti-tampering rules, and dynamic slot machine coupon-redemption protocols.`,
    `The business undertakes to promptly notify SAGO in writing of any material changes to its registration, municipal licensing, ownership, premises address, or designated officers.`,
    `I acknowledge that application submission does not guarantee partnership approval or commercial promotional activation in ${normCountry}.`,
    `SAGO reserves the right to conduct independent verification with ${registryAuthority} and ${regulatoryAuthority}, request supplemental documentation, and suspend partner access if statutory verification fails.`,
  ];

  return {
    country: normCountry,
    demonym,
    dataProtectionTitle,
    dataProtectionSubtitle,
    actName,
    regulatoryAuthority,
    registryAuthority,
    liquorAuthority,
    privacyConsentStatement,
    declarations,
  };
}
