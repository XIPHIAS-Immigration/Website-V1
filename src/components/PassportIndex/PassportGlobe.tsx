"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PassportRecord } from "@/data/passport-index";
import { centroidForCode } from "@/data/country-centroids";
import { LazyGlobe } from "@/components/globe";
import type { GlobeArc, GlobeMarker } from "@/components/globe";

type Props = {
  records: PassportRecord[];
  highlightedCodes?: string[];
};

/** Choropleth colour by visa-free score (mirrors the legacy world map). */
function scoreColor(score?: number) {
  if (!score) return "#3a5f7a";
  if (score >= 185) return "#2dd4bf";
  if (score >= 170) return "#3b82f6";
  if (score >= 100) return "#7ea8c4";
  return "#e07070";
}

export default function PassportGlobe({ records, highlightedCodes }: Props) {
  const effective = highlightedCodes ?? records.map((r) => r.code);
  const listRecords = useMemo(
    () => records.filter((r) => effective.includes(r.code)),
    [records, effective],
  );

  const recordByCode = useMemo(() => new Map(records.map((r) => [r.code, r])), [records]);
  const [selectedCode, setSelectedCode] = useState(listRecords[0]?.code ?? records[0]?.code ?? "SG");
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const selected = recordByCode.get(selectedCode) ?? listRecords[0] ?? records[0];

  // Markers placed by ISO-2 centroid, coloured by score.
  const markers = useMemo<GlobeMarker[]>(() => {
    return listRecords
      .map((r) => {
        const centroid = centroidForCode(r.code);
        if (!centroid) return null;
        return {
          code: r.code,
          lat: centroid.lat,
          lng: centroid.lng,
          label: `${r.country} · ${r.score}`,
          weight: Math.max(0.25, r.score / 192),
          color: scoreColor(r.score),
        } satisfies GlobeMarker;
      })
      .filter(Boolean) as GlobeMarker[];
  }, [listRecords]);

  // Arcs: from the selected passport to the four most powerful passports.
  const arcs = useMemo<GlobeArc[]>(() => {
    const origin = selected ? centroidForCode(selected.code) : undefined;
    if (!origin) return [];
    return [...records]
      .sort((a, b) => a.rankValue - b.rankValue)
      .filter((r) => r.code !== selected?.code)
      .slice(0, 4)
      .map((r) => centroidForCode(r.code))
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        from: [origin.lat, origin.lng] as [number, number],
        to: [c.lat, c.lng] as [number, number],
        color: "#e1b923",
      }));
  }, [records, selected]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e1b923]/30 bg-[#071a3a] text-white shadow-xl">
      <div className="grid lg:grid-cols-[360px_1fr]">
        {/* ── Left: ranked list ── */}
        <aside className="flex h-full max-h-[64vh] flex-col overflow-hidden border-b border-white/10 bg-[#071a3a] lg:max-h-[82vh] lg:border-b-0 lg:border-r">
          <div className="flex-none border-b border-white/10 px-4 pb-3 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e1b923]">Global Ranking</p>
            <h2 className="mt-0.5 text-base font-black text-white">Passport Snapshot</h2>
          </div>

          <div className="grid flex-none grid-cols-[1fr_60px_52px] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            <span>Passport</span>
            <span>Rank</span>
            <span className="text-right">Score</span>
          </div>

          <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain">
            {listRecords.map((record) => {
              const active = selected?.code === record.code;
              return (
                <button
                  key={record.code}
                  type="button"
                  onClick={() => setSelectedCode(record.code)}
                  onMouseEnter={() => setHoveredCode(record.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  className={[
                    "grid w-full grid-cols-[1fr_60px_52px] items-center gap-2 border-b border-white/8 px-4 py-3 text-left transition-all duration-150",
                    active
                      ? "border-l-2 border-l-[#e1b923] bg-[#1c57b4]/30"
                      : "border-l-2 border-l-transparent hover:bg-white/6",
                  ].join(" ")}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={[
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-[9.5px] font-black ring-1 transition-all",
                        active ? "bg-[#e1b923] text-[#071a3a] ring-[#e1b923]/60" : "bg-[#0d2d5c] text-[#e1b923] ring-[#e1b923]/25",
                      ].join(" ")}
                    >
                      {record.code}
                    </span>
                    <span className={["truncate text-[13px] font-semibold", active ? "text-white" : "text-white/75"].join(" ")}>
                      {record.country}
                    </span>
                  </span>
                  <span className={["text-[12px] font-black", active ? "text-white" : "text-white/55"].join(" ")}>
                    {record.rank}
                  </span>
                  <span
                    className={["text-right text-[13px] font-black tabular-nums", active ? "text-[#e1b923]" : "text-white/60"].join(" ")}
                  >
                    {record.score}
                  </span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="flex-none border-t border-white/10 p-4">
              <Link
                href={`/passport-index/passport/${selected.code.toLowerCase()}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e1b923] px-4 py-2.5 text-[13px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
              >
                Open {selected.country} profile
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </aside>

        {/* ── Right: interactive globe (drag to spin, no zoom) ── */}
        <div className="relative min-h-[60vh] bg-[#05080f] lg:min-h-[82vh]">
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
            cameraZ={4.9}
            ariaLabel="Interactive globe of passport mobility scores"
          />

          {/* Title badge */}
          <div className="pointer-events-none absolute right-4 top-4 rounded-lg border border-white/15 bg-[#071a3a]/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e1b923]">World Access Globe</p>
            <p className="mt-0.5 text-[12px] font-semibold text-white/70">Spin · select a passport</p>
          </div>

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-lg border border-white/15 bg-[#071a3a]/90 px-3 py-2.5 text-[10.5px] font-semibold text-white/70 shadow-lg backdrop-blur-sm">
            {[
              { c: "#2dd4bf", t: "Elite (185+)" },
              { c: "#3b82f6", t: "High (170+)" },
              { c: "#7ea8c4", t: "Strategic (100+)" },
              { c: "#e07070", t: "Restricted (<100)" },
            ].map((row) => (
              <span key={row.t} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: row.c }} />
                {row.t}
              </span>
            ))}
          </div>

          {/* Selected detail card */}
          {selected ? (
            <div className="absolute bottom-4 right-4 w-[min(300px,calc(100%-2rem))] rounded-xl border border-white/15 bg-[#071a3a]/95 p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e1b923]">Selected</p>
                  <h3 className="mt-0.5 text-base font-black text-white">{selected.country}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-[#e1b923] px-2.5 py-1 text-[11px] font-black text-[#071a3a]">
                  {selected.score}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/8 p-2.5">
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Rank</span>
                  <span className="mt-0.5 block text-sm font-black text-white">{selected.rank}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/8 p-2.5">
                  <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-white/45">Band</span>
                  <span className="mt-0.5 block text-sm font-black text-white">{selected.band}</span>
                </div>
              </div>
              {selected.xiphiasLens ? (
                <p className="mt-3 text-[11.5px] leading-relaxed text-white/60">{selected.xiphiasLens}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
