import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { SAGO_ZAMBIA_VENUES } from "@/lib/game/demo-data";

export async function GET() {
  try {
    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;
    if (!campaignSlug || !hasSupabaseServerEnv()) {
      return NextResponse.json({
        campaign: {
          id: "sago-wild-card-zambia",
          name: "SAGO Big 5 Zambia Tour",
          slug: "sago-wild-card",
        },
        venues: SAGO_ZAMBIA_VENUES,
        is_demo: false,
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, name, slug")
      .eq("slug", campaignSlug)
      .eq("status", "active")
      .maybeSingle();

    if (campaignError || !campaign) {
      return NextResponse.json({
        campaign: {
          id: "sago-wild-card-zambia",
          name: "SAGO Big 5 Zambia Tour",
          slug: "sago-wild-card",
        },
        venues: SAGO_ZAMBIA_VENUES,
        is_demo: false,
      });
    }

    const { data: campaignVenues, error: venueError } = await supabase
      .from("campaign_venues")
      .select("venue_id, venues!inner(id, name, city, country, address)")
      .eq("campaign_id", campaign.id)
      .eq("venues.active", true)
      .order("name", { referencedTable: "venues" });

    if (venueError || !campaignVenues || campaignVenues.length === 0) {
      return NextResponse.json({
        campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug },
        venues: SAGO_ZAMBIA_VENUES,
        is_demo: false,
      });
    }

    return NextResponse.json({
      campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug },
      venues: campaignVenues.map((entry) => entry.venues),
      is_demo: false,
    });
  } catch (error) {
    console.warn("Unable to load campaign venues from database, falling back to Zambian partners:", error);
    return NextResponse.json({
      campaign: {
        id: "sago-wild-card-zambia",
        name: "SAGO Big 5 Zambia Tour",
        slug: "sago-wild-card",
      },
      venues: SAGO_ZAMBIA_VENUES,
      is_demo: false,
    });
  }
}