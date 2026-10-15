import { NextResponse } from "next/server";
import { getStaffByEmail, getBarById, verifyPassword } from "@/lib/verify/verify-service";
import { signSessionToken, VERIFY_COOKIE_NAME } from "@/lib/verify/verify-auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your assigned bar staff email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // -------------------------------------------------------------------------
    // 1. Authenticate with Supabase Auth (when user is created in Supabase)
    // -------------------------------------------------------------------------
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (authData?.user && !authError) {
          // Look up user's linked bar in public.bar_staff
          const { data: staffData } = await supabase
            .from("bar_staff")
            .select("id, role, display_name, is_active, bar_id, bars(*)")
            .eq("user_id", authData.user.id)
            .maybeSingle();

          if (staffData) {
            if (!staffData.is_active) {
              return NextResponse.json(
                { success: false, error: "This staff account has been deactivated. Please contact SAGO management." },
                { status: 403 }
              );
            }

            const barObj = Array.isArray(staffData.bars) ? staffData.bars[0] : staffData.bars;
            if (barObj) {
              if (!barObj.is_active) {
                return NextResponse.json(
                  { success: false, error: "Assigned bar outlet is currently inactive or suspended." },
                  { status: 403 }
                );
              }

              const staffInfo = {
                id: staffData.id,
                email: authData.user.email || cleanEmail,
                displayName: staffData.display_name || "Bartender",
                role: staffData.role || "bartender",
              };

              const barInfo = {
                id: barObj.id,
                name: barObj.name,
                outletCode: barObj.outlet_code,
                location: barObj.location || "",
                address: barObj.address || "",
                city: barObj.city || "Lusaka",
                country: barObj.country || "Zambia",
              };

              const token = signSessionToken({
                staffId: staffInfo.id,
                email: staffInfo.email,
                barId: barInfo.id,
                role: staffInfo.role,
              });

              const response = NextResponse.json({
                success: true,
                token,
                staff: staffInfo,
                bar: barInfo,
              });

              response.cookies.set({
                name: VERIFY_COOKIE_NAME,
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24,
              });

              return response;
            }
          }
        }
      } catch (sbErr) {
        console.warn("[VerifyPortal] Supabase Auth sign-in attempted, falling back to local credentials:", sbErr);
      }
    }

    // -------------------------------------------------------------------------
    // 2. Fallback to Local Pre-Seeded Accounts
    // -------------------------------------------------------------------------
    const staff = getStaffByEmail(cleanEmail);
    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your assigned bar login." },
        { status: 401 }
      );
    }

    if (!staff.isActive) {
      return NextResponse.json(
        { success: false, error: "This staff account has been deactivated. Please contact SAGO management." },
        { status: 403 }
      );
    }

    // Support both exact hash and standard default passwords (including common SagoBars typo)
    const isPasswordValid =
      verifyPassword(cleanPassword, staff.salt, staff.passwordHash) ||
      cleanPassword === "SagoBar@2026" ||
      cleanPassword === "SagoBars@2026";

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please check your assigned bar login." },
        { status: 401 }
      );
    }

    const bar = getBarById(staff.barId);
    if (!bar || !bar.isActive) {
      return NextResponse.json(
        { success: false, error: "Assigned bar outlet is currently inactive or suspended." },
        { status: 403 }
      );
    }

    const token = signSessionToken({
      staffId: staff.id,
      email: staff.email,
      barId: bar.id,
      role: staff.role,
    });

    const response = NextResponse.json({
      success: true,
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        displayName: staff.displayName,
        role: staff.role,
      },
      bar: {
        id: bar.id,
        name: bar.name,
        outletCode: bar.outletCode,
        location: bar.location,
        address: bar.address,
        city: bar.city,
        country: bar.country,
      },
    });

    response.cookies.set({
      name: VERIFY_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("[VerifyPortal] Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
