// src/components/Skilled/Country/SkilledSidebarStatsPanel.tsx
// Same visual style as Residency SidebarStatsPanel, but with NO Investment tile.

import * as React from "react";
import SectionHeader, {
  AccentIcon,
} from "@/components/Residency/Country/SectionHeader";
import { Layers, Clock, Globe2, Medal } from "lucide-react";

/* ================================
   Types (no investRange here)
================================== */
type Props = {
  programsCount?: number; // 0 is valid; undefined = hide tile
  timelineRange?: string; // "4–8 months", "≈ 12 mo"
  visaFreeCount?: number; // optional
  passportRank?: number;  // optional

  className?: string;
  loading?: boolean;
  updatedAt?: string;       // ISO or display string
  showTimelineBar?: boolean; // default: true
  timeScaleMonths?: number | "auto"; // default: "auto"
};

/* ================================
   Component
================================== */
export default function SkilledSidebarStatsPanel({
  programsCount,
  timelineRange,
  visaFreeCount,
  passportRank,
  className,
  loading = false,
  updatedAt,
  showTimelineBar = true,
  timeScaleMonths = "auto",
}: Props) {
  const headerId = "snapshot-" + React.useId();

  const hasPrograms =
    typeof programsCount === "number" && !Number.isNaN(programsCount);
  const hasTimeline = Boolean(timelineRange);
  const hasVisa =
    typeof visaFreeCount === "number" && !Number.isNaN(visaFreeCount);
  const hasRank =
    typeof passportRank === "number" && !Number.isNaN(passportRank);

  if (!loading && !hasPrograms && !hasTimeline && !hasVisa && !hasRank) {
    return null;
  }

  const t = React.useMemo(() => parseTimeline(timelineRange || ""), [timelineRange]);
  const label = React.useMemo(
    () => formatTimelineLabel(t, timelineRange || ""),
    [t, timelineRange],
  );
  const scale =
    timeScaleMonths === "auto" ? chooseScale(t, 60) : timeScaleMonths;

  return (
    <section
      role="region"
      aria-labelledby={headerId}
      className={[
        "relative overflow-hidden",
        "rounded-2xl p-4 sm:p-5",
        "ring-1 ring-neutral-200 dark:ring-neutral-800",
        "bg-gradient-to-br from-sky-50/80 via-white/85 to-blue-50/70",
        "dark:from-[rgba(2,6,23,0.7)] dark:via-[rgba(2,6,23,0.6)] dark:to-[rgba(30,41,59,0.5)]",
        "backdrop-blur",
        className || "",
      ].join(" ")}
      itemScope
      itemType="https://schema.org/Dataset"
    >
      <DecorativeBackground />

      <div id={headerId} className="relative z-10">
        <SectionHeader eyebrow="Snapshot" title="At a glance" color="sky" />
      </div>

      {updatedAt ? (
        <p className="relative z-10 mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          Updated{" "}
          <time dateTime={toISO(updatedAt)} itemProp="dateModified">
            {toNiceDate(updatedAt)}
          </time>
        </p>
      ) : null}

      <dl className="relative z-10 mt-4 grid grid-cols-1 gap-3">
        {(loading || hasPrograms) && (
          <MetricTile
            label="Programs"
            color="blue"
            icon={<Layers className="h-4 w-4" aria-hidden />}
            value={
              loading ? (
                <Skeleton />
              ) : (
                <span
                  itemProp="variableMeasured"
                  aria-label={`${programsCount} programs`}
                >
                  {new Intl.NumberFormat().format(programsCount!)}
                </span>
              )
            }
            badge="Total"
          />
        )}

        {(loading || hasTimeline) && (
          <MetricTile
            label="Timeline"
            color="violet"
            icon={<Clock className="h-4 w-4" aria-hidden />}
            value={
              loading ? (
                <Skeleton />
              ) : (
                <Truncate title={label}>{label}</Truncate>
              )
            }
            badge={t.hasRange ? "Range" : "Avg"}
            footer={
              !loading && showTimelineBar && t.avg != null ? (
                <TimelineBar
                  avg={t.avg}
                  min={t.hasRange ? t.min! : null}
                  max={t.hasRange ? t.max! : null}
                  scale={typeof scale === "number" ? scale : 60}
                  ariaLabel={label}
                />
              ) : null
            }
          />
        )}

        {hasVisa && (
          <MetricTile
            label="Visa-free countries"
            color="blue"
            icon={<Globe2 className="h-4 w-4" aria-hidden />}
            value={
              <span itemProp="variableMeasured">
                {new Intl.NumberFormat().format(visaFreeCount!)}
              </span>
            }
            badge="Count"
          />
        )}

        {hasRank && (
          <MetricTile
            label="Passport rank"
            color="violet"
            icon={<Medal className="h-4 w-4" aria-hidden />}
            value={
              <span itemProp="variableMeasured">
                #{new Intl.NumberFormat().format(passportRank!)}
              </span>
            }
            badge="Rank"
          />
        )}
      </dl>
    </section>
  );
}

/* ================================
   Subcomponents (same visual DNA)
================================== */

function DecorativeBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl"
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] dark:opacity-[0.08]"
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth="0.75" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" className="text-sky-700 dark:text-sky-300" />
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10"
      />
    </>
  );
}

