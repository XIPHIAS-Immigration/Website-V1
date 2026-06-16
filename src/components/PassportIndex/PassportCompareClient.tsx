"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown, ShieldCheck, TrendingUp } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  bandClass,
  passportProfileHref,
  PassportIndexShell,
  PassportSourceNote,
  regionClass,
  scoreWidth,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

function PassportSelect({
  id,
  label,
  accentColor,
  records,
  value,
  onChange,
}: {
  id: string;
  label: string;
  accentColor: string;
  records: PassportRecord[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2">
        <span className="size-2 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="text-[11.5px] font-black uppercase tracking-[0.14em] text-[#505050]">{label}</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-[#E1E1E1] bg-white py-2.5 pl-3 pr-8 text-[13px] font-semibold text-[#263238] outline-none ring-[#1c57b4] focus:border-[#1c57b4] focus:ring-2 focus:ring-offset-1"
        >
          {records.map((record) => (
            <option key={record.code} value={record.code}>
              {record.country} · {record.rank} · {record.score}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
      </div>
    </div>
  );
}

function PassportCard({
  record,
  stats,
  accentColor,
  label,
}: {
  record: PassportRecord;
  stats: PassportStats;
  accentColor: string;
  label: string;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[#E1E1E1] bg-white shadow-sm">
      {/* Card top accent bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="flex flex-1 flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10.5px] font-black uppercase tracking-[0.18em]" style={{ color: accentColor }}>
              {label} · {record.code}
            </span>
            <h3 className="mt-1 text-xl font-black text-[#071a3a]">{record.country}</h3>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-black ${bandClass(record.band)}`}>
            {record.band}
          </span>
        </div>

        {/* Region pill */}
        <div className="mt-2">
          <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-black ${regionClass(record.region)}`}>
            {record.region}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] p-3">
            <p className="text-[10.5px] font-black uppercase tracking-[0.12em] text-[#505050]">Global rank</p>
            <p className="mt-1 text-2xl font-black text-[#071a3a]">{record.rank}</p>
          </div>
          <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] p-3">
            <p className="text-[10.5px] font-black uppercase tracking-[0.12em] text-[#505050]">Visa-free score</p>
            <p className="mt-1 text-2xl font-black" style={{ color: accentColor }}>{record.score}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#505050]">
            <span>Against top score</span>
            <span className="tabular-nums">{record.score} / {stats.topScore}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E1E1E1]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: scoreWidth(record.score, stats.topScore), backgroundColor: accentColor }}
            />
          </div>
        </div>

        {/* Advisory note */}
        <p className="mt-4 flex-1 text-[12.5px] leading-[1.65] text-[#505050]">
          {record.advisoryNote}
        </p>

        {/* Open profile */}
        <Link
          href={passportProfileHref(record)}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-black transition hover:gap-2.5"
          style={{ color: accentColor }}
        >
          Open full profile <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default function PassportCompareClient({ records, stats }: Props) {
  const [leftCode, setLeftCode] = useState("IN");
  const [rightCode, setRightCode] = useState("PT");

  const left = records.find((record) => record.code === leftCode) ?? records[0];
  const right = records.find((record) => record.code === rightCode) ?? records[1];
  const scoreDelta = right.score - left.score;
  const stronger = scoreDelta >= 0 ? right : left;
  const weaker = scoreDelta >= 0 ? left : right;
  const isSame = left.code === right.code;

  const LEFT_COLOR = "#1c57b4";
  const RIGHT_COLOR = "#0f6b47";

  return (
    <PassportIndexShell
      active="compare"
      eyebrow="Passport comparison"
      title="Compare two passports, then understand what the gap means."
      description="A visa-free score difference becomes useful only when it is connected to budget, timeline, family needs, and program eligibility."
    >
      <section className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">

          {/* ── Left selector panel ── */}
          <aside className="flex flex-col gap-4 rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">
            <div>
              <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Compare passports</p>
              <h2 className="mt-1 text-lg font-black text-[#071a3a]">Choose two passports</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#505050]">
                Select a current passport and a target, then review the gap and what it means for your client.
              </p>
            </div>

            {/* Selectors */}
            <div className="grid gap-3">
              <PassportSelect
                id="passport-left"
                label="Current passport"
                accentColor={LEFT_COLOR}
                records={records}
                value={leftCode}
                onChange={setLeftCode}
              />

              {/* VS divider */}
              <div className="flex items-center gap-3">
                <span className="flex-1 border-t border-dashed border-[#E1E1E1]" />
                <span className="flex size-7 items-center justify-center rounded-full border border-[#E1E1E1] bg-[#F5F7FA] text-[10px] font-black text-[#505050]">
                  VS
                </span>
                <span className="flex-1 border-t border-dashed border-[#E1E1E1]" />
              </div>

              <PassportSelect
                id="passport-right"
                label="Target passport"
                accentColor={RIGHT_COLOR}
                records={records}
                value={rightCode}
                onChange={setRightCode}
              />
            </div>

            {/* Mobility gap */}
            {isSame ? (
              <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] p-4 text-center">
                <p className="text-[12.5px] text-[#505050]">Select two different passports to see the mobility gap.</p>
              </div>
            ) : (
              <div className={[
                "rounded-lg border p-4",
                scoreDelta > 0 ? "border-emerald-200 bg-emerald-50" : scoreDelta < 0 ? "border-rose-200 bg-rose-50" : "border-[#E1E1E1] bg-[#F5F7FA]",
              ].join(" ")}>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`size-4 ${scoreDelta >= 0 ? "text-emerald-700" : "text-rose-700"}`} />
                  <p className={`text-[11px] font-black uppercase tracking-[0.14em] ${scoreDelta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    Mobility gap
                  </p>
                </div>
                <p className={`mt-2 text-4xl font-black tabular-nums ${scoreDelta >= 0 ? "text-emerald-800" : "text-rose-800"}`}>
                  {scoreDelta >= 0 ? "+" : ""}{scoreDelta}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-[#505050]">
                  <span className="font-black text-[#071a3a]">{stronger.country}</span> currently shows stronger visa-free access than{" "}
                  <span className="font-black text-[#071a3a]">{weaker.country}</span>.
                </p>
              </div>
            )}

            {/* CTA */}
            <Link
              href="/personal-booking"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c57b4] px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-[#1648a0]"
            >
              Talk to an advisor <ArrowRight className="size-3.5" />
            </Link>
          </aside>

          {/* ── Right content ── */}
          <div className="flex flex-col gap-5">

            {/* Two passport cards */}
            <div className="grid gap-5 sm:grid-cols-2">
              <PassportCard record={left} stats={stats} accentColor={LEFT_COLOR} label="Current" />
              <PassportCard record={right} stats={stats} accentColor={RIGHT_COLOR} label="Target" />
            </div>

            {/* XIPHIAS interpretation */}
            <div className="rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">
              <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Advisor interpretation</p>
              <h2 className="mt-1.5 text-xl font-black text-[#071a3a]">What XIPHIAS checks next</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { text: "Whether the target route is residence, citizenship, skilled migration, or corporate mobility." },
                  { text: "Whether the family can satisfy budget, source-of-funds, document, and physical-presence rules." },
                  { text: "Whether the mobility gain is worth the timeline, tax, risk, and compliance obligations." },
                ].map((item) => (
                  <div key={item.text} className="flex gap-2.5 rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] p-3.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1c57b4]" aria-hidden="true" />
                    <p className="text-[12.5px] leading-[1.6] text-[#505050]">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/eligibility"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1c57b4] px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-[#1648a0]"
                >
                  Run eligibility check <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  href="/personal-booking"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E1E1E1] px-4 py-2.5 text-[13px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff]"
                >
                  Talk to advisor
                </Link>
              </div>
            </div>

            {/* Compliance reminder */}
            <div className="flex gap-3 rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eef9f4] text-[#0f6b47]">
                <ShieldCheck className="size-4.5" />
              </span>
              <div>
                <h3 className="text-[13.5px] font-black text-[#071a3a]">Compliance reminder</h3>
                <p className="mt-1 text-[12.5px] leading-[1.65] text-[#505050]">
                  A high-ranking passport can still be the wrong route if source of funds, family eligibility, minimum stay, tax exposure, or sanction-screening risk does not fit the client profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
