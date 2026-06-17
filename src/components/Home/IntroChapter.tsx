"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** One word that reveals (rise + de-blur) across its slice of scroll progress. */
function ScrubWord({
  progress,
  start,
  end,
  className,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
  children: ReactNode;
}) {
  const opacity = useTransform(progress, [start, end], [0.08, 1]);
  const y = useTransform(progress, [start, end], [60, 0]);
  const blurPx = useTransform(progress, [start, end], [14, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return (
    <motion.span style={{ opacity, y, filter }} className={`inline-block ${className ?? ""}`}>
      {children}
    </motion.span>
  );
}

const WORDS: { t: string; accent?: boolean }[] = [
  { t: "One" },
  { t: "globe." },
  { t: "Every" },
  { t: "pathway", accent: true },
  { t: "to your" },
  { t: "new", accent: true },
  { t: "life." },
];

/**
 * Full-screen white "chapter opener": the headline assembles word-by-word as
 * the section scrolls, holding the limelight before the globe scene. Sticky
 * inner pins the content while the tall outer scrolls.
 */
export default function IntroChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const cue = useTransform(scrollYProgress, [0.8, 1], [1, 0]);
  const step = 0.74 / WORDS.length;

  if (reduce) {
    return (
      <section className="bg-white py-24 dark:bg-darkmode">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-[clamp(2.4rem,7vw,5.5rem)] font-black leading-[1.04] tracking-tight text-midnight_text dark:text-white">
            One globe. Every pathway to your new life.
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[240vh] bg-white dark:bg-darkmode">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] dark:bg-primary/15" />

        <p className="mb-8 text-[12px] font-semibold uppercase tracking-[0.32em] text-primary dark:text-[#7fb0ff]">
          The XIPHIAS journey
        </p>

        <h2 className="max-w-6xl text-center text-[clamp(2.4rem,7.5vw,6rem)] font-black leading-[1.02] tracking-tight text-midnight_text dark:text-white">
          {WORDS.map((w, i) => (
            <ScrubWord
              key={i}
              progress={scrollYProgress}
              start={i * step}
              end={i * step + step}
              className={w.accent ? "bg-gradient-to-r from-primary to-[#4f8cff] bg-clip-text text-transparent" : ""}
            >
              {w.t}
              {i < WORDS.length - 1 ? " " : ""}
            </ScrubWord>
          ))}
        </h2>

        <motion.div
          style={{ opacity: cue }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-light_grey dark:text-white/50"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Scroll to explore</span>
          <span className="h-9 w-[1px] bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
