"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import type { PassportRecord } from "@/data/passport-index";
import { centroidForCode } from "@/data/country-centroids";
import { LazyGlobe } from "@/components/globe";
import type { GlobeArc, GlobeMarker } from "@/components/globe";

type Props = {
  records: PassportRecord[];
  highlightedCodes?: string[];
};

function scoreColor(score?: number) {
  if (!score) return "#3a5f7a";
  if (score >= 185) return "#2dd4bf";
  if (score >= 170) return "#3b82f6";
  if (score >= 100) return "#7ea8c4";
  return "#e07070";
}

export default function PassportGlobe({ records, highlightedCodes }: Props) {
  const effective = highlightedCodes ?? records.map((record) => record.code);
  const listRecords = useMemo(
    () => records.filter((record) => effective.includes(record.code)),
    [records, effective],
  );
  const recordByCode = useMemo(
    () => new Map(records.map((record) => [record.code, record])),
    [records],
  );

  const [selectedCode, setSelectedCode] = useState(
    listRecords[0]?.code ?? records[0]?.code ?? "SG",
  );
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selected = recordByCode.get(selectedCode) ?? listRecords[0] ?? records[0];
  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return listRecords;
    return listRecords.filter(
      (record) =>
        record.country.toLowerCase().includes(normalizedQuery) ||
        record.code.toLowerCase().includes(normalizedQuery),
    );
  }, [listRecords, query]);

  const markers = useMemo<GlobeMarker[]>(() => {
    return listRecords
      .map((record) => {
        const centroid = centroidForCode(record.code);
        if (!centroid) return null;
        return {
          code: record.code,
          lat: centroid.lat,
          lng: centroid.lng,
          label: `${record.country} - ${record.score}`,
          weight: Math.max(0.25, record.score / 192),
          color: scoreColor(record.score),
        } satisfies GlobeMarker;
      })
      .filter(Boolean) as GlobeMarker[];
  }, [listRecords]);

  const arcs = useMemo<GlobeArc[]>(() => {
    const origin = selected ? centroidForCode(selected.code) : undefined;
    if (!origin) return [];
    return [...records]
      .sort((a, b) => a.rankValue - b.rankValue)
      .filter((record) => record.code !== selected?.code)
      .slice(0, 4)
      .map((record) => centroidForCode(record.code))
      .filter((centroid): centroid is NonNullable<typeof centroid> => Boolean(centroid))
      .map((centroid) => ({
        from: [origin.lat, origin.lng] as [number, number],
        to: [centroid.lat, centroid.lng] as [number, number],
        color: "#e1b923",
      }));
  }, [records, selected]);

  return (
    <div className="mx-auto max-w-[1020px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[320px_minmax(0,640px)] lg:justify-center">
        <aside className="order-2 flex h-[520px] min-h-0 flex-col overflow-hidden border-t border-slate-200 bg-white lg:order-1 lg:h-[640px] lg:border-r lg:border-t-0">
          <div className="flex-none border-b border-slate-200 p-4">
            <p className="type-caption uppercase text-primary">Global ranking</p>
            <h2 className="type-card-title mt-1 text-slate-950">Passport snapshot</h2>
            <label className="relative mt-4 block">
              <span className="sr-only">Search passports</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search country or code"
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>

          <div className="grid flex-none grid-cols-[1fr_56px_48px] border-b border-slate-200 px-4 py-2 text-[10px] font-bold uppercase text-slate-400">
            <span>Passport</span>
            <span>Rank</span>
            <span className="text-right">Score</span>
          </div>

          <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
            {visibleRecords.map((record) => {
              const active = selected?.code === record.code;
              return (
                <button
                  key={record.code}
                  type="button"
                  onClick={() => setSelectedCode(record.code)}
                  onMouseEnter={() => setHoveredCode(record.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  className={[
                    "grid w-full grid-cols-[1fr_56px_48px] items-center gap-2 border-b border-l-2 border-slate-100 px-4 py-3 text-left transition-colors",
                    active
                      ? "border-l-primary bg-primary/[0.06]"
                      : "border-l-transparent hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={[
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        active ? "bg-primary text-white" : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {record.code}
                    </span>
                    <span className="type-small truncate font-bold text-slate-800">
                      {record.country}
                    </span>
                  </span>
                  <span className="type-small font-bold text-slate-600">{record.rank}</span>
                  <span className="type-small text-right font-bold tabular-nums text-primary">
                    {record.score}
                  </span>
                </button>
              );
            })}
            {visibleRecords.length === 0 ? (
              <p className="type-small px-4 py-8 text-center text-slate-500">
                No matching passport found.
              </p>
            ) : null}
          </div>

          {selected ? (
            <div className="flex-none border-t border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-caption uppercase text-primary">Selected passport</p>
                  <h3 className="type-card-title mt-1 text-slate-950">{selected.country}</h3>
                </div>
                <div className="flex gap-2 text-right">
                  <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
                    {selected.rank}
                  </span>
                  <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white">
                    {selected.score}
                  </span>
                </div>
              </div>
              <p className="type-small mt-2 line-clamp-2 text-slate-600">{selected.xiphiasLens}</p>
              <Link
                href={`/passport-index/passport/${selected.code.toLowerCase()}`}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#e1b923] px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-[#f0cb3b]"
              >
                Open {selected.country} profile
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </aside>

        <div className="relative order-1 aspect-square w-full max-w-[640px] justify-self-center overflow-hidden bg-[#071a3a] lg:order-2">
          <LazyGlobe
            className="absolute inset-0"
            theme="dark"
            markers={markers}
            arcs={arcs}
            selectedCode={selectedCode}
            hoveredCode={hoveredCode}
            onSelect={setSelectedCode}
            onHover={setHoveredCode}
            enableZoom={false}
            cameraZ={6.4}
            ariaLabel="Interactive globe of passport mobility scores"
          />

          <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/15 bg-[#071a3a]/85 px-3 py-2 backdrop-blur-sm sm:left-4 sm:top-4">
            <p className="type-caption uppercase text-[#e1b923]">World access globe</p>
            <p className="mt-1 text-xs font-medium text-white/70">
              Drag to rotate and select a marker
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 hidden flex-wrap gap-x-3 gap-y-1 rounded-md border border-white/15 bg-[#071a3a]/85 px-3 py-2 text-[10px] font-medium text-white/70 backdrop-blur-sm sm:flex">
            {[
              { c: "#2dd4bf", t: "Elite 185+" },
              { c: "#3b82f6", t: "High 170+" },
              { c: "#7ea8c4", t: "Strategic 100+" },
              { c: "#e07070", t: "Restricted <100" },
            ].map((row) => (
              <span key={row.t} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: row.c }} />
                {row.t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
