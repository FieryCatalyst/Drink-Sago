import { NextResponse } from "next/server";
import { getStaffByEmail, getBarById, hashPassword } from "@/lib/verify/verify-service";
import { signSessionToken, VERIFY_COOKIE_NAME } from "@/lib/verify/verify-auth";

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

    const staff = getStaffByEmail(email);
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

    const calculatedHash = hashPassword(password, staff.salt);
    if (calculatedHash !== staff.passwordHash) {
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

    // Set secure HTTP-only cookie
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
