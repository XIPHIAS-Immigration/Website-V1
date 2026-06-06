// components/about/OutcomesHNIs.tsx
import React from "react";
import Link from "next/link";

type Outcome = {
  icon: React.FC<any>;
  title: string;
  text: string;
  points: string[];
};

const outcomes: Outcome[] = [
  {
    icon: Compass,
    title: "Global Mobility & Optionality",
    text:
      "Second residency/citizenship for visa-free travel, location flexibility and geopolitical resilience.",
    points: [
      "Multi-jurisdiction travel access",
      "Contingency domicile options",
      "Low-friction re-entry rules",
    ],
  },
  {
    icon: Vault,
    title: "Wealth Preservation",
    text:
      "Tax-aware structures and diversification via compliant investment routes in stable jurisdictions.",
    points: [
      "Compliant holding structures",
      "Banking & custody readiness",
      "Treaty & exit planning",
    ],
  },
  {
    icon: Family,
    title: "Family & Education",
    text:
      "Access to premium education and healthcare; robust intergenerational planning and continuity.",
    points: [
      "Dependent inclusion strategies",
      "Top-tier schooling pathways",
      "Healthcare access mapping",
    ],
  },
  {
    icon: BriefcaseGlobe,
    title: "Business Expansion",
    text:
      "Faster market entry, HQ relocation and global hiring through compliant corporate mobility.",
    points: [
      "Founder/C-suite mobility tracks",
      "Entity & payroll alignment",
      "Cross-border hiring playbooks",
    ],
  },
];

export default function OutcomesHNIs() {
  const titleId = "outcomes-hni-title";

  return (
    <section
      id="outcomes-hnis"
      className="py-6 md:py-6"
      aria-labelledby={titleId}
    >
      {/* container aligned with hero & hardened against sideways scroll */}
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">
        {/* gradient card wrapper (hero aesthetic) */}
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
              Built for HNIs
            </span>
            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px] break-words"
            >
              Outcomes That Matter
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-zinc-700 dark:text-zinc-300">
              Advisory shaped by investor priorities — mobility, preservation, family protection and
              expansion. Delivered through licensed pathways and white-glove case handling.
            </p>
          </header>

          {/* outcomes grid */}
          <ul className="relative grid gap-4 sm:grid-cols-2">
            {outcomes.map(({ icon: Icon, title, text, points }) => (
              <li key={title} className="min-w-0">
                <article
                  className={[
                    "h-full rounded-2xl p-5",
                    "bg-white/90 ring-1 ring-blue-100/70 backdrop-blur",
                    "transition hover:-translate-y-0.5 hover:shadow-md",
                    "dark:bg-white/5 dark:ring-blue-900/40",
                  ].join(" ")}
                  aria-label={title}
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-black/30">
                      <Icon />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-tight break-words">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 break-words">
                        {text}
                      </p>

                      <ul className="mt-3 space-y-2">
                        {points.map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                          >
                            <Check className="mt-[3px]" />
                            <span className="break-words">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* private client CTA bar (subtle, on-brand) */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-4 text-sm ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-medium">Private Client Desk</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Discreet eligibility scouting, document readiness and investment mapping for HNIs.
                  <span className="ml-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    *No guarantees. Eligibility &amp; rules apply.
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/personal-booking"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-white ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label="Book a paid expert consultation"
                >
                  Book Paid Expert
                  <ArrowRight />
                </Link>
                <Link
                  href="/insights"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                  aria-label="See the latest insights"
                >
                  Latest Insights
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* icons */
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}
function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-3.5 w-3.5 shrink-0 fill-blue-600 dark:fill-blue-400 ${className}`}
    >
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function Compass() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m14.5 9.5-3.5 1L10 14l3.5-1 1-3.5z" />
      <path d="M8 16l3-7 5-2" />
    </svg>
  );
}
function Vault() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M7 12h2M12 7v2M17 12h-2M12 17v-2" />
    </svg>
  );
}
function Family() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <circle cx="8" cy="8" r="3" />
      <circle cx="16.5" cy="9.5" r="2.5" />
      <path d="M3 19a5 5 0 0 1 10 0M13 19c.2-2.2 1.8-4 3.8-4 2.1 0 3.8 1.8 3.8 4" />
    </svg>
  );
}
function BriefcaseGlobe() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 12h18" />
      <circle cx="18" cy="16" r="3" />
      <path d="M18 13c1 1.3 1 4.7 0 6M18 13c-1 1.3-1 4.7 0 6M15.5 16h5" />
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