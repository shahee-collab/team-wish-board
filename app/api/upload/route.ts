import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, GIF, or WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be under 5MB" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || (file.type === "image/webp" ? ".webp" : ".jpg");
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const rawToken = process.env.BLOB_READ_WRITE_TOKEN;
    const token = rawToken?.trim().replace(/^["']|["']$/g, "") || null;

    if (!token) {
      return NextResponse.json(
        { error: "Blob storage not configured. Add BLOB_READ_WRITE_TOKEN to .env.local (local) or Vercel Environment Variables." },
        { status: 503 }
      );
    }

    const blob = await put(filename, file, { access: "private", token });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[upload] Error:", errMsg);
    return NextResponse.json(
      { error: "Upload failed", detail: errMsg },
      { status: 500 }
    );
  }
}
