import { NextRequest, NextResponse } from "next/server";
import { incrementReaction, decrementReaction } from "@/lib/wishes";

const VALID_EMOJIS = ["like", "love", "hug", "star"] as const;
type EmojiKey = typeof VALID_EMOJIS[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wishId, emoji } = body;

    if (!wishId || typeof wishId !== "string") {
      return NextResponse.json({ error: "wishId is required" }, { status: 400 });
    }

    const emojiKey: EmojiKey = VALID_EMOJIS.includes(emoji) ? emoji : "star";
    const wish = await incrementReaction(wishId, emojiKey);
    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    return NextResponse.json({ reactions: wish.reactions, reactionBreakdown: wish.reactionBreakdown });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { wishId, emoji } = body;

    if (!wishId || typeof wishId !== "string") {
      return NextResponse.json({ error: "wishId is required" }, { status: 400 });
    }

    const emojiKey: EmojiKey = VALID_EMOJIS.includes(emoji) ? emoji : "star";
    const wish = await decrementReaction(wishId, emojiKey);
    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    return NextResponse.json({ reactions: wish.reactions, reactionBreakdown: wish.reactionBreakdown });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
}
