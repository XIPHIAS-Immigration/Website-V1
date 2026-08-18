"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, FileDown, Gauge, Loader2 } from "lucide-react";

import { CurrencyProvider } from "@/lib/CurrencyProvider";
import { ToolShell, IndicativeChip } from "@/components/XiaTools/ToolShell";
import ProgramRankingClient from "./ProgramRankingClient";
import { INDEX_DISCLAIMER, type ProgramIndexItem } from "@/lib/program-index";

export default function ProgramIndexClient({ programs }: { programs: ProgramIndexItem[] }) {
  return (
    <CurrencyProvider defaultCurrency="USD">
      <Inner programs={programs} />
    </CurrencyProvider>
  );
}

function Inner({ programs }: { programs: ProgramIndexItem[] }) {
  const reduce = useReducedMotion();
  const programmes = programs.length;
  const countries = new Set(programs.map((p) => p.country)).size;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [report, setReport] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  const validReport = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && consent;

  async function startReport() {
    if (!validReport || report.loading) return;
    setReport({ loading: true, error: null });
    try {
      const res = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          productType: "premium_report",
          productName: "XIPHIAS Program Index report",
          page: "/xiphias-program-index",
          consent,
          answers: { programmesIndexed: programmes, countries },
        }),
      });
      const data = await res.json();
      if (data?.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }
      setReport({ loading: false, error: data?.error || "Could not start checkout. Please try again." });
    } catch {
      setReport({ loading: false, error: "Could not start checkout. Please try again." });
    }
  }

  return (
    <ToolShell
      eyebrow="XIA · Program Index"
      title="The XIPHIAS Program Index."
      subtitle="Explore programmes through a transparent orientation benchmark while keeping different route families separate. Each ranking shows its data confidence and the factors behind the score."
      steps={[
        { title: "Choose a route family", description: "Filter skilled, corporate, residence and citizenship programmes so unlike objectives are not mixed by default." },
        { title: "Set your decision priorities", description: "Review supplied capital, timing, presence, family, due-diligence and destination-mobility factors." },
        { title: "Inspect the ranking and confidence", description: "See the factor scores, underlying data completeness and published methodology before using the index for orientation." },
      ]}
      benefits={["Route-family filters", "Visible data confidence", "Documented scoring method"]}
      contactContext="Programme Index"
      contactId="programme-index"
    >
      {/* Static KPI band (instant — Tier-4, no scroll-entrance) */}
      <div className="flex flex-wrap items-center gap-3">
        <Kpi value={programmes} label="Programmes Indexed" />
        <Kpi value={countries} label="Countries" />
        <Kpi value={6} label="Scoring Factors" />
        <Link
          href="/xiphias-program-index/methodology"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-3 text-[13px] font-semibold text-secondary transition hover:border-secondary hover:text-white"
        >
          <Gauge className="size-4" /> How it&apos;s scored
        </Link>
        <IndicativeChip />
      </div>

      {/* Ranking — full width; rows scroll inside a bounded container */}
      <div className="mt-6 rounded-3xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <ProgramRankingClient programs={programs} />
      </div>

      {/* Full Index report — contained band BELOW the table */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 overflow-hidden rounded-lg border border-white/25 bg-black/10 p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="type-caption inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3.5 py-1.5 uppercase text-secondary">
              <FileDown className="size-3.5" /> Full Index report
            </span>
            <h2 className="type-section-title mt-4 text-white">
              The complete ranking, ready to share.
            </h2>
            <p className="type-small mt-3 max-w-md text-white/70">
              Every weighted component score, an advisor-ready summary, and all {programmes} programmes — delivered as a
              polished PDF.
            </p>
            <ul className="mt-5 grid gap-2.5">
              {[
                "Per-programme breakdown of all six factors",
                "Advisor-ready summary & recommended next steps",
                `All ${programmes} programmes across ${countries} countries`,
              ].map((b) => (
                <li key={b} className="type-small flex items-center gap-2.5 text-white/75">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary">
                    <Check className="size-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-5 sm:p-6">
            <div className="space-y-2.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className="w-full rounded-lg border border-white/25 bg-black/10 px-3.5 py-3 text-[14px] text-white placeholder-white/50 outline-none focus:border-secondary"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-white/25 bg-black/10 px-3.5 py-3 text-[14px] text-white placeholder-white/50 outline-none focus:border-secondary"
              />
            </div>
            <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-white/60"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-secondary" />I consent to these details being used for checkout, report generation and delivery.</label>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={startReport}
              disabled={!validReport || report.loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-3.5 text-[14px] font-bold text-primary transition hover:bg-[#f0cb3b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {report.loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              Download full Index report
            </motion.button>
            {report.error && <p className="mt-2 text-[12.5px] text-rose-300">{report.error}</p>}
            <p className="type-caption mt-3 font-normal text-white/50">{INDEX_DISCLAIMER}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex justify-center">
        <Link
          href="/compare-programs"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          Compare Specific Programmes <ArrowRight className="size-4" />
        </Link>
      </div>
    </ToolShell>
  );
}

function Kpi({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3">
      <span className="text-[22px] font-black tabular-nums text-white">{value}</span>
      <span className="type-caption ml-2 font-normal text-white/60">{label}</span>
    </div>
  );
}
