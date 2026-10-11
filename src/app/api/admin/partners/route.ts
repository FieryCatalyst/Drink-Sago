import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getAllApplications } from "@/lib/partner-storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized. Admin privileges required." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const query = searchParams.get("q") || undefined;

    const allApps = await getAllApplications(status, query);

    // Compute status counts for admin badges
    const rawApps = await getAllApplications();
    const stats = {
      total: rawApps.length,
      pending: rawApps.filter((a) => a.status === "pending_review").length,
      underReview: rawApps.filter((a) => a.status === "under_review").length,
      needsInfo: rawApps.filter((a) => a.status === "additional_info_required").length,
      approved: rawApps.filter((a) => a.status === "approved").length,
      rejected: rawApps.filter((a) => a.status === "rejected").length,
      onHold: rawApps.filter((a) => a.status === "on_hold").length,
    };

    return NextResponse.json({
      success: true,
      stats,
      applications: allApps,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load applications.";
    console.error("[Admin Partners API] Error:", msg);
    return NextResponse.json(
      { error: "Internal server error occurred while retrieving applications." },
      { status: 500 }
    );
  }
}
