"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type Props = {
  text: string | string[];
  className?: string;
  /** Typing speed in ms per character. */
  speed?: number;
  /** Pause in ms once a phrase is fully typed (only with multiple phrases). */
  pause?: number;
};

/**
 * Typewriter that types (and, with multiple phrases, deletes + cycles) once it
 * scrolls into view. Renders the first phrase statically under reduced motion.
 */
export default function TextType({ text, className, speed = 45, pause = 1600 }: Props) {
  const phrases = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);
  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();

  const [sub, setSub] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    const list = phrasesRef.current;
    const current = list[idx % list.length];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && sub === current) {
      if (list.length > 1) timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && sub === "") {
      setDeleting(false);
      setIdx((i) => (i + 1) % list.length);
    } else {
      const next = current.slice(0, sub.length + (deleting ? -1 : 1));
      timer = setTimeout(() => setSub(next), deleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timer);
  }, [sub, deleting, idx, inView, reduce, speed, pause]);

  if (reduce) {
    return (
      <span ref={ref} className={className}>
        {phrases[0]}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {sub}
      <span
        aria-hidden
        className="ml-0.5 inline-block w-[2px] animate-pulse self-center bg-current align-middle"
        style={{ height: "1em" }}
      />
    </span>
  );
}
