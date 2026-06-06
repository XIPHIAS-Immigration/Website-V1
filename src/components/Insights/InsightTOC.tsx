// FILE: src/components/Insights/InsightTOC.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Heading } from "@/types/insights";
import { ChevronDown } from "lucide-react";

type Props = {
  headings: Heading[];        // depth is 2 | 3
  title?: string;             // optional page title to display at top
  scrollOffset?: number;      // fixed header offset (px)
  className?: string;
};

export default function InsightTOC({
  headings,
  title,
  scrollOffset = 88,
  className = "",
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [targets, setTargets] = useState<HTMLElement[]>([]);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  // Keep only unique H2/H3; group H3 under the *nearest preceding* H2
  const { h2s, childrenByH2 } = useMemo(() => {
    const seen = new Set<string>();
    const h2s: Heading[] = [];
    const childrenByH2 = new Map<string, Heading[]>();
    let lastH2: Heading | null = null;

    for (const h of headings ?? []) {
      if (!h?.id || !h.text) continue;
      if (seen.has(h.id)) continue;
      seen.add(h.id);

      if (h.depth === 2) {
        h2s.push(h);
        lastH2 = h;
      } else if (h.depth === 3 && lastH2) {
        const arr = childrenByH2.get(lastH2.id) ?? [];
        arr.push(h);
        childrenByH2.set(lastH2.id, arr);
      }
    }
    return { h2s, childrenByH2 };
  }, [headings]);

  // Build DOM targets on the client only (avoids SSR "document is not defined")
  useEffect(() => {
    if (typeof document === "undefined") return;
    const ids = [
      ...h2s.map((h) => h.id),
      ...[...childrenByH2.values()].flat().map((h) => h.id),
    ];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    setTargets(els);
  }, [h2s, childrenByH2]);

  // Scroll spy (highlights the closest visible heading)
  useEffect(() => {
    if (!targets.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 1] },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [targets]);

  if (!h2s.length) return null;

  // Smooth-scroll with fixed-header offset
  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
    window.scrollTo({ top, behavior: "smooth" });
    if (detailsRef.current?.open) detailsRef.current.open = false;
  };

  // Render one H2 with (optional) H3 children
  const renderH2 = (h2: Heading) => {
    const isActiveH2 =
      activeId === h2.id ||
      (childrenByH2.get(h2.id)?.some((c) => c.id === activeId) ?? false);
    const children = childrenByH2.get(h2.id) || [];

    return (
      <li key={h2.id} className="space-y-1">
        <a
          href={`#${h2.id}`}
          onClick={goTo(h2.id)}
          className={[
            "block rounded px-2 py-1 text-sm transition-colors",
            isActiveH2
              ? "bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white"
              : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
          ].join(" ")}
          aria-current={isActiveH2 ? "true" : undefined}
        >
          {h2.text}
        </a>

        {!!children.length && (
          <ul className="mt-1 ml-3 border-l border-slate-200 dark:border-slate-700 pl-3 space-y-1">
            {children.map((h3) => {
              const active = activeId === h3.id;
              return (
                <li key={h3.id}>
                  <a
                    href={`#${h3.id}`}
                    onClick={goTo(h3.id)}
                    className={[
                      "block rounded px-2 py-0.5 text-[13px] leading-5 transition-colors",
                      active
                        ? "bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
                    ].join(" ")}
                    aria-current={active ? "true" : undefined}
                  >
                    {h3.text}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav aria-label="Table of contents" className={`w-full ${className}`}>
      {/* Mobile: simple collapsible */}
      <details
        ref={detailsRef}
        className="lg:hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur"
      >
        <summary className="flex items-center justify-between cursor-pointer list-none px-4 py-3">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              On this page
            </div>
            {title && (
              <div className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                {title}
              </div>
            )}
          </div>
          <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-300 transition group-open:rotate-180" />
        </summary>
        <div className="px-4 pb-4">
          <ul className="space-y-1.5">{h2s.map(renderH2)}</ul>
        </div>
      </details>

      {/* Desktop: clean sticky card */}
      <aside className="hidden lg:block sticky top-28 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur p-4">
        <div className="mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            On this page
          </h2>
          {title && (
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
              {title}
            </p>
          )}
        </div>
        <ul className="space-y-1.5">{h2s.map(renderH2)}</ul>
      </aside>
    </nav>
  );
}
