"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Higher = more travel. ~0.15–0.4 is subtle and premium. */
  speed?: number;
};

/**
 * Vertical parallax tied to the element's progress through the viewport.
 * No-ops under reduced motion.
 */
export default function Parallax({ children, className, speed = 0.2 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = speed * 60;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : [`${-travel}%`, `${travel}%`],
  );

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
