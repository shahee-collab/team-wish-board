"use client";

import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { Wish } from "@/lib/types";
import { getImageSrc } from "@/lib/image";
import { siteOccasionDate } from "@/lib/site";
import HeartReaction from "./ReactionButton";
import { useWishModal } from "./WishModalContext";

interface WishCardProps {
  wish: Wish;
  index?: number;
}

// Illustration image paths — matches WishCardBuilder
const ILLUSTRATION_MAP: Record<string, string> = {
  spacemonkey: "/illustrations/spacemonkey.png",
  confetti:    "/illustrations/confetti.png",
  flower:      "/illustrations/flower.png",
  hifive:      "/illustrations/hifive.png",
  drinks:      "/illustrations/drinks.png",
  stars:       "/illustrations/stars.png",
};

const FALLBACK_COLORS = ["#2672C8", "#5A9A28", "#BE70CC", "#D06510", "#2672C8", "#5A9A28"];

const isBeforeOccasionDate = Date.now() < new Date(siteOccasionDate).getTime();

function WishCard({ wish, index = 0 }: WishCardProps) {
  const cardColor = wish.cardColor ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const illustrationSrc = wish.illustration ? ILLUSTRATION_MAP[wish.illustration] : null;
  const wishModal = useWishModal();
  const prefersReduced = useReducedMotion();

  const [isOwned, setIsOwned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // 3D tilt motion values
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(mx, { stiffness: 280, damping: 28 });
  const rotateX = useSpring(my, { stiffness: 280, damping: 28 });

  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    mx.set(dx * 4);
    my.set(dy * -4);
  }, [mx, my, prefersReduced]);

  const handleTiltLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  }, [mx, my]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wish-board-owned");
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      setIsOwned(arr.includes(wish.id));
    } catch { /* ignore */ }
  }, [wish.id]);

  const handleEdit = useCallback(() => {
    wishModal?.openEditModal(wish);
  }, [wish, wishModal]);

  const handleDelete = useCallback(async () => {
    setDeleted(true);
    try {
      const res = await fetch(`/api/wishes/${wish.id}`, { method: "DELETE" });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("wishes-updated"));
      } else {
        setDeleted(false);
      }
    } catch {
      setDeleted(false);
    }
  }, [wish.id]);

  const showActions = isOwned && isBeforeOccasionDate;

  if (deleted) return null;

  return (
    // Perspective wrapper — required for 3D tilt to look correct
    <div
      style={{ perspective: "800px" }}
      onMouseMove={handleTiltMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleTiltLeave}
    >
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.4) }}
      className="wish-card"
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      {/* Colored top — illustration or uploaded image */}
      <div
        style={{
          background: cardColor,
          minHeight: 130,
          borderRadius: "8px 8px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {wish.image ? (
          (() => {
            const src = getImageSrc(wish.image);
            if (!src) return null;
            return wish.image.startsWith("/") || src.startsWith("/") ? (
              <Image
                src={src}
                alt=""
                width={400}
                height={160}
                className="w-full object-cover"
                style={{ height: 160 }}
                unoptimized
                loading="lazy"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                loading="lazy"
              />
            );
          })()
        ) : illustrationSrc ? (
          <Image
            src={illustrationSrc}
            alt=""
            width={120}
            height={120}
            style={{ objectFit: "contain", userSelect: "none" }}
            unoptimized
          />
        ) : null}

        {/* Edit / Delete overlay — visible on hover for owned cards before farewell date */}
        <AnimatePresence>
          {showActions && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                display: "flex",
                gap: 4,
              }}
            >
              <button
                type="button"
                onClick={handleEdit}
                title="Edit wish"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--card-action-bg, rgba(255,255,255,0.92))",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  boxShadow: "var(--card-action-shadow, 0 1px 4px rgba(9,30,66,0.18))",
                }}
                aria-label="Edit wish"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={handleDelete}
                title="Delete wish"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "var(--card-action-bg, rgba(255,255,255,0.92))",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  boxShadow: "var(--card-action-shadow, 0 1px 4px rgba(9,30,66,0.18))",
                }}
                aria-label="Delete wish"
              >
                🗑️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* White bottom — message + sender + footer */}
      <div
        className="flex flex-col flex-1 px-4 pt-3 pb-3"
        style={{ borderTop: "1px solid var(--ds-border, #DFE1E6)" }}
      >
        {/* Message */}
        <p
          className="text-sm leading-relaxed flex-1"
          style={{ color: "var(--ds-text, #172B4D)" }}
        >
          {wish.message}
        </p>

        {/* Footer: sender + reactions */}
        <div
          className="flex items-center justify-between mt-3 pt-2"
          style={{ borderTop: "1px solid var(--ds-border, #DFE1E6)", overflow: "visible" }}
        >
          <p
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--ds-text, #172B4D)" }}
          >
            {wish.name}
          </p>
          <HeartReaction
            wishId={wish.id}
            count={wish.reactions}
          />
        </div>
      </div>
    </motion.article>
    </div>
  );
}

export default memo(WishCard, (prev, next) => {
  return (
    prev.wish.id        === next.wish.id        &&
    prev.wish.reactions === next.wish.reactions  &&
    prev.wish.message   === next.wish.message    &&
    prev.wish.name      === next.wish.name       &&
    prev.index          === next.index
  );
});
