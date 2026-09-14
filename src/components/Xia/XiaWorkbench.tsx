"use client";

// src/components/Xia/XiaWorkbench.tsx
// -----------------------------------------------------------------------------
// XIA Route Intelligence.
//
// The previous version was a form on the left and a list on the right, on white,
// and it read as an admin screen. Nobody feels anything about an admin screen,
// and this is the page where somebody is deciding whether to move their family
// to another country.
//
// So it is staged as a journey instead, in the brand navy, with four steps that
// light up as they are completed:
//
//   Tell XIA about you  →  Routes checked  →  Your shortlist  →  Report or advisor
//
// The rail is not decoration. It answers "how much of this is left", which is the
// question an unstyled form never answers and the reason people abandon them.
//
// The engine underneath is unchanged: every card is the rules engine, server
// side, in one GET. Nothing here is a model's opinion.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight, CalendarCheck, CheckCircle2, FileText, Loader2,
  Lock, Sparkles, TriangleAlert,
} from "lucide-react";

import ConciergeOrb from "./ConciergeOrb";
import { useXiaCase } from "./useXiaCase";
import { openXiaChat } from "./xia-chat";
import type { CaseMatch, XiaCase } from "@/lib/xia/case";
import { reportForMatch, REPORT_LABEL } from "@/lib/xia/report-for";

/* -------------------------------------------------------------------------- */
/*  Field vocabulary — the closed set the engine understands                    */
/* -------------------------------------------------------------------------- */

const DESTINATIONS = [
  { value: "", label: "Anywhere — show me the best fit" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "united kingdom", label: "United Kingdom" },
  { value: "united states", label: "United States" },
  { value: "portugal", label: "Portugal" },
  { value: "greece", label: "Greece" },
  { value: "uae", label: "United Arab Emirates" },
  { value: "caribbean", label: "Caribbean" },
];

const GOALS = [
  { value: "", label: "Not sure yet" },
  { value: "pr", label: "Permanent residence" },
  { value: "work-visa", label: "Work abroad" },
  { value: "citizenship", label: "A second passport" },
  { value: "investment", label: "Invest for residency" },
  { value: "business-setup", label: "Start or move a business" },
  { value: "study", label: "Study, then stay" },
];

const EDUCATION = [
  { value: "", label: "Select" },
  { value: "secondary", label: "Secondary school" },
  { value: "diploma", label: "Diploma / certificate" },
  { value: "bachelor", label: "Bachelor's degree" },
  { value: "masters", label: "Master's degree" },
  { value: "doctorate", label: "Doctorate" },
];

const FAMILY = [
  { value: "", label: "Select" },
  { value: "alone", label: "Just me" },
  { value: "partner", label: "With my partner" },
  { value: "children", label: "With children" },
  { value: "parents", label: "With parents" },
];

const LANGUAGE_BANDS = [
  { value: 0, label: "Not taken yet" },
  { value: 5, label: "IELTS 5" },
  { value: 6, label: "IELTS 6" },
  { value: 6.5, label: "IELTS 6.5" },
  { value: 7, label: "IELTS 7" },
  { value: 7.5, label: "IELTS 7.5" },
  { value: 8, label: "IELTS 8" },
  { value: 9, label: "IELTS 9" },
];

const BUDGETS = [
  { value: 0, label: "Select" },
  { value: 15_000, label: "Under $25,000" },
  { value: 60_000, label: "$25,000 – $100,000" },
  { value: 150_000, label: "$100,000 – $250,000" },
  { value: 400_000, label: "$250,000 – $500,000" },
  { value: 900_000, label: "$500,000+" },
];

/** The words the model uses when it means "nothing", which must never reach an input. */
const JUNK = new Set(["null", "undefined", "none", "n/a", "na", "unknown", "any", "-"]);
function clean(value: string | undefined) {
  if (!value) return "";
  return JUNK.has(value.trim().toLowerCase()) ? "" : value;
}

/* -------------------------------------------------------------------------- */
/*  Primitives                                                                  */
/* -------------------------------------------------------------------------- */

const FIELD =
  "mt-1.5 w-full rounded-xl border border-white/25 bg-[#0b306e]/70 px-3.5 py-3 text-[14.5px] font-semibold text-white outline-none transition focus:border-[#e1b923]/70 focus:bg-[#0b306e] focus:shadow-[0_0_0_4px_rgba(225,185,35,0.12)] [&>option]:bg-[#0b2a5c] [&>option]:text-white";

