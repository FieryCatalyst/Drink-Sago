import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/verify/verify-auth";
import { redeemCoupon } from "@/lib/verify/verify-service";

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedStaff(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in with your bar account." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { couponCode, requestId } = body;

    if (!couponCode || typeof couponCode !== "string") {
      return NextResponse.json(
        { success: false, error: "Please provide a valid coupon code." },
        { status: 400 }
      );
    }

    const result = await redeemCoupon({
      couponCode,
      barId: auth.bar.id,
      staffEmail: auth.staff.email,
      requestId: typeof requestId === "string" ? requestId : undefined,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[VerifyPortal] Redemption error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during redemption. Please try again." },
      { status: 500 }
    );
  }
}
