import { createHash, randomBytes, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { drawOutcomeFromHierarchy, SAGO_REWARD_HIERARCHY } from "@/lib/game/demo-data";
import { recordProductionSpinAndCoupon, findZambiaVenue, getProductionSession } from "@/lib/game/game-storage";

type Reward = {
  discount_value: number | null;
  eligible_product: string | null;
  id: string;
  name: string;
  probability_config: { weight?: number } | null;
  reward_type: string;
  tier?: string | null;
};

function chooseReward(rewards: Reward[]): Reward | null {
  const eligible = rewards
    .map((reward) => {
      const rawWeight = reward.probability_config?.weight;
      const weight = typeof rawWeight === "number" ? rawWeight : Number(rawWeight);
      return { reward, weight };
    })
    .filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0);

  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((total, entry) => total + entry.weight, 0);
  if (totalWeight <= 0 || !Number.isFinite(totalWeight)) return null;

  let cursor = (randomInt(1_000_000) / 1_000_000) * totalWeight;
  for (const entry of eligible) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.reward;
  }
  return eligible[eligible.length - 1].reward;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      session_id?: unknown;
      venue_id?: unknown;
    };
    const sessionId = typeof body.session_id === "string" ? body.session_id.trim() : "";
    const venueId = typeof body.venue_id === "string" ? body.venue_id.trim() : undefined;

    if (!sessionId) {
      return NextResponse.json({ error: "Active session required to spin" }, { status: 400 });
    }

    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;

    // Check if Supabase campaign and database are active
    if (hasSupabaseServerEnv() && campaignSlug) {
      try {
        const supabase = getSupabaseAdmin();
        const { data: session, error: sessionError } = await supabase
          .from("game_sessions")
          .select("id, campaign_id, venue_id, status, expires_at, campaigns!inner(status, start_at, end_at, commercial_rules), venues!inner(active)")
          .eq("id", sessionId)
          .maybeSingle();

        if (session && !sessionError) {
          const campaign = Array.isArray(session.campaigns) ? session.campaigns[0] : session.campaigns;
          const venue = Array.isArray(session.venues) ? session.venues[0] : session.venues;
          const now = new Date();

          const isCampaignActive = campaign && campaign.status === "active";
          const isSessionActive = session.status === "ACTIVE";
          const isVenueActive = Boolean(venue?.active);

          if (isCampaignActive && isSessionActive && isVenueActive) {
            const [{ data: symbols }, { data: rewards }] = await Promise.all([
              supabase.from("symbols").select("name").eq("campaign_id", session.campaign_id).eq("active", true),
              supabase.from("rewards").select("id, name, reward_type, discount_value, eligible_product, probability_config, tier").eq("campaign_id", session.campaign_id).eq("active", true),
            ]);

            if (symbols && symbols.length >= 5 && rewards && rewards.length > 0) {
              const reward = chooseReward(rewards as Reward[]);
              if (reward) {
                const symbolNames = symbols.map((s: { name: string }) => s.name);
                const result = [
                  symbolNames[randomInt(symbolNames.length)],
                  symbolNames[randomInt(symbolNames.length)],
                  symbolNames[randomInt(symbolNames.length)],
                ];

                const outcome = drawOutcomeFromHierarchy();
                const coupon = await recordProductionSpinAndCoupon({
                  sessionId,
                  outcome,
                  venueId: session.venue_id,
                });

                return NextResponse.json({
                  result_1: result[0],
                  result_2: result[1],
                  result_3: result[2],
                  tier: coupon.tier,
                  bottle_discount: coupon.bottleDiscount,
                  shot_discount: coupon.shotDiscount,
                  coupon: {
                    code: coupon.code,
                    coupon_id: coupon.code,
                    eligible_product: "SAGO Bottles & Signature Pours",
                    expires_at: `Valid until ${new Date(coupon.expiresAt).toLocaleDateString("en-ZM", { year: "numeric", month: "short", day: "numeric" })}`,
                    qr_url: coupon.qrUrl,
                    reward: coupon.reward,
                    tier: coupon.tier,
                    bottle_discount: coupon.bottleDiscount,
                    shot_discount: coupon.shotDiscount,
                    venue_name: coupon.venueName,
                    venue_address: coupon.venueAddress,
                    venue_city: coupon.venueCity,
                  },
                  is_demo: false,
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("[SpinAPI] Supabase spin execution deferred to production local store:", err);
      }
    }

    // Production local engine execution
    // 1. Draw outcome from the certified SAGO reward hierarchy
    const outcome = drawOutcomeFromHierarchy();
    const { combo, tierInfo, patternClass } = outcome;

    // 2. Fetch session details if available, and record spin + issue cryptographically signed coupon
    const existingSession = getProductionSession(sessionId);
    const resolvedVenueId = existingSession?.venueId || venueId;

    const coupon = await recordProductionSpinAndCoupon({
      sessionId,
      outcome,
      venueId: resolvedVenueId,
    });

    return NextResponse.json({
      result_1: combo[0],
      result_2: combo[1],
      result_3: combo[2],
      tier: tierInfo.tier,
      bottle_discount: tierInfo.bottleDiscount,
      shot_discount: tierInfo.shotDiscount,
      pattern_class: patternClass,
      coupon: {
        code: coupon.code,
        coupon_id: coupon.code,
        eligible_product: "SAGO Bottles & Signature Pours",
        expires_at: `Valid for 30 days at ${coupon.venueName}, ${coupon.venueCity}`,
        qr_url: coupon.qrUrl,
        reward: coupon.reward,
        tier: coupon.tier,
        bottle_discount: coupon.bottleDiscount,
        shot_discount: coupon.shotDiscount,
        venue_name: coupon.venueName,
        venue_address: coupon.venueAddress,
        venue_city: coupon.venueCity,
        notes: tierInfo.notes,
      },
      is_demo: false,
    });
  } catch (error) {
    console.error("[SpinAPI] Spin error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected spin error" },
      { status: 500 }
    );
  }
}
