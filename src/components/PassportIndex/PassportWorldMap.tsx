"use client";

import Link from "next/link";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { PassportRecord } from "@/data/passport-index";
import { worldMapCountries, worldMapViewBox } from "@/data/world-map-paths";

const passportCoordinates: Record<string, { x: number; y: number }> = {
  SG: { x: 76, y: 58 },
  JP: { x: 84, y: 35 },
  KR: { x: 80, y: 38 },
  DK: { x: 49, y: 28 },
  LU: { x: 48, y: 35 },
  ES: { x: 45, y: 42 },
  SE: { x: 51, y: 23 },
  CH: { x: 48, y: 36 },
  AE: { x: 60, y: 51 },
  PT: { x: 43, y: 42 },
  CA: { x: 20, y: 24 },
  US: { x: 20, y: 39 },
  CN: { x: 72, y: 42 },
  IN: { x: 66, y: 54 },
  AF: { x: 61, y: 47 },
};

function pointForCode(code: string) {
  const point = passportCoordinates[code] ?? { x: 50, y: 50 };
  return {
    x: (point.x / 100) * 960,
    y: (point.y / 100) * 520,
  };
}

function countryFill(score?: number, highlighted = false, selected = false) {
  if (selected) return "#f2c94c";
  if (!highlighted) return "#31516a";
  if (!score) return "#5b7284";
  if (score >= 185) return "#47d5c8";
  if (score >= 170) return "#58a6ff";
  if (score >= 100) return "#b7c7d6";
  return "#d96b5f";
}

function passportProfileHref(record: PassportRecord) {
  return `/passport-index/passport/${record.code.toLowerCase()}`;
}

