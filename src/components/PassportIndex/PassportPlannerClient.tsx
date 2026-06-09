"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Home, Plane, ShieldCheck } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import {
  PassportBookVisual,
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  type PassportStats,
} from "@/components/PassportIndex/PassportIndexShared";

type GoalId = "travel" | "education" | "business" | "plan-b" | "eu-life";

const goals: Array<{
  id: GoalId;
  label: string;
  description: string;
  icon: typeof Plane;
}> = [
  {
    id: "travel",
    label: "Travel access",
    description: "Increase visa-free movement for family and business travel.",
    icon: Plane,
  },
  {
    id: "education",
    label: "Children's education",
    description: "Plan residence and long-term settlement around schooling.",
    icon: GraduationCap,
  },
  {
    id: "business",
    label: "Business expansion",
    description: "Improve access for company setup, investor visas, or founder mobility.",
    icon: BriefcaseBusiness,
  },
  {
    id: "plan-b",
    label: "Family Plan B",
    description: "Build a second-residence or citizenship safety route.",
    icon: ShieldCheck,
  },
  {
    id: "eu-life",
    label: "EU lifestyle",
    description: "Explore Schengen residence, eventual citizenship, and low-presence options.",
    icon: Home,
  },
];

type Props = {
  records: PassportRecord[];
  stats: PassportStats;
};

function recommendationFor(goal: GoalId, record: PassportRecord) {
  if (goal === "education") {
    return {
      title: "Start with residence and schooling fit.",
      body: "Prioritize Canada, Europe, UK, Australia, or US-linked routes where school access, parent status, timeline, and document readiness can be mapped cleanly.",
      href: "/eligibility",
      cta: "Check eligibility",
    };
  }

  if (goal === "business") {
    return {
      title: "Start with corporate mobility and investor residence.",
      body: "Compare UAE, Portugal, US, Canada, and EU company routes against ownership structure, funds, hiring plan, and travel needs.",
      href: "/corporate",
      cta: "View corporate routes",
    };
  }

  if (goal === "plan-b") {
    return {
      title: "Start with a second-residence safety route.",
      body: "Shortlist residence and citizenship options by physical presence, due diligence, family inclusion, timeline, and total cost.",
      href: "/citizenship",
      cta: "View citizenship routes",
    };
  }

  if (goal === "eu-life") {
    return {
      title: "Start with Europe residence routes.",
      body: "Look at Portugal, Greece, Spain, Malta, Hungary, Latvia, and Switzerland depending on investment appetite, stay requirement, and tax planning.",
      href: "/residency",
      cta: "View residency routes",
    };
  }

  if (record.score >= 170) {
    return {
      title: "Your passport is already high access.",
      body: "The next discussion should focus less on visa-free score and more on tax residence, lifestyle, asset protection, and family optionality.",
      href: "/personal-booking",
      cta: "Talk to advisor",
    };
  }

  return {
    title: "A mobility upgrade may be meaningful.",
    body: "Use residence or citizenship planning to improve travel access, but keep due diligence, source of funds, and timeline realistic from the start.",
    href: "/passport-index/improve",
    cta: "See improvement routes",
  };
}

export default function PassportPlannerClient({ records, stats }: Props) {
  const [passportCode, setPassportCode] = useState("IN");
  const [goal, setGoal] = useState<GoalId>("plan-b");

  const selected = records.find((record) => record.code === passportCode) ?? records[0];
  const recommendation = useMemo(() => recommendationFor(goal, selected), [goal, selected]);
  const targetRecords = useMemo(() => records.filter((record) => record.score > selected.score).slice(0, 3), [records, selected]);

  return (
    <PassportIndexShell
      active="my-passport"
      eyebrow="My passport"
      title="Start from the client profile, not from a generic ranking."
      description="Choose the current passport and primary goal. The page gives a concise direction and the next XIPHIAS action."
    >
      <section className="mx-auto grid max-w-screen-2xl gap-5 px-4 py-10 md:px-6 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black text-[#071a3a] dark:text-white">Build a quick profile</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            This is intentionally light. It helps a visitor reach the right section before staff review.
          </p>

          <label htmlFor="planner-passport" className="mt-5 block">
            <span className="text-sm font-black text-[#071a3a] dark:text-white">Current passport</span>
            <select
              id="planner-passport"
              value={passportCode}
              onChange={(event) => setPassportCode(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-950 outline-none ring-[#1c57b4] focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {records.map((record) => (
                <option key={record.code} value={record.code}>
                  {record.country} - {record.score}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5">
            <p className="text-sm font-black text-[#071a3a] dark:text-white">Primary goal</p>
            <div className="mt-3 grid gap-2">
              {goals.map((item) => {
                const Icon = item.icon;
                const active = goal === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id)}
                    className={[
                      "flex items-start gap-3 rounded-md border p-3 text-left transition",
                      active
                        ? "border-[#1c57b4] bg-blue-50 text-[#071a3a] dark:bg-slate-800 dark:text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#1c57b4] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
                    ].join(" ")}
                  >
                    <Icon className="mt-0.5 size-5 shrink-0 text-[#1c57b4]" />
                    <span>
                      <span className="block font-black">{item.label}</span>
                      <span className="mt-1 block text-sm leading-5 text-slate-600 dark:text-slate-300">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="grid gap-5">
          <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Direction</p>
              <h2 className="mt-2 text-3xl font-black text-[#071a3a] dark:text-white">{recommendation.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{recommendation.body}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Passport</p>
                  <p className="mt-1 text-xl font-black text-[#071a3a] dark:text-white">{selected.country}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Score</p>
                  <p className="mt-1 text-xl font-black text-[#1c57b4]">{selected.score}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Band</p>
                  <p className="mt-1 text-xl font-black text-[#071a3a] dark:text-white">{selected.band}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={recommendation.href}
                  className="inline-flex items-center gap-2 rounded-md bg-[#1c57b4] px-4 py-3 text-sm font-black text-white transition hover:bg-[#15458f]"
                >
                  {recommendation.cta} <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="group">
              <PassportBookVisual featured={selected} />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Possible upgrades</p>
              <h2 className="mt-2 text-2xl font-black text-[#071a3a] dark:text-white">Passports with higher access in this snapshot</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {targetRecords.map((record) => (
                <PassportMiniCard key={record.code} record={record} stats={stats} />
              ))}
            </div>
          </section>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
