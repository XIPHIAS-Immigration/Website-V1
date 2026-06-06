"use client";

import React, { useId } from "react";
import { Clock, FileText, CheckCircle2 } from "lucide-react";

type Step = { title: string; description?: string };

/**
 * ProcessTimeline — refined, readable, “premium” timeline.
 * - Minimal cards (soft ring + subtle tint), strong type hierarchy
 * - Vertical rail on all screens (no jumpy grids), perfect for scanning
 * - Numbered markers with connecting line (no JS)
 * - Optional meta chips (duration/docs/outcome) if provided in each step object:
 *     { title, description, duration?: string, docs?: string, outcome?: string }
 *
 * Signature unchanged: ({ steps, heading? })
 */
export default function ProcessTimeline({
  steps,
  heading = "How it works",
}: {
  steps: Step[];
  heading?: string | null;
}) {
  if (!steps?.length) return null;

  const uid = useId();
  const headingId = heading ? `process-heading-${uid}` : undefined;

  return (
    <section
      role="region"
      aria-labelledby={heading ? headingId : undefined}
      className="text-black dark:text-white"
    >
      {/* Header */}
      {heading ? (
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-indigo-600/10 px-2 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            Process
          </span>
          <h3 id={headingId} className="text-xl font-semibold">
            {heading}
          </h3>
          <span className="ml-auto hidden sm:inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-slate-200 dark:ring-neutral-700 opacity-70">
            {steps.length} step{steps.length > 1 ? "s" : ""}
          </span>
        </div>
      ) : null}

      {/* Timeline list */}
      <ol className="space-y-4 sm:space-y-5" aria-label="Application steps">
        {steps.map((raw, i) => {
          const step = raw as Step & {
            duration?: string;
            docs?: string;
            outcome?: string;
          };
          const isLast = i === steps.length - 1;
          const stepId = `step-${uid}-${i + 1}`;
          const palette = paletteByIndex(i);

          return (
            <li key={`${step.title}-${i}`} className="relative">
              {/* Marker + connector */}
              <div className="absolute left-0 top-0 h-full w-8 sm:w-10">
                {/* connector line */}
                {!isLast ? (
                  <span
                    className="absolute left-4 sm:left-5 top-6 bottom-0 w-px bg-slate-200 dark:bg-neutral-800"
                    aria-hidden
                  />
                ) : null}
                {/* dot */}
                <span
                  className={[
                    "absolute left-0 top-1 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center",
                    "rounded-full text-[13px] font-semibold ring-2 ring-white dark:ring-neutral-900 shadow-sm",
                    palette.dotBg,
                  ].join(" ")}
                  aria-hidden
                >
                  {i + 1}
                </span>
              </div>

              {/* Card */}
              <article
                aria-labelledby={`${stepId}-title`}
                className={[
                  "ml-10 sm:ml-12 rounded-xl p-4 sm:p-5",
                  "bg-white/80 dark:bg-neutral-900/40",
                  "ring-1 shadow-sm transition",
                  "hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                  palette.cardRing,
                ].join(" ")}
              >
                {/* accent bar */}
                <span
                  className={[
                    "block h-1 w-14 rounded-full",
                    palette.accentBar,
                  ].join(" ")}
                  aria-hidden
                />

                <h4
                  id={`${stepId}-title`}
                  className="mt-2 text-base font-semibold leading-6"
                >
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h4>

                {step.description ? (
                  <p className="mt-2 text-[15px] leading-7 text-black/80 dark:text-gray-200">
                    {step.description}
                  </p>
                ) : null}

                {/* Optional meta chips */}
                {step.duration || step.docs || step.outcome ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.outcome ? (
                      <Chip icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        {step.outcome}
                      </Chip>
                    ) : null}
                    {step.duration ? (
                      <Chip icon={<Clock className="h-3.5 w-3.5" />}>
                        {step.duration}
                      </Chip>
                    ) : null}
                    {step.docs ? (
                      <Chip icon={<FileText className="h-3.5 w-3.5" />}>
                        {step.docs}
                      </Chip>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 opacity-80">
                    <Chip icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                      Guided
                    </Chip>
                    <Chip icon={<Clock className="h-3.5 w-3.5" />}>
                      Avg. 2–4 weeks
                    </Chip>
                  </div>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- UI bits ---------- */

function Chip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className="
        inline-flex items-center gap-1.5 rounded-full
        px-2.5 py-1 text-xs
        ring-1 ring-slate-200 dark:ring-neutral-700
        bg-black/5 text-black/80
        dark:bg-white/10 dark:text-gray-200
      "
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}

function paletteByIndex(i: number) {
  // Gentle rotating palette for visual rhythm
  switch (i % 5) {
    case 0:
      return {
        dotBg: "bg-indigo-600 text-white",
        cardRing: "ring-indigo-200/70 dark:ring-indigo-900/40",
        accentBar: "bg-indigo-500/80 dark:bg-indigo-400/60",
      };
    case 1:
      return {
        dotBg: "bg-emerald-600 text-white",
        cardRing: "ring-emerald-200/70 dark:ring-emerald-900/40",
        accentBar: "bg-emerald-500/80 dark:bg-emerald-400/60",
      };
    case 2:
      return {
        dotBg: "bg-sky-600 text-white",
        cardRing: "ring-sky-200/70 dark:ring-sky-900/40",
        accentBar: "bg-sky-500/80 dark:bg-sky-400/60",
      };
    case 3:
      return {
        dotBg: "bg-rose-600 text-white",
        cardRing: "ring-rose-200/70 dark:ring-rose-900/40",
        accentBar: "bg-rose-500/80 dark:bg-rose-400/60",
      };
    default:
      return {
        dotBg: "bg-amber-600 text-white",
        cardRing: "ring-amber-200/70 dark:ring-amber-900/40",
        accentBar: "bg-amber-500/80 dark:bg-amber-400/60",
      };
  }
}
