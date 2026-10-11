import { NextResponse } from "next/server";
import { getApplicationByReference } from "@/lib/partner-storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await context.params;

    if (!ref) {
      return NextResponse.json(
        { error: "Application reference is required." },
        { status: 400 }
      );
    }

    const app = await getApplicationByReference(ref);
    if (!app) {
      return NextResponse.json(
        { error: "Application not found for the provided reference." },
        { status: 404 }
      );
    }

    // Mask sensitive financial and document details for public status response
    const safeData = {
      reference: app.applicationReference,
      status: app.status,
      submittedAt: app.submittedAt,
      tradingName: app.data.tradingName,
      county: app.data.county,
      businessType: app.data.businessType,
      partnerIdAssigned: app.partnerIdAssigned,
      activationDate: app.activationDate,
      agreementReference: app.agreementReference,
      decisionReason: app.decisionReason,
      // Provide progress checklist counts for transparency
      checklist: {
        totalItems: 12,
        completedCount: Object.values(app.checklist).filter(Boolean).length,
      },
    };

    return NextResponse.json({ success: true, application: safeData });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lookup failed";
    console.error("[Partner Status API] Error:", msg);
    return NextResponse.json(
      { error: "Failed to retrieve application status." },
      { status: 500 }
    );
  }
}
