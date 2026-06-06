// components/about/Credibility.tsx
import React from "react";
import { Awards } from "@/components/awards";

type Brand = { name: string; abbr?: string; color?: string };

// Subtle regulators (mono)
const REGULATORS: Brand[] = [
  { name: "ICCRC", abbr: "IC" },
  { name: "MARA", abbr: "MA" },
  { name: "IMC", abbr: "IM" },
  { name: "ISO", abbr: "ISO" },
];

// Press with tiny color dot accent
const PRESS: Brand[] = [
  { name: "NDTV", color: "#7C3AED" },
  { name: "The Times of India", abbr: "TOI", color: "#E11D48" },
  { name: "Economic Times", abbr: "ET", color: "#C0262D" },
  { name: "Forbes", color: "#111827" },
  { name: "CNBC TV18", color: "#2563EB" },
  { name: "Business Standard", color: "#7F1D1D" },
  { name: "The Hindu", color: "#1E40AF" },
  { name: "Mint", color: "#EA580C" },
  { name: "Gulf News", color: "#0EA5E9" },
  { name: "Khaleej Times", color: "#0EA5E9" },
];

export default function Credibility() {
  const titleId = "credibility-title";

  return (
    <section
      id="credibility"
      aria-labelledby={titleId}
      className="py-6 md:py-6"
    >
      {/* container aligned with hero + overflow safety */}
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">
        {/* gradient, ringed wrapper (hero aesthetic) */}
        <div
          className={[
            "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
            "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
            "ring-1 ring-blue-100/80 shadow-sm",
            "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
            "text-black dark:text-white",
          ].join(" ")}
        >
          {/* soft background accents (clipped) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="hidden sm:block absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="hidden sm:block absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
            <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          </div>

          {/* header */}
          <header className="relative mb-6 md:mb-8 text-center">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
              <Dot className="mr-1.5" />
              Recognized &amp; Featured
            </span>
            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px]"
            >
              Credibility Markers
            </h2>
            <p className="mt-2 max-w-3xl mx-auto text-sm text-zinc-700 dark:text-zinc-300">
              Memberships, press mentions and awards across key markets.
            </p>
          </header>

          {/* MEMBERSHIPS — centered; swipe on small screens */}
          <RowTitle>Memberships &amp; Licenses</RowTitle>
          <ScrollStrip ariaLabel="Memberships & Licenses">
            <ul className="inline-flex items-center gap-3 snap-x snap-mandatory">
              {REGULATORS.map((b) => (
                <li key={b.name} className="shrink-0 snap-start">
                  <RegChip name={b.name} abbr={b.abbr ?? initials(b.name)} />
                </li>
              ))}
            </ul>
          </ScrollStrip>

          <Divider />

          {/* PRESS — centered; swipe on small screens */}
          <RowTitle>Press Coverage</RowTitle>
          <ScrollStrip ariaLabel="Press Coverage">
            <ul className="inline-flex items-center gap-3 snap-x snap-mandatory">
              {PRESS.map((b) => (
                <li key={b.name} className="shrink-0 snap-start">
                  <PressChip name={b.name} color={b.color ?? "#999999"} />
                </li>
              ))}
            </ul>
          </ScrollStrip>

          <Divider />

          {/* AWARDS — uses shared Awards component */}
          <RowTitle>Awards &amp; Recognition</RowTitle>
          <div className="group relative overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-3 ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
            <Awards variant="preview" />
            {/* edge fades */}
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/95 to-transparent dark:from-[#0A0B0F]/80"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white/95 to-transparent dark:from-[#0A0B0F]/80"
              aria-hidden="true"
            />
          </div>

          {/* tiny note */}
          <p className="relative mt-3 text-center text-[11px] text-zinc-600 dark:text-zinc-400">
            *Logos/marks are for identification only. No endorsement is implied.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- subcomponents ---------- */
function RowTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </p>
  );
}
function Divider() {
  return <div className="my-5 border-t border-blue-100 dark:border-blue-900/40" />;
}

/** Centers when short; becomes horizontal swipe when overflowed. */
function ScrollStrip({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <div
        aria-label={ariaLabel}
        role="region"
        className="no-scrollbar overflow-x-auto overscroll-x-contain touch-pan-x -mx-3 px-3"
      >
        {/* Centers row when total width <= viewport */}
        <div className="mx-auto w-fit">{children}</div>
      </div>
      {/* gradient fades (appear when content scrolls) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white/95 to-transparent dark:from-[#0A0B0F]/80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/95 to-transparent dark:from-[#0A0B0F]/80"
        aria-hidden="true"
      />
    </div>
  );
}

/* Chips */
function RegChip({ name, abbr }: { name: string; abbr: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[12px] text-zinc-800 ring-1 ring-blue-100/70 backdrop-blur dark:bg-white/5 dark:text-zinc-200 dark:ring-blue-900/40">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-700 ring-1 ring-black/5 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10">
        {abbr}
      </span>
      <span className="whitespace-nowrap">{name}</span>
    </span>
  );
}
function PressChip({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[12px] text-zinc-800 ring-1 ring-blue-100/70 backdrop-blur dark:bg-white/5 dark:text-zinc-200 dark:ring-blue-900/40"
      title={name}
    >
      <span
        className="h-2 w-2 rounded-full ring-2 ring-white dark:ring-transparent"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{name}</span>
    </span>
  );
}

/* utils */
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1)
    return words[0].replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}