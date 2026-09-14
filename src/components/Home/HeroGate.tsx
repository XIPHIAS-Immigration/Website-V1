"use client";

// src/components/Home/HeroGate.tsx
// -----------------------------------------------------------------------------
// The front door, in the order a visitor actually experiences it.
//
//   1. The hero paints.                    (SEO text, LCP image — untouched)
//   2. The contact card opens over it.     (this component)
//   3. It closes — filled or skipped.
//   4. XIA wakes up underneath and starts suggesting.   (XiaConcierge)
//
// Why a gate and not just a section: a visitor who gives their name once should
// never be asked again — not by the concierge, not by the report checkout, not
// by the scheduler. Whatever is typed here lands on the XIA case immediately, so
// every later step is already pre-filled and the report is one click, not a form.
//
// Skipping is free and remembered. Nobody is held hostage by a modal.
// -----------------------------------------------------------------------------

import * as React from "react";

import ContactForm, { type SubmittedLead } from "@/components/ContactForm";
import { COOKIE_CONSENT_EVENT, readCookieConsent } from "@/lib/cookies/consent";
import { XIA_UNLOCK_EVENT, type XiaUnlockDetail } from "@/lib/xia/events";

const STATE_KEY = "xiphias_hero_gate_state";
const CASE_SNAPSHOT_KEY = "xia_case_snapshot";
const OPEN_DELAY_MS = 1_200;
const DAY_MS = 24 * 60 * 60 * 1000;
const SKIP_DAYS = 3;
const SUBMIT_DAYS = 60;

type GateState = { until: number };

function readUntil(): number {
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as GateState;
    return Number.isFinite(parsed?.until) ? parsed.until : 0;
  } catch {
    return 0;
  }
}

function suppressFor(days: number) {
  try {
    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({ until: Date.now() + days * DAY_MS } satisfies GateState),
    );
  } catch {
    /* private window — the gate simply asks again next visit */
  }
}

/** Already-known visitors are never asked twice, even before the case syncs. */
function alreadyKnown(): boolean {
  try {
    const raw = window.localStorage.getItem(CASE_SNAPSHOT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { email?: string };
    return Boolean(parsed?.email);
  } catch {
    return false;
  }
}

function unlockXia(detail: XiaUnlockDetail) {
  window.dispatchEvent(new CustomEvent(XIA_UNLOCK_EVENT, { detail }));
}

export default function HeroGate() {
  const [open, setOpen] = React.useState(false);
  const [armed, setArmed] = React.useState(false);
  const [cookiePromptOpen, setCookiePromptOpen] = React.useState(true);
  const closeRef = React.useRef<HTMLButtonElement | null>(null);
  const releasedRef = React.useRef(false);

  /** One-way door: XIA is told exactly once, whatever route the gate closes by. */
  const release = React.useCallback((detail: XiaUnlockDetail) => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    unlockXia(detail);
  }, []);

  /* ---- Never stack on top of the cookie banner. ------------------------- */
  React.useEffect(() => {
    const sync = () => setCookiePromptOpen(!readCookieConsent());
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  /* ---- Decide whether to ask at all. ------------------------------------ */
  React.useEffect(() => {
    if (alreadyKnown() || Date.now() < readUntil()) {
      // Known or recently asked: XIA is live immediately, no interruption.
      release({ captured: alreadyKnown() });
      return;
    }
    const timer = window.setTimeout(() => setArmed(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [release]);

  React.useEffect(() => {
    if (armed && !cookiePromptOpen) setOpen(true);
  }, [armed, cookiePromptOpen]);

  /* ---- Modal mechanics: scroll lock, focus, Escape. ---------------------- */
  React.useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevPad = root.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;
    return () => {
      root.style.overflow = prevOverflow;
      root.style.paddingRight = prevPad;
    };
  }, [open]);

  const skip = React.useCallback(() => {
    suppressFor(SKIP_DAYS);
    setOpen(false);
    setArmed(false);
    release({ captured: false });
  }, [release]);

  React.useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, skip]);

  /* ---- The point of the whole thing: the answers land on the case. ------- */
  const handleSuccess = React.useCallback(
    async (values: SubmittedLead) => {
      suppressFor(SUBMIT_DAYS);

      try {
        await fetch("/api/xia/case?source=hero", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone,
            ...(values.message ? { notes: values.message } : {}),
            event: { kind: "answered", detail: "hero-contact" },
          }),
        });
      } catch {
        // The lead is already safe in the CRM; the case just syncs later.
      }

      // A beat, so the visitor reads the confirmation before the page moves.
      window.setTimeout(() => {
        setOpen(false);
        setArmed(false);
        release({ name: values.name, captured: true });
        document
          .getElementById("xia-concierge")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 900);
    },
    [release],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[880] flex items-end justify-center bg-[#071a3a]/75 p-4 backdrop-blur-[3px] sm:items-center"
      onClick={skip}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tell us who you are"
        className="relative w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={skip}
          aria-label="Skip and explore on my own"
          className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#071a3a]/70 text-white transition hover:bg-[#071a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1b923]"
        >
          <span aria-hidden>×</span>
        </button>

        <ContactForm
          idPrefix="hero-gate"
          variant="lead"
          heading="Where should we send your options?"
          subheading="Name, phone and email — then XIA shortlists the programmes you actually qualify for, and your report and consultation are one click each."
          apiEndpoint="/api/enquiry"
          onSuccess={handleSuccess}
          className="max-w-none"
        />

        <button
          type="button"
          onClick={skip}
          className="mt-2 w-full rounded-lg py-2 text-center text-sm font-semibold text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1b923]"
        >
          Skip — let me look around first
        </button>
      </div>
    </div>
  );
}
