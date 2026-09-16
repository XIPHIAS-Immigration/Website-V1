"use client";

import React from "react";
import { usePathname } from "next/navigation";

import ConciergeOrb from "@/components/Xia/ConciergeOrb";
import { openXiaChat } from "@/components/Xia/xia-chat";
import {
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
} from "@/lib/cookies/consent";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

const DISMISS_UNTIL_KEY = "xiphias_quick_enquiry_dismissed_until";
const SUBMITTED_UNTIL_KEY = "xiphias_quick_enquiry_submitted_until";
const SESSION_SHOWN_KEY = "xiphias_quick_enquiry_shown_session";

const SHOW_DELAY_MS = 2_500;
const SHOW_SCROLL_RATIO = 0.12;
const DISMISS_HIDE_DAYS = 7;
const SUBMIT_HIDE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function shouldSkipPath(pathname: string) {
  const p = pathname.toLowerCase();
  // The homepage has its own gate (components/Home/HeroGate). Two contact
  // modals fighting over the first three seconds is how a visitor leaves.
  if (p === "/") return true;
  if (p.startsWith("/contact")) return true;
  if (p === "/canada-visa-consultants-bangalore") return true;
  if (p === "/eligibility" || p.startsWith("/eligibility/")) return true;
  if (p.includes("eligibility-check")) return true;
  if (p.startsWith("/deep-analysis")) return true;
  if (p.startsWith("/route-intelligence")) return true;
  if (p.startsWith("/us-visa-intelligence")) return true;
  if (p.startsWith("/cost-estimator")) return true;
  if (p.startsWith("/compare-programs")) return true;
  if (p.startsWith("/express-reports") || p.startsWith("/reports")) return true;
  if (p.startsWith("/xiphias-program-index")) return true;
  if (p.startsWith("/xia-intelligence")) return true;
  if (p.startsWith("/programme-explorer")) return true;
  if (p.startsWith("/payment") || p.startsWith("/registration")) return true;
  if (p.startsWith("/personal-booking") || p === "/booking") return true;
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
  const [draft, setDraft] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [pendingOpen, setPendingOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isBrochureGateOpen, setIsBrochureGateOpen] = React.useState(false);
  const [isCookiePromptOpen, setIsCookiePromptOpen] = React.useState(false);

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
    const syncCookiePrompt = () => {
      setIsCookiePromptOpen(!readCookieConsent());
    };

    syncCookiePrompt();
    window.addEventListener(COOKIE_CONSENT_EVENT, syncCookiePrompt);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, syncCookiePrompt);
  }, []);

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

    if (shouldSkipPath(pathname)) return;

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
  }, [pathname]);

  React.useEffect(() => {
    if (!pendingOpen || skipRoute) return;
    if (isChatOpen || isBrochureGateOpen || isCookiePromptOpen) return;
    setOpen(true);
    setPendingOpen(false);
  }, [pendingOpen, skipRoute, isChatOpen, isBrochureGateOpen, isCookiePromptOpen]);

  React.useEffect(() => {
    if (!open) return;
    if (isChatOpen || isBrochureGateOpen || isCookiePromptOpen) {
      setOpen(false);
      setPendingOpen(true);
    }
  }, [open, isChatOpen, isBrochureGateOpen, isCookiePromptOpen]);

  // Through the shared counted lock, not its own save/restore. This popup opens
  // on every page load, so it was almost always the overlay that arrived second
  // — it recorded the greeter's "hidden" as the resting value and put it back on
  // close, leaving every page unscrollable. See lib/scroll-lock.
  React.useEffect(() => {
    if (!open) return;
    lockScroll();
    return unlockScroll;
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

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-primary p-6 text-center text-white shadow-[0_28px_80px_rgba(3,16,40,0.6)] sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(225,185,35,0.16),transparent_70%)]"
          />
          <div className="relative flex flex-col items-center">
            <ConciergeOrb state="listening" size={96} />
            <h2 id="quick-enquiry-popup-title" className="mt-4 text-[22px] font-black leading-tight sm:text-[26px]">
              Not sure which route is yours?
            </h2>
            <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-white/70">
              Tell XIA what you do. It checks you against the published rules of every programme
              XIPHIAS works on and names the ones you actually clear — in about a minute.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmitSuccess();
                openXiaChat(draft);
              }}
              className="mt-6 w-full"
            >
              <div className="flex flex-col gap-2 rounded-xl border border-white/25 bg-white/[0.08] p-2 focus-within:border-[#e1b923]/70 sm:flex-row sm:items-center">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="What do you do for a living?"
                  aria-label="Tell XIA what you do"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] text-white placeholder-white/40 outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#e1b923] px-5 text-[14.5px] font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
                >
                  Ask XIA
                </button>
              </div>
            </form>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-2 w-full rounded-lg py-2 text-center text-sm font-semibold text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