function pathBounds(path: string) {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const xs: number[] = [];
  const ys: number[] = [];

  for (let index = 0; index < values.length; index += 2) {
    xs.push(values[index]);
    ys.push(values[index + 1]);
  }

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(8, maxX - minX);
  const height = Math.max(8, maxY - minY);
  const padding = Math.max(width, height) * 0.18;

  return `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
}

export default function PassportWorldMap({
  records,
  highlightedCodes,
  isExpandedView = false,
}: {
  records: PassportRecord[];
  highlightedCodes?: string[];
  isExpandedView?: boolean;
}) {
  const effectiveHighlightedCodes = highlightedCodes ?? records.map((record) => record.code);
  const highlighted = useMemo(
    () => records.filter((record) => effectiveHighlightedCodes.includes(record.code)),
    [effectiveHighlightedCodes, records],
  );
  const [selectedCode, setSelectedCode] = useState(highlighted[0]?.code ?? records[0]?.code ?? "SG");
  const [zoom, setZoom] = useState(1);

  const highlightedSet = useMemo(() => new Set(highlighted.map((record) => record.code)), [highlighted]);
  const recordByCode = useMemo(() => new Map(records.map((record) => [record.code, record])), [records]);
  const listRecords = highlighted.length > 0 ? highlighted : records.slice(0, 7);
  const selected = recordByCode.get(selectedCode) ?? listRecords[0] ?? records[0];
  const selectedCountryPath = selected
    ? worldMapCountries.find((country) => country.code === selected.code)
    : undefined;
  const selectedViewBox = selectedCountryPath ? pathBounds(selectedCountryPath.path) : worldMapViewBox;
  const routeOrigin = highlighted.find((record) => record.code === "IN") ?? selected ?? highlighted[0] ?? records[0];
  const routeTargets = highlighted.filter((record) => record.code !== routeOrigin.code).slice(0, 4);
  const originPoint = pointForCode(routeOrigin.code);
  const [expanded, setExpanded] = useState(false);
  const mapHeightClass = isExpandedView ? "min-h-[78vh]" : "min-h-[620px]";

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#d7b64a]/40 bg-[#061a33] text-white shadow-2xl shadow-[#071a3a]/30">
      <style>{`
        @keyframes passportRouteFlow {
          0% { stroke-dashoffset: 28; opacity: .35; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: .35; }
        }
        .passport-route-line {
          stroke-dasharray: 10 8;
          animation: passportRouteFlow 3.2s linear infinite;
        }
        @keyframes passportFocusDraw {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        .passport-focus-outline {
          stroke-dasharray: 600;
          animation: passportFocusDraw 1.4s ease-out both;
        }
      `}</style>

      <div className={`grid ${mapHeightClass} lg:grid-cols-[340px_1fr]`}>
        <aside className="border-b border-[#d7b64a]/25 bg-[#071a3a] p-4 lg:border-b-0 lg:border-r">
          <div className="rounded-md bg-[#e1b923] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#071a3a] shadow-lg shadow-black/20">
            Global ranking snapshot
          </div>
          <div className="mt-4 grid grid-cols-[1fr_72px_72px] gap-3 border-b border-white/15 pb-3 text-[11px] font-black uppercase tracking-[0.14em] text-[#f6d86d]">
            <span>Passport</span>
            <span>Rank</span>
            <span>Access</span>
          </div>
          <div className={isExpandedView ? "max-h-[calc(78vh-168px)] overflow-y-auto pr-1" : "max-h-[504px] overflow-y-auto pr-1"}>
            {listRecords.map((record) => {
              const active = selected?.code === record.code;

              return (
                <button
                  key={record.code}
                  type="button"
                  onClick={() => setSelectedCode(record.code)}
                  className={[
                    "grid w-full grid-cols-[1fr_72px_72px] items-center gap-3 border-b border-white/10 px-2 py-3 text-left text-sm transition",
                    active ? "bg-[#12366c]" : "hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e1b923]/50 bg-[#0b2a55] text-[11px] font-black text-[#f6d86d]">
                      {record.code}
                    </span>
                    <span className="truncate font-semibold text-white">{record.country}</span>
                  </span>
                  <span className="font-black text-white underline decoration-[#e1b923]/50 underline-offset-4">
                    {record.rank}
                  </span>
                  <span className="font-black text-white underline decoration-[#e1b923]/50 underline-offset-4">
                    {record.score}
                  </span>
                </button>
              );
            })}
          </div>
          {selected ? (
            <Link
              href={passportProfileHref(selected)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-[#e1b923] px-4 py-3 text-sm font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              Open {selected.country}
            </Link>
          ) : null}
        </aside>

        <div className={`relative ${mapHeightClass} overflow-hidden bg-[#092a4a]`}>
          <svg
            viewBox={worldMapViewBox}
            role="img"
            aria-label="World map with highlighted passport mobility countries"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="passportOceanGlow" cx="52%" cy="40%" r="68%">
                <stop offset="0%" stopColor="#164b76" />
                <stop offset="62%" stopColor="#092a4a" />
                <stop offset="100%" stopColor="#04162d" />
              </radialGradient>
            </defs>
            <rect width="960" height="520" fill="url(#passportOceanGlow)" />
            <g transform={`translate(480 260) scale(${zoom}) translate(-480 -260)`}>
              {[120, 240, 360, 480, 600, 720, 840].map((x) => (
                <path key={`v-${x}`} d={`M ${x} 0 L ${x} 520`} stroke="#8bd3ff" strokeOpacity="0.16" strokeWidth="1" />
              ))}
              {[100, 200, 300, 400].map((y) => (
                <path key={`h-${y}`} d={`M 0 ${y} L 960 ${y}`} stroke="#8bd3ff" strokeOpacity="0.14" strokeWidth="1" />
              ))}
              {worldMapCountries.map((country) => {
                const record = recordByCode.get(country.code);
                const isHighlighted = highlightedSet.has(country.code);
                const isSelected = selected?.code === country.code;

                return (
                  <path
                    key={country.code}
                    d={country.path}
                    fill={countryFill(record?.score, isHighlighted, isSelected)}
                    stroke={isSelected ? "#ffffff" : "#0b1f38"}
                    strokeOpacity={isHighlighted || isSelected ? 0.95 : 0.65}
                    strokeWidth={isHighlighted || isSelected ? 1.35 : 0.7}
                    vectorEffect="non-scaling-stroke"
                    role={record ? "button" : undefined}
                    tabIndex={record ? 0 : undefined}
                    onClick={record ? () => setSelectedCode(record.code) : undefined}
                    onKeyDown={
                      record
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedCode(record.code);
                            }
                          }
                        : undefined
                    }
                    className={record ? "cursor-pointer transition-colors duration-200 hover:fill-[#f2c94c]" : undefined}
                  />
                );
              })}
              {routeTargets.map((target) => {
                const targetPoint = pointForCode(target.code);
                const midX = (originPoint.x + targetPoint.x) / 2;
                const midY = Math.min(originPoint.y, targetPoint.y) - 68;

                return (
                  <path
                    key={`route-${target.code}`}
                    className="passport-route-line"
                    d={`M${originPoint.x} ${originPoint.y} Q ${midX} ${midY} ${targetPoint.x} ${targetPoint.y}`}
                    fill="none"
                    stroke="#e1b923"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                );
              })}
              {highlighted.map((record) => {
                const point = pointForCode(record.code);
                const active = selected?.code === record.code;

                return (
                  <g key={`pin-${record.code}`}>
                    <circle cx={point.x} cy={point.y} r={active ? "18" : "15"} fill="#e1b923" fillOpacity={active ? 0.35 : 0.22} />
                    <circle cx={point.x} cy={point.y} r={active ? "8" : "7"} fill="#e1b923" stroke="#ffffff" strokeWidth="2" />
                    <text x={point.x + 13} y={point.y + 5} fill="#071a3a" fontSize="15" fontWeight="900">
                      {record.code}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="absolute bottom-5 left-5 grid overflow-hidden rounded-md border border-slate-500/45 bg-white/90 text-[#40576a] shadow-lg backdrop-blur">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(1.65, Number((value + 0.15).toFixed(2))))}
              className="flex size-10 items-center justify-center border-b border-slate-300 transition hover:bg-slate-100"
            >
              <Plus className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))))}
              className="flex size-10 items-center justify-center border-b border-slate-300 transition hover:bg-slate-100"
            >
              <Minus className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Expand world access map"
              onClick={() => setExpanded(true)}
              className="flex size-10 items-center justify-center transition hover:bg-slate-100"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>

          <div className="absolute right-5 top-5 rounded-md border border-[#e1b923]/60 bg-[#061a33]/92 px-4 py-3 text-white shadow-lg backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f6d86d]">World access map</p>
            <p className="mt-1 text-sm font-black">Country-boundary view</p>
          </div>

          {selected && selectedCountryPath ? (
            <div className="absolute bottom-5 right-5 w-[min(360px,calc(100%-6.5rem))] rounded-lg border border-[#e1b923]/70 bg-[#061a33]/95 p-5 text-white shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f6d86d]">Selected country</p>
                  <h3 className="mt-1 text-lg font-black">{selected.country}</h3>
                </div>
                <span className="rounded-full bg-[#e1b923] px-3 py-1 text-xs font-black text-[#071a3a]">{selected.score}</span>
              </div>
              <svg
                key={selected.code}
                viewBox={selectedViewBox}
                aria-hidden="true"
                className="mt-3 h-40 w-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d={selectedCountryPath.path} fill="rgba(225,185,35,0.18)" stroke="#f6d86d" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <path className="passport-focus-outline" d={selectedCountryPath.path} fill="none" stroke="#ffffff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md border border-white/15 bg-white/10 p-2">
                  <span className="block text-white/60">Rank</span>
                  <span className="font-black">{selected.rank}</span>
                </div>
                <div className="rounded-md border border-white/15 bg-white/10 p-2">
                  <span className="block text-white/60">Band</span>
                  <span className="font-black">{selected.band}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {expanded && !isExpandedView ? (
        <div className="fixed inset-0 z-[2147483300] bg-[#020817]/95 p-4 backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f6d86d]">Expanded view</p>
                <h2 className="text-2xl font-black">XIPHIAS World Access Map</h2>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close expanded map"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <PassportWorldMap records={records} highlightedCodes={highlightedCodes} isExpandedView />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
