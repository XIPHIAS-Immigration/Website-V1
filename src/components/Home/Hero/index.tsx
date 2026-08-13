"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  FileSearch,
  FileText,
  Globe2,
  GraduationCap,
  Landmark,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

type GoalId = "career" | "investment" | "citizenship" | "business" | "unsure";
type DestinationId = "canada" | "usa" | "australia" | "uk" | "europe" | "uae" | "open";
type ProfileId = "professional" | "investor" | "entrepreneur" | "family" | "researcher" | "student";

type Choice<T extends string> = {
  id: T;
  label: string;
  copy: string;
  icon: typeof Route;
};

const GOALS: Choice<GoalId>[] = [
  { id: "career", label: "Work or settle abroad", copy: "Skilled visas, work routes and permanent residence", icon: GraduationCap },
  { id: "investment", label: "Invest for residency", copy: "Golden Visa and residency by investment routes", icon: Landmark },
  { id: "citizenship", label: "Explore citizenship", copy: "Citizenship pathways for you and your family", icon: Globe2 },
  { id: "business", label: "Start or expand a business", copy: "Founder, entrepreneur and corporate mobility routes", icon: BriefcaseBusiness },
  { id: "unsure", label: "I am not sure yet", copy: "Let XIA compare the available directions", icon: CircleHelp },
];

const DESTINATIONS: Choice<DestinationId>[] = [
  { id: "canada", label: "Canada", copy: "PR, skilled and business routes", icon: Globe2 },
  { id: "usa", label: "United States", copy: "Talent, investor and work routes", icon: Globe2 },
  { id: "australia", label: "Australia", copy: "Skilled and permanent pathways", icon: Globe2 },
  { id: "uk", label: "United Kingdom", copy: "Talent, work and business routes", icon: Globe2 },
  { id: "europe", label: "Europe", copy: "Residency and investment programmes", icon: Globe2 },
  { id: "uae", label: "UAE", copy: "Residency, founders and mobility", icon: Globe2 },
  { id: "open", label: "Open to suggestions", copy: "Compare destinations by overall fit", icon: Route },
];

const PROFILES: Choice<ProfileId>[] = [
  { id: "professional", label: "Skilled professional", copy: "Employment, experience and qualifications", icon: GraduationCap },
  { id: "researcher", label: "Researcher or specialist", copy: "Research, awards, leadership or exceptional ability", icon: BadgeCheck },
  { id: "investor", label: "Investor", copy: "Capital-led residency and citizenship options", icon: Landmark },
  { id: "entrepreneur", label: "Founder or business owner", copy: "Startup, company and expansion pathways", icon: BriefcaseBusiness },
  { id: "family", label: "Family relocation", copy: "A route that works for the whole family", icon: UsersRound },
  { id: "student", label: "Student or graduate", copy: "Study-to-work and graduate pathways", icon: FileSearch },
];

const DESTINATION_LABELS: Record<DestinationId, string> = {
  canada: "Canada",
  usa: "United States",
  australia: "Australia",
  uk: "United Kingdom",
  europe: "Europe",
  uae: "UAE",
  open: "",
};

const ROUTE_GOALS: Record<GoalId, string> = {
  career: "pr",
  investment: "investment",
  citizenship: "citizenship",
  business: "business-setup",
  unsure: "not-sure",
};

function resultHref(goal: GoalId, destination: DestinationId, profile: ProfileId) {
  const useDeepAnalysis =
    goal === "career" && ["professional", "researcher", "student"].includes(profile);
  const query = new URLSearchParams({
    source: "homepage-concierge",
    profile,
  });

  const destinationLabel = DESTINATION_LABELS[destination];
  if (destinationLabel) query.set("destination", destinationLabel);

  if (useDeepAnalysis) {
    query.set("goal", goal === "career" ? "not-sure" : goal);
    return `/deep-analysis?${query.toString()}`;
  }

  query.set("goal", ROUTE_GOALS[goal]);
  return `/route-intelligence?${query.toString()}`;
}

function recommendedLabel(goal: GoalId, profile: ProfileId) {
  if (goal === "career" && ["professional", "researcher", "student"].includes(profile)) {
    return "Deep Analysis";
  }
  return "Route Intelligence";
}

