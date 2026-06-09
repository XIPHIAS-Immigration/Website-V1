"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Clock, Tag } from "lucide-react";
import type { UIItem as BaseUIItem } from "@/utils/search";
import { searchItems, preloadIndex, debounce } from "@/utils/search";

type RichUIItem = BaseUIItem & {
  image?: string;
  dateLabel?: string;
  tags?: string[];
};

export type GlobalSearchProps = {
  className?: string;
  placeholder?: string;
  compact?: boolean;
};

const popularSuggestions: RichUIItem[] = [
  {
    title: "Canada Startup Visa",
    type: "Program",
    url: "/residency/canada/canada-start-up-visa",
  },
  {
    title: "Antigua & Barbuda CBI",
    type: "Program",
    url: "/citizenship/antigua-barbuda",
  },
  {
    title: "Australia Global Talent",
    type: "Program",
    url: "/skilled/australia/global-talent-visa-858",
  },
  {
    title: "Grenada Real Estate",
    type: "Program",
    url: "/citizenship/grenada/real-estate",
  },
];

export default function GlobalSearch({
  className = "",
  placeholder = "Search...",
  compact = false,
}: GlobalSearchProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RichUIItem[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [highlighted, setHighlighted] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const hasQuery = query.trim().length > 0;
  const items = useMemo<RichUIItem[]>(
    () => (hasQuery ? results : popularSuggestions),
    [hasQuery, results],
  );

  const activeOptionId = items.length ? `gs-opt-${activeIndex}` : undefined;
  const listboxId = "gs-listbox";

  const highlight = useCallback((text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-transparent font-semibold">
          {text.slice(i, i + q.length)}
        </mark>
        {text.slice(i + q.length)}
      </>
    );
  }, []);

  useEffect(() => {
    if (open) preloadIndex();
  }, [open]);

  useEffect(() => {
    const run = debounce(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        setHighlighted("");
        setActiveIndex(0);
        setLoading(false);
        return;
      }
      setLoading(true);
      const found = await searchItems(q, 12);
      setResults((found || []) as RichUIItem[]);
      setLoading(false);
      if (found?.length) {
        const match = found[0].title;
        setHighlighted(
          match.toLowerCase().startsWith(q.toLowerCase()) ? match : "",
        );
      } else {
        setHighlighted("");
      }
      setActiveIndex(0);
    }, 220);
    run();
  }, [query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      const len = Math.max(items.length, 1);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((p) => (p + 1) % len);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((p) => (p - 1 + len) % len);
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(Math.max(items.length - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = items[activeIndex];
        if (it) {
          setRecent((prev) =>
            [it.title, ...prev.filter((x) => x !== it.title)].slice(0, 5),
          );
          setOpen(false);
          router.push(it.url);
        } else if (highlighted) {
          setQuery(highlighted);
        }
      } else if (e.key === "Tab" && highlighted) {
        e.preventDefault();
        setQuery(highlighted);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, activeIndex, highlighted, router]);

  useEffect(() => {
    if (!open) {
      triggerRef.current?.focus();
      return;
    }
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ) || [],
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true",
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", trap);
    return () => window.removeEventListener("keydown", trap);
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, y);
    };
  }, [open]);

  const TypeBadge = ({ t }: { t: string }) => (
    <span className="inline-flex items-center rounded-full border px-1.5 py-[1px] text-[10.5px] font-medium text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
      {t}
    </span>
  );

  const SafeThumb = ({ src }: { src?: string }) =>
    src ? (
      <div className="relative h-10 w-10 flex-none overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      </div>
    ) : null;

  function ResultRow({
    item,
    i,
    active,
  }: {
    item: RichUIItem;
    i: number;
    active: boolean;
  }) {
    return (
      <div
        role="option"
        id={`gs-opt-${i}`}
        aria-selected={active}
        onMouseEnter={() => setActiveIndex(i)}
        className={[
          "flex items-center justify-between gap-3 px-3 sm:px-4 border-b last:border-0 border-gray-100 dark:border-gray-800 transition",
          active ? "bg-blue-100/70 dark:bg-gray-800" : "hover:bg-blue-50 dark:hover:bg-gray-800",
          "py-2",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.push(item.url);
          }}
          className="flex min-w-0 flex-1 items-start gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
        >
          <SafeThumb src={item.image} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <TypeBadge t={item.type} />
              <span
                className="truncate text-[14px] text-gray-900 dark:text-gray-100"
                title={item.title}
              >
                {hasQuery ? highlight(item.title, query) : item.title}
              </span>
            </div>

            {(item.tags?.length || item.dateLabel) && (
              <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-gray-500 dark:text-gray-400">
                {item.tags?.slice(0, 3).map((t: string, idx: number) => (
                  <span
                    key={`${t}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-full border px-1.5 py-[1px] border-gray-200 dark:border-gray-700"
                  >
                    <Tag size={11} className="opacity-60" />
                    {t}
                  </span>
                ))}
                {item.dateLabel && <span className="ml-auto">{item.dateLabel}</span>}
              </div>
            )}

            {active && item.snippet && (
              <p className="mt-0.5 line-clamp-1 text-[12.5px] text-gray-600 dark:text-gray-400">
                {item.snippet}
              </p>
            )}
          </div>
        </button>

        <ArrowRight
          className={active ? "text-blue-600 shrink-0" : "text-gray-400 shrink-0"}
          size={18}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <>
      {compact ? (
        <button
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 transition-colors"
        >
          <Search className="h-[1rem] w-[1rem]" aria-hidden />
        </button>
      ) : (
        <button
          ref={triggerRef}
          onClick={() => setOpen(true)}
          aria-label="Open search"
          className={[
            "pointer-events-auto w-full max-w-[520px] rounded-full border px-5 py-2 text-sm text-white mx-5",
            "border-white/15 bg-white/10 backdrop-blur-md",
            "focus:outline-none focus-visible:outline-none",
            "focus:!ring-0 focus:!ring-offset-0",
            "focus-visible:!ring-0 focus-visible:!ring-offset-0",
            "flex items-center justify-start gap-2 transition",
            className,
          ].join(" ")}
        >
          <Search size={18} className="text-white/95" />
          <span className="text-white/95">{placeholder}</span>
        </button>
      )}

      {mounted &&
        createPortal(
          open ? (
            <div className="fixed inset-0 z-[2147483646] bg-white/90 dark:bg-black/80 backdrop-blur-xl flex justify-center">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-6 right-6 text-gray-900 dark:text-white hover:opacity-80 transition w-10 h-10 flex items-center justify-center"
                aria-label="Close search"
              >
                <X size={28} />
              </button>

              <div
                ref={overlayRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-title"
                className="w-full max-w-3xl mt-20 px-3 sm:px-4"
              >
                <h2 id="search-title" className="sr-only">
                  Site search
                </h2>

                <div className="relative">
                  <div
                    className={[
                      "flex items-center rounded-xl shadow-xl px-3 sm:px-4 py-2 border",
                      "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                      "transition",
                    ].join(" ")}
                  >
                    <Search className="text-gray-500 dark:text-gray-400" size={20} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by country, visa type, service, article..."
                      className={[
                        "flex-1 bg-transparent px-2 sm:px-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400",
                        "outline-none ring-0",
                        "focus:outline-none focus-visible:outline-none",
                        "focus:!ring-0 focus:!ring-offset-0",
                        "focus-visible:!ring-0 focus-visible:!ring-offset-0",
                      ].join(" ")}
                      role="combobox"
                      aria-expanded={true}
                      aria-autocomplete="list"
                      aria-controls="gs-listbox"
                      aria-activedescendant={activeOptionId}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {loading && (
                      <span
                        className="ml-2 h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse"
                        aria-hidden
                      />
                    )}
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {query.trim() === ""
                      ? "Type to search"
                      : loading
                        ? "Searching"
                        : items.length === 0
                          ? "No results"
                          : `${items.length} results`}
                  </p>
                </div>

                <div
                  className="mt-3 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[62vh] overflow-y-auto"
                  role="listbox"
                  id={listboxId}
                >
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 m-1.5 px-2 text-center">
                    Up/Down navigate | Enter open | Tab autocomplete | Esc close
                  </div>

                  {!hasQuery && (
                    <>
                      {recent.length > 0 && (
                        <>
                          <div className="px-4 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 border-y dark:border-gray-800">
                            Recent
                          </div>
                          {recent.map((r, i) => (
                            <button
                              key={`r-${i}`}
                              type="button"
                              onClick={() => setQuery(r)}
                              className="w-full text-left flex items-center gap-2.5 px-4 py-2 border-b dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                            >
                              <Clock size={14} className="text-gray-400" />
                              <span className="truncate text-[14px]">{r}</span>
                            </button>
                          ))}
                        </>
                      )}
                      <div className="px-4 py-1.5 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 border-y dark:border-gray-800">
                        Popular
                      </div>
                    </>
                  )}

                  {items.length > 0 ? (
                    items.map((it, i) => (
                      <ResultRow
                        key={`${it.url}-${i}`}
                        item={it}
                        i={i}
                        active={i === activeIndex}
                      />
                    ))
                  ) : hasQuery && !loading ? (
                    <div className="py-6 text-center text-[13px] text-gray-500 dark:text-gray-400">
                      No results found. Try different keywords.
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 text-[11px] text-center text-gray-400 md:hidden">
                  Enter opens | Esc closes
                </div>
              </div>
            </div>
          ) : null,
          document.body,
        )}
    </>
  );
}
