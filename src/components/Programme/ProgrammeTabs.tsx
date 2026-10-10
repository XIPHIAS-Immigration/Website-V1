"use client";

// src/components/Programme/ProgrammeTabs.tsx
// -----------------------------------------------------------------------------
// The programme page below the decision panel: one tab at a time instead of a
// 12,000-pixel scroll.
//
// Every panel is in the HTML (hidden, not unmounted), so search engines and
// find-in-page still see the whole programme. A tab whose panel renders nothing
// — a route with no points grid, say — is removed after mount, not shown empty.
// `#costs` in the URL opens that tab; the quick-nav anchors inside a panel keep
// working because the panel opens before the browser jumps to the anchor.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export type ProgrammeTab = { id: string; label: string; content: ReactNode };

const EMPTY_TEXT_THRESHOLD = 8;

export default function ProgrammeTabs({ tabs }: { tabs: ProgrammeTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [present, setPresent] = useState<string[]>(() => tabs.map((tab) => tab.id));
  const panels = useRef<Record<string, HTMLDivElement | null>>({});
  const barRef = useRef<HTMLDivElement | null>(null);

  const open = useCallback(
    (id: string, scroll = false) => {
      setActive(id);
      if (scroll) barRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    },
    [],
  );

  // Drop tabs whose panel is empty for this programme.
  useEffect(() => {
    const kept = tabs.filter((tab) => {
      const panel = panels.current[tab.id];
      if (!panel) return false;
      const text = (panel.textContent ?? "").trim();
      return text.length > EMPTY_TEXT_THRESHOLD || panel.querySelector("img, form, table, input, button");
    });
    const ids = kept.map((tab) => tab.id);
    setPresent(ids);
    setActive((current) => (ids.includes(current) ? current : ids[0] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `#faq` opens the FAQ tab; `#gov-fees` opens the tab that contains that anchor.
  useEffect(() => {
    const fromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      if (tabs.some((tab) => tab.id === hash)) {
        setActive(hash);
        return;
      }
      for (const tab of tabs) {
        if (panels.current[tab.id]?.querySelector(`#${CSS.escape(hash)}`)) {
          setActive(tab.id);
          window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "smooth" }), 60);
          return;
        }
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const visible = tabs.filter((tab) => present.includes(tab.id));

  return (
    <div className="mt-8">
      <div
        ref={barRef}
        role="tablist"
        aria-label="Programme sections"
        className="sticky top-[4.5rem] z-30 -mx-4 flex gap-1 overflow-x-auto border-b border-neutral-200 bg-white/95 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:top-[5rem] sm:-mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visible.map((tab) => {
          const on = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={on}
              aria-controls={`panel-${tab.id}`}
              onClick={() => open(tab.id, true)}
              className={`relative shrink-0 whitespace-nowrap px-3.5 py-3.5 text-[14px] font-bold transition-colors sm:px-4 ${
                on ? "text-[#071a3a] dark:text-white" : "text-neutral-500 hover:text-[#071a3a] dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 bottom-0 h-[3px] rounded-t-full transition-colors ${on ? "bg-[#d8ad1f]" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          ref={(node) => {
            panels.current[tab.id] = node;
          }}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="space-y-10 pt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
