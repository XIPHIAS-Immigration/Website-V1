"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  baseColor?: string;
  shineColor?: string;
  /** Seconds per sweep. */
  speed?: number;
};

/** Text with a continuous light sweep (clipped gradient). */
export default function ShinyText({
  children,
  className,
  baseColor = "#9fb3d1",
  shineColor = "#ffffff",
  speed = 3.6,
}: Props) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(110deg, ${baseColor} 35%, ${shineColor} 50%, ${baseColor} 65%)`,
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: `xg-shine ${speed}s linear infinite`,
      }}
    >
      {children}
    </span>
  );
}
