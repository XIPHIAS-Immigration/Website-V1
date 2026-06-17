"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Reveal } from "@/components/motion";

const WORDS: { t: string; accent?: boolean }[] = [
  { t: "One" },
  { t: "globe." },
  { t: "Every" },
  { t: "pathway", accent: true },
  { t: "to your" },
  { t: "new", accent: true },
  { t: "life." },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.085, delayChildren: 0.12 } },
};

const word: Variants = {
  hidden: { y: "115%", opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Full-screen "chapter opener" that auto-animates the moment it enters view —
 * the headline assembles word-by-word with accent words in gradient, then the
 * eyebrow + subtitle reveal. No scroll-scrubbing; the visitor doesn't have to
 * crawl through it.
 */
export default function IntroChapter() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-white px-6 py-24 text-center dark:bg-darkmode">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-[58vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[130px] dark:bg-primary/15" />

      <Reveal>
        <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-primary dark:text-[#7fb0ff]">
          The XIPHIAS journey
        </p>
      </Reveal>

      <h2 className="mt-7 max-w-6xl text-[clamp(2.4rem,7.2vw,5.6rem)] font-black leading-[1.04] tracking-tight text-midnight_text dark:text-white">
        {reduce ? (
          "One globe. Every pathway to your new life."
        ) : (
          <motion.span
            style={{ display: "inline-block" }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={container}
            aria-label="One globe. Every pathway to your new life."
          >
            {WORDS.map((w, i) => (
              <Fragment key={i}>
                <span aria-hidden className="inline-block overflow-hidden align-bottom">
                  <motion.span
                    variants={word}
                    className={
                      w.accent
                        ? "inline-block bg-gradient-to-r from-primary to-[#4f8cff] bg-clip-text text-transparent"
                        : "inline-block"
                    }
                  >
                    {w.t}
                  </motion.span>
                </span>
                {i < WORDS.length - 1 ? " " : null}
              </Fragment>
            ))}
          </motion.span>
        )}
      </h2>

      <Reveal delay={0.5}>
        <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-relaxed text-light_grey dark:text-white/65">
          Residency, citizenship, skilled and corporate routes across 50+ countries — explored on one interactive
          globe, guided by XIPHIAS advisors.
        </p>
      </Reveal>

      <Reveal delay={0.7}>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-[12.5px] font-semibold text-primary dark:border-primary/40 dark:bg-primary/10 dark:text-[#7fb0ff]">
          Keep scrolling to explore the world
        </span>
      </Reveal>
    </section>
  );
}
