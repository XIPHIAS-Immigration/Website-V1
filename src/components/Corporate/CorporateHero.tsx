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

  /** Optional extras */
  brochureHref?: string;
  brochureText?: string;
  eligibilityHref?: string;
  eligibilityText?: string;

  className?: string;
  /** Optional pill above the title */
  badge?: string;
  /** Optional feature chips under the subtitle */
  features?: string[];
  /** Text alignment on larger screens */
  align?: "left" | "center";
};

export default function CorporateHero({
  title = "Corporate Setup & Employment Visas",
  subtitle = "Form your company, enable sponsorship, and secure residence/work authorization — compare free zones, mainland routes, and investor/entrepreneur options.",
  primaryHref = "/personal-booking",
  primaryText = "Speak to an Advisor",
  secondaryHref = "/insights",
  secondaryText = "Read Insights",

  brochureHref = "/images/residency/xiphias-corporate-mobility.pdf",
  brochureText = "Download Brochure",
  eligibilityHref,
  eligibilityText = "Check Eligibility",

  className = "",
  badge = "Corporate",
  features = ["Free zone & mainland", "Employment visas", "Investor / Entrepreneur"],
  align = "left",
}: Props) {
  const isPdf =
    typeof secondaryHref === "string" && secondaryHref.endsWith(".pdf");
  const isBrochurePdf =
    typeof brochureHref === "string" && brochureHref.endsWith(".pdf");
  const heroId = "corporate-hero-title";

  const alignClasses =
    align === "center" ? "text-center md:max-w-3xl mx-auto" : "text-left";

  return (
    <>
      <section
        aria-labelledby={heroId}
        className={[
          "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
          // corporate palette → emerald/teal leaning
          "bg-gradient-to-br from-emerald-50 via-white to-teal-50 ring-1 ring-emerald-100/80",
          "dark:from-emerald-950/30 dark:via-transparent dark:to-teal-950/20 dark:ring-emerald-900/40",
          "text-black dark:text-white",
          className,
        ].join(" ")}
      >
        {/* Decorative background accents */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-700/10" />
          <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        <div className={`relative ${alignClasses}`}>
          {/* Badge / Eyebrow */}
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-emerald-200 backdrop-blur dark:bg-white/5 dark:ring-emerald-800">
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

          {/* Subtitle */}
          <p className="mt-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
            {subtitle}
          </p>

          {/* Feature chips */}
          {features?.length ? (
            <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
              {features.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-emerald-200 backdrop-blur dark:bg-white/5 dark:ring-emerald-800"
                >
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {/* CTAs */}
          <div
            className={`mt-6 flex flex-wrap items-center gap-3 ${
              align === "center" ? "justify-center" : ""
            }`}
          >
            <Link
              href={primaryHref}
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-emerald-700/20 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 active:bg-emerald-800 transition"
              aria-label={primaryText}
            >
              {primaryText}
              <ArrowRight />
            </Link>

            {isPdf ? (
              <a
                href={secondaryHref}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-white/5 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-950/20 transition"
                aria-label={secondaryText}
              >
                <Download />
                {secondaryText}
              </a>
            ) : (
              <Link
                href={secondaryHref}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-white/5 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-950/20 transition"
                aria-label={secondaryText}
              >
                <Open />
                {secondaryText}
              </Link>
            )}

            {/* Brochure (optional) */}
            {brochureHref
              ? isBrochurePdf ? (
                  <a
                    href={brochureHref}
                    download
                    className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-white/5 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-950/20 transition"
                    aria-label={brochureText}
                  >
                    <Download />
                    {brochureText}
                  </a>
                ) : (
                  <Link
                    href={brochureHref}
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-white/5 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-950/20 transition"
                    aria-label={brochureText}
                  >
                    <Open />
                    {brochureText}
                  </Link>
                )
              : null}

            {/* Check Eligibility (optional) */}
            {eligibilityHref ? (
              <Link
                href={eligibilityHref}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-white/5 dark:text-emerald-200 dark:ring-emerald-800/60 dark:hover:bg-emerald-950/20 transition"
                aria-label={eligibilityText}
              >
                <Open />
                {eligibilityText}
              </Link>
            ) : null}

            {/* Micro reassurance */}
            <span className="ml-0 md:ml-2 text-xs text-zinc-500 dark:text-zinc-400">
              No obligation · Response within 24 hours
            </span>
          </div>
        </div>
      </section>

      {/* Breadcrumb under hero for consistency with other pages */}
      <div className="mt-3">
        <Breadcrumb />
      </div>
    </>
  );
}

/* ---------- tiny inline icons (no extra deps) ---------- */

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 fill-emerald-600 dark:fill-emerald-400"
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
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 ${className}`}
    />
  );
}
