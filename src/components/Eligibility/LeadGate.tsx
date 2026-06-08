"use client";

import * as React from "react";
import { useMemo, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { scoreAssessment } from "@/lib/eligibility/scoring";
import type { Track, AnswerMap, Result } from "@/lib/eligibility/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LeadGateProps {
  track: Track;
  answers: AnswerMap;

  name: string;
  setName: (v: string) => void;

  email: string;
  setEmail: (v: string) => void;

  phone: string;
  setPhone: (v: string) => void;

  /** Back-compat */
  onSubmit?: () => void | Promise<void>;
  /** Preferred alias */
  onSubmitAction?: () => void | Promise<void>;
}

const SPRING = { type: "spring", stiffness: 340, damping: 32, mass: 0.72 };

/* --- tiny inline icons --- */
function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M17 10V8a5 5 0 1 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1Zm-8 0V8a3 3 0 1 1 6 0v2H9Z"
      />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path fill="currentColor" d="M12 2.5 4.5 5v7.5A9.5 9.5 0 0 0 12 22a9.5 9.5 0 0 0 7.5-9.5V5L12 2.5Z" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path fill="currentColor" d="M7 2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 1.5V8h4.5L14 3.5Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v1.2l10 6 10-6V6a2 2 0 0 0-2-2Zm0 5.3-8.6 5.2a1 1 0 0 1-1.06 0L2 9.3V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.3Z"
      />
    </svg>
  );
}
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-current" strokeWidth="3" opacity="0.25" />
      <path className="fill-current" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  );
}

/* shimmering redaction bar */
function Redacted({ w = "w-40" }: { w?: string }) {
  return (
    <span
      className={[
        "inline-block h-2 rounded",
        w,
        "bg-gradient-to-r from-black/[0.08] via-black/[0.14] to-black/[0.08]",
        "dark:from-white/10 dark:via-white/20 dark:to-white/10",
        "animate-[shimmer_1.6s_ease_infinite]",
        "[background-size:200%_100%]",
      ].join(" ")}
    />
  );
}

