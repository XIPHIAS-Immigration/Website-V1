// src/components/Skilled/LanguageRequirements.tsx
import React from "react";
import { Languages, CheckCircle2, Info } from "lucide-react";
import type { ProgramMeta } from "@/lib/skilled-content";

export default function LanguageRequirements({
  language,
  className = "",
}: {
  language?: ProgramMeta["language"];
  className?: string;
}) {
  const tests = (language?.tests ?? []).map((t) => String(t).trim()).filter(Boolean);
  const hasMin = Boolean(language?.minLevel && String(language?.minLevel).trim());
  const hasTests = tests.length > 0;

  if (!hasMin && !hasTests) return null;

  return (
    <section
      aria-label="Language requirements"
      className={[
        "rounded-2xl ring-1 ring-sky-200/60 dark:ring-sky-900/50 overflow-hidden shadow-sm bg-white/70 dark:bg-sky-950/20",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-sky-50/70 dark:bg-sky-950/30">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-sky-700 dark:text-sky-300" aria-hidden />
          <h3 className="text-sm font-semibold">Language requirements</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasMin ? (
            <span className="inline-flex items-center rounded-md bg-sky-500/10 text-sky-800 dark:text-sky-200 ring-1 ring-sky-500/30 px-2.5 py-1 text-xs">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
              Minimum level: <span className="ml-1 font-semibold">{language!.minLevel}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-5 py-4 text-sm">
        {hasTests ? (
          <div className="mb-3">
            <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Accepted tests</div>
            <div className="flex flex-wrap gap-1.5">
              {tests.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800/80 ring-1 ring-neutral-200/70 dark:ring-neutral-700 px-2 py-1 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Helper note */}
        <p className="mt-1 text-[12px] leading-5 text-neutral-700/80 dark:text-neutral-300/80 flex items-start gap-1.5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden />
          Higher language scores can improve competitiveness in points-based or invitation-driven pathways.
        </p>
      </div>
    </section>
  );
}

/*
Usage (already correct on your page):

{hasLanguage ? (
  <section id="language" className="scroll-mt-28">
    <header className="mb-3">
      <h2 className="text-xl font-semibold">Language requirements</h2>
    </header>
    <LanguageRequirements language={languageReq as any} />
  </section>
) : null}

*/
