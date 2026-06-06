// components/Residency/ProgramQuickNav.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Section = { id: string; label: string };

export default function ProgramQuickNav({ sections }: { sections: Section[] }) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");
  const topsRef = useRef<Record<string, number>>({});
  const tickingRef = useRef(false);

  /* ---------- helpers ---------- */
  const readCssVarPx = (name: string) => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    const px = Number.parseFloat(raw);
    return Number.isFinite(px) ? px : 0;
  };

  const getTopOffset = () => {
    // Header height is maintained in CSS var by the sticky site header.
    const headerH = readCssVarPx("--header-h");
    // Only count top-stuck bars inside this component.
    const maybeStickyIds = ["program-top-nav"];
    let topH = 0;
    for (const id of maybeStickyIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const pos = getComputedStyle(el).position;
      if (pos === "sticky" || pos === "fixed") {
        // hidden elements (display:none) will have 0 height
        topH += el.offsetHeight;
      }
    }
    return headerH + topH + 12; // breathing room
  };

  const measurePositions = () => {
    const map: Record<string, number> = {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      map[id] = el.getBoundingClientRect().top + window.scrollY;
    });
    topsRef.current = map;
  };

  const pickActive = () => {
    if (!ids.length) return;
    const offset = getTopOffset();
    const pos =
      window.scrollY + offset + Math.min(64, window.innerHeight * 0.15);
    let current = ids[0];
    for (const id of ids) {
      const top = topsRef.current[id];
      if (typeof top === "number" && top <= pos) current = id;
      else break;
    }
    setActiveId(current);
  };

  const requestPickActive = () => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      measurePositions();
      pickActive();
      tickingRef.current = false;
    });
  };

  const scrollToSection = (id: string, smooth = true) => {
    const el = document.getElementById(id);
    if (!el) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior: ScrollBehavior =
      !smooth || prefersReduced ? "auto" : "smooth";
    const target =
      el.getBoundingClientRect().top + window.scrollY - getTopOffset();
    window.scrollTo({ top: Math.max(0, target), behavior });
    history.replaceState(null, "", `#${id}`);
  };

  const centerActive = (navId: string) => {
    const nav = document.getElementById(navId);
    const active = nav?.querySelector<HTMLAnchorElement>(
      'a[aria-current="page"]',
    );
    if (active && nav) {
      active.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    const handleResize = () => requestPickActive();
    measurePositions();
    pickActive();

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    const ro = new ResizeObserver(() => requestPickActive());
    ro.observe(document.body);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join("|")]);

  useEffect(() => {
    const onScroll = () => requestPickActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const applyHash = (smooth = false) => {
      const hash = decodeURIComponent(window.location.hash.replace("#", ""));
      if (hash && ids.includes(hash)) {
        setActiveId(hash);
        scrollToSection(hash, smooth);
      }
    };
    const t = setTimeout(() => applyHash(false), 0);
    const onHashChange = () => applyHash(true);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [ids]);

  useEffect(() => {
    const t = setTimeout(() => {
      centerActive("program-top-nav-inner");
      centerActive("program-mobile-bottom-nav-inner");
    }, 0);
    return () => clearTimeout(t);
  }, [activeId]);

  /* ---------- interactions ---------- */
  const onLinkClick =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setActiveId(id);
      scrollToSection(id, true);
    };

  const progressPct =
    ids.length > 1 ? (ids.indexOf(activeId) / (ids.length - 1)) * 100 : 0;

  /* ---------- UI ---------- */
  return (
    <>
      {/* Sticky Top Tabs (desktop and up) */}
      <nav
        id="program-top-nav"
        aria-label="Section navigation"
        className="
          hidden md:block sticky top-[var(--header-h)] z-40
          backdrop-blur
          border-b border-white/20 dark:border-black/20
          bg-white/65 dark:bg-neutral-900/65
          supports-[backdrop-filter]:bg-white/45 supports-[backdrop-filter]:dark:bg-neutral-900/45
          shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]
        "
      >
        <div className="relative">
          {/* glossy sheen */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0
              bg-[radial-gradient(120%_60%_at_20%_-20%,rgba(255,255,255,0.45),transparent_60%),radial-gradient(120%_60%_at_80%_-30%,rgba(255,255,255,0.25),transparent_55%)]
              dark:bg-[radial-gradient(120%_60%_at_20%_-20%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(120%_60%_at_80%_-30%,rgba(255,255,255,0.06),transparent_55%)]
            "
          />
          <div className="container mx-auto">
            <div
              id="program-top-nav-inner"
              className="
                no-scrollbar flex justify-between gap-6 overflow-x-auto whitespace-nowrap
                px-2 sm:px-0 py-2
              "
            >
              {sections.map((s) => {
                const isActive = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={onLinkClick(s.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative inline-flex items-center pb-3 pt-3 text-[15px] font-medium",
                      "text-black/70 hover:text-black dark:text-white/75 dark:hover:text-white",
                      isActive ? "text-black dark:text-white" : "",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
                    ].join(" ")}
                  >
                    {s.label}
                    <span
                      aria-hidden
                      className={[
                        "pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] origin-left rounded-full",
                        "transition-transform duration-300 ease-out",
                        isActive ? "scale-x-100" : "scale-x-0",
                        "bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400",
                        "shadow-[0_0_12px_rgba(56,189,248,0.45)]",
                      ].join(" ")}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* thin animated progress at very bottom (based on active index) */}
          <div className="relative h-[2px]">
            <div className="absolute inset-0 bg-black/5 dark:bg-white/10" />
            <div
              className="
                absolute inset-y-0 left-0
                bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400
                transition-[width] duration-300 ease-out
                shadow-[0_0_8px_rgba(56,189,248,0.45)]
              "
              style={{ width: `${progressPct}%` }}
              aria-hidden
            />
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Tabs (mobile) */}
      <nav
        id="program-mobile-bottom-nav"
        aria-label="Section navigation"
        className="
          md:hidden fixed z-50
          bottom-0 left-0 right-0 w-full
          border-t border-white/30 dark:border-black/30
          bg-white/65 dark:bg-neutral-900/65 backdrop-blur
          supports-[backdrop-filter]:bg-white/45 supports-[backdrop-filter]:dark:bg-neutral-900/45
          shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.45)]
          pb-[env(safe-area-inset-bottom)]
        "
      >
        <div className="relative">
          {/* sheen */}
          <div
            aria-hidden
            className="
              pointer-events-none absolute inset-0
              bg-[radial-gradient(130%_80%_at_50%_-40%,rgba(255,255,255,0.35),transparent_50%)]
              dark:bg-[radial-gradient(130%_80%_at_50%_-40%,rgba(255,255,255,0.07),transparent_50%)]
            "
          />
          <div className="container mx-auto">
            <div
              id="program-mobile-bottom-nav-inner"
              className="
                no-scrollbar flex items-end gap-4 overflow-x-auto whitespace-nowrap
                px-3 py-2.5
              "
            >
              {sections.map((s) => {
                const isActive = activeId === s.id;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={onLinkClick(s.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "relative inline-flex items-center pb-2 pt-1 text-[12px] font-medium",
                      "text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white",
                      isActive ? "text-black dark:text-white" : "",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded",
                    ].join(" ")}
                  >
                    {s.label}
                    <span
                      aria-hidden
                      className={[
                        "pointer-events-none absolute -bottom-0.5 left-0 right-0 h-[2px] origin-left rounded-full",
                        "transition-transform duration-300 ease-out",
                        isActive ? "scale-x-100" : "scale-x-0",
                        "bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400",
                        "shadow-[0_0_10px_rgba(56,189,248,0.45)]",
                      ].join(" ")}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* mobile progress bar */}
          <div className="relative h-[2px]">
            <div className="absolute inset-0 bg-black/5 dark:bg-white/10" />
            <div
              className="
                absolute inset-y-0 left-0
                bg-gradient-to-r from-fuchsia-500 via-sky-400 to-emerald-400
                transition-[width] duration-300 ease-out
                shadow-[0_0_8px_rgba(56,189,248,0.45)]
              "
              style={{ width: `${progressPct}%` }}
              aria-hidden
            />
          </div>
        </div>
      </nav>

    </>
  );
}
