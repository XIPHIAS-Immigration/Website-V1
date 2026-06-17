"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * Drives premium inertial scrolling (Lenis) and keeps GSAP ScrollTrigger in
 * sync with it, so scroll-scrubbed and pinned animations track the smoothed
 * scroll position. Lenis updates the native window scroll, so the sticky header
 * and framer-motion `useScroll` keep working. Disabled under reduced motion.
 * Mounted once from SiteChrome on public pages.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      anchors: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}
