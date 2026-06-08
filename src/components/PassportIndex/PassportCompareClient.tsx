"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  bandClass,
  PassportBookVisual,
  PassportIndexShell,
  PassportSourceNote,
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
  records,
  value,
  onChange,
}: {
  id: string;
  label: string;
  records: PassportRecord[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-black text-[#071a3a] dark:text-white">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none ring-[#1c57b4] focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {records.map((record) => (
          <option key={record.code} value={record.code}>
            {record.country} - {record.rank} - {record.score}
          </option>
        ))}
      </select>
    </label>
  );
}

function SummaryCard({ record, stats }: { record: PassportRecord; stats: PassportStats }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1c57b4]">{record.code}</p>
          <h3 className="mt-1 text-2xl font-black text-[#071a3a] dark:text-white">{record.country}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-black ${bandClass(record.band)}`}>{record.band}</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">Global rank</p>
          <p className="mt-1 text-3xl font-black text-[#071a3a] dark:text-white">{record.rank}</p>
        </div>
        <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">Visa-free score</p>
          <p className="mt-1 text-3xl font-black text-[#1c57b4]">{record.score}</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>Against top score</span>
          <span>{record.score} / {stats.topScore}</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-[#e1b923]" style={{ width: scoreWidth(record.score, stats.topScore) }} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{record.advisoryNote}</p>
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

  return (
    <PassportIndexShell
      active="compare"
      eyebrow="Passport comparison"
      title="Compare two passports, then understand what the gap means."
      description="A visa-free score difference becomes useful only when it is connected to budget, timeline, family needs, and program eligibility."
    >
      <section className="mx-auto grid max-w-screen-2xl gap-5 px-4 py-10 md:px-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex size-12 items-center justify-center rounded-md bg-[#eaf2ff] text-[#1c57b4]">
            <Compass className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#071a3a] dark:text-white">Choose passports</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Start with the current passport, then compare it with a target passport or long-term route outcome.
          </p>
          <div className="mt-5 grid gap-4">
            <PassportSelect id="passport-left" label="Current passport" records={records} value={leftCode} onChange={setLeftCode} />
            <PassportSelect id="passport-right" label="Target comparison" records={records} value={rightCode} onChange={setRightCode} />
          </div>

          <div className="mt-5 rounded-lg border border-[#e1b923]/45 bg-[#fff8df] p-4 text-[#2c250d]">
            <p className="text-sm font-black">Mobility gap</p>
            <p className="mt-1 text-5xl font-black">
              {scoreDelta >= 0 ? "+" : ""}
              {scoreDelta}
            </p>
            <p className="mt-2 text-sm leading-6">
              {left.code === right.code
                ? "You selected the same passport. Choose a different target to see the gap."
                : `${stronger.country} currently shows stronger visa-free access than ${weaker.country} in this snapshot.`}
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <SummaryCard record={left} stats={stats} />
            <SummaryCard record={right} stats={stats} />
          </div>

          <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1c57b4]">Advisor interpretation</p>
              <h2 className="mt-2 text-3xl font-black text-[#071a3a] dark:text-white">What XIPHIAS checks next</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Whether the target route is residence, citizenship, skilled migration, or corporate mobility.",
                  "Whether the family can satisfy budget, source-of-funds, document, and physical-presence rules.",
                  "Whether the mobility gain is worth the timeline, tax, risk, and compliance obligations.",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1c57b4]" />
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/eligibility"
                  className="inline-flex items-center gap-2 rounded-md bg-[#1c57b4] px-4 py-3 text-sm font-black text-white transition hover:bg-[#15458f]"
                >
                  Run eligibility check <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/personal-booking"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Talk to advisor
                </Link>
              </div>
            </div>
            <div className="group">
              <PassportBookVisual featured={stronger} />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#eef9f4] text-[#0f6b47]">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-[#071a3a] dark:text-white">Compliance reminder</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  A high-ranking passport can still be the wrong route if source of funds, family eligibility, minimum stay, tax exposure, or sanction-screening risk does not fit the client profile.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
