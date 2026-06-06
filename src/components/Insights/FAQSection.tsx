// src/components/Insights/FAQSection.tsx
"use client";

import * as React from "react";

type FAQ = { q: string; a: string };

type Props = {
  /** Array of FAQs to render */
  faqs?: FAQ[];
  /** Optional heading shown above the list (not rendered by default in MDX blocks) */
  heading?: string;
  /** Visual density; compact is recommended for MDX. */
  variant?: "compact" | "comfortable";
};

export default function FAQSection({
  faqs,
  heading,
  variant = "compact",
}: Props) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // Stable, unique slugs per question (even if duplicate text appears)
  const slugs = React.useMemo(() => {
    const seen = new Set<string>();
    return (faqs ?? []).map((f) => uniqueSlugify(f.q, seen));
  }, [faqs]);

  // Open a panel if the URL hash matches on load / hash change
  React.useEffect(() => {
    const applyHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (!hash) return;
      const idx = slugs.indexOf(hash);
      if (idx >= 0) setOpenIndex(idx);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [slugs]);

  // Keep the hash in sync with the open panel
  React.useEffect(() => {
    const base = `${window.location.pathname}${window.location.search}`;
    if (openIndex == null) {
      window.history.replaceState?.(null, "", base);
    } else {
      window.history.replaceState?.(null, "", `${base}#${slugs[openIndex]}`);
    }
  }, [openIndex, slugs]);

  if (!faqs?.length) return null;

  const onToggle = (idx: number) =>
    setOpenIndex((cur) => (cur === idx ? null : idx));

  const itemPad = variant === "compact" ? "py-3 sm:py-3" : "py-4 sm:py-5";
  const answerPad = variant === "compact" ? "pb-3 sm:pb-3" : "pb-4 sm:pb-5";
  const qText =
    variant === "compact"
      ? "text-sm sm:text-[15px]"
      : "text-[15px] sm:text-base";
  const aText =
    variant === "compact" ? "text-sm leading-6" : "text-[15px] leading-7";

  return (
    // not-prose prevents Tailwind Typography from inflating sizes inside MDX
    <section
      id="faq"
      role="region"
      aria-label="Frequently asked questions"
      className="not-prose mt-6"
    >
      {heading ? (
        <h2 className="mb-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {heading}
        </h2>
      ) : null}

      {/* Minimal, elegant list: border + divide, no heavy card/chrome */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 divide-y divide-neutral-200/70 dark:divide-neutral-800/70 bg-white/40 dark:bg-neutral-900/30">
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          const id = slugs[i];
          const panelId = `faq-panel-${i}-${id}`;
          const buttonId = `faq-button-${i}-${id}`;
          return (
            <div key={panelId} className="px-3 sm:px-4">
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => onToggle(i)}
                  className={[
                    "group flex w-full items-center justify-between gap-3 text-left font-medium",
                    "rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/50",
                    "hover:bg-neutral-50/80 dark:hover:bg-neutral-900/60",
                    qText,
                    itemPad,
                    "text-neutral-900 dark:text-neutral-100 transition",
                  ].join(" ")}
                >
                  <span className="pr-2">{f.q}</span>
                  <Chevron
                    className={[
                      "h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-neutral-600 dark:text-neutral-300 transition-transform duration-200",
                      isOpen ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={[
                  "grid transition-all duration-200 ease-out motion-reduce:transition-none",
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  <div
                    className={[
                      aText,
                      "text-neutral-700 dark:text-neutral-300 whitespace-pre-line",
                      answerPad,
                    ].join(" ")}
                  >
                    {f.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        // Keeping JSON-LD identical; answers render as simple text
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLd(faqs)) }}
      />
    </section>
  );
}

/* helpers */
function slugifyBase(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function uniqueSlugify(s: string, seen: Set<string>) {
  const base = slugifyBase(s);
  let out = base;
  let i = 1;
  while (seen.has(out)) out = `${base}-${i++}`;
  seen.add(out);
  return out;
}

function Chevron({ className = "" }: { className?: string }) {
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

function buildFaqLd(faqs: FAQ[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
