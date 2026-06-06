// src/components/Skilled/JobOfferBadge.tsx
import React from "react";
import { Briefcase, CheckCircle2, XCircle, HelpCircle } from "lucide-react";

type Props = {
  required?: boolean;  // true, false, or unknown
  note?: string;       // optional clarifying note
  className?: string;
};

export default function JobOfferBadge({ required, note, className = "" }: Props) {
  const variant = required === true ? "required" : required === false ? "not_required" : "unclear";

  const styles: Record<
    typeof variant,
    {
      wrap: string;
      chip: string;
      icon: React.ReactNode;
      chipText: string;
      hint: string;
    }
  > = {
    required: {
      wrap:
        "bg-amber-50/70 dark:bg-amber-900/15 ring-amber-200/60 dark:ring-amber-800/50",
      chip:
        "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 ring-amber-200/60 dark:ring-amber-800/50",
      icon: <Briefcase className="h-4 w-4 text-amber-700 dark:text-amber-200" aria-hidden />,
      chipText: "Job offer required",
      hint: "An employer job offer is needed to apply.",
    },
    not_required: {
      wrap:
        "bg-emerald-50/70 dark:bg-emerald-900/15 ring-emerald-200/60 dark:ring-emerald-800/50",
      chip:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 ring-emerald-200/60 dark:ring-emerald-800/50",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-200" aria-hidden />,
      chipText: "No job offer required",
      hint: "You can apply without an employer sponsor.",
    },
    unclear: {
      wrap:
        "bg-sky-50/70 dark:bg-sky-900/15 ring-sky-200/60 dark:ring-sky-800/50",
      chip:
        "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 ring-sky-200/60 dark:ring-sky-800/50",
      icon: <HelpCircle className="h-4 w-4 text-sky-700 dark:text-sky-200" aria-hidden />,
      chipText: "Job offer may be required",
      hint: "Requirement can vary by stream or profile.",
    },
  };

  const s = styles[variant];

  return (
    <div
      className={[
        "rounded-2xl ring-1 px-4 py-3 sm:px-5 sm:py-4 bg-white/70 dark:bg-neutral-900/40",
        s.wrap,
        className,
      ].join(" ")}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{s.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Job offer</h3>
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1",
                s.chip,
              ].join(" ")}
              title={s.chipText}
              aria-label={s.chipText}
            >
              {s.chipText}
            </span>
          </div>

          <p className="text-xs sm:text-[13px] mt-1.5 opacity-80">
            {note?.trim() ? note : s.hint}
          </p>
        </div>
      </div>
    </div>
  );
}
