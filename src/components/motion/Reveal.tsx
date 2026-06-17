"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before animating. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  /** Animate only the first time it enters the viewport. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger (0–1). */
  amount?: number;
};

/**
 * Fade + rise on scroll-into-view. Reused across redesigned sections.
 * When the user prefers reduced motion it renders instantly with no transform.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  amount = 0.3,
}: Props) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
