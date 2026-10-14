import { NextResponse } from "next/server";
import { getAuthenticatedStaff } from "@/lib/verify/verify-auth";
import { getBarRedemptionActivity } from "@/lib/verify/verify-service";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedStaff(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please log in with your bar account." },
        { status: 401 }
      );
    }

    // Bar isolation: only retrieve activity for the authenticated staff's assigned barId
    const data = await getBarRedemptionActivity(auth.bar.id);

    return NextResponse.json({
      success: true,
      bar: {
        id: auth.bar.id,
        name: auth.bar.name,
        city: auth.bar.city,
      },
      todaySuccessfulCount: data.todaySuccessfulCount,
      todayRejectedCount: data.todayRejectedCount,
      recentActivity: data.recentActivity,
    });
  } catch (error) {
    console.error("[VerifyPortal] Activity fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bar activity history." },
      { status: 500 }
    );
  }
}
