"use client";

import React from "react";
import type { BookingInput } from "../connectors";

type Props = {
  data: BookingInput;
  loading: boolean;
  /** ✅ Next 15-safe names */
  onBackAction: () => void;
  onConfirmAction: () => void;
};

export default function ReviewStep({ data, loading, onBackAction, onConfirmAction }: Props) {
  const priceDisplay = formatINR(data.priceCents);
  const appt = formatDateTime(data.dateISO, data.timeISO, data.timezone);
  const consultationLabel =
    data.plan === "free"
      ? `Discovery Call (${data.durationMin}m)`
      : `Strategy Consultation (${data.durationMin}m)`;

  return (
    <div className="grid gap-4">
      {/* Summary card */}
      <section className="rounded-2xl bg-white text-zinc-900 ring-1 ring-blue-200 p-4 dark:bg-zinc-900/40 dark:text-zinc-50 dark:ring-white/10">
        <h3 className="text-base font-semibold tracking-tight">Review & confirm</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {/* Appointment */}
          <div className="rounded-xl ring-1 ring-zinc-200/80 dark:ring-white/10 bg-white/80 dark:bg-white/5 p-3">
            <div className="flex items-start gap-2">
              <CalendarIcon />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Appointment</div>
                <div className="mt-1 font-medium">
                  {consultationLabel}
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  {appt || "—"}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Timezone: {data.timezone}</div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl ring-1 ring-zinc-200/80 dark:ring-white/10 bg-white/80 dark:bg-white/5 p-3">
            <div className="flex items-start gap-2">
              <UserIcon />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Contact</div>
                <div className="mt-1 font-medium">{data.fullName || "—"}</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 break-all">
                  <MailIcon className="mr-1 inline-block align-[-2px]" /> {data.email || "—"}
                </div>
                {data.phone ? (
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 break-all">
                    <PhoneIcon className="mr-1 inline-block align-[-2px]" /> {data.phone}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes ? (
          <div className="mt-3 rounded-xl ring-1 ring-zinc-200/80 dark:ring-white/10 bg-white/80 dark:bg-white/5 p-3">
            <div className="flex items-start gap-2">
              <NoteIcon />
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Notes</div>
                <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                  {data.notes}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Total / CTA */}
      <section
        aria-live="polite"
        aria-atomic="true"
        className="rounded-2xl bg-white text-zinc-900 ring-1 ring-blue-200 p-4 dark:bg-zinc-900/40 dark:text-zinc-50 dark:ring-white/10"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Total</div>
            <div className="text-2xl font-semibold">{priceDisplay}</div>
            {data.priceCents > 0 ? (
              <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                Secure payment via Razorpay • UPI / Cards / Netbanking
              </div>
            ) : (
              <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                No payment required for the discovery call
              </div>
            )}
          </div>

          <button
            onClick={onConfirmAction}
            disabled={loading}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white shadow-sm ring-1 transition focus:outline-none focus-visible:ring-2",
              data.priceCents > 0
                ? "bg-blue-600 ring-blue-700/20 hover:bg-blue-700 focus-visible:ring-blue-600"
                : "bg-emerald-600 ring-emerald-700/20 hover:bg-emerald-700 focus-visible:ring-emerald-600",
              loading ? "opacity-70 cursor-wait" : "",
            ].join(" ")}
            aria-busy={loading || undefined}
          >
            {loading ? (
              <>
                <Spinner />
                <span>Processing…</span>
              </>
            ) : data.priceCents > 0 ? (
              <>
                <LockIcon />
                <span>Proceed to Payment</span>
              </>
            ) : (
              <>
                <CheckIcon />
                <span>Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackAction}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-300/80 dark:ring-white/15 hover:bg-white/80 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Back
        </button>
        <span className="text-xs text-zinc-700 dark:text-zinc-400">
          You’ll receive an email confirmation immediately.
        </span>
      </div>
    </div>
  );
}

/* ------------------------------ helpers/ui ------------------------------- */

function formatINR(cents: number) {
  if (!cents || cents <= 0) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    Math.round(cents / 100)
  );
}

function formatDateTime(dateISO?: string, timeISO?: string, tz?: string) {
  if (!dateISO || !timeISO) return "";
  // Combine into a naive ISO string; format with provided timezone
  const d = new Date(`${dateISO}T${timeISO}:00`);
  try {
    const f = new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: tz || "UTC",
    });
    return f.format(d);
  } catch {
    return `${dateISO} ${timeISO}`;
  }
}

/* ------------------------------- icons ----------------------------------- */

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true">
      <path fill="currentColor" d="M7 2a1 1 0 0 1 1 1v1h8V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h1V3a1 1 0 1 1 2 0v1zm12 6H5v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true">
      <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5 0-9 2.5-9 5.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5C21 16.5 17 14 12 14Z" />
    </svg>
  );
}
function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 text-zinc-500 dark:text-zinc-400 ${className}`} aria-hidden="true">
      <path fill="currentColor" d="M4 6a2 2 0 0 0-2 2v.217l10 5.556 10-5.556V8a2 2 0 0 0-2-2H4Zm20 4.383-9.447 5.243a3 3 0 0 1-3.106 0L2 10.383V16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.617Z" />
    </svg>
  );
}
function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 text-zinc-500 dark:text-zinc-400 ${className}`} aria-hidden="true">
      <path fill="currentColor" d="M6.62 10.79a15.466 15.466 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.06-.23 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h2.46a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.23 1.06Z" />
    </svg>
  );
}
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true">
      <path fill="currentColor" d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V7h3.5L14 3.5Z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 text-white" aria-hidden="true">
      <path fill="currentColor" d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" aria-hidden="true">
      <path fill="currentColor" d="M17 9V7a5 5 0 1 0-10 0v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2Zm-8 0V7a3 3 0 1 1 6 0v2H9Z" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}
