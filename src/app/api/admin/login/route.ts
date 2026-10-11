import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
    const rawPassword = typeof body.password === "string" ? body.password.trim() : "";

    if (!rawEmail || !rawPassword) {
      return NextResponse.json(
        { error: "Please provide both administrator email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = rawEmail.toLowerCase();
    const configAdminEmail = (process.env.ADMIN_EMAIL || "itusharpandey.12@gmail.com").toLowerCase().trim();
    const configAdminPassword = (process.env.ADMIN_PASSWORD || "sago2026").trim();

    // Check direct admin credentials from environment (support both sago2026 and sago26)
    const isEmailValid = cleanEmail === configAdminEmail || cleanEmail === "itusharpandey.12@gmail.com";
    const isPasswordValid =
      rawPassword === configAdminPassword ||
      rawPassword === "sago2026" ||
      rawPassword === "sago26";

    if (isEmailValid && isPasswordValid) {
      return NextResponse.json({
        success: true,
        token: `admin-token-sago2026`,
        email: cleanEmail,
      });
    }

    // Attempt Supabase Auth login if configured
    if (hasSupabaseServerEnv()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: rawEmail,
          password: rawPassword,
        });

        if (!error && data?.session) {
          if (data.user.email?.toLowerCase() === configAdminEmail) {
            return NextResponse.json({
              success: true,
              token: data.session.access_token,
              email: data.user.email,
            });
          }
        }
      } catch (sbErr) {
        console.warn("[Admin Login] Supabase auth attempt notice:", sbErr);
      }
    }

    return NextResponse.json(
      { error: "Invalid administrator credentials. Please check your email and password." },
      { status: 401 }
    );
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during administrator authentication." },
      { status: 500 }
    );
  }
}
