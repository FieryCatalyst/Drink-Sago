import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { DEMO_VENUES } from "@/lib/game/demo-data";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      email?: unknown;
      marketing_consent?: unknown;
      name?: unknown;
      source?: unknown;
      venue_id?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const venueId = typeof body.venue_id === "string" ? body.venue_id.trim() : "";

    const selectedVenue =
      DEMO_VENUES.find((v) => v.id === venueId) ??
      DEMO_VENUES[0];

    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;
    if (!campaignSlug || !hasSupabaseServerEnv()) {
      return NextResponse.json({
        session_id: `demo-session-${Date.now()}`,
        venue: selectedVenue,
        is_demo: true,
      });
    }

    try {
      const supabase = getSupabaseAdmin();
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("slug", campaignSlug)
        .eq("status", "active")
        .maybeSingle();

      if (campaignError || !campaign) {
        return NextResponse.json({
          session_id: `demo-session-${Date.now()}`,
          venue: selectedVenue,
          is_demo: true,
        });
      }

      const { data: venue, error: venueError } = await supabase
        .from("campaign_venues")
        .select("venue_id, venues!inner(id, name, city, country)")
        .eq("campaign_id", campaign.id)
        .eq("venue_id", venueId)
        .eq("venues.active", true)
        .maybeSingle();

      if (venueError || !venue) {
        return NextResponse.json({
          session_id: `demo-session-${Date.now()}`,
          venue: selectedVenue,
          is_demo: true,
        });
      }

      const emailNormalized = email.toLowerCase();
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .upsert({ email, email_normalized: emailNormalized, name }, { onConflict: "email_normalized" })
        .select("id")
        .single();

      if (customerError) throw customerError;

      const consent = Boolean(body.marketing_consent);
      await supabase.from("consents").insert({
        campaign_id: campaign.id,
        consent_timestamp: consent ? new Date().toISOString() : null,
        customer_id: customer.id,
        marketing_consent: consent,
        privacy_version: process.env.SAGO_PRIVACY_VERSION ?? null,
        source: typeof body.source === "string" ? body.source : "promotions",
        terms_version: process.env.SAGO_TERMS_VERSION ?? null,
      });

      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .insert({ campaign_id: campaign.id, customer_id: customer.id, venue_id: venueId })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      return NextResponse.json({
        session_id: session.id,
        venue: venue.venues,
        is_demo: false,
      });
    } catch (dbError) {
      console.warn("Database registration failed, falling back to demo session:", dbError);
      return NextResponse.json({
        session_id: `demo-session-${Date.now()}`,
        venue: selectedVenue,
        is_demo: true,
      });
    }
  } catch {
    return NextResponse.json({
      session_id: `demo-session-${Date.now()}`,
      venue: DEMO_VENUES[0],
      is_demo: true,
    });
  }
}