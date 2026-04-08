"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

export default function SpotlightBackground() {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const renderedRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  useEffect(() => {
    if (prefersReduced) return;
    const el = canvasRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const { x: tx, y: ty } = posRef.current;
      const cur = renderedRef.current;
      cur.x = lerp(cur.x, tx, 0.08);
      cur.y = lerp(cur.y, ty, 0.08);

      el.style.background = `radial-gradient(650px circle at ${cur.x}px ${cur.y}px, rgba(167,139,250,0.12), rgba(99,102,241,0.04) 40%, transparent 70%)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, lerp]);

  if (prefersReduced) return null;

  return (
    <div
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
