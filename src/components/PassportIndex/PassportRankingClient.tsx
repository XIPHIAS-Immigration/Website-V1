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
      <section className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">

        {/* ── Section header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">
              Global mobility table
            </p>
            <h2 className="mt-1.5 text-2xl font-black text-[#071a3a]">
              {filteredRecords.length} passports ranked
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#505050]">
              Filter by region or search by name. Ranking is a starting point — not the final recommendation.
            </p>
          </div>

          {/* Search */}
          <label className="relative block w-full sm:w-72 shrink-0">
            <span className="sr-only">Search passports</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country, code, or band…"
              className="w-full rounded-lg border border-[#E1E1E1] bg-white py-2.5 pl-9 pr-3 text-[13px] text-[#263238] placeholder:text-[#9ca3af] outline-none ring-[#1c57b4] focus:border-[#1c57b4] focus:ring-2 focus:ring-offset-1"
            />
          </label>
        </div>

        {/* ── Region filter pills ── */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={[
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-black transition",
                region === item
                  ? "border-[#1c57b4] bg-[#1c57b4] text-white"
                  : "border-[#E1E1E1] bg-white text-[#505050] hover:border-[#1c57b4] hover:text-[#1c57b4]",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-[#E1E1E1] bg-white shadow-sm">

          {/* Table header */}
          <div className="hidden grid-cols-[68px_1fr_110px_80px_1fr_80px] gap-x-4 bg-[#071a3a] px-5 py-3 text-[10.5px] font-black uppercase tracking-[0.14em] text-white/60 lg:grid">
            <span>Rank</span>
            <span>Passport</span>
            <span>Region</span>
            <span>Score</span>
            <span>XIPHIAS lens</span>
            <span>Profile</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E1E1E1]">
            {filteredRecords.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-semibold text-[#505050]">No passports match your search.</p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setRegion("All"); }}
                  className="mt-3 text-sm font-black text-[#1c57b4] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <article
                  key={record.code}
                  className={[
                    "grid items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-[#F5F7FA]",
                    "lg:grid-cols-[68px_1fr_110px_80px_1fr_80px]",
                    index % 2 === 0 ? "bg-white" : "bg-[#fafbfc]",
                  ].join(" ")}
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className="text-[15px] font-black leading-tight text-[#071a3a]">
                      {record.rank}
                    </span>
                  </div>

                  {/* Passport — country name + band on one row */}
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="text-[13.5px] font-black text-[#071a3a]">{record.country}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${bandClass(record.band)}`}>
                      {record.band}
                    </span>
                  </div>

                  {/* Region */}
                  <span className={`w-fit rounded-full px-2.5 py-1 text-[10.5px] font-black ${regionClass(record.region)}`}>
                    {record.region}
                  </span>

                  {/* Score — pill only, no bar */}
                  <span className="inline-flex w-fit min-w-[44px] items-center justify-center rounded-full bg-[#1c57b4] px-2.5 py-1 text-[12px] font-black text-white tabular-nums">
                    {record.score}
                  </span>

                  {/* XIPHIAS lens */}
                  <p className="text-[12.5px] leading-[1.6] text-[#505050]">
                    {record.xiphiasLens}
                  </p>

                  {/* Profile link */}
                  <Link
                    href={passportProfileHref(record)}
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#E1E1E1] px-3 py-1.5 text-[12px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff]"
                  >
                    Open <ArrowRight className="size-3" />
                  </Link>
                </article>
              ))
            )}
          </div>

          {/* Table footer */}
          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#E1E1E1] bg-[#F5F7FA] px-5 py-2.5">
              <p className="text-[11.5px] text-[#505050]">
                Showing{" "}
                <span className="font-black text-[#071a3a]">{filteredRecords.length}</span>
                {" "}of{" "}
                <span className="font-black text-[#071a3a]">{records.length}</span> passports
                {region !== "All" && (
                  <> · <span className="font-black text-[#1c57b4]">{region}</span></>
                )}
              </p>
              <p className="hidden text-[11px] text-[#9ca3af] sm:block">
                Top score: <span className="font-black text-[#071a3a]">{stats.topScore}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
