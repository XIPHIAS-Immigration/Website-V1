"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Plane,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  bandClass,
  passportProfileHref,
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  regionClass,
  scoreWidth,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";

type GoalId = "travel" | "education" | "business" | "plan-b" | "eu-life";

const goals: Array<{ id: GoalId; label: string; description: string; icon: typeof Plane }> = [
  { id: "travel",    label: "Travel access",       description: "Increase visa-free movement for family and business travel.",            icon: Plane },
  { id: "education", label: "Children's education", description: "Plan residence and long-term settlement around schooling.",              icon: GraduationCap },
  { id: "business",  label: "Business expansion",   description: "Improve access for company setup, investor visas, or founder mobility.", icon: BriefcaseBusiness },
  { id: "plan-b",    label: "Family Plan B",        description: "Build a second-residence or citizenship safety route.",                  icon: ShieldCheck },
  { id: "eu-life",   label: "EU lifestyle",         description: "Explore Schengen residence, eventual citizenship, and low-presence options.", icon: Home },
];

type Props = { records: PassportRecord[]; stats: PassportStats };

function recommendationFor(goal: GoalId, record: PassportRecord) {
  if (goal === "education") return {
    eyebrow: "Education route",
    title: "Start with residence and schooling fit.",
    body: "Prioritize Canada, Europe, UK, Australia, or US-linked routes where school access, parent status, timeline, and document readiness can be mapped cleanly.",
    href: "/eligibility", cta: "Check eligibility",
    checks: ["School enrollment eligibility per country", "Parent residence rights and stay obligations", "Language and age-entry requirements", "Timeline from application to enrollment"],
  };
  if (goal === "business") return {
    eyebrow: "Corporate mobility",
    title: "Start with corporate mobility and investor residence.",
    body: "Compare UAE, Portugal, US, Canada, and EU company routes against ownership structure, funds, hiring plan, and travel needs.",
    href: "/corporate", cta: "View corporate routes",
    checks: ["Company structure and ownership compatibility", "Investor visa thresholds per country", "Source of funds documentation depth", "Founder travel frequency vs. stay requirements"],
  };
  if (goal === "plan-b") return {
    eyebrow: "Citizenship & residency",
    title: "Start with a second-residence safety route.",
    body: "Shortlist residence and citizenship options by physical presence, due diligence, family inclusion, timeline, and total cost.",
    href: "/citizenship", cta: "View citizenship routes",
    checks: ["Physical presence obligations per program", "Family inclusion and dependent eligibility", "Due diligence depth and source-of-funds review", "Program timeline: residency → citizenship"],
  };
  if (goal === "eu-life") return {
    eyebrow: "EU residency",
    title: "Start with Europe residence routes.",
    body: "Look at Portugal, Greece, Spain, Malta, Hungary, Latvia, and Switzerland depending on investment appetite, stay requirement, and tax planning.",
    href: "/residency", cta: "View residency routes",
    checks: ["Investment threshold varies: €250k–€500k+", "Minimum annual stay obligations by country", "Tax residence and reporting implications", "Eventual citizenship eligibility timeline"],
  };
  if (record.score >= 170) return {
    eyebrow: "High-access passport",
    title: "Your passport is already high access.",
    body: "The next discussion should focus less on visa-free score and more on tax residence, lifestyle, asset protection, and family optionality.",
    href: "/personal-booking", cta: "Talk to advisor",
    checks: ["Tax residence optimisation opportunities", "Asset protection and holding structure", "Lifestyle and low-presence route options", "Family optionality and long-term planning"],
  };
  return {
    eyebrow: "Mobility upgrade",
    title: "A mobility upgrade may be meaningful.",
    body: "Use residence or citizenship planning to improve travel access, but keep due diligence, source of funds, and timeline realistic from the start.",
    href: "/passport-index/improve", cta: "See improvement routes",
    checks: ["Due diligence readiness and background check", "Source of funds clarity and documentation", "Realistic timeline: 12–36 months typical", "Program eligibility pre-check before applying"],
  };
}

