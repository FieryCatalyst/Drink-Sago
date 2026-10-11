import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No document file was provided in the upload request." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only PDF, JPG, PNG, and WebP files are accepted.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File size exceeds the 10MB limit. Please upload a smaller file.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to server-side private upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "partner-docs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = crypto.randomUUID().substring(0, 8);
    const storedFileName = `${Date.now()}_${uniqueId}_${safeBaseName}`;
    const filePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/partner-docs/${storedFileName}`;

    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        fileUrl,
        documentType: docType || "Compliance Document",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Document upload failed.";
    console.error("[Partner Upload API] Error:", msg);
    return NextResponse.json(
      { error: "Failed to process document upload. Please try again." },
      { status: 500 }
    );
  }
}
