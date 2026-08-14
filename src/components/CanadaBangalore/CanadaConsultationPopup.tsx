"use client";

import React from "react";

import ContactForm from "@/components/ContactForm";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
} from "@/lib/cookies/consent";

const SUBMITTED_KEY = "xiphias_canada_bangalore_lead_submitted_v1";
const SUBMITTED_EVENT = "xiphias-canada-bangalore-lead-submitted";
const SHOW_DELAY_MS = 3_000;

function hasSubmitted() {
  try {
    return window.localStorage.getItem(SUBMITTED_KEY) === "1";
  } catch {
    return false;
  }
}

function markSubmitted() {
  try {
    window.localStorage.setItem(SUBMITTED_KEY, "1");
  } catch {
    // A successful enquiry should remain successful when storage is blocked.
  }
  window.dispatchEvent(new Event(SUBMITTED_EVENT));
}

export function CanadaBangaloreContactForm() {
  return (
    <ContactForm
      idPrefix="canada-visa-consultants-bangalore"
      heading="Check your Canada PR eligibility"
      subheading="Share your profile by 28 August 2026. A XIPHIAS advisor will respond within 24 hours."
      defaults={{
        message:
          "I would like to assess my Canada PR, Express Entry or PNP options from Bangalore.",
      }}
      onSuccess={markSubmitted}
      className="!max-w-none !rounded-lg !shadow-none"
    />
  );
}

export default function CanadaConsultationPopup() {
  const [open, setOpen] = React.useState(false);
  const [pendingOpen, setPendingOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isBrochureGateOpen, setIsBrochureGateOpen] = React.useState(false);
  const [isCookiePromptOpen, setIsCookiePromptOpen] = React.useState(false);
  const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const dismiss = React.useCallback(() => {
    setOpen(false);
    setPendingOpen(false);
  }, []);

  React.useEffect(() => {
    if (hasSubmitted()) return;

    const timerId = window.setTimeout(() => setPendingOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  React.useEffect(() => {
    const syncCookiePrompt = () => setIsCookiePromptOpen(!readCookieConsent());
    const onChatState = (event: Event) => {
      setIsChatOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    const onBrochureGateState = (event: Event) => {
      setIsBrochureGateOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    };
    const onSubmitted = () => dismiss();

    syncCookiePrompt();
    window.addEventListener(COOKIE_CONSENT_EVENT, syncCookiePrompt);
    window.addEventListener("xiphias-chat-state", onChatState as EventListener);
    window.addEventListener(
      "xiphias-brochure-gate-state",
      onBrochureGateState as EventListener,
    );
    window.addEventListener(SUBMITTED_EVENT, onSubmitted);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncCookiePrompt);
      window.removeEventListener("xiphias-chat-state", onChatState as EventListener);
      window.removeEventListener(
        "xiphias-brochure-gate-state",
        onBrochureGateState as EventListener,
      );
      window.removeEventListener(SUBMITTED_EVENT, onSubmitted);
    };
  }, [dismiss]);

  React.useEffect(() => {
    if (!pendingOpen || isChatOpen || isBrochureGateOpen || isCookiePromptOpen) return;
    setOpen(true);
    setPendingOpen(false);
  }, [pendingOpen, isChatOpen, isBrochureGateOpen, isCookiePromptOpen]);

  React.useEffect(() => {
    if (!open) return;
    if (isChatOpen || isBrochureGateOpen || isCookiePromptOpen) {
      setOpen(false);
      setPendingOpen(true);
    }
  }, [open, isChatOpen, isBrochureGateOpen, isCookiePromptOpen]);

  React.useEffect(() => {
    if (!open) return;

    const documentElement = document.documentElement;
    const previousOverflow = documentElement.style.overflow;
    const previousPaddingRight = documentElement.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) documentElement.style.paddingRight = `${scrollbarWidth}px`;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      documentElement.style.overflow = previousOverflow;
      documentElement.style.paddingRight = previousPaddingRight;
    };
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[910] flex items-end justify-center bg-slate-950/65 p-3 backdrop-blur-[3px] sm:items-center sm:p-5"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="canada-bangalore-consultation-title"
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-xl overflow-x-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="relative overflow-hidden bg-primary px-5 py-5 pr-16 text-white sm:px-7 sm:py-6 sm:pr-16">
          <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-[#f0c83f]/20 to-transparent" />
          <p className="relative inline-flex rounded-full border border-[#f0c83f]/45 bg-[#f0c83f]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#f0c83f]">
            Limited seats available
          </p>
          <h2
            id="canada-bangalore-consultation-title"
            className="relative mt-3 text-xl font-black leading-tight sm:text-2xl"
          >
            Canada consultation registrations close 28 August 2026
          </h2>
          <p className="relative mt-2 text-sm font-semibold leading-6 text-white/75">
            Reserve your assessment slot and let our Bengaluru team review your Canada immigration profile.
          </p>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close Canada consultation form"
            onClick={dismiss}
            className="absolute right-4 top-4 z-10 inline-flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c83f]"
          >
            <span aria-hidden>&times;</span>
          </button>
        </header>

        <ContactForm
          idPrefix="canada-bangalore-entry-popup"
          heading="Reserve your consultation"
          subheading="Complete your details below. An advisor will contact you within one business day."
          defaults={{
            message:
              "I would like to reserve a Canada immigration consultation before 28 August 2026.",
          }}
          onSuccess={markSubmitted}
          className="!max-w-none !rounded-t-none !ring-0 !shadow-none"
        />
      </div>
    </div>
  );
}
