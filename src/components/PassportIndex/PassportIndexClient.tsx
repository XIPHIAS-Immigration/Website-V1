import Link from "next/link";
import { ArrowRight, BarChart3, Compass, FileCheck2, Globe2, MapPinned, Route } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  indexValueCards,
  PassportBookVisual,
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  RouteCard,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";
import LazyPassportWorldMap from "@/components/PassportIndex/LazyPassportWorldMap";

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

export default function PassportIndexClient({ records, stats }: Props) {
  const topRecords = records.filter((record) => record.rankValue <= 5).slice(0, 6);
  const featured = records.find((record) => record.code === "SG") ?? records[0];

  return (
    <PassportIndexShell
      active="overview"
      eyebrow="XIPHIAS Global Mobility Index"
      title="Passport power, transformed into a mobility strategy."
      description="A premium visual index for families, investors, and founders who want to understand travel access, compare passports, and move from ranking to a practical residence or citizenship route."
    >
      <section className="bg-[#071a3a] text-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b923]/45 bg-white/10 px-3 py-2 text-sm font-black text-[#f6d86d]">
              <Globe2 className="size-4" />
              Static snapshot, advisor-led interpretation
            </div>
            <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              See where a passport can take you next.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              The index should not stop at a number. XIPHIAS adds the next layer: family goals, investment route, physical presence, compliance checks, and a realistic migration plan.
            </p>

            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-black text-[#f6d86d]">{stats.trackedPassports}</p>
                <p className="mt-1 text-sm text-white/75">passports tracked</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-black text-[#f6d86d]">{stats.trackedDestinations}</p>
                <p className="mt-1 text-sm text-white/75">destinations assessed</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-3xl font-black text-[#f6d86d]">{stats.mobilityGap}</p>
                <p className="mt-1 text-sm text-white/75">destination gap</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/passport-index/ranking"
                className="inline-flex items-center gap-2 rounded-md bg-[#e1b923] px-5 py-3 text-sm font-black text-[#071a3a] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]"
              >
                View ranking <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/passport-index/compare"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Compare passports
              </Link>
            </div>
          </div>

            <div className="group hidden lg:block">
            <PassportBookVisual featured={featured} />
            </div>
          </div>

          <div className="mt-10">
            <LazyPassportWorldMap records={records} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Explore the section</p>
            <h2 className="mt-2 text-3xl font-black text-[#071a3a] md:text-4xl dark:text-white">
              Split into clear client journeys.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Instead of one crowded page, each view answers one question and sends the visitor to the next useful step.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <RouteCard
            icon={BarChart3}
            title="Global ranking"
            description="Search the curated mobility table and open individual passport profiles."
            href="/passport-index/ranking"
            cta="Browse ranking"
          />
          <RouteCard
            icon={Compass}
            title="Compare passports"
            description="Choose two passports and see the mobility gap, strengths, and advisory meaning."
            href="/passport-index/compare"
            cta="Compare now"
          />
          <RouteCard
            icon={MapPinned}
            title="My passport"
            description="Start from the client passport and goal, then get a practical direction."
            href="/passport-index/my-passport"
            cta="Build profile"
          />
          <RouteCard
            icon={Route}
            title="Improve mobility"
            description="Review the main route families: residency, citizenship, skilled, and corporate mobility."
            href="/passport-index/improve"
            cta="See routes"
          />
          <RouteCard
            icon={FileCheck2}
            title="Methodology"
            description="Understand the source snapshot, limits, scoring interpretation, and advisor caveats."
            href="/passport-index/methodology"
            cta="Read notes"
          />
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pb-10 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_430px]">
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Leading passports</p>
                <h2 className="mt-2 text-3xl font-black text-[#071a3a] dark:text-white">Top mobility cluster</h2>
              </div>
              <Link href="/passport-index/ranking" className="hidden items-center gap-2 text-sm font-black text-[#1c57b4] md:inline-flex">
                Full ranking <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topRecords.map((record) => (
                <PassportMiniCard key={record.code} record={record} stats={stats} />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-[#e1b923]/45 bg-[#071a3a] p-5 text-white shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f6d86d]">XIPHIAS layer</p>
            <h2 className="mt-2 text-2xl font-black">Ranking is only the start.</h2>
            <div className="mt-5 grid gap-3">
              {indexValueCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-3 rounded-md border border-white/15 bg-white/10 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e1b923] text-[#071a3a]">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/78">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/personal-booking"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#e1b923] px-4 py-3 text-sm font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
            >
              Speak to an advisor <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
