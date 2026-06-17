"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CalendarClock, FileDown, Loader2, Minus, Plus, Users } from "lucide-react";

import { CurrencyProvider, useCurrency } from "@/lib/CurrencyProvider";
import { GlassSelect, CurrencyGlassSelect } from "@/components/XiaTools/GlassSelect";
import { LeadGate } from "@/components/Eligibility/LeadGate";
import type { AnswerMap, Track } from "@/lib/eligibility/types";
import { estimateCost, COST_DISCLAIMER, type CostProgram } from "@/lib/cost-estimator";
import { ToolShell, IndicativeChip } from "@/components/XiaTools/ToolShell";
import { MeterBar } from "@/components/XiaTools/MeterBar";
import { BOOKING_ROUTE } from "@/lib/topmate";

const TRACKS = [
  { value: "all", label: "All" },
  { value: "citizenship", label: "Citizenship" },
  { value: "residency", label: "Residency" },
  { value: "skilled", label: "Skilled" },
  { value: "corporate", label: "Corporate" },
] as const;
type TrackFilter = (typeof TRACKS)[number]["value"];

const SPRING = { type: "spring" as const, stiffness: 360, damping: 30 };

export default function CostEstimatorClient({ programs }: { programs: CostProgram[] }) {
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

function Inner({ programs }: { programs: CostProgram[] }) {
  const reduce = useReducedMotion();
  const money = useMoney();

  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");
  const filtered = useMemo(
    () => programs.filter((p) => trackFilter === "all" || p.track === trackFilter),
    [programs, trackFilter],
  );
  const [selectedId, setSelectedId] = useState(programs[0]?.id ?? "");
  const selected = useMemo(
    () => filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? programs[0],
    [filtered, selectedId, programs],
  );

  const [dependents, setDependents] = useState(0);
  const breakdown = useMemo(() => (selected ? estimateCost(selected, dependents) : null), [selected, dependents]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pdf, setPdf] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  if (!selected || !breakdown) {
    return (
      <ToolShell eyebrow="XIA · Cost Estimator" title="Family cost estimator" subtitle="No programmes are available right now.">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-white/60">No programmes found.</div>
      </ToolShell>
    );
  }

  async function submitLead() {
    try {
      await fetch("/api/platform/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          source: "programme_ai",
          page: "/cost-estimator",
          track: selected.track,
          country: selected.country,
          program: selected.title,
          message: `Cost estimator: ${selected.title} · ${breakdown!.familySize} applicant(s) · ~${Math.round(breakdown!.totalUsd)} USD indicative`,
          consent: true,
          tags: ["cost-estimator", "xia-tools"],
        }),
      });
    } catch {
      /* soft capture — never block the UI on a network error */
    } finally {
      setUnlocked(true);
    }
  }

  async function startPdf() {
    if (!name || !email) return;
    setPdf({ loading: true, error: null });
    try {
      const res = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          productType: "premium_report",
          productName: `Cost estimate — ${selected.title}`,
          track: selected.track,
          country: selected.country,
          program: selected.title,
          page: "/cost-estimator",
          consent: true,
          answers: {
            program: selected.title,
            dependents,
            familySize: breakdown!.familySize,
            estimatedTotalUsd: Math.round(breakdown!.totalUsd),
          },
        }),
      });
      const data = await res.json();
      if (data?.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }
      setPdf({ loading: false, error: data?.error || "Could not start checkout. Please try again." });
    } catch {
      setPdf({ loading: false, error: "Could not start checkout. Please try again." });
    }
  }

  return (
    <ToolShell
      eyebrow="XIA · Cost Estimator"
      title="What will this route cost your family?"
      subtitle="Pick a programme and your family size for an itemized, indicative estimate — government fees, due diligence, dependants and professional fees — ready for advisor review."
      actions={<CurrencyGlassSelect />}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Controls ── */}
        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#9cc0ff]">1 · Choose a programme</h2>

          {/* Track tabs — layoutId active indicator */}
          <div className="mt-3 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {TRACKS.map((t) => {
              const active = trackFilter === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTrackFilter(t.value)}
                  className="relative rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="ce-track-active"
                      className="absolute inset-0 rounded-lg bg-[#1c57b4]"
                      transition={reduce ? { duration: 0 } : SPRING}
                    />
                  )}
                  <span className={`relative ${active ? "text-white" : "text-white/55"}`}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Programme select */}
          <div className="mt-4">
            <span className="mb-1.5 block text-[13px] font-medium text-white/70">Programme</span>
            <GlassSelect
              value={selected.id}
              onChange={setSelectedId}
              searchable
              options={filtered.map((p) => ({ value: p.id, label: `${p.country} — ${p.title}` }))}
              placeholder="Select a programme…"
              ariaLabel="Select a programme"
            />
          </div>

          {/* Dependents stepper */}
          <div className="mt-6">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#9cc0ff]">2 · Family size</h2>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
              <span className="flex items-center gap-2 text-[14px] text-white/80">
                <Users className="size-4 text-[#9cc0ff]" /> Dependants (besides you)
              </span>
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  aria-label="Fewer dependants"
                  onClick={() => setDependents((d) => Math.max(0, d - 1))}
                  className="grid size-9 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white hover:bg-white/10"
                >
                  <Minus className="size-4" />
                </motion.button>
                <span className="w-6 text-center text-lg font-black tabular-nums">{dependents}</span>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  aria-label="More dependants"
                  onClick={() => setDependents((d) => Math.min(8, d + 1))}
                  className="grid size-9 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white hover:bg-white/10"
                >
                  <Plus className="size-4" />
                </motion.button>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] text-white/45">
              Total applicants:{" "}
              <span className="font-semibold text-white/75 tabular-nums">{breakdown.familySize}</span> (you + {dependents})
            </p>
          </div>

          <Link
            href={selected.href}
            className="mt-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#9cc0ff] hover:text-white"
          >
            View the {selected.country} programme page
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* ── Result ── */}
        <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
          {/* Free top-line (instant, no entrance animation on figures) */}
          <p className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#9cc0ff]">Indicative total</p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <motion.span
              key={breakdown.totalUsd}
              initial={reduce ? false : { opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-none tabular-nums text-white"
            >
              {money(breakdown.totalUsd)}
            </motion.span>
            <span className="pb-1 text-[14px] text-white/55">
              for {breakdown.familySize} {breakdown.familySize === 1 ? "applicant" : "applicants"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13.5px] text-white/70">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5">
              <CalendarClock className="size-4 text-[#9cc0ff]" /> Timeline: {breakdown.timelineLabel}
            </span>
            <IndicativeChip />
          </div>

          {/* Gated detail */}
          <div className="mt-6 min-h-[320px]">
            <AnimatePresence mode="wait" initial={false}>
              {!unlocked ? (
                <motion.div
                  key="gate"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <p className="mb-3 text-[14px] text-white/70">
                    Unlock the full itemized breakdown — government fees, due diligence, dependant add-ons and service
                    fees — by sharing where to send it.
                  </p>
                  <LeadGate
                    track={selected.track as Track}
                    answers={{} as AnswerMap}
                    name={name}
                    setName={setName}
                    email={email}
                    setEmail={setEmail}
                    phone={phone}
                    setPhone={setPhone}
                    onSubmitAction={submitLead}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#9cc0ff]">Itemized estimate</h3>
                  <ul className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/12 bg-white/[0.03]">
                    {breakdown.lineItems.map((item) => (
                      <li key={item.key} className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-4">
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-white">{item.label}</span>
                            <span className="mt-0.5 block text-[12px] leading-relaxed text-white/50">{item.note}</span>
                          </span>
                          <span className="shrink-0 text-[15px] font-black tabular-nums text-white">
                            {money(item.amountUsd)}
                          </span>
                        </div>
                        <MeterBar
                          value={item.amountUsd}
                          max={breakdown.totalUsd}
                          color="#4f8cff"
                          height="h-1"
                          className="mt-2.5"
                        />
                      </li>
                    ))}
                    <li className="flex items-center justify-between gap-4 rounded-b-2xl bg-[#1c57b4]/20 px-4 py-3.5">
                      <span className="text-[14px] font-black uppercase tracking-[0.1em] text-[#9cc0ff]">
                        Estimated total
                      </span>
                      <span className="text-[18px] font-black tabular-nums text-white">{money(breakdown.totalUsd)}</span>
                    </li>
                  </ul>

                  <p className="mt-3 text-[12px] leading-relaxed text-white/45">{COST_DISCLAIMER}</p>

                  {/* Paid PDF + advisor CTA */}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={startPdf}
                      disabled={pdf.loading}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-[14px] font-bold text-[#0a1c44] transition hover:bg-[#f0cb3b] disabled:opacity-60"
                    >
                      {pdf.loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
                      Download full PDF report
                    </motion.button>
                    <Link
                      href={BOOKING_ROUTE}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
                    >
                      Discuss this route
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                  {pdf.error && <p className="mt-2 text-[12.5px] text-rose-300">{pdf.error}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
