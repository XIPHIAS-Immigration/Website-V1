"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  Route as RouteIcon,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import type { Vertical } from "@/lib/content/types";
import type { XiaIntelligenceData } from "@/lib/xia-intelligence";
import {
  evidenceLabels,
  highSkillCompletion,
  scoreHighSkillRoutes,
  scoreProgrammeRoutes,
  type HighSkillEvidenceKey,
  type HighSkillInput,
  type RouteIntelligenceInput,
} from "@/lib/xia-intelligence-model";
import { BOOKING_ROUTE } from "@/lib/topmate";

type Engine = "route" | "high-skill" | "investment" | "documents" | "workflow";
type ProgrammeMatch = ReturnType<typeof scoreProgrammeRoutes>[number];
type HighSkillMatch = ReturnType<typeof scoreHighSkillRoutes>[number];

type XiaIntelligenceClientProps = {
  data: XiaIntelligenceData;
  initialEngine?: Engine;
  lockedEngine?: boolean;
  targetCountryLocked?: HighSkillInput["targetCountry"];
  title?: string;
  subtitle?: string;
};

type ContactInput = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};

const evidenceKeys = Object.keys(evidenceLabels) as HighSkillEvidenceKey[];

const emptyEvidence = evidenceKeys.reduce(
  (acc, key) => ({ ...acc, [key]: false }),
  {} as Record<HighSkillEvidenceKey, boolean>,
);

const defaultRouteInput: RouteIntelligenceInput = {
  goal: "not-sure",
  track: "all",
  destination: "",
  profile: "investor",
  budget: 250000,
  timeline: 12,
  family: true,
  presence: "any",
  priority: "stability",
  notes: "",
};

const defaultHighSkillInput: HighSkillInput = {
  targetCountry: "usa",
  goal: "not-sure",
  field: "technology",
  role: "",
  age: 30,
  education: "unknown",
  yearsExperience: 5,
  languageScore: 0,
  evidence: emptyEvidence,
  citationCount: 0,
  publicationCount: 0,
  patentCount: 0,
  resumeFileName: "",
  profileSummary: "",
};

const routeGoalOptions: Array<{ value: RouteIntelligenceInput["goal"]; label: string }> = [
  { value: "not-sure", label: "Not sure" },
  { value: "pr", label: "Permanent residency" },
  { value: "work-visa", label: "Work visa" },
  { value: "citizenship", label: "Citizenship" },
  { value: "investment", label: "Investment route" },
  { value: "business-setup", label: "Business setup" },
  { value: "family-migration", label: "Family migration" },
];

const routeTracks: Array<{ value: RouteIntelligenceInput["track"]; label: string }> = [
  { value: "all", label: "All pathways" },
  { value: "residency", label: "Residency" },
  { value: "citizenship", label: "Citizenship" },
  { value: "corporate", label: "Corporate" },
  { value: "skilled", label: "Skilled" },
];

const suiteTabs: Array<{ key: Engine; label: string; icon: ComponentType<{ className?: string }>; copy: string }> = [
  {
    key: "route",
    label: "Best Visa / Route",
    icon: RouteIcon,
    copy: "Find the best immigration pathway.",
  },
  {
    key: "high-skill",
    label: "High-Skill Visa",
    icon: GraduationCap,
    copy: "EB1A, NIW, O1A, H-1B, L1 and talent routes.",
  },
  {
    key: "investment",
    label: "Investment & Residency",
    icon: Landmark,
    copy: "Golden visa, CBI, RBI and investor routes.",
  },
  {
    key: "documents",
    label: "Document Readiness",
    icon: ClipboardCheck,
    copy: "CV, funds, awards and family proof readiness.",
  },
  {
    key: "workflow",
    label: "Report + Advisor",
    icon: FileText,
    copy: "Preview report, detailed report and X-Hub tracking.",
  },
];

function numberInput(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBrowserIds() {
  if (typeof window === "undefined") return { visitorId: "", sessionId: "" };

  try {
    const visitorKey = "xiphias_visitor_id";
    const sessionKey = "xiphias_session_id";
    const visitorId =
      window.localStorage.getItem(visitorKey) ||
      `visitor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const sessionId =
      window.sessionStorage.getItem(sessionKey) ||
      `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    window.localStorage.setItem(visitorKey, visitorId);
    window.sessionStorage.setItem(sessionKey, sessionId);
    return { visitorId, sessionId };
  } catch {
    return { visitorId: "", sessionId: "" };
  }
}

function readinessScore(routeInput: RouteIntelligenceInput, highSkillInput: HighSkillInput) {
  const evidenceCount = Object.values(highSkillInput.evidence).filter(Boolean).length;
  const checks = [
    Boolean(routeInput.destination || highSkillInput.targetCountry !== "global"),
    routeInput.goal !== "not-sure" || highSkillInput.goal !== "not-sure",
    routeInput.budget > 0,
    Boolean(highSkillInput.role.trim()),
    highSkillInput.education !== "unknown",
    highSkillInput.yearsExperience > 0,
    highSkillInput.profileSummary.trim().length > 30,
    Boolean(highSkillInput.resumeFileName),
    evidenceCount >= 2,
  ];
  return { percent: Math.round((checks.filter(Boolean).length / checks.length) * 100), evidenceCount };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-white/35 dark:focus:ring-blue-950 ${props.className || ""}`}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950 ${props.className || ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-white/35 dark:focus:ring-blue-950 ${props.className || ""}`}
    />
  );
}