function Row({ label, hint, className, children }: {
  label: string; hint?: string; className?: string; children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="type-caption block font-bold uppercase tracking-[0.12em] text-white/50">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-white/40">{hint}</span> : null}
    </label>
  );
}

/** Counts up rather than snapping. A number that moves gets read. */
function Tally({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (from === value || typeof window === "undefined") return setShown(value);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(value);

    const started = performance.now();
    const span = 520;
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / span);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{shown}</span>;
}

/* -------------------------------------------------------------------------- */

export type WorkbenchFocus = "all" | "skilled" | "high-skill" | "united states";

const FOCUS_COPY: Record<WorkbenchFocus, { eyebrow: string; title: string; intro: string }> = {
  all: {
    eyebrow: "Rules engine · not keyword matching",
    title: "XIA Route Intelligence",
    intro:
      "Every programme XIPHIAS works on, checked against the destination government's own published criteria. Answer what you know — the shortlist re-ranks as you go, and every card says plainly whether you clear the rule, what is missing, or why the door is shut.",
  },
  skilled: {
    eyebrow: "Points-based routes · scored",
    title: "XIA Route Intelligence",
    intro:
      "Skilled migration scored against the published criteria. Your Express Entry CRS and Australian points totals update as you answer, and every gap is named rather than hinted at.",
  },
  "high-skill": {
    eyebrow: "Evidence-led routes",
    title: "XIA Deep Analysis",
    intro:
      "For researchers, founders and senior specialists. Extraordinary-ability and national-interest routes are judged on evidence rather than points — this tells you which evidence you already hold and which you still need.",
  },
  "united states": {
    eyebrow: "United States",
    title: "XIA US Visa Intelligence",
    intro:
      "EB-1A, EB-2 NIW and EB-5 against the published standards, with the evidence each category actually requires and nothing glossed over.",
  },
};

const JOURNEY = [
  { key: "profile", label: "About you", detail: "What XIA needs to check the rules" },
  { key: "checked", label: "Routes checked", detail: "Against published criteria" },
  { key: "shortlist", label: "Your shortlist", detail: "Open, close, or shut — with reasons" },
  { key: "next", label: "Report or advisor", detail: "The step that actually moves it" },
];

