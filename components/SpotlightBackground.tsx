"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

const GRADIENTS = {
  dark: (x: number, y: number) =>
    `radial-gradient(650px circle at ${x}px ${y}px, rgba(167,139,250,0.12), rgba(99,102,241,0.04) 40%, transparent 70%)`,
  light: (x: number, y: number) =>
    `radial-gradient(600px circle at ${x}px ${y}px, rgba(0,101,255,0.07), rgba(101,84,192,0.03) 40%, transparent 70%)`,
};

export default function SpotlightBackground({ darkUI = false }: { darkUI?: boolean }) {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const renderedRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  const gradient = darkUI ? GRADIENTS.dark : GRADIENTS.light;

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

      el.style.background = gradient(cur.x, cur.y);
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, lerp, gradient]);

  if (prefersReduced) return null;

  return (
    <div
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