export default function Hero() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [destination, setDestination] = useState<DestinationId | null>(null);
  const [profile, setProfile] = useState<ProfileId | null>(null);

  const recommendation = useMemo(() => {
    if (!goal || !destination || !profile) return null;
    return {
      href: resultHref(goal, destination, profile),
      label: recommendedLabel(goal, profile),
    };
  }, [destination, goal, profile]);

  const reset = () => {
    setGoal(null);
    setDestination(null);
    setProfile(null);
    setStep(0);
  };

  const heading = step === 0 ? "What would you like to achieve?" : step === 1 ? "Where would you like to go?" : "Which profile describes you best?";
  const choices = step === 0 ? GOALS : step === 1 ? DESTINATIONS : PROFILES;

  return (
    <section id="main-banner" aria-labelledby="home-hero-title" className="relative isolate overflow-hidden bg-primary pt-28 text-white sm:pt-32">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-primary/75" />

      <div className="mx-auto max-w-screen-2xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#f0c83f]">
            <Sparkles className="size-4" aria-hidden="true" />
            XIA Immigration Intelligence
          </p>
          <h1 id="home-hero-title" className="type-page-title mt-4">
            Best Immigration Consultant in India
          </h1>
          <p className="type-body mx-auto mt-4 max-w-2xl text-white/75">
            Explore Canada PR, US EB-5, skilled migration, residency and citizenship by investment, plus corporate mobility across 50+ countries.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-stretch">
          <div className="overflow-hidden rounded-lg border border-white/40 bg-white/[0.82] text-slate-950 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                {step > 0 && step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-primary hover:text-primary"
                    aria-label="Previous question"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                ) : (
                  <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Route className="size-4" />
                  </span>
                )}
                <div>
                  <p className="text-xs font-bold uppercase text-primary">Guided route finder</p>
                  <p className="text-sm font-semibold text-slate-700">{step < 3 ? `Question ${step + 1} of 3` : "Your starting point"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5" aria-label={`Step ${Math.min(step + 1, 3)} of 3`}>
                {[0, 1, 2].map((item) => (
                  <span key={item} className={`h-1.5 w-7 rounded-full ${item <= step ? "bg-[#d8ad1f]" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {step < 3 ? (
                <>
                  <h2 className="type-card-title">{heading}</h2>
                  <p className="type-small mt-1 text-slate-500">Choose the closest answer. You can change the details inside the assessment.</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {choices.map((choice) => {
                      const Icon = choice.icon;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            if (step === 0) setGoal(choice.id as GoalId);
                            if (step === 1) setDestination(choice.id as DestinationId);
                            if (step === 2) setProfile(choice.id as ProfileId);
                            setStep((current) => current + 1);
                          }}
                          className="group flex min-h-20 items-center gap-3 rounded-md border border-slate-200 px-3 py-3 text-left transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-primary group-hover:bg-white">
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-950">{choice.label}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-slate-500">{choice.copy}</span>
                          </span>
                          <ChevronRight className="ml-auto size-4 shrink-0 text-slate-300 group-hover:text-primary" aria-hidden="true" />
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : recommendation ? (
                <div className="flex min-h-[280px] flex-col justify-center">
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-xs font-bold uppercase text-primary">Recommended starting point</p>
                  <h2 className="type-card-title mt-2">{recommendation.label}</h2>
                  <p className="type-small mt-3 max-w-xl text-slate-600">
                    Your answers will be carried into the assessment. Review your preliminary matches first; contact details are requested only when you save or unlock the report.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={recommendation.href}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#d8ad1f] px-5 text-sm font-bold text-primary transition hover:bg-[#efc939]"
                    >
                      Start {recommendation.label}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex h-12 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary"
                    >
                      Change answers
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 bg-white/55 px-4 py-3 text-xs text-slate-600 sm:px-6">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /> No contact details required to begin</span>
              <span>Indicative guidance. Advisor verification required.</span>
            </div>
          </div>

          <aside className="flex flex-col overflow-hidden rounded-lg border border-white/30 bg-primary/90 shadow-xl shadow-black/10 backdrop-blur-md" aria-label="Premium report preview">
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <p className="text-xs font-bold uppercase text-[#f0c83f]">Your analysis can become</p>
              <h2 className="type-card-title mt-1">A personalised decision report</h2>
            </div>
            <div className="grid flex-1 gap-4 p-5 sm:p-6">
              <div className="rounded-md bg-white/90 p-5 text-slate-950 shadow-lg">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="type-caption uppercase text-primary">XIPHIAS Intelligence Report</p>
                    <p className="mt-1 text-lg font-bold">Your recommended pathway</p>
                  </div>
                  <FileText className="size-7 text-[#d8ad1f]" aria-hidden="true" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["Route fit", "Risk review", "Next actions"].map((label, index) => (
                    <div key={label} className="border-l-2 border-[#d8ad1f] pl-2">
                      <p className="type-caption font-normal text-slate-500">0{index + 1}</p>
                      <p className="mt-1 text-xs font-bold">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  <div className="h-2 w-full rounded-full bg-slate-100" />
                  <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                  <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                </div>
              </div>

              <ul className="grid gap-2 text-sm text-white/80 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {["Matched immigration routes", "Evidence and document gaps", "Indicative cost and timeline", "Advisor-ready next actions"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-[#f0c83f]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 px-5 py-4 text-sm font-semibold sm:px-6">
              <a href="/samples/xiphias-premium-report-sample.pdf" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#f0c83f] hover:text-white">
                View sample PDF <ArrowRight className="size-4" />
              </a>
              <Link href="/xia-intelligence" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                Explore all XIA tools <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>

        <nav aria-label="XIA shortcuts" className="mt-5 grid divide-y divide-white/10 border-y border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["Deep Analysis", "Skills, experience and evidence review", "/deep-analysis"],
            ["Programme Explorer", "Compare immigration programmes", "/programme-explorer"],
            ["XIA Intelligence Suite", "Open every assessment tool", "/xia-intelligence"],
          ].map(([label, copy, href]) => (
            <Link key={href} href={href} className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-white/5 sm:px-5">
              <span>
                <span className="block text-sm font-bold">{label}</span>
                <span className="mt-1 block text-xs text-white/55">{copy}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-[#f0c83f] transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
