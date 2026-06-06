// components/about/PrivateClientDesk.tsx
import React from "react";
import Link from "next/link";

export default function PrivateClientDesk() {
  const titleId = "private-client-desk-title";

  return (
    <section
      id="private-client-desk"
      className="py-6 md:py-6"
      aria-labelledby={titleId}
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
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="hidden sm:block absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="hidden sm:block absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
            <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
            </div>
          </div>

          {/* header */}
          <header className="relative mb-6 md:mb-8">
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
              <Dot className="mr-1.5" />
              Private Client Desk
            </span>
            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px] break-words"
            >
              Choose How You Engage
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
              Start with a no-obligation call or book a senior expert for a paid deep-dive strategy.
            </p>
          </header>

          {/* cards: side-by-side on >= sm */}
          <div className="relative grid gap-5 sm:grid-cols-2">
            {/* Free Discovery */}
            <div className="min-w-0 rounded-2xl bg-white/90 p-6 ring-1 ring-blue-100/70 backdrop-blur dark:bg-white/5 dark:ring-blue-900/40">
              <div className="flex items-start gap-3">
                <span className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/30">
                  <Phone />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight break-words">
                    Free Discovery Call
                  </h3>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    15–20 min · eligibility triage &amp; next steps.
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-2 text-sm">
                <Li>High-level fit assessment</Li>
                <Li>Program shortlist</Li>
                <Li>Documentation overview</Li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Chip>No obligation</Chip>
                <Chip>Private &amp; confidential</Chip>
              </div>

              <Link
                href="/contact"
                prefetch={false}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-label="Book a free discovery call"
              >
                Book Free Call
                <ArrowRight />
              </Link>
            </div>

            {/* Paid Expert */}
            <div className="min-w-0 rounded-2xl border border-blue-100/70 bg-blue-50/60 p-6 ring-1 ring-blue-100/70 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <span className="shrink-0 rounded-xl border border-blue-200 bg-white/70 p-2 ring-1 ring-white/60 dark:border-white/10 dark:bg-white/10 dark:ring-blue-900/40">
                  <Calendar />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-tight break-words">
                    Paid Expert Session
                  </h3>
                  <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                    45–60 min · senior advisor · program strategy &amp; structuring.
                  </p>
                </div>
              </div>

              <ul className="mt-3 space-y-2 text-sm text-zinc-800 dark:text-zinc-200">
                <Li>Tailored roadmap &amp; timelines</Li>
                <Li>Risk &amp; compliance review</Li>
                <Li>Investment route evaluation</Li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Chip>Priority scheduling</Chip>
                <Chip>White-glove handling</Chip>
              </div>

              <Link
                href="/personal-booking"
                prefetch={false}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                aria-label="Book a paid expert session"
              >
                Book Paid Session
                <ArrowRight />
              </Link>
            </div>
          </div>

          {/* quick compare strip */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-4 ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
            <p className="text-sm font-medium">What you’ll get</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Compare item="Eligibility signal" free paid />
              <Compare item="Preliminary program shortlist" free paid />
              <Compare item="Risk & compliance review" paid />
              <Compare item="Investment route analysis" paid />
            </div>
          </div>

          {/* tiny note */}
          <p className="relative mt-3 text-[11px] text-zinc-600 dark:text-zinc-400">
            *No guarantees. Eligibility &amp; rules apply. Pricing (if any) is shown at booking.
          </p>
        </div>
      </div>
    </section>
  );
}

/* tiny atoms */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
      {children}
    </span>
  );
}
function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-[3px]" />
      <span>{children}</span>
    </li>
  );
}
function Compare({ item, free, paid }: { item: string; free?: boolean; paid?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-700 ring-1 ring-blue-100/60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
      <span className="text-xs">{item}</span>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px]">
          <span className="hidden sm:inline">Free</span>
          {free ? <Tick /> : <Dash />}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px]">
          <span className="hidden sm:inline">Paid</span>
          {paid ? <Tick /> : <Dash />}
        </span>
      </div>
    </div>
  );
}

/* icons */
function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`} />;
}
function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-3.5 w-3.5 shrink-0 fill-blue-600 dark:fill-blue-400 ${className}`}>
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function Tick() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-emerald-600 dark:fill-emerald-400">
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function Dash() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-zinc-400 dark:fill-zinc-500">
      <rect x="4" y="9" width="12" height="2" rx="1" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="currentColor" d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z" />
    </svg>
  );
}
function Phone() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 5a2 2 0 0 1 2-2h2l2 4-2 2a12 12 0 0 0 6 6l2-2 4 2v2a2 2 0 0 1-2 2h-1C8.82 21 3 15.18 3 8V7a2 2 0 0 1 1-2z" />
    </svg>
  );
}
function Calendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}