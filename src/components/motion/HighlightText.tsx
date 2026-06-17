"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Highlight bar colour. */
  color?: string;
  /** Bar height as a % of the line. */
  height?: string;
  once?: boolean;
  delay?: number;
};

/** A marker-style highlight that draws left→right behind the text on scroll. */
export default function HighlightText({
  children,
  className,
  color = "rgba(225,185,35,0.38)",
  height = "40%",
  once = true,
  delay = 0.1,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0 origin-left rounded-sm"
        style={{ height, backgroundColor: color }}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once, amount: 0.7 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
