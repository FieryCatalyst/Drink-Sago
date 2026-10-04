import { createHash, randomBytes, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { drawOutcomeFromHierarchy, generateCouponCode, SAGO_REWARD_HIERARCHY } from "@/lib/game/demo-data";

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

function secureCode() {
  const first = randomBytes(2).toString("hex").toUpperCase();
  const second = randomBytes(2).toString("hex").toUpperCase();
  return `SAGO-${first}-${second}`;
}

async function generateDemoSpin() {
  // Uses the exact SAGO reward hierarchy spreadsheet:
  // 44.80% LOW (5% bottle / 10% shot)
  // 30.40% LOW+ (10% bottle / 15% shot)
  // 15.20% MID (15% bottle / 20% shot)
  // 8.00% MID+ (20% bottle / 25% shot)
  // 1.60% HIGH (25% bottle / 50% shot)
  const outcome = drawOutcomeFromHierarchy();
  const { combo, tierInfo, patternClass } = outcome;
  const code = generateCouponCode();

  const rewardLabel =
    tierInfo.tier === "HIGH"
      ? `PREMIUM JACKPOT · ${tierInfo.bottleDiscount}% OFF BOTTLE / ${tierInfo.shotDiscount}% OFF POUR`
      : `${tierInfo.rewardReveal.toUpperCase()} · ${tierInfo.bottleDiscount}% OFF BOTTLE / ${tierInfo.shotDiscount}% OFF POUR`;

  const qrUrl = await QRCode.toDataURL(
    JSON.stringify({
      token: code,
      tier: tierInfo.tier,
      bottle_discount: `${tierInfo.bottleDiscount}%`,
      shot_discount: `${tierInfo.shotDiscount}%`,
      combination: combo.join("-"),
    }),
    {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: {
        dark: "#0b0b0b",
        light: "#f5f1e8",
      },
    }
  );

  return {
    result_1: combo[0],
    result_2: combo[1],
    result_3: combo[2],
    tier: tierInfo.tier,
    bottle_discount: tierInfo.bottleDiscount,
    shot_discount: tierInfo.shotDiscount,
    pattern_class: patternClass,
    coupon: {
      code,
      coupon_id: `sago-cpn-${Date.now()}`,
      eligible_product: "SAGO Bottles & Signature Pours",
      expires_at: "Valid for 24 hours at selected venue",
      qr_url: qrUrl,
      reward: rewardLabel,
      tier: tierInfo.tier,
      bottle_discount: tierInfo.bottleDiscount,
      shot_discount: tierInfo.shotDiscount,
      notes: tierInfo.notes,
    },
    is_demo: true,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { session_id?: unknown };
    const campaignSlug = process.env.SAGO_CAMPAIGN_SLUG;
    const isDemoSessionId = typeof body.session_id === "string" && body.session_id.startsWith("demo-session-");

    if (!hasSupabaseServerEnv() || !campaignSlug || isDemoSessionId) {
      const demoResult = await generateDemoSpin();
      return NextResponse.json(demoResult);
    }

    if (!body.session_id || typeof body.session_id !== "string") {
      return NextResponse.json({ error: "Missing or invalid session_id" }, { status: 400 });
    }

    try {
      const supabase = getSupabaseAdmin();
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("id, campaign_id, venue_id, status, expires_at, campaigns!inner(status, start_at, end_at, commercial_rules), venues!inner(active)")
        .eq("id", body.session_id)
        .maybeSingle();

      if (sessionError || !session) {
        if (!campaignSlug || isDemoSessionId) {
          const demoResult = await generateDemoSpin();
          return NextResponse.json(demoResult);
        }
        return NextResponse.json(
          { error: sessionError?.message || "Session not found" },
          { status: 404 }
        );
      }

      const campaign = Array.isArray(session.campaigns) ? session.campaigns[0] : session.campaigns;
      const venue = Array.isArray(session.venues) ? session.venues[0] : session.venues;
      const now = new Date();

      const isCampaignActive = campaign && campaign.status === "active";
      const isWithinCampaignDates =
        (!campaign?.start_at || new Date(campaign.start_at) <= now) &&
        (!campaign?.end_at || new Date(campaign.end_at) >= now);
      const isSessionUnexpired = !session.expires_at || new Date(session.expires_at) >= now;
      const isSessionActive = session.status === "ACTIVE";
      const isVenueActive = Boolean(venue?.active);

      if (!isCampaignActive || !isWithinCampaignDates || !isSessionActive || !isSessionUnexpired || !isVenueActive) {
        return NextResponse.json(
          { error: "Session or campaign is not active, outside scheduled dates, or expired" },
          { status: 400 }
        );
      }

      const [{ data: symbols, error: symbolsError }, { data: rewards, error: rewardsError }] = await Promise.all([
        supabase.from("symbols").select("name").eq("campaign_id", session.campaign_id).eq("active", true),
        supabase.from("rewards").select("id, name, reward_type, discount_value, eligible_product, probability_config, tier").eq("campaign_id", session.campaign_id).eq("active", true),
      ]);

      if (symbolsError || !symbols || symbols.length < 5) {
        return NextResponse.json(
          { error: symbolsError?.message || "Active symbols not configured (minimum 5 required)" },
          { status: 500 }
        );
      }

      if (rewardsError || !rewards || rewards.length === 0) {
        return NextResponse.json(
          { error: rewardsError?.message || "Active rewards not configured" },
          { status: 500 }
        );
      }

      const reward = chooseReward(rewards as Reward[]);
      if (!reward) {
        return NextResponse.json(
          { error: "No eligible rewards available for selection" },
          { status: 500 }
        );
      }

      const symbolNames = symbols.map((symbol: { name: string }) => symbol.name);
      const result = [
        symbolNames[randomInt(symbolNames.length)],
        symbolNames[randomInt(symbolNames.length)],
        symbolNames[randomInt(symbolNames.length)],
      ];
      const code = secureCode();
      const codeHash = createHash("sha256").update(code).digest("hex");
      const validityHours = Number(campaign.commercial_rules?.coupon_validity_period_hours);
      const expiresAt = Number.isFinite(validityHours) && validityHours > 0
        ? new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString()
        : null;

      const { data: issued, error: issueError } = await supabase.rpc("issue_game_play", {
        p_discount_value: reward.discount_value,
        p_eligible_product: reward.eligible_product,
        p_expires_at: expiresAt,
        p_result_1: result[0],
        p_result_2: result[1],
        p_result_3: result[2],
        p_reward_id: reward.id,
        p_reward_type: reward.reward_type,
        p_secure_code_hash: codeHash,
        p_session_id: body.session_id,
      });

      if (issueError || !issued?.[0]) {
        return NextResponse.json(
          { error: issueError?.message || "Failed to issue game play" },
          { status: 500 }
        );
      }

      const qrUrl = await QRCode.toDataURL(JSON.stringify({ token: code }), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
      });

      // Map tier, bottle_discount, and shot_discount according to SAGO Reward Hierarchy
      const rawTier = (reward.tier ?? "").trim().toUpperCase();
      const matchedTier = SAGO_REWARD_HIERARCHY.find(
        (t) =>
          t.tier === rawTier ||
          t.bottleDiscount === Number(reward.discount_value) ||
          reward.name.toUpperCase().includes(t.tier)
      );

      const tier = (matchedTier?.tier ?? (rawTier as "HIGH" | "MID+" | "MID" | "LOW+" | "LOW")) || "LOW";
      const bottleDiscount =
        reward.discount_value != null && Number.isFinite(Number(reward.discount_value))
          ? Number(reward.discount_value)
          : (matchedTier?.bottleDiscount ?? 5);
      const shotDiscount =
        matchedTier?.shotDiscount ??
        (bottleDiscount >= 25 ? 50 : bottleDiscount >= 20 ? 25 : bottleDiscount >= 15 ? 20 : bottleDiscount >= 10 ? 15 : 10);

      return NextResponse.json({
        result_1: result[0],
        result_2: result[1],
        result_3: result[2],
        tier,
        bottle_discount: bottleDiscount,
        shot_discount: shotDiscount,
        is_demo: false,
        coupon: {
          code,
          coupon_id: issued[0].coupon_id,
          eligible_product: reward.eligible_product,
          expires_at: issued[0].expires_at,
          qr_url: qrUrl,
          reward: reward.name,
          tier,
          bottle_discount: bottleDiscount,
          shot_discount: shotDiscount,
        },
      });
    } catch (dbErr) {
      console.error("Database spin error:", dbErr);
      return NextResponse.json(
        { error: dbErr instanceof Error ? dbErr.message : "Database spin error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Spin error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected spin error" },
      { status: 500 }
    );
  }
}
