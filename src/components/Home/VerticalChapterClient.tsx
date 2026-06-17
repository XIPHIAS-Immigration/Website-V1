"use client";

import { type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CharReveal, Reveal, Stagger, StaggerItem } from "@/components/motion";

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
  /** Accepted for API compatibility; layout no longer alternates. */
  flip?: boolean;
};

function clampText(s: string, max = 116) {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
}

function CountryCard({ country, accent }: { country: ChapterCountry; accent: string }) {
  return (
    <Link
      href={country.href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#0b1322]"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={country.image}
          alt={country.name}
          fill
          sizes="(max-width:1024px) 50vw, 30vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <h3 className="absolute bottom-3 left-4 text-xl font-black text-white drop-shadow">{country.name}</h3>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13.5px] leading-relaxed text-light_grey dark:text-white/65">{clampText(country.summary)}</p>
        <span
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-bold"
          style={{ color: accent }}
        >
          Explore {country.name}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/**
 * One full-screen vertical "chapter". The whole set of destinations cascades in
 * together when the section scrolls into view (Stagger) — so the visitor moves
 * one section per scroll instead of one destination at a time.
 */
export default function VerticalChapterClient({
  eyebrow,
  title,
  blurb,
  accent,
  hubHref,
  hubLabel,
  countries,
}: Props) {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-white py-16 dark:bg-darkmode">
      <div
        className="pointer-events-none absolute h-[460px] w-[460px] rounded-full opacity-[0.13] blur-[150px]"
        style={{ background: accent, top: "8%", left: "-4%" } as CSSProperties}
      />

      <div className="relative mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: accent, borderColor: `${accent}55`, backgroundColor: `${accent}12` }}
            >
              {eyebrow}
            </span>
            <h2 className="mt-4 max-w-3xl text-[clamp(2rem,4.6vw,3.4rem)] font-black leading-[1.05] tracking-tight text-midnight_text dark:text-white">
              <CharReveal text={title} />
            </h2>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-light_grey dark:text-white/65">{blurb}</p>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Link
              href={hubHref}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white shadow-lg transition hover:gap-3"
              style={{ backgroundColor: accent }}
            >
              {hubLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        {/* All destinations — cascade in together */}
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" amount={0.15}>
          {countries.map((c) => (
            <StaggerItem key={c.slug} className="h-full">
              <CountryCard country={c} accent={accent} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
