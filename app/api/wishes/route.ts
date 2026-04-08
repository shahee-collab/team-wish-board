import { NextRequest, NextResponse } from "next/server";
import { getAllWishes, addWish } from "@/lib/wishes";

const WORD_LIMIT = 50;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET() {
  try {
    const wishes = await getAllWishes();
    return NextResponse.json(wishes);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load wishes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, message, image, cardColor, illustration } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }
    if (countWords(message) > WORD_LIMIT) {
      return NextResponse.json(
        { error: `Message must be ${WORD_LIMIT} words or fewer` },
        { status: 400 }
      );
    }

    const wish = await addWish({
      name: name.trim(),
      message: message.trim(),
      image: typeof image === "string" ? image : undefined,
      cardColor: typeof cardColor === "string" ? cardColor : undefined,
      illustration: typeof illustration === "string" ? illustration : undefined,
    });

    return NextResponse.json(wish, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to add wish" },
      { status: 500 }
    );
  }
}
