// components/about/WhyUs.tsx
import React from "react";
import Link from "next/link";

type Point = {
  icon: React.FC;
  title: string;
  text: string;
  bullets?: string[];
};

const points: Point[] = [
  {
    icon: ShieldCheck,
    title: "Licensed & Regulated",
    text: "Advisory aligned to CICC/ICCRC, MARA & IMC practices.",
    bullets: ["Rule-tracking & audit-ready files", "Partner-led review on priority cases"],
  },
  {
    icon: Search,
    title: "Investment-grade Vetting",
    text: "We evaluate routes like deals — risk, exit and timelines.",
    bullets: ["KYC/AML, PEP & SOF/SOW mapping", "Developer/fund background checks"],
  },
  {
    icon: FileCheck,
    title: "White-glove Documentation",
    text: "We prepare; you approve — with error-proofing built in.",
    bullets: ["Notarization/Apostille & translations", "Government forms, PCC guidance"],
  },
  {
    icon: Wallet,
    title: "Transparent Fees",
    text: "No surprises. Everything itemized and milestone-based.",
    bullets: ["Govt. fees at cost, receipted", "Escrow/trustee options on request"],
  },
  {
    icon: Lock,
    title: "HNI-grade Confidentiality",
    text: "Least-privilege access and encrypted vault for sensitive data.",
    bullets: ["NDAs on request", "Secure client portal with MFA"],
  },
  {
    icon: Globe,
    title: "On-ground Delivery",
    text: "Local partners for faster execution and post-landing support.",
    bullets: ["Attorneys, bankers, surveyors", "Move-in readiness & registrations"],
  },
];

export default function WhyUs() {
  const titleId = "why-xiphias-heading";

  return (
    <section
      id="why-us"
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
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-blue-700 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:text-blue-300 dark:ring-blue-800">
              Why XIPHIAS
            </span>
            <h2
              id={titleId}
              className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl lg:text-[32px]"
            >
              Built for HNIs & Enterprises
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Regulation-first advice, investment-grade diligence, and concierge execution — end to end.
            </p>
          </header>

          {/* premium cards */}
          <ul role="list" className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {points.map(({ icon: Icon, title, text, bullets }) => (
              <li key={title} className="list-none min-w-0">
                <article
                  className={[
                    "h-full rounded-2xl p-6",
                    "bg-white/90 ring-1 ring-blue-100/70 backdrop-blur",
                    "transition hover:-translate-y-0.5 hover:shadow-md",
                    "dark:bg-white/5 dark:ring-blue-900/40",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 ring-1 ring-black/[0.02] dark:border-white/10 dark:bg-black/30"
                      aria-hidden
                    >
                      <Icon />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold break-words">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300 break-words">
                        {text}
                      </p>

                      {bullets?.length ? (
                        <ul className="mt-3 space-y-1.5 text-[13px] leading-5 text-zinc-700 dark:text-zinc-300">
                          {bullets.map((b) => (
                            <li key={b} className="flex items-start gap-2">
                              <CheckTiny />
                              <span className="min-w-0 break-words">{b}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          {/* CTA row (subtle, on-brand) */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-100/70 bg-white/90 p-4 ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-medium">See how we implement this</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/personal-booking"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm text-white ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Book Paid Expert
                  <ArrowRight />
                </Link>
                <Link
                  href="/contact"
                  prefetch={false}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 dark:bg:white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
                >
                  Get Free Consultation
                </Link>
              </div>
            </div>
          </div>

          {/* reassurance */}
          <p className="relative mt-3 text-[12px] text-zinc-600 dark:text-zinc-400">
            *Outcomes depend on eligibility and program rules. No guarantees.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- compact inline icons (consistent with your design) ---------- */
function ShieldCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M12 3l7 3v5c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
      <path d="M9.5 12.5l1.8 1.8 3.2-3.6" />
    </svg>
  );
}
function Search() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
function FileCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 14l2 2 4-5" />
    </svg>
  );
}
function Wallet() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M16 12h4" />
      <circle cx="16" cy="12" r="1" />
    </svg>
  );
}
function Lock() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function Globe() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-blue-600 dark:text-blue-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2c3 4 3 14 0 20M12 2c-3 4-3 14 0 20" />
    </svg>
  );
}
function CheckTiny() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-300"
      fill="currentColor"
      aria-hidden
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