"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  /** Seconds per full cycle. */
  speed?: number;
};

/** Animated multi-stop gradient clipped to the text. */
export default function GradientText({
  children,
  className,
  colors = ["#1c57b4", "#4f8cff", "#e1b923", "#1c57b4"],
  speed = 6,
}: Props) {
  return (
    <span
      className={className}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: `xg-gradient ${speed}s linear infinite`,
      }}
    >
      {children}
    </span>
  );
}
