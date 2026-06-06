// src/components/about/CaseStudies.tsx
import React from "react";
import Link from "next/link";

type CaseItem = {
  title: string;
  challenge: string;
  outcome: string;
};

const cases: CaseItem[] = [
  {
    title: "HNWI Family – Gulf to EU",
    challenge: "Time-bound relocation; school admissions for 2 kids.",
    outcome: "Secured EU residency in 6.5 months; education & housing set-up.",
  },
  {
    title: "Founder – Mobility & Tax",
    challenge: "Travel constraints & optimization for cross-border income.",
    outcome: "Residency + compliant structure; 120+ visa-free destinations.",
  },
  {
    title: "Enterprise – Talent Deployment",
    challenge: "Multi-country, multi-role deployments with compliance risk.",
    outcome: "Standardized corporate immigration playbook; on-schedule moves.",
  },
];

export default function CaseStudies() {
  const titleId = "about-case-studies-title";

  return (
    <section
      id="case-studies"
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
              Client Outcomes
            </span>

            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px] break-words"
            >
              Selected Case Highlights
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
              Anonymized summaries illustrating our approach and results. Detailed
              references on request.
            </p>
          </header>

          {/* cards */}
          <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <li key={c.title} className="min-w-0">
                <article
                  className={[
                    "h-full rounded-2xl p-5",
                    "bg-white/90 ring-1 ring-blue-100/70 backdrop-blur",
                    "transition hover:-translate-y-0.5 hover:shadow-md",
                    "dark:bg-white/5 dark:ring-blue-900/40",
                  ].join(" ")}
                >
                  <header className="flex items-start gap-3">
                    <span className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/30">
                      <CaseIcon />
                    </span>
                    <h3 className="text-base font-semibold leading-tight break-words">
                      {c.title}
                    </h3>
                  </header>

                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Target className="mt-[2px]" />
                      <dt className="font-medium">Challenge:</dt>
                      <dd className="ml-1 text-zinc-700 dark:text-zinc-300 break-words">
                        {c.challenge}
                      </dd>
                    </div>

                    <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                      <Check className="mt-[2px]" />
                      <dt className="font-medium">Outcome:</dt>
                      <dd className="ml-1 break-words">{c.outcome}</dd>
                    </div>
                  </dl>

                  {/* tiny meta row */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] font-medium ring-1 ring-zinc-200 dark:bg-black/30 dark:ring-white/10">
                      Anonymized
                    </span>
                    <span className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] font-medium ring-1 ring-zinc-200 dark:bg-black/30 dark:ring-white/10">
                      Private Client
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* subtle CTA bar to mirror hero’s tone */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-4 text-sm ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-medium">See how we work</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Review our methodology, governance and confidentiality standards
                  for private clients.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/personal-booking"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-white ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Book Paid Expert
                  <ArrowRight />
                </Link>
                <Link
                  href="/insights"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                >
                  Latest Insights
                </Link>
              </div>
            </div>
          </div>

          {/* disclaimer */}
          <p className="relative mt-3 text-[11px] text-zinc-600 dark:text-zinc-400">
            *Outcomes are specific to each client’s facts and jurisdictional rules. No
            guarantees. Eligibility &amp; rules apply.
          </p>
        </div>
      </div>
    </section>
  );
}

/* inline icons */
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}

function CaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </svg>
  );
}

function Target({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 text-zinc-600 dark:text-zinc-300 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M21 12h-3M12 21v-3M3 12h3" />
    </svg>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 fill-emerald-600 dark:fill-emerald-400 ${className}`}
    >
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}