// src/components/Skilled/OccupationLists.tsx
"use client";

import React from "react";
import { Briefcase, Search, ChevronDown, Hash } from "lucide-react";
import type { ProgramMeta } from "@/lib/skilled-content";

type Props = {
  lists?: ProgramMeta["occupationLists"];
  codes?: ProgramMeta["occupationCodes"];
  className?: string;
};

export default function OccupationLists({ lists, codes, className = "" }: Props) {
  const [query, setQuery] = React.useState("");

  const normLists = React.useMemo(
    () =>
      (lists ?? []).map((l) => ({
        listName: l.listName?.trim() || "Occupation list",
        occupations: (l.occupations ?? []).map((o) => String(o).trim()).filter(Boolean),
      })),
    [lists],
  );

  const filtered = React.useMemo(() => {
    if (!query.trim()) return normLists;
    const q = query.toLowerCase();
    return normLists
      .map((l) => ({
        ...l,
        occupations: l.occupations.filter((o) => o.toLowerCase().includes(q)),
      }))
      .filter((l) => l.occupations.length > 0);
  }, [normLists, query]);

  const totalCount = normLists.reduce((acc, l) => acc + l.occupations.length, 0);
  const shownCount = filtered.reduce((acc, l) => acc + l.occupations.length, 0);

  // Simple highlighter for search matches
  const highlight = (text: string, needle: string) => {
    if (!needle.trim()) return text;
    const q = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${q})`, "ig"));
    return parts.map((part, i) =>
      part.toLowerCase() === needle.toLowerCase() ? (
        <mark key={i} className="rounded px-0.5 bg-yellow-200/60 dark:bg-yellow-300/20">
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      ),
    );
  };

  if (!normLists.length && !(codes?.length)) return null;

  return (
    <section
      aria-label="Eligible occupations"
      className={[
        "rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 overflow-hidden shadow-sm bg-white/70 dark:bg-neutral-900/40",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-neutral-700 dark:text-neutral-200" aria-hidden />
          <h3 className="text-sm font-semibold">
            Eligible occupations
            {totalCount ? (
              <span className="ml-2 text-xs font-normal opacity-70">({shownCount}/{totalCount})</span>
            ) : null}
          </h3>
        </div>

        {/* Search */}
        {normLists.length > 8 ? (
          <label className="relative w-full sm:w-64">
            <Search
              className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search occupations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md ring-1 ring-neutral-300 dark:ring-neutral-700 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
            />
          </label>
        ) : null}
      </div>

      {/* Codes (optional) */}
      {codes?.length ? (
        <div className="px-4 sm:px-5 py-3 border-b border-neutral-200/70 dark:border-neutral-800/70">
          <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Codes</div>
          <div className="flex flex-wrap gap-1.5">
            {codes.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 ring-1 ring-neutral-200/70 dark:ring-neutral-700 px-2 py-1 text-xs font-medium"
                title={c}
              >
                <Hash className="h-3.5 w-3.5 opacity-70" aria-hidden />
                <code className="font-mono">{c}</code>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Lists */}
      <div className="px-2 sm:px-3 py-3">
        {!filtered.length ? (
          <p className="px-2 py-3 text-sm opacity-70">No occupations matched your search.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((l, idx) => (
              <li key={`${l.listName}-${idx}`}>
                <details
                  className="group rounded-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/30"
                  {...(filtered.length <= 2 && idx === 0 ? { open: true } : {})}
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-neutral-300 dark:ring-neutral-700 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium">{l.listName}</span>
                      <span className="ml-1 text-xs opacity-60">({l.occupations.length})</span>
                    </div>
                    <ChevronDown
                      className="h-4 w-4 transition-transform group-open:rotate-180 opacity-70"
                      aria-hidden
                    />
                  </summary>

                  {/* Occupations as chips */}
                  <div className="px-3 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {l.occupations.map((o) => (
                        <span
                          key={o}
                          className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800/80 ring-1 ring-neutral-200/70 dark:ring-neutral-700 px-2 py-1 text-xs"
                          title={o}
                        >
                          {highlight(o, query)}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