export default function PassportPlannerClient({ records, stats }: Props) {
  const [passportCode, setPassportCode] = useState("IN");
  const [goal, setGoal] = useState<GoalId>("plan-b");

  const selected   = records.find((r) => r.code === passportCode) ?? records[0];
  const rec        = useMemo(() => recommendationFor(goal, selected), [goal, selected]);
  const targetRecs = useMemo(() => records.filter((r) => r.score > selected.score).slice(0, 3), [records, selected]);

  return (
    <PassportIndexShell
      active="my-passport"
      eyebrow="My passport"
      title="Start from the client profile, not from a generic ranking."
      description="Choose the current passport and primary goal. The page gives a concise direction and the next XIPHIAS action."
    >
      <section className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6">
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">

          {/* ══ LEFT — profile builder ══ */}
          <aside className="flex flex-col gap-4 rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">

            {/* Header */}
            <div>
              <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">My passport</p>
              <h2 className="mt-0.5 text-base font-black text-[#071a3a]">Build your profile</h2>
            </div>

            {/* Passport select */}
            <div>
              <label htmlFor="planner-passport" className="mb-1.5 block text-[10.5px] font-black uppercase tracking-[0.14em] text-[#505050]">
                Current passport
              </label>
              <div className="relative">
                <select
                  id="planner-passport"
                  value={passportCode}
                  onChange={(e) => setPassportCode(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#E1E1E1] bg-white py-2.5 pl-3 pr-8 text-[13px] font-semibold text-[#263238] outline-none focus:border-[#1c57b4] focus:ring-2 focus:ring-[#1c57b4] focus:ring-offset-1"
                >
                  {records.map((r) => (
                    <option key={r.code} value={r.code}>{r.country} · {r.score}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
              </div>

              {/* Passport mini stats */}
              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] px-2 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#9ca3af]">Code</p>
                  <p className="mt-0.5 text-[12px] font-black text-[#071a3a]">{selected.code}</p>
                </div>
                <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] px-2 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#9ca3af]">Rank</p>
                  <p className="mt-0.5 text-[12px] font-black text-[#071a3a]">{selected.rank}</p>
                </div>
                <div className="rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] px-2 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#9ca3af]">Score</p>
                  <p className="mt-0.5 text-[12px] font-black text-[#1c57b4]">{selected.score}</p>
                </div>
              </div>

              {/* Score bar */}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E1E1E1]">
                <div className="h-full rounded-full bg-[#1c57b4] transition-all duration-500" style={{ width: scoreWidth(selected.score, stats.topScore) }} />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-black ${bandClass(selected.band)}`}>{selected.band}</span>
                <span className="text-[10px] text-[#9ca3af] tabular-nums">{selected.score} / {stats.topScore}</span>
              </div>
            </div>

            <div className="border-t border-[#E1E1E1]" />

            {/* Goal list — compact: only active shows description */}
            <div>
              <p className="mb-2 text-[10.5px] font-black uppercase tracking-[0.14em] text-[#505050]">Primary goal</p>
              <div className="grid gap-1.5">
                {goals.map((item) => {
                  const Icon = item.icon;
                  const active = goal === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoal(item.id)}
                      className={[
                        "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
                        active ? "border-[#1c57b4] bg-[#eaf2ff]" : "border-[#E1E1E1] bg-white hover:bg-[#F5F7FA]",
                      ].join(" ")}
                    >
                      <span className={[
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                        active ? "bg-[#1c57b4] text-white" : "bg-[#F5F7FA] text-[#1c57b4]",
                      ].join(" ")}>
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[12.5px] font-black leading-tight ${active ? "text-[#1c57b4]" : "text-[#071a3a]"}`}>
                          {item.label}
                        </span>
                        {active && (
                          <span className="mt-1 block text-[11px] leading-[1.5] text-[#505050]">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {active && <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-[#1c57b4]" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Talk to advisor CTA */}
            <Link
              href="/personal-booking"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E1E1E1] px-4 py-2.5 text-[12.5px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff]"
            >
              Talk to an advisor <ArrowRight className="size-3.5" />
            </Link>
          </aside>

          {/* ══ RIGHT — results ══ */}
          <div className="flex flex-col gap-5">

            {/* Direction card */}
            <div className="rounded-xl border border-[#E1E1E1] bg-white shadow-sm overflow-hidden">

              {/* Passport bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E1E1] bg-[#F5F7FA] px-5 py-3">
                <MapPin className="size-3.5 text-[#1c57b4]" aria-hidden="true" />
                <span className="text-[10.5px] font-black uppercase tracking-[0.14em] text-[#505050]">Current passport</span>
                <span className="h-3 w-px bg-[#E1E1E1]" />
                <span className="text-[13px] font-black text-[#071a3a]">{selected.country}</span>
                <span className="rounded-md border border-[#E1E1E1] bg-white px-2 py-0.5 text-[10px] font-black text-[#505050]">{selected.code}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${regionClass(selected.region)}`}>{selected.region}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${bandClass(selected.band)}`}>{selected.band}</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#1c57b4] px-3 py-1 text-[11.5px] font-black text-white tabular-nums">
                  {selected.score} <span className="font-normal opacity-70">score</span>
                </span>
              </div>

              {/* Direction body — single column */}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-md bg-[#eaf2ff]">
                    <TrendingUp className="size-3.5 text-[#1c57b4]" aria-hidden="true" />
                  </span>
                  <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">{rec.eyebrow}</p>
                </div>
                <h2 className="mt-3 text-[1.2rem] font-black leading-snug text-[#071a3a]">{rec.title}</h2>
                <p className="mt-2 text-[13px] leading-[1.7] text-[#505050]">{rec.body}</p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    href={rec.href}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c57b4] px-4 py-2.5 text-[12.5px] font-black text-white transition hover:bg-[#1648a0]"
                  >
                    {rec.cta} <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href={passportProfileHref(selected)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E1E1] px-4 py-2.5 text-[12.5px] font-black text-[#1c57b4] transition hover:border-[#1c57b4] hover:bg-[#eaf2ff]"
                  >
                    Passport profile
                  </Link>
                </div>

                {/* Key checks — 2×2 grid below CTAs */}
                <div className="mt-4 border-t border-[#E1E1E1] pt-4">
                  <p className="mb-2.5 text-[10.5px] font-black uppercase tracking-[0.18em] text-[#505050]">Key checks</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {rec.checks.map((check) => (
                      <div key={check} className="flex gap-2 rounded-lg border border-[#E1E1E1] bg-[#F5F7FA] px-3 py-2.5">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#1c57b4]" aria-hidden="true" />
                        <p className="text-[12px] leading-[1.5] text-[#505050]">{check}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrades section */}
            {targetRecs.length > 0 && (
              <div className="rounded-xl border border-[#E1E1E1] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10.5px] font-black uppercase tracking-[0.2em] text-[#1c57b4]">Possible upgrades</p>
                    <h2 className="mt-0.5 text-base font-black text-[#071a3a]">Passports with higher access</h2>
                  </div>
                  <Link
                    href="/passport-index/ranking"
                    className="hidden items-center gap-1 text-[12px] font-black text-[#1c57b4] sm:inline-flex hover:underline"
                  >
                    Full ranking <ArrowRight className="size-3.5" />
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {targetRecs.map((record) => (
                    <PassportMiniCard key={record.code} record={record} stats={stats} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
