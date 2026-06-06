import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

type Props = {
  title?: string;
  subtitle?: string;
  primaryHref?: string;
  primaryText?: string;
  secondaryHref?: string;
  secondaryText?: string;
  className?: string;
  /** Optional pill above the title, e.g. "Free Tool" */
  badge?: string;
  /** Optional feature chips under the subtitle */
  features?: string[];
  /** Text alignment on larger screens */
  align?: "left" | "center";
};

export default function EligibilityHero({
  title = "Free Immigration Eligibility Check",
  subtitle = "Interactive. 2–4 minutes. Instant results + personalized PDF.",
  primaryHref = "#start",
  primaryText = "Start Eligibility Check",
  secondaryHref = "/contact",
  secondaryText = "Get free Consultation",
  className = "",
  badge = "Free Tool",
  features = ["2–4 minutes", "Instant result + PDF", "No sign-up"],
  align = "left",
}: Props) {
  const isPdf =
    typeof secondaryHref === "string" && secondaryHref.endsWith(".pdf");
  const heroId = "eligibility-hero-title";

  const alignClasses =
    align === "center" ? "text-center md:max-w-3xl mx-auto" : "text-left";

  return (
    <>
      <section
        aria-labelledby={heroId}
        className={[
          // Base container
          "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
          // Light theme (default) — primary blues
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
          // Dark theme
          "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
          "text-black dark:text-white",
          className,
        ].join(" ")}
      >
        {/* Decorative background accents (subtle, non-intrusive) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* soft glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          {/* faint grid */}
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        <div className={`relative ${alignClasses}`}>
          {/* Badge / Eyebrow */}
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
              <Dot className="mr-1.5" />
              {badge}
            </span>
          ) : null}

          {/* Title */}
          <h1
            id={heroId}
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
          >
            {title}
          </h1>

          {/* Subtitle (pure black/white) */}
          <p className="mt-3 text-[15px] leading-7 md:text-base">
            {subtitle}
          </p>

          {/* Feature chips */}
          {features?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
              {features.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800"
                >
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* CTAs — 2-up on mobile, flex on md+ */}
          <div
            className={`mt-6 ${align === "center" ? "md:flex md:justify-center" : "md:flex"} md:items-center md:gap-3`}
          >
            <div className="grid grid-cols-2 gap-2 sm:auto-cols-max sm:grid-flow-col">
              <Link
                href={primaryHref}
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
                aria-label={primaryText}
              >
                {primaryText}
                <ArrowRight />
              </Link>

              {isPdf ? (
                <a
                  href={secondaryHref}
                  download
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
                  aria-label={secondaryText}
                >
                  <Download />
                  {secondaryText}
                </a>
              ) : (
                <Link
                  href={secondaryHref}
                  prefetch={false}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-blue-700 ring-1 ring-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20 transition"
                  aria-label={secondaryText}
                >
                  <Open />
                  {secondaryText}
                </Link>
              )}
            </div>

            {/* Micro reassurance (still pure black/white using opacity) */}
            <span className="block md:ml-2 md:mt-0 mt-2 text-xs text-black/70 dark:text-white/70">
              No sign-up · Instant result · Free
            </span>
          </div>
        </div>
      </section>

      {/* Optional breadcrumb below the hero */}
      <div className="mt-3">
        <Breadcrumb />
      </div>
    </>
  );
}

/* ---------- tiny inline icons (no extra deps) ---------- */

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-blue-600 dark:fill-blue-400">
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
function Download() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M12 3.75a.75.75 0 0 1 .75.75v8.19l2.72-2.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L6.97 11.03a.75.75 0 0 1 1.06-1.06l2.72 2.72V4.5A.75.75 0 0 1 12 3.75zM4.5 18a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2a.75.75 0 0 1 1.5 0v2A3 3 0 0 1 18 21H6a3 3 0 0 1-3-3v-2a.75.75 0 0 1 1.5 0v2z"
      />
    </svg>
  );
}
function Open() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 0 0 2h3.586l-7.293 7.293a1 1 0 0 0 1.414 1.414L19 6.414V10a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-6z"
      />
      <path
        fill="currentColor"
        d="M5 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-4a1 1 0 1 0-2 0v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h4a1 1 0 1 0 0-2H5z"
      />
    </svg>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`} />
  );
}
