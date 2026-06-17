"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, FileDown, Gauge, Loader2 } from "lucide-react";

import { CurrencyProvider } from "@/lib/CurrencyProvider";
import { CurrencyGlassSelect } from "@/components/XiaTools/GlassSelect";
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
  const [report, setReport] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  const validReport = name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          consent: true,
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
      subtitle="A documented composite benchmark across affordability, speed, presence, family, due-diligence and passport power — orientation only, not a ranking of guaranteed outcomes."
      actions={<CurrencyGlassSelect />}
    >
      {/* Static KPI band (instant — Tier-4, no scroll-entrance) */}
      <div className="flex flex-wrap items-center gap-3">
        <Kpi value={programmes} label="programmes indexed" />
        <Kpi value={countries} label="countries" />
        <Kpi value={6} label="scoring factors" />
        <Link
          href="/xiphias-program-index/methodology"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-3 text-[13px] font-semibold text-[#9cc0ff] transition hover:border-[#4f8cff] hover:text-white"
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
        className="mt-6 overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-[#0c2350] to-[#0a1530] p-6 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.16em] text-secondary">
              <FileDown className="size-3.5" /> Full Index report
            </span>
            <h2 className="mt-4 text-[clamp(1.6rem,3.4vw,2.4rem)] font-black leading-tight text-white">
              The complete ranking, ready to share.
            </h2>
            <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-white/65">
              Every weighted component score, an advisor-ready summary, and all {programmes} programmes — delivered as a
              polished PDF.
            </p>
            <ul className="mt-5 grid gap-2.5">
              {[
                "Per-programme breakdown of all six factors",
                "Advisor-ready summary & recommended next steps",
                `All ${programmes} programmes across ${countries} countries`,
              ].map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-[13.5px] text-white/75">
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
                className="w-full rounded-xl border border-white/15 bg-[#0a1530] px-3.5 py-3 text-[14px] text-white placeholder-white/35 outline-none focus:border-[#4f8cff]"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-[#0a1530] px-3.5 py-3 text-[14px] text-white placeholder-white/35 outline-none focus:border-[#4f8cff]"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={startReport}
              disabled={!validReport || report.loading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3.5 text-[14px] font-bold text-[#0a1c44] transition hover:bg-[#f0cb3b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {report.loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
              Download full Index report
            </motion.button>
            {report.error && <p className="mt-2 text-[12.5px] text-rose-300">{report.error}</p>}
            <p className="mt-3 text-[11.5px] leading-relaxed text-white/40">{INDEX_DISCLAIMER}</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex justify-center">
        <Link
          href="/compare-programs"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          Compare specific programmes <ArrowRight className="size-4" />
        </Link>
      </div>
    </ToolShell>
  );
}

function Kpi({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3">
      <span className="text-[22px] font-black tabular-nums text-white">{value}</span>
      <span className="ml-2 text-[12.5px] text-white/55">{label}</span>
    </div>
  );
}
