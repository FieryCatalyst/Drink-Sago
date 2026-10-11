import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/jpeg": [[0xff, 0xd8, 0xff]], // JPEG
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]], // PNG
  // WebP: RIFF at offset 0, WEBP at offset 8 (chunk size at 4-7 can be any value)
  "image/webp": [[0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]], // RIFF....WEBP (legacy)
};

function detectMimeType(buffer: Buffer): string | null {
  // Check WebP separately since chunk size can vary
  if (buffer.length >= 12) {
    const riff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // RIFF
    const webp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // WEBP
    if (riff && webp) {
      return "image/webp";
    }
  }

  for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
    if (mime === "image/webp") continue; // Already checked above
    for (const sig of signatures) {
      if (buffer.length >= sig.length && sig.every((byte, i) => buffer[i] === byte)) {
        return mime;
      }
    }
  }
  return null;
}

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

    // Validate file type from magic bytes
    const detectedMime = detectMimeType(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime)) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Only PDF, JPG, PNG, and WebP files are accepted.",
        },
        { status: 400 }
      );
    }

    // Also verify client-provided type matches detected type
    if (file.type && file.type !== detectedMime) {
      return NextResponse.json(
        {
          error:
            "File type mismatch. The uploaded file does not match the declared format.",
        },
        { status: 400 }
      );
    }

    // Save to server-side private upload directory (outside public/)
    const uploadDir = path.join(process.cwd(), ".data", "uploads", "partner-docs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = crypto.randomUUID().substring(0, 8);
    const storedFileName = `${Date.now()}_${uniqueId}_${safeBaseName}`;
    const filePath = path.join(uploadDir, storedFileName);

    fs.writeFileSync(filePath, buffer);

    // Return a download route URL instead of direct file path
    const fileUrl = `/api/partners/download/${storedFileName}`;

    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: detectedMime,
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
