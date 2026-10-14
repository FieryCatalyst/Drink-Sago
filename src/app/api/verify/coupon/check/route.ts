import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/verify/verify-auth";
import { verifyCoupon } from "@/lib/verify/verify-service";

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedStaff(request);
    if (!auth) {
      return NextResponse.json(
        { isValid: false, error: "Unauthorized. Please log in with your bar account." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { couponCode } = body;

    if (!couponCode || typeof couponCode !== "string") {
      return NextResponse.json(
        { isValid: false, error: "Please provide a valid coupon code or scan a QR code." },
        { status: 400 }
      );
    }

    const result = await verifyCoupon({
      couponCode,
      barId: auth.bar.id,
      staffEmail: auth.staff.email,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[VerifyPortal] Verification check error:", error);
    return NextResponse.json(
      { isValid: false, error: "Unable to verify coupon at this time. Please try again." },
      { status: 500 }
    );
  }
}
