import { NextResponse } from "next/server";

const LEGAL_AGE_BY_COUNTRY: Record<string, number> = {
  Zambia: 18, Zimbabwe: 18, Botswana: 18, Namibia: 18, Angola: 18, Tanzania: 18, Kenya: 18, Mozambique: 18,
  "South Africa": 18, Nigeria: 18, Ghana: 18, Ethiopia: 18, Uganda: 18, "Ivory Coast": 18, Senegal: 18,
  "United Kingdom": 18, "United States": 21, Canada: 18, Australia: 18, Germany: 18, France: 18, Netherlands: 18,
  Belgium: 18, Switzerland: 18, Austria: 18, Ireland: 18, Italy: 18, Spain: 18, Portugal: 18, Sweden: 18,
  Norway: 18, Denmark: 18, Finland: 18, Poland: 18, "Czech Republic": 18, Hungary: 18, Romania: 18, Bulgaria: 18,
  Croatia: 18, Slovenia: 18, Slovakia: 18, Estonia: 18, Latvia: 18, Lithuania: 18, Greece: 18, Cyprus: 18,
  Malta: 18, Luxembourg: 18, Singapore: 18, "Hong Kong": 18, Japan: 20, "South Korea": 19, Taiwan: 18,
  Thailand: 20, Vietnam: 18, Malaysia: 18, Indonesia: 21, Philippines: 18, India: 21, China: 18, UAE: 21,
  "Saudi Arabia": 21, Qatar: 21, Bahrain: 21, Oman: 21, Kuwait: 21, Israel: 18, Turkey: 18, Brazil: 18,
  Argentina: 18, Chile: 18, Colombia: 18, Peru: 18, Mexico: 18, "New Zealand": 18, Other: 18,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || email.length > 254 || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // If full membership form is submitted, validate additional fields
    if ("firstName" in body || "lastName" in body || "birthYear" in body) {
      const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
      const birthYear = typeof body.birthYear === "string" || typeof body.birthYear === "number" ? Number(body.birthYear) : NaN;
      const country = typeof body.country === "string" && body.country ? body.country : "Other";
      const consent = Boolean(body.consent);

      if (!firstName || firstName.length > 100) {
        return NextResponse.json(
          { error: "First name is required." },
          { status: 400 }
        );
      }

      if (!lastName || lastName.length > 100) {
        return NextResponse.json(
          { error: "Last name is required." },
          { status: 400 }
        );
      }

      const currentYear = new Date().getFullYear();
      const requiredAge = LEGAL_AGE_BY_COUNTRY[country] ?? 18;

      if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
        return NextResponse.json(
          { error: "Please provide a valid 4-digit birth year." },
          { status: 400 }
        );
      }

      if (currentYear - birthYear < requiredAge) {
        return NextResponse.json(
          { error: `You must be of legal drinking age (${requiredAge}+ in ${country}) to join the SAGO Club.` },
          { status: 403 }
        );
      }

      if (!consent) {
        return NextResponse.json(
          { error: "You must accept the terms and privacy policy to join." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Welcome to the SAGO Club."
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

