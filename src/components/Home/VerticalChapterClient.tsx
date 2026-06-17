"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CharReveal, Reveal } from "@/components/motion";

export type ChapterCountry = {
  name: string;
  slug: string;
  summary: string;
  image: string;
  href: string;
};

type Props = {
  eyebrow: string;
  title: string;
  blurb: string;
  accent: string;
  hubHref: string;
  hubLabel: string;
  countries: ChapterCountry[];
  flip?: boolean;
};

function clampText(s: string, max = 150) {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
}

function CountryCard({ country, accent }: { country: ChapterCountry; accent: string }) {
  return (
    <Link
      href={country.href}
      className="pointer-events-auto group block overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1322]"
    >
      <div className="relative h-56 w-full overflow-hidden sm:h-64">
        <Image
          src={country.image}
          alt={country.name}
          fill
          sizes="(max-width:1024px) 90vw, 540px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <h3 className="absolute bottom-4 left-5 text-2xl font-black text-white drop-shadow">{country.name}</h3>
      </div>
      <div className="p-6">
        <p className="text-[14px] leading-relaxed text-light_grey dark:text-white/65">{clampText(country.summary)}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-bold" style={{ color: accent }}>
          Explore {country.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Pinned, full-screen vertical chapter. The intro holds the left while curated
 * destinations slide in horizontally one-by-one as the section scrolls — the
 * same "set" feel as the other chapters (no separate up/down preview).
 */
export default function VerticalChapterClient({
  eyebrow,
  title,
  blurb,
  accent,
  hubHref,
  hubLabel,
  countries,
  flip = false,
}: Props) {
  const reduce = useReducedMotion();
  const outer = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(countries.length - 1, Math.max(0, Math.floor(p * countries.length)));
    setActive(idx);
  });

  const Intro = (
    <div className={flip ? "lg:order-2" : ""}>
      <Reveal>
        <span
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}12` }}
        >
          {eyebrow}
        </span>
      </Reveal>
      <h2 className="mt-6 text-[clamp(2.2rem,5vw,4.2rem)] font-black leading-[1.04] tracking-tight text-midnight_text dark:text-white">
        <CharReveal text={title} />
      </h2>
      <Reveal delay={0.1}>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-light_grey dark:text-white/65">{blurb}</p>
      </Reveal>

      {/* progress rail */}
      <div className="mt-7 flex items-center gap-2">
        {countries.map((c, i) => (
          <span
            key={c.slug}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === active ? 32 : 12, backgroundColor: i === active ? accent : "rgba(120,120,120,0.3)" }}
          />
        ))}
      </div>

      <Reveal delay={0.2}>
        <Link
          href={hubHref}
          className="mt-7 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-lg transition hover:gap-3"
          style={{ backgroundColor: accent }}
        >
          {hubLabel}
          <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </div>
  );

  if (reduce) {
    return (
      <section className="bg-white py-20 dark:bg-darkmode">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {Intro}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countries.map((c) => (
              <CountryCard key={c.slug} country={c} accent={accent} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outer}
      style={{ height: `${70 + countries.length * 42}vh` }}
      className="relative bg-white dark:bg-darkmode"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div
          className="pointer-events-none absolute h-[460px] w-[460px] rounded-full opacity-[0.13] blur-[150px]"
          style={{ background: accent, top: "12%", [flip ? "right" : "left"]: "-4%" } as CSSProperties}
        />
        <div className="mx-auto grid w-full max-w-screen-2xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {Intro}
          <div className={`flex justify-center ${flip ? "lg:order-1 lg:justify-start" : "lg:justify-end"}`}>
            <div className="w-full max-w-[540px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={countries[active]?.slug}
                  initial={{ opacity: 0, x: 80, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -60, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  {countries[active] && <CountryCard country={countries[active]} accent={accent} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
