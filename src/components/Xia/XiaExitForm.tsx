"use client";

// src/components/Xia/XiaExitForm.tsx
// -----------------------------------------------------------------------------
// The contact form, asked at the one moment it is reasonable to ask.
//
// The rule the business wanted, and it is the right one:
//
//   XIA is open, or the visitor is on a XIA page  →  never ask. They are already
//                                                    telling us everything.
//   XIA has just been closed with nothing given   →  ask immediately, while the
//                                                    intent is still warm.
//
// So this never competes with the assistant. It catches the person who waved it
// away, which is exactly the person a form still has a chance with.
//
// It asks once per browsing session. Somebody who opens and closes XIA four
// times is telling you something, and it is not "ask me again".
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import ContactForm, { type SubmittedLead } from "@/components/ContactForm";
import ConciergeOrb from "@/components/Xia/ConciergeOrb";
import { useOverlayScroll } from "@/components/Xia/use-overlay-scroll";
import { XIA_CLOSED_EVENT } from "@/components/Xia/xia-chat";

const SESSION_KEY = "xiphias_exit_form_shown";
const CASE_SNAPSHOT_KEY = "xia_case_snapshot";
const OPEN_DELAY_MS = 450;

/** Pages where the visitor is already giving us what a form would ask for. */
function isXiaRoute(pathname: string | null) {
  if (!pathname) return false;
  const path = pathname.toLowerCase();
  return (
    path.startsWith("/xia-intelligence") ||
    path.startsWith("/route-intelligence") ||
    path.startsWith("/deep-analysis") ||
    path.startsWith("/us-visa-intelligence") ||
    path.startsWith("/get-report") ||
    path.startsWith("/registration") ||
    path.startsWith("/personal-booking") ||
    path.startsWith("/payment") ||
    path.startsWith("/tools/")
  );
}

/** Somebody who has already given their email is not asked for it again. */
function alreadyKnown() {
  try {
    const raw = window.localStorage.getItem(CASE_SNAPSHOT_KEY);
    if (!raw) return false;
    return Boolean((JSON.parse(raw) as { email?: string })?.email);
  } catch {
    return false;
  }
}

function shownThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markShown() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private window — it may ask again next visit, which is acceptable */
  }
}

export default function XiaExitForm() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDivElement | null>(null);

  useOverlayScroll(sheetRef, open);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onClosed = () => {
      if (isXiaRoute(window.location.pathname)) return;
      if (alreadyKnown() || shownThisSession()) return;
      // A beat, so it does not appear in the same frame the overlay leaves.
      window.setTimeout(() => {
        markShown();
        setOpen(true);
      }, OPEN_DELAY_MS);
    };

    window.addEventListener(XIA_CLOSED_EVENT, onClosed);
    return () => window.removeEventListener(XIA_CLOSED_EVENT, onClosed);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const onSuccess = useCallback(
    async (values: SubmittedLead) => {
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
            event: { kind: "answered", detail: "exit-form" },
          }),
        });
      } catch {
        // The lead is already in the CRM; the case just syncs later.
      }
      window.setTimeout(close, 900);
    },
    [close],
  );

  if (!open || isXiaRoute(pathname)) return null;

  return (
    <div
      ref={sheetRef}
      data-lenis-prevent
      className="fixed inset-0 z-[99997] flex items-center justify-center overflow-y-auto overscroll-contain bg-[#04102a]/80 p-4 backdrop-blur-[3px] sm:p-6"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xia-exit-form-title"
        className="relative my-auto w-full max-w-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-primary px-6 pb-6 pt-7 text-white shadow-[0_34px_90px_rgba(3,16,40,0.65)] sm:px-8">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(225,185,35,0.2),transparent_72%)]"
          />
          <div className="relative flex items-start gap-4">
            <ConciergeOrb state="idle" size={64} />
            <div className="min-w-0">
              <h2 id="xia-exit-form-title" className="text-[20px] font-black leading-snug sm:text-[23px]">
                Before you go — where should we send it?
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-white/70">
                Leave your details and an advisor will come back with the routes worth your time. No
                obligation, and you keep whatever we send.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <ContactForm
            idPrefix="xia-exit"
            variant="lead"
            heading="Talk to an advisor"
            subheading="Name, phone and email. One of our advisors reads it, not a bot."
            apiEndpoint="/api/enquiry"
            onSuccess={onSuccess}
            className="max-w-none"
          />
        </div>

        <button
          type="button"
          onClick={close}
          className="mt-2 w-full rounded-lg py-2 text-center text-sm font-semibold text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e1b923]"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
