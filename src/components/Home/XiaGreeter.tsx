"use client";

// src/components/Home/XiaGreeter.tsx
// -----------------------------------------------------------------------------
// What used to open over the hero by itself was a contact form: five fields and
// a consent box, before the visitor had seen a single thing worth giving their
// number for. It converted the people who were already sold and taxed everyone
// else.
//
// Same slot, same timing, different ask. The XIA mark settles into place, says
// what XIA is worth, shows the licences behind it, and offers one button — and
// the button opens XIA rather than a form.
//
// It greets on every load of the homepage, by design. Escape, the backdrop and
// "Maybe later" all close it; nothing is remembered between loads.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Compass, ScanSearch, Sparkles } from "lucide-react";

import ConciergeOrb from "@/components/Xia/ConciergeOrb";
import { useOverlayScroll } from "@/components/Xia/use-overlay-scroll";
import { closeXiaChat, openXiaChat } from "@/components/Xia/xia-chat";
import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookies/consent";

const OPEN_DELAY_MS = 1_100;

const LINE =
  "Tell me what you do and where you want to go. I check you against the published rules of every programme XIPHIAS works on — and name the ones you actually qualify for.";

const VALUE = [
  {
    icon: ScanSearch,
    title: "Checked, not guessed",
    body: "Sixteen programmes across nine countries, against each government's own published criteria.",
  },
  {
    icon: Compass,
    title: "Every gap named",
    body: "Not a score you cannot act on — the specific thing standing between you and each route.",
  },
  {
    icon: CalendarCheck,
    title: "Straight to what's next",
    body: "Your full report by email, or a call with a licensed advisor. No forms in between.",
  },
];

/** Publicly verifiable — every one of these can be looked up on a register. */
const PROOF = ["CICC RCIC R516194", "MARA 1680615", "39 awards", "17 years", "4.8★ Google"];

