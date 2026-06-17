"use client";

import { useMemo } from "react";
import type { GlobeMarker, GlobeTheme } from "./types";

type Props = {
  markers?: GlobeMarker[];
  theme?: GlobeTheme;
  className?: string;
};

// Centre of the orthographic projection (Afro-Eurasia-centric so most served
// markets are visible at once).
const LAT0 = 18;
const LNG0 = 32;
const D2R = Math.PI / 180;

/**
 * Static, animation-free globe used as the reduced-motion fallback and the
 * WebGL load skeleton. Renders visible markers via an orthographic projection.
 */
export default function GlobeFallback({ markers = [], theme = "dark", className }: Props) {
  const dots = useMemo(() => {
    const lat0 = LAT0 * D2R;
    const lng0 = LNG0 * D2R;
    return markers
      .map((m) => {
        const lat = m.lat * D2R;
        const dl = m.lng * D2R - lng0;
        const cosc = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(dl);
        if (cosc <= 0.04) return null; // back hemisphere
        const x = Math.cos(lat) * Math.sin(dl);
        const y = Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(dl);
        return { code: m.code, x, y: -y, color: m.color };
      })
      .filter(Boolean) as { code: string; x: number; y: number; color?: string }[];
  }, [markers]);

  const light = theme === "light";
  const sphereFrom = light ? "#2a4d96" : "#0c1d3f";
  const sphereTo = light ? "#0f2150" : "#05080f";
  const grid = light ? "rgba(155,188,240,0.5)" : "rgba(79,126,201,0.45)";
  const marker = "#f3c945";

  return (
    <div className={className}>
      <div className="grid h-full w-full place-items-center">
        <svg viewBox="-1.15 -1.15 2.3 2.3" className="h-full max-h-[460px] w-auto" aria-hidden="true">
          <defs>
            <radialGradient id="xg-sphere" cx="38%" cy="34%" r="75%">
              <stop offset="0%" stopColor={sphereFrom} />
              <stop offset="100%" stopColor={sphereTo} />
            </radialGradient>
            <radialGradient id="xg-atmo" cx="50%" cy="50%" r="50%">
              <stop offset="78%" stopColor="rgba(47,111,208,0)" />
              <stop offset="100%" stopColor={light ? "rgba(111,159,230,0.35)" : "rgba(47,111,208,0.4)"} />
            </radialGradient>
          </defs>

          <circle cx="0" cy="0" r="1.12" fill="url(#xg-atmo)" />
          <circle cx="0" cy="0" r="1" fill="url(#xg-sphere)" />

          {/* graticule */}
          <g fill="none" stroke={grid} strokeWidth="0.006">
            <circle cx="0" cy="0" r="1" />
            <ellipse cx="0" cy="0" rx="0.55" ry="1" />
            <ellipse cx="0" cy="0" rx="0.85" ry="1" />
            <line x1="0" y1="-1" x2="0" y2="1" />
            <ellipse cx="0" cy="0" rx="1" ry="0.2" />
            <ellipse cx="0" cy="0" rx="0.92" ry="0.56" />
            <line x1="-1" y1="0" x2="1" y2="0" />
          </g>

          {/* destination markers */}
          <g>
            {dots.map((d) => (
              <g key={d.code}>
                <circle cx={d.x} cy={d.y} r="0.045" fill={d.color ?? marker} opacity="0.28" />
                <circle cx={d.x} cy={d.y} r="0.02" fill={d.color ?? marker} />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
