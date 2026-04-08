"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface HeartReactionProps {
  wishId: string;
  count: number;
}

const STORAGE_KEY = "wish-board-reactions";

function hasReacted(wishId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    // Support both old array format and new map format
    if (Array.isArray(parsed)) return parsed.includes(wishId);
    return wishId in parsed;
  } catch { return false; }
}

function markReacted(wishId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      if (!parsed.includes(wishId)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...parsed, wishId]));
      }
    } else {
      parsed[wishId] = "love";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

function unmarkReacted(wishId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.filter((id: string) => id !== wishId)));
    } else {
      delete parsed[wishId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

const PARTICLE_COUNT = 8;
// Pre-compute angles and distances so Math.random() doesn't re-run on re-render
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  angle: (i / PARTICLE_COUNT) * 2 * Math.PI,
  dist: 16 + (i % 3) * 4,
}));

// Burst container is a zero-size div centred on the button so framer-motion
// x/y values radiate from the true centre without fighting transform offsets.
function HeartBurst({ onDone }: { onDone: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 0,
        height: 0,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <AnimatePresence onExitComplete={onDone}>
        {PARTICLES.map(({ angle, dist }, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0.9,
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
            }}
            exit={{}}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              fontSize: "0.55rem",
              pointerEvents: "none",
            }}
          >
            ❤️
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function HeartReaction({ wishId, count: initialCount }: HeartReactionProps) {
  const [reacted, setReacted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [burst, setBurst] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    setReacted(hasReacted(wishId));
  }, [wishId]);

  const handleClick = useCallback(async () => {
    if (reacted) {
      // Un-react
      setReacted(false);
      setCount((c) => Math.max(0, c - 1));
      unmarkReacted(wishId);
      try {
        await fetch("/api/reactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishId, emoji: "love" }),
        });
      } catch { /* optimistic — ignore */ }
    } else {
      // React
      setReacted(true);
      setCount((c) => c + 1);
      setBurst(true);
      setBurstKey((k) => k + 1);
      markReacted(wishId);
      try {
        await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishId, emoji: "love" }),
        });
      } catch { /* optimistic — ignore */ }
    }
  }, [wishId, reacted]);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      {/* Burst particles */}
      {burst && (
        <HeartBurst key={burstKey} onDone={() => setBurst(false)} />
      )}

      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 0",
          outline: "none",
        }}
        aria-label={reacted ? `Remove love reaction (${count})` : "Love this wish"}
      >
        {/* Heart SVG — CSS transition avoids framer-motion SVG interpolation issues */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          style={{
            flexShrink: 0,
            fill: reacted ? "var(--reaction-active, #E0245E)" : "rgba(0,0,0,0)",
            stroke: reacted ? "var(--reaction-active, #E0245E)" : "var(--reaction-stroke, #6B778C)",
            transition: "fill 0.18s ease, stroke 0.18s ease",
            strokeWidth: 2,
            strokeLinecap: "round",
            strokeLinejoin: "round",
          } as React.CSSProperties}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {/* Count — fixed width so the button never shifts when the number appears */}
        <span
          className="text-xs font-medium tabular-nums"
          style={{
            color: reacted ? "var(--reaction-active, #E0245E)" : "var(--reaction-stroke, #6B778C)",
            width: "2ch",
            display: "inline-block",
            textAlign: "center",
            transition: "color 0.18s ease",
          }}
        >
          {count > 0 ? count : ""}
        </span>
      </button>
    </div>
  );
}
