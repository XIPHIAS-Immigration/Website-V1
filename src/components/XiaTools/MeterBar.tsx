"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Subtle progress/score bar. The fill width is a static % (no CLS), and we
 * animate it in with a transform (`scaleX` from the left) — transform-only per
 * the performance rules. Renders full instantly under reduced motion.
 */
export function MeterBar({
  value,
  max = 100,
  color = "#4f8cff",
  height = "h-2",
  className = "",
}: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));

  return (
    <div className={`${height} overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        className="h-full origin-left rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
