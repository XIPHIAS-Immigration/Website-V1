// ============================
// src/components/Contact/TrustBar.tsx
// ============================
import * as React from "react";

/** Optional custom item type for consumers */
export type TrustItem = {
  label: string;
  sub?: string;
  /** Optional custom icon (24px/line-height friendly) */
  icon?: React.ReactNode;
};

type Props = {
  className?: string;
  /** Provide your own items; falls back to sensible defaults */
  items?: TrustItem[];
  /** Compact spacing variant */
  variant?: "default" | "compact";
  /** Change wrapper tag if needed (e.g., "div", "section") */
  as?: React.ElementType;
  /** Accessible label for the region */
  ariaLabel?: string;
};

/* ------------------------------ Default items ----------------------------- */

const DEFAULT_ITEMS: TrustItem[] = [
  { label: "ISO 9001:2015", sub: "Quality Management", icon: <BadgeIcon /> },
  { label: "17+ years", sub: "Industry experience", icon: <AwardIcon /> },
  { label: "30K+", sub: "Consultations", icon: <UsersIcon /> },
  { label: "Global", sub: "India · UAE · Canada", icon: <GlobeIcon /> },
];

/* -------------------------------- Component ------------------------------- */

export default function TrustBar({
  className = "",
  items = DEFAULT_ITEMS,
  variant = "default",
  as: Tag = "section",
  ariaLabel = "Trust and proof points",
}: Props) {
  const pad = variant === "compact" ? "px-3 py-2.5" : "px-4 py-3";

  return (
    <Tag
      className={[
        "rounded-3xl bg-white ring-1 ring-blue-100/80",
        "dark:bg-white/5 dark:ring-blue-900/30",
        pad,
        className,
      ].join(" ")}
      aria-label={ariaLabel}
    >
      {/* Mobile: swipeable cards */}
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x sm:hidden">
        {items.map((it) => (
          <li
            key={it.label}
            className="min-w-[12rem] snap-start rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-blue-100/70 backdrop-blur dark:bg-white/5 dark:ring-blue-900/40"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center text-blue-600 dark:text-blue-300">
                {it.icon ?? <Dot />}
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">{it.label}</div>
                {it.sub ? (
                  <div className="text-xs text-black/70 dark:text-white/70">{it.sub}</div>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* sm+: tidy grid */}
      <ul className="hidden grid-cols-2 gap-3 sm:grid md:grid-cols-4">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center text-blue-600 dark:text-blue-300">
              {it.icon ?? <Dot />}
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight">{it.label}</div>
              {it.sub ? (
                <div className="text-xs text-black/70 dark:text-white/70">{it.sub}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Tag>
  );
}

/* --------------------------------- Icons --------------------------------- */

function Dot() {
  return <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-current" />;
}

/** Exported so you can import and use in page.tsx if you want custom items */
export function BadgeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="currentColor" d="M5 3h14a1 1 0 011 1v8a7 7 0 11-14 0V4a1 1 0 011-1zM7 6h10v6a5 5 0 11-10 0V6z" />
      <path fill="currentColor" d="M12 12.75l-1.8.95.34-2.02-1.46-1.43 2.02-.29.9-1.83.9 1.83 2.02.29-1.46 1.43.34 2.02z" />
    </svg>
  );
}
export function AwardIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="currentColor" d="M12 2a6 6 0 100 12A6 6 0 0012 2zM8 22l4-2 4 2v-6a9 9 0 01-8 0v6z" />
    </svg>
  );
}
export function UsersIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="currentColor" d="M16 11a4 4 0 10-4-4 4 4 0 004 4zM6 13a3 3 0 10-3-3 3 3 0 003 3z" />
      <path fill="currentColor" d="M2 19a4 4 0 014-4h3a6 6 0 016 6H2zM14 15h2a6 6 0 016 6h-4.5a7.5 7.5 0 00-3.5-6z" />
    </svg>
  );
}
export function GlobeIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6">
      <path fill="currentColor" d="M12 2a10 10 0 1010 10A10.01 10.01 0 0012 2zm0 2c1.8 0 3.44 3.13 3.86 7H8.14C8.56 7.13 10.2 4 12 4zm-3.95 9h7.9c-.58 3.45-2.35 6-3.95 6s-3.37-2.55-3.95-6z" />
    </svg>
  );
}