export default function XiaGreeter() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [cookiePromptOpen, setCookiePromptOpen] = useState(true);
  const [shown, setShown] = useState(0);

  const birdRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const startRef = useRef<HTMLButtonElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  /* ---- Never stack on top of the cookie banner. ------------------------- */
  useEffect(() => {
    const sync = () => setCookiePromptOpen(!readCookieConsent());
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setArmed(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (armed && !cookiePromptOpen) setOpen(true);
  }, [armed, cookiePromptOpen]);

  // Page lock, Lenis pause and wheel handling, only while it is showing.
  useOverlayScroll(sheetRef, open);

  const dismiss = useCallback(() => {
    setOpen(false);
    setArmed(false);
    // Waved away rather than started — hand over to the contact form.
    closeXiaChat();
  }, []);

  const start = useCallback(() => {
    setOpen(false);
    setArmed(false);
    openXiaChat();
  }, []);

  /* ---- Modal mechanics -------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    startRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  /* ---- The entrance: the mark settles, the card rises, the points land. ---- */
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(LINE.length);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { animate, stagger } = await import("animejs");
        if (cancelled) return;
        if (birdRef.current) {
          animate(birdRef.current, {
            rotate: [-135, 0],
            scale: [0.55, 1],
            opacity: [0, 1],
            duration: 950,
            ease: "out(4)",
          });
        }
        if (cardRef.current) {
          animate(cardRef.current, {
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 640,
            delay: 340,
            ease: "out(3)",
          });
        }
        if (listRef.current) {
          animate(listRef.current.querySelectorAll("li"), {
            opacity: [0, 1],
            translateX: [-16, 0],
            duration: 520,
            delay: stagger(110, { start: 900 }),
            ease: "out(3)",
          });
        }
      } catch {
        /* CSS keeps everything visible; the flight is the bonus */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  /* ---- The line types itself, starting as the bird lands. ---------------- */
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (shown >= LINE.length) return;
    const delay = shown === 0 ? 700 : 13;
    const timer = window.setTimeout(() => setShown((current) => Math.min(current + 2, LINE.length)), delay);
    return () => window.clearTimeout(timer);
  }, [open, shown]);

  if (!open) return null;

  return (
    <div
      ref={sheetRef}
      data-lenis-prevent
      className="xia-greeter fixed inset-0 z-[99998] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#04102a]/80 p-4 backdrop-blur-[4px] sm:p-6"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xia-greeter-title"
        className="relative my-auto w-full max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-primary text-white shadow-[0_40px_110px_rgba(3,16,40,0.7)]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_22%_0%,rgba(225,185,35,0.24),transparent_70%)]"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative grid gap-6 p-7 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-8 sm:p-9">
            {/* Left: the mark, finding north. */}
            <div className="flex flex-col items-center gap-4 sm:pt-2">
              <div ref={birdRef}>
                <ConciergeOrb state="listening" size={176} />
              </div>
              <p className="type-caption text-center font-black uppercase tracking-[0.24em] text-[#f0cb3b]">
                XIA Intelligence
              </p>
            </div>

            {/* Right: what it is, why it is trustworthy, and one way in. */}
            <div className="min-w-0 text-center sm:text-left">
              <h2
                id="xia-greeter-title"
                className="text-[26px] font-black leading-[1.15] tracking-tight sm:text-[32px]"
              >
                Your one-stop assistant for immigration
              </h2>

              <p className="mt-3 min-h-[5.5rem] text-[15px] leading-relaxed text-white/75 sm:min-h-[4.75rem]">
                {LINE.slice(0, shown)}
                {shown < LINE.length ? <span className="xia-greeter-caret" /> : null}
              </p>

              <ul ref={listRef} className="mt-5 space-y-3.5 text-left">
                {VALUE.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e1b923]/15 text-[#f0cb3b]">
                      <point.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-black text-white">{point.title}</span>
                      <span className="block text-[13px] leading-snug text-white/60">{point.body}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  ref={startRef}
                  type="button"
                  onClick={start}
                  className="group inline-flex min-h-[3.5rem] flex-1 items-center justify-center gap-2 rounded-xl bg-[#e1b923] px-7 text-[16px] font-black text-[#071a3a] shadow-[0_14px_34px_rgba(225,185,35,0.3)] transition hover:-translate-y-0.5 hover:bg-[#f0cb3b] hover:shadow-[0_18px_44px_rgba(225,185,35,0.45)]"
                >
                  <Sparkles
                    className="size-[1.15em] transition-transform duration-300 group-hover:rotate-90"
                    aria-hidden="true"
                  />
                  Start with XIA
                  <ArrowRight
                    className="size-[1.1em] transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
                <Link
                  href="/xia-intelligence"
                  onClick={dismiss}
                  className="inline-flex min-h-[3.5rem] items-center justify-center rounded-xl border border-white/25 px-5 text-[14.5px] font-bold text-white/85 transition hover:border-white/55 hover:bg-white/10 hover:text-white"
                >
                  Browse programmes
                </Link>
              </div>

              <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 pt-4 sm:justify-start">
                {PROOF.map((claim) => (
                  <li key={claim} className="text-[11.5px] font-bold uppercase tracking-[0.1em] text-white/40">
                    {claim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="mt-2.5 w-full rounded-lg py-2 text-center text-sm font-semibold text-white/70 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1b923]"
        >
          Maybe later
        </button>
      </div>

      <style jsx>{`
        .xia-greeter { animation: xiaGreeterFade 260ms ease-out both; }
        @keyframes xiaGreeterFade { from { opacity: 0; } to { opacity: 1; } }
        .xia-greeter-caret {
          display: inline-block; width: 2px; height: 1.05em; margin-left: 2px;
          vertical-align: -0.18em; background: #e1b923;
          animation: xiaGreeterBlink 0.9s steps(2) infinite;
        }
        @keyframes xiaGreeterBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .xia-greeter, .xia-greeter-caret { animation: none; }
        }
      `}</style>
    </div>
  );
}
