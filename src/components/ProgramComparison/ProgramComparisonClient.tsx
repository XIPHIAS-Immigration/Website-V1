"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Minus, Plus, Scale, Users, X } from "lucide-react";

import { CurrencyProvider, useCurrency } from "@/lib/CurrencyProvider";
import { GlassSelect, CurrencyGlassSelect } from "@/components/XiaTools/GlassSelect";
import { ToolShell, IndicativeChip, AdvisorNote } from "@/components/XiaTools/ToolShell";
import { ComparisonTable, type CompareColumn, type CompareRow } from "./ComparisonTable";
import { estimateCost, type CostProgram } from "@/lib/cost-estimator";
import {
  passportRecordForCountry,
  PRESENCE_LABEL,
  PRESENCE_DETAIL,
  TAX_ADVISOR_NOTE,
  type PresenceKey,
} from "@/lib/program-metrics";
import { bandClass, ScorePill } from "@/components/PassportIndex/PassportIndexShared";
import { MeterBar } from "@/components/XiaTools/MeterBar";
import { passportIndexStats } from "@/data/passport-index";
import { BOOKING_ROUTE } from "@/lib/topmate";

export type ComparableProgram = CostProgram & {
  presence: PresenceKey;
  risk: "standard" | "enhanced" | "high";
  family: boolean;
};

const MAX = 4;

export default function ProgramComparisonClient({ programs }: { programs: ComparableProgram[] }) {
  return (
    <CurrencyProvider defaultCurrency="USD">
      <Inner programs={programs} />
    </CurrencyProvider>
  );
}

function useMoney() {
  const { currency, convert } = useCurrency();
  return (usd: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(
      convert(usd, "USD", currency),
    );
}

function PassportCell({ country }: { country: string }) {
  const rec = passportRecordForCountry(country);
  if (!rec) return <AdvisorNote>Not in ranked snapshot</AdvisorNote>;
  return (
    <div>
      <div className="flex items-center gap-2">
        <ScorePill score={rec.score} />
        <span className="text-[12px] text-white/55">{rec.rank}</span>
      </div>
      <MeterBar value={rec.score} max={passportIndexStats.topScore} height="h-1.5" className="mt-2" />
      <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10.5px] font-black ${bandClass(rec.band)}`}>
        {rec.band}
      </span>
    </div>
  );
}

function firstDistinct(programs: ComparableProgram[], n: number) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of programs) {
    if (seen.has(p.country)) continue;
    seen.add(p.country);
    out.push(p.id);
    if (out.length >= n) break;
  }
  return out;
}

function Inner({ programs }: { programs: ComparableProgram[] }) {
  const reduce = useReducedMotion();
  const money = useMoney();

  const byId = useMemo(() => new Map(programs.map((p) => [p.id, p])), [programs]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => firstDistinct(programs, 2));
  const [dependents, setDependents] = useState(0);

  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean) as ComparableProgram[];
  const remaining = programs.filter((p) => !selectedIds.includes(p.id));

  const add = (id: string) => {
    if (!id || selectedIds.includes(id) || selectedIds.length >= MAX) return;
    setSelectedIds((ids) => [...ids, id]);
  };
  const remove = (id: string) => setSelectedIds((ids) => ids.filter((x) => x !== id));

  const columns: CompareColumn[] = selected.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.country,
    href: p.href,
    onRemove: selected.length > 1 ? () => remove(p.id) : undefined,
  }));

  const rows: CompareRow[] = selected.length
    ? [
        {
          key: "cost",
          label: "Indicative cost",
          hint: `Family-tailored for ${1 + dependents} applicant(s)`,
          emphasize: true,
          cells: selected.map((p) => (
            <span className="text-[16px] font-black tabular-nums text-white">
              {money(estimateCost(p, dependents).totalUsd)}
            </span>
          )),
        },
        {
          key: "timeline",
          label: "Timeline",
          cells: selected.map((p) => <span>{p.timelineLabel}</span>),
        },
        {
          key: "presence",
          label: "Physical presence",
          hint: "Residency proxy — not day counts",
          cells: selected.map((p) => (
            <div>
              <span className="font-semibold text-white">{PRESENCE_LABEL[p.presence]}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-white/50">{PRESENCE_DETAIL[p.presence]}</span>
            </div>
          )),
        },
        {
          key: "tax",
          label: "Tax position",
          cells: selected.map(() => <AdvisorNote>{TAX_ADVISOR_NOTE}</AdvisorNote>),
        },
        {
          key: "passport",
          label: "Passport power gained",
          hint: "Visa-free mobility of the destination passport",
          cells: selected.map((p) => <PassportCell country={p.country} />),
        },
        {
          key: "risk",
          label: "Due-diligence intensity",
          cells: selected.map((p) => (
            <span className="capitalize">{p.risk === "high" ? "High — enhanced checks" : p.risk}</span>
          )),
        },
      ]
    : [];

  return (
    <ToolShell
      eyebrow="XIA · Compare Programs"
      title="Compare programmes on the numbers that matter."
      subtitle="Put 2–4 routes side by side — indicative cost, timeline, physical presence, tax position and the passport power you'd gain."
      actions={<CurrencyGlassSelect />}
    >
      {/* Picker (raised z so its dropdown overlays the comparison table below) */}
      <div className="relative z-30 rounded-3xl border border-white/12 bg-white/[0.04] p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {selected.map((p) => (
              <motion.span
                key={p.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="inline-flex items-center gap-2 rounded-full border border-[#4f8cff]/40 bg-[#4f8cff]/10 px-3 py-1.5 text-[13px] font-semibold text-white"
              >
                {p.country} — {p.title}
                {selected.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${p.title}`}
                    onClick={() => remove(p.id)}
                    className="grid size-4 place-items-center rounded-full text-white/55 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {selectedIds.length < MAX ? (
            <div className="block w-full sm:max-w-md">
              <span className="mb-1.5 block text-[12.5px] font-medium text-white/60">Add a programme (up to {MAX})</span>
              <GlassSelect
                value=""
                onChange={add}
                searchable
                options={remaining.map((p) => ({ value: p.id, label: `${p.country} — ${p.title}` }))}
                placeholder="Select a programme…"
                ariaLabel="Add a programme to compare"
              />
            </div>
          ) : (
            <p className="text-[13px] text-white/45">Maximum of {MAX} programmes — remove one to add another.</p>
          )}

          {/* Family size */}
          <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5">
            <span className="flex items-center gap-2 text-[13px] text-white/75">
              <Users className="size-4 text-[#9cc0ff]" /> Dependants
            </span>
            <button
              type="button"
              aria-label="Fewer dependants"
              onClick={() => setDependents((d) => Math.max(0, d - 1))}
              className="grid size-8 place-items-center rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/10"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-5 text-center font-black tabular-nums">{dependents}</span>
            <button
              type="button"
              aria-label="More dependants"
              onClick={() => setDependents((d) => Math.min(8, d + 1))}
              className="grid size-8 place-items-center rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white/10"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {selected.length >= 2 ? (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <IndicativeChip />
            </div>
            <ComparisonTable columns={columns} rows={rows} />
          </>
        ) : (
          <div className="grid min-h-[200px] place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
            <div>
              <Scale className="mx-auto size-7 text-[#9cc0ff]" />
              <p className="mt-3 text-[15px] text-white/70">Add at least two programmes to compare.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/passport-index/compare"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
        >
          Compare passports side by side
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href={BOOKING_ROUTE}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-[14px] font-bold text-[#0a1c44] transition hover:bg-[#f0cb3b]"
        >
          Discuss these routes with an advisor
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </ToolShell>
  );
}
