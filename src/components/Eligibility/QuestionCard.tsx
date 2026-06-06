"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Question } from "@/lib/eligibility/types";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  question: Question;
  value: any;
  /** Server-Action-safe handlers (required by Next rule) */
  onSubmitAction: (v: any) => void | Promise<void>;
  onBackAction?: () => void | Promise<void>;
};

const SPRING = { type: "spring", stiffness: 340, damping: 32, mass: 0.72 };

export function QuestionCard({ question, value, onSubmitAction, onBackAction }: Props) {
  const reduceMotion = useReducedMotion();

  const [local, setLocal] = useState<any>(value ?? "");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstControlRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  const fieldId = useMemo(() => `q-${question.key}`, [question.key]);
  const hintId = `${fieldId}-hint`;
  const helperId = `${fieldId}-helper`;

  // keep local in sync if parent changes value
  useEffect(() => setLocal(value ?? ""), [value]);

  // focus first control for better keyboard UX
  useEffect(() => {
    const el = firstControlRef.current;
    if (el) {
      // tiny timeout to allow mount/animation
      const t = window.setTimeout(() => el.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [question.key]);

  const isEmpty = (v: unknown) => String(v ?? "").trim().length === 0;

  const disabled = useMemo(() => {
    switch (question.type) {
      case "text":
        return isEmpty(local);
      case "number": {
        if (local === "" || local === null || local === undefined) return true;
        const n = Number(local);
        return Number.isNaN(n) || !Number.isFinite(n);
      }
      case "select":
      case "radio":
        return local === "" || local === undefined || local === null;
      case "yesno":
        return typeof local !== "boolean";
      default:
        return false;
    }
  }, [local, question.type]);

  const doSubmit = useCallback(async () => {
    if (disabled || submitting) return;
    setSubmitting(true);
    try {
      const normalized = question.type === "number" ? Number(local) : local;
      await onSubmitAction(normalized);
    } finally {
      setSubmitting(false);
    }
  }, [disabled, submitting, local, question.type, onSubmitAction]);

  // Keyboard helpers (Enter submit, Esc/← back, arrows cycle radios/yesno)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void doSubmit();
      } else if ((e.key === "Escape" || e.key === "ArrowLeft") && onBackAction) {
        onBackAction();
      } else if (question.type === "yesno" || question.type === "radio") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          if (question.type === "yesno") setLocal(true);
          else if (question.options?.length) {
            const idx = question.options.findIndex((o) => o.value === local);
            const next = Math.min((idx >= 0 ? idx + 1 : 0), question.options.length - 1);
            const val = question.options[next]?.value;
            if (val !== undefined) setLocal(val);
          }
        } else if (e.key === "ArrowUp") {
          if (question.type === "yesno") setLocal(false);
        }
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [local, onBackAction, question, doSubmit]);

  return (
    <motion.div
      ref={containerRef}
      tabIndex={0}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? undefined : SPRING}
      className={[
        "rounded-2xl",
        "bg-white text-black dark:bg-black dark:text-white",
        "ring-1 ring-black/10 dark:ring-white/10",
        "p-4 sm:p-5 md:p-6",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
      ].join(" ")}
    >
      {/* Prompt */}
      <h4 className="text-base sm:text-lg md:text-xl font-semibold leading-snug" id={fieldId}>
        {question.prompt}
      </h4>
      {question.helper && (
        <p className="mt-1 text-sm text-black/70 dark:text-white/70" id={helperId}>
          {question.helper}
        </p>
      )}

      {/* Controls */}
      <div className="mt-4 space-y-3">
        {question.type === "text" && (
          <Field label="Your answer" htmlFor={`${fieldId}-input`}>
            <input
              ref={firstControlRef as React.RefObject<HTMLInputElement>}
              id={`${fieldId}-input`}
              type="text"
              className={inputCls()}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Type your answer…"
              autoComplete="off"
              aria-labelledby={fieldId}
              aria-describedby={[question.helper ? helperId : null, touched && isEmpty(local) ? hintId : null].filter(Boolean).join(" ") || undefined}
            />
            {touched && isEmpty(local) && <Hint id={hintId}>Enter a response to continue.</Hint>}
          </Field>
        )}

        {question.type === "number" && (
          <Field label="Enter a number" htmlFor={`${fieldId}-input`}>
            <input
              ref={firstControlRef as React.RefObject<HTMLInputElement>}
              id={`${fieldId}-input`}
              type="number"
              inputMode="numeric"
              className={inputCls()}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. 3"
              aria-labelledby={fieldId}
              aria-describedby={touched && (local === "" || Number.isNaN(Number(local))) ? hintId : undefined}
            />
            {touched && (local === "" || Number.isNaN(Number(local))) && (
              <Hint id={hintId}>Provide a valid number.</Hint>
            )}
          </Field>
        )}

        {question.type === "yesno" && (
          <Field label="Choose one">
            <div
              role="radiogroup"
              aria-labelledby={fieldId}
              className="inline-flex rounded-xl ring-1 ring-black/10 dark:ring-white/10 p-1 bg-black/5 dark:bg-white/10"
            >
              <Seg
                isActive={local === true}
                onClick={() => setLocal(true)}
                label="Yes"
                ariaProps={{ role: "radio", "aria-checked": local === true }}
                ref={firstControlRef as React.RefObject<HTMLButtonElement>}
              />
              <Seg
                isActive={local === false}
                onClick={() => setLocal(false)}
                label="No"
                ariaProps={{ role: "radio", "aria-checked": local === false }}
              />
            </div>
            {touched && typeof local !== "boolean" && <Hint id={hintId}>Select Yes or No.</Hint>}
          </Field>
        )}

        {question.type === "radio" && (
          <Field label="Select an option">
            <div role="radiogroup" aria-labelledby={fieldId} className="grid grid-cols-1 gap-2">
              {(question.options ?? []).map((o, i) => {
                const active = local === o.value;
                const key = `${String(o.value)}-${i}`;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLocal(o.value)}
                    className={[
                      "w-full rounded-xl text-left p-3 sm:p-3.5 transition",
                      "ring-1 ring-black/10 dark:ring-white/10",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
                        : "bg-white dark:bg-black hover:shadow-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    ].join(" ")}
                    role="radio"
                    aria-checked={active}
                    ref={i === 0 ? (firstControlRef as React.RefObject<HTMLButtonElement>) : undefined}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{o.label}</span>
                      <span
                        className={[
                          "inline-flex h-4 w-4 items-center justify-center rounded-full ring-1",
                          active
                            ? "bg-white/20 text-white ring-white/40"
                            : "text-black/60 ring-black/15 dark:text-white/70 dark:ring-white/20",
                        ].join(" ")}
                        aria-hidden
                      >
                        {active ? (
                          <svg viewBox="0 0 20 20" className="h-3 w-3">
                            <path fill="currentColor" d="M8.5 13.3 5.2 10l1.1-1.1 2.2 2.2 5.2-5.2 1.1 1.1z" />
                          </svg>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {touched && !local && <Hint id={hintId}>Select one option to continue.</Hint>}
          </Field>
        )}

        {question.type === "select" && (
          <Field label="Choose an option" htmlFor={`${fieldId}-select`}>
            <div className="relative">
              <select
                ref={firstControlRef as React.RefObject<HTMLSelectElement>}
                id={`${fieldId}-select`}
                className={[inputCls(), "appearance-none pr-8"].join(" ")}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-labelledby={fieldId}
                aria-describedby={touched && !local ? hintId : undefined}
              >
                <option value="" disabled>
                  Select…
                </option>
                {(question.options ?? []).map((o, i) => (
                  <option key={`${String(o.value)}-${i}`} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"
              >
                <path fill="currentColor" d="M7 10l5 5 5-5z" />
              </svg>
            </div>
            {touched && !local && <Hint id={hintId}>Please choose an option.</Hint>}
          </Field>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        {onBackAction ? (
          <button
            type="button"
            onClick={onBackAction}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/15 dark:hover:ring-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M7.5 2.5L4 6l3.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        <button
          type="button"
          onClick={() => {
            setTouched(true);
            void doSubmit();
          }}
          disabled={disabled || submitting}
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
              <Spinner /> Next
            </>
          ) : (
            <>
              Next
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------- small atoms ------------------------- */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="text-xs font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Hint({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className="mt-1 text-xs text-red-600" aria-live="polite">
      {children}
    </p>
  );
}

function inputCls() {
  return [
    "w-full rounded-lg px-3 py-2.5",
    "bg-white text-black placeholder-black/40",
    "ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-500 focus:outline-none",
  ].join(" ");
}

const Seg = React.forwardRef<
  HTMLButtonElement,
  {
    isActive: boolean;
    onClick: () => void;
    label: string;
    ariaProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  }
>(function Seg({ isActive, onClick, label, ariaProps }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={[
        "min-w-[72px] rounded-lg px-3 py-2 text-sm font-medium transition",
        isActive
          ? "bg-white text-black shadow-sm ring-1 ring-black/10"
          : "text-black/70 hover:text-black dark:text-white/80 dark:hover:text-white",
      ].join(" ")}
      aria-pressed={isActive}
      {...ariaProps}
    >
      {label}
    </button>
  );
});

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin">
      <circle cx="12" cy="12" r="10" className="fill-none stroke-current" strokeWidth="3" opacity="0.25" />
      <path className="fill-current" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
    </svg>
  );
}
