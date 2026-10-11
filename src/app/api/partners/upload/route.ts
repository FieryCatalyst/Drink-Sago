import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";

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
};

function detectMimeType(buffer: Buffer): string | null {
  // Check WebP separately
  if (buffer.length >= 12) {
    const riff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // RIFF
    const webp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // WEBP
    if (riff && webp) {
      return "image/webp";
    }
  }

  for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
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

    // Also verify client-provided type matches detected type if provided
    if (file.type && file.type !== detectedMime) {
      return NextResponse.json(
        {
          error:
            "File type mismatch. The uploaded file does not match the declared format.",
        },
        { status: 400 }
      );
    }

    const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = crypto.randomUUID().substring(0, 8);
    const storedFileName = `${Date.now()}_${uniqueId}_${safeBaseName}`;

    let fileUrl = "";
    let storagePath = "";

    // Store in Supabase Storage bucket
    if (hasSupabaseServerEnv()) {
      try {
        const supabase = getSupabaseAdmin();
        const bucketPath = `partner-docs/${storedFileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("partner-documents")
          .upload(bucketPath, buffer, {
            contentType: detectedMime,
            upsert: true,
          });

        if (!uploadError && uploadData) {
          storagePath = bucketPath;
          // Use authenticated download route instead of public URL
          fileUrl = `/api/partners/download/${storedFileName}`;
        } else {
          throw uploadError || new Error("Storage upload failed");
        }
      } catch (storageErr) {
        console.error("[Upload API] Supabase storage upload failed:", storageErr);
        return NextResponse.json(
          { error: "Failed to store document in secure storage. Please try again." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Secure storage is not configured. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: detectedMime,
        fileUrl,
        storagePath,
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
