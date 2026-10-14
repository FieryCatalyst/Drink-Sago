import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { SAGO_ZAMBIA_VENUES, findZambiaVenue, createProductionSession } from "@/lib/game/game-storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      marketing_consent?: unknown;
      name?: unknown;
      source?: unknown;
      venue_id?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const venueId = typeof body.venue_id === "string" ? body.venue_id.trim() : "";
    const consent = Boolean(body.marketing_consent);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid registration details: valid name and email required" },
        { status: 400 }
      );
    }

    const selectedVenue = findZambiaVenue(venueId);

    // If Supabase server env is configured with an active campaign
    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;
    if (hasSupabaseServerEnv() && campaignSlug) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: campaign } = await supabase
          .from("campaigns")
          .select("id")
          .eq("slug", campaignSlug)
          .eq("status", "active")
          .maybeSingle();

        if (campaign) {
          const { data: venue } = await supabase
            .from("campaign_venues")
            .select("venue_id, venues!inner(id, name, city, country, address)")
            .eq("campaign_id", campaign.id)
            .eq("venue_id", selectedVenue.id)
            .eq("venues.active", true)
            .maybeSingle();

          const emailNormalized = email.toLowerCase();
          const { data: existingCustomer } = await supabase
            .from("customers")
            .select("id")
            .eq("email_normalized", emailNormalized)
            .maybeSingle();

          let customerId = existingCustomer?.id;
          if (!customerId) {
            const { data: newCustomer } = await supabase
              .from("customers")
              .insert({
                email,
                email_normalized: emailNormalized,
                name,
                country: "Zambia",
                city: selectedVenue.city,
              })
              .select("id")
              .single();
            customerId = newCustomer?.id;
          }

          if (customerId) {
            const { error: consentError } = await supabase.from("consents").insert({
              campaign_id: campaign.id,
              consent_timestamp: consent ? new Date().toISOString() : null,
              customer_id: customerId,
              marketing_consent: consent,
              privacy_version: process.env.SAGO_PRIVACY_VERSION ?? "2026.1",
              source: typeof body.source === "string" ? body.source : "sago-slot-machine-production",
              terms_version: process.env.SAGO_TERMS_VERSION ?? "2026.1",
            });

            if (consentError) {
              console.error("[SessionAPI] Consent insert failed:", consentError);
              return NextResponse.json(
                { error: "Failed to record consent" },
                { status: 500 }
              );
            }

            const { data: session, error: sessionError } = await supabase
              .from("game_sessions")
              .insert({
                campaign_id: campaign.id,
                customer_id: customerId,
                venue_id: selectedVenue.id,
                status: "ACTIVE",
              })
              .select("id")
              .single();

            if (sessionError || !session?.id) {
              console.error("[SessionAPI] Session insert failed:", sessionError);
              return NextResponse.json(
                { error: "Failed to create session" },
                { status: 500 }
              );
            }

            return NextResponse.json({
              session_id: session.id,
              venue: venue?.venues || selectedVenue,
              customer: { name, email },
              is_demo: false,
            });
          }
        }
      } catch (dbErr) {
        console.warn("[SessionAPI] Supabase session creation error, using production local session:", dbErr);
      }
    }

    // Full production session storage (persisted in .data/game_sessions.json)
    const session = await createProductionSession({
      name,
      email,
      venueId: selectedVenue.id,
      marketingConsent: consent,
    });

    return NextResponse.json({
      session_id: session.id,
      venue: session.venue,
      customer: { name: session.customerName, email: session.customerEmail },
      status: "ACTIVE",
      is_demo: false,
    });
  } catch (err) {
    console.error("[SessionAPI] Fatal error in game session:", err);
    return NextResponse.json(
      { error: "Unable to create session" },
      { status: 500 }
    );
  }
}