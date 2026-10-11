import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";
import {
  getApplicationById,
  updateApplicationVerification,
  DEFAULT_CHECKLIST,
} from "@/lib/partner-storage";
import { PartnerApplicationStatus, VerificationChecklist } from "@/lib/partner-types";

export const dynamic = "force-dynamic";

const ALLOWED_STATUS_VALUES: PartnerApplicationStatus[] = [
  "draft",
  "pending_review",
  "under_review",
  "additional_info_required",
  "approved",
  "rejected",
  "on_hold",
];

const ALLOWED_UPDATE_FIELDS = [
  "status",
  "partnerIdAssigned",
  "agreementReference",
  "activationDate",
  "renewalDate",
  "decisionReason",
  "internalNotes",
  "checklist",
  "assignedOfficerName",
];

// Derive valid checklist keys from DEFAULT_CHECKLIST
const VALID_CHECKLIST_KEYS = Object.keys(DEFAULT_CHECKLIST) as Array<keyof VerificationChecklist>;

function validateUpdateBody(body: unknown): { valid: boolean; error?: string; sanitized?: Record<string, unknown> } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body: expected an object." };
  }

  const sanitized: Record<string, unknown> = {};
  const keys = Object.keys(body as Record<string, unknown>);

  for (const key of keys) {
    if (!ALLOWED_UPDATE_FIELDS.includes(key)) {
      return { valid: false, error: `Invalid field: "${key}" is not allowed.` };
    }

    const value = (body as Record<string, unknown>)[key];

    if (key === "status" && value !== undefined) {
      if (typeof value !== "string" || !ALLOWED_STATUS_VALUES.includes(value as PartnerApplicationStatus)) {
        return { valid: false, error: `Invalid status value. Allowed: ${ALLOWED_STATUS_VALUES.join(", ")}` };
      }
      sanitized[key] = value;
    } else if (key === "checklist" && value !== undefined) {
      if (!value || typeof value !== "object") {
        return { valid: false, error: "Invalid checklist: expected an object." };
      }
      const checklistKeys = Object.keys(value as Record<string, unknown>);
      for (const ck of checklistKeys) {
        if (!VALID_CHECKLIST_KEYS.includes(ck as keyof VerificationChecklist)) {
          return { valid: false, error: `Invalid checklist field: "${ck}"` };
        }
        const cv = (value as Record<string, unknown>)[ck];
        if (typeof cv !== "boolean") {
          return { valid: false, error: `Checklist field "${ck}" must be a boolean.` };
        }
      }
      sanitized[key] = value;
    } else if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return { valid: true, sanitized };
}

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

    const validation = validateUpdateBody(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const app = await getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const updated = await updateApplicationVerification(
      id,
      validation.sanitized || {},
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
    if (msg.includes("not found") || msg.includes("Application with ID")) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 }
    );
  }
}
