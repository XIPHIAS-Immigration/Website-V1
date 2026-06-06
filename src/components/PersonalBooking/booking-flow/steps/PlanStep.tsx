"use client";

import React, { useId } from "react";

type Props = {
  value: "free" | "paid";
  durationMin: number;
  priceCents: number;
  /** Next.js 15-safe callback naming */
  onChangePlanAction: (plan: "free" | "paid") => void;
  onNextAction: () => void;
};

/**
 * UX highlights:
 * - High-contrast text (no washed-out grays) for light & dark themes
 * - Radio-card with full keyboard support (Enter/Space + Arrow keys)
 * - Larger tap targets, clear focus states, subtle motion (respects reduced-motion)
 * - Mobile-friendly footer (button stretches on small screens)
 */
export default function PlanStep({
  value,
  durationMin,
  priceCents,
  onChangePlanAction,
  onNextAction,
}: Props) {
  const isPaid = value === "paid";
  const displayPrice = isPaid ? `₹${(priceCents / 100).toLocaleString("en-IN")}` : "₹0";
  const displayDur = `${durationMin}m`;

  // Arrow-key navigation across the two radio cards
  function onRadioGroupKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onChangePlanAction("paid");
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onChangePlanAction("free");
    }
  }

  return (
    <div className="grid gap-4">
      {/* Radiogroup container for accessibility */}
      <div
        role="radiogroup"
        aria-label="Consultation plan"
        className="grid gap-3 sm:grid-cols-2"
        onKeyDown={onRadioGroupKeyDown}
      >
        <PlanCard
          active={value === "free"}
          value="free"
          title="Free Discovery Call"
          subtitle="Understand fit, timelines & next steps (Team)"
          badge="Quick intro"
          price="₹0"
          duration="15m"
          onSelectAction={() => onChangePlanAction("free")}
        />
        <PlanCard
          active={value === "paid"}
          value="paid"
          title="Strategy Consultation"
          subtitle="Senior advisor deep-dive & action plan (Varun Singh .  Fellow, IMC)"
          badge="Most thorough"
          price="₹25,000"
          duration="60m"
          onSelectAction={() => onChangePlanAction("paid")}
        />
      </div>

      {/* Selected summary + continue */}
      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
        <div className="text-zinc-800 dark:text-zinc-200">
          Selected:&nbsp;
          <strong className="text-zinc-950 dark:text-white">
            {isPaid ? "Paid (90m)" : "Free (15m)"}
          </strong>
          <span className="ml-2 text-zinc-500 dark:text-zinc-400">·</span>
          <span className="ml-2 text-zinc-700 dark:text-zinc-300">Duration {displayDur}</span>
          <span className="ml-2 text-zinc-500 dark:text-zinc-400">·</span>
          <span className="ml-2 text-zinc-700 dark:text-zinc-300">Total {displayPrice}</span>
        </div>

        <button
          onClick={onNextAction}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 motion-safe:transition hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Continue
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
            <path
              fill="currentColor"
              d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
            />
          </svg>
        </button>
      </div>

      {/* Micro reassurance */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Discreet & confidential · No obligation
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card (radio-like)                                                          */
/* -------------------------------------------------------------------------- */

function PlanCard({
  active,
  value,
  title,
  subtitle,
  price,
  duration,
  badge,
  onSelectAction,
}: {
  active: boolean;
  value: "free" | "paid";
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  badge?: string;
  onSelectAction: () => void;
}) {
  const titleId = useId();
  const subId = useId();

  return (
    <label
      role="radio"
      aria-checked={active}
      aria-labelledby={titleId}
      aria-describedby={subId}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectAction();
        }
      }}
      className={[
        "group relative block w-full cursor-pointer select-none rounded-2xl p-4 sm:p-5",
        "ring-1 shadow-sm motion-safe:transition",
        // Light theme background + dark theme surface
        active
          ? "bg-white ring-blue-300 dark:bg-white/10 dark:ring-blue-800/50"
          : "bg-white ring-zinc-200 hover:ring-blue-200 dark:bg-white/5 dark:ring-white/10 dark:hover:ring-blue-700/40",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      ].join(" ")}
      onClick={onSelectAction}
    >
      {/* Hidden radio keeps semantics intact for mobile */}
      <input type="radio" name="plan" value={value} checked={active} onChange={() => {}} className="sr-only" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {badge ? (
              <span className="inline-flex items-center rounded-full bg-blue-600/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-300/60 dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-400/30">
                {badge}
              </span>
            ) : null}
            <span className="text-[13px] text-zinc-700 dark:text-zinc-300">
              Private Client Service
            </span>
          </div>

          <div id={titleId} className="mt-1 truncate text-base font-semibold text-zinc-950 dark:text-white">
            {title}
          </div>
          <div id={subId} className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {subtitle}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
            <Pill>{duration}</Pill>
            <span className="text-zinc-400 dark:text-zinc-500">•</span>
            <span>{price}</span>
          </div>
        </div>

        {/* Selection indicator */}
        <div
          className={[
            "grid h-9 w-9 place-items-center rounded-full ring-1 motion-safe:transition",
            active
              ? "bg-blue-600 text-white ring-blue-600"
              : "bg-white text-zinc-400 ring-zinc-300 group-hover:ring-blue-300 dark:bg-transparent dark:ring-white/20 dark:text-zinc-500",
          ].join(" ")}
          aria-hidden="true"
        >
          {active ? (
            <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
              <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <circle cx="12" cy="12" r="6" className="fill-current opacity-30" />
            </svg>
          )}
        </div>
      </div>
    </label>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/15">
      {children}
    </span>
  );
}