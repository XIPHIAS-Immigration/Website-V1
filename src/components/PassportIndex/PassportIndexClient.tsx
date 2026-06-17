import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, Compass, FileCheck2, Landmark, MapPinned, Route, ShieldCheck, Sparkles } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";
import PassportGlobe from "@/components/PassportIndex/PassportGlobe";
import Counter from "@/components/motion/Counter";
import Reveal from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

const journeys = [
  { step: "01", icon: BarChart3, title: "Global ranking", description: "Search the curated mobility table and open individual passport profiles.", href: "/passport-index/ranking", cta: "Browse ranking" },
  { step: "02", icon: Compass, title: "Compare passports", description: "Choose two passports and see the mobility gap and advisory meaning.", href: "/passport-index/compare", cta: "Compare now" },
  { step: "03", icon: MapPinned, title: "My passport", description: "Start from the client passport and goal, then get a practical direction.", href: "/passport-index/my-passport", cta: "Build profile" },
  { step: "04", icon: Route, title: "Improve mobility", description: "Review the main route families: residency, citizenship, skilled, and corporate.", href: "/passport-index/improve", cta: "See routes" },
  { step: "05", icon: FileCheck2, title: "Methodology", description: "Understand the source snapshot, limits, scoring, and advisor caveats.", href: "/passport-index/methodology", cta: "Read notes" },
];

const xiphiasLayers = [
  { icon: Landmark, label: "Rank", description: "Shows current travel access strength." },
  { icon: ShieldCheck, label: "Risk", description: "Adds program, compliance, and document review." },
  { icon: BookOpen, label: "Route", description: "Connects ranking to residence or citizenship actions." },
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
      eyebrow="XIPHIAS Global Mobility Index"
      title="Passport power, transformed into a mobility strategy."
      description="A premium visual index for families, investors and founders — understand travel access, compare passports, and move from a ranking to a practical residence or citizenship route."
    >
      {/* ── Animated stat band ── */}
      <section className="bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 pt-10 md:px-6">
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statTiles.map((tile) => (
              <StaggerItem
                key={tile.label}
                className="rounded-2xl border border-[#E1E1E1] bg-gradient-to-br from-white to-[#f5f8ff] p-6 text-center shadow-sm"
              >
                <Counter to={tile.value} className="block text-4xl font-black leading-none text-[#1c57b4] md:text-5xl" />
                <p className="mt-2.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#505050]">{tile.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Big globe display — near full-page, cinematic ── */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-[1840px] px-3 pb-12 pt-8 sm:px-5">
          <Reveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">The world access globe</p>
              <h2 className="mt-1.5 text-3xl font-black text-[#071a3a] md:text-[2.75rem]">Spin the world. Find your access.</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/passport-index/ranking" className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c57b4] px-5 py-3 text-[14px] font-black text-white transition hover:bg-[#1648a0]">
                View ranking <ArrowRight className="size-4" />
              </Link>
              <Link href="/passport-index/compare" className="inline-flex items-center gap-1.5 rounded-xl border border-[#E1E1E1] px-5 py-3 text-[14px] font-black text-[#263238] transition hover:border-[#1c57b4] hover:text-[#1c57b4]">
                Compare passports
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <PassportGlobe records={records} />
          </Reveal>
        </div>
      </section>

      {/* ── Client journeys ── */}
      <section className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
        <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Explore the section</p>
            <h2 className="mt-1.5 text-3xl font-black text-[#071a3a] md:text-4xl">Five focused client views.</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-[#505050]">
            Each view answers one question and sends the visitor to the next useful step.
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {journeys.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.step}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-2xl border border-[#E1E1E1] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#1c57b4] hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#1c57b4] transition group-hover:bg-[#1c57b4] group-hover:text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-[26px] font-black tabular-nums text-[#e6eaf0]">{item.step}</span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-black text-[#071a3a]">{item.title}</h3>
                  <p className="mt-1.5 flex-1 text-[13.5px] leading-[1.7] text-[#505050]">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-black text-[#1c57b4]">
                    {item.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* ── Top mobility cluster + XIPHIAS layer ── */}
      <section className="mx-auto max-w-screen-2xl px-4 pb-14 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Reveal className="rounded-2xl border border-[#E1E1E1] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Leading passports</p>
                <h2 className="mt-1 text-2xl font-black text-[#071a3a]">Top mobility cluster</h2>
              </div>
              <Link href="/passport-index/ranking" className="hidden items-center gap-1.5 rounded-xl border border-[#E1E1E1] px-4 py-2 text-[13px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff] md:inline-flex">
                Full ranking <ArrowRight className="size-4" />
              </Link>
            </div>
            <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topRecords.map((record) => (
                <StaggerItem key={record.code}>
                  <PassportMiniCard record={record} stats={stats} />
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col rounded-2xl border border-white/20 bg-gradient-to-br from-[#1c57b4] to-[#0d3b8e] p-7 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#e1b923]" aria-hidden="true" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#e1b923]">XIPHIAS layer</p>
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">Ranking is only the start.</h2>
            <p className="mt-2.5 text-[14px] leading-relaxed text-white/65">
              A score shows access. XIPHIAS connects it to eligibility, risk, and a real route for the client.
            </p>
            <div className="mt-5 grid gap-3">
              {xiphiasLayers.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3.5 rounded-xl border border-white/12 bg-white/8 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e1b923] text-[#071a3a]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-black text-white">{item.label}</h3>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/50">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-[1.55] text-white/65">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="my-5 h-px bg-white/10" />
            <Link href="/personal-booking" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 py-3 text-[14px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]">
              Speak to an advisor <ArrowRight className="size-4" />
            </Link>
            <Link href="/passport-index/improve" className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 px-4 py-3 text-[13px] font-black text-white/70 transition hover:border-white/30 hover:text-white">
              View route families <ArrowRight className="size-3.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
