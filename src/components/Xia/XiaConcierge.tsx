"use client";

// src/components/Xia/XiaConcierge.tsx
// -----------------------------------------------------------------------------
// Card-first. This component's job is to get somebody to a real programme in as
// few actions as possible — not to hold a conversation.
//
// The earlier version asked a question, waited, asked another, and eventually
// routed. That was the wrong shape: four minutes of chat to land on a page the
// visitor could have reached from a card in ten seconds.
//
// Now: one sentence in, programme cards out. Questions only ever appear ALONGSIDE
// cards, to sharpen a result that is already on screen.
//
//   variant="band"  the section under the hero
//   variant="dock"  the floating assistant
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Compass, CornerDownLeft, FileText, RotateCcw,
  TriangleAlert, CalendarCheck, X,
} from "lucide-react";

import ConciergeOrb, { type OrbState } from "./ConciergeOrb";
import { LANGUAGES, STRINGS, type Lang } from "./concierge-i18n";
import { useXiaCase } from "./useXiaCase";
import type { CaseMatch, XiaCase } from "@/lib/xia/case";
import { XIA_UNLOCK_EVENT, type XiaUnlockDetail } from "@/lib/xia/events";
import { reportForMatch } from "@/lib/xia/report-for";

type Sharpen = { field: string; question: string } | null;

/** Each patch is a partial case, so the fields stay typed rather than stringly. */
const QUICK_STARTS: Array<{ label: string; patch: Partial<XiaCase> }> = [
  { label: "Canada PR", patch: { destination: "canada", goal: "pr" } },
  { label: "A second passport", patch: { goal: "citizenship" } },
  { label: "Move my business", patch: { goal: "business-setup", profile: "entrepreneur" } },
  { label: "Australia PR", patch: { destination: "australia", goal: "pr" } },
];

/** Chips for whichever single question would sharpen the cards most. */
const SHARPEN_OPTIONS: Record<string, Array<{ label: string; value: string | number }>> = {
  destination: [
    { label: "Canada", value: "canada" }, { label: "Australia", value: "australia" },
    { label: "UK", value: "united kingdom" }, { label: "USA", value: "united states" },
    { label: "Portugal", value: "portugal" }, { label: "UAE", value: "uae" },
  ],
  goal: [
    { label: "Permanent residence", value: "pr" }, { label: "Work abroad", value: "work-visa" },
    { label: "Second passport", value: "citizenship" }, { label: "Invest", value: "investment" },
    { label: "Start a business", value: "business-setup" },
  ],
  age: [
    { label: "Under 30", value: 27 }, { label: "30–34", value: 32 },
    { label: "35–39", value: 37 }, { label: "40–44", value: 42 }, { label: "45+", value: 46 },
  ],
  education: [
    { label: "Bachelor's", value: "bachelor" }, { label: "Master's", value: "masters" },
    { label: "Doctorate", value: "doctorate" }, { label: "Diploma", value: "diploma" },
  ],
  language: [
    { label: "IELTS 8+", value: 8 }, { label: "IELTS 7", value: 7 },
    { label: "IELTS 6", value: 6 }, { label: "Not yet", value: 0 },
  ],
};

