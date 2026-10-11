import { NextResponse } from "next/server";
import { PartnerFormData } from "@/lib/partner-types";
import { validateFullApplication } from "@/lib/partner-validation";
import { saveApplication } from "@/lib/partner-storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, isDraft, existingReference } = body as {
      data: PartnerFormData;
      isDraft?: boolean;
      existingReference?: string;
    };

    if (!data) {
      return NextResponse.json(
        { error: "Invalid request payload. Application data is required." },
        { status: 400 }
      );
    }

    // Server-side validation for final submissions
    if (!isDraft) {
      const validation = validateFullApplication(data);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error:
              "Application validation failed. Please check the indicated sections.",
            stepErrors: validation.stepErrors,
          },
          { status: 422 }
        );
      }
    }

    // Persist application
    const result = await saveApplication(data, Boolean(isDraft), existingReference);

    return NextResponse.json({
      success: true,
      reference: result.reference,
      status: result.record.status,
      submittedAt: result.record.submittedAt,
      isDraft: Boolean(isDraft),
      message: isDraft
        ? "Draft application saved successfully."
        : "Partner application submitted successfully for SAGO review.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed.";
    console.error("[Partner Register API] Error:", msg);
    return NextResponse.json(
      { error: "An error occurred while processing your application." },
      { status: 500 }
    );
  }
}
