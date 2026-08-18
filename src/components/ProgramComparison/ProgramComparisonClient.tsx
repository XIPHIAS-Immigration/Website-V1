"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, FileDown, Minus, Plus, Scale, Users, X } from "lucide-react";

import { CurrencyProvider, useCurrency } from "@/lib/CurrencyProvider";
import { GlassSelect } from "@/components/XiaTools/GlassSelect";
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
  benefits: string[];
  residencyOutcome: string;
  familySummary: string;
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
        <span className="type-caption font-normal text-white/60">{rec.rank}</span>
      </div>
      <MeterBar value={rec.score} max={passportIndexStats.topScore} height="h-1.5" className="mt-2" />
      <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10.5px] font-black ${bandClass(rec.band)}`}>
        {rec.band}
      </span>
    </div>
  );
}

function Inner({ programs }: { programs: ComparableProgram[] }) {
  const reduce = useReducedMotion();
  const money = useMoney();

  const byId = useMemo(() => new Map(programs.map((p) => [p.id, p])), [programs]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dependents, setDependents] = useState(0);

  const selected = selectedIds.map((id) => byId.get(id)).filter(Boolean) as ComparableProgram[];
  const selectedTrack = selected[0]?.track;
  const remaining = programs.filter((p) => !selectedIds.includes(p.id) && (!selectedTrack || p.track === selectedTrack));
  const reportHref = `/express-reports?report=compare_report&programmes=${encodeURIComponent(selected.map((item) => item.title).join("\n"))}`;

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
    onRemove: () => remove(p.id),
  }));

  const rows: CompareRow[] = selected.length
    ? [
        {
          key: "cost",
          label: "Known catalogue amount",
          hint: `For ${1 + dependents} applicant(s); pending fees are excluded`,
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
          key: "benefits",
          label: "Benefits",
          hint: "Highlights from the programme page",
          cells: selected.map((p) => (
            <ul className="space-y-1.5">
              {p.benefits.slice(0, 3).map((benefit) => (
                <li key={benefit} className="flex gap-2">
                  <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secondary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )),
        },
        {
          key: "residency",
          label: "Residency",
          hint: "Status or settlement pathway",
          cells: selected.map((p) => <span>{p.residencyOutcome}</span>),
        },
        {
          key: "family",
          label: "Family",
          hint: "Indicative dependant inclusion",
          cells: selected.map((p) => (
            <div>
              <span className="font-semibold text-white">{p.family ? "Family route" : "Main applicant route"}</span>
              <span className="type-caption mt-0.5 block font-normal text-white/55">{p.familySummary}</span>
            </div>
          )),
        },
        {
          key: "presence",
          label: "Physical presence",
          hint: "Residency proxy — not day counts",
          cells: selected.map((p) => (
            <div>
              <span className="font-semibold text-white">{PRESENCE_LABEL[p.presence]}</span>
              <span className="type-caption mt-0.5 block font-normal text-white/50">{PRESENCE_DETAIL[p.presence]}</span>
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
          label: "Destination passport context",
          hint: "Context only; this route does not automatically grant that passport",
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
      title="Compare Programmes on the Numbers That Matter."
      subtitle="Compare two to four programmes from the same route family using decision-relevant facts. XIA keeps missing costs visible and never presents residence or work permission as automatic citizenship."
      steps={[
        { title: "Select the first programme", description: "Your first choice establishes the route family so later choices remain comparable." },
        { title: "Add up to three alternatives", description: "Compare supplied costs, timelines, benefits, family inclusion, presence expectations and due-diligence intensity." },
        { title: "Review the trade-offs", description: "Use the side-by-side result to identify missing information and the questions to take to an advisor." },
      ]}
      benefits={["User-selected programmes", "Like-for-like route families", "Missing data shown explicitly"]}
      contactContext="Programme Comparison"
      contactId="compare-programmes"
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
                className="type-small inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-3 py-1.5 font-bold text-white"
              >
                {p.country} — {p.title}
                {(
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
              <span className="type-caption mb-1.5 block font-normal text-white/60">{selectedTrack ? `Add another ${selectedTrack} programme` : `Select the first programme (up to ${MAX})`}</span>
              <GlassSelect
                value=""
                onChange={add}
                searchable
                options={remaining.map((p) => ({ value: p.id, label: `${p.country} — ${p.title}` }))}
                placeholder="Select a Programme…"
                ariaLabel="Add a Programme to compare"
              />
            </div>
          ) : (
            <p className="type-small text-white/60">Maximum of {MAX} Programmes — remove one to add another.</p>
          )}

          {/* Family size */}
          <div className="flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2.5">
            <span className="type-small flex items-center gap-2 text-white/75">
              <Users className="size-4 text-secondary" /> Dependants
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
              <Scale className="mx-auto size-7 text-secondary" />
              <p className="type-body mt-3 text-white/80">Add at least two Programmes to compare.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href={reportHref}
          aria-disabled={selected.length < 2}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3.5 text-[14px] font-bold text-primary transition hover:bg-[#f0cb3b] ${selected.length < 2 ? "pointer-events-none opacity-50" : ""}`}
        >
          <FileDown className="size-4" />
          Buy personalised comparison report
        </Link>
        <Link
          href="/passport-index/compare"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
        >
          Compare passports side by side
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href={BOOKING_ROUTE}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
        >
          Discuss these routes with an advisor
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </ToolShell>
  );
}