/* keyframes for shimmer */
const shimmerCss = `
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

export function LeadGate({
  track,
  answers,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  onSubmit,
  onSubmitAction,
}: LeadGateProps) {
  const reduceMotion = useReducedMotion();

  // SAFE preview: never throw inside render even if scoring changes later
  const result: Result = useMemo(() => {
    try {
      return scoreAssessment(track, answers);
    } catch {
      return {
        tier: "Borderline",
        summary: "Preview unavailable. Enter your details to view the full result and PDF.",
        programs: [],
      };
    }
  }, [track, answers]);

  const [touched, setTouched] = useState({ name: false, email: false });
  const [submitting, setSubmitting] = useState(false);

  const nameOk = name.trim().length >= 2;
  const emailOk = EMAIL_RE.test(email);
  const valid = nameOk && emailOk;

  const firstProgram = result.programs?.[0];
  const programName = firstProgram?.name ?? "Recommended program";

  const submit = useCallback(async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      if (onSubmitAction) await onSubmitAction();
      else if (onSubmit) await onSubmit();
    } finally {
      setSubmitting(false);
    }
  }, [valid, submitting, onSubmit, onSubmitAction]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: shimmerCss }} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : SPRING}
        className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2"
      >
        {/* ---------- Free preview (teaser) ---------- */}
        <section
          aria-labelledby="lead-preview"
          className={[
            "relative overflow-hidden rounded-2xl",
            "bg-white text-black dark:bg-black dark:text-white",
            "ring-1 ring-black/10 dark:ring-white/10",
            "p-4 sm:p-5 md:p-6",
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium ring-1 ring-black/10 dark:bg-white/10 dark:ring-white/15">
            <LockIcon /> Free preview
          </span>

          <h3 id="lead-preview" className="mt-2 text-xl font-semibold">
            Your {track} assessment preview
          </h3>

          <p className="mt-2 text-sm sm:text-base">
            <span className="font-semibold">{result.tier}</span> - {result.summary}
          </p>

          <div className="mt-4 group relative rounded-xl ring-1 ring-black/10 dark:ring-white/10 p-4">
            <div className="font-medium">{programName}</div>

            <ul className="mt-2 space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50" />
                <Redacted w="w-44" />
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50" />
                <Redacted w="w-56" />
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-black/50 dark:bg-white/50" />
                <Redacted w="w-36" />
              </li>
            </ul>

            {/* Lightweight lock overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduceMotion ? undefined : { duration: 0.25 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-[2px]" />
              <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-xs text-white ring-1 ring-white/10 dark:bg-white/10">
                <motion.span
                  animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <LockIcon />
                </motion.span>
                Detailed report unlocks after registration
              </div>
            </motion.div>
          </div>

          {/* reassurance list */}
          <ul className="mt-3 grid gap-1.5 text-xs text-black/70 dark:text-white/70">
            <li className="inline-flex items-center gap-1.5"><DocIcon /> Email assessment trailer</li>
            <li className="inline-flex items-center gap-1.5"><ShieldIcon /> Advisor-ready profile notes</li>
            <li className="inline-flex items-center gap-1.5"><MailIcon /> Paid detailed report pathway</li>
          </ul>
        </section>

        {/* ---------- Form ---------- */}
        <section
          aria-labelledby="lead-form"
          className={[
            "relative overflow-hidden rounded-2xl",
            "bg-white text-black dark:bg-black dark:text-white",
            "ring-1 ring-black/10 dark:ring-white/10",
            "p-4 sm:p-5 md:p-6",
          ].join(" ")}
        >
          <h3 id="lead-form" className="text-lg sm:text-xl font-semibold">
            Where should we send your preview?
          </h3>
          <p className="mt-1 text-sm text-black/70 dark:text-white/70">
            Get a concise assessment trailer now. The complete personal report is unlocked after registration.
          </p>

          {/* trust chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-black/10 dark:ring-white/15">
              <ShieldIcon /> Private
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-black/10 dark:ring-white/15">
              Trailer report
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-black/10 dark:ring-white/15">
              No spam
            </span>
          </div>

          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            onKeyDown={onKeyDown}
            noValidate
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* NAME */}
              <div className="flex flex-col">
                <label htmlFor="lead-name" className="text-xs font-medium">Full name</label>
                <input
                  id="lead-name"
                  type="text"
                  autoComplete="name"
                  className={[
                    "mt-1 rounded-lg px-3 py-2.5",
                    "bg-white text-black placeholder-black/40",
                    "ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                  ].join(" ")}
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={touched.name && !nameOk}
                  aria-describedby="lead-name-err"
                />
                {touched.name && !nameOk && (
                  <span id="lead-name-err" className="mt-1 text-xs text-red-600">
                    Please enter your full name.
                  </span>
                )}
              </div>

              {/* EMAIL */}
              <div className="flex flex-col">
                <label htmlFor="lead-email" className="text-xs font-medium">Email address</label>
                <input
                  id="lead-email"
                  type="email"
                  autoComplete="email"
                  className={[
                    "mt-1 rounded-lg px-3 py-2.5",
                    "bg-white text-black placeholder-black/40",
                    "ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                    touched.email && !emailOk ? "ring-red-500 focus:ring-red-500" : "",
                  ].join(" ")}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={touched.email && !emailOk}
                  aria-describedby="lead-email-err"
                />
                {touched.email && !emailOk && (
                  <span id="lead-email-err" className="mt-1 text-xs text-red-600">
                    Enter a valid email like name@domain.com.
                  </span>
                )}
              </div>

              {/* PHONE (optional) */}
              <div className="flex flex-col">
                <label htmlFor="lead-phone" className="text-xs font-medium">Phone (optional)</label>
                <input
                  id="lead-phone"
                  type="tel"
                  autoComplete="tel"
                  className={[
                    "mt-1 rounded-lg px-3 py-2.5",
                    "bg-white text-black placeholder-black/40",
                    "ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                  ].join(" ")}
                  placeholder="+1 555 000 1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* reassurance */}
            <div className="mt-1 text-xs text-black/60 dark:text-white/60" aria-live="polite">
              We keep your information confidential and never share it.
            </div>

            {/* submit */}
            <div className="mt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={!valid || submitting}
                title={!valid ? "Enter name and a valid email" : ""}
                className={[
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2.5",
                  "bg-gradient-to-r from-blue-600 to-indigo-500 text-white",
                  "ring-1 ring-blue-700/20 enabled:hover:from-blue-700 enabled:hover:to-indigo-600",
                  "enabled:active:from-blue-800 enabled:active:to-indigo-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  "transition",
                ].join(" ")}
              >
                {submitting ? (
                  <>
                    <Spinner /> Sending preview...
                  </>
                ) : (
                  <>
                    Send preview & view result <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </motion.div>
    </>
  );
}
