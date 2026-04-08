"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { Wish } from "@/lib/types";
import WishCard from "./WishCard";
import { siteOccasionDate } from "@/lib/site";

interface WishWallProps {
  wishes: Wish[];
  onAddTile?: () => void;
}

// Threshold at which the 3×3 initial grid is "full"
const GRID_FULL = 9;

// Ghost cards (and the ability to add wishes) are hidden once the occasion date/time arrives
const canAddWish = Date.now() < new Date(siteOccasionDate).getTime();

type ColItem =
  | { kind: "wish"; wish: Wish; wishIndex: number }
  | { kind: "ghost"; id: string };

function GhostCard({ index, onClick }: { index: number; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Write a wish"
      className="postcard-ghost w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center gap-2 p-8">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          style={{ color: "var(--ds-text-subtlest, #6B778C)", opacity: 0.6 }}
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--ds-text-subtlest, #6B778C)" }}
        >
          Send wish
        </span>
      </div>
    </motion.button>
  );
}

function WishWall({ wishes, onAddTile }: WishWallProps) {
  const n = wishes.length;

  // ── Desktop columns ───────────────────────────────────────────
  // Distribute wishes round-robin across 3 columns (gives the most even count).
  // n < 9  → pad every column to exactly 3 rows with ghost cards (3×3 grid).
  // n >= 9 → one ghost card appended to the middle column only.
  const columns = useMemo((): ColItem[][] => {
    const cols: ColItem[][] = [[], [], []];

    wishes.forEach((w, i) => {
      cols[i % 3].push({ kind: "wish", wish: w, wishIndex: i });
    });

    if (canAddWish) {
      if (n < GRID_FULL) {
        cols.forEach((col, ci) => {
          while (col.length < 3) {
            col.push({ kind: "ghost", id: `ghost-${ci}-${col.length}` });
          }
        });
      } else {
        cols[0].unshift({ kind: "ghost", id: "ghost-first" });
      }
    }

    return cols;
  }, [wishes, n]);

  // ── Mobile flat list ──────────────────────────────────────────
  // n < 9  → fill to 9 total slots with ghost cards.
  // n >= 9 → one ghost at the end.
  const mobileItems = useMemo((): ColItem[] => {
    const items: ColItem[] = wishes.map((w, i) => ({ kind: "wish", wish: w, wishIndex: i }));

    if (canAddWish) {
      if (n < GRID_FULL) {
        const ghostCount = GRID_FULL - n;
        for (let i = 0; i < ghostCount; i++) {
          items.push({ kind: "ghost", id: `ghost-mob-${i}` });
        }
      } else {
        items.push({ kind: "ghost", id: "ghost-mob-end" });
      }
    }

    return items;
  }, [wishes, n]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Mobile + tablet (< lg) */}
      <div className="wish-masonry lg:hidden">
        {mobileItems.map((item, i) =>
          item.kind === "wish" ? (
            <div className="wish-card-wrapper" key={item.wish.id}>
              <WishCard wish={item.wish} index={item.wishIndex} />
            </div>
          ) : (
            <div className="wish-card-wrapper" key={item.id}>
              <GhostCard index={i} onClick={onAddTile} />
            </div>
          )
        )}
      </div>

      {/* Desktop (lg+): explicit 3-column grid */}
      <div className="hidden lg:grid grid-cols-3 gap-5 items-start">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-5">
            {col.map((item, rowIdx) =>
              item.kind === "wish" ? (
                <WishCard key={item.wish.id} wish={item.wish} index={item.wishIndex} />
              ) : (
                <GhostCard key={item.id} index={colIdx * 3 + rowIdx} onClick={onAddTile} />
              )
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default memo(WishWall);
