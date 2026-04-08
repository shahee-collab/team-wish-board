import { NextRequest, NextResponse } from "next/server";

const GIPHY_BASE = "https://api.giphy.com/v1/gifs";

interface GiphyImageVariant {
  url: string;
}

interface GiphyGif {
  id: string;
  title: string;
  images: {
    fixed_height: GiphyImageVariant;
    fixed_height_small: GiphyImageVariant;
  };
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GIPHY_API_KEY not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0);

  const endpoint = q
    ? `${GIPHY_BASE}/search?api_key=${apiKey}&q=${encodeURIComponent(q)}&limit=18&offset=${offset}&rating=g&lang=en`
    : `${GIPHY_BASE}/trending?api_key=${apiKey}&limit=18&offset=${offset}&rating=g`;

  try {
    const res = await fetch(endpoint, { next: { revalidate: 60 } });
    if (!res.ok) {
      const body = await res.text();
      // Log to Vercel function logs so you can see Giphy's actual error
      console.error("[Giphy API]", res.status, body.slice(0, 300));
      return NextResponse.json(
        { error: "Giphy API error", detail: res.status === 401 ? "Invalid API key" : body.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { data?: GiphyGif[] };
    const list = Array.isArray(data?.data) ? data.data : [];
    const gifs = list.map((gif) => ({
      id: gif.id,
      title: gif.title,
      url: gif.images?.fixed_height?.url ?? "",
      previewUrl: gif.images?.fixed_height_small?.url ?? "",
    })).filter((g) => g.url && g.previewUrl);

    return NextResponse.json({ gifs });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch GIFs", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
