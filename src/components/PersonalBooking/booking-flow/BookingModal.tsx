"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { BookingInput } from "./connectors";
import { bookAndMaybePay } from "./connectors";
import PlanStep from "./steps/PlanStep";
import CalendarStep from "./steps/CalendarStep";
import DetailsStep from "./steps/DetailsStep";
import ReviewStep from "./steps/ReviewStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import { addDays, formatISODate } from "./utils/time";

/* -------------------------------------------------------------------------- */
/* Types & constants                                                          */
/* -------------------------------------------------------------------------- */

type Props = {
  /** ✅ Next 15-safe name */
  onCloseAction: () => void;
  initialPlan?: "free" | "paid";
  defaultTimezone: string;
};

const paidDefaults = { durationMin: 60, priceCents: 2500000 }; // ₹25,000
const freeDefaults = { durationMin: 15, priceCents: 0 };

type Step = "plan" | "calendar" | "details" | "review" | "done";
const STEPS: Step[] = ["plan", "calendar", "details", "review", "done"];
const STEP_LABEL: Record<Step, string> = {
  plan: "Choose plan",
  calendar: "Pick a slot",
  details: "Your details",
  review: "Review",
  done: "Confirmation",
};

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function BookingModal({
  onCloseAction,
  initialPlan,
  defaultTimezone,
}: Props) {
  const [step, setStep] = useState<Step>("plan");
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reference?: string;
    joinUrl?: string;
    icsUrl?: string;
  } | null>(null);

  const [data, setData] = useState<BookingInput>({
    plan: initialPlan || "free",
    ...(initialPlan === "paid" ? paidDefaults : freeDefaults),
    timezone: defaultTimezone,
    dateISO: formatISODate(addDays(new Date(), 1)),
    timeISO: "",
    fullName: "",
    email: "",
  });

  const progress = useMemo(() => {
    const idx = STEPS.indexOf(step);
    const total = STEPS.length - 1; // "done" is last
    return Math.max(0, Math.min(1, idx / total));
  }, [step]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stepLiveRef = useRef<HTMLDivElement | null>(null);
  const headingId = "booking-modal-title";

  /* ------------------------------- A11y / UX ------------------------------ */

  // Focus trap + Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseAction();
        return;
      }
      if (e.key === "Tab") {
        const el = containerRef.current;
        if (!el) return;
        const focusables = el.querySelectorAll<HTMLElement>(
          'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    // initial focus to close button
    queueMicrotask(() => {
      containerRef.current
        ?.querySelector<HTMLButtonElement>("[data-close='1']")
        ?.focus();
    });
    return () => document.removeEventListener("keydown", onKey);
  }, [onCloseAction]);

  // Announce step for screen-readers
  useEffect(() => {
    if (stepLiveRef.current) stepLiveRef.current.textContent = STEP_LABEL[step];
  }, [step]);

  /* -------------------------------- Handlers ------------------------------ */

  const go = (s: Step) => setStep(s);
  const update = (patch: Partial<BookingInput>) =>
    setData((prev) => ({ ...prev, ...patch }));

  function setPlanAction(plan: "free" | "paid") {
    setData((prev) => ({
      ...prev,
      plan,
      ...(plan === "paid" ? paidDefaults : freeDefaults),
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const result = await bookAndMaybePay(data);
      setConfirmation({
        reference: result.reference,
        joinUrl: result.joinUrl,
        icsUrl: result.icsUrl,
      });
      go("done");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------- Render ------------------------------- */

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby={headingId}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCloseAction}
      />

      {/* Dialog container */}
      <div
        ref={containerRef}
        className={[
          "relative z-10 w-full sm:max-w-2xl",
          "h-[92svh] sm:h-auto sm:max-h-[85vh]",
          "flex flex-col overflow-hidden",
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-zinc-900",
          "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:text-zinc-50",
          "ring-1 ring-blue-100/80 dark:ring-blue-900/40",
          "sm:rounded-2xl",
        ].join(" ")}
      >
        {/* Header */}
        <header className="flex-shrink-0 border-b border-blue-100/60 bg-white/85 dark:bg-zinc-900/50 sm:rounded-t-2xl">
          <div className="flex items-start justify-between p-4 sm:p-5">
            <div className="min-w-0">
              <h2
                id={headingId}
                className="truncate text-lg sm:text-xl font-semibold tracking-tight"
              >
                Reserve your consultation
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                Private Client Service
              </p>
            </div>

            <button
              data-close="1"
              onClick={onCloseAction}
              className="ml-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/80 hover:text-black ring-1 ring-transparent hover:ring-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close dialog"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>

          {/* Stepper + progress */}
          <div className="px-4 sm:px-5 pb-3">
            <ol className="flex items-center gap-2 overflow-x-auto text-[11px] sm:text-xs text-zinc-700 dark:text-zinc-300">
              {STEPS.map((s, i) => {
                const active = STEPS.indexOf(step) >= i;
                return (
                  <li
                    key={s}
                    aria-current={step === s ? "step" : undefined}
                    className={[
                      "flex-1 min-w-[120px] sm:min-w-0 whitespace-nowrap text-center rounded-full px-2 py-1 ring-1",
                      active
                        ? "bg-white/90 ring-blue-200 dark:bg-white/10 dark:ring-blue-800/40"
                        : "ring-transparent",
                    ].join(" ")}
                  >
                    {i + 1}. {STEP_LABEL[s]}
                  </li>
                );
              })}
            </ol>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                style={{ width: `${progress * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </header>

        {/* Live region to announce step changes */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" ref={stepLiveRef} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 sm:py-5 pb-[max(16px,env(safe-area-inset-bottom))]">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute right-[-5%] top-[-5%] h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
            <div className="absolute left-[-8%] bottom-[-8%] h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          </div>

          <div className="mx-auto max-w-3xl">
            {step === "plan" && (
              <PlanStep
                value={data.plan}
                durationMin={data.durationMin}
                priceCents={data.priceCents}
                onChangePlanAction={setPlanAction}
                onNextAction={() => go("calendar")}
              />
            )}

            {step === "calendar" && (
              <CalendarStep
                timezone={data.timezone}
                dateISO={data.dateISO}
                timeISO={data.timeISO}
                onBackAction={() => go("plan")}
                onNextAction={(patch) => {
                  update(patch);
                  go("details");
                }}
              />
            )}

            {step === "details" && (
              <DetailsStep
                fullName={data.fullName}
                email={data.email}
                phone={data.phone}
                notes={data.notes}
                onBackAction={() => go("calendar")}
                onNextAction={(patch) => {
                  update(patch);
                  go("review");
                }}
              />
            )}

            {step === "review" && (
              <ReviewStep
                data={data}
                loading={loading}
                onBackAction={() => go("details")}
                onConfirmAction={handleSubmit}
              />
            )}

            {step === "done" && (
              <ConfirmationStep
                onCloseAction={onCloseAction}
                draftId={confirmation?.reference}
                joinUrl={confirmation?.joinUrl}
                icsUrl={confirmation?.icsUrl}
              />
            )}
          </div>
        </main>
      </div>

      {/* SR-only announcer text container */}
      <div className="sr-only" aria-live="assertive" />
    </div>
  );
}
