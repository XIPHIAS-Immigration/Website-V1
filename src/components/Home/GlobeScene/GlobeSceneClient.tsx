"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, Globe2 } from "lucide-react";

import { LazyGlobe } from "@/components/globe";
import type { GlobeArc, GlobeMarker } from "@/components/globe";

type Destination = {
  code: string;
  name: string;
  image: string;
  href: string;
  blurb: string;
  track: string;
};

const DESTINATIONS: Destination[] = [
  { code: "CA", name: "Canada", track: "Skilled migration", href: "/skilled/canada", image: "/images/skilled/canada/canada.webp", blurb: "Express Entry, provincial nominee programs and start-up visas to permanent residency." },
  { code: "PT", name: "Portugal", track: "Residency", href: "/residency/portugal", image: "/images/residency/portugal/portugal-golden-visa.webp", blurb: "The Golden Visa route to EU residency, schooling and a path to a powerful passport." },
  { code: "AE", name: "United Arab Emirates", track: "Residency", href: "/residency/uae", image: "/images/residency/uae/uae-golden-visa.webp", blurb: "The 10-year Golden Visa — 0% income tax and a global business hub." },
  { code: "GD", name: "Grenada", track: "Citizenship", href: "/citizenship/grenada", image: "/images/citizenship/grenada/grenada-citizenship.webp", blurb: "Citizenship by investment with rare US E-2 treaty access for your family." },
  { code: "GR", name: "Greece", track: "Residency", href: "/residency/greece", image: "/images/residency/greece/greece-golden-visa.webp", blurb: "Europe's most popular Golden Visa — real estate to Schengen residency." },
  { code: "AU", name: "Australia", track: "Skilled migration", href: "/skilled/australia", image: "/images/skilled/australia/skilled-australia-xiphias-immigration.webp", blurb: "Points-based skilled and regional visas leading to Australian PR." },
  { code: "TR", name: "Turkey", track: "Citizenship", href: "/citizenship/turkey", image: "/images/citizenship/turkey/turkey.webp", blurb: "Fast citizenship by investment bridging Europe and Asia." },
];

const INTRO_END = 0.16;

function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={dest.href}
      className="group block overflow-hidden rounded-3xl border border-white/15 bg-[#0a1322] shadow-2xl shadow-black/50"
    >
      <div className="relative h-44 w-full overflow-hidden sm:h-52">
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          sizes="(max-width:1024px) 90vw, 380px"
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

export default function GlobeSceneClient({ markers, arcs }: { markers: GlobeMarker[]; arcs: GlobeArc[] }) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [inCards, setInCards] = useState(false);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  // The globe canvas stays full-bleed (no scale/translate) — transforming the
  // WebGL canvas was what revealed the edge "gap" and janked under Lenis. The
  // card slides in over the globe's empty side while the globe rotates to face
  // the active country.
  const introOpacity = useTransform(scrollYProgress, [0, INTRO_END * 0.7], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (p < INTRO_END) {
      if (inCards) setInCards(false);
      return;
    }
    if (!inCards) setInCards(true);
    const t = (p - INTRO_END) / (1 - INTRO_END);
    const idx = Math.min(DESTINATIONS.length - 1, Math.max(0, Math.floor(t * DESTINATIONS.length)));
    setActive(idx);
  });

  const focusCode = inCards ? DESTINATIONS[active].code : null;

  // Reduced-motion / non-WebGL: a calm static layout.
  if (reduce) {
    return (
      <section className="bg-[#05080f] py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
          <div className="relative mb-8 h-[320px] overflow-hidden rounded-3xl border border-white/10">
            <LazyGlobe className="absolute inset-0" markers={markers} arcs={arcs} interactive={false} theme="dark" />
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
    <section ref={outer} style={{ height: `${80 + DESTINATIONS.length * 48}vh` }} className="relative bg-[#05080f]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#05080f]">
        {/* Globe — full-bleed, fixed (rotates to focus the active country) */}
        <div className="absolute inset-0">
          <LazyGlobe
            className="absolute inset-0"
            markers={markers}
            arcs={arcs}
            interactive={false}
            focusCode={focusCode}
            selectedCode={focusCode}
            cameraZ={3.4}
            theme="dark"
            ariaLabel="Globe of XIPHIAS destinations"
          />
        </div>

        {/* Intro overlay */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
            <Globe2 className="size-3.5" /> 50+ destinations, one partner
          </span>
          <h2 className="mt-6 max-w-4xl text-[clamp(2rem,6vw,4.5rem)] font-black leading-[1.05] text-white">
            Where will your story begin?
          </h2>
          <p className="mt-4 max-w-xl text-[15px] text-white/60">
            Keep scrolling — the globe will take you to the destinations we know best.
          </p>
        </motion.div>

        {/* Destination card (limelight, one at a time) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-4 pb-10 sm:bottom-1/2 sm:right-[6vw] sm:left-auto sm:translate-y-1/2 sm:justify-end sm:px-0">
          <AnimatePresence mode="wait">
            {inCards && (
              <motion.div
                key={DESTINATIONS[active].code}
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.96 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-[380px]"
              >
                <DestinationCard dest={DESTINATIONS[active]} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress rail */}
        <div className="absolute left-1/2 bottom-5 flex -translate-x-1/2 gap-2 sm:left-6 sm:top-1/2 sm:bottom-auto sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col">
          {DESTINATIONS.map((d, i) => (
            <span
              key={d.code}
              className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 sm:w-1.5 ${
                inCards && i === active ? "w-6 bg-secondary sm:h-6 sm:w-2" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
