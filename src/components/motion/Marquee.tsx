"use client";

import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
};

/**
 * Seamless infinite marquee (two duplicated tracks). Reuses the global
 * `.animate-marquee-rtl` utility, which already pauses on hover and stops under
 * reduced motion.
 */
export default function Marquee({ children, className, duration = 30, reverse = false }: Props) {
  const trackStyle = {
    "--marquee-duration": `${duration}s`,
    animationDirection: reverse ? "reverse" : "normal",
  } as CSSProperties;

  return (
    <div className={`group relative flex w-full overflow-hidden ${className ?? ""}`}>
      <div className="animate-marquee-rtl marquee-track flex shrink-0" style={trackStyle}>
        {children}
      </div>
      <div aria-hidden className="animate-marquee-rtl marquee-track flex shrink-0" style={trackStyle}>
        {children}
      </div>
    </div>
  );
}
