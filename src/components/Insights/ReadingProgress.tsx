"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  targetId?: string;
  heightClassName?: string; // overall thickness
  zIndexClassName?: string;
  showMilestones?: boolean;
  showPercentBadge?: boolean;
  showStripes?: boolean;
  showGlow?: boolean;
};

export default function ReadingProgress({
  targetId = "article-content",
  heightClassName = "h-1.5",
  zIndexClassName = "z-40",
  showMilestones = false,
  showPercentBadge = false,
  showStripes = false,
  showGlow = false,
}: Props) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastPctRef = useRef<number>(-1);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = document.getElementById(targetId) || document.documentElement;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const topY = window.scrollY + rect.top;
      const total = Math.max(1, el.scrollHeight - window.innerHeight);
      const current = Math.min(Math.max(window.scrollY - topY, 0), total);
      return Math.round((current / total) * 100);
    };

    const schedule = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        const pct = compute();
        if (pct !== lastPctRef.current) {
          lastPctRef.current = pct;
          setProgress(pct);
        }
      });
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    if ("ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver(schedule);
      resizeObserverRef.current.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [targetId]);

  // Color shifts: 0% (red) → 50% (amber) → 100% (green)
  // We’ll compute an H (hue) from ~0 to ~135 and pass as CSS var.
  const hue = Math.round((progress / 100) * 135); // 0=red, 135=green
  const pctClamp = Math.max(0, Math.min(progress, 100));
  const pctScale = pctClamp / 100;

  // Badge positioning — keep it inside screen bounds
  const badgeTranslate = `calc(${pctClamp}% - 18px)`; // center ~36px wide badge

  const milestones = [25, 50, 75, 100];

  return (
    <div
      aria-hidden
      className={[
        "pointer-events-none fixed inset-x-0",
        // keep under the browser’s safe area
        zIndexClassName,
      ].join(" ")}
      style={{
        top: `calc(var(--header-h, 72px) + env(safe-area-inset-top, 0px))`,
      }}
    >
      {/* Track */}
      <div
        className={[
          "mx-0",
          heightClassName,
          "bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)]",
          "backdrop-blur-[2px]",
          "relative overflow-visible",
        ].join(" ")}
        // rounded container
        style={{ borderRadius: 9999 }}
      >
        {/* Filled bar (GPU, scaleX) */}
        <div
          className={[
            "absolute left-0 top-0 h-full w-full origin-left will-change-transform",
            "transition-[transform] duration-150 ease-out motion-reduce:transition-none",
            "rounded-r-full",
          ].join(" ")}
          style={{
            transform: `scaleX(${pctScale})`,
          }}
        >
          {/* Color layer: dynamic gradient following progress */}
          <div
            className="h-full w-full rounded-r-full"
            style={{
              // use a lively multi-stop gradient; hue anchors at --p
              // we also add a subtle top highlight via layered gradients
              background: `
                linear-gradient(
                  90deg,
                  hsl(${Math.max(hue - 20, 0)} 90% 50%) 0%,
                  hsl(${hue} 90% 50%) 50%,
                  hsl(${Math.min(hue + 30, 150)} 90% 45%) 100%
                )
              `,
              boxShadow: showGlow
                ? `0 0 14px hsl(${hue} 90% 60% / 0.55), 0 2px 8px rgba(0,0,0,0.2)`
                : undefined,
            }}
          />

          {/* Optional animated stripes for motion depth (respects reduced motion) */}
          {showStripes && (
            <div
              className={[
                "absolute inset-0 rounded-r-full mix-blend-overlay",
                "motion-reduce:hidden",
              ].join(" ")}
              style={{
                backgroundImage:
                  "linear-gradient(45deg, rgba(255,255,255,0.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.18) 75%, transparent 75%, transparent)",
                backgroundSize: "28px 28px",
                animation: "rp-stripes 1.2s linear infinite",
              }}
            />
          )}
        </div>

        {/* Milestone ticks */}
        {showMilestones && (
          <div className="absolute inset-0">
            {milestones.map((m) => {
              const active = progress >= m;
              return (
                <div
                  key={m}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${m}%` }}
                >
                  <div
                    className={[
                      "w-[2px] h-3 -translate-x-1/2",
                      active
                        ? "bg-[rgba(0,0,0,0.45)] dark:bg-[rgba(255,255,255,0.5)]"
                        : "bg-[rgba(0,0,0,0.2)] dark:bg-[rgba(255,255,255,0.25)]",
                    ].join(" ")}
                  />
                  <div
                    className={[
                      "mt-1 text-[10px] leading-none select-none",
                      active
                        ? "text-[rgba(0,0,0,0.65)] dark:text-[rgba(255,255,255,0.8)]"
                        : "text-[rgba(0,0,0,0.4)] dark:text-[rgba(255,255,255,0.45)]",
                    ].join(" ")}
                  >
                    {m}%
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating % badge that hugs the leading edge */}
        {showPercentBadge && (
          <div
            className={[
              "absolute -top-7",
              "min-w-[36px] px-1.5 py-0.5",
              "rounded-md text-[11px] font-medium",
              "shadow-sm border",
              "bg-white/90 text-neutral-800 border-black/10",
              "dark:bg-neutral-900/85 dark:text-neutral-100 dark:border-white/10",
              "transition-transform duration-150",
            ].join(" ")}
            style={{
              transform: `translateX(${badgeTranslate})`,
            }}
          >
            {progress}%
          </div>
        )}
      </div>

      {/* Keyframes (scoped) */}
      <style jsx>{`
        @keyframes rp-stripes {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 28px 0;
          }
        }
      `}</style>
    </div>
  );
}
