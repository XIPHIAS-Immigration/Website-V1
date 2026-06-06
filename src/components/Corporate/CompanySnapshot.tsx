// src/components/Corporate/CompanySnapshot.tsx
"use client";

import * as React from "react";
import {
  Building2,
  Landmark,
  BriefcaseBusiness,
  IdCard,
  CheckCircle2,
  BadgeCheck,
  Network,
  type LucideIcon,
} from "lucide-react";

type Primitive = string | number | boolean | null | undefined;
type Value = Primitive | React.ReactNode;

type SnapshotProps = {
  /** Free Zone / Mainland / Offshore etc. */
  structure: Value;
  /** 100% foreign owned, local sponsor 51/49, etc. */
  ownership: Value;
  /** Flexi-desk, shared office, dedicated office (sqm), etc. */
  office: Value;
  /** Indicative initial quota the entity can request/obtain */
  visaQuota?: Value;
  /** Bank account readiness (e.g., true/"Yes (most banks)"/"Depends") */
  bankReady?: Value;

  /** Optional corporate-specific extras */
  zone?: Value; // e.g., "DMCC", "IFZA", "RAKEZ"
  license?: Value; // e.g., "Professional", "Commercial"
  establishmentCard?: Value; // true/"Issued"/"Pending"
  eChannels?: Value; // true/false or text

  /** Optional chips to render as highlights */
  highlights?: string[];
  /** Optional small caption under the title */
  caption?: string;
  /** Optional CTA area on the right of header */
  actions?: React.ReactNode;

  /** Layout & state */
  className?: string;
  gridCols?: 2 | 3; // default 3 on lg
  loading?: boolean;
};

/* ---------- helpers ---------- */

function fmt(v: Value): React.ReactNode {
  if (React.isValidElement(v)) return v;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v === null || v === undefined) return "—";
  return String(v);
}

function CardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/60 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-black/5 dark:bg-white/10 animate-pulse" />
        <div className="min-w-0 flex-1">
          <div className="h-3 w-24 rounded bg-black/10 dark:bg-white/10" />
          <div className="mt-2 h-4 w-40 rounded bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

/* ---------- component ---------- */

export default function CompanySnapshot({
  structure,
  ownership,
  office,
  visaQuota,
  bankReady,
  zone,
  license,
  establishmentCard,
  eChannels,
  highlights,
  caption,
  actions,
  gridCols = 3,
  className,
  loading = false,
}: SnapshotProps) {
  type Row = {
    label: string;
    value: Value;
    Icon: LucideIcon;
    hint?: string;
  };

  const base: Array<Row | null> = [
    { label: "Entity type", value: structure, Icon: Building2 },
    { label: "Ownership", value: ownership, Icon: Landmark },
    { label: "Office / facility", value: office, Icon: BriefcaseBusiness },
    zone != null ? { label: "Free zone / Mainland", value: zone, Icon: Network } : null,
    license != null ? { label: "License type", value: license, Icon: BadgeCheck } : null,
    visaQuota != null ? { label: "Indicative visa quota", value: visaQuota, Icon: IdCard } : null,
    bankReady != null
      ? { label: "Bank account readiness", value: bankReady, Icon: CheckCircle2 }
      : null,
    establishmentCard != null
      ? { label: "Establishment card", value: establishmentCard, Icon: IdCard }
      : null,
    eChannels != null
      ? { label: "E-channels / sponsor profile", value: eChannels, Icon: Network }
      : null,
  ];

  const items = base.filter(Boolean) as Row[];

  const gridClass =
    gridCols === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";

  return (
    <section
      className={[
        "rounded-2xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-white/70 dark:bg-neutral-900/40 p-5",
        className || "",
      ].join(" ")}
      aria-labelledby="company-snapshot-title"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 id="company-snapshot-title" className="text-lg font-semibold">
            Company snapshot
          </h2>
          {caption ? <p className="mt-1 text-sm opacity-80">{caption}</p> : null}
          {!!highlights?.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {highlights.slice(0, 8).map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ring-1 ring-neutral-200 dark:ring-neutral-700"
                >
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>

      <div className={gridClass}>
        {loading
          ? Array.from({ length: Math.max(6, items.length || 6) }).map((_, i) => (
              <CardSkeleton key={`s-${i}`} />
            ))
          : items.map(({ label, value, Icon }) => (
              <article
                key={label}
                className="relative overflow-hidden rounded-xl ring-1 ring-neutral-200/70 dark:ring-neutral-800/70 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/60 p-4"
                aria-label={label}
                title={typeof value === "string" ? value : undefined}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10">
                    <Icon className="h-5 w-5 opacity-80" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide opacity-70">
                      {label}
                    </div>
                    <div className="mt-0.5 text-[15px] font-medium leading-6 break-words">
                      {fmt(value)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </section>
  );
}