function MetricTile({
  label,
  value,
  icon,
  color,
  badge,
  footer,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  color: "blue" | "green" | "violet";
  badge?: string;
  footer?: React.ReactNode;
}) {
  const colorRing =
    color === "blue"
      ? "ring-sky-200 dark:ring-sky-800"
      : color === "green"
      ? "ring-emerald-200 dark:ring-emerald-800"
      : "ring-violet-200 dark:ring-violet-800";

  const accentGrad =
    color === "blue"
      ? "from-sky-500 to-blue-600"
      : color === "green"
      ? "from-emerald-500 to-green-600"
      : "from-violet-500 to-fuchsia-600";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-2xl p-3 sm:p-3.5",
        "bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900/40",
        "ring-1 ring-neutral-200 dark:ring-neutral-800",
        "transition shadow-sm motion-safe:hover:-translate-y-0.5 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-sky-400/50 dark:focus-within:ring-sky-500/40",
      ].join(" ")}
      role="group"
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-14 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${accentGrad} opacity-10 blur-2xl`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-2xl ${colorRing}`}
        style={{ maskImage: "linear-gradient(transparent, black)" }}
      />

      <div className="flex items-start gap-3">
        <AccentIcon color={color}>{icon}</AccentIcon>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <dt className="text-[11px] uppercase tracking-wide text-neutral-700/90 dark:text-neutral-300">
              {label}
            </dt>
            {badge ? (
              <span
                className={[
                  "rounded-full px-2 py-[2px] text-[10px] leading-none",
                  "bg-white/80 text-neutral-700 ring-1 ring-neutral-200",
                  "dark:bg-neutral-900/60 dark:text-neutral-200 dark:ring-neutral-800",
                ].join(" ")}
              >
                {badge}
              </span>
            ) : null}
          </div>

          <dd
            className="mt-1 text-[15px] sm:text-sm font-semibold text-black dark:text-white leading-6"
            aria-live="polite"
          >
            {value}
          </dd>

          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

function Truncate({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      className="block max-w-[70vw] sm:max-w-[26ch] whitespace-nowrap overflow-hidden text-ellipsis"
      title={typeof children === "string" ? children : title}
    >
      {children}
    </span>
  );
}

function Skeleton() {
  return (
    <span className="inline-block h-[1em] w-24 rounded bg-neutral-200/70 dark:bg-neutral-800/70 animate-pulse align-middle" />
  );
}

/** Compact timeline bar with optional range band */
function TimelineBar({
  avg,
  min,
  max,
  scale,
  ariaLabel,
}: {
  avg: number;
  min: number | null;
  max: number | null;
  scale: number;
  ariaLabel: string;
}) {
  const showBand = min != null && max != null && Math.abs(max - min) >= 1;

  const clampPct = (v: number) => Math.max(0, Math.min(100, (v / scale) * 100));
  const avgPct = clampPct(avg);
  const minPct = min != null ? clampPct(min) : null;
  const maxPct = max != null ? clampPct(max) : null;

  return (
    <div className="space-y-1" aria-label={ariaLabel}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/40 ring-1 ring-sky-200/60 dark:ring-sky-800/60">
        {showBand && minPct != null && maxPct != null ? (
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-sky-300/70 to-blue-300/70 dark:from-sky-700/50 dark:to-blue-700/50"
            style={{
              left: `${minPct}%`,
              width: `${Math.max(2, maxPct - minPct)}%`,
            }}
            aria-hidden
          />
        ) : null}
        <div
          className="absolute top-0 h-full w-[2px] bg-blue-600 dark:bg-sky-400"
          style={{ left: `${avgPct}%` }}
          aria-hidden
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <span>0&nbsp;mo</span>
        <span>~{Math.round(avg)}&nbsp;mo</span>
        <span>{scale}&nbsp;mo</span>
      </div>
    </div>
  );
}

/* ================================
   Utilities
================================== */

function parseTimeline(input: string) {
  const s = (input || "")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const nums = (s.match(/(\d+(\.\d+)?)/g) || []).map(Number);
  if (nums.length >= 2) {
    const [a, b] = nums;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const avg = (min + max) / 2;
    return { min, max, avg, hasRange: max - min >= 1 };
  }
  if (nums.length === 1) {
    const avg = nums[0];
    return { min: null, max: null, avg, hasRange: false };
  }
  return { min: null, max: null, avg: null, hasRange: false };
}

function formatTimelineLabel(
  t: { min: number | null; max: number | null; avg: number | null; hasRange: boolean },
  original: string,
) {
  if (t.avg == null) return original || "—";
  if (t.hasRange && t.min != null && t.max != null) {
    return `${stripZero(t.min)}–${stripZero(t.max)} mo`;
  }
  return `≈ ${stripZero(Math.round(t.avg))} mo`;
}

function stripZero(n: number) {
  return Number.isInteger(n) ? String(n) : String(n.toFixed(1));
}

function chooseScale(
  t: { min: number | null; max: number | null; avg: number | null },
  fallback = 60,
) {
  const target = Math.max(t.max ?? 0, t.avg ?? 0);
  if (!target) return fallback;
  const padded = Math.ceil(target * 1.25);
  const step = 6;
  return Math.max(24, Math.ceil(padded / step) * step);
}

function toISO(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toISOString();
}
function toNiceDate(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}
