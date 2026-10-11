import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  getApplicationById,
  updateApplicationVerification,
} from "@/lib/partner-storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const app = await getApplicationById(id);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application: app });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load application.";
    console.error("[Admin Partner Detail API] Error:", msg);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateApplicationVerification(
      id,
      body,
      {
        id: auth.email || "admin",
        name: auth.email || "SAGO Admin",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Application verification updated successfully.",
      application: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update application.";
    console.error("[Admin Partner Update API] Error:", msg);
    return NextResponse.json(
      { error: msg || "Failed to update application." },
      { status: 500 }
    );
  }
}
