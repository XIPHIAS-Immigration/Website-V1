import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Compass, FileCheck2, Landmark, MapPinned, Route, ShieldCheck, Sparkles } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";
import LazyPassportWorldMap from "@/components/PassportIndex/LazyPassportWorldMap";

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

const journeys = [
  {
    step: "01",
    icon: BarChart3,
    title: "Global ranking",
    description: "Search the curated mobility table and open individual passport profiles.",
    href: "/passport-index/ranking",
    cta: "Browse ranking",
  },
  {
    step: "02",
    icon: Compass,
    title: "Compare passports",
    description: "Choose two passports and see the mobility gap and advisory meaning.",
    href: "/passport-index/compare",
    cta: "Compare now",
  },
  {
    step: "03",
    icon: MapPinned,
    title: "My passport",
    description: "Start from the client passport and goal, then get a practical direction.",
    href: "/passport-index/my-passport",
    cta: "Build profile",
  },
  {
    step: "04",
    icon: Route,
    title: "Improve mobility",
    description: "Review the main route families: residency, citizenship, skilled, and corporate.",
    href: "/passport-index/improve",
    cta: "See routes",
  },
  {
    step: "05",
    icon: FileCheck2,
    title: "Methodology",
    description: "Understand the source snapshot, limits, scoring, and advisor caveats.",
    href: "/passport-index/methodology",
    cta: "Read notes",
  },
];

const xiphiasLayers = [
  {
    icon: Landmark,
    label: "Rank",
    description: "Shows current travel access strength.",
  },
  {
    icon: ShieldCheck,
    label: "Risk",
    description: "Adds program, compliance, and document review.",
  },
  {
    icon: BookOpen,
    label: "Route",
    description: "Connects ranking to residence or citizenship actions.",
  },
];

export default function PassportIndexClient({ records, stats }: Props) {
  const topRecords = records.filter((record) => record.rankValue <= 5).slice(0, 6);

  return (
    <PassportIndexShell
      active="overview"
      eyebrow="XIPHIAS Global Mobility Index"
      title="Passport power, transformed into a mobility strategy."
      description="A premium visual index for families, investors, and founders who want to understand travel access, compare passports, and move from ranking to a practical residence or citizenship route."
    >
      {/* ── Stats strip + world map ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 pb-8 pt-8 md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { value: stats.trackedPassports,    label: "passports tracked" },
              { value: stats.trackedDestinations, label: "destinations assessed" },
              { value: stats.mobilityGap,         label: "destination gap" },
            ].map(({ value, label }) => (
              <div key={label} className="inline-flex items-baseline gap-2 rounded-full border border-[#E1E1E1] bg-[#F5F7FA] px-4 py-2">
                <span className="text-[1.125rem] font-black leading-none text-[#1c57b4]">{value}</span>
                <span className="text-[12.5px] font-medium text-[#505050]">{label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden h-5 w-px bg-[#E1E1E1] sm:block" aria-hidden="true" />
              <Link
                href="/passport-index/ranking"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c57b4] px-4 py-2 text-[13px] font-black text-white transition hover:bg-[#1648a0]"
              >
                View ranking <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/passport-index/compare"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E1E1] px-4 py-2 text-[13px] font-black text-[#263238] transition hover:border-[#1c57b4] hover:text-[#1c57b4]"
              >
                Compare passports
              </Link>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-[#E1E1E1]">
            <LazyPassportWorldMap records={records} />
          </div>
        </div>
      </section>

      {/* ── Client journeys ── */}
      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Explore the section</p>
            <h2 className="mt-1.5 text-2xl font-black text-[#071a3a] md:text-3xl">Five focused client views.</h2>
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-[#505050]">
            Each view answers one question and sends the visitor to the next useful step.
          </p>
        </div>

        {/* 5-card journey grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {journeys.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.step}
                href={item.href}
                className="group flex flex-col rounded-xl border border-[#E1E1E1] bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#1c57b4] hover:shadow-md"
              >
                {/* Step + icon row */}
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#1c57b4] transition group-hover:bg-[#1c57b4] group-hover:text-white">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[10px] font-black tabular-nums text-[#9ca3af]">{item.step}</span>
                </div>

                {/* Content */}
                <h3 className="mt-3.5 text-[13.5px] font-black text-[#071a3a]">{item.title}</h3>
                <p className="mt-1.5 flex-1 text-[12px] leading-[1.6] text-[#505050]">{item.description}</p>

                {/* CTA */}
                <span className="mt-3.5 inline-flex items-center gap-1.5 text-[12px] font-black text-[#1c57b4]">
                  {item.cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Top mobility cluster + XIPHIAS layer ── */}
      <section className="mx-auto max-w-screen-2xl px-4 pb-10 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

          {/* Left: top passports */}
          <div className="rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Leading passports</p>
                <h2 className="mt-1 text-xl font-black text-[#071a3a]">Top mobility cluster</h2>
              </div>
              <Link
                href="/passport-index/ranking"
                className="hidden items-center gap-1.5 rounded-lg border border-[#E1E1E1] px-3 py-1.5 text-[12px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff] md:inline-flex"
              >
                Full ranking <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topRecords.map((record) => (
                <PassportMiniCard key={record.code} record={record} stats={stats} />
              ))}
            </div>
          </div>

          {/* Right: XIPHIAS layer */}
          <aside className="flex flex-col rounded-xl border border-white/20 bg-gradient-to-br from-[#1c57b4] to-[#0d3b8e] p-5 shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[#e1b923]" aria-hidden="true" />
              <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#e1b923]">XIPHIAS layer</p>
            </div>
            <h2 className="mt-2 text-xl font-black text-white">Ranking is only the start.</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
              A score shows access. XIPHIAS connects it to eligibility, risk, and a real route for the client.
            </p>

            {/* 3 layer cards */}
            <div className="mt-4 grid gap-2.5">
              {xiphiasLayers.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg border border-white/12 bg-white/8 p-3.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e1b923] text-[#071a3a]">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[13px] font-black text-white">{item.label}</h3>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-white/50">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] leading-[1.55] text-white/60">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-4 h-px bg-white/10" />

            {/* CTA */}
            <Link
              href="/personal-booking"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e1b923] px-4 py-2.5 text-[13px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              Speak to an advisor <ArrowRight className="size-3.5" />
            </Link>

            {/* Secondary link */}
            <Link
              href="/passport-index/improve"
              className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 px-4 py-2.5 text-[12.5px] font-black text-white/70 transition hover:border-white/30 hover:text-white"
            >
              View route families <ArrowRight className="size-3" />
            </Link>
          </aside>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
