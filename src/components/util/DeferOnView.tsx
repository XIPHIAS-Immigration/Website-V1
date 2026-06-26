"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Reserved height before the section mounts — keeps layout stable (no CLS). */
  minHeight?: string;
  /** How far ahead of the viewport to start mounting. */
  rootMargin?: string;
  className?: string;
};

/**
 * Mounts its children only when the placeholder nears the viewport, so heavy
 * below-the-fold client sections don't hydrate (or load their JS) on initial
 * page load. Drastically cuts Total Blocking Time / speeds up first paint on
 * slow mobile. A reserved min-height avoids layout shift; once shown it stays.
 */
export default function DeferOnView({
  children,
  minHeight = "560px",
  rootMargin = "700px",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref} className={className} style={shown ? undefined : { minHeight }}>
      {shown ? children : null}
    </div>
  );
}
