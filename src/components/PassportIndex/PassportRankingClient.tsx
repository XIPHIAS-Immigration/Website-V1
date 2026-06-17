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
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";
import Reveal from "@/components/motion/Reveal";

type Props = {
  records: PassportRecord[];
  regions: Array<PassportRegion | "All">;
  stats: PassportStats;
};

function barColor(band: PassportRecord["band"]) {
  if (band === "Elite access") return "#10b981";
  if (band === "High access") return "#3b82f6";
  if (band === "Strategic mobility") return "#e1b923";
  return "#f43f5e";
}

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
      title="Search passport strength, keep the advisor context."
      description="Read the mobility score and band, then open a passport profile for the practical XIPHIAS interpretation and routes."
    >
      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        {/* Header + search */}
        <Reveal className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Global mobility table</p>
            <h2 className="mt-1.5 text-3xl font-black text-[#071a3a] md:text-4xl">
              {filteredRecords.length} passports ranked
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#505050]">
              Filter by region or search by name — ranking is a starting point, not the final recommendation.
            </p>
          </div>
          <label className="relative block w-full shrink-0 sm:w-80">
            <span className="sr-only">Search passports</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country, code, or band…"
              className="w-full rounded-xl border border-[#E1E1E1] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[#263238] placeholder:text-[#9ca3af] outline-none focus:border-[#1c57b4] focus:ring-2 focus:ring-[#1c57b4]/30"
            />
          </label>
        </Reveal>

        {/* Region pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {regions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRegion(item)}
              className={[
                "shrink-0 rounded-full border px-4 py-2 text-[13px] font-black transition",
                region === item
                  ? "border-[#1c57b4] bg-[#1c57b4] text-white"
                  : "border-[#E1E1E1] bg-white text-[#505050] hover:border-[#1c57b4] hover:text-[#1c57b4]",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Column header (desktop) */}
        <div className="hidden grid-cols-[64px_1.5fr_150px_1.4fr_2fr_104px] items-center gap-x-5 rounded-t-2xl bg-[#071a3a] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-white/55 lg:grid">
          <span>Rank</span>
          <span>Passport</span>
          <span>Region</span>
          <span>Mobility score</span>
          <span>XIPHIAS lens</span>
          <span className="text-right">Profile</span>
        </div>

        {/* Rows */}
        <div className="overflow-hidden rounded-2xl border border-[#E1E1E1] bg-white shadow-sm lg:rounded-t-none lg:border-t-0">
          <div className="divide-y divide-[#eef1f5]">
            {filteredRecords.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-[15px] font-semibold text-[#505050]">No passports match your search.</p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setRegion("All"); }}
                  className="mt-3 text-[15px] font-black text-[#1c57b4] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <article
                  key={record.code}
                  className="grid grid-cols-1 items-center gap-x-5 gap-y-3 px-6 py-5 transition-colors hover:bg-[#f5f8ff] lg:grid-cols-[64px_1.5fr_150px_1.4fr_2fr_104px]"
                >
                  {/* Rank */}
                  <div className="flex items-center gap-3 lg:block">
                    <span className="text-[20px] font-black leading-none text-[#071a3a]">{record.rank}</span>
                  </div>

                  {/* Passport */}
                  <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0d2d5c] text-[11px] font-black text-[#e1b923]">
                      {record.code}
                    </span>
                    <h3 className="text-[16px] font-black text-[#071a3a]">{record.country}</h3>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black ${bandClass(record.band)}`}>
                      {record.band}
                    </span>
                  </div>

                  {/* Region */}
                  <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-black ${regionClass(record.region)}`}>
                    {record.region}
                  </span>

                  {/* Score bar */}
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eef1f5]">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: scoreWidth(record.score, stats.topScore), backgroundColor: barColor(record.band) }}
                      />
                    </div>
                    <span className="w-10 text-right text-[15px] font-black tabular-nums text-[#071a3a]">{record.score}</span>
                  </div>

                  {/* XIPHIAS lens */}
                  <p className="text-[13.5px] leading-[1.65] text-[#505050]">{record.xiphiasLens}</p>

                  {/* Profile */}
                  <Link
                    href={passportProfileHref(record)}
                    className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-[#E1E1E1] px-4 py-2.5 text-[13px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff] lg:justify-self-end"
                  >
                    Open <ArrowRight className="size-3.5" />
                  </Link>
                </article>
              ))
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#E1E1E1] bg-[#f5f8ff] px-6 py-3.5">
              <p className="text-[13px] text-[#505050]">
                Showing <span className="font-black text-[#071a3a]">{filteredRecords.length}</span> of{" "}
                <span className="font-black text-[#071a3a]">{records.length}</span> passports
                {region !== "All" && <> · <span className="font-black text-[#1c57b4]">{region}</span></>}
              </p>
              <p className="hidden text-[12px] text-[#9ca3af] sm:block">
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
