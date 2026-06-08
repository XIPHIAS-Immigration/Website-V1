"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import type { PassportRecord, PassportRegion } from "@/data/passport-index";
import {
  bandClass,
  passportProfileHref,
  PassportIndexShell,
  PassportSourceNote,
  regionClass,
  scoreWidth,
  ScorePill,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";

type Props = {
  records: PassportRecord[];
  regions: Array<PassportRegion | "All">;
  stats: PassportStats;
};

export default function PassportRankingClient({ records, regions, stats }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<PassportRegion | "All">("All");

  const filteredRecords = useMemo(() => {
    const term = query.trim().toLowerCase();

    return records.filter((record) => {
      const regionMatch = region === "All" || record.region === region;
      const textMatch =
        !term ||
        record.country.toLowerCase().includes(term) ||
        record.code.toLowerCase().includes(term) ||
        record.rank.toLowerCase().includes(term) ||
        record.band.toLowerCase().includes(term);

      return regionMatch && textMatch;
    });
  }, [query, records, region]);

  return (
    <PassportIndexShell
      active="ranking"
      eyebrow="Passport ranking"
      title="Search passport strength without losing the advisor context."
      description="Use the table to understand the mobility score, then open a passport profile for the practical XIPHIAS interpretation."
    >
      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">
              {filteredRecords.length} visible passports
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#071a3a] dark:text-white">Global mobility table</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Filter by region or search by country. The ranking is a starting point, not the final recommendation.
            </p>
          </div>

          <label className="relative block">
            <span className="sr-only">Search passports</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country, code, rank, or band"
              className="w-full rounded-md border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-950 outline-none ring-[#1c57b4] focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={[
                "shrink-0 rounded-md border px-4 py-2 text-sm font-black transition",
                region === item
                  ? "border-[#1c57b4] bg-[#1c57b4] text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#1c57b4] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden grid-cols-[88px_1.1fr_1fr_120px_1fr_120px] bg-[#071a3a] px-4 py-3 text-sm font-black text-white lg:grid">
            <span>Rank</span>
            <span>Passport</span>
            <span>Region</span>
            <span>Score</span>
            <span>XIPHIAS lens</span>
            <span>Profile</span>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredRecords.map((record) => (
              <article
                key={record.code}
                className="grid gap-3 bg-white px-4 py-4 dark:bg-slate-900 lg:grid-cols-[88px_1.1fr_1fr_120px_1fr_120px] lg:items-center"
              >
                <span className="text-xl font-black text-[#071a3a] dark:text-white">{record.rank}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-[#071a3a] dark:text-white">{record.country}</h3>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${bandClass(record.band)}`}>
                      {record.band}
                    </span>
                  </div>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {record.code}
                  </span>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${regionClass(record.region)}`}>
                  {record.region}
                </span>
                <div>
                  <ScorePill score={record.score} />
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-[#e1b923]" style={{ width: scoreWidth(record.score, stats.topScore) }} />
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{record.xiphiasLens}</p>
                <Link
                  href={passportProfileHref(record)}
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Open <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
