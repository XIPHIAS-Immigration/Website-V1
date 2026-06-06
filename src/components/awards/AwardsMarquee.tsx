"use client";

import React from "react";
import Link from "next/link";
import { MiniAwardCard } from "./MiniAwardCard";
import type { Award } from "./awards.data";

type Props = {
  items: Award[];
  hrefAll?: string;
  className?: string;
  speed?: number;    // seconds per full loop
  limit?: number;
};

export function AwardsMarquee({
  items,
  hrefAll = "/awards",
  className = "mx-auto max-w-screen-2xl px-4 py-5",
  speed = 80,       // slower default
  limit,
}: Props) {
  const list = limit ? items.slice(0, limit) : items;

  return (
    <section className={className}>

      {/* Header (card-style, keeps your structure & CTA) */}
<div className="mb-6 md:mb-8">
  <div className="relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-4 sm:p-5 md:p-6 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/10">
    {/* soft background accents (clipped inside) */}
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
      <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
      <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(70%_70%_at_10%_10%,black,transparent_75%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
      </div>
    </div>

    {/* content: responsive flex with title + CTA */}
    <div className="relative flex flex-wrap items-center justify-between gap-3">
      <h2
        id="insights-top6-title"
        className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white break-words"
      >
        Awards & Recognition
      </h2>

      <div className="shrink-0">
        <Link
          href={hrefAll}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 dark:border-slate-600/60 bg-white/70 dark:bg-slate-800/70 px-3.5 py-2 text-sm font-medium text-slate-900 dark:text-slate-50 shadow-sm hover:bg-white/90 dark:hover:bg-slate-800/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-300 transition"
        >
          View all
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  </div>
</div>

      <div className="relative overflow-hidden">
        <div
          className="flex w-max gap-3 md:gap-4 animate-marquee"
          style={{ ["--speed" as any]: `${speed}s` }}
        >
          {[...list, ...list].map((a, i) => (
            <MiniAwardCard key={`${a.id}-${i}`} award={a} />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent dark:from-slate-950/80" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent dark:from-slate-950/80" />
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee var(--speed) linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .animate-marquee { animation: none; } }
      `}</style>
    </section>
  );
}