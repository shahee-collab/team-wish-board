import confetti from "canvas-confetti";

import { isDarkUI } from "./ui";

const LIGHT_COLORS = ["#0052CC", "#6554C0", "#00875A", "#FF991F", "#E0245E", "#00B8D9", "#FFD700"];
const DARK_COLORS = ["#7C3AED", "#A78BFA", "#22D3EE", "#34D399", "#F472B6", "#FBBF24", "#E4E4E7"];
const COLORS = isDarkUI ? DARK_COLORS : LIGHT_COLORS;

/** Short multi-burst celebration — used when a wish is sent. */
export function fireCelebration() {
  // Central burst
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.55 },
    colors: COLORS,
    startVelocity: 38,
    scalar: 0.9,
    gravity: 1.1,
  });

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: COLORS,
      startVelocity: 45,
    });
  }, 150);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: COLORS,
      startVelocity: 45,
    });
  }, 300);
}

/** Full-screen sustained confetti — used on the occasion day page load. */
export function fireOccasionConfetti() {
  const end = Date.now() + 2000;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.6 },
      colors: COLORS,
      scalar: 1,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.6 },
      colors: COLORS,
      scalar: 1,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
}
