"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe2, MapPin, Sparkles } from "lucide-react";

import { LazyGlobe } from "@/components/globe";
import type { GlobeArc, GlobeMarker } from "@/components/globe";
import { Counter, Reveal, SplitText } from "@/components/motion";
import type { GlobeCountryDetail } from "@/lib/globe-data";

type Props = {
  markers: GlobeMarker[];
  arcs: GlobeArc[];
  details: GlobeCountryDetail[];
  totalCountries: number;
  totalProgrammes: number;
};

const TRACK_DOT: Record<string, string> = {
  citizenship: "bg-[#e1b923]",
  residency: "bg-[#3cd278]",
  skilled: "bg-[#5b9bff]",
  corporate: "bg-[#c084fc]",
};

export default function GlobeExplorerClient({
  markers,
  arcs,
  details,
  totalCountries,
  totalProgrammes,
}: Props) {
  const reduce = useReducedMotion();
  const detailMap = useMemo(() => new Map(details.map((d) => [d.code, d])), [details]);
  const [selectedCode, setSelectedCode] = useState<string | null>(details[0]?.code ?? null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const selected = (selectedCode && detailMap.get(selectedCode)) || details[0] || null;

  return (
    <section className="relative overflow-hidden bg-grey py-16 dark:bg-[#05080f] sm:py-24">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px] dark:bg-primary/20" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/15" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-primary/40 dark:bg-primary/10 dark:text-[#7fb0ff]">
            <Globe2 className="h-3.5 w-3.5" /> Explore the world with XIPHIAS
          </span>
          <h2 className="mt-5 text-balance text-[2rem] font-bold leading-tight tracking-tight text-midnight_text dark:text-white sm:text-[2.75rem]">
            <SplitText text="One globe. Every pathway to your second home." />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-light_grey dark:text-white/65">
            Spin the globe, pick a destination, and see the residency, citizenship, skilled and
            corporate programmes we run there — drawn live from our programme catalogue.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <Stat value={totalCountries} suffix="+" label="Destinations" />
            <span className="hidden h-8 w-px bg-border dark:bg-white/10 sm:block" />
            <Stat value={totalProgrammes} suffix="+" label="Programmes" />
            <span className="hidden h-8 w-px bg-border dark:bg-white/10 sm:block" />
            <Stat value={4} label="Migration routes" />
          </div>
        </Reveal>

        {/* globe + panel */}
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* globe stage */}
          <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-[#05080f] shadow-2xl shadow-black/40 lg:min-h-[560px]">
            <LazyGlobe
              className="absolute inset-0"
              markers={markers}
              arcs={arcs}
              selectedCode={selectedCode}
              hoveredCode={hoveredCode}
              onSelect={setSelectedCode}
              onHover={setHoveredCode}
              ariaLabel="Interactive globe of XIPHIAS destination countries"
            />
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-sm">
              Drag to spin · tap a glowing country
            </div>
          </div>

          {/* detail panel */}
          <aside className="flex flex-col rounded-3xl border border-border bg-white p-5 shadow-lg dark:border-white/10 dark:bg-[#0b1322] sm:p-6">
            {/* country chips */}
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {details.slice(0, 14).map((d) => {
                const active = d.code === selected?.code;
                return (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => setSelectedCode(d.code)}
                    onMouseEnter={() => setHoveredCode(d.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-midnight_text hover:border-primary/50 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                    }`}
                  >
                    {d.name}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
                  key={selected.code}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-1 flex-col"
                >
                  <div className="mt-1 flex items-center gap-3">
                    <span className="overflow-hidden rounded-md border border-border shadow-sm dark:border-white/10">
                      <Image
                        src={`https://flagcdn.com/w80/${selected.code.toLowerCase()}.png`}
                        alt=""
                        width={44}
                        height={30}
                        className="h-[30px] w-[44px] object-cover"
                      />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold leading-none text-midnight_text dark:text-white">
                        {selected.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-light_grey dark:text-white/55">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {selected.programmeCount} programmes · {selected.tracks.length} routes
                      </p>
                    </div>
                  </div>

                  {/* track chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.tracks.map((t) => (
                      <Link
                        key={t.track}
                        href={t.href}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-grey px-2.5 py-1.5 text-[12px] font-semibold text-midnight_text transition hover:border-primary/50 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                      >
                        <span className={`h-2 w-2 rounded-full ${TRACK_DOT[t.track] ?? "bg-primary"}`} />
                        {t.label}
                        <span className="text-light_grey dark:text-white/40">{t.count}</span>
                      </Link>
                    ))}
                  </div>

                  {/* programmes */}
                  <div className="mt-5 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary dark:text-[#7fb0ff]">
                      Featured programmes
                    </p>
                    {selected.topProgrammes.slice(0, 5).map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-transparent bg-grey px-3.5 py-2.5 transition hover:border-primary/40 hover:bg-primary/[0.04] dark:bg-white/5 dark:hover:bg-white/[0.08]"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] font-semibold text-midnight_text dark:text-white">
                            {p.title}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-light_grey dark:text-white/50">
                            {p.investment} · {p.timeline}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={selected.tracks[0]?.href ?? "/programme-explorer"}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13.5px] font-bold text-white transition hover:bg-[#1648a0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Sparkles className="h-4 w-4 text-secondary" />
                    Explore {selected.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <Counter
        to={value}
        suffix={suffix}
        className="text-2xl font-extrabold leading-none text-primary dark:text-[#7fb0ff] sm:text-3xl"
      />
      <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-light_grey dark:text-white/45">
        {label}
      </span>
    </div>
  );
}
