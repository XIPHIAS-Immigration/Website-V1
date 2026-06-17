"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gradient progress bar pinned to the very top of the viewport that fills
 * as the page scrolls. Mounted site-wide from SiteChrome.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[1000] h-[3px] origin-left bg-gradient-to-r from-primary via-[#4f8cff] to-secondary"
    />
  );
}
