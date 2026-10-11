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
    const configAdminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();

    if (!configAdminEmail) {
      return NextResponse.json(
        { error: "Administrator email is not configured." },
        { status: 500 }
      );
    }

    // Only support Supabase Auth login - no hardcoded fallbacks
    if (!hasSupabaseServerEnv()) {
      return NextResponse.json(
        { error: "Authentication service unavailable." },
        { status: 503 }
      );
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: rawEmail,
        password: rawPassword,
      });

      if (error || !data?.session) {
        return NextResponse.json(
          { error: "Invalid administrator credentials. Please check your email and password." },
          { status: 401 }
        );
      }

      if (data.user.email?.toLowerCase() !== configAdminEmail) {
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: "Access denied: insufficient administrator privileges." },
          { status: 403 }
        );
      }

      // Return both access token and refresh token so browser Supabase client can establish and refresh session
      return NextResponse.json({
        success: true,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        email: data.user.email,
      });
    } catch (sbErr) {
      console.error("[Admin Login] Supabase auth error:", sbErr);
      return NextResponse.json(
        { error: "Authentication service error. Please try again." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during administrator authentication." },
      { status: 500 }
    );
  }
}
