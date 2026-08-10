import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  FileCheck2,
  Landmark,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { PassportRecord } from "@/data/passport-index";
import {
  PassportIndexShell,
  PassportSourceNote,
  passportProfileHref,
  scoreWidth,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";
import PassportGlobe from "@/components/PassportIndex/PassportGlobe";
import Counter from "@/components/motion/Counter";

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

const journeys = [
  {
    step: "01",
    icon: BarChart3,
    title: "Global ranking",
    description: "Search the mobility table and open an individual passport profile.",
    href: "/passport-index/ranking",
    cta: "Browse ranking",
  },
  {
    step: "02",
    icon: Compass,
    title: "Compare passports",
    description: "Place two passports side by side and understand the mobility gap.",
    href: "/passport-index/compare",
    cta: "Compare now",
  },
  {
    step: "03",
    icon: MapPinned,
    title: "My passport",
    description: "Begin with your current passport, priorities and preferred destination.",
    href: "/passport-index/my-passport",
    cta: "Build profile",
  },
  {
    step: "04",
    icon: Route,
    title: "Improve mobility",
    description: "Review residency, citizenship, skilled and corporate route families.",
    href: "/passport-index/improve",
    cta: "See routes",
  },
  {
    step: "05",
    icon: FileCheck2,
    title: "Methodology",
    description: "Review the data snapshot, scoring limits and advisor caveats.",
    href: "/passport-index/methodology",
    cta: "Read notes",
  },
];

const xiphiasLayers = [
  { icon: Landmark, label: "Rank", description: "Understand current travel access strength." },
  { icon: ShieldCheck, label: "Risk", description: "Review compliance, evidence and route constraints." },
  { icon: BookOpen, label: "Route", description: "Connect mobility goals to a practical next step." },
];

export default function PassportIndexClient({ records, stats }: Props) {
  const topRecords = records.filter((record) => record.rankValue <= 5).slice(0, 6);
  const statTiles = [
    { value: stats.trackedPassports, label: "Passports tracked" },
    { value: stats.trackedDestinations, label: "Destinations assessed" },
    { value: stats.topScore, label: "Top mobility score" },
    { value: stats.mobilityGap, label: "Top-to-bottom gap" },
  ];

  return (
    <PassportIndexShell
      active="overview"
      eyebrow="XIPHIAS Mobility Intelligence"
      title="Passport Power"
      description="See what your passport opens today, compare global mobility, and connect the ranking to a practical residency or citizenship strategy."
    >
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
          {statTiles.map((tile, index) => (
            <div
              key={tile.label}
              className={[
                "px-3 py-6 text-center sm:px-6",
                index % 2 === 0 ? "border-r border-slate-200" : "",
                index > 1 ? "border-t border-slate-200 lg:border-t-0" : "",
                index > 0 ? "lg:border-l lg:border-r-0" : "lg:border-r-0",
              ].join(" ")}
            >
              <Counter
                to={tile.value}
                className="block text-3xl font-bold leading-none text-primary sm:text-4xl"
              />
              <p className="type-caption mt-2 uppercase text-slate-500">{tile.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto mb-8 flex max-w-[1020px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="type-caption uppercase text-primary">Interactive mobility workspace</p>
              <h2 className="type-section-title mt-2 text-slate-950">
                Find your passport. See its global reach.
              </h2>
              <p className="type-body mt-3 text-slate-600">
                Select a passport to update the globe, ranking details and advisor context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/passport-index/my-passport"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
              >
                Check my passport <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/passport-index/compare"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-primary hover:text-primary"
              >
                Compare passports
              </Link>
            </div>
          </div>
          <PassportGlobe records={records} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="max-w-md">
              <p className="type-caption uppercase text-primary">Choose your next view</p>
              <h2 className="type-section-title mt-2 text-slate-950">
                One question at a time.
              </h2>
              <p className="type-body mt-4 text-slate-600">
                Open the part of Passport Power that matches the decision you are making now.
              </p>
            </div>

            <div className="border-y border-slate-300">
              {journeys.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.step}
                    href={item.href}
                    className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-slate-200 py-5 last:border-b-0"
                  >
                    <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="type-card-title block text-slate-950">{item.title}</span>
                      <span className="type-small mt-1 block text-slate-600">{item.description}</span>
                    </span>
                    <span className="hidden items-center gap-2 text-sm font-bold text-primary sm:inline-flex">
                      {item.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-screen-2xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_380px] lg:px-12">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="type-caption uppercase text-primary">Leading passports</p>
                <h2 className="type-section-title mt-2 text-slate-950">Top mobility cluster</h2>
              </div>
              <Link
                href="/passport-index/ranking"
                className="hidden items-center gap-2 text-sm font-bold text-primary hover:underline sm:inline-flex"
              >
                Full ranking <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 border-y border-slate-300">
              {topRecords.map((record) => (
                <Link
                  key={record.code}
                  href={passportProfileHref(record)}
                  className="group grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 py-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {record.code}
                      </span>
                      <div className="min-w-0">
                        <h3 className="type-card-title truncate text-slate-950">{record.country}</h3>
                        <p className="type-small text-slate-500">{record.band}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#e1b923]"
                        style={{ width: scoreWidth(record.score, stats.topScore) }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="type-caption block uppercase text-slate-400">Rank</span>
                      <strong className="type-small mt-1 block text-slate-700">{record.rank}</strong>
                    </div>
                    <div>
                      <span className="type-caption block uppercase text-slate-400">Score</span>
                      <strong className="mt-1 block text-xl font-bold text-primary">{record.score}</strong>
                    </div>
                    <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="self-start rounded-lg bg-primary p-7 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#e1b923]" aria-hidden="true" />
              <p className="type-caption uppercase text-[#e1b923]">XIPHIAS advisory layer</p>
            </div>
            <h2 className="type-section-title mt-3 text-white">Ranking is only the start.</h2>
            <p className="type-small mt-3 text-white/75">
              A score measures access. A useful plan also considers eligibility, evidence, risk and timing.
            </p>

            <div className="mt-6 divide-y divide-white/15 border-y border-white/15">
              {xiphiasLayers.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex gap-3 py-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-[#e1b923]" aria-hidden="true" />
                    <div>
                      <h3 className="type-card-title text-white">{item.label}</h3>
                      <p className="type-small mt-1 text-white/70">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/personal-booking"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#e1b923] px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#f0cb3b]"
            >
              Speak to an advisor <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/passport-index/improve"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/25 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore mobility routes <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
