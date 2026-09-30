import { NextResponse } from "next/server";
import { getLegalDrinkingAge } from "@/lib/countries";

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
      const requiredAge = getLegalDrinkingAge(country);

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