export default function XiaConcierge({
  variant = "band",
  onClose,
}: {
  variant?: "band" | "dock";
  onClose?: () => void;
}) {
  const [lang, setLang] = useState<Lang>("en");
  const { case: item, patch, patchNow } = useXiaCase(variant === "dock" ? "dock" : "hero");
  const [matches, setMatches] = useState<CaseMatch[]>([]);
  const [sharpen, setSharpen] = useState<Sharpen>(null);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  // The hero gate hands over here. Until it does, the band sits quiet so the
  // visitor is never answering two things at once.
  const [awake, setAwake] = useState(variant === "dock");
  const [greetName, setGreetName] = useState<string | null>(null);

  const t = STRINGS[lang];
  const orbState: OrbState =
    busy ? "thinking" : matches.length ? "resolved" : started || awake ? "listening" : "idle";

  /** Cards come from the rules engine. No model in this path. */
  const refreshMatches = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/xia/match?limit=3", { credentials: "same-origin" });
      const data = await response.json();
      if (data?.ok) {
        setMatches(data.matches ?? []);
        setSharpen(data.question ?? null);
      }
    } catch {
      /* the engine is local; a failure here is a network blip, not a dead end */
    } finally {
      setBusy(false);
    }
  }, []);

  // Someone returning mid-journey should see their shortlist, not a blank box.
  useEffect(() => {
    if (item.matches?.length) {
      setMatches(item.matches.slice(0, 3));
      setStarted(true);
    }
  }, [item.matches]);

  // "Then the AI comes." The gate closing is the cue; the name, when we have
  // one, is used once and never repeated back at every turn.
  useEffect(() => {
    if (variant === "dock") return;
    const onUnlock = (event: Event) => {
      const detail = (event as CustomEvent<XiaUnlockDetail>).detail;
      setAwake(true);
      const first = detail?.name?.trim().split(/\s+/)[0];
      if (first) setGreetName(first);
    };
    window.addEventListener(XIA_UNLOCK_EVENT, onUnlock as EventListener);
    // A visitor who lands with no gate (returning, or JS raced us) still gets a
    // live band rather than a dormant one.
    const fallback = window.setTimeout(() => setAwake(true), 4_000);
    return () => {
      window.removeEventListener(XIA_UNLOCK_EVENT, onUnlock as EventListener);
      window.clearTimeout(fallback);
    };
  }, [variant]);

  async function submitSentence(event: React.FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    setInput("");
    setStarted(true);
    setBusy(true);

    // The model's only job here is reading the sentence into fields. If it is
    // slow or off, the free text still lands on the case and the engine works
    // from whatever else we know.
    try {
      const response = await fetch("/api/xia/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: {}, message: value, language: lang, step: 0, isOpening: true }),
      });
      const data = await response.json();
      const extracted = (data?.state ?? {}) as Record<string, string>;
      await patchNow({
        ...(extracted.destination ? { destination: extracted.destination } : {}),
        ...(extracted.goal ? { goal: extracted.goal } : {}),
        ...(extracted.profile ? { profile: extracted.profile } : {}),
        ...(extracted.nationality ? { nationality: extracted.nationality } : {}),
        notes: value,
      });
    } catch {
      await patchNow({ notes: value });
    }
    await refreshMatches();
  }

  async function quickStart(patchFields: Partial<XiaCase>) {
    setStarted(true);
    await patchNow(patchFields);
    await refreshMatches();
  }

  async function answerSharpen(field: string, value: string | number) {
    const fields: Record<string, unknown> =
      field === "language"
        ? value === 0
          ? { languageTest: "not-taken" }
          : { languageScores: { speaking: value, listening: value, reading: value, writing: value } }
        : { [field]: value };
    await patchNow(fields as never);
    await refreshMatches();
  }

  function restart() {
    setMatches([]);
    setSharpen(null);
    setStarted(false);
    setInput("");
  }

  /* --------------------------------- cards -------------------------------- */

  const cards = matches.length ? (
    <ul className="mt-6 grid gap-3">
      {matches.map((match) => {
        const product = reportForMatch(match);
        const tone =
          match.state === "open"
            ? "border-[#3cd278]/45 bg-[#3cd278]/[0.08]"
            : match.state === "gaps"
              ? "border-[#e1b923]/45 bg-[#e1b923]/[0.07]"
              : "border-white/15 bg-white/[0.04]";
        return (
          <li key={match.programmeId} className={`rounded-xl border p-4 sm:p-5 ${tone}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="type-caption uppercase tracking-[0.14em] text-white/50">{match.country}</p>
                <h3 className="mt-1 text-[17px] font-black leading-snug text-white">{match.title}</h3>
              </div>
              {match.score !== null ? (
                <span className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-center">
                  <span className="block text-lg font-black tabular-nums text-white">{match.score}</span>
                  <span className="type-caption text-white/50">score</span>
                </span>
              ) : null}
            </div>

            <p className="type-small mt-2 text-white/75">{match.reason}</p>

            {match.gaps.length > 1 ? (
              <ul className="mt-3 space-y-1.5">
                {match.gaps.slice(1, 3).map((gap) => (
                  <li key={gap} className="flex items-start gap-2 text-[12.5px] text-white/55">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[#e1b923]" aria-hidden="true" />
                    {gap}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/get-report/${product}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#e1b923] px-4 text-[13px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
              >
                <FileText className="size-3.5" aria-hidden="true" /> Get the report
              </Link>
              <Link
                href={match.href}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/25 px-4 text-[13px] font-bold text-white transition hover:bg-white/10"
              >
                See the programme <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/personal-booking#schedule"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[13px] font-bold text-white/60 transition hover:text-white"
              >
                <CalendarCheck className="size-3.5" aria-hidden="true" /> Talk to Varun
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  ) : null;

  /* ------------------------------ conversation ---------------------------- */

  const body = (
    <div className="min-w-0 flex-1">
      {!started ? (
        <>
          <p className="type-caption uppercase tracking-[0.18em] text-[#e1b923]">{t.eyebrow}</p>
          <h2 className={variant === "band" ? "type-section-title mt-3 text-white" : "mt-2 text-xl font-black text-white"}>
            {t.heading}
          </h2>
          <p className="type-small mt-3 max-w-xl text-white/65">
            {greetName
              ? `${greetName}, tell me where you want to go — I will shortlist only the programmes you actually qualify for.`
              : t.subheading}
          </p>
        </>
      ) : (
        <>
          <p className="type-caption uppercase tracking-[0.18em] text-[#e1b923]">
            {busy ? t.thinking : matches.length ? `${matches.length} routes worth your time` : t.eyebrow}
          </p>
          {!busy && !matches.length ? (
            <p className="type-small mt-3 text-white/70">
              Nothing matched that yet — tell me the country or what you want out of the move and I&apos;ll try again.
            </p>
          ) : null}
        </>
      )}

      {cards}

      {/* One sharpening question, asked beside the cards, never instead of them */}
      {sharpen && SHARPEN_OPTIONS[sharpen.field] ? (
        <div className="mt-5">
          <p className="type-small font-bold text-white/80">{sharpen.question}</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {SHARPEN_OPTIONS[sharpen.field].map((option) => (
              <li key={String(option.value)}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void answerSharpen(sharpen.field, option.value)}
                  className="rounded-lg border border-white/20 bg-white/[0.06] px-3.5 py-2 text-[13px] font-bold text-white transition hover:border-[#e1b923]/70 hover:bg-white/[0.12] disabled:opacity-50"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Quick starts, only before anything has been said */}
      {!started ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {QUICK_STARTS.map((quick) => (
            <li key={quick.label}>
              <button
                type="button"
                onClick={() => void quickStart(quick.patch)}
                className="rounded-lg border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:border-[#e1b923]/70 hover:bg-white/[0.12]"
              >
                {quick.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={submitSentence} className="mt-5">
        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 focus-within:border-[#e1b923]/70">
          <input
            id="xia-concierge-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder-white/35 outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#e1b923] px-4 text-[13px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b] disabled:opacity-60"
          >
            {started ? "Update" : t.start} <CornerDownLeft className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href="/programme-explorer?source=xia"
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/55 underline-offset-4 hover:text-white hover:underline"
        >
          <Compass className="size-3.5" aria-hidden="true" /> {t.skip}
        </Link>
        {started ? (
          <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/45 hover:text-white">
            <RotateCcw className="size-3.5" aria-hidden="true" /> {t.restart}
          </button>
        ) : null}
      </div>
    </div>
  );

  const languageSwitch = (
    <div className="flex items-center gap-1" role="group" aria-label={t.languageLabel}>
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          className={`rounded-md px-2.5 py-1 text-[12px] font-bold transition ${
            lang === option.code ? "bg-[#e1b923] text-[#071a3a]" : "text-white/50 hover:text-white"
          }`}
        >
          {option.short}
        </button>
      ))}
    </div>
  );

  if (variant === "dock") {
    return (
      <div className="flex max-h-[min(80vh,700px)] w-[min(94vw,440px)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0f438f] shadow-[0_28px_80px_rgba(3,16,40,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ConciergeOrb state={orbState} size={34} />
            <span className="text-sm font-black text-white">XIA</span>
          </div>
          <div className="flex items-center gap-2">
            {languageSwitch}
            <button type="button" onClick={onClose} aria-label={t.closeDock}
              className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-4 py-5">{body}</div>
      </div>
    );
  }

  return (
    <section id="xia-concierge" aria-label="XIA guided assistant" className="relative overflow-hidden bg-primary text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_72%_at_12%_18%,rgba(7,26,58,0.42),transparent_72%)]" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      </div>

      <div
        className={`relative mx-auto flex max-w-screen-2xl flex-col gap-8 px-5 py-14 transition-all duration-700 ease-out motion-reduce:transition-none sm:px-8 lg:flex-row lg:items-start lg:gap-14 lg:px-12 lg:py-16 ${
          awake ? "translate-y-0 opacity-100" : "translate-y-3 opacity-70"
        }`}
      >
        <div className="flex items-center justify-between gap-4 lg:block">
          <ConciergeOrb state={orbState} size={120} />
          <div className="lg:mt-6">{languageSwitch}</div>
        </div>
        {body}
      </div>
    </section>
  );
}
