"use client";
import * as React from "react";

type FAQ = { q: string; a: string };

export default function FAQSection({ faqs }: { faqs?: FAQ[] }) {
  // Always define values and hooks first
  const items = faqs ?? [];
  const hasFaqs = items.length > 0;

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const slugs = React.useMemo(() => items.map((f) => slugify(f.q)), [items]);

  // Sync with hash (and open if matches)
  React.useEffect(() => {
    const applyHash = () => {
      const hash =
        typeof window !== "undefined"
          ? decodeURIComponent(window.location.hash.replace(/^#/, ""))
          : "";
      if (!hash) {
        setOpenIndex(null);
        return;
      }
      const idx = slugs.indexOf(hash);
      setOpenIndex(idx >= 0 ? idx : null);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [slugs]);

  const onToggle = React.useCallback(
    (idx: number) => {
      setOpenIndex((cur) => {
        const next = cur === idx ? null : idx;
        if (typeof window !== "undefined") {
          const nextHash = next === null ? "" : `#${slugs[next]}`;
          const url = nextHash
            ? `${window.location.pathname}${window.location.search}${nextHash}`
            : `${window.location.pathname}${window.location.search}`;
          window.history.replaceState(null, "", url);
        }
        return next;
      });
    },
    [slugs],
  );

  // Early return AFTER hooks
  if (!hasFaqs) return null;

  return (
    <section
      role="region"
      aria-label="Frequently asked questions"
      className="pt-3 sm:pt-4 text-light_text dark:text-dark_text"
    >
      <header className="mb-3">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
      </header>

      <div className="overflow-visible rounded-xl ring-1 ring-inset ring-border dark:ring-dark_border divide-y divide-border/70 dark:divide-dark_border/70 bg-transparent">
        {items.map((f, i) => {
          const isOpen = openIndex === i;
          const panelId = `faq-panel-${i}-${slugs[i]}`;
          const buttonId = `faq-button-${i}-${slugs[i]}`;

          return (
            <div key={panelId} className="px-3 sm:px-4">
              <h3 className="sr-only" id={`${panelId}-title`}>
                Question {i + 1}
              </h3>
              <h4>
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => onToggle(i)}
                  className="group flex w-full items-center justify-between gap-3 py-3 sm:py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
                >
                  <span className="flex-1">
                    <span className="block text-15 sm:text-16 font-semibold leading-6">
                      {f.q}
                    </span>
                  </span>
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light_bg dark:bg-dark_bg ring-1 ring-inset ring-border dark:ring-dark_border text-light_text dark:text-dark_text transition-transform duration-300 group-aria-expanded:rotate-180"
                    aria-hidden
                    aria-expanded={isOpen}
                  >
                    <Chevron className="h-4 w-4" />
                  </span>
                </button>
              </h4>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-90"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pb-4 text-[15px] leading-7">{f.a}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
