"use client";

// src/components/Xia/ConciergeOrb.tsx
// -----------------------------------------------------------------------------
// The XIA mark.
//
// This used to be the XIPHIAS bird, traced from the logo. It read as a logo,
// because that is what it is — a company mark doing duty as an assistant, which
// made XIA look like a banner rather than a thing that answers you.
//
// So the bird went back to being the logo and XIA got its own mark: a navigator
// star inside two counter-rotating rings. It is on theme without being literal
// — this is a business about deciding which direction to go — and it is sharp
// enough to read at 48px in a header and at 176px in the greeter.
//
// The public API has not changed. Every call site keeps working untouched:
//   <ConciergeOrb state="thinking" size={128} />
//
// Motion is CSS, driven by custom properties set per state, so there is no
// animation library to fail to load and reduced-motion is handled in one place
// (see the .xia-mark-* block in globals.css).
// -----------------------------------------------------------------------------

import { useId } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "resolved";

/** Per-state tempo. Thinking is visibly faster; resolved almost settles. */
const TEMPO: Record<OrbState, { spin: string; spinRev: string; orbit: string; pulse: string }> = {
  idle: { spin: "34s", spinRev: "52s", orbit: "16s", pulse: "5.4s" },
  listening: { spin: "22s", spinRev: "34s", orbit: "9s", pulse: "2.6s" },
  thinking: { spin: "7s", spinRev: "11s", orbit: "2.8s", pulse: "1.05s" },
  resolved: { spin: "70s", spinRev: "96s", orbit: "40s", pulse: "9s" },
};

/** Four-point navigator star. Straight edges — a sparkle reads as generic AI. */
const STAR = "M50 15 L56.8 43.2 L85 50 L56.8 56.8 L50 85 L43.2 56.8 L15 50 L43.2 43.2 Z";
/** Rotated 45° behind the first, which makes the pair read as a compass rose. */
const STAR_BEHIND = "M50 27 L54.6 45.4 L73 50 L54.6 54.6 L50 73 L45.4 54.6 L27 50 L45.4 45.4 Z";

export default function ConciergeOrb({
  state = "idle",
  size = 128,
  title,
}: {
  state?: OrbState;
  size?: number;
  /** Omit for decorative use; the mark is then hidden from screen readers. */
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const tempo = TEMPO[state];
  const spinOrigin = { transformOrigin: "50px 50px" } as const;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={
        {
          "--xia-spin": tempo.spin,
          "--xia-spin-rev": tempo.spinRev,
          "--xia-orbit": tempo.orbit,
          "--xia-pulse": tempo.pulse,
          overflow: "visible",
        } as React.CSSProperties
      }
    >
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0cb3b" stopOpacity="0.34" />
          <stop offset="52%" stopColor="#e1b923" stopOpacity="0.11" />
          <stop offset="100%" stopColor="#e1b923" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-star`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor="#f7dc7a" />
          <stop offset="100%" stopColor="#d9a915" />
        </linearGradient>
      </defs>

      {/* Ambient light, so the mark sits on dark grounds without a hard edge */}
      <circle cx="50" cy="50" r="50" fill={`url(#${uid}-glow)`} />

      {/* Fixed hairline horizon */}
      <circle
        cx="50"
        cy="50"
        r="46.5"
        fill="none"
        stroke="#e1b923"
        strokeOpacity="0.26"
        strokeWidth="0.7"
      />

      {/* Outer ticked ring — the one that visibly speeds up when thinking */}
      <g className="xia-mark-spin" style={spinOrigin}>
        <circle
          cx="50"
          cy="50"
          r="39.5"
          fill="none"
          stroke="#e1b923"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="1.6 7.4"
          strokeLinecap="round"
        />
      </g>

      {/* Inner ring, counter-rotating, so the two never look like one object */}
      <g className="xia-mark-spin xia-mark-spin--rev" style={spinOrigin}>
        <circle
          cx="50"
          cy="50"
          r="31"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.17"
          strokeWidth="0.8"
          strokeDasharray="15 11"
        />
      </g>

      {/* A single node travelling the horizon — reads as work in progress */}
      <g className="xia-mark-orbit" style={spinOrigin}>
        <circle cx="50" cy="10.5" r="2.3" fill="#f0cb3b" />
      </g>

      {/* Compass rose: quiet star behind, bright star in front */}
      <path
        d={STAR_BEHIND}
        fill={`url(#${uid}-star)`}
        opacity="0.42"
        transform="rotate(45 50 50)"
      />
      <path
        d={STAR}
        fill={`url(#${uid}-star)`}
        className="xia-mark-pulse"
        style={spinOrigin}
      />

      <circle cx="50" cy="50" r="2.5" fill="#ffffff" opacity="0.92" />
    </svg>
  );
}
