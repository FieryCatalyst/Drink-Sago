import { NextResponse } from "next/server";
import { getLegalDrinkingAge } from "@/lib/countries";
import { hasSupabaseServerEnv } from "@/lib/env";
import { getSupabaseClient } from "@/lib/supabase/server";

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

    const emailNormalized = email.toLowerCase().trim();
    const isFullForm = "firstName" in body || "lastName" in body || "birthYear" in body;

    let firstName: string | null = null;
    let lastName: string | null = null;
    let birthYear: number | null = null;
    let country = "Zambia";
    let isBartender = false;
    let consent = true;

    // If full membership form is submitted, validate additional fields
    if (isFullForm) {
      firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
      lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
      const rawBirthYear =
        typeof body.birthYear === "string" || typeof body.birthYear === "number"
          ? Number(body.birthYear)
          : NaN;
      country = typeof body.country === "string" && body.country ? body.country : "Zambia";
      isBartender = Boolean(body.isBartender);
      consent = Boolean(body.consent);

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

      if (!Number.isInteger(rawBirthYear) || rawBirthYear < 1900 || rawBirthYear > currentYear) {
        return NextResponse.json(
          { error: "Please provide a valid 4-digit birth year." },
          { status: 400 }
        );
      }

      if (currentYear - rawBirthYear < requiredAge) {
        return NextResponse.json(
          {
            error: `You must be of legal drinking age (${requiredAge}+ in ${country}) to join the SAGO Club.`,
          },
          { status: 403 }
        );
      }

      if (!consent) {
        return NextResponse.json(
          { error: "You must accept the terms and privacy policy to join." },
          { status: 400 }
        );
      }

      birthYear = rawBirthYear;
    }

    if (!hasSupabaseServerEnv()) {
      return NextResponse.json(
        {
          error:
            "Supabase configuration not loaded in the running server. Please restart your dev server (stop it and run 'npm run dev') so it loads .env.local.",
        },
        { status: 500 }
      );
    }

    try {
      const supabase = getSupabaseClient();
      const memberData = {
        email,
        email_normalized: emailNormalized,
        first_name: firstName,
        last_name: lastName,
        birth_year: birthYear,
        country,
        is_bartender: isBartender,
        consent,
        source: isFullForm ? "sago_collective_page" : "club_modal",
        updated_at: new Date().toISOString(),
      };

      const { error: dbError } = await supabase
        .from("sago_collective_members")
        .insert(memberData);

      if (dbError) {
        console.error("[SAGO Collective] Database insert error:", dbError.message, dbError.details);
        if (dbError.code === "23505") {
          return NextResponse.json(
            { error: "This email is already registered." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: "Unable to process registration at this time. Please try again later." },
          { status: 500 }
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database connection failed";
      console.error("[SAGO Collective] Unexpected DB error:", msg);
      return NextResponse.json(
        { error: "Unable to complete registration. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome to the SAGO Collective.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}


