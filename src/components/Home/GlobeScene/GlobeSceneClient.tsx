"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe2, MousePointerClick } from "lucide-react";

import { LazyGlobe } from "@/components/globe";
import type { GlobeArc, GlobeMarker } from "@/components/globe";
import { centroidForCode } from "@/data/country-centroids";

type Destination = {
  code: string;
  name: string;
  image: string;
  href: string;
  blurb: string;
  track: string;
  /** Flight density on this route — higher for stronger passports in the index. */
  flights: number;
};

const DESTINATIONS: Destination[] = [
  { code: "CA", name: "Canada", track: "Skilled migration", href: "/countries/canada", image: "/images/skilled/canada/canada.webp", blurb: "Express Entry, provincial nominee programs and start-up visas to permanent residency.", flights: 3 },
  { code: "PT", name: "Portugal", track: "Residency", href: "/countries/portugal", image: "/images/residency/portugal/portugal-golden-visa.webp", blurb: "The Golden Visa route to EU residency, schooling and a path to a powerful passport.", flights: 4 },
  { code: "AE", name: "United Arab Emirates", track: "Residency", href: "/countries/uae", image: "/images/residency/uae/uae-golden-visa.webp", blurb: "The 10-year Golden Visa — 0% income tax and a global business hub.", flights: 2 },
  { code: "GD", name: "Grenada", track: "Citizenship", href: "/countries/grenada", image: "/images/citizenship/grenada/grenada-citizenship.webp", blurb: "Citizenship by investment with rare US E-2 treaty access for your family.", flights: 1 },
  { code: "GR", name: "Greece", track: "Residency", href: "/countries/greece", image: "/images/residency/greece/greece-golden-visa.webp", blurb: "Europe's most popular Golden Visa — real estate to Schengen residency.", flights: 2 },
  { code: "AU", name: "Australia", track: "Skilled migration", href: "/countries/australia", image: "/images/skilled/australia/skilled-australia-xiphias-immigration.webp", blurb: "Points-based skilled and regional visas leading to Australian PR.", flights: 3 },
  { code: "TR", name: "Turkey", track: "Citizenship", href: "/countries/turkey", image: "/images/citizenship/turkey/turkey.webp", blurb: "Fast citizenship by investment bridging Europe and Asia.", flights: 1 },
];

const BEACON_COLOR = "#f3c945";

