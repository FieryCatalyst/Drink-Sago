import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getBarById, getStaffByEmail, BarRecord, BarStaffRecord } from "./verify-service";

export const VERIFY_COOKIE_NAME = "sago_verify_session";
const DEFAULT_SECRET = "sago-portal-secure-hmac-secret-2026";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecretKey(): string {
  return process.env.VERIFY_PORTAL_SECRET || DEFAULT_SECRET;
}

export type SessionPayload = {
  staffId: string;
  email: string;
  barId: string;
  role: string;
  exp: number;
};

export type AuthenticatedContext = {
  staff: BarStaffRecord;
  bar: BarRecord;
};

/**
 * Creates an HMAC-signed session token.
 */
export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const fullPayload: SessionPayload = { ...payload, exp };
  const jsonStr = JSON.stringify(fullPayload);
  const b64Data = Buffer.from(jsonStr).toString("base64url");
  const signature = createHmac("sha256", getSecretKey()).update(b64Data).digest("base64url");
  return `${b64Data}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-signed session token.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [b64Data, signature] = token.split(".");
  if (!b64Data || !signature) return null;

  const expectedSig = createHmac("sha256", getSecretKey()).update(b64Data).digest("base64url");
  const expectedBuf = Buffer.from(expectedSig);
  const providedBuf = Buffer.from(signature);
  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    return null;
  }

  try {
    const raw = Buffer.from(b64Data, "base64url").toString("utf-8");
    const payload = JSON.parse(raw) as SessionPayload;
    if (payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

/**
 * Validates the authenticated session from an incoming Request or Next.js cookies.
 * Strictly verifies that the staff member is active and their assigned bar is active.
 */
export async function getAuthenticatedStaff(request?: Request): Promise<AuthenticatedContext | null> {
  let token: string | undefined;

  // 1. Check Authorization header
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Check Cookie header if request exists
  if (!token && request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${VERIFY_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }

  // 3. Fallback to next/headers cookies if available
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(VERIFY_COOKIE_NAME)?.value;
    } catch {
      // Ignore if not in dynamic request context
    }
  }

  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  // Fetch fresh staff and bar state
  const staff = getStaffByEmail(payload.email);
  if (staff && staff.isActive) {
    const bar = getBarById(staff.barId) || getBarById(payload.barId);
    if (bar && bar.isActive) {
      return { staff, bar };
    }
  }

  // If user authenticated via Supabase Auth
  const bar = getBarById(payload.barId);
  if (bar && bar.isActive) {
    return {
      staff: {
        id: payload.staffId,
        email: payload.email,
        displayName: "Bartender",
        role: (payload.role as "bartender" | "bar_manager" | "admin") || "bartender",
        barId: bar.id,
        isActive: true,
        passwordHash: "",
        salt: "",
      },
      bar,
    };
  }

  return null;
}
