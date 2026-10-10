"use client";

// src/components/Xia/XiaChat.tsx
// -----------------------------------------------------------------------------
// XIA, full screen.
//
// Three questions, one at a time, each answerable by tapping a suggestion or by
// typing, then whatever the matched routes still need to know. Then the
// programmes, with every gap named, pinned to the top of the screen. The advisor
// card leads the closing only when it is earned (see lib/xia/script).
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
import { ArrowRight, CalendarCheck, CheckCircle2, CornerDownLeft, FileText, Sparkles, X } from "lucide-react";

import ConciergeOrb, { type OrbState } from "./ConciergeOrb";
import { useOverlayScroll } from "./use-overlay-scroll";
import { useXiaCase } from "./useXiaCase";
import type { CaseMatch, XiaCase } from "@/lib/xia/case";
import {
  ADVISOR_LEAD, OPENERS, REGISTRATION_PRICE_LABEL, REPORT_PRICE_LABEL,
  advisorReasonFor, refineFor, registrationHref, setField, toQuestion,
  type AdvisorReason, type Chip, type Question, type WireAsk,
} from "@/lib/xia/script";
import { reportForMatch } from "@/lib/xia/report-for";

/* -------------------------------------------------------------------------- */

type Message = { id: string; from: "xia" | "you"; text?: string; cards?: CaseMatch[] };

let seq = 0;
const nextId = () => `m${(seq += 1)}`;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* -------------------------------------------------------------------------- */

