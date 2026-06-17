"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  /** Wipe direction. */
  direction?: "left" | "up";
};

/**
 * Mask-wipe reveal: the content is unveiled with a clip-path sweep on scroll.
 * Great for headings, eyebrows and images. No-ops under reduced motion.
 */
export default function TextReveal({
  children,
  className,
  delay = 0,
  once = true,
  direction = "left",
}: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;

  const hidden = direction === "up" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)";

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      initial={{ clipPath: hidden, opacity: 0 }}
      whileInView={{ clipPath: "inset(0 0 0 0)", opacity: 1 }}
      viewport={{ once, amount: 0.6 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}
