"use client";

import * as React from "react";

type Props = {
  /** 0–100 */
  value: number;
  /** e.g. "Step 2 of 6" */
  text?: string;
  /** Server-Action-safe back handler */
  onBackAction?: () => void;
};

export function ProgressBar({ value, text, onBackAction }: Props) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div className="mb-3 md:mb-4">
      {/* top row */}
      <div className="mb-2 flex items-center justify-between gap-2">
        {onBackAction ? (
          <button
            type="button"
            onClick={onBackAction}
            className={[
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs",
              "ring-1 ring-black/10 hover:ring-black/20",
              "dark:ring-white/15 dark:hover:ring-white/25",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            ].join(" ")}
            aria-label="Go back"
            title="Back (Esc or ←)"
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

        <span className="text-xs md:text-sm text-black/70 dark:text-white/70" aria-live="polite">
          {text}
        </span>
      </div>

      {/* track */}
      <div
        className={[
          "relative h-2.5 overflow-hidden rounded-full",
          "bg-black/10 dark:bg-white/10",
          "ring-1 ring-black/10 dark:ring-white/10",
        ].join(" ")}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(clamped)}
        aria-valuetext={text}
      >
        {/* fill */}
        <div
          className={[
            "absolute inset-y-0 left-0 rounded-full",
            "bg-gradient-to-r from-blue-600 to-indigo-500",
            "transition-[width] duration-500 ease-out",
            "[motion-reduce:transition-none]",
            "will-change-[width]",
          ].join(" ")}
          style={{ width: `${clamped}%` }}
        />

        {/* subtle gloss */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(45deg, rgba(255,255,255,0.65) 0, rgba(255,255,255,0.0) 60%)",
          }}
        />
      </div>
    </div>
  );
}
