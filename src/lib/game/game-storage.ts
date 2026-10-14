import fs from "fs";
import path from "path";
import { randomBytes, createHmac } from "crypto";
import QRCode from "qrcode";
import { SAGO_ZAMBIA_VENUES, Venue, RewardTier, ClassifiedOutcome } from "./demo-data";
export { SAGO_ZAMBIA_VENUES };
import { hasSupabaseServerEnv } from "../env";
import { getSupabaseAdmin } from "../supabase/server";

export type GameSession = {
  id: string;
  customerName: string;
  customerEmail: string;
  venueId: string;
  venue: Venue;
  marketingConsent: boolean;
  status: "ACTIVE" | "EXPIRED" | "CLOSED";
  playCount: number;
  createdAt: string;
  expiresAt: string;
  lastPlayedAt?: string;
};

export type GameCoupon = {
  code: string;
  sessionId: string;
  venueId: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueCountry: string;
  customerName: string;
  customerEmail: string;
  tier: "HIGH" | "MID+" | "MID" | "LOW+" | "LOW";
  bottleDiscount: number;
  shotDiscount: number;
  combination: [string, string, string];
  reward: string;
  status: "ISSUED" | "REDEEMED" | "EXPIRED";
  qrUrl: string;
  issuedAt: string;
  expiresAt: string;
  securitySig: string;
  notes?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "game_sessions.json");
const COUPONS_FILE = path.join(DATA_DIR, "game_coupons.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(COUPONS_FILE)) {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readLocalSessions(): GameSession[] {
  try {
    ensureDirectoryExists();
    const raw = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(raw) as GameSession[];
  } catch (err) {
    console.error("[GameStorage] Failed to read local sessions:", err);
    return [];
  }
}

function writeLocalSessions(sessions: GameSession[]) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.error("[GameStorage] Failed to write local sessions:", err);
  }
}

function readLocalCoupons(): GameCoupon[] {
  try {
    ensureDirectoryExists();
    const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
    return JSON.parse(raw) as GameCoupon[];
  } catch (err) {
    console.error("[GameStorage] Failed to read local coupons:", err);
    return [];
  }
}

function writeLocalCoupons(coupons: GameCoupon[]) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2), "utf-8");
  } catch (err) {
    console.error("[GameStorage] Failed to write local coupons:", err);
  }
}

export function findZambiaVenue(venueId?: string): Venue {
  if (venueId) {
    const found = SAGO_ZAMBIA_VENUES.find((v) => v.id === venueId);
    if (found) return found;
  }
  return SAGO_ZAMBIA_VENUES[0];
}

