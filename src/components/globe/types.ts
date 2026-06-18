// Shared, three.js-free types so server components (e.g. globe data prep) can
// build marker/arc payloads without importing the WebGL bundle.

export type GlobeMarker = {
  /** ISO-2 code, used as a stable key + selection id. */
  code: string;
  lat: number;
  lng: number;
  label: string;
  /** 0–1 emphasis; scales dot size + glow. Defaults to ~0.5. */
  weight?: number;
  /** Optional hex color override (e.g. choropleth by score). */
  color?: string;
};

export type GlobeArc = {
  from: [number, number];
  to: [number, number];
  color?: string;
  /** How many flights travel this route (air-traffic density). Clamped 1–5; defaults to 1. */
  flights?: number;
};

export type GlobeTheme = "light" | "dark";
