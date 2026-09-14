"use client";

// src/components/Xia/XiaChat.tsx
// -----------------------------------------------------------------------------
// XIA, full screen.
//
// Five questions, one at a time, each answerable by tapping a suggestion or by
// typing. Then the programmes, with every gap named. Then the report, and the
// advisor after it.
//
// Two things here are deliberate and were learned the hard way:
//
//   * The questions are asked in order, every time, tracked by an index — NOT by
//     looking at what the case already holds. Reading the case meant somebody who
//     had answered "Canada" on a previous visit picked a profession and was
//     dropped straight onto Canadian programmes, having been asked one question.
//     A stored answer may skip a question only when this message just supplied it.
//
//   * The whole thing is portalled to document.body. A `position: fixed` overlay
//     resolves against the nearest transformed ancestor, not the viewport, so
//     rendered in place it was clipped and the wheel scrolled the page behind it.
//
// The matching never touches a model — it is the rules engine, server side, in
// one GET. A card is never a guess.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ArrowRight, Calculator, CalendarCheck, CheckCircle2, CornerDownLeft,
  FileText, Globe, LayoutGrid, Scale, Sparkles, X,
} from "lucide-react";

import ConciergeOrb, { type OrbState } from "./ConciergeOrb";
import { useOverlayScroll } from "./use-overlay-scroll";
import { useXiaCase } from "./useXiaCase";
import type { CaseMatch, XiaCase } from "@/lib/xia/case";
import { reportForMatch } from "@/lib/xia/report-for";

/* -------------------------------------------------------------------------- */
/*  The script                                                                 */
/* -------------------------------------------------------------------------- */

type Chip = {
  label: string;
  value: string;
  emoji?: string;
  /** Refinement chips carry their own patch, so they never go via the model. */
  patch?: Partial<XiaCase>;
};

type Question = {
  key: string;
  /** Short label for the progress rail. */
  rail: string;
  ask: string;
  chips: Chip[];
  /** The case field a free-text answer to this question fills. */
  field: keyof XiaCase;
  /** Turn a chip value into the patch. Defaults to a plain string field. */
  toPatch?: (value: string) => Partial<XiaCase>;
};

/** A computed key widens to a string index, so the cast has to go via unknown. */
function setField(field: keyof XiaCase, value: string | number): Partial<XiaCase> {
  return { [field]: value } as unknown as Partial<XiaCase>;
}

const QUESTIONS: Question[] = [
  {
    key: "profile",
    rail: "You",
    ask: "First — what do you do for a living?",
    field: "profile",
    chips: [
      { label: "Salaried professional", value: "professional", emoji: "💼" },
      { label: "Founder / business owner", value: "entrepreneur", emoji: "🚀" },
      { label: "Investor", value: "investor", emoji: "📈" },
      { label: "Researcher or academic", value: "researcher", emoji: "🔬" },
      { label: "Doctor or nurse", value: "professional", emoji: "🩺" },
      { label: "Student or recent graduate", value: "student", emoji: "🎓" },
      { label: "Remote worker / freelancer", value: "remote", emoji: "🌐" },
    ],
  },
  {
    key: "destination",
    rail: "Where",
    ask: "Where are you hoping to go? Pick one, or tell me you're open and I'll choose from what fits you.",
    field: "destination",
    chips: [
      { label: "Canada", value: "canada", emoji: "🇨🇦" },
      { label: "Australia", value: "australia", emoji: "🇦🇺" },
      { label: "United Kingdom", value: "united kingdom", emoji: "🇬🇧" },
      { label: "United States", value: "united states", emoji: "🇺🇸" },
      { label: "Portugal", value: "portugal", emoji: "🇵🇹" },
      { label: "Greece", value: "greece", emoji: "🇬🇷" },
      { label: "UAE", value: "uae", emoji: "🇦🇪" },
      { label: "I'm open — you pick", value: "", emoji: "🌍" },
    ],
  },
  {
    key: "goal",
    rail: "Goal",
    ask: "And what do you want the move to actually achieve?",
    field: "goal",
    chips: [
      { label: "Permanent residence", value: "pr", emoji: "🏠" },
      { label: "Work abroad", value: "work-visa", emoji: "💼" },
      { label: "A second passport", value: "citizenship", emoji: "🛂" },
      { label: "Invest for residency", value: "investment", emoji: "💰" },
      { label: "Start or move a business", value: "business-setup", emoji: "🏢" },
      { label: "Study, then stay", value: "study", emoji: "📚" },
    ],
  },
  {
    key: "age",
    rail: "Age",
    ask: "How old are you? Age moves the score on most points systems more than anything else.",
    field: "age",
    toPatch: (value) => ({ age: Number(value) }),
    chips: [
      { label: "Under 30", value: "27" },
      { label: "30 – 34", value: "32" },
      { label: "35 – 39", value: "37" },
      { label: "40 – 44", value: "42" },
      { label: "45 or over", value: "46" },
    ],
  },
  {
    key: "english",
    rail: "English",
    ask: "Last one. Have you sat IELTS or PTE, and roughly what did you get in your weakest section?",
    field: "languageTest",
    toPatch: (value) =>
      value === "0"
        ? { languageTest: "not-taken" }
        : {
            languageTest: "ielts",
            languageScores: {
              speaking: Number(value),
              listening: Number(value),
              reading: Number(value),
              writing: Number(value),
            },
          },
    chips: [
      { label: "Band 8 or above", value: "8" },
      { label: "Band 7", value: "7" },
      { label: "Band 6.5", value: "6.5" },
      { label: "Band 6", value: "6" },
      { label: "Below 6", value: "5" },
      { label: "Not taken it yet", value: "0" },
    ],
  },
];