export async function createProductionSession(params: {
  name: string;
  email: string;
  venueId: string;
  marketingConsent?: boolean;
}): Promise<GameSession> {
  const venue = findZambiaVenue(params.venueId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hour session

  const sessionId = `SAGO-SES-ZM-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

  const session: GameSession = {
    id: sessionId,
    customerName: params.name.trim(),
    customerEmail: params.email.trim().toLowerCase(),
    venueId: venue.id,
    venue,
    marketingConsent: Boolean(params.marketingConsent),
    status: "ACTIVE",
    playCount: 0,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  // Persist locally
  const sessions = readLocalSessions();
  sessions.unshift(session);
  writeLocalSessions(sessions);

  // If Supabase server env is configured, attempt sync
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseAdmin();
      // Upsert customer
      const { data: customer } = await supabase
        .from("customers")
        .upsert(
          {
            email: session.customerEmail,
            email_normalized: session.customerEmail,
            name: session.customerName,
            country: "Zambia",
            city: venue.city,
          },
          { onConflict: "email_normalized" }
        )
        .select("id")
        .maybeSingle();

      if (customer?.id) {
        // Record consent
        await supabase.from("consents").insert({
          customer_id: customer.id,
          marketing_consent: session.marketingConsent,
          consent_timestamp: now.toISOString(),
          source: "sago-slot-machine-production",
        });
      }
    } catch (err) {
      console.warn("[GameStorage] Supabase sync skipped/deferred:", err);
    }
  }

  return session;
}

export function getProductionSession(sessionId: string): GameSession | null {
  const sessions = readLocalSessions();
  return sessions.find((s) => s.id === sessionId) ?? null;
}

export async function recordProductionSpinAndCoupon(params: {
  sessionId: string;
  outcome: ClassifiedOutcome;
  venueId?: string;
}): Promise<GameCoupon> {
  const { sessionId, outcome } = params;
  const sessions = readLocalSessions();
  let session = sessions.find((s) => s.id === sessionId);

  // If not found (e.g. freshly verified client), auto-provision with default Zambian venue
  if (!session) {
    const venue = findZambiaVenue(params.venueId);
    session = {
      id: sessionId,
      customerName: "SAGO Player",
      customerEmail: "guest@drinksago.com",
      venueId: venue.id,
      venue,
      marketingConsent: true,
      status: "ACTIVE",
      playCount: 1,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      lastPlayedAt: new Date().toISOString(),
    };
    sessions.unshift(session);
  } else {
    session.playCount += 1;
    session.lastPlayedAt = new Date().toISOString();
  }
  writeLocalSessions(sessions);

  const venue = session.venue || findZambiaVenue(session.venueId);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days valid in Zambia

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const code = `SAGO-ZM-${part(4)}-${part(4)}`;

  const securitySecret = process.env.COUPON_HMAC_SECRET || "sago-zambia-secret-2026";
  const signaturePayload = `${code}|${venue.id}|${outcome.tierInfo.tier}|${session.customerEmail}|${now.toISOString()}`;
  const securitySig = createHmac("sha256", securitySecret)
    .update(signaturePayload)
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();

  const rewardLabel =
    outcome.tierInfo.tier === "HIGH"
      ? `PREMIUM JACKPOT · ${outcome.tierInfo.bottleDiscount}% OFF BOTTLE / ${outcome.tierInfo.shotDiscount}% OFF POUR`
      : `${outcome.tierInfo.rewardReveal.toUpperCase()} · ${outcome.tierInfo.bottleDiscount}% OFF BOTTLE / ${outcome.tierInfo.shotDiscount}% OFF POUR`;

  const qrData = JSON.stringify({
    voucher: code,
    venue: venue.name,
    city: venue.city,
    country: "Zambia",
    address: venue.address || `${venue.name}, ${venue.city}`,
    tier: outcome.tierInfo.tier,
    bottle_discount: `${outcome.tierInfo.bottleDiscount}%`,
    shot_discount: `${outcome.tierInfo.shotDiscount}%`,
    player: session.customerName,
    combination: outcome.combo.join(" · "),
    sig: securitySig,
    valid_until: expiresAt.toLocaleDateString("en-ZM", { year: "numeric", month: "short", day: "numeric" }),
  });

  const qrUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 260,
    color: {
      dark: "#0a0602",
      light: "#f9f5eb",
    },
  });

  const coupon: GameCoupon = {
    code,
    sessionId: session.id,
    venueId: venue.id,
    venueName: venue.name,
    venueAddress: venue.address || `${venue.name}, ${venue.city}`,
    venueCity: venue.city,
    venueCountry: "Zambia",
    customerName: session.customerName,
    customerEmail: session.customerEmail,
    tier: outcome.tierInfo.tier,
    bottleDiscount: outcome.tierInfo.bottleDiscount,
    shotDiscount: outcome.tierInfo.shotDiscount,
    combination: outcome.combo,
    reward: rewardLabel,
    status: "ISSUED",
    qrUrl,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    securitySig,
    notes: outcome.tierInfo.notes,
  };

  const coupons = readLocalCoupons();
  coupons.unshift(coupon);
  writeLocalCoupons(coupons);

  return coupon;
}
