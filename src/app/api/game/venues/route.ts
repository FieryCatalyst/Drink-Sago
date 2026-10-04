import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { DEMO_VENUES } from "@/lib/game/demo-data";

export async function GET() {
  try {
    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;
    if (!campaignSlug || !hasSupabaseServerEnv()) {
      return NextResponse.json({
        campaign: { id: "demo-campaign", name: "SAGO Big 5 Launch", slug: "sago-wild-card" },
        venues: DEMO_VENUES,
        is_demo: true,
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
        campaign: { id: "demo-campaign", name: "SAGO Big 5 Launch", slug: "sago-wild-card" },
        venues: DEMO_VENUES,
        is_demo: true,
      });
    }

    const { data: campaignVenues, error: venueError } = await supabase
      .from("campaign_venues")
      .select("venue_id, venues!inner(id, name, city, country)")
      .eq("campaign_id", campaign.id)
      .eq("venues.active", true)
      .order("name", { referencedTable: "venues" });

    if (venueError || !campaignVenues || campaignVenues.length === 0) {
      return NextResponse.json({
        campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug },
        venues: DEMO_VENUES,
        is_demo: true,
      });
    }

    return NextResponse.json({
      campaign: { id: campaign.id, name: campaign.name, slug: campaign.slug },
      venues: campaignVenues.map((entry) => entry.venues),
      is_demo: false,
    });
  } catch (error) {
    console.warn("Unable to load campaign venues from database, falling back to demo venues:", error);
    return NextResponse.json({
      campaign: { id: "demo-campaign", name: "SAGO Big 5 Launch", slug: "sago-wild-card" },
      venues: DEMO_VENUES,
      is_demo: true,
    });
  }
}