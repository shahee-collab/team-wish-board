import { neon } from "@neondatabase/serverless";
import { siteOccasionDate, siteBoardId } from "./site";
import type { Wish, WishesData } from "./types";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

type DbRow = {
  id: string;
  name: string;
  message: string;
  image: string | null;
  card_color: string | null;
  illustration: string | null;
  timestamp: string;
  reactions: number;
  reaction_breakdown: Record<string, number> | null;
};

function rowToWish(row: DbRow): Wish {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    image: row.image ?? undefined,
    cardColor: row.card_color ?? undefined,
    illustration: row.illustration ?? undefined,
    timestamp: Number(row.timestamp),
    reactions: row.reactions,
    reactionBreakdown: row.reaction_breakdown ?? undefined,
  };
}

export async function getAllWishes(): Promise<Wish[]> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM wishes WHERE board_id = ${siteBoardId} ORDER BY timestamp DESC`) as DbRow[];
  return rows.map(rowToWish);
}

export function getConfig(): WishesData["config"] {
  return {
    farewellDate: siteOccasionDate,
    teamMemberName: process.env.NEXT_PUBLIC_PERSON_NAME ?? process.env.NEXT_PUBLIC_TEAM_MEMBER_NAME ?? "Team Member",
  };
}

export async function addWish(
  wish: Omit<Wish, "id" | "timestamp" | "reactions">
): Promise<Wish> {
  const sql = getSql();
  const id = crypto.randomUUID();
  const timestamp = Date.now();
  await sql`
    INSERT INTO wishes (id, board_id, name, message, image, card_color, illustration, timestamp, reactions, reaction_breakdown)
    VALUES (${id}, ${siteBoardId}, ${wish.name}, ${wish.message}, ${wish.image ?? null}, ${wish.cardColor ?? null}, ${wish.illustration ?? null}, ${timestamp}, 0, NULL)
  `;
  return {
    ...wish,
    id,
    timestamp,
    reactions: 0,
    reactionBreakdown: undefined,
  };
}

export async function updateWish(
  wishId: string,
  fields: Partial<Pick<Wish, "name" | "message" | "image" | "cardColor" | "illustration">>
): Promise<Wish | null> {
  const sql = getSql();
  const rows = (await sql`SELECT * FROM wishes WHERE id = ${wishId} LIMIT 1`) as DbRow[];
  const row = rows[0];
  if (!row) return null;

  const name = fields.name ?? row.name;
  const message = fields.message ?? row.message;
  const image = fields.image !== undefined ? fields.image : row.image;
  const card_color = fields.cardColor !== undefined ? fields.cardColor : row.card_color;
  const illustration = fields.illustration !== undefined ? fields.illustration : row.illustration;

  await sql`
    UPDATE wishes
    SET name = ${name}, message = ${message}, image = ${image ?? null}, card_color = ${card_color ?? null}, illustration = ${illustration ?? null}
    WHERE id = ${wishId}
  `;
  return rowToWish({ ...row, name, message, image, card_color, illustration });
}

export async function deleteWish(wishId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`DELETE FROM wishes WHERE id = ${wishId} RETURNING id`;
  return rows.length > 0;
}

export async function incrementReaction(
  wishId: string,
  emoji: "like" | "love" | "hug" | "star" = "star"
): Promise<Wish | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE wishes SET
      reactions = reactions + 1,
      reaction_breakdown = jsonb_set(
        COALESCE(reaction_breakdown, '{}'::jsonb),
        array[${emoji}]::text[],
        to_jsonb(COALESCE((reaction_breakdown->>${emoji})::int, 0) + 1)
      )
    WHERE id = ${wishId}
    RETURNING *
  `) as DbRow[];
  const row = rows[0];
  if (!row) return null;
  return rowToWish(row);
}

export async function decrementReaction(
  wishId: string,
  emoji: "like" | "love" | "hug" | "star" = "star"
): Promise<Wish | null> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE wishes SET
      reactions = GREATEST(0, reactions - 1),
      reaction_breakdown = jsonb_set(
        COALESCE(reaction_breakdown, '{}'::jsonb),
        array[${emoji}]::text[],
        to_jsonb(GREATEST(0, COALESCE((reaction_breakdown->>${emoji})::int, 0) - 1))
      )
    WHERE id = ${wishId}
    RETURNING *
  `) as DbRow[];
  const row = rows[0];
  if (!row) return null;
  return rowToWish(row);
}
