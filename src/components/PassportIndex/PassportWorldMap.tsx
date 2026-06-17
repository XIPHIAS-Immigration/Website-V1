"use client";

import Link from "next/link";
import { ArrowRight, Maximize2, Minus, Plus, X } from "lucide-react";
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
  if (selected) return "#e1b923";
  if (!highlighted) return "#1e3a52";
  if (!score) return "#3a5f7a";
  if (score >= 185) return "#2dd4bf";
  if (score >= 170) return "#3b82f6";
  if (score >= 100) return "#7ea8c4";
  return "#e07070";
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

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e1b923]/30 bg-[#071a3a] text-white shadow-xl">
      <style>{`
        @keyframes passportRouteFlow {
          0%  { stroke-dashoffset: 28; opacity: .3; }
          50% { opacity: 1; }
          100%{ stroke-dashoffset: 0;  opacity: .3; }
        }
        .passport-route-line {
          stroke-dasharray: 10 8;
          animation: passportRouteFlow 3.2s linear infinite;
        }
        @keyframes passportFocusDraw {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        .passport-focus-outline {
          stroke-dasharray: 600;
          animation: passportFocusDraw 1.4s ease-out both;
        }
        .map-list-btn:hover .map-score { color: #e1b923; }
      `}</style>

      {/* Grid: fixed height on desktop so left panel and map are always equal height */}
      <div className={`grid lg:grid-cols-[280px_1fr] ${isExpandedView ? "h-[78vh]" : "lg:h-[460px]"}`}>

        {/* ── Left panel ── */}
        <aside className="flex max-h-[380px] flex-col overflow-hidden border-b border-white/10 bg-[#071a3a] lg:max-h-none lg:h-full lg:border-b-0 lg:border-r lg:border-white/10">

          {/* Panel header */}
          <div className="flex-none px-4 pt-4 pb-3 border-b border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#e1b923]">
              Global Ranking
            </p>
            <h2 className="mt-0.5 text-base font-black text-white">Passport Snapshot</h2>
          </div>

          {/* Column labels */}
          <div className="flex-none grid grid-cols-[1fr_60px_52px] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            <span>Passport</span>
            <span>Rank</span>
            <span className="text-right">Score</span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
            {listRecords.map((record) => {
              const active = selected?.code === record.code;

              return (
                <button
                  key={record.code}
                  type="button"
                  onClick={() => setSelectedCode(record.code)}
                  className={[
                    "map-list-btn grid w-full grid-cols-[1fr_60px_52px] items-center gap-2 border-b border-white/8 px-4 py-3 text-left transition-all duration-150",
                    active
                      ? "bg-[#1c57b4]/30 border-l-2 border-l-[#e1b923]"
                      : "border-l-2 border-l-transparent hover:bg-white/6",
                  ].join(" ")}
                >
                  {/* Country */}
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={[
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-[9.5px] font-black ring-1 transition-all",
                        active
                          ? "bg-[#e1b923] text-[#071a3a] ring-[#e1b923]/60"
                          : "bg-[#0d2d5c] text-[#e1b923] ring-[#e1b923]/25",
                      ].join(" ")}
                    >
                      {record.code}
                    </span>
                    <span
                      className={[
                        "truncate text-[13px] font-semibold transition-colors",
                        active ? "text-white" : "text-white/75 group-hover:text-white",
                      ].join(" ")}
                    >
                      {record.country}
                    </span>
                  </span>

                  {/* Rank */}
                  <span
                    className={[
                      "text-[12px] font-black transition-colors",
                      active ? "text-white" : "text-white/55",
                    ].join(" ")}
                  >
                    {record.rank}
                  </span>

                  {/* Score */}
                  <span
                    className={[
                      "map-score text-right text-[13px] font-black tabular-nums transition-colors",
                      active ? "text-[#e1b923]" : "text-white/60",
                    ].join(" ")}
                  >
                    {record.score}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Open passport CTA */}
          {selected ? (
            <div className="flex-none p-4 border-t border-white/10">
              <Link
                href={passportProfileHref(selected)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e1b923] px-4 py-2.5 text-[13px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
              >
                Open {selected.country} profile
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </aside>

        {/* ── Map panel ── */}
        {/* aspect-[960/520] makes the container exactly the SVG's native ratio → meet fills it perfectly, no bars, no crop */}
        <div className={`relative overflow-hidden bg-[#061527] ${isExpandedView ? "h-full" : "aspect-[960/520] lg:aspect-auto lg:h-full"}`}>
          <svg
            viewBox={worldMapViewBox}
            role="img"
            aria-label="World map with highlighted passport mobility countries"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <radialGradient id="passportOceanGlow" cx="52%" cy="40%" r="68%">
                <stop offset="0%"   stopColor="#0e3156" />
                <stop offset="62%"  stopColor="#071a3a" />
                <stop offset="100%" stopColor="#030e22" />
              </radialGradient>
            </defs>
            <rect width="960" height="520" fill="url(#passportOceanGlow)" />
            <g transform={`translate(480 260) scale(${zoom}) translate(-480 -260)`} style={{ transition: "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
              {/* Grid lines */}
              {[120, 240, 360, 480, 600, 720, 840].map((x) => (
                <path key={`v-${x}`} d={`M ${x} 0 L ${x} 520`} stroke="#4a7fa8" strokeOpacity="0.12" strokeWidth="1" />
              ))}
              {[100, 200, 300, 400].map((y) => (
                <path key={`h-${y}`} d={`M 0 ${y} L 960 ${y}`} stroke="#4a7fa8" strokeOpacity="0.10" strokeWidth="1" />
              ))}

              {/* Countries */}
              {worldMapCountries.map((country) => {
                const record = recordByCode.get(country.code);
                const isHighlighted = highlightedSet.has(country.code);
                const isSelected = selected?.code === country.code;

                return (
                  <path
                    key={country.code}
                    d={country.path}
                    fill={countryFill(record?.score, isHighlighted, isSelected)}
                    stroke={isSelected ? "#ffffff" : "#071a3a"}
                    strokeOpacity={isHighlighted || isSelected ? 0.9 : 0.55}
                    strokeWidth={isHighlighted || isSelected ? 1.2 : 0.6}
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
                    className={record ? "cursor-pointer transition-colors duration-200 hover:fill-[#e1b923]/80" : undefined}
                  />
                );
              })}

              {/* Route arcs */}
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
                    strokeWidth="2.5"
                  />
                );
              })}

              {/* Pin markers */}
              {highlighted.map((record) => {
                const point = pointForCode(record.code);
                const active = selected?.code === record.code;

                return (
                  <g key={`pin-${record.code}`}>
                    <circle cx={point.x} cy={point.y} r={active ? "16" : "13"} fill="#e1b923" fillOpacity={active ? 0.3 : 0.18} />
                    <circle cx={point.x} cy={point.y} r={active ? "7" : "6"} fill="#e1b923" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      x={point.x + 11}
                      y={point.y + 4}
                      fill={active ? "#e1b923" : "#c8d8e8"}
                      fontSize="13"
                      fontWeight="900"
                    >
                      {record.code}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Map title badge — top right */}
          <div className="absolute right-4 top-4 rounded-lg border border-white/15 bg-[#071a3a]/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e1b923]">World Access Map</p>
            <p className="mt-0.5 text-[12px] font-semibold text-white/70">Country-boundary view</p>
          </div>

          {/* Zoom controls — bottom left */}
          <div className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-lg border border-white/15 bg-white/95 text-[#1c57b4] shadow-lg backdrop-blur-sm">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(1.65, Number((value + 0.15).toFixed(2))))}
              className="flex size-9 items-center justify-center border-b border-[#E1E1E1] transition hover:bg-[#eaf2ff]"
            >
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(1, Number((value - 0.15).toFixed(2))))}
              className="flex size-9 items-center justify-center border-b border-[#E1E1E1] transition hover:bg-[#eaf2ff]"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Expand world access map"
              onClick={() => setExpanded(true)}
              className="flex size-9 items-center justify-center transition hover:bg-[#eaf2ff]"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>

          {/* Selected country detail card — bottom right */}
          {selected && selectedCountryPath ? (
            <div className="absolute bottom-4 right-4 w-[min(300px,calc(100%-6rem))] rounded-xl border border-white/15 bg-[#071a3a]/95 p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e1b923]">Selected</p>
                  <h3 className="mt-0.5 text-base font-black text-white">{selected.country}</h3>
                </div>
                <span className="shrink-0 rounded-full bg-[#e1b923] px-2.5 py-1 text-[11px] font-black text-[#071a3a]">
                  {selected.score}
                </span>
              </div>

              <svg
                key={selected.code}
                viewBox={selectedViewBox}
                aria-hidden="true"
                className="mt-3 h-28 w-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d={selectedCountryPath.path} fill="rgba(225,185,35,0.15)" stroke="#e1b923" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <path className="passport-focus-outline" d={selectedCountryPath.path} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </svg>

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
            </div>
          ) : null}
        </div>
      </div>

      {/* Expanded fullscreen overlay */}
      {expanded && !isExpandedView ? (
        <div className="fixed inset-0 z-[2147483300] bg-[#020817]/96 p-4 backdrop-blur-md">
          <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e1b923]">Expanded view</p>
                <h2 className="text-xl font-black">XIPHIAS World Access Map</h2>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Close expanded map"
              >
                <X className="size-4" />
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
