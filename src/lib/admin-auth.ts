import { hasSupabaseServerEnv } from "./env";
import { getSupabaseClient } from "./supabase/server";

export interface AdminAuthResult {
  authorized: boolean;
  email?: string;
  error?: string;
}

export async function verifyAdminRequest(request: Request): Promise<AdminAuthResult> {
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!bearerToken) {
    return {
      authorized: false,
      error: "Authentication required. Please sign in with administrator credentials.",
    };
  }

  // Check Supabase session token - this is the only supported authentication method
  if (hasSupabaseServerEnv()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(bearerToken);
      if (!error && data?.user) {
        const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!allowedEmail) {
          return {
            authorized: false,
            error: "Administrator email restriction is not configured.",
          };
        }
        if (data.user.email?.toLowerCase() !== allowedEmail) {
          return {
            authorized: false,
            error: `Access denied: ${data.user.email} lacks administrator privileges.`,
          };
        }
        return { authorized: true, email: data.user.email };
      }
    } catch (err) {
      console.error("[Admin Auth] Supabase auth check error:", err);
    }
  }

  // No fallback tokens - fail closed
  return {
    authorized: false,
    error: "Session expired or unauthorized. Please re-authenticate.",
  };
}