/**
 * Offered once the cards are up, to sharpen what is already on screen.
 *
 * These carry explicit patches rather than sentences. Sent as free text, the
 * extractor read "I can invest more than 250,000 US dollars" as a change of GOAL
 * to investment, which silently re-filtered a skilled-migration shortlist down to
 * nothing. A refinement adds a fact; it must never re-steer the search.
 */
const REFINE: Chip[] = [
  { label: "I have a master's degree", value: "masters", patch: { education: "masters" } },
  { label: "10+ years' experience", value: "experience", patch: { yearsExperience: 12 } },
  { label: "My partner is coming too", value: "partner", patch: { family: "partner" } },
  { label: "I can invest $250k+", value: "funds", patch: { budgetUsd: 250_000 } },
];

/* -------------------------------------------------------------------------- */

type Message = { id: string; from: "xia" | "you"; text?: string; cards?: CaseMatch[] };

let seq = 0;
const nextId = () => `m${(seq += 1)}`;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------------------------- */

export default function XiaChat({ seed, onClose }: { seed?: string; onClose: () => void }) {
  const { case: item, patchNow } = useXiaCase("hero");
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  /** Index into QUESTIONS. Equal to QUESTIONS.length once the cards are up. */
  const [index, setIndex] = useState(0);
  const [chips, setChips] = useState<Chip[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  /** Refinements already applied — an offer you have taken is not an offer. */
  const [usedRefine, setUsedRefine] = useState<string[]>([]);
  const [typing, setTyping] = useState<{ id: string; shown: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const chipsRef = useRef<HTMLUListElement | null>(null);
  const cardsRef = useRef<HTMLUListElement | null>(null);
  const started = useRef(false);
  /** Questions already put to this visitor. A repeat reads as a broken bot. */
  const asked = useRef<Set<number>>(new Set());
  /** The last non-empty shortlist, so a refinement can never wipe the screen. */
  const lastMatches = useRef<CaseMatch[]>([]);
  /** First result set says the full piece; later ones only re-rank. */
  const resultsShown = useRef(false);

  const orbState: OrbState = busy ? "thinking" : done ? "resolved" : "listening";
  const visibleChips = chips.filter((chip) => !usedRefine.includes(chip.value));

  useEffect(() => setMounted(true), []);

  const say = useCallback((message: Omit<Message, "id">) => {
    const id = nextId();
    setMessages((current) => [...current, { id, ...message }]);
    if (message.from === "xia" && message.text && !prefersReducedMotion()) {
      setTyping({ id, shown: 0 });
    }
  }, []);

  /* ------------------------------- typewriter ------------------------------ */

  const typingText = useMemo(
    () => (typing ? messages.find((message) => message.id === typing.id)?.text ?? "" : ""),
    [typing, messages],
  );

  useEffect(() => {
    if (!typing) return;
    if (typing.shown >= typingText.length) {
      setTyping(null);
      return;
    }
    const perChar = typingText.length > 220 ? 8 : 15;
    const timer = window.setTimeout(() => {
      setTyping((current) =>
        current && current.id === typing.id
          ? { ...current, shown: Math.min(current.shown + 2, typingText.length) }
          : current,
      );
    }, perChar);
    return () => window.clearTimeout(timer);
  }, [typing, typingText]);

  const skipTyping = useCallback(() => {
    setTyping((current) => (current ? { ...current, shown: Number.MAX_SAFE_INTEGER } : current));
  }, []);

  /* --------------------------- scroll + page lock -------------------------- */

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chips, busy, typing]);

  // Page lock, Lenis pause, and wheel handling — see use-overlay-scroll.
  useOverlayScroll(scrollRef);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* -------------------------------- anime.js ------------------------------- */

  useEffect(() => {
    if (!chips.length || prefersReducedMotion()) return;
    let cancelled = false;
    (async () => {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled || !chipsRef.current) return;
        animate(chipsRef.current.querySelectorAll("li"), {
          opacity: [0, 1],
          translateY: [14, 0],
          scale: [0.94, 1],
          duration: 420,
          delay: stagger(45),
          ease: "out(3)",
        });
      } catch {
        /* the chips are already visible; motion is the bonus */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chips]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last?.cards?.length || prefersReducedMotion()) return;
    let cancelled = false;
    (async () => {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled || !cardsRef.current) return;
        animate(cardsRef.current.querySelectorAll("li"), {
          opacity: [0, 1],
          translateY: [26, 0],
          duration: 560,
          delay: stagger(110),
          ease: "out(4)",
        });
      } catch {
        /* as above */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messages]);

  /* ------------------------------- the engine ------------------------------ */

  const showResults = useCallback(async () => {
    setChips([]);
    setBusy(true);
    setIndex(QUESTIONS.length);
    try {
      const response = await fetch("/api/xia/match?limit=4&closed=0", { credentials: "same-origin" });
      const data = await response.json();
      const matches: CaseMatch[] = data?.matches ?? [];
      if (!matches.length && lastMatches.current.length) {
        // The extra detail ruled everything out under the current filters. The
        // earlier shortlist was honest on what we knew then, so it stays.
        say({
          from: "xia",
          text: "That detail rules out everything under your current country and goal — so the routes above still stand on what you told me before it. Widen the destination, or put it to Varun and he will tell you which of the two reads right.",
        });
        setDone(true);
        return;
      }
      if (matches.length) {
        lastMatches.current = matches;
        if (!resultsShown.current) {
          resultsShown.current = true;
          say({
            from: "xia",
            text:
              matches.length === 1
                ? "One route is worth your time. Here it is, with everything it still needs from you."
                : `${matches.length} routes are worth your time, strongest first. Each one says exactly what it still needs from you.`,
          });
          say({ from: "xia", cards: matches });
          say({
            from: "xia",
            text: "The full report sets out the filing order, the timing and the real costs, and lands in your inbox as a PDF. Tell me anything else about yourself and I will re-rank these on the spot.",
          });
        } else {
          // Re-ranked, not restarted. Repeating the whole closing every time a
          // chip is tapped is what made the transcript look broken.
          say({ from: "xia", text: "Re-ranked with that. Here is how it stands now." });
          say({ from: "xia", cards: matches });
        }
        setChips(REFINE);
      } else {
        say({
          from: "xia",
          text: "Nothing clears the published rules on what you have told me so far — which is worth knowing now rather than after a filing fee. That is exactly the case worth putting to a person.",
        });
      }
      setDone(true);
    } catch {
      say({ from: "xia", text: "I could not reach the matching engine just then. Try once more?" });
    } finally {
      setBusy(false);
    }
  }, [say]);

  /** Ask question `from`, or show results if we are past the end. */
  const ask = useCallback(
    (from: number) => {
      if (from >= QUESTIONS.length) {
        void showResults();
        return;
      }
      if (asked.current.has(from)) {
        // Already put. Move on rather than looping on the same question.
        setIndex(from + 1);
        void showResults();
        return;
      }
      asked.current.add(from);
      setIndex(from);
      say({ from: "xia", text: QUESTIONS[from].ask });
      setChips(QUESTIONS[from].chips);
    },
    [say, showResults],
  );

  /** Free text: the model reads it for every field at once, not just this one. */
  const mine = useCallback(async (text: string): Promise<Partial<XiaCase>> => {
    try {
      const response = await fetch("/api/xia/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: {}, message: text, language: "en", step: 0, isOpening: true }),
      });
      const data = await response.json();
      const found = (data?.state ?? {}) as Record<string, string>;
      return {
        ...(found.destination ? { destination: found.destination } : {}),
        ...(found.goal ? { goal: found.goal } : {}),
        ...(found.profile ? { profile: found.profile } : {}),
        ...(found.nationality ? { nationality: found.nationality } : {}),
        ...(found.family ? { family: found.family } : {}),
      };
    } catch {
      return {};
    }
  }, []);

  const submit = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value || busy) return;
      setInput("");
      skipTyping();
      say({ from: "you", text: value });
      setChips([]);
      setBusy(true);

      const found = await mine(value);
      const current = index < QUESTIONS.length ? QUESTIONS[index] : null;
      const patch: Partial<XiaCase> = {
        ...found,
        ...(current && !(current.field in found)
          ? setField(current.field, value.toLowerCase().slice(0, 60))
          : {}),
        notes: value,
      };
      await patchNow(patch);
      setBusy(false);

      if (!current) {
        await showResults();
        return;
      }

      // Skip only the questions THIS message answered. Never skip on what the
      // case happened to hold from a previous visit.
      let next = index + 1;
      while (next < QUESTIONS.length && QUESTIONS[next].field in found) next += 1;
      ask(next);
    },
    [busy, mine, patchNow, say, index, ask, showResults, skipTyping],
  );

  const tapChip = useCallback(
    async (chip: Chip) => {
      if (busy) return;
      skipTyping();

      // After the cards are up, a suggestion applies its own patch and re-ranks.
      if (index >= QUESTIONS.length) {
        say({ from: "you", text: chip.label });
        setChips([]);
        setUsedRefine((current) => [...current, chip.value]);
        if (chip.patch) {
          setBusy(true);
          await patchNow(chip.patch);
          setBusy(false);
        }
        await showResults();
        return;
      }

      say({ from: "you", text: chip.label });
      setChips([]);
      const question = QUESTIONS[index];
      if (chip.value) {
        const patch = question.toPatch
          ? question.toPatch(chip.value)
          : setField(question.field, chip.value);
        setBusy(true);
        await patchNow(patch);
        setBusy(false);
      }
      ask(index + 1);
    },
    [busy, patchNow, say, index, ask, skipTyping, showResults],
  );

  /* ------------------------------- first turn ------------------------------ */

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const hello = item.name ? `${item.name.split(/\s+/)[0]} — good to meet you.` : "I'm XIA.";
    say({
      from: "xia",
      text: `${hello} I check you against the published rules of every programme XIPHIAS works on and tell you plainly which you clear, which you are close to, and which are shut. Five quick questions.`,
    });

    if (seed) {
      void submit(seed);
    } else {
      window.setTimeout(() => ask(0), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------- render -------------------------------- */

  if (!mounted) return null;

  const overlay = (
    <div className="xia-chat fixed inset-0 z-[99999] flex flex-col text-white" onClick={skipTyping}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#050f24]">
        <span className="xia-aurora xia-aurora--gold" />
        <span className="xia-aurora xia-aurora--blue" />
        <span
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <header className="relative flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <ConciergeOrb state={orbState} size={40} />
          <div className="leading-tight">
            <p className="text-[15px] font-black tracking-tight">XIA Intelligence</p>
            <p className="type-caption text-white/45">Your one-stop immigration assistant</p>
          </div>
        </div>

        <div className="hidden items-center gap-1.5 lg:flex" aria-hidden="true">
          {QUESTIONS.map((question, position) => (
            <span key={question.key} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${
                  position < index
                    ? "bg-[#e1b923] text-[#071a3a]"
                    : position === index
                      ? "bg-white/15 text-white ring-1 ring-[#e1b923]/60"
                      : "text-white/25"
                }`}
              >
                {question.rail}
              </span>
              {position < QUESTIONS.length - 1 ? (
                <span
                  className={`h-px w-4 transition-colors duration-500 ${
                    position < index ? "bg-[#e1b923]" : "bg-white/15"
                  }`}
                />
              ) : null}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close XIA"
          className="inline-flex size-10 items-center justify-center rounded-full text-white/60 transition hover:rotate-90 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={scrollRef}
        data-lenis-prevent
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-7 sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {messages.map((message) =>
            message.cards ? (
              <ul key={message.id} ref={cardsRef} className="grid gap-4">
                {message.cards.map((match) => (
                  <MatchCard key={match.programmeId} match={match} onNavigate={onClose} />
                ))}
              </ul>
            ) : (
              <div
                key={message.id}
                className={`xia-in flex ${message.from === "you" ? "justify-end" : "justify-start"}`}
              >
                {message.from === "xia" ? (
                  <p className="max-w-[92%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] leading-relaxed text-white/90 shadow-[0_8px_30px_rgba(3,16,40,0.35)]">
                    {typing?.id === message.id ? (message.text ?? "").slice(0, typing.shown) : message.text}
                    {typing?.id === message.id ? <span className="xia-caret" /> : null}
                  </p>
                ) : (
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#f0cb3b] to-[#d8ad1f] px-4 py-3 text-[15px] font-bold text-[#071a3a] shadow-[0_8px_26px_rgba(225,185,35,0.22)]">
                    {message.text}
                  </p>
                )}
              </div>
            ),
          )}

          {busy ? (
            <div className="xia-in flex w-fit items-center gap-2.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.06] px-4 py-3.5 text-white/50">
              <span className="xia-dot" />
              <span className="xia-dot" />
              <span className="xia-dot" />
              <span className="ml-1 text-[13px] font-semibold">checking the rules</span>
            </div>
          ) : null}

          {visibleChips.length && !typing ? (
            <ul ref={chipsRef} className="flex flex-wrap gap-2">
              {visibleChips.map((chip) => (
                <li key={chip.label}>
                  <button
                    type="button"
                    onClick={() => void tapChip(chip)}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e1b923]/70 hover:bg-white/[0.13] hover:shadow-[0_10px_26px_rgba(3,16,40,0.45)]"
                  >
                    {chip.emoji ? (
                      <span className="text-[15px] transition-transform duration-200 group-hover:scale-125">
                        {chip.emoji}
                      </span>
                    ) : null}
                    {chip.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {/* Rendered once, pinned to the end — never appended per re-rank. */}
          {done && !busy ? (
            <>
              <AdvisorCard onNavigate={onClose} />
              <ToolsCard onNavigate={onClose} />
            </>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit(input);
        }}
        className="relative shrink-0 border-t border-white/10 px-4 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.07] px-4 py-3 transition-all duration-300 focus-within:border-[#e1b923]/70 focus-within:shadow-[0_0_0_4px_rgba(225,185,35,0.10)]">
          <Sparkles className="size-4 shrink-0 text-[#e1b923]/70" aria-hidden="true" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your answer, or tell me everything at once…"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder-white/35 outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="group inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b] disabled:opacity-40"
          >
            Send
            <CornerDownLeft
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-[12px] text-white/35">
          XIA checks published government criteria. An assessment aid, not a visa decision.
        </p>
      </form>

      <style jsx>{`
        .xia-aurora { position: absolute; border-radius: 9999px; filter: blur(120px); will-change: transform; }
        .xia-aurora--gold {
          width: 46vw; height: 46vw; top: -14vw; right: -10vw;
          background: rgba(225, 185, 35, 0.18);
          animation: xiaDriftA 22s ease-in-out infinite;
        }
        .xia-aurora--blue {
          width: 52vw; height: 52vw; bottom: -20vw; left: -14vw;
          background: rgba(28, 87, 180, 0.42);
          animation: xiaDriftB 27s ease-in-out infinite;
        }
        @keyframes xiaDriftA {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-6vw, 5vw, 0) scale(1.12); }
        }
        @keyframes xiaDriftB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(7vw, -5vw, 0) scale(1.08); }
        }
        .xia-caret {
          display: inline-block; width: 2px; height: 1.05em; margin-left: 2px;
          vertical-align: -0.18em; background: #e1b923;
          animation: xiaBlink 0.9s steps(2) infinite;
        }
        @keyframes xiaBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .xia-dot {
          width: 7px; height: 7px; border-radius: 9999px; background: #e1b923;
          animation: xiaBounce 1.1s ease-in-out infinite;
        }
        .xia-dot:nth-child(2) { animation-delay: 0.14s; }
        .xia-dot:nth-child(3) { animation-delay: 0.28s; }
        @keyframes xiaBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .xia-in { animation: xiaIn 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes xiaIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .xia-aurora, .xia-caret, .xia-dot, .xia-in { animation: none; }
        }
      `}</style>
    </div>
  );

  // Portalled to the body: a fixed overlay resolves against the nearest
  // transformed ancestor, and in place it was being clipped by one.
  return createPortal(overlay, document.body);
}

/* -------------------------------------------------------------------------- */

/**
 * Every conversation ends here, whatever the result.
 *
 * The figures are the ones the consultation page already publishes, and the
 * licences are stated the way the register holds them: R516194 is the firm's
 * RCIC licence, not Varun's, and saying otherwise would be a regulatory problem
 * as well as a false one.
 */
function AdvisorCard({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="xia-in relative overflow-hidden rounded-2xl border border-[#e1b923]/45 bg-gradient-to-br from-[#e1b923]/[0.14] via-[#e1b923]/[0.05] to-transparent p-5 sm:p-7">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#e1b923]/15 blur-3xl"
      />

      <div className="relative">
        <p className="type-caption font-black uppercase tracking-[0.2em] text-[#f0cb3b]">The next step</p>
        <h3 className="mt-2 text-[24px] font-black leading-tight text-white sm:text-[28px]">
          Sit down with Varun Singh
        </h3>
        <p className="mt-1.5 text-[14px] font-bold text-white/70">
          Managing Director, XIPHIAS Immigration · Fellow, Investment Migration Council
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["17+", "years advising"],
            ["39", "awards won"],
            ["6", "offices worldwide"],
            ["4.8★", "Google rating"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl bg-white/[0.06] px-3 py-2.5 text-center">
              <dt className="text-[20px] font-black tabular-nums text-[#f0cb3b]">{value}</dt>
              <dd className="type-caption mt-0.5 text-white/55">{label}</dd>
            </div>
          ))}
        </dl>

        <p className="type-small mt-5 text-white/75">
          Sixty minutes, one to one, online. He reads your case the way a visa officer will, names the
          filing order and what would sink it, and tells you plainly when a route is not worth your
          money — including ours.
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/personal-booking#schedule"
            onClick={onNavigate}
            className="group inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-6 text-[16px] font-black text-[#071a3a] shadow-[0_14px_34px_rgba(225,185,35,0.3)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b] hover:shadow-[0_18px_44px_rgba(225,185,35,0.45)]"
          >
            <CalendarCheck className="size-[1.15em]" aria-hidden="true" />
            Book a consultation with Varun
            <ArrowRight
              className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/personal-booking"
            onClick={onNavigate}
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-xl border border-white/30 px-5 text-[14.5px] font-bold text-white/85 transition hover:border-white/60 hover:bg-white/10 hover:text-white"
          >
            His background &amp; awards
          </Link>
        </div>

        <p className="mt-4 border-t border-white/10 pt-3 text-[11.5px] leading-relaxed text-white/40">
          The firm&rsquo;s Canadian practice is delivered under CICC licence R516194; Australian
          assistance under MARA 1680615. XIPHIAS provides immigration consulting and documentation
          support — it is not a law firm.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const TOOLS = [
  {
    href: "/xia-intelligence",
    icon: LayoutGrid,
    label: "Route Intelligence",
    body: "The same rules engine, with every field open. Change one answer and watch the whole shortlist move.",
  },
  {
    href: "/compare-programs",
    icon: Scale,
    label: "Compare programmes",
    body: "Two or three routes side by side — cost, timeline, what each one actually demands.",
  },
  {
    href: "/cost-estimator",
    icon: Calculator,
    label: "Cost estimator",
    body: "Government fees, professional fees and the ones nobody mentions until you are committed.",
  },
  {
    href: "/passport-index",
    icon: Globe,
    label: "Passport Power",
    body: "What a passport is worth in practice: where it takes you, and where it still needs a visa.",
  },
];

/**
 * The quieter of the two closings. Some people do not want to be handed to a
 * person — they want the controls. Offering only the consultation loses them.
 */
function ToolsCard({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="xia-in rounded-2xl border border-white/12 bg-white/[0.04] p-5 sm:p-6">
      <p className="type-caption font-black uppercase tracking-[0.2em] text-white/45">Or drive it yourself</p>
      <h3 className="mt-2 text-[19px] font-black leading-tight text-white sm:text-[21px]">
        Rather explore it on your own?
      </h3>
      <p className="type-small mt-2 text-white/60">
        Everything I just used is open to you, with nothing hidden behind a form.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            onClick={onNavigate}
            className="group flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.03] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e1b923]/60 hover:bg-white/[0.09]"
          >
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e1b923]/15 text-[#f0cb3b]">
              <tool.icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[14px] font-black text-white">
                {tool.label}
                <ArrowRight
                  className="size-3.5 text-white/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#f0cb3b]"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-white/55">{tool.body}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function MatchCard({ match, onNavigate }: { match: CaseMatch; onNavigate: () => void }) {
  const product = reportForMatch(match);
  const open = match.state === "open";
  // The engine uses the first gap as the card's one-line reason, so printing the
  // gap list unfiltered says the same sentence twice.
  const gaps = match.gaps.filter((gap) => gap !== match.reason).slice(0, 3);

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(3,16,40,0.5)] sm:p-6 ${
        open
          ? "border-[#3cd278]/45 bg-[#3cd278]/[0.09] hover:border-[#3cd278]/70"
          : "border-[#e1b923]/40 bg-[#e1b923]/[0.07] hover:border-[#e1b923]/70"
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-all duration-700 group-hover:left-full"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-caption uppercase tracking-[0.14em] text-white/50">{match.country}</p>
          <h3 className="mt-1 text-[19px] font-black leading-snug text-white sm:text-[21px]">{match.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-black uppercase tracking-[0.08em] ${
              open ? "bg-[#3cd278]/20 text-[#7ce8a8]" : "bg-[#e1b923]/20 text-[#f0cb3b]"
            }`}
          >
            {open ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : null}
            {open ? "You clear it" : "Nearly there"}
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

      {/* Three real buttons. The old tertiary read as body text and got ignored. */}
      <div className="relative mt-5 grid gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Link
          href={`/get-report/${product}`}
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-[#071a3a] shadow-[0_10px_26px_rgba(225,185,35,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b] hover:shadow-[0_14px_32px_rgba(225,185,35,0.4)]"
        >
          <FileText className="size-4" aria-hidden="true" /> Email me the report
        </Link>
        <Link
          href={match.href}
          onClick={onNavigate}
          className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/[0.08] px-4 text-[14px] font-bold text-white transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/[0.16]"
        >
          See the programme
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="/personal-booking#schedule"
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e1b923]/40 px-4 text-[14px] font-bold text-[#f0cb3b] transition hover:-translate-y-0.5 hover:border-[#e1b923] hover:bg-[#e1b923]/10"
        >
          <CalendarCheck className="size-4" aria-hidden="true" /> Talk to Varun
        </Link>
      </div>
    </li>
  );
}
