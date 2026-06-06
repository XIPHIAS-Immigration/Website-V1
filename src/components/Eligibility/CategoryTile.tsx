"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  title: string;
  subtitle?: string;
  /** Server-Action-safe function prop (Next rule-safe) */
  onClickAction: () => void;
  /** Optional leading icon (small inline SVG / React node) */
  icon?: React.ReactNode;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional loading state for async starts */
  loading?: boolean;

  /** Premium-style extras (optional) */
  badge?: string;
  features?: string[];
  align?: "left" | "center";
  className?: string;
};

const SPRING = { type: "spring", stiffness: 360, damping: 32, mass: 0.72 };

export function CategoryTile({
  title,
  subtitle,
  onClickAction,
  icon,
  disabled = false,
  loading = false,
  badge,
  features = [],
  align = "left",
  className = "",
}: Props) {
  const reduceMotion = useReducedMotion();
  const isInteractive = !disabled && !loading;
  const titleId = React.useId();
  const descId = React.useId();

  const alignClasses =
    align === "center" ? "text-center md:max-w-2xl mx-auto" : "text-left";

  return (
    <motion.button
      type="button"
      aria-labelledby={titleId}
      aria-describedby={descId}
      aria-busy={loading || undefined}
      aria-disabled={!isInteractive}
      disabled={!isInteractive}
      onClick={isInteractive ? onClickAction : undefined}
      whileHover={reduceMotion || !isInteractive ? undefined : { y: -2 }}
      whileTap={reduceMotion || !isInteractive ? undefined : { scale: 0.985 }}
      transition={reduceMotion ? undefined : SPRING}
      className={[
        // 👇 ensure ONE per row on mobile, then 2-up at sm, 1-up or 4-up as your grid dictates
        "col-span-full sm:col-span-2 md:col-span-1",
        // container
        "group relative w-full min-w-0 overflow-hidden rounded-3xl",
        // tighter mobile sizing so nothing crushes
        "p-3 sm:p-4 md:p-6 min-h-[116px] sm:min-h-[124px]",
        // premium bg
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        // copy
        "text-black dark:text-white",
        // elevation + focus
        "shadow-sm hover:shadow-md transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
        disabled || loading ? "opacity-60 cursor-not-allowed hover:shadow-sm" : "",
        className,
      ].join(" ")}
      data-state={loading ? "loading" : isInteractive ? "ready" : "disabled"}
    >
      {/* Decorative bg — keep grid, hide heavy glows on phones */}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        <span className="hidden md:block absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <span className="hidden md:block absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <span className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <span className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </span>
      </span>

      {/* hairline accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-blue-600 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />

      <div className={`relative ${alignClasses}`}>
        <div className="flex items-start gap-3 sm:gap-4">
          {/* hide icon on xs to free space */}
          {icon ? (
            <span className="mt-0.5 hidden sm:inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ring-1 ring-blue-200/60 dark:ring-blue-800/60 bg-white/70 dark:bg-white/5">
              {icon}
            </span>
          ) : null}

          <div className="min-w-0 flex-1">
            {badge ? (
              <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] sm:text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                <Dot className="mr-1.5" />
                {badge}
              </span>
            ) : null}

            {/* Title + launcher (no wrap conflicts) */}
            <div className="mt-1.5 sm:mt-2 flex items-center gap-2 min-w-0">
              <h3
                id={titleId}
                className="min-w-0 flex-1 truncate text-[15px] sm:text-base md:text-lg font-semibold leading-tight"
              >
                {title}
              </h3>

              {!loading ? (
                <span
                  aria-hidden
                  className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 ring-1 ring-blue-200 transition group-hover:translate-x-0.5 dark:bg-white/5 dark:ring-blue-800"
                >
                  <ArrowRight />
                </span>
              ) : (
                <span
                  role="status"
                  aria-live="polite"
                  className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 ring-1 ring-blue-200 dark:bg-white/5 dark:ring-blue-800"
                >
                  <Spinner />
                  <span className="sr-only">Loading</span>
                </span>
              )}
            </div>

            {/* Compact subtitle for phones */}
            <p
              id={descId}
              className="mt-1 text-[12px] sm:text-sm leading-snug line-clamp-3 break-words"
            >
              {subtitle ?? `Check your eligibility for ${title} pathways in minutes.`}
            </p>

            {/* Chips only on md+ to keep list compact on phones */}
            {features.length ? (
              <ul className="mt-3 hidden md:flex flex-wrap gap-2.5 text-xs">
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
          </div>
        </div>
      </div>

      {/* Focus overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl ring-0 ring-blue-600/0 group-focus-visible:ring-2"
      />
    </motion.button>
  );
}

/* ---------- tiny inline icons ---------- */

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
function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-current" strokeWidth="3" opacity="0.25" />
      <path className="fill-current" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  );
}
function Dot({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`} />
  );
}
