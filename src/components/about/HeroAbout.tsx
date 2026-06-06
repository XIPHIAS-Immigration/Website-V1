// components/about/HeroAbout.tsx
import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

type Props = {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryText?: string;
  /** kept for API compatibility, but not rendered as a button */
  secondaryHref?: string;
  secondaryText?: string;
  className?: string;
  badge?: string;
  features?: string[];
  /** kept for API compatibility (defaults to left) */
  align?: "left" | "center";
};

export default function HeroAbout({
  title = "About XIPHIAS Immigration — Where Trust Meets Global Opportunity",
  subtitle = "Licensed, transparent and results-focused advisory for Residency, Citizenship, Corporate Mobility and Skilled Migration — trusted by HNIs and enterprises worldwide.",
  primaryHref = "/contact",
  primaryText = "Book a free Consultation",
  // secondary props intentionally not rendered to keep the flow focused
  secondaryHref,
  secondaryText,
  className = "",
  badge = "Private Client Service",
  features = ["Licensed & Regulated", "White-glove Case Handling", "HNI-grade Confidentiality"],
  align = "left",
}: Props) {
  const heroId = "hero-about-title";
  const alignClasses =
    align === "center" ? "text-center md:max-w-3xl mx-auto" : "text-left md:max-w-3xl";

  return (
    <>
      {/* page container */}
      <div className="container mx-auto lg:max-w-screen-2xl px-4 sm:px-6 lg:px-8 overflow-x-clip">
        {/* CARD hero — NOT full width */}
        <section
          id="about-hero"
          aria-labelledby={heroId}
          className={[
            "relative mx-auto mt-4 overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10 shadow-sm",
            "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
            "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
            "text-black dark:text-white",
            className,
          ].join(" ")}
        >
          {/* soft background accents (clipped by parent) */}
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

          <div className="relative">
            <div className="grid items-start gap-8 lg:grid-cols-12">
              {/* LEFT column */}
              <div className="lg:col-span-7 min-w-0">
                {badge && (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                    <Dot className="mr-1.5" />
                    {badge}
                  </span>
                )}

                <div className={alignClasses}>
                  <h1
                    id={heroId}
                    className="mt-3 break-words text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
                  >
                    {title}
                  </h1>

                  <p className="mt-3 break-words text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
                    {subtitle}
                  </p>

                  {features?.length ? (
                    <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800"
                        >
                          <Check />
                          <span className="break-words">{f}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {/* Single primary CTA (direct flow) */}
                  <div
                    className={[
                      "mt-6 flex flex-wrap items-center gap-3 min-w-0",
                      align === "center" ? "justify-center" : "",
                    ].join(" ")}
                  >
                    <Link
                      href={primaryHref}
                      prefetch={false}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800"
                      aria-label={primaryText}
                    >
                      {primaryText}
                      <ArrowRight />
                    </Link>

                    <span className="ml-0 md:ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      No obligation · Response within 24 hours
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT column — simplified stat card (no extra CTAs) */}
              <aside
                className="lg:col-span-5"
                aria-label="Firm highlights and trust metrics"
              >
                <div className="mx-auto w-full max-w-md rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm ring-1 ring-blue-100/70 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:ring-blue-900/40">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <Stat label="Years" value="17+" />
                    <Stat label="Countries" value="50+" />
                    <Stat label="Programs" value="100+" />
                  </div>

                  <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center text-sm dark:border-white/10 dark:bg:black/30 dark:bg-black/30">
                    <p className="font-semibold">
                      Strong approval track record on eligible, well-prepared files*
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                      *No guarantees. Eligibility &amp; rules apply.
                    </p>
                  </div>

                  <p className="mt-3 text-center text-[11px] text-zinc-600 dark:text-zinc-400">
                    ICCRC • MARA • IMC aligned practices
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* breadcrumb under the card */}
        <div className="mt-3">
          <Breadcrumb />
        </div>
      </div>
    </>
  );
}

/* icons */
function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 fill-blue-600 dark:fill-blue-400"
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
function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
    />
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-black/30">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );
}