function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={dest.href}
      className="group block overflow-hidden rounded-3xl border border-white/15 bg-[#0a1322]/95 shadow-2xl shadow-black/50 backdrop-blur-sm"
    >
      <div className="relative h-40 w-full overflow-hidden sm:h-44">
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          sizes="(max-width:1024px) 90vw, 360px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1322] via-[#0a1322]/30 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-secondary backdrop-blur-sm">
          {dest.track}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white">{dest.name}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">{dest.blurb}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-secondary">
          Explore {dest.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** Larger, prominent card shown beside the globe for the active destination. */
function FeatureCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={dest.href}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-[#0a1322]/95 shadow-2xl shadow-black/50 backdrop-blur-sm"
    >
      <div className="relative w-full flex-1 min-h-[13rem] overflow-hidden">
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          sizes="(max-width:1024px) 92vw, 40vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1322] via-[#0a1322]/55 to-transparent" />
        <span className="absolute left-5 top-5 rounded-full bg-black/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary backdrop-blur-sm">
          {dest.track}
        </span>
        <h3 className="absolute inset-x-5 bottom-4 text-balance text-[clamp(1.5rem,4vw,2rem)] font-black leading-tight text-white drop-shadow-lg">
          {dest.name}
        </h3>
      </div>
      <div className="shrink-0 p-6 sm:p-7">
        <p className="text-[15px] leading-relaxed text-white/70">{dest.blurb}</p>
        <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-[14px] font-bold text-primary shadow-sm transition group-hover:bg-[#f0cb3b]">
          Explore {dest.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function GlobeSceneClient() {
  const reduce = useReducedMotion();
  const destByCode = useMemo(() => new Map(DESTINATIONS.map((d) => [d.code, d])), []);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string>(DESTINATIONS[0].code);
  const [flyTick, setFlyTick] = useState(0);

  // Select a destination AND re-arm the globe fly-to — works even when the
  // already-selected country is picked again (after a manual drag).
  const travelTo = (code: string) => {
    setSelectedCode(code);
    setFlyTick((t) => t + 1);
  };

  // Beacons placed by ISO-2 centroid — each maps to a destination card.
  const markers = useMemo<GlobeMarker[]>(
    () =>
      DESTINATIONS.map((d) => {
        const c = centroidForCode(d.code);
        if (!c) return null;
        return {
          code: d.code,
          lat: c.lat,
          lng: c.lng,
          label: `${d.name} · ${d.track}`,
          weight: 0.95,
          color: BEACON_COLOR,
        } satisfies GlobeMarker;
      }).filter(Boolean) as GlobeMarker[],
    [],
  );

  // Arcs fan out from India (primary client origin) to each destination.
  const arcs = useMemo<GlobeArc[]>(() => {
    const origin = centroidForCode("IN");
    if (!origin) return [];
    return DESTINATIONS.map((d) => {
      const c = centroidForCode(d.code);
      if (!c) return null;
      return {
        from: [origin.lat, origin.lng] as [number, number],
        to: [c.lat, c.lng] as [number, number],
        color: "#ffd24a",
        flights: d.flights,
      };
    }).filter(Boolean) as GlobeArc[];
  }, []);

  const activeCode = hoveredCode ?? selectedCode;
  const active = destByCode.get(activeCode) ?? DESTINATIONS[0];

  // Reduced-motion: a calm static layout — static globe + card grid.
  if (reduce) {
    return (
      <section className="bg-[#05080f] py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="relative mb-8 h-[320px] overflow-hidden rounded-3xl border border-white/10">
            <LazyGlobe className="absolute inset-0" markers={markers} arcs={arcs} interactive={false} theme="dark" cameraZ={6.8} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((d) => (
              <DestinationCard key={d.code} dest={d} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#05080f] py-16 sm:py-20">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[150px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
            <Globe2 className="size-3.5" /> 50+ destinations, one partner
          </span>
          <h2 className="mt-6 text-[clamp(2rem,5vw,3.75rem)] font-black leading-[1.05] text-white">
            Where will your story begin?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
            Spin the globe and hover a glowing beacon to preview a destination — click it to fly
            there and open the pathway we know best.
          </p>
        </div>

        {/* globe (left) + prominent destination card (right) */}
        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
          {/* globe stage */}
          <div className="relative h-[clamp(380px,58vh,600px)] w-full">
            <LazyGlobe
              className="absolute inset-0"
              theme="dark"
              markers={markers}
              arcs={arcs}
              selectedCode={selectedCode}
              hoveredCode={hoveredCode}
              focusCode={selectedCode}
              flyToken={flyTick}
              onSelect={travelTo}
              onHover={setHoveredCode}
              interactive
              enableZoom={false}
              cameraZ={6.8}
              ariaLabel="Interactive globe of XIPHIAS destinations"
            />

            {/* drag hint */}
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[11px] font-medium text-white/70 backdrop-blur-sm">
              <MousePointerClick className="size-3.5 text-secondary" />
              Drag to spin · click a beacon to travel
            </div>
          </div>

          {/* prominent active card */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.code}
                initial={{ opacity: 0, x: 32, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -24, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <FeatureCard dest={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* beacon picker rail — click to fly the globe there (keyboard-friendly too) */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {DESTINATIONS.map((d) => {
            const isActive = d.code === activeCode;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => travelTo(d.code)}
                onMouseEnter={() => setHoveredCode(d.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition ${
                  isActive
                    ? "border-secondary bg-secondary text-primary"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-secondary/50 hover:text-white"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
