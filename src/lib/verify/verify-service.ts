import fs from "fs";
import path from "path";
import { randomBytes, createHash, scryptSync, timingSafeEqual } from "crypto";
import { GameCoupon } from "../game/game-storage";
import { hasSupabaseServerEnv } from "../env";
import { getSupabaseAdmin } from "../supabase/server";
import { createServerClient } from "@supabase/ssr";

export type BarRecord = {
  id: string;
  name: string;
  outletCode: string;
  location: string;
  address: string;
  city: string;
  country: string;
  isActive: boolean;
};

export type BarStaffRecord = {
  id: string;
  email: string;
  passwordHash: string; // SHA-256 with salt
  salt: string;
  barId: string;
  role: "bartender" | "bar_manager" | "admin";
  displayName: string;
  isActive: boolean;
};

export type RedemptionLogRecord = {
  id: string;
  couponCode: string;
  barId: string;
  barName: string;
  staffEmail: string;
  action: "verification_success" | "verification_failed" | "redeemed" | "redemption_rejected";
  result: string;
  requestId?: string;
  discountApplied?: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const BARS_FILE = path.join(DATA_DIR, "bars.json");
const STAFF_FILE = path.join(DATA_DIR, "bar_staff.json");
const LOGS_FILE = path.join(DATA_DIR, "redemption_logs.json");
const COUPONS_FILE = path.join(DATA_DIR, "game_coupons.json");

// Mutex lock map to prevent concurrent redemption of the same coupon (fallback only)
const activeRedemptionLocks = new Set<string>();

// Map local bar IDs to database UUIDs (from migration seed)
const BAR_ID_MAP: Record<string, string> = {
  "bar-zm-kitwe-social": "b0000001-0000-0000-0000-000000000001",
  "bar-zm-lusaka-munali": "b0000002-0000-0000-0000-000000000002",
  "bar-zm-kitwe-zorgis": "b0000003-0000-0000-0000-000000000003",
  "bar-zm-lusaka-sports": "b0000004-0000-0000-0000-000000000004",
};

function mapBarIdToUuid(barId: string): string {
  return BAR_ID_MAP[barId] || barId;
}

function createRpcClient(staffJwt?: string) {
  return staffJwt
    ? createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${staffJwt}`,
            },
          },
          cookies: {
            get() { return undefined; },
            set() {},
            remove() {},
          },
        }
      )
    : getSupabaseAdmin();
}

async function callVerifyCouponRpc(couponCode: string, barId: string, staffJwt?: string) {
  if (!hasSupabaseServerEnv()) {
    return null;
  }
  const dbBarId = mapBarIdToUuid(barId);
  const rpcSupabase = createRpcClient(staffJwt);

  const { data, error } = await rpcSupabase.rpc("verify_coupon_code", {
    p_coupon_code: couponCode,
    p_bar_id: dbBarId,
  });
  if (error) {
    throw error;
  }
  return data as {
    is_valid: boolean;
    error?: string;
    coupon_code?: string;
    tier?: string;
    bottle_discount?: number;
    shot_discount?: number;
    combination?: string[];
    eligible_product?: string;
    customer_name?: string;
    expires_at?: string;
    status?: string;
    redeemed_at?: string;
  };
}

async function callRedeemCouponRpc(couponCode: string, barId: string, requestId: string | null, staffJwt?: string) {
  if (!hasSupabaseServerEnv()) {
    return null;
  }
  const dbBarId = mapBarIdToUuid(barId);
  const rpcSupabase = createRpcClient(staffJwt);

  const { data, error } = await rpcSupabase.rpc("redeem_coupon_code", {
    p_coupon_code: couponCode,
    p_bar_id: dbBarId,
    p_request_id: requestId,
  });
  if (error) {
    throw error;
  }
  return data as {
    success: boolean;
    error?: string;
    confirmation_ref?: string;
    redeemed_at?: string;
    coupon_code?: string;
    tier?: string;
    bottle_discount?: number;
    shot_discount?: number;
    bar_name?: string;
    message?: string;
    idempotent_replay?: boolean;
  };
}

export const PRESEEDED_BARS: BarRecord[] = [
  {
    id: "bar-zm-kitwe-social",
    name: "Social Kitwe",
    outletCode: "ZM-KITWE-SOCIAL",
    location: "Parklands",
    address: "Shop 35, ECL Mall, Parklands, Kitwe",
    city: "Kitwe",
    country: "Zambia",
    isActive: true,
  },
  {
    id: "bar-zm-lusaka-munali",
    name: "Social Munali",
    outletCode: "ZM-LUSAKA-MUNALI",
    location: "Munali Mall",
    address: "Cnr Munali Rd & 12th St, near Munali Mall, Lusaka",
    city: "Lusaka",
    country: "Zambia",
    isActive: true,
  },
  {
    id: "bar-zm-kitwe-zorgis",
    name: "Zorgi's Pub & Grill",
    outletCode: "ZM-KITWE-ZORGIS",
    location: "Parklands",
    address: "15 Kuomboka Drive, Parklands, Kitwe",
    city: "Kitwe",
    country: "Zambia",
    isActive: true,
  },
  {
    id: "bar-zm-lusaka-sports",
    name: "Lusaka Sports Club",
    outletCode: "ZM-LUSAKA-SPORTS",
    location: "Longacres",
    address: "Plot 4978, Los Angeles Blvd, Longacres, Lusaka",
    city: "Lusaka",
    country: "Zambia",
    isActive: true,
  },
];

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString("hex");
}

export function verifyPassword(password: string, salt: string, passwordHash: string): boolean {
  // Legacy salt used for SHA-256 hashes
  const LEGACY_SALT = "sago-salt-2026";

  // Check if this is a legacy SHA-256 hash (using the old static salt)
  if (salt === LEGACY_SALT) {
    const legacyHash = createHash("sha256").update(`${password}:${salt}`).digest("hex");
    const legacyHashBuf = Buffer.from(legacyHash, "hex");
    const storedHashBuf = Buffer.from(passwordHash, "hex");
    if (legacyHashBuf.length !== storedHashBuf.length) {
      return false;
    }
    return timingSafeEqual(legacyHashBuf, storedHashBuf);
  }

  // New scrypt-based verification
  const computedHash = scryptSync(password, salt, 32).toString("hex");
  const computedHashBuf = Buffer.from(computedHash, "hex");
  const storedHashBuf = Buffer.from(passwordHash, "hex");
  if (computedHashBuf.length !== storedHashBuf.length) {
    return false;
  }
  return timingSafeEqual(computedHashBuf, storedHashBuf);
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function createPreseededStaff(): BarStaffRecord[] {
  const staffConfigs = [
    { email: "social.kitwe@drinksago.com", barId: "bar-zm-kitwe-social", name: "Social Kitwe Lead Bartender", envVar: "STAFF_PASSWORD_SOCIAL_KITWE" },
    { email: "social.munali@drinksago.com", barId: "bar-zm-lusaka-munali", name: "Social Munali Lead Bartender", envVar: "STAFF_PASSWORD_SOCIAL_MUNALI" },
    { email: "zorgis.kitwe@drinksago.com", barId: "bar-zm-kitwe-zorgis", name: "Zorgi's Head Bartender", envVar: "STAFF_PASSWORD_ZORGIS_KITWE" },
    { email: "lusaka.sports@drinksago.com", barId: "bar-zm-lusaka-sports", name: "Lusaka Sports Club Steward", envVar: "STAFF_PASSWORD_LUSAKA_SPORTS" },
  ];

  return staffConfigs.map((cfg) => {
    const salt = generateSalt();
    const password = process.env[cfg.envVar] || `SagoBar@${Date.now()}-${randomBytes(4).toString("hex")}`;
    const passwordHash = hashPassword(password, salt);
    return {
      id: `staff-${cfg.barId}`,
      email: cfg.email,
      passwordHash,
      salt,
      barId: cfg.barId,
      role: "bartender",
      displayName: cfg.name,
      isActive: true,
    };
  });
}

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BARS_FILE)) {
    fs.writeFileSync(BARS_FILE, JSON.stringify(PRESEEDED_BARS, null, 2), "utf-8");
  }
  if (!fs.existsSync(STAFF_FILE)) {
    fs.writeFileSync(STAFF_FILE, JSON.stringify(createPreseededStaff(), null, 2), "utf-8");
  }
  if (!fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getBars(): BarRecord[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(BARS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return PRESEEDED_BARS;
  }
}

export function getBarById(barId: string): BarRecord | null {
  const bars = getBars();
  const direct = bars.find((b) => b.id === barId);
  if (direct) return direct;
  for (const [localId, uuid] of Object.entries(BAR_ID_MAP)) {
    if (uuid === barId || localId === barId) {
      return bars.find((b) => b.id === localId) || null;
    }
  }
  return null;
}

export function getStaffList(): BarStaffRecord[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(STAFF_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return createPreseededStaff();
  }
}

export function getStaffByEmail(email: string): BarStaffRecord | null {
  const staff = getStaffList();
  return staff.find((s) => s.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export function getRedemptionLogs(): RedemptionLogRecord[] {
  ensureFiles();
  try {
    const raw = fs.readFileSync(LOGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function appendRedemptionLog(log: RedemptionLogRecord) {
  ensureFiles();
  const logs = getRedemptionLogs();
  logs.unshift(log);
  // Keep last 1000 logs
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs.slice(0, 1000), null, 2), "utf-8");
}

function getAllCoupons(): GameCoupon[] {
  try {
    if (!fs.existsSync(COUPONS_FILE)) return [];
    const raw = fs.readFileSync(COUPONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCoupons(coupons: GameCoupon[]) {
  try {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2), "utf-8");
  } catch (err) {
    console.warn("[VerifyService] Warning: Failed to write coupons to disk:", err);
  }
}

/**
 * Normalizes input code from QR payloads, URLs, or manual typing.
 */
export function normalizeCouponCode(input: string): string {
  if (!input) return "";
  let clean = input.trim();

  // If input is a JSON string from QR code
  if (clean.startsWith("{") && clean.endsWith("}")) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed.voucher) return String(parsed.voucher).trim().toUpperCase();
      if (parsed.token) return String(parsed.token).trim().toUpperCase();
      if (parsed.code) return String(parsed.code).trim().toUpperCase();
    } catch {
      // not JSON
    }
  }

  // If input is a URL containing ?code= or ?voucher=
  if (clean.includes("?")) {
    try {
      const url = new URL(clean, "http://localhost");
      const param = url.searchParams.get("code") || url.searchParams.get("voucher") || url.searchParams.get("token");
      if (param) return param.trim().toUpperCase();
    } catch {
      // not a valid URL
    }
  }

  // Raw alphanumeric code
  return clean.toUpperCase().replace(/\s+/g, "");
}

function maskCustomerName(name?: string): string {
  if (!name) return "SAGO Customer";
  const parts = name.trim().split(" ");
  return parts
    .map((p) => (p.length > 1 ? `${p[0]}${"*".repeat(p.length - 1)}` : p))
    .join(" ");
}

export type VerifyCouponResult = {
  isValid: boolean;
  error?: string;
  couponCode?: string;
  tier?: string;
  bottleDiscount?: number;
  shotDiscount?: number;
  combination?: string[];
  reward?: string;
  customerMaskedName?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  expiresAt?: string;
  issuedAt?: string;
  status?: string;
  redeemedAt?: string;
};

/**
 * Read-only coupon verification
 */
export async function verifyCoupon(params: {
  couponCode: string;
  barId: string;
  staffEmail: string;
  staffJwt?: string;
}): Promise<VerifyCouponResult> {
  const code = normalizeCouponCode(params.couponCode);
  const bar = getBarById(params.barId);

  if (!bar || !bar.isActive) {
    return { isValid: false, error: "Bar outlet is inactive or unauthorized." };
  }

  if (!code) {
    return { isValid: false, error: "Please enter or scan a valid SAGO coupon code." };
  }

  // Try Supabase RPC first
  if (hasSupabaseServerEnv()) {
    try {
      const rpcResult = await callVerifyCouponRpc(code, bar.id, params.staffJwt);
      if (rpcResult) {
        if (!rpcResult.is_valid) {
          return {
            isValid: false,
            error: rpcResult.error || "Coupon verification failed",
            couponCode: rpcResult.coupon_code || code,
            tier: rpcResult.tier,
            bottleDiscount: rpcResult.bottle_discount,
            shotDiscount: rpcResult.shot_discount,
            status: rpcResult.status,
            redeemedAt: rpcResult.redeemed_at,
          };
        }

        return {
          isValid: true,
          couponCode: rpcResult.coupon_code || code,
          tier: rpcResult.tier,
          bottleDiscount: rpcResult.bottle_discount,
          shotDiscount: rpcResult.shot_discount,
          combination: rpcResult.combination,
          reward: rpcResult.eligible_product,
          customerMaskedName: rpcResult.customer_name ? maskCustomerName(rpcResult.customer_name) : "SAGO Customer",
          venueName: bar.name,
          venueAddress: bar.address,
          venueCity: bar.city,
          expiresAt: rpcResult.expires_at,
          status: rpcResult.status,
        };
      }
    } catch (rpcErr) {
      // When Supabase is configured, RPC failure should return error, not fall back
      console.error("[VerifyService] RPC verify failed:", rpcErr);
      return {
        isValid: false,
        error: "Coupon verification service unavailable",
      };
    }
  }

  // Fallback to local file storage (only when Supabase not configured)
  const coupons = getAllCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code);

  if (!coupon) {
    appendRedemptionLog({
      id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
      couponCode: code,
      barId: bar.id,
      barName: bar.name,
      staffEmail: params.staffEmail,
      action: "verification_failed",
      result: "Coupon code not found in database",
      createdAt: new Date().toISOString(),
    });
    return { isValid: false, error: "Coupon code not recognized." };
  }

  if (coupon.status === "REDEEMED") {
    const redeemedDate = coupon.redeemedAt ? new Date(coupon.redeemedAt) : (coupon.expiresAt ? new Date(coupon.expiresAt) : null);
    return {
      isValid: false,
      error: redeemedDate
        ? `Coupon was already redeemed on ${redeemedDate.toLocaleDateString()}.`
        : "Coupon was already redeemed.",
      couponCode: coupon.code,
      tier: coupon.tier,
      bottleDiscount: coupon.bottleDiscount,
      shotDiscount: coupon.shotDiscount,
      status: "REDEEMED",
      redeemedAt: coupon.redeemedAt,
    };
  }

  const now = new Date();
  if (coupon.status === "EXPIRED" || (coupon.expiresAt && new Date(coupon.expiresAt) < now)) {
    return {
      isValid: false,
      error: "This promotional voucher has expired.",
      couponCode: coupon.code,
      expiresAt: coupon.expiresAt,
      status: "EXPIRED",
    };
  }

  appendRedemptionLog({
    id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
    couponCode: coupon.code,
    barId: bar.id,
    barName: bar.name,
    staffEmail: params.staffEmail,
    action: "verification_success",
    result: "Coupon verified successfully",
    discountApplied: `${coupon.bottleDiscount}% Bottle / ${coupon.shotDiscount}% Pour`,
    createdAt: now.toISOString(),
  });

  return {
    isValid: true,
    couponCode: coupon.code,
    tier: coupon.tier,
    bottleDiscount: coupon.bottleDiscount,
    shotDiscount: coupon.shotDiscount,
    combination: coupon.combination,
    reward: coupon.reward,
    customerMaskedName: maskCustomerName(coupon.customerName),
    venueName: coupon.venueName,
    venueAddress: coupon.venueAddress,
    venueCity: coupon.venueCity,
    expiresAt: coupon.expiresAt,
    issuedAt: coupon.issuedAt,
    status: coupon.status,
  };
}

export type RedeemCouponResult = {
  success: boolean;
  error?: string;
  confirmationRef?: string;
  couponCode?: string;
  tier?: string;
  bottleDiscount?: number;
  shotDiscount?: number;
  redeemedAt?: string;
  barName?: string;
  message?: string;
  idempotentReplay?: boolean;
};

/**
 * Atomic coupon redemption with lock & idempotency check
 */
export async function redeemCoupon(params: {
  couponCode: string;
  barId: string;
  staffEmail: string;
  requestId?: string;
  staffJwt?: string;
}): Promise<RedeemCouponResult> {
  const code = normalizeCouponCode(params.couponCode);
  const bar = getBarById(params.barId);

  if (!bar || !bar.isActive) {
    return { success: false, error: "Bar outlet is inactive or unauthorized." };
  }

  if (!code) {
    return { success: false, error: "Invalid coupon code." };
  }

  // Try Supabase RPC first
  if (hasSupabaseServerEnv()) {
    try {
      const rpcResult = await callRedeemCouponRpc(code, bar.id, params.requestId ?? null, params.staffJwt);
      if (rpcResult) {
        if (!rpcResult.success) {
          return {
            success: false,
            error: rpcResult.error || "Redemption failed",
          };
        }

        return {
          success: true,
          confirmationRef: rpcResult.confirmation_ref,
          couponCode: rpcResult.coupon_code,
          tier: rpcResult.tier,
          bottleDiscount: rpcResult.bottle_discount,
          shotDiscount: rpcResult.shot_discount,
          redeemedAt: rpcResult.redeemed_at,
          barName: rpcResult.bar_name || bar.name,
          message: rpcResult.message || "Coupon successfully redeemed.",
          idempotentReplay: rpcResult.idempotent_replay ?? false,
        };
      }
    } catch (rpcErr) {
      // When Supabase is configured, RPC failure should return error, not fall back
      console.error("[VerifyService] RPC redeem failed:", rpcErr);
      return {
        success: false,
        error: "Coupon redemption service unavailable",
      };
    }
  }

  // Fallback to local file storage (only when Supabase not configured)
  // Idempotency check if requestId is provided
  if (params.requestId) {
    const logs = getRedemptionLogs();
    const existing = logs.find(
      (l) => l.requestId === params.requestId && l.couponCode.toUpperCase() === code && l.action === "redeemed"
    );
    if (existing) {
      const match = existing.result.match(/confirmation\s+([A-Z0-9-]+)/i);
      return {
        success: true,
        idempotentReplay: true,
        confirmationRef: match ? match[1] : undefined,
        couponCode: existing.couponCode,
        barName: bar.name,
        message: "Redemption previously confirmed.",
      };
    }
  }

  // Mutex lock to prevent race conditions during simultaneous requests
  if (activeRedemptionLocks.has(code)) {
    return { success: false, error: "Redemption currently processing for this voucher. Please wait." };
  }

  activeRedemptionLocks.add(code);

  try {
    const coupons = getAllCoupons();
    const couponIndex = coupons.findIndex((c) => c.code.toUpperCase() === code);

    if (couponIndex === -1) {
      appendRedemptionLog({
        id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
        couponCode: code,
        barId: bar.id,
        barName: bar.name,
        staffEmail: params.staffEmail,
        action: "redemption_rejected",
        result: "Coupon not found",
        requestId: params.requestId,
        createdAt: new Date().toISOString(),
      });
      return { success: false, error: "Invalid coupon code." };
    }

    const coupon = coupons[couponIndex];

    if (coupon.status === "REDEEMED") {
      appendRedemptionLog({
        id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
        couponCode: code,
        barId: bar.id,
        barName: bar.name,
        staffEmail: params.staffEmail,
        action: "redemption_rejected",
        result: "Already redeemed",
        requestId: params.requestId,
        createdAt: new Date().toISOString(),
      });
      return { success: false, error: "Coupon has already been redeemed." };
    }

    const now = new Date();
    // Reject if status is EXPIRED or if expiresAt is in the past
    if (coupon.status === "EXPIRED" || (coupon.expiresAt && new Date(coupon.expiresAt) < now)) {
      appendRedemptionLog({
        id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
        couponCode: code,
        barId: bar.id,
        barName: bar.name,
        staffEmail: params.staffEmail,
        action: "redemption_rejected",
        result: "Expired voucher",
        requestId: params.requestId,
        createdAt: now.toISOString(),
      });
      return { success: false, error: "Coupon has expired." };
    }

    const confirmationRef = `SAGO-RED-${now.getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

    // Atomically update coupon state
    coupons[couponIndex] = {
      ...coupon,
      status: "REDEEMED",
      expiresAt: coupon.expiresAt,
      redeemedAt: now.toISOString(),
      redeemedAtBarId: bar.id,
    };
    saveCoupons(coupons);

    // Write audit log
    appendRedemptionLog({
      id: `log-${Date.now()}-${randomBytes(2).toString("hex")}`,
      couponCode: coupon.code,
      barId: bar.id,
      barName: bar.name,
      staffEmail: params.staffEmail,
      action: "redeemed",
      result: `Redeemed under confirmation ${confirmationRef}`,
      requestId: params.requestId,
      discountApplied: `${coupon.bottleDiscount}% Bottle / ${coupon.shotDiscount}% Pour`,
      createdAt: now.toISOString(),
    });

    return {
      success: true,
      confirmationRef,
      couponCode: coupon.code,
      tier: coupon.tier,
      bottleDiscount: coupon.bottleDiscount,
      shotDiscount: coupon.shotDiscount,
      redeemedAt: now.toISOString(),
      barName: bar.name,
      message: "Coupon successfully redeemed.",
    };
  } finally {
    activeRedemptionLocks.delete(code);
  }
}

/**
 * Bar Activity Isolation:
 * Returns ONLY logs and statistics for the requested barId.
 */
export async function getBarRedemptionActivity(barId: string) {
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseAdmin();
      const dbBarId = mapBarIdToUuid(barId);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayStart = `${todayStr}T00:00:00.000Z`;
      const todayEnd = `${todayStr}T23:59:59.999Z`;

      // Fetch recent activity (limited to 50)
      const { data: logsData, error: logsError } = await supabase
        .from("redemption_logs")
        .select("*")
        .eq("bar_id", dbBarId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (logsError) {
        throw logsError;
      }

      // Separate count queries for today's totals
      const { count: todayRedeemed, error: redeemedCountError } = await supabase
        .from("redemption_logs")
        .select("*", { count: "exact", head: true })
        .eq("bar_id", dbBarId)
        .eq("action", "redeemed")
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd);
      if (redeemedCountError) {
        throw redeemedCountError;
      }

      const { count: todayRejected, error: rejectedCountError } = await supabase
        .from("redemption_logs")
        .select("*", { count: "exact", head: true })
        .eq("bar_id", dbBarId)
        .eq("action", "redemption_rejected")
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd);
      if (rejectedCountError) {
        throw rejectedCountError;
      }

      const logs = (logsData || []).map((l) => ({
        id: l.id,
        couponCode: l.coupon_code,
        barId: barId,
        barName: l.bar_name || "",
        staffEmail: l.staff_email || "",
        action: l.action,
        result: l.result,
        requestId: l.request_id,
        discountApplied: l.discount_applied,
        createdAt: l.created_at,
      }));

      return {
        todaySuccessfulCount: todayRedeemed ?? 0,
        todayRejectedCount: todayRejected ?? 0,
        recentActivity: logs,
      };
    } catch (err) {
      console.error("[VerifyService] Failed to read activity from Supabase:", err);
      throw new Error("Activity read failed");
    }
  }

  // Fallback to local file storage
  const allLogs = getRedemptionLogs();
  const barLogs = allLogs.filter((l) => l.barId === barId);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRedeemed = barLogs.filter((l) => l.action === "redeemed" && l.createdAt.startsWith(todayStr)).length;
  const todayRejected = barLogs.filter((l) => l.action === "redemption_rejected" && l.createdAt.startsWith(todayStr)).length;

  return {
    todaySuccessfulCount: todayRedeemed,
    todayRejectedCount: todayRejected,
    recentActivity: barLogs.slice(0, 50),
  };
}
