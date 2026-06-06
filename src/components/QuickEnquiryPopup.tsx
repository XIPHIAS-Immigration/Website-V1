"use client";

import React from "react";
import { usePathname } from "next/navigation";

import ContactForm from "@/components/ContactForm";

const DISMISS_UNTIL_KEY = "xiphias_quick_enquiry_dismissed_until";
const SUBMITTED_UNTIL_KEY = "xiphias_quick_enquiry_submitted_until";
const SESSION_SHOWN_KEY = "xiphias_quick_enquiry_shown_session";

const SHOW_DELAY_MS = 25_000;
const SHOW_SCROLL_RATIO = 0.35;
const DISMISS_HIDE_DAYS = 7;
const SUBMIT_HIDE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function shouldSkipPath(pathname: string) {
  const p = pathname.toLowerCase();
  if (p.startsWith("/contact")) return true;
  if (p === "/eligibility" || p.startsWith("/eligibility/")) return true;
  if (p.includes("eligibility-check")) return true;
  return false;
}

function readUntilFromLocalStorage(key: string) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeUntilToLocalStorage(key: string, days: number) {
  try {
    const until = Date.now() + Math.max(0, days) * DAY_MS;
    window.localStorage.setItem(key, String(until));
  } catch {
    // ignore storage failures (private mode, blocked storage, etc.)
  }
}

export default function QuickEnquiryPopup() {
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);
  const [pendingOpen, setPendingOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isBrochureGateOpen, setIsBrochureGateOpen] = React.useState(false);

  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const skipRoute = shouldSkipPath(pathname);

  const closeWithSuppression = React.useCallback((key: string, days: number) => {
    writeUntilToLocalStorage(key, days);
    setOpen(false);
    setPendingOpen(false);
  }, []);

  const handleDismiss = React.useCallback(() => {
    closeWithSuppression(DISMISS_UNTIL_KEY, DISMISS_HIDE_DAYS);
  }, [closeWithSuppression]);

  const handleSubmitSuccess = React.useCallback(() => {
    closeWithSuppression(SUBMITTED_UNTIL_KEY, SUBMIT_HIDE_DAYS);
  }, [closeWithSuppression]);

  React.useEffect(() => {
    const onChatState = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setIsChatOpen(Boolean(detail?.open));
    };

    const onBrochureGateState = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setIsBrochureGateOpen(Boolean(detail?.open));
    };

    window.addEventListener("xiphias-chat-state", onChatState as EventListener);
    window.addEventListener(
      "xiphias-brochure-gate-state",
      onBrochureGateState as EventListener,
    );

    return () => {
      window.removeEventListener("xiphias-chat-state", onChatState as EventListener);
      window.removeEventListener(
        "xiphias-brochure-gate-state",
        onBrochureGateState as EventListener,
      );
    };
  }, []);

  React.useEffect(() => {
    setOpen(false);
    setPendingOpen(false);

    if (skipRoute) return;

    const now = Date.now();
    const dismissedUntil = readUntilFromLocalStorage(DISMISS_UNTIL_KEY);
    const submittedUntil = readUntilFromLocalStorage(SUBMITTED_UNTIL_KEY);
    let shownThisSession = false;

    try {
      shownThisSession = window.sessionStorage.getItem(SESSION_SHOWN_KEY) === "1";
    } catch {
      shownThisSession = false;
    }

    if (shownThisSession || now < dismissedUntil || now < submittedUntil) {
      return;
    }

    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      setPendingOpen(true);
      try {
        window.sessionStorage.setItem(SESSION_SHOWN_KEY, "1");
      } catch {
        // ignore storage failures
      }
    };

    const timerId = window.setTimeout(trigger, SHOW_DELAY_MS);

    const onScroll = () => {
      if (fired) return;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const ratio = window.scrollY / scrollable;
      if (ratio >= SHOW_SCROLL_RATIO) trigger();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname, skipRoute]);

  React.useEffect(() => {
    if (!pendingOpen || skipRoute) return;
    if (isChatOpen || isBrochureGateOpen) return;
    setOpen(true);
    setPendingOpen(false);
  }, [pendingOpen, skipRoute, isChatOpen, isBrochureGateOpen]);

  React.useEffect(() => {
    if (!open) return;
    if (isChatOpen || isBrochureGateOpen) {
      setOpen(false);
      setPendingOpen(true);
    }
  }, [open, isChatOpen, isBrochureGateOpen]);

  React.useEffect(() => {
    if (!open) return;
    const docEl = document.documentElement;
    const prevOverflow = docEl.style.overflow;
    const prevPadRight = docEl.style.paddingRight;
    const scrollbarWidth = window.innerWidth - docEl.clientWidth;

    docEl.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      docEl.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      docEl.style.overflow = prevOverflow;
      docEl.style.paddingRight = prevPadRight;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[900] flex items-end justify-center bg-black/55 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={handleDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-enquiry-popup-title"
        className="relative w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Close enquiry popup"
          onClick={handleDismiss}
          className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span aria-hidden>x</span>
        </button>

        <ContactForm
          idPrefix="quick-enquiry-popup"
          variant="full"
          heading="Need help with the right immigration pathway?"
          subheading="Share your details and an advisor will contact you within one business day."
          apiEndpoint="/api/enquiry"
          onSuccess={handleSubmitSuccess}
          className="max-w-none"
        />

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-2 w-full rounded-lg py-2 text-center text-sm text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