export default function XiaWorkbench({
  focus = "all",
  preset,
}: {
  focus?: WorkbenchFocus;
  /** What the page itself already knows — the US page means the US. Applied once. */
  preset?: { destination?: string; goal?: string };
}) {
  const { case: item, patch, patchNow } = useXiaCase("tool");
  const [matches, setMatches] = useState<CaseMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [showClosed, setShowClosed] = useState(true);
  const debounce = useRef<number | null>(null);
  const railRef = useRef<HTMLOListElement | null>(null);

  const copy = FOCUS_COPY[focus];

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/xia/match?limit=12&closed=${showClosed ? 1 : 0}`, {
        credentials: "same-origin",
      });
      const data = await response.json();
      if (data?.ok) setMatches(data.matches ?? []);
    } catch {
      /* the engine is local; a blip here is not a dead end */
    } finally {
      setBusy(false);
    }
  }, [showClosed]);

  const presetApplied = useRef(false);
  useEffect(() => {
    if (preset && !presetApplied.current && (preset.destination || preset.goal)) {
      presetApplied.current = true;
      void patchNow({
        ...(preset.destination ? { destination: preset.destination } : {}),
        ...(preset.goal ? { goal: preset.goal } : {}),
      }).then(refresh);
      return;
    }
    void refresh();
  }, [refresh, preset, patchNow]);

  const set = useCallback(
    (fields: Partial<XiaCase>, immediate = false) => {
      if (immediate) {
        void patchNow(fields).then(refresh);
        return;
      }
      patch(fields);
      if (debounce.current) window.clearTimeout(debounce.current);
      debounce.current = window.setTimeout(() => void refresh(), 900);
    },
    [patch, patchNow, refresh],
  );

  const isCanada = item.destination === "canada";
  const isUs = item.destination === "united states" || focus === "united states";
  const wantsEvidence = isUs || focus === "high-skill";
  const band = item.languageScores?.speaking ?? (item.languageTest === "not-taken" ? 0 : undefined);

  const answered = useMemo(
    () =>
      [
        item.destination, item.goal, clean(item.nationality), item.age, item.education,
        item.yearsExperience, item.languageScores || item.languageTest, item.budgetUsd,
      ].filter((value) => value !== undefined && value !== "" && value !== null).length,
    [item],
  );

  const open = matches.filter((match) => match.state === "open");
  const gaps = matches.filter((match) => match.state === "gaps");
  const closed = matches.filter((match) => match.state === "closed");

  /** How far along the journey we are. Drives the rail. */
  const stage = matches.length ? (open.length || gaps.length ? 2 : 1) : answered > 0 ? 1 : 0;

  // The rail fills on a stagger as stages complete.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    (async () => {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled || !railRef.current) return;
        animate(railRef.current.querySelectorAll("[data-rail-node]"), {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 520,
          delay: stagger(90),
          ease: "out(3)",
        });
      } catch {
        /* the rail is visible by default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------- the panel ------------------------------- */

  const panel = (
    <div className="rounded-2xl border border-white/25 bg-[#0f3d85]/70 p-5 backdrop-blur-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-caption font-black uppercase tracking-[0.16em] text-[#f0cb3b]">Your profile</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-white/55">
            <Tally value={answered} /> of 8 answered. Everything saves — you will not be asked again
            at checkout.
          </p>
        </div>
        <ConciergeOrb state={busy ? "thinking" : answered > 3 ? "resolved" : "listening"} size={52} />
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e1b923] to-[#f5d260] transition-all duration-700 ease-out"
          style={{ width: `${Math.round((answered / 8) * 100)}%` }}
        />
      </div>

      <div className="mt-5 space-y-4">
        <Row label="Destination">
          <select className={FIELD} value={item.destination ?? ""}
            onChange={(event) => set({ destination: event.target.value || undefined }, true)}>
            {DESTINATIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        <Row label="What you want out of it">
          <select className={FIELD} value={item.goal ?? ""}
            onChange={(event) => set({ goal: event.target.value || undefined }, true)}>
            {GOALS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        <Row label="Your nationality" hint="Some routes exclude their own citizens or specific nationalities.">
          <input className={FIELD} value={clean(item.nationality)} placeholder="India"
            onChange={(event) => set({ nationality: event.target.value || undefined })} />
        </Row>

        <div className="grid grid-cols-2 gap-3">
          <Row label="Age">
            <input type="number" min={16} max={99} inputMode="numeric" className={FIELD}
              value={item.age ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                set({ age: Number.isFinite(value) && value >= 16 && value <= 99 ? value : undefined });
              }} />
          </Row>
          <Row label="Years of work">
            <input type="number" min={0} max={60} inputMode="numeric" className={FIELD}
              value={item.yearsExperience ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                set({ yearsExperience: Number.isFinite(value) && value >= 0 ? value : undefined });
              }} />
          </Row>
        </div>

        <Row label="Highest qualification">
          <select className={FIELD} value={item.education ?? ""}
            onChange={(event) => set({ education: event.target.value || undefined }, true)}>
            {EDUCATION.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        <Row label="English test" hint="Lowest band you scored, or expect to score.">
          <select className={FIELD} value={band ?? ""}
            onChange={(event) => {
              const value = Number(event.target.value);
              set(value === 0
                ? { languageTest: "not-taken" }
                : { languageTest: "ielts", languageScores: { speaking: value, listening: value, reading: value, writing: value } },
                true);
            }}>
            <option value="">Select</option>
            {LANGUAGE_BANDS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        {isCanada ? (
          <Row label="Years worked in Canada" hint="Counts heavily towards CRS. Leave blank if none.">
            <input type="number" min={0} max={20} inputMode="numeric" className={FIELD}
              value={item.canadianWorkYears ?? ""}
              onChange={(event) => {
                const value = Number(event.target.value);
                set({ canadianWorkYears: Number.isFinite(value) && value >= 0 ? value : undefined });
              }} />
          </Row>
        ) : null}

        <Row label="Occupation">
          <input className={FIELD} value={clean(item.occupation)} placeholder="Software engineer"
            onChange={(event) => set({ occupation: event.target.value || undefined })} />
        </Row>

        <Row label="Funds available to invest or show">
          <select className={FIELD} value={item.budgetUsd ?? ""}
            onChange={(event) => set({ budgetUsd: Number(event.target.value) || undefined }, true)}>
            {BUDGETS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        <Row label="Who is moving">
          <select className={FIELD} value={item.family ?? ""}
            onChange={(event) => set({ family: event.target.value || undefined }, true)}>
            {FAMILY.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </Row>

        {wantsEvidence ? (
          <div className="grid grid-cols-3 gap-2">
            <Row label="Papers">
              <input type="number" min={0} inputMode="numeric" className={`${FIELD} px-2.5`}
                value={item.publicationCount ?? ""}
                onChange={(event) => set({ publicationCount: Number(event.target.value) || undefined })} />
            </Row>
            <Row label="Citations">
              <input type="number" min={0} inputMode="numeric" className={`${FIELD} px-2.5`}
                value={item.citationCount ?? ""}
                onChange={(event) => set({ citationCount: Number(event.target.value) || undefined })} />
            </Row>
            <Row label="Patents">
              <input type="number" min={0} inputMode="numeric" className={`${FIELD} px-2.5`}
                value={item.patentCount ?? ""}
                onChange={(event) => set({ patentCount: Number(event.target.value) || undefined })} />
            </Row>
          </div>
        ) : null}

        <div className="space-y-2.5 border-t border-white/10 pt-4">
          <label className="flex items-start gap-2.5 text-[13.5px] font-semibold text-white/75">
            <input type="checkbox" className="mt-0.5 size-4 rounded border-white/30 bg-white/10 text-[#e1b923] focus:ring-[#e1b923]"
              checked={Boolean(item.previousRefusal)}
              onChange={(event) => set({ previousRefusal: event.target.checked }, true)} />
            I have had a visa refused before
          </label>
          <label className="flex items-start gap-2.5 text-[13.5px] font-semibold text-white/75">
            <input type="checkbox" className="mt-0.5 size-4 rounded border-white/30 bg-white/10 text-[#e1b923] focus:ring-[#e1b923]"
              checked={Boolean(item.criminalRecord)}
              onChange={(event) => set({ criminalRecord: event.target.checked }, true)} />
            I have a criminal record
          </label>
        </div>

        <button
          type="button"
          onClick={() => openXiaChat()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e1b923]/40 px-4 py-3 text-[13.5px] font-bold text-[#f0cb3b] transition hover:border-[#e1b923] hover:bg-[#e1b923]/10"
        >
          <Sparkles className="size-4" aria-hidden="true" /> Rather just talk to XIA?
        </button>
      </div>
    </div>
  );

  /* -------------------------------- render -------------------------------- */

  return (
    <div className="xia-rt relative min-h-screen overflow-hidden bg-primary text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="xia-rt-aurora xia-rt-aurora--gold" />
        <span className="xia-rt-aurora xia-rt-aurora--sky" />
        <span className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <header className="max-w-3xl">
          <p className="type-caption font-black uppercase tracking-[0.2em] text-[#f0cb3b]">{copy.eyebrow}</p>
          <h1 className="xia-rt-title mt-3 text-[clamp(2.25rem,calc(1.8rem+2vw),3.75rem)] font-black leading-[1.08] tracking-tight">
            {copy.title}
          </h1>
          <p className="type-body mt-5 text-white/70">{copy.intro}</p>
        </header>

        {/* The journey, so nobody wonders how much of this is left. */}
        <ol ref={railRef} className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((step, index) => {
            const done = index < stage;
            const current = index === stage;
            return (
              <li
                key={step.key}
                data-rail-node
                className={`relative rounded-2xl border p-4 transition-all duration-500 ${
                  done
                    ? "border-[#e1b923]/50 bg-[#e1b923]/[0.10]"
                    : current
                      ? "border-white/45 bg-[#0f3d85]/80 shadow-[0_0_0_4px_rgba(225,185,35,0.08)]"
                      : "border-white/15 bg-[#0f3d85]/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-black transition-colors duration-500 ${
                    done ? "bg-[#e1b923] text-[#071a3a]" : current ? "bg-white/20 text-white" : "bg-white/[0.07] text-white/35"
                  }`}>
                    {done ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
                  </span>
                  <p className={`text-[14px] font-black ${done || current ? "text-white" : "text-white/40"}`}>
                    {step.label}
                  </p>
                </div>
                <p className={`mt-1.5 pl-[38px] text-[12.5px] leading-snug ${done || current ? "text-white/55" : "text-white/25"}`}>
                  {step.detail}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">{panel}</div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/12 pb-4">
              <p className="flex items-center gap-2.5 text-[15px] font-black">
                {busy ? (
                  <><Loader2 className="size-4 animate-spin text-[#f0cb3b]" aria-hidden="true" /> Re-checking the rules…</>
                ) : (
                  <>
                    <span className="grid size-8 place-items-center rounded-lg bg-[#e1b923]/15 text-[#f0cb3b]">
                      <Sparkles className="size-4" aria-hidden="true" />
                    </span>
                    <Tally value={matches.length} />{" "}
                    {matches.length === 1 ? "programme checked" : "programmes checked"}
                  </>
                )}
              </p>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-white/60">
                <input type="checkbox" className="size-4 rounded border-white/30 bg-white/10 text-[#e1b923] focus:ring-[#e1b923]"
                  checked={showClosed} onChange={(event) => setShowClosed(event.target.checked)} />
                Show routes that are closed to me
              </label>
            </div>

            {!matches.length && !busy ? (
              <div className="mt-10 rounded-2xl border border-dashed border-white/20 p-10 text-center">
                <ConciergeOrb state="listening" size={110} />
                <p className="mt-4 text-[17px] font-black text-white">Start anywhere on the left</p>
                <p className="type-small mx-auto mt-2 max-w-md text-white/55">
                  A destination or a goal is enough for the first shortlist. You do not have to finish
                  the form before anything happens.
                </p>
              </div>
            ) : null}

            <Group title="You meet the published rules" tone="open"
              note="Everything testable from your answers checks out. The report sets out the filing order, timing and cost."
              items={open} />
            <Group title="Close — these gaps are named" tone="gaps"
              note="Each line is a specific, fixable thing, not a vague warning."
              items={gaps} />
            <Group title="Closed for now" tone="closed"
              note="Shown rather than hidden, because the reason usually tells you what to change."
              items={closed} />

            {matches.length ? <NextStep /> : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .xia-rt-aurora { position: absolute; border-radius: 9999px; filter: blur(140px); will-change: transform; }
        .xia-rt-aurora--gold {
          width: 42vw; height: 42vw; top: -14vw; right: -8vw;
          background: rgba(225, 185, 35, 0.16);
          animation: xiaRtDriftA 26s ease-in-out infinite;
        }
        .xia-rt-aurora--sky {
          width: 50vw; height: 50vw; bottom: -22vw; left: -12vw;
          background: rgba(80, 145, 245, 0.24);
          animation: xiaRtDriftB 31s ease-in-out infinite;
        }
        @keyframes xiaRtDriftA {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-5vw, 4vw, 0) scale(1.12); }
        }
        @keyframes xiaRtDriftB {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(6vw, -4vw, 0) scale(1.08); }
        }
        .xia-rt-title {
          background: linear-gradient(100deg, #fff 0%, #fff 40%, #f5d260 52%, #fff 64%, #fff 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text; background-clip: text;
          color: transparent; -webkit-text-fill-color: transparent;
          animation: xiaRtSheen 8s ease-in-out infinite;
        }
        @keyframes xiaRtSheen {
          0%, 100% { background-position: 130% 0; }
          50% { background-position: -30% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .xia-rt-aurora, .xia-rt-title { animation: none; }
          .xia-rt-title { color: #fff; -webkit-text-fill-color: #fff; }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Group({ title, note, items, tone }: {
  title: string; note: string; items: CaseMatch[]; tone: "open" | "gaps" | "closed";
}) {
  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (!items.length || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    (async () => {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled || !ref.current) return;
        animate(ref.current.querySelectorAll("li"), {
          opacity: [0, 1], translateY: [22, 0], duration: 520,
          delay: stagger(80), ease: "out(3)",
        });
      } catch {
        /* cards are visible by default */
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  if (!items.length) return null;

  const accent =
    tone === "open" ? "text-[#7ce8a8]" : tone === "gaps" ? "text-[#f0cb3b]" : "text-white/45";

  return (
    <section className="mt-9 !bg-transparent first:mt-8">
      <h2 className={`flex items-center gap-2 text-[15px] font-black uppercase tracking-[0.1em] ${accent}`}>
        {tone === "open" ? <CheckCircle2 className="size-4" aria-hidden="true" />
          : tone === "gaps" ? <TriangleAlert className="size-4" aria-hidden="true" />
          : <Lock className="size-4" aria-hidden="true" />}
        {title}
      </h2>
      <p className="type-small mt-1.5 text-white/50">{note}</p>
      <ul ref={ref} className="mt-4 grid gap-3.5">
        {items.map((match) => <MatchCard key={match.programmeId} match={match} />)}
      </ul>
    </section>
  );
}

function MatchCard({ match }: { match: CaseMatch }) {
  const product = reportForMatch(match);
  const open = match.state === "open";
  const shut = match.state === "closed";
  const gaps = match.gaps.filter((gap) => gap !== match.reason).slice(0, 3);

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(3,16,40,0.55)] sm:p-6 ${
        open ? "border-[#3cd278]/45 bg-[#3cd278]/[0.09] hover:border-[#3cd278]/75"
          : shut ? "border-white/20 bg-[#0f3d85]/55 hover:border-white/40"
          : "border-[#e1b923]/40 bg-[#e1b923]/[0.07] hover:border-[#e1b923]/75"
      }`}
    >
      <span aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-all duration-700 group-hover:left-full" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-caption uppercase tracking-[0.14em] text-white/45">
            {match.country} · {match.track}
          </p>
          <h3 className="mt-1 text-[19px] font-black leading-snug text-white sm:text-[21px]">{match.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-3 py-1.5 text-[11.5px] font-black uppercase tracking-[0.08em] ${
            open ? "bg-[#3cd278]/20 text-[#7ce8a8]"
              : shut ? "bg-white/10 text-white/45"
              : "bg-[#e1b923]/20 text-[#f0cb3b]"
          }`}>
            {open ? "You clear it" : shut ? "Shut" : "Nearly there"}
          </span>
          {match.score !== null ? (
            <span className="rounded-xl bg-white/10 px-3.5 py-2 text-center">
              <span className="block text-lg font-black tabular-nums text-white">{match.score}</span>
              <span className="type-caption text-white/50">points</span>
            </span>
          ) : null}
        </div>
      </div>

      <p className="type-small relative mt-2.5 text-white/75">{match.reason}</p>

      {gaps.length ? (
        <ul className="relative mt-3 space-y-1.5">
          {gaps.map((gap) => (
            <li key={gap} className="flex items-start gap-2 text-[13px] text-white/55">
              <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#e1b923]" aria-hidden="true" />
              {gap}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="relative mt-5 grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        {!shut ? (
          <Link href={`/get-report/${product}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[13.5px] font-black text-[#071a3a] shadow-[0_10px_26px_rgba(225,185,35,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]">
            <FileText className="size-4" aria-hidden="true" /> {REPORT_LABEL[product]}
          </Link>
        ) : null}
        <Link href={match.href}
          className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/[0.06] px-4 text-[13.5px] font-bold text-white transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.14]">
          See the programme
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true" />
        </Link>
        <Link href="/personal-booking#schedule"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e1b923]/40 px-4 text-[13.5px] font-bold text-[#f0cb3b] transition hover:-translate-y-0.5 hover:border-[#e1b923] hover:bg-[#e1b923]/10">
          <CalendarCheck className="size-4" aria-hidden="true" /> Ask an advisor
        </Link>
      </div>
    </li>
  );
}

/** Closes the journey the same way the chat does: report, or a person. */
function NextStep() {
  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-[#e1b923]/50 !bg-[#0f3d85] p-6 sm:p-8">
      <p className="type-caption font-black uppercase tracking-[0.2em] text-[#f0cb3b]">The next step</p>
      <h2 className="mt-2 text-[24px] font-black leading-tight sm:text-[28px]">
        A shortlist is not a plan
      </h2>
      <p className="type-body mt-3 max-w-2xl text-white/75">
        The report turns the cards above into a filing order, a timeline and a real cost, and lands in
        your inbox as a PDF. Or sit down with Varun Singh — seventeen years, thirty-nine awards — and
        have him read the case the way a visa officer will.
      </p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Link href="/reports"
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-6 text-[15px] font-black text-[#071a3a] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b]">
          <FileText className="size-4" aria-hidden="true" /> See the reports
        </Link>
        <Link href="/personal-booking#schedule"
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-[14.5px] font-bold text-white transition hover:border-white/60 hover:bg-white/10">
          <CalendarCheck className="size-4" aria-hidden="true" /> Book with Varun
        </Link>
      </div>
    </section>
  );
}
