"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[320px] gap-6 px-4"
      role="status"
      aria-label="Loading wish postcards"
    >
      <div className="flex space-x-2">
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.div
            key={i}
            className="h-3 w-3 rounded-full"
            style={{ background: "#a78bfa" }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              repeat: Infinity,
              delay,
            }}
          />
        ))}
      </div>

      <p className="font-dark-mono text-sm tracking-wide" style={{ color: "var(--ds-text-subtlest, #6B778C)" }}>
        Gathering wishes…
      </p>

      <span className="sr-only">Loading wish postcards...</span>
    </div>
  );
}