export default function XiaChat({ seed, resume = false, onClose }: { seed?: string; resume?: boolean; onClose: () => void }) {
  const { case: item, patchNow } = useXiaCase("hero");
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  /** Index into the ladder. Equal to ladder.length once the cards are up. */
  const [index, setIndex] = useState(0);
  /**
   * The questions actually being asked. Starts as the three openers and grows
   * once the engine says what the matched routes are waiting on.
   */
  const ladder = useRef<Question[]>([...OPENERS]);
  /** The progress rail: the three openers. */
  const rail = OPENERS;
  const [chips, setChips] = useState<Chip[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  /** Set when the closing should lead with the advisor; null means the routes lead. */
  const [advisor, setAdvisor] = useState<AdvisorReason | null>(null);
  /** Refinements already applied — an offer you have taken is not an offer. */
  const [usedRefine, setUsedRefine] = useState<string[]>([]);
  const [typing, setTyping] = useState<{ id: string; shown: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const chipsRef = useRef<HTMLUListElement | null>(null);
  const cardsRef = useRef<HTMLUListElement | null>(null);
  const started = useRef(false);
  /** Questions already put to this visitor (ladder index or engine key). A repeat reads as a broken bot. */
  const asked = useRef<Set<number | string>>(new Set());
  /** Set after `ask` is defined, so `advance` can call it without a cycle. */
  const askRef = useRef<(from: number) => void>(() => {});
  /** The last non-empty shortlist, so a refinement can never wipe the screen. */
  const lastMatches = useRef<CaseMatch[]>([]);
  /** First result set says the full piece; later ones only re-rank. */
  const resultsShown = useRef(false);

  const orbState: OrbState = busy ? "thinking" : done ? "resolved" : "listening";
  const visibleChips = chips.filter((chip) => !usedRefine.includes(chip.value));
  /** While on the three openers: what the case already holds for this question, so the chip can be marked. */
  const earlier: string | null = (() => {
    if (index >= ladder.current.length) return null;
    const value = item[ladder.current[index].field];
    return typeof value === "string" && value ? value : null;
  })();

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

  // Questions scroll to the bottom like any chat. The cards do not: they are the
  // answer, so they pin to the top of the screen and everything after them —
  // the refinement chips, the advisor — sits below, reached by scrolling down.
  const pinCards = useRef(false);
  useEffect(() => {
    if (pinCards.current) {
      if (cardsRef.current && scrollRef.current) {
        scrollRef.current.scrollTo({ top: Math.max(0, cardsRef.current.offsetTop - 12), behavior: "smooth" });
      }
      return;
    }
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
    setIndex(ladder.current.length);
    try {
      const response = await fetch("/api/xia/match?limit=4&closed=0", { credentials: "same-origin" });
      const data = await response.json();
      const matches: CaseMatch[] = data?.matches ?? [];
      // The first thing the shortlisted routes are still waiting on, as chips
      // that re-rank the cards. Each chip carries its own patch.
      const asks = ((data?.questions ?? []) as WireAsk[]).map(toQuestion);
      const nextAsk = asks.find((ask) => !asked.current.has(ask.key)) ?? null;
      const askChips: Chip[] = nextAsk
        ? nextAsk.chips.map((chip) => ({
            label: chip.label,
            value: `${nextAsk.key}:${chip.value}`,
            patch: nextAsk.toPatch ? nextAsk.toPatch(chip.value) : setField(nextAsk.field, chip.value),
          }))
        : [];
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
      const reason = advisorReasonFor(item, matches);
      setAdvisor(reason);
      if (matches.length) {
        lastMatches.current = matches;
        pinCards.current = true;
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
            text:
              reason && reason !== "nothing-clears"
                ? ADVISOR_LEAD[reason]
                : "Get started on a route and the assessment team takes it from there. Tell me anything else about yourself and I will re-rank these on the spot.",
          });
        } else {
          // Re-ranked, not restarted. Repeating the whole closing every time a
          // chip is tapped is what made the transcript look broken.
          say({ from: "xia", text: "Re-ranked with that. Here is how it stands now." });
          say({ from: "xia", cards: matches });
        }
        if (nextAsk) {
          asked.current.add(nextAsk.key);
          say({ from: "xia", text: nextAsk.ask });
        }
        setChips([...askChips, ...refineFor(item.goal)]);
      } else {
        // No routes at all. A family case is not a failure — sponsorship rules
        // are held by the destination's family stream, which this engine does
        // not carry. Anything else is an honest "nothing clears".
        say({ from: "xia", text: ADVISOR_LEAD[reason ?? "nothing-clears"] });
      }
      setDone(true);
    } catch {
      say({ from: "xia", text: "I could not reach the matching engine just then. Try once more?" });
    } finally {
      setBusy(false);
    }
  }, [say, item.goal]);

  /**
   * Once the openers are done, ask the engine what the shortlisted routes are
   * actually waiting on. A points route asks age, study and language; an
   * investment route asks capital, family and how much time you can spend there.
   * Nothing here is hard-coded per goal.
   */
  // Three answers are enough for a first shortlist. Whatever the matched routes
  // still want to know is offered as chips under the cards, not asked first —
  // people want options, then they sharpen them.
  const advance = useCallback(async () => {
    void showResults();
  }, [showResults]);

  /** Ask question `from`, or move on if we are past the end of the ladder. */
  const ask = useCallback(
    (from: number) => {
      if (from >= ladder.current.length) {
        void advance();
        return;
      }
      if (asked.current.has(from)) {
        // Already put. Move on rather than looping on the same question.
        setIndex(from + 1);
        void advance();
        return;
      }
      asked.current.add(from);
      setIndex(from);
      say({ from: "xia", text: ladder.current[from].ask });
      setChips(ladder.current[from].chips);
    },
    [say, advance],
  );

  askRef.current = ask;

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
      pinCards.current = false;
      say({ from: "you", text: value });
      setChips([]);
      setBusy(true);

      const found = await mine(value);
      const current = index < ladder.current.length ? ladder.current[index] : null;
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
      while (next < ladder.current.length && ladder.current[next].field in found) next += 1;
      ask(next);
    },
    [busy, mine, patchNow, say, index, ask, showResults, skipTyping],
  );

  const tapChip = useCallback(
    async (chip: Chip) => {
      if (busy) return;
      skipTyping();
      pinCards.current = false;

      // After the cards are up, a suggestion applies its own patch and re-ranks.
      if (index >= ladder.current.length) {
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
      const question = ladder.current[index];
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
      text: `${hello} I check you against the published rules of every programme XIPHIAS works on and tell you plainly which you clear, which you are close to, and which are shut. A few quick questions \u2014 and only the ones your kind of route actually turns on.`,
    });

    const answered = Boolean(item.goal && item.profile);
    if (seed) {
      void submit(seed);
    } else if (resume && answered) {
      // Came back for the options: straight to where it stands. Typing anything re-ranks.
      setIndex(ladder.current.length);
      say({ from: "xia", text: "Welcome back. Here is where it stands on what you told me — tell me anything new and I will re-rank it." });
      window.setTimeout(() => void showResults(), 600);
    } else {
      // Every front door asks first. Earlier answers are marked on the chips,
      // so a returning visitor taps three times, or changes one.
      if (answered) say({ from: "xia", text: "Your earlier answers are marked — tap to keep them, or pick something new." });
      window.setTimeout(() => ask(0), answered ? 1400 : 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------------------------------- render -------------------------------- */

  if (!mounted) return null;

  const overlay = (
    <div className="xia-chat fixed inset-0 z-[99999] flex flex-col text-white" onClick={skipTyping}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-primary">
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
          {rail.map((question, position) => (
            <span key={question.key} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${
                  position < index
                    ? "bg-[#e1b923] text-primary"
                    : position === index
                      ? "bg-white/15 text-white ring-1 ring-[#e1b923]/60"
                      : "text-white/25"
                }`}
              >
                {question.rail}
              </span>
              {position < rail.length - 1 ? (
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
                  <p className="max-w-[92%] rounded-2xl rounded-bl-sm border border-white/15 bg-white/[0.1] px-4 py-3 text-[15px] leading-relaxed text-white shadow-[0_8px_30px_rgba(3,16,40,0.25)]">
                    {typing?.id === message.id ? (message.text ?? "").slice(0, typing.shown) : message.text}
                    {typing?.id === message.id ? <span className="xia-caret" /> : null}
                  </p>
                ) : (
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#f0cb3b] to-[#d8ad1f] px-4 py-3 text-[15px] font-bold text-primary shadow-[0_8px_26px_rgba(225,185,35,0.22)]">
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
              {visibleChips.map((chip, position) => {
                // Two labels can share a value ("Salaried professional" and "Doctor or nurse"); mark the first only.
                const picked = earlier !== null && chip.value === earlier && visibleChips.findIndex((other) => other.value === earlier) === position;
                return (
                <li key={chip.label}>
                  <button
                    type="button"
                    onClick={() => void tapChip(chip)}
                    aria-pressed={picked || undefined}
                    className={`group inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[14px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e1b923]/70 hover:bg-white/[0.13] hover:shadow-[0_10px_26px_rgba(3,16,40,0.45)] ${
                      picked ? "border-[#e1b923]/80 bg-[#e1b923]/15 ring-2 ring-[#e1b923]/35" : "border-white/20 bg-white/[0.06]"
                    }`}
                  >
                    {chip.emoji ? (
                      <span className="text-[15px] transition-transform duration-200 group-hover:scale-125">
                        {chip.emoji}
                      </span>
                    ) : null}
                    {chip.label}
                  </button>
                </li>
                );
              })}
            </ul>
          ) : null}

          {/* Rendered once, pinned to the end — never appended per re-rank. */}
          {done && !busy ? (
            advisor ? <AdvisorCard onNavigate={onClose} /> : <QuietClose onNavigate={onClose} />
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
            className="group inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-primary transition hover:bg-[#f0cb3b] disabled:opacity-40"
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
          background: rgba(225, 185, 35, 0.28);
          animation: xiaDriftA 22s ease-in-out infinite;
        }
        .xia-aurora--blue {
          width: 52vw; height: 52vw; bottom: -20vw; left: -14vw;
          background: rgba(140, 190, 255, 0.35);
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
  // The reason is already in the transcript above the card; here it is a title.
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
            ["5", "offices worldwide"],
            ["4.7★", "Google rating"],
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
            className="group inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-6 text-[16px] font-black text-primary shadow-[0_14px_34px_rgba(225,185,35,0.3)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b] hover:shadow-[0_18px_44px_rgba(225,185,35,0.45)]"
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

/**
 * The closing when the routes are the answer. The advisor and the open tools
 * are one line each — present, not pushed.
 */
function QuietClose({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="xia-in flex flex-col gap-2 border-t border-white/10 pt-4 text-[13.5px] text-white/55 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
      <Link href="/personal-booking#schedule" onClick={onNavigate} className="inline-flex items-center gap-1.5 font-bold text-white/75 transition hover:text-[#f0cb3b]">
        <CalendarCheck className="size-4" aria-hidden="true" />
        Rather talk it through? Book a session with Varun Singh
      </Link>
      <Link href="/xia-intelligence" onClick={onNavigate} className="inline-flex items-center gap-1.5 font-bold text-white/60 transition hover:text-white">
        Open every tool XIA used
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
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

      {/* One next step, the report beside it, the page after. The old three equal
          buttons left people reading instead of starting. */}
      <div className="relative mt-5 grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Link
          href={registrationHref(match)}
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-4 text-[14px] font-black text-primary shadow-[0_10px_26px_rgba(225,185,35,0.28)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b] hover:shadow-[0_14px_32px_rgba(225,185,35,0.4)]"
        >
          Get started — {REGISTRATION_PRICE_LABEL}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href={`/get-report/${product}`}
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#e1b923]/40 px-4 text-[14px] font-bold text-[#f0cb3b] transition hover:-translate-y-0.5 hover:border-[#e1b923] hover:bg-[#e1b923]/10"
        >
          <FileText className="size-4" aria-hidden="true" /> {REPORT_PRICE_LABEL} report
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
      </div>
    </li>
  );
}