function XiaHelpPanel() {
  const items = [
    ["Route Intelligence", "Use this when you know the goal, budget, timeline, or preferred destination.", "/route-intelligence"],
    ["Deep Analysis", "Use this for profile, skills, evidence, CV notes, and route review.", "/deep-analysis"],
    ["US Visa Intelligence", "Use this for EB1A, EB2 NIW, O1A, H-1B, L1, and US evidence guidance.", "/us-visa-intelligence"],
    ["Advisor Review", "Use this when you want XIPHIAS to verify the route.", BOOKING_ROUTE],
  ] as const;

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-primary dark:bg-white/10 dark:text-blue-200">
          <BrainCircuit className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-midnight_text dark:text-white">XIA help</h2>
          <p className="text-sm text-slate-500 dark:text-white/70">Choose where you want to go. These links are live.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map(([label, copy, href]) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-semibold text-midnight_text dark:text-white">{label}</span>
              <ArrowRight className="size-4 text-primary transition group-hover:translate-x-1 dark:text-blue-200" />
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-600 dark:text-white/70">{copy}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function XiaIntelligenceClient({
  data,
  initialEngine = "route",
  lockedEngine = false,
  targetCountryLocked,
  title,
  subtitle,
}: XiaIntelligenceClientProps) {
  const [engine, setEngine] = useState<Engine>(initialEngine);
  const [routeInput, setRouteInput] = useState<RouteIntelligenceInput>(defaultRouteInput);
  const [highSkillInput, setHighSkillInput] = useState<HighSkillInput>(() => ({
    ...defaultHighSkillInput,
    targetCountry: targetCountryLocked || defaultHighSkillInput.targetCountry,
  }));
  const [contact, setContact] = useState<ContactInput>({ name: "", email: "", phone: "", consent: true });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const routeMatches = useMemo(
    () => scoreProgrammeRoutes(data.programme.items, routeInput).slice(0, 6),
    [data.programme.items, routeInput],
  );
  const investmentMatches = useMemo(() => {
    const investmentInput: RouteIntelligenceInput = {
      ...routeInput,
      goal: "investment",
      track: routeInput.track === "skilled" ? "all" : routeInput.track,
      profile: routeInput.profile === "professional" ? "investor" : routeInput.profile,
      priority: routeInput.priority === "speed" ? "business" : routeInput.priority,
    };
    return scoreProgrammeRoutes(data.programme.items, investmentInput)
      .filter((match) => match.track !== "skilled")
      .slice(0, 6);
  }, [data.programme.items, routeInput]);
  const highSkillMatches = useMemo(() => scoreHighSkillRoutes(highSkillInput).slice(0, 6), [highSkillInput]);
  const highSkillPercent = highSkillCompletion(highSkillInput);
  const readiness = readinessScore(routeInput, highSkillInput);
  const activeRouteMatches = engine === "investment" ? investmentMatches : routeMatches;

  const currentTitle = title || "Start with your XIA inputs.";
  const currentSubtitle =
    subtitle ||
    "Choose the assessment type, add the important details, and XIPHIAS will prepare route-fit guidance for advisor review.";
  const compactSummary =
    engine === "high-skill"
      ? `${highSkillInput.role || "Profile"} - ${highSkillInput.targetCountry.toUpperCase()} - ${highSkillPercent}% depth`
      : `${routeInput.destination || "Any country"} - ${routeInput.goal.replace("-", " ")} - ${
          routeInput.budget ? `USD ${routeInput.budget.toLocaleString()}` : "budget open"
        }`;

  const selectEngine = (next: Engine) => {
    setEngine(next);
    setSubmitted(false);
    setSaveState("idle");
    if (next === "investment") {
      setRouteInput((current) => ({
        ...current,
        goal: "investment",
        track: current.track === "skilled" ? "all" : current.track,
        profile: current.profile === "professional" ? "investor" : current.profile,
      }));
    }
  };

  const saveAssessment = async () => {
    if (!contact.name.trim() && !contact.email.trim() && !contact.phone.trim()) {
      setSaveState("error");
      return;
    }

    setSaveState("saving");
    const { visitorId, sessionId } = getBrowserIds();
    const routePayload = activeRouteMatches.slice(0, 5).map((match) => ({
      title: match.title,
      country: match.country,
      track: match.track,
      href: match.href,
      score: match.fitScore,
      reasons: match.reasons,
      warnings: match.warnings,
    }));
    const highSkillPayload = highSkillMatches.slice(0, 5).map((match) => ({
      title: match.title,
      country: match.country,
      visaFamily: match.visaFamily,
      href: match.href,
      score: match.fitScore,
      tier: match.tier,
      reasons: match.reasons,
      gaps: match.gaps,
      nextEvidence: match.nextEvidence,
    }));

    try {
      const response = await fetch("/api/platform/xia-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead",
          engine,
          routeInput,
          highSkillInput,
          routeMatches: routePayload,
          highSkillMatches: highSkillPayload,
          completion: engine === "high-skill" ? highSkillPercent : readiness.percent,
          contact,
          visitorId,
          sessionId,
          path: "/xia-intelligence",
          referrer: document.referrer,
        }),
      });

      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-8 text-slate-950 transition-colors dark:bg-darkmode dark:text-white">
      <section className="container py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`group/input-panel mx-auto rounded-xl border border-slate-200 bg-white shadow-cause-shadow transition-all duration-500 dark:border-slate-800 dark:bg-darklight ${
            submitted ? "sticky top-20 z-30 max-w-screen-2xl p-4" : "max-w-screen-xl p-5 sm:p-7 lg:p-9"
          }`}
        >
          {submitted ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold text-primary dark:text-blue-200">
                  {currentTitle}
                </p>
                <h1 className="mt-1 text-xl font-semibold text-midnight_text dark:text-white">{compactSummary}</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelp((value) => !value)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-midnight_text transition hover:border-primary hover:bg-blue-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
                >
                  <BrainCircuit className="size-4 text-primary dark:text-blue-200" />
                  XIA help
                </button>
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-semibold text-midnight_text transition hover:bg-[#f0cb3b]"
                >
                  Refresh
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-primary dark:border-blue-900 dark:bg-white/5 dark:text-blue-200">
                <Sparkles className="size-4" />
                XIA assessment
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-midnight_text dark:text-white sm:text-4xl">
                {currentTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/85">{currentSubtitle}</p>
            </div>
            <div className="space-y-3 md:max-w-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                This assessment is a planning aid, not a final visa decision. Final strategy requires XIPHIAS advisor review.
              </div>
              <button
                type="button"
                onClick={() => setShowHelp((value) => !value)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-midnight_text transition hover:border-primary hover:bg-blue-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
              >
                <BrainCircuit className="size-4 text-primary dark:text-blue-200" />
                XIA help
              </button>
            </div>
          </div>
          )}

          {showHelp && <XiaHelpPanel />}

          <div
            className={
              submitted
                ? "mt-0 max-h-0 overflow-y-hidden opacity-0 transition-all duration-500 group-hover/input-panel:mt-3 group-hover/input-panel:max-h-[360px] group-hover/input-panel:overflow-y-auto group-hover/input-panel:opacity-100"
                : ""
            }
          >

          {!lockedEngine ? (
            <div className="mt-7 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5">
              {suiteTabs.map((tab) => {
                const Icon = tab.icon;
                const active = engine === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => selectEngine(tab.key)}
                    className={`flex items-start gap-4 rounded-lg p-4 text-left transition ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-blue-50 dark:bg-slate-950 dark:text-white/75 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-lg ${active ? "bg-white/10 text-white" : "bg-blue-50 text-primary dark:bg-white/10 dark:text-blue-200"}`}>
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-base font-semibold">{tab.label}</span>
                      <span className={`mt-1 block text-sm leading-5 ${active ? "text-white/85" : "text-slate-500 dark:text-white/82"}`}>
                        {tab.copy}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <Link
                href="/xia-intelligence"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-midnight_text transition hover:border-primary hover:bg-blue-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900"
              >
                Open full XIA suite
              </Link>
            </div>
          )}

          {(engine === "route" || engine === "investment") && (
            <RouteInputs engine={engine} input={routeInput} setInput={setRouteInput} />
          )}

          {engine === "high-skill" && (
            <HighSkillInputs
              input={highSkillInput}
              setInput={setHighSkillInput}
              completion={highSkillPercent}
              targetCountryLocked={targetCountryLocked}
            />
          )}

          {engine === "documents" && submitted && <DocumentReadiness readiness={readiness} />}

          {engine === "workflow" && submitted && <WorkflowPanel />}

          <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-white/70">
              Results and X-Hub save options appear after you generate this assessment.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-midnight_text shadow-sm transition hover:bg-[#f0cb3b]"
            >
              {submitted ? "Refresh assessment" : "Generate assessment"}
              <ArrowRight className="size-4" />
            </button>
          </div>
          </div>
        </motion.div>

        {submitted && (engine === "route" || engine === "investment") && <RouteShortlist matches={activeRouteMatches} />}
        {submitted && engine === "high-skill" && <HighSkillShortlist matches={highSkillMatches} completion={highSkillPercent} />}
        {submitted && (engine === "route" || engine === "investment" || engine === "high-skill") && (
          <PremiumReportPanel
            engine={engine}
            routeInput={routeInput}
            highSkillInput={highSkillInput}
            routeMatches={activeRouteMatches}
            highSkillMatches={highSkillMatches}
            readiness={readiness}
          />
        )}

        {submitted && (
        <section className="mx-auto mt-6 max-w-screen-xl rounded-xl border border-slate-200 bg-white p-5 shadow-cause-shadow dark:border-slate-800 dark:bg-darklight sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-primary dark:bg-white/10 dark:text-blue-200">
                <Send className="size-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-midnight_text dark:text-white">Save this assessment into X-Hub</h3>
                <p className="text-sm text-slate-500 dark:text-white/70">Creates a lead and stores the shortlist for admin follow-up.</p>
              </div>
            </div>
            <div className="grid flex-[2] gap-3 md:grid-cols-3">
              <TextInput value={contact.name} onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" />
              <TextInput value={contact.email} onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email" />
              <TextInput value={contact.phone} onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Phone / WhatsApp" />
            </div>
            <button
              type="button"
              onClick={saveAssessment}
              disabled={saveState === "saving"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-midnight_text shadow-sm transition hover:bg-[#f0cb3b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saveState === "saving" ? "Saving..." : "Save"}
              <ArrowRight className="size-4" />
            </button>
          </div>
          <label className="mt-3 flex items-start gap-2 text-xs font-semibold leading-5 text-slate-500 dark:text-white/65">
            <input
              type="checkbox"
              checked={contact.consent}
              onChange={(event) => setContact((prev) => ({ ...prev, consent: event.target.checked }))}
              className="mt-1 size-4 accent-[#d8ad1f]"
            />
            I agree that XIPHIAS may contact me about this assessment.
          </label>
          {saveState === "saved" && <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-300">Saved. This assessment is now available in X-Hub.</p>}
          {saveState === "error" && <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-200">Add at least one contact detail before saving.</p>}
        </section>
        )}
      </section>
    </div>
  );
}

function RouteInputs({
  engine,
  input,
  setInput,
}: {
  engine: Engine;
  input: RouteIntelligenceInput;
  setInput: React.Dispatch<React.SetStateAction<RouteIntelligenceInput>>;
}) {
  return (
    <>
      <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
        {engine === "investment" ? <Landmark className="size-5 text-[#d8ad1f]" /> : <RouteIcon className="size-5 text-[#d8ad1f]" />}
        <div>
          <h2 className="text-xl font-semibold text-midnight_text dark:text-white">
            {engine === "investment" ? "Investment & Residency Evaluator" : "Best Visa / Route Evaluator"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/70">
            {engine === "investment" ? "Investor, golden visa, CBI, RBI and business mobility routes." : "PR, work visa, citizenship, investment, business and family route matching."}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Field label="Goal">
          <SelectInput value={input.goal} onChange={(event) => setInput((prev) => ({ ...prev, goal: event.target.value as RouteIntelligenceInput["goal"] }))}>
            {routeGoalOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Country focus">
          <TextInput value={input.destination} onChange={(event) => setInput((prev) => ({ ...prev, destination: event.target.value }))} placeholder="Canada, Portugal, UAE..." />
        </Field>
        <Field label="Pathway">
          <SelectInput value={input.track} onChange={(event) => setInput((prev) => ({ ...prev, track: event.target.value as Vertical | "all" }))}>
            {routeTracks.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Profile">
          <SelectInput value={input.profile} onChange={(event) => setInput((prev) => ({ ...prev, profile: event.target.value as RouteIntelligenceInput["profile"] }))}>
            <option value="investor">Investor</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="professional">Skilled professional</option>
            <option value="family">Family relocation</option>
            <option value="company">Company mobility</option>
            <option value="remote">Remote worker</option>
            <option value="researcher">Researcher / talent</option>
            <option value="student">Student</option>
          </SelectInput>
        </Field>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <TextInput type="number" value={input.budget} onChange={(event) => setInput((prev) => ({ ...prev, budget: numberInput(event.target.value, 0) }))} placeholder="Capital USD" />
        <TextInput type="number" value={input.timeline} onChange={(event) => setInput((prev) => ({ ...prev, timeline: numberInput(event.target.value, 0) }))} placeholder="Timeline months" />
        <SelectInput value={input.presence} onChange={(event) => setInput((prev) => ({ ...prev, presence: event.target.value as RouteIntelligenceInput["presence"] }))}>
          <option value="any">Any presence</option>
          <option value="low">Low presence</option>
          <option value="moderate">Moderate presence</option>
          <option value="high">High presence</option>
        </SelectInput>
        <SelectInput value={input.priority} onChange={(event) => setInput((prev) => ({ ...prev, priority: event.target.value as RouteIntelligenceInput["priority"] }))}>
          <option value="stability">Stability</option>
          <option value="speed">Speed</option>
          <option value="cost">Cost control</option>
          <option value="mobility">Mobility</option>
          <option value="business">Business</option>
          <option value="tax">Tax planning</option>
        </SelectInput>
        <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-white/88">
          <input type="checkbox" checked={input.family} onChange={(event) => setInput((prev) => ({ ...prev, family: event.target.checked }))} className="size-4 accent-[#d8ad1f]" />
          Family
        </label>
      </div>
      <div className="mt-4">
        <Field label="Profile notes">
          <TextArea rows={3} value={input.notes} onChange={(event) => setInput((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Source of funds, company plan, family needs, urgency or risk notes..." />
        </Field>
      </div>
    </>
  );
}

function HighSkillInputs({
  input,
  setInput,
  completion,
  targetCountryLocked,
}: {
  input: HighSkillInput;
  setInput: React.Dispatch<React.SetStateAction<HighSkillInput>>;
  completion: number;
  targetCountryLocked?: HighSkillInput["targetCountry"];
}) {
  return (
    <>
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
        <div className="flex items-center gap-3">
          <GraduationCap className="size-5 text-[#d8ad1f]" />
          <div>
            <h2 className="text-xl font-semibold text-midnight_text dark:text-white">High-Skill Visa Evaluator</h2>
            <p className="text-sm text-slate-500 dark:text-white/70">Evidence-led review for EB1A, EB2 NIW, O1A, H-1B, L1, Global Talent and PR pathways.</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-white/70 sm:inline-flex">{completion}% profile depth</span>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Field label="Target">
          {targetCountryLocked ? (
            <TextInput value={targetCountryLocked === "usa" ? "United States" : targetCountryLocked} disabled />
          ) : (
            <SelectInput value={input.targetCountry} onChange={(event) => setInput((prev) => ({ ...prev, targetCountry: event.target.value as HighSkillInput["targetCountry"] }))}>
              <option value="usa">United States</option>
              <option value="canada">Canada</option>
              <option value="uk">United Kingdom</option>
              <option value="australia">Australia</option>
              <option value="global">Open globally</option>
            </SelectInput>
          )}
        </Field>
        <Field label="Goal">
          <SelectInput value={input.goal} onChange={(event) => setInput((prev) => ({ ...prev, goal: event.target.value as HighSkillInput["goal"] }))}>
            <option value="not-sure">Not sure</option>
            <option value="permanent-residency">Permanent residency</option>
            <option value="temporary-work">Temporary work</option>
            <option value="talent-visa">Talent visa</option>
            <option value="founder">Founder / business</option>
          </SelectInput>
        </Field>
        <Field label="Field">
          <SelectInput value={input.field} onChange={(event) => setInput((prev) => ({ ...prev, field: event.target.value as HighSkillInput["field"] }))}>
            <option value="technology">Technology</option>
            <option value="science">Science</option>
            <option value="business">Business</option>
            <option value="healthcare">Healthcare</option>
            <option value="academia">Academia</option>
            <option value="arts">Arts</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </SelectInput>
        </Field>
        <Field label="Role">
          <TextInput value={input.role} onChange={(event) => setInput((prev) => ({ ...prev, role: event.target.value }))} placeholder="Founder, engineer, researcher..." />
        </Field>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-7">
        <TextInput type="number" value={input.age} onChange={(event) => setInput((prev) => ({ ...prev, age: numberInput(event.target.value, 0) }))} placeholder="Age" />
        <SelectInput value={input.education} onChange={(event) => setInput((prev) => ({ ...prev, education: event.target.value as HighSkillInput["education"] }))} className="lg:col-span-2">
          <option value="unknown">Education</option>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
          <option value="phd">PhD</option>
        </SelectInput>
        <TextInput type="number" value={input.yearsExperience} onChange={(event) => setInput((prev) => ({ ...prev, yearsExperience: numberInput(event.target.value, 0) }))} placeholder="Years exp." />
        <TextInput type="number" value={input.languageScore} onChange={(event) => setInput((prev) => ({ ...prev, languageScore: numberInput(event.target.value, 0) }))} placeholder="IELTS/score" />
        <TextInput type="number" value={input.publicationCount} onChange={(event) => setInput((prev) => ({ ...prev, publicationCount: numberInput(event.target.value, 0) }))} placeholder="Papers" />
        <TextInput type="number" value={input.citationCount} onChange={(event) => setInput((prev) => ({ ...prev, citationCount: numberInput(event.target.value, 0) }))} placeholder="Citations" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <Field label="CV / evidence highlights">
          <TextArea rows={4} value={input.profileSummary} onChange={(event) => setInput((prev) => ({ ...prev, profileSummary: event.target.value }))} placeholder="Paste CV/evidence highlights. Text resumes are read locally; PDF/DOCX parsing will be added to the report workflow." />
        </Field>
        <label className="flex cursor-pointer flex-col justify-center gap-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
          <UploadCloud className="size-6" />
          <span>{input.resumeFileName || "Attach CV name for advisor review"}</span>
          <span className="text-xs font-semibold opacity-75">TXT/MD resumes are scanned locally.</span>
          <input
            type="file"
            className="hidden"
            accept=".txt,.md,.csv,.json,.pdf,.doc,.docx"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                setInput((prev) => ({ ...prev, resumeFileName: "" }));
                return;
              }

              const textResume =
                ["text/plain", "text/markdown", "text/csv", "application/json"].includes(file.type) ||
                /\.(txt|md|csv|json)$/i.test(file.name);

              if (!textResume) {
                setInput((prev) => ({ ...prev, resumeFileName: file.name }));
                return;
              }

              const resumeText = await file.text().catch(() => "");
              setInput((prev) => ({
                ...prev,
                resumeFileName: file.name,
                profileSummary: [prev.profileSummary.trim(), resumeText.slice(0, 4000).trim()].filter(Boolean).join("\n\n"),
              }));
            }}
          />
        </label>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {evidenceKeys.map((key) => (
          <label key={key} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-white/75">
            <input
              type="checkbox"
              checked={input.evidence[key]}
              onChange={(event) => setInput((prev) => ({ ...prev, evidence: { ...prev.evidence, [key]: event.target.checked } }))}
              className="mt-0.5 size-4 accent-[#d8ad1f]"
            />
            <span>{evidenceLabels[key]}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function DocumentReadiness({ readiness }: { readiness: { percent: number; evidenceCount: number } }) {
  return (
    <div className="mt-7 border-t border-slate-200 pt-6 dark:border-white/10">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="size-5 text-[#d8ad1f]" />
        <div>
          <h2 className="text-xl font-semibold text-midnight_text dark:text-white">Document & Evidence Readiness</h2>
          <p className="text-sm text-slate-500 dark:text-white/70">Preparation checklist before report or advisor review.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold text-primary dark:text-blue-200">Readiness</p>
          <div className="mt-3 text-4xl font-semibold text-midnight_text dark:text-white">{readiness.percent}%</div>
          <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#d8ad1f] to-[#2a63bd]" style={{ width: `${readiness.percent}%` }} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {["Identity and civil documents", "Proof/source of funds", "CV and employment proof", "Education and skills records", "Awards, publications, media", "Company and business documents"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-white/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkflowPanel() {
  return (
    <div className="mt-7 border-t border-slate-200 pt-6 dark:border-white/10">
      <div className="flex items-center gap-3">
        <FileText className="size-5 text-[#d8ad1f]" />
        <div>
          <h2 className="text-xl font-semibold text-midnight_text dark:text-white">Report + Advisor Workflow</h2>
          <p className="text-sm text-slate-500 dark:text-white/70">Preview report, detailed report unlock, advisor review and X-Hub tracking.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["1", "Preview report", "Concise route preview from submitted answers."],
          ["2", "Detailed report", "Paid report expands route comparison, risk and timeline."],
          ["3", "Advisor review", "XIPHIAS verifies documents, rules and strategy."],
          ["4", "X-Hub tracking", "Lead, case progress and next actions are tracked."],
        ].map(([step, heading, copy]) => (
          <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <span className="grid size-8 place-items-center rounded-full bg-secondary text-sm font-semibold text-midnight_text">{step}</span>
            <h3 className="mt-3 font-semibold text-midnight_text dark:text-white">{heading}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/70">{copy}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTargetCountry(country: HighSkillInput["targetCountry"]) {
  const labels: Record<HighSkillInput["targetCountry"], string> = {
    usa: "United States",
    canada: "Canada",
    uk: "United Kingdom",
    australia: "Australia",
    global: "Global route review",
  };

  return labels[country];
}

function extractHighSkillProfileSignals(input: HighSkillInput) {
  const text = `${input.role} ${input.field} ${input.resumeFileName} ${input.profileSummary}`.toLowerCase();
  const keywordGroups = [
    { label: "Software / technology", words: ["software", "engineer", "developer", "react", "node", "python", "cloud", "aws", "azure", "ai", "machine learning", "data"] },
    { label: "Research output", words: ["research", "publication", "citation", "journal", "conference", "thesis", "scientist"] },
    { label: "Founder / business impact", words: ["founder", "startup", "revenue", "growth", "fundraising", "product", "entrepreneur", "business"] },
    { label: "Leadership profile", words: ["lead", "manager", "director", "head", "principal", "architect", "team"] },
    { label: "Innovation evidence", words: ["patent", "ip", "invention", "platform", "award", "recognition"] },
    { label: "Healthcare / science", words: ["doctor", "clinical", "healthcare", "medical", "biotech", "laboratory"] },
  ];

  const skills = keywordGroups.filter((group) => group.words.some((word) => text.includes(word))).map((group) => group.label);
  const selectedEvidence = evidenceKeys.filter((key) => input.evidence[key]);
  const strengths: string[] = [];
  const gaps: string[] = [];
  const improvements: string[] = [];

  if (input.education === "master" || input.education === "phd") strengths.push("Advanced education can support NIW, PR, and high-skill routes.");
  if (input.yearsExperience >= 8) strengths.push("Senior experience supports leadership, critical-role, or specialist positioning.");
  if (input.publicationCount > 0) strengths.push(`${input.publicationCount} publication${input.publicationCount > 1 ? "s" : ""} can strengthen research and expert evidence.`);
  if (input.citationCount > 0) strengths.push(`${input.citationCount} citation${input.citationCount > 1 ? "s" : ""} adds measurable external recognition.`);
  if (input.patentCount > 0 || input.evidence.patents) strengths.push("Innovation evidence can support extraordinary ability or national-interest arguments.");
  if (selectedEvidence.length >= 4) strengths.push("Multiple evidence categories are already present for advisor packaging.");

  if (input.education === "unknown") gaps.push("Education credential details are missing.");
  if (!input.role.trim()) gaps.push("Current role and specialization need to be stated clearly.");
  if (!input.profileSummary.trim()) gaps.push("CV summary or achievement notes are needed for a meaningful evidence review.");
  if (input.targetCountry !== "usa" && input.languageScore < 7) gaps.push("Language score may need strengthening for points-based routes.");
  if (selectedEvidence.length < 3) gaps.push("Evidence base is thin; add awards, publications, media, judging, high salary, leadership, or recommendation material.");

  if (input.targetCountry === "usa") {
    improvements.push("Build a USCIS-style evidence map: awards, media, judging, original contribution, critical role, high salary, publications, and expert letters.");
    improvements.push("For EB2 NIW, connect the work to national importance and explain why the waiver benefits the United States.");
    improvements.push("For O1A or EB1A, show independent recognition outside the employer, not only job performance.");
  } else {
    improvements.push("Map education, language, experience, occupation, funds, and family factors against the target country route.");
    improvements.push("Prepare a document matrix before payment: identity, employment, education, funds, language, family, and police/medical readiness.");
  }

  if (input.yearsExperience < 5) improvements.push("Strengthen role depth with project ownership, quantified impact, team scope, or specialist achievements.");
  if (!input.evidence.recommendations) improvements.push("Collect expert recommendation letters that explain impact, credibility, and route relevance.");

  return {
    skills: skills.length ? skills.slice(0, 6) : ["Profile signals will improve after CV text is added"],
    strengths: strengths.length ? strengths.slice(0, 4) : ["Initial profile captured; advisor review can structure the case evidence."],
    gaps: gaps.length ? gaps.slice(0, 4) : ["No major missing signal from the information provided."],
    improvements: improvements.slice(0, 5),
    evidenceCount: selectedEvidence.length,
  };
}

function buildRouteReportPlan(engine: Engine, routeInput: RouteIntelligenceInput, topRoute?: ProgrammeMatch) {
  const destination = topRoute?.country || routeInput.destination || "Advisor-selected destination";
  const routeTitle = topRoute?.title || (engine === "investment" ? "Investment and residency route review" : "Best-fit immigration pathway");
  const pathway = topRoute?.track || routeInput.track;
  const capital = topRoute?.investmentLabel || (routeInput.budget > 0 ? `USD ${routeInput.budget.toLocaleString()} planning budget` : "Budget to be verified");
  const timeline = topRoute?.timelineLabel || `${routeInput.timeline} month planning window`;

  const nextActions = [
    `Validate the ${destination} route rules, fees, and latest availability before final recommendation.`,
    "Prepare document checklist for identity, funds, source of funds, employment/business, family, and admissibility.",
    routeInput.family ? "Add spouse/dependent eligibility and document requirements to the report." : "Confirm whether family inclusion should be added before filing.",
    "Advisor to flag tax, physical-presence, due-diligence, and timing risks before paid onboarding.",
  ];

  const riskNotes = [
    routeInput.presence === "low" ? "Low physical-presence preference must be checked against route conditions." : "Physical-presence requirements must be verified country by country.",
    topRoute?.risk === "enhanced" || topRoute?.risk === "high" ? "Enhanced due diligence is likely required for this route." : "Standard compliance and source-of-funds review still applies.",
    topRoute?.warnings[0] || "Final eligibility depends on verified documents and current government rules.",
  ];

  return { destination, routeTitle, pathway, capital, timeline, nextActions, riskNotes };
}

function PremiumReportPanel({
  engine,
  routeInput,
  highSkillInput,
  routeMatches,
  highSkillMatches,
  readiness,
}: {
  engine: Engine;
  routeInput: RouteIntelligenceInput;
  highSkillInput: HighSkillInput;
  routeMatches: ReturnType<typeof scoreProgrammeRoutes>;
  highSkillMatches: ReturnType<typeof scoreHighSkillRoutes>;
  readiness: { percent: number; evidenceCount: number };
}) {
  const highSkillMode = engine === "high-skill";
  const topHighSkill = highSkillMatches[0];
  const topRoute = routeMatches[0];
  const routePlan = buildRouteReportPlan(engine, routeInput, topRoute);
  const profileSignals = extractHighSkillProfileSignals(highSkillInput);
  const score = highSkillMode ? topHighSkill?.fitScore || readiness.percent : topRoute?.fitScore || readiness.percent;
  const reportTitle = highSkillMode ? "High-skill visa profile report" : engine === "investment" ? "Investment pathway report" : "Route intelligence report";
  const recommendedTitle = highSkillMode ? topHighSkill?.title || "Advisor-selected high-skill route" : routePlan.routeTitle;
  const recommendedCountry = highSkillMode ? topHighSkill?.country || formatTargetCountry(highSkillInput.targetCountry) : routePlan.destination;
  const timeline = highSkillMode ? topHighSkill?.timeline || "Case dependent" : routePlan.timeline;
  const category = highSkillMode ? topHighSkill?.visaFamily || "High-skill visa direction" : routePlan.pathway.toString();
  const planItems = highSkillMode ? profileSignals.improvements : routePlan.nextActions;
  const riskItems = highSkillMode ? profileSignals.gaps : routePlan.riskNotes;
  const included = highSkillMode
    ? ["Resume signal review", "Visa route comparison", "Evidence gap map", "Improvement plan", "Advisor notes"]
    : ["Route comparison", "Country fit", "Document checklist", "Risk review", "Advisor notes"];

  return (
    <section className="mx-auto mt-6 max-w-screen-xl overflow-hidden rounded-xl border border-[#d8ad1f]/55 bg-[#061936] text-white shadow-cause-shadow">
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d8ad1f]/10 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8ad1f]/45 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c94c]">
              <FileText className="size-4" />
              Personalised report
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/75">Coming soon</span>
          </div>
          <h3 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl">{reportTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/74">
            A professional XIPHIAS proposal built from the assessment answers, route scoring,
            verified programme content, and advisor review checkpoints.
          </p>

          <div className="mt-6 rounded-xl border border-[#d8ad1f]/35 bg-[#0b244d] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c94c]">Recommended pathway</p>
            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-full border border-[#d8ad1f]/60 bg-[#061936] text-[#f2c94c] shadow-[0_0_24px_rgba(216,173,31,0.22)]">
                  {highSkillMode ? <GraduationCap className="size-7" /> : <RouteIcon className="size-7" />}
                </span>
                <div className="min-w-0">
                  <h4 className="text-2xl font-semibold leading-tight text-white">{recommendedTitle}</h4>
                  <p className="mt-1 text-sm font-medium text-[#f2c94c]">{recommendedCountry}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm lg:w-[360px]">
                <ReportStat label="Fit score" value={`${score}/100`} />
                <ReportStat label="Timeline" value={timeline} />
                <ReportStat label="Category" value={category} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl border border-white/12 bg-white/7 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c94c]">Coming soon</p>
              <h4 className="mt-2 text-xl font-semibold text-white">Personalised PDF + advisor direction</h4>
            </div>
            <div className="rounded-xl bg-[#d8ad1f] px-4 py-3 text-center text-[#061936]">
              <p className="text-xs font-semibold uppercase">Secure</p>
              <p className="text-xl font-semibold">Gateway</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0b244d] p-3 text-sm font-semibold text-white/88">
                <CheckCircle2 className="size-4 shrink-0 text-[#f2c94c]" />
                {item}
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled
            aria-disabled="true"
            className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#d8ad1f] px-4 py-3 text-sm font-semibold text-[#061936] opacity-75"
          >
            Personalised report coming soon
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="mt-3 text-xs leading-5 text-white/58">
            Secure payment setup is in progress. XIPHIAS will enable the personalised report flow after the gateway is connected.
          </p>
        </div>
      </div>

      <div className="grid gap-px border-t border-white/10 bg-white/10 lg:grid-cols-5">
        {["Assessment", "Evidence", "Route plan", "Advisor review", "PDF delivery"].map((step, index) => (
          <div key={step} className="bg-[#061936] px-5 py-4">
            <span className="grid size-8 place-items-center rounded-full border border-[#d8ad1f]/60 text-sm font-semibold text-[#f2c94c]">{index + 1}</span>
            <p className="mt-3 text-sm font-semibold text-white">{step}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 border-t border-white/10 p-5 sm:p-7 lg:grid-cols-2">
        {highSkillMode && (
          <div className="rounded-xl border border-white/12 bg-white/7 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c94c]">Resume/profile signals</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profileSignals.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#0b244d] px-3 py-1 text-xs font-semibold text-white/82 ring-1 ring-white/10">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ReportStat label="Evidence categories" value={`${profileSignals.evidenceCount} selected`} />
              <ReportStat label="Profile depth" value={`${readiness.percent}%`} />
            </div>
          </div>
        )}

        {!highSkillMode && (
          <div className="rounded-xl border border-white/12 bg-white/7 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c94c]">Planning summary</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ReportStat label="Capital" value={routePlan.capital} />
              <ReportStat label="Family" value={routeInput.family ? "Included" : "Not selected"} />
              <ReportStat label="Presence" value={routeInput.presence} />
              <ReportStat label="Priority" value={routeInput.priority} />
            </div>
          </div>
        )}

        <ReportList
          title={highSkillMode ? "Improvement priorities" : "Detailed plan preview"}
          items={planItems}
          icon={Sparkles}
        />

        <ReportList
          title={highSkillMode ? "Profile gaps to resolve" : "Risk checks"}
          items={riskItems}
          icon={CircleAlert}
        />

        <ReportList
          title="Strengths to preserve"
          items={highSkillMode ? profileSignals.strengths : topRoute?.reasons.slice(0, 4) || ["Initial route shortlist is ready for advisor review."]}
          icon={ShieldCheck}
        />
      </div>
    </section>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/7 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  );
}

function ReportList({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/7 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-[#d8ad1f]/15 text-[#f2c94c]">
          <Icon className="size-4" />
        </span>
        <p className="font-semibold text-white">{title}</p>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/76">
            <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#f2c94c]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RouteShortlist({ matches }: { matches: ReturnType<typeof scoreProgrammeRoutes> }) {
  return (
    <section className="mx-auto mt-6 max-w-screen-2xl px-0">
      <div className="mb-4 px-1">
        <p className="text-xs font-semibold text-primary dark:text-blue-200">Matched routes</p>
        <h2 className="mt-1 text-2xl font-semibold text-midnight_text dark:text-white">Recommended route directions</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {matches.map((match) => (
          <motion.article
            key={match.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-cause-shadow transition hover:-translate-y-0.5 hover:border-primary dark:border-slate-800 dark:bg-darklight"
          >
            <ResultHeader title={match.title} country={match.country} label={match.track} score={match.fitScore} />
            <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600 dark:text-white/72">{match.summary}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={BadgeCheck} label="Capital" value={match.investmentLabel} />
              <Metric icon={BriefcaseBusiness} label="Timeline" value={match.timelineLabel} />
            </div>
            <ReasonList reasons={match.reasons} warnings={match.warnings} />
            <ResultActions href={match.href} />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function HighSkillShortlist({
  matches,
  completion,
}: {
  matches: ReturnType<typeof scoreHighSkillRoutes>;
  completion: number;
}) {
  return (
    <section className="mx-auto mt-6 max-w-screen-2xl px-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-xs font-semibold text-primary dark:text-blue-200">High-skill shortlist</p>
          <h2 className="mt-1 text-2xl font-semibold text-midnight_text dark:text-white">Recommended visa directions</h2>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-white/70">{completion}% profile depth</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {matches.map((match) => (
          <motion.article
            key={match.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-cause-shadow transition hover:-translate-y-0.5 hover:border-primary dark:border-slate-800 dark:bg-darklight"
          >
            <ResultHeader title={match.title} country={match.country} label={match.visaFamily} score={match.fitScore} />
            <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600 dark:text-white/72">{match.summary}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric icon={ShieldCheck} label="Difficulty" value={match.difficulty.replace("-", " ")} />
              <Metric icon={BriefcaseBusiness} label="Timeline" value={match.timeline} />
            </div>
            <ReasonList reasons={match.reasons} warnings={match.gaps} />
            <ResultActions href={match.href} />
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function ResultHeader({ title, country, label, score }: { title: string; country: string; label: string; score: number }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-primary dark:bg-white/10 dark:text-blue-200">
          {label}
        </span>
        <h3 className="mt-3 text-xl font-semibold leading-tight text-midnight_text dark:text-white">{title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-white/65">
          <MapPin className="size-4 text-[#1553af] dark:text-[#9fc3ff]" />
          {country}
        </div>
      </div>
      <div className="rounded-lg bg-secondary px-3 py-2 text-center text-xl font-semibold text-midnight_text">
        {score}
        <div className="text-[10px] uppercase tracking-wide">fit</div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.06]">
      <Icon className="mb-2 size-4 text-[#1553af] dark:text-[#d8ad1f]" />
      <div className="text-sm font-semibold text-midnight_text dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-white/55">{label}</div>
    </div>
  );
}

function ReasonList({ reasons, warnings }: { reasons: string[]; warnings: string[] }) {
  return (
    <div className="mt-4 grid gap-2 text-sm">
      {reasons.slice(0, 3).map((reason) => (
        <div key={reason} className="flex gap-2 text-slate-600 dark:text-white/75">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <span>{reason}</span>
        </div>
      ))}
      {warnings.slice(0, 2).map((warning) => (
        <div key={warning} className="flex gap-2 text-amber-700 dark:text-amber-100">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#d8ad1f]" />
          <span>{warning}</span>
        </div>
      ))}
    </div>
  );
}

function ResultActions({ href }: { href: string }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link href={href || "/contact"} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
        Open route <ArrowRight className="size-4" />
      </Link>
      <Link href={BOOKING_ROUTE} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-midnight_text transition hover:border-primary hover:bg-blue-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-900">
        Advisor review
      </Link>
    </div>
  );
}
