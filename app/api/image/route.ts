import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";

const BLOB_HOST = "blob.vercel-storage.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes(BLOB_HOST)) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob not configured" }, { status: 503 });
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim().replace(/^["']|["']$/g, "") ?? "";
    const result = await get(url, {
      access: "private",
      token,
      useCache: false,
    });
    if (!result || result.statusCode === 304 || !result.stream) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const contentType = result.blob.contentType ?? "application/octet-stream";
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[image proxy]", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
