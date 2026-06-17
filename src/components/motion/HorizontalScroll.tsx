"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Vertical-scroll-driven horizontal scroller: the section pins while its track
 * translates left, so scrolling down moves content sideways. Under reduced
 * motion it falls back to a normal swipeable horizontal row.
 */
export default function HorizontalScroll({ children, className, ariaLabel }: Props) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      if (!track.current) return;
      const d = Math.max(0, track.current.scrollWidth - window.innerWidth);
      setDistance(d);
      setHeight(d + window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [children]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  if (reduce) {
    return (
      <section className={className} aria-label={ariaLabel}>
        <div className="flex gap-6 overflow-x-auto px-[6vw] pb-4">{children}</div>
      </section>
    );
  }

  return (
    <section ref={outer} className={className} style={{ height }} aria-label={ariaLabel}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex gap-6 px-[6vw] will-change-transform">
          {children}
        </motion.div>
      </div>
    </section>
  );
}
