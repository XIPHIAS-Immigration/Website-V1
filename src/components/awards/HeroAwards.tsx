import React from "react";
import Link from "next/link";

export function HeroAwards() {
  return (
    <section
      aria-labelledby="hero-awards"
      className={[
        "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10 ring-1",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-blue-100/80 text-slate-900",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40 dark:text-white",
      ].join(" ")}
    >
      {/* soft glows + faint grid (static) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      <div className="relative">
        <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
          Recognition
        </span>

        <h1
          id="hero-awards"
          className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight leading-tight"
        >
          Awards &amp; Recognition
        </h1>

        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
          Independent publications have highlighted our innovation, industry
          leadership, and client-first execution.
        </p>

        {/* primary CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/personal-booking"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Calendar />
            Expert consultation
          </Link>

          <Link
            href="/contact"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
          >
            Contact
            <Arrow />
          </Link>
        </div>

        {/* quick links row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/citizenship"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Layers />
            Citizenship
          </Link>
          <Link
            href="/residency"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Layers />
            residency
          </Link>
          <Link
            href="/corporate"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Layers />
            Corporate
          </Link>
          <Link
            href="/skilled"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Layers />
            Skilled
          </Link>
          <Link
            href="/insights"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Lightbulb />
            Latest Insights
          </Link>
          <Link
            href="/about"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
          >
            <Info />
            About us
          </Link>
        </div>
      </div>
    </section>
  );
}

/* --- tiny inline icons (no extra deps) --- */

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function Calendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zm13 7H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9z"
      />
    </svg>
  );
}
function Layers() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2l9 5-9 5-9-5 9-5zm0 8l9 5-9 5-9-5 9-5zm-8.2 3.8l8.2 4.6 8.2-4.6"
      />
    </svg>
  );
}
function Lightbulb() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M9 21h6a1 1 0 0 0 1-1v-1H8v1a1 1 0 0 0 1 1zm9-11a6 6 0 1 0-12 0c0 2.1 1.1 3.6 2.3 4.7.5.5.7 1.1.7 1.8V17h6v-.5c0-.7.2-1.3.7-1.8 1.2-1.1 2.3-2.6 2.3-4.7z"
      />
    </svg>
  );
}
function Info() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      />
    </svg>
  );
}