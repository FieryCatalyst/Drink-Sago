import { createHash, randomBytes, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";
import { drawOutcomeFromHierarchy, generateCouponCode } from "@/lib/game/demo-data";

type Reward = {
  discount_value: number | null;
  eligible_product: string | null;
  id: string;
  name: string;
  probability_config: { weight?: number } | null;
  reward_type: string;
};

function chooseReward(rewards: Reward[]): Reward {
  const weighted = rewards.map((reward) => ({
    reward,
    weight: Number(reward.probability_config?.weight ?? 1),
  }));
  const totalWeight = weighted.reduce((total, entry) => total + (entry.weight > 0 ? entry.weight : 1), 0);
  let cursor = (randomInt(1_000_000) / 1_000_000) * totalWeight;
  for (const entry of weighted) {
    cursor -= entry.weight > 0 ? entry.weight : 1;
    if (cursor <= 0) return entry.reward;
  }
  return weighted[weighted.length - 1].reward;
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

    if (!hasSupabaseServerEnv()) {
      const demoResult = await generateDemoSpin();
      return NextResponse.json(demoResult);
    }

    try {
      const supabase = getSupabaseAdmin();
      const { data: session, error: sessionError } = await supabase
        .from("game_sessions")
        .select("id, campaign_id, venue_id, status, expires_at, campaigns!inner(status, start_at, end_at, commercial_rules), venues!inner(active)")
        .eq("id", body.session_id)
        .maybeSingle();

      if (sessionError || !session) {
        const demoResult = await generateDemoSpin();
        return NextResponse.json(demoResult);
      }

      const campaign = Array.isArray(session.campaigns) ? session.campaigns[0] : session.campaigns;
      const venue = Array.isArray(session.venues) ? session.venues[0] : session.venues;
      if (session.status !== "ACTIVE" || !venue?.active || !campaign) {
        const demoResult = await generateDemoSpin();
        return NextResponse.json(demoResult);
      }

      const [{ data: symbols, error: symbolsError }, { data: rewards, error: rewardsError }] = await Promise.all([
        supabase.from("symbols").select("name").eq("campaign_id", session.campaign_id).eq("active", true),
        supabase.from("rewards").select("id, name, reward_type, discount_value, eligible_product, probability_config").eq("campaign_id", session.campaign_id).eq("active", true),
      ]);

      if (symbolsError || rewardsError || !symbols || symbols.length < 5 || !rewards || rewards.length === 0) {
        const demoResult = await generateDemoSpin();
        return NextResponse.json(demoResult);
      }

      const reward = chooseReward(rewards as Reward[]);
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
        const demoResult = await generateDemoSpin();
        return NextResponse.json(demoResult);
      }

      const qrUrl = await QRCode.toDataURL(JSON.stringify({ token: code }), {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 240,
      });

      return NextResponse.json({
        result_1: result[0],
        result_2: result[1],
        result_3: result[2],
        coupon: {
          code,
          coupon_id: issued[0].coupon_id,
          eligible_product: reward.eligible_product,
          expires_at: issued[0].expires_at,
          qr_url: qrUrl,
          reward: reward.name,
        },
      });
    } catch (dbErr) {
      console.warn("Database spin error, falling back to demo result:", dbErr);
      const demoResult = await generateDemoSpin();
      return NextResponse.json(demoResult);
    }
  } catch (error) {
    console.error("Spin error:", error);
    const demoResult = await generateDemoSpin();
    return NextResponse.json(demoResult);
  }
}
