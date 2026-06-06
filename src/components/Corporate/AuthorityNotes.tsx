// components/Corporate/AuthorityNotes.tsx
"use client";

import * as React from "react";

type AuthorityNotesProps = {
  authority: string; // e.g., "DMCC", "IFZA", "Mainland (MoHRE/GDRFA)"
  points: string[];
  badgeTone?: "indigo" | "emerald" | "amber" | "slate";
  className?: string;
};

export default function AuthorityNotes({
  authority,
  points,
  badgeTone = "indigo",
  className,
}: AuthorityNotesProps) {
  const tone =
    badgeTone === "emerald"
      ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
      : badgeTone === "amber"
      ? "bg-amber-600/10 text-amber-700 dark:text-amber-300"
      : badgeTone === "slate"
      ? "bg-slate-600/10 text-slate-700 dark:text-slate-300"
      : "bg-indigo-600/10 text-indigo-700 dark:text-indigo-300";

  return (
    <section
      className={`rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/40 p-5 ${className || ""}`}
      aria-labelledby="authority-notes-title"
    >
      <header className="mb-4 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${tone}`}>
          {authority}
        </span>
        <h2 id="authority-notes-title" className="text-lg font-semibold">
          Authority-specific notes
        </h2>
      </header>

      <ul className="list-disc pl-5 space-y-2 text-sm leading-6">
        {points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
