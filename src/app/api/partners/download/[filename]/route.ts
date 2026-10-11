import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

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

    const filePath = path.join(process.cwd(), ".data", "uploads", "partner-docs", filename);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found." },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type from file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    switch (ext) {
      case ".pdf":
        contentType = "application/pdf";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[Partner Download API] Error:", err);
    return NextResponse.json(
      { error: "Failed to download file." },
      { status: 500 }
    );
  }
}