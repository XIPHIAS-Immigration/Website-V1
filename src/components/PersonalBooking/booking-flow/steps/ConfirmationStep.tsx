"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  /** ✅ Next 15-safe prop name */
  onCloseAction: () => void;
  /** Optional reference/id you return from the backend */
  draftId?: string;
  /** Optional meeting link to show a quick action */
  joinUrl?: string;
  /** Optional .ics URL from backend to let users add to calendar */
  icsUrl?: string;
  /** Optional custom strings */
  title?: string;
  message?: string;
  calendarLabel?: string;
};

export default function ConfirmationStep({
  onCloseAction,
  draftId,
  joinUrl,
  icsUrl,
  title = "You're booked!",
  message = "We’ve emailed your confirmation and meeting details.",
  calendarLabel = "Add to Calendar",
}: Props) {
  const [copied, setCopied] = useState<"ref" | "join" | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // SR announce success once mounted
    if (liveRef.current) {
      liveRef.current.textContent = "Booking confirmed";
    }
  }, []);

  function copy(text: string, kind: "ref" | "join") {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  const whatsAppHref =
    joinUrl ? `https://wa.me/?text=${encodeURIComponent(`Meeting link: ${joinUrl}`)}` : undefined;

  return (
    <div className="relative mx-auto w-full max-w-md text-center px-3 py-6 sm:p-8">
      {/* SR live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

      {/* Success icon with subtle stroke animation (respects reduced motion) */}
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full ring-1 ring-green-400/40 bg-emerald-500/10">
        <svg viewBox="0 0 48 48" className="h-8 w-8 text-emerald-600">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-20"
          />
          <path
            d="M16 24l6 6 12-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[draw_600ms_ease-out_forwards] motion-reduce:animate-none"
            style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
          />
        </svg>
      </div>

      {/* Heading + message */}
      <h3 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{message}</p>

      {/* Reference (optional) */}
      {draftId ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 ring-1 ring-zinc-200 px-3 py-2 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/15">
          <span className="text-xs">Ref:</span>
          <code className="text-xs font-mono">{draftId}</code>
          <button
            type="button"
            onClick={() => copy(draftId, "ref")}
            className="rounded-md px-2 py-1 text-xs ring-1 ring-zinc-200 hover:bg-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
          >
            {copied === "ref" ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCloseAction}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:col-span-2"
        >
          Close
        </button>

        {joinUrl ? (
          <>
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
            >
              Open meeting
            </a>
            <button
              type="button"
              onClick={() => copy(joinUrl, "join")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
            >
              {copied === "join" ? "Link copied" : "Copy link"}
            </button>
            {whatsAppHref ? (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 px-4 py-2.5 text-white ring-1 ring-emerald-700/30 transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                Share via WhatsApp
              </a>
            ) : null}
          </>
        ) : null}

        {icsUrl ? (
          <a
            href={icsUrl}
            download
            className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:bg-white/5 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
          >
            {calendarLabel}
          </a>
        ) : null}
      </div>

      {/* Next steps list */}
      <ul className="mx-auto mt-6 grid w-full max-w-sm gap-2 text-left text-sm text-zinc-700 dark:text-zinc-300">
        <li className="inline-flex items-start gap-2">
          <Dot /> Check your inbox for the confirmation email (and spam folder just in case).
        </li>
        <li className="inline-flex items-start gap-2">
          <Dot /> You can reschedule or cancel using the link inside the email.
        </li>
        <li className="inline-flex items-start gap-2">
          <Dot /> Please join 2–3 minutes early to verify audio/video.
        </li>
      </ul>

      {/* Local CSS for the checkmark draw animation */}
      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------- tiny icon -------------------------------- */

function Dot() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 h-3 w-3 text-blue-600 dark:text-blue-300" aria-hidden="true">
      <circle cx="10" cy="10" r="4" className="fill-current" />
    </svg>
  );
}
