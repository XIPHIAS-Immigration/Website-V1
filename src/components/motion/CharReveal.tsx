"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
};

const container: Variants = {
  hidden: {},
  show: (d: number) => ({ transition: { staggerChildren: 0.022, delayChildren: d } }),
};

const char: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Character-by-character blur + rise reveal. Words are wrapped so they never
 * break mid-word across lines. Falls back to plain text under reduced motion.
 */
export default function CharReveal({ text, className, delay = 0, once = true }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const words = text.split(" ");

  return (
    <motion.span
      className={className}
      style={{ display: "inline" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.6 }}
      variants={container}
      custom={delay}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {Array.from(word).map((c, ci) => (
              <motion.span key={ci} variants={char} style={{ display: "inline-block" }}>
                {c}
              </motion.span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}
