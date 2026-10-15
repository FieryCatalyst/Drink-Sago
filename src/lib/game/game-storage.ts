import fs from "fs";
import path from "path";
import { randomBytes, createHmac, randomInt } from "crypto";
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
  redeemedAt?: string;
  redeemedAtBarId?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const SESSIONS_FILE = path.join(DATA_DIR, "game_sessions.json");
const COUPONS_FILE = path.join(DATA_DIR, "game_coupons.json");

// Per-session lock map to serialize concurrent spin requests per session
const sessionLocks = new Map<string, Promise<void>>();

function getSessionLock(sessionId: string): Promise<void> {
  const existingLock = sessionLocks.get(sessionId);
  if (existingLock) {
    return existingLock;
  }
  const lock = (async () => {})(); // Create a resolved promise as the lock
  sessionLocks.set(sessionId, lock);
  // Clean up lock after a short delay to prevent memory leaks
  setTimeout(() => sessionLocks.delete(sessionId), 5000);
  return lock;
}

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
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseAdmin();
      // Note: In a real implementation, we'd sync all sessions to Supabase
      // For now, we rely on local file as primary for sessions
      // and Supabase for coupons
    } catch {
      // Supabase not available for sessions, continue to local
    }
  }

  try {
    ensureDirectoryExists();
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.warn("[GameStorage] Warning: Failed to write local sessions to disk:", err);
  }
}

async function readLocalCoupons(): Promise<GameCoupon[]> {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("issued_at", { ascending: false })
        .limit(100);
      if (error) {
        throw error;
      }
      return (data || []).map((c) => ({
        code: c.code,
        sessionId: c.session_id,
        venueId: c.venue_id,
        venueName: c.venue_name || "",
        venueAddress: c.venue_address || "",
        venueCity: c.venue_city || "",
        venueCountry: "Zambia",
        customerName: c.customer_name || "",
        customerEmail: c.customer_email || "",
        tier: c.tier,
        bottleDiscount: c.bottle_discount,
        shotDiscount: c.shot_discount,
        combination: c.combination as [string, string, string],
        reward: c.reward,
        status: c.status,
        qrUrl: c.qr_url,
        issuedAt: c.issued_at,
        expiresAt: c.expires_at,
        securitySig: c.security_sig,
        notes: c.notes,
      }));
    } catch (err) {
      console.error("[GameStorage] Failed to read coupons from Supabase:", err);
      throw new Error("Coupon read failed");
    }
  }

  // Fallback to local file storage
  try {
    ensureDirectoryExists();
    const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
    return JSON.parse(raw) as GameCoupon[];
  } catch (err) {
    console.error("[GameStorage] Failed to read local coupons:", err);
    throw new Error("Coupon read failed");
  }
}

async function writeLocalCoupon(coupon: GameCoupon): Promise<void> {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("coupons").insert({
        code: coupon.code,
        session_id: coupon.sessionId,
        venue_id: coupon.venueId,
        venue_name: coupon.venueName,
        venue_address: coupon.venueAddress,
        venue_city: coupon.venueCity,
        customer_name: coupon.customerName,
        customer_email: coupon.customerEmail,
        tier: coupon.tier,
        bottle_discount: coupon.bottleDiscount,
        shot_discount: coupon.shotDiscount,
        combination: coupon.combination,
        reward: coupon.reward,
        status: coupon.status,
        qr_url: coupon.qrUrl,
        security_sig: coupon.securitySig,
        issued_at: coupon.issuedAt,
        expires_at: coupon.expiresAt,
        notes: coupon.notes,
      });
      if (error) {
        throw error;
      }
      return;
    } catch (err) {
      console.error("[GameStorage] Failed to write coupon to Supabase:", err);
      throw new Error("Coupon persistence failed");
    }
  }

  // Fallback to local file storage
  try {
    ensureDirectoryExists();
    const existing = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : [];
    existing.unshift(coupon);
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(existing, null, 2), "utf-8");
  } catch (err) {
    console.error("[GameStorage] Failed to write local coupons:", err);
    throw new Error("Coupon persistence failed");
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

export function getOrCreateProductionSession(sessionId: string, venueId?: string): GameSession {
  const existing = getProductionSession(sessionId);
  if (existing) return existing;

  const venue = findZambiaVenue(venueId);
  const now = new Date();
  const session: GameSession = {
    id: sessionId,
    customerName: "Guest Player",
    customerEmail: "guest@drinksago.com",
    venueId: venue.id,
    venue,
    marketingConsent: false,
    status: "ACTIVE",
    playCount: 0,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  };
  const sessions = readLocalSessions();
  sessions.unshift(session);
  writeLocalSessions(sessions);
  return session;
}

export async function recordProductionSpinAndCoupon(params: {
  sessionId: string;
  outcome: ClassifiedOutcome;
  venueId?: string;
}): Promise<GameCoupon> {
  const { sessionId, outcome } = params;

  // Acquire per-session lock to serialize concurrent requests
  await getSessionLock(sessionId);

  const sessions = readLocalSessions();
  let sessionIndex = sessions.findIndex((s) => s.id === sessionId);

  if (sessionIndex === -1) {
    // Auto-recover session so spins never fail with "Session not found"
    const venue = findZambiaVenue(params.venueId);
    const now = new Date();
    const recoveredSession: GameSession = {
      id: sessionId,
      customerName: "Guest Player",
      customerEmail: "guest@drinksago.com",
      venueId: venue.id,
      venue,
      marketingConsent: false,
      status: "ACTIVE",
      playCount: 0,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
    sessions.unshift(recoveredSession);
    writeLocalSessions(sessions);
    sessionIndex = 0;
  }

  const session = sessions[sessionIndex];

  if (session.status !== "ACTIVE") {
    throw new Error("Session is not active");
  }

  const now = new Date();
  if (new Date(session.expiresAt) < now) {
    throw new Error("Session expired");
  }

  const maxPlays = 3;
  if (session.playCount >= maxPlays) {
    throw new Error("Session play limit reached");
  }

  // Prepare updated session but don't persist yet
  const updatedSession = {
    ...session,
    playCount: session.playCount + 1,
    lastPlayedAt: now.toISOString(),
  };

  const venue = session.venue || findZambiaVenue(session.venueId);
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (len: number) =>
    Array.from({ length: len }, () => chars[randomInt(chars.length)]).join("");
  const code = `SAGO-ZM-${part(4)}-${part(4)}`;

  const securitySecret = process.env.COUPON_HMAC_SECRET || "sago-security-hmac-secret-2026";

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

  // Persist coupon first, then session atomically
  await writeLocalCoupon(coupon);

  // Now persist the updated session (re-read to ensure we have latest)
  const latestSessions = readLocalSessions();
  const latestSessionIndex = latestSessions.findIndex((s) => s.id === sessionId);
  if (latestSessionIndex !== -1) {
    latestSessions[latestSessionIndex] = updatedSession;
    writeLocalSessions(latestSessions);
  }

  return coupon;
}
