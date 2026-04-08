import { NextRequest, NextResponse } from "next/server";
import { updateWish, deleteWish } from "@/lib/wishes";

const WORD_LIMIT = 50;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, message, image, cardColor, illustration } = body;

    if (name !== undefined && (!name || typeof name !== "string" || !name.trim())) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (message !== undefined) {
      if (!message || typeof message !== "string" || !message.trim()) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }
      if (countWords(message) > WORD_LIMIT) {
        return NextResponse.json(
          { error: `Message must be ${WORD_LIMIT} words or fewer` },
          { status: 400 }
        );
      }
    }

    const updated = await updateWish(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(message !== undefined && { message: message.trim() }),
      ...(image !== undefined && { image: typeof image === "string" ? image : undefined }),
      ...(cardColor !== undefined && { cardColor: typeof cardColor === "string" ? cardColor : undefined }),
      ...(illustration !== undefined && { illustration: typeof illustration === "string" ? illustration : undefined }),
    });

    if (!updated) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update wish" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deleted = await deleteWish(id);
    if (!deleted) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete wish" }, { status: 500 });
  }
}
