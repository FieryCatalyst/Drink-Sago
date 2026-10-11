import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { hasSupabaseServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

function buildContentDisposition(filename: string): string {
  // RFC 5987 encoding for filename*
  const encoded = encodeURIComponent(filename).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
  // ASCII fallback: strip non-ASCII and replace quotes
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "'");
  return `inline; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    // Require admin authentication
    const auth = await verifyAdminRequest(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized." },
        { status: 401 }
      );
    }

    const { filename } = await context.params;

    // Validate filename to prevent path traversal
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json(
        { error: "Invalid filename." },
        { status: 400 }
      );
    }

    // 1. Fetch from Supabase partner_documents first
    if (hasSupabaseServerEnv()) {
      try {
        const supabase = getSupabaseAdmin();
        let docRecord = null;

        // Check if filename is a valid UUID for id lookup
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filename);

        // Always query by file_name to handle punctuation correctly
        const { data: byName } = await supabase
          .from("partner_documents")
          .select("*")
          .eq("file_name", filename)
          .limit(1)
          .maybeSingle();

        if (byName) {
          docRecord = byName;
        } else if (isUuid) {
          // Only query by id if filename is a valid UUID
          const { data: byId } = await supabase
            .from("partner_documents")
            .select("*")
            .eq("id", filename)
            .limit(1)
            .maybeSingle();
          docRecord = byId;
        }

        if (docRecord?.storage_path) {
          // If stored as Data URI in Supabase DB
          if (docRecord.storage_path.startsWith("data:")) {
            const matches = docRecord.storage_path.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              const contentType = matches[1] || docRecord.mime_type || "application/octet-stream";
              const fileBuffer = Buffer.from(matches[2], "base64");

              return new NextResponse(fileBuffer, {
                headers: {
                  "Content-Type": contentType,
                  "Content-Length": fileBuffer.length.toString(),
                  "Content-Disposition": buildContentDisposition(docRecord.file_name || filename),
                  "Cache-Control": "private, max-age=3600",
                  "X-Content-Type-Options": "nosniff",
                },
              });
            }
          }

          // If stored in Supabase Storage bucket
          const { data: storageFile, error: storageErr } = await supabase.storage
            .from("partner-documents")
            .download(docRecord.storage_path);

          if (!storageErr && storageFile) {
            const arrayBuf = await storageFile.arrayBuffer();
            const fileBuffer = Buffer.from(arrayBuf);
            return new NextResponse(fileBuffer, {
              headers: {
                "Content-Type": docRecord.mime_type || "application/octet-stream",
                "Content-Length": fileBuffer.length.toString(),
                "Content-Disposition": buildContentDisposition(docRecord.file_name || filename),
                "Cache-Control": "private, max-age=3600",
                "X-Content-Type-Options": "nosniff",
              },
            });
          }
        }
      } catch (sbErr) {
        console.warn("[Download API] Supabase retrieval warning:", sbErr);
      }
    }

    // 2. Legacy fallback if file exists on disk
    const filePath = path.join(process.cwd(), ".data", "uploads", "partner-docs", filename);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);

      const ext = path.extname(filename).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".pdf") contentType = "application/pdf";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stat.size.toString(),
          "Content-Disposition": buildContentDisposition(filename),
          "Cache-Control": "private, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return NextResponse.json(
      { error: "File not found in Supabase database." },
      { status: 404 }
    );
  } catch (err: unknown) {
    console.error("[Partner Download API] Error:", err);
    return NextResponse.json(
      { error: "Failed to download file." },
      { status: 500 }
    );
  }
}