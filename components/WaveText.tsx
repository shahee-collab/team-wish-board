"use client";

import { motion, useReducedMotion, useAnimation } from "framer-motion";
import { useCallback, useRef, useEffect } from "react";

interface WaveTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  spread?: number;
}

export default function WaveText({ text, className, style, spread = 3 }: WaveTextProps) {
  const prefersReduced = useReducedMotion();
  const triggersRef = useRef<((distance: number) => void)[]>([]);

  const handleCharHover = useCallback(
    (index: number) => {
      for (let i = Math.max(0, index - spread); i <= Math.min(triggersRef.current.length - 1, index + spread); i++) {
        triggersRef.current[i]?.(Math.abs(i - index));
      }
    },
    [spread]
  );

  if (prefersReduced) {
    return <span className={className} style={style}>{text}</span>;
  }

  const chars = text.split("");

  return (
    <span
      className={className}
      style={{ ...style, display: "inline-flex", flexWrap: "wrap", cursor: "default" }}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <WaveChar
          key={i}
          char={char}
          index={i}
          onHover={handleCharHover}
          registerTrigger={(fn) => { triggersRef.current[i] = fn; }}
        />
      ))}
    </span>
  );
}

function WaveChar({
  char,
  index,
  onHover,
  registerTrigger,
}: {
  char: string;
  index: number;
  onHover: (index: number) => void;
  registerTrigger: (fn: (distance: number) => void) => void;
}) {
  const controls = useAnimation();
  const busy = useRef(false);

  useEffect(() => {
    registerTrigger((distance: number) => {
      if (busy.current) return;
      busy.current = true;
      const lift = Math.max(1, 5 - distance * 1.5);
      controls
        .start({
          y: [0, -lift, 0],
          transition: { duration: 0.3 + distance * 0.04, ease: "easeInOut" },
        })
        .then(() => { busy.current = false; });
    });
  }, [controls, registerTrigger]);

  return (
    <motion.span
      aria-hidden
      animate={controls}
      onMouseEnter={() => onHover(index)}
      style={{ display: "inline-block", whiteSpace: "pre" }}
    >
      {char}
    </motion.span>
  );
}
