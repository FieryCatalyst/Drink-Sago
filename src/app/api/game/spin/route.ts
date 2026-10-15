import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { drawOutcomeFromHierarchy, SAGO_REWARD_HIERARCHY } from "@/lib/game/demo-data";
import { recordProductionSpinAndCoupon, findZambiaVenue, getProductionSession, getOrCreateProductionSession } from "@/lib/game/game-storage";

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
          .select("id, campaign_id, venue_id, status, expires_at, customer_id, campaigns!inner(status, start_at, end_at, commercial_rules), venues!inner(active)")
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
            const now = new Date();
            const campaignStart = campaign.start_at ? new Date(campaign.start_at) : null;
            const campaignEnd = campaign.end_at ? new Date(campaign.end_at) : null;
            const sessionExpires = session.expires_at ? new Date(session.expires_at) : null;

            if (campaignStart && now < campaignStart) {
              return NextResponse.json({ error: "Campaign has not started" }, { status: 400 });
            }
            if (campaignEnd && now > campaignEnd) {
              return NextResponse.json({ error: "Campaign has ended" }, { status: 400 });
            }
            if (sessionExpires && now > sessionExpires) {
              return NextResponse.json({ error: "Session expired" }, { status: 400 });
            }

            const [{ data: symbols }, { data: rewards }] = await Promise.all([
              supabase.from("symbols").select("name").eq("campaign_id", session.campaign_id).eq("active", true),
              supabase.from("rewards").select("id, name, reward_type, discount_value, eligible_product, probability_config, tier").eq("campaign_id", session.campaign_id).eq("active", true),
            ]);

            if (!symbols || symbols.length < 5 || !rewards || rewards.length === 0) {
              return NextResponse.json({ error: "Campaign not fully configured" }, { status: 500 });
            }

            const reward = chooseReward(rewards as Reward[]);
            if (!reward) {
              return NextResponse.json({ error: "No eligible rewards" }, { status: 500 });
            }

            const maxPlays = campaign.commercial_rules?.max_plays_per_session ?? 3;

            // Use configured or fallback HMAC secret
            const securitySecret = process.env.COUPON_HMAC_SECRET || "sago-security-hmac-secret-2026";

            const symbolNames = symbols.map((s: { name: string }) => s.name);
            const reels = [
              symbolNames[randomInt(symbolNames.length)],
              symbolNames[randomInt(symbolNames.length)],
              symbolNames[randomInt(symbolNames.length)],
            ];

            const rewardTier = (reward.tier as "HIGH" | "MID+" | "MID" | "LOW+" | "LOW") || "LOW";
            const bottleDiscount = typeof reward.discount_value === "number" ? reward.discount_value : 0;
            const shotDiscount = bottleDiscount + 5;

            // Invoke transactional database function to atomically claim play, record spin, and issue coupon
            const { data: rpcResult, error: rpcError } = await supabase.rpc("spin_and_issue_coupon", {
              p_session_id: sessionId,
              p_campaign_id: session.campaign_id,
              p_venue_id: session.venue_id,
              p_customer_id: session.customer_id,
              p_reward_id: reward.id,
              p_reels: reels,
              p_reward_tier: rewardTier,
              p_bottle_discount: bottleDiscount,
              p_shot_discount: shotDiscount,
              p_reward_name: reward.name,
              p_max_plays: maxPlays,
            });

            if (rpcError) {
              console.error("[SpinAPI] RPC spin_and_issue_coupon failed:", rpcError);
              const msg = rpcError.message || "Spin processing failed";
              if (msg.includes("play limit") || msg.includes("max_plays")) {
                return NextResponse.json({ error: "Session play limit reached" }, { status: 400 });
              }
              if (msg.includes("not found") || msg.includes("invalid session")) {
                return NextResponse.json({ error: "Session not found" }, { status: 404 });
              }
              if (msg.includes("expired")) {
                return NextResponse.json({ error: "Session expired" }, { status: 400 });
              }
              return NextResponse.json({ error: "Failed to process spin" }, { status: 500 });
            }

            if (!rpcResult) {
              return NextResponse.json({ error: "No result from spin function" }, { status: 500 });
            }

            const { spin_id: spinId, coupon_code: couponCode, coupon_qr_data: qrData, coupon_qr_url: qrUrl, coupon_expires_at: couponExpiresAt } = rpcResult;

            const { data: venueData } = await supabase
              .from("venues")
              .select("id, name, city, address")
              .eq("id", session.venue_id)
              .maybeSingle();

            const expiresAt = couponExpiresAt ? new Date(couponExpiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            return NextResponse.json({
              result_1: reels[0],
              result_2: reels[1],
              result_3: reels[2],
              tier: rewardTier,
              bottle_discount: bottleDiscount,
              shot_discount: shotDiscount,
              coupon: {
                code: couponCode,
                coupon_id: couponCode,
                eligible_product: reward.eligible_product || "SAGO Bottles & Signature Pours",
                expires_at: `Valid until ${expiresAt.toLocaleDateString("en-ZM", { year: "numeric", month: "short", day: "numeric" })}`,
                qr_url: qrUrl,
                reward: reward.name,
                tier: rewardTier,
                bottle_discount: bottleDiscount,
                shot_discount: shotDiscount,
                venue_name: venueData?.name || "SAGO Partner",
                venue_address: venueData?.address || "",
                venue_city: venueData?.city || "Zambia",
              },
              is_demo: false,
            });
          }
        }
      } catch (err) {
        console.error("[SpinAPI] Supabase spin execution failed:", err);
        // Session was found in Supabase - return 500 instead of falling through to local store
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Spin processing failed" },
          { status: 500 }
        );
      }
    }

    // Production local engine execution
    // 1. Draw outcome from the certified SAGO reward hierarchy
    const outcome = drawOutcomeFromHierarchy();
    const { combo, tierInfo, patternClass } = outcome;

    // 2. Fetch session details (or auto-recover if stale) and record spin + issue cryptographically signed coupon
    const existingSession = getOrCreateProductionSession(sessionId, venueId);
    const resolvedVenueId = existingSession.venueId || venueId;

    let coupon: Awaited<ReturnType<typeof recordProductionSpinAndCoupon>>;
    try {
      coupon = await recordProductionSpinAndCoupon({
        sessionId,
        outcome,
        venueId: resolvedVenueId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Spin processing failed";
      if (msg === "Session play limit reached") {
        return NextResponse.json(
          { error: "You have reached the maximum 3 complimentary spins for this session." },
          { status: 400 }
        );
      }
      if (msg === "Session is not active" || msg === "Session expired") {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      throw err;
    }

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
