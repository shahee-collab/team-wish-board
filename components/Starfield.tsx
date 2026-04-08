"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  drift: number;
}

function createStars(width: number, height: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.15,
      twinkleSpeed: Math.random() * 0.8 + 0.3,
      twinkleOffset: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.08,
    });
  }
  return stars;
}

export default function Starfield() {
  const prefersReduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const density = Math.floor((w * h) / 4000);
    starsRef.current = createStars(w, h, Math.min(density, 350));
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();
    window.addEventListener("resize", resize);

    const animate = (time: number) => {
      const dpr = dprRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      const t = time / 1000;

      for (const star of starsRef.current) {
        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const opacity = star.baseOpacity + twinkle * 0.25;
        if (opacity <= 0) continue;

        star.y += star.drift;
        if (star.y < -2) star.y = h + 2;
        if (star.y > h + 2) star.y = -2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(210,200,255,${Math.max(0, Math.min(1, opacity))})`;
        ctx.fill();

        if (star.size > 1.2 && opacity > 0.3) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167,139,250,${opacity * 0.12})`;
          ctx.fill();
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [prefersReduced, resize]);

  if (prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
