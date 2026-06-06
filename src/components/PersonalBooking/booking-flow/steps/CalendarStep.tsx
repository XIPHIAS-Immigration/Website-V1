"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { addDays, formatISODate } from "../utils/time";
import { getAvailability } from "../connectors";

type Busy = "free" | "held" | "booked";

type Props = {
  timezone: string;
  dateISO?: string;
  timeISO?: string;
  /** ✅ Next 15-safe names */
  onBackAction: () => void;
  onNextAction: (patch: { dateISO: string; timeISO: string }) => void;
};

/** ------------------------------------------------------------------------
 * Policy: 5 fixed slots across a 9–6 workday.
 * You can change these once in the array below without touching any logic.
 * --------------------------------------------------------------------- */
const DEFAULT_SLOTS: string[] = ["09:00", "11:00", "13:00", "15:00", "17:00"];
const DAYS_AHEAD = 15; // allow booking next 15 days (starting tomorrow)

export default function CalendarStep({
  timezone,
  dateISO,
  timeISO,
  onBackAction,
  onNextAction,
}: Props) {
  const [date, setDate] = useState(
    dateISO && dateISO.trim() ? dateISO : formatISODate(addDays(new Date(), 1))
  );
  const [time, setTime] = useState(timeISO ?? "");
  const [busy, setBusy] = useState<Record<string, Busy>>({});
  const [loading, setLoading] = useState<boolean>(false);

  /** next 15 selectable days (starting tomorrow) */
  const days = useMemo(() => {
    const start = new Date();
    return Array.from({ length: DAYS_AHEAD }, (_, i) => formatISODate(addDays(start, i + 1)));
  }, []);

  /** fixed 5 slots (9–6 policy) */
  const times = DEFAULT_SLOTS;

  // refs for simple keyboard navigation
  const dayGridRef = useRef<HTMLDivElement | null>(null);
  const timeGridRef = useRef<HTMLDivElement | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await getAvailability(date, timezone);
        if (!mounted) return;
        const map: Record<string, Busy> = {};
        res.slots.forEach((s) => (map[s.timeISO] = s.status as Busy));
        setBusy(map);
        if (liveRef.current) {
          liveRef.current.textContent = "Availability updated";
        }
      } catch {
        // safe fallback: leave all free (mock adapter also handles this)
        setBusy({});
        if (liveRef.current) {
          liveRef.current.textContent =
            "Unable to fetch availability. Showing default times.";
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [date, timezone]);

  const disabled = (t: string) => busy[t] && busy[t] !== "free";

  // Keyboard nav for days and times (arrow keys)
  function onArrowNav(
    container: HTMLDivElement | null,
    e: React.KeyboardEvent,
    cols = 2
  ) {
    if (!container) return;
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
    );
    if (!buttons.length) return;
    const current = document.activeElement as HTMLElement | null;
    const i = Math.max(0, buttons.findIndex((b) => b === current));
    let next = i;

    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = Math.min(buttons.length - 1, i + (e.key === "ArrowDown" ? cols : 1));
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = Math.max(0, i - (e.key === "ArrowUp" ? cols : 1));

    if (next !== i) {
      e.preventDefault();
      buttons[next].focus();
    }
  }

  return (
    <div className="grid gap-4">
      {/* Live region for SR updates */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Date panel */}
        <section className="rounded-2xl bg-white text-zinc-900 ring-1 ring-blue-200 p-4 dark:bg-zinc-900/40 dark:text-zinc-50 dark:ring-white/10">
          <header className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Choose a date</div>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Next {DAYS_AHEAD} days
            </span>
          </header>

          <div
            ref={dayGridRef}
            className="grid grid-cols-2 gap-2 max-h-60 overflow-auto pr-1"
            onKeyDown={(e) => onArrowNav(dayGridRef.current, e, 2)}
          >
            {days.map((d) => {
              const isSelected = date === d;
              const label = new Date(d).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const isToday = isSameDate(d, new Date());
              const isTomorrow = isSameDate(d, addDays(new Date(), 1));
              const suffix = isToday ? " (today)" : isTomorrow ? " (tomorrow)" : "";

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm ring-1 motion-safe:transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isSelected
                      ? "bg-blue-600 text-white ring-blue-600"
                      : "bg-white text-zinc-900 ring-zinc-200 hover:ring-blue-300 dark:bg-white/5 dark:text-zinc-50 dark:ring-white/10 dark:hover:ring-blue-500/50",
                  ].join(" ")}
                  aria-pressed={isSelected}
                  aria-label={`${label}${suffix}`}
                  title={`${label}${suffix}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Time panel */}
        <section className="rounded-2xl bg-white text-zinc-900 ring-1 ring-blue-200 p-4 dark:bg-zinc-900/40 dark:text-zinc-50 dark:ring-white/10">
          <header className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Choose a time</div>
            <Legend />
          </header>

          <div
            ref={timeGridRef}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            onKeyDown={(e) => onArrowNav(timeGridRef.current, e, 3)}
          >
            {times.map((t) => {
              const isSelected = time === t;
              const isDisabled = disabled(t);
              const st = busy[t];

              return (
                <button
                  key={t}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setTime(t)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm ring-1 motion-safe:transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isSelected
                      ? "bg-blue-600 text-white ring-blue-600"
                      : "bg-white text-zinc-900 ring-zinc-200 hover:ring-blue-300 dark:bg-white/5 dark:text-zinc-50 dark:ring-white/10 dark:hover:ring-blue-500/50",
                    isDisabled ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                  aria-disabled={isDisabled}
                  aria-label={st && st !== "free" ? `Not available (${st})` : `Available`}
                  title={st && st !== "free" ? `Not available (${st})` : `Available`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span>{t}</span>
                    {st && st !== "free" ? (
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          st === "booked"
                            ? "bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
                            : "bg-amber-200 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200",
                        ].join(" ")}
                      >
                        {st}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
            <span>
              Business hours: <strong>09:00–18:00</strong> · Timezone:{" "}
              <strong className="font-medium">{timezone}</strong>
            </span>
            {loading ? (
              <span className="inline-flex items-center gap-1">
                <Spinner /> <span>Checking availability…</span>
              </span>
            ) : null}
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackAction}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 ring-1 ring-zinc-300/80 dark:ring-white/15 hover:bg-white/80 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Back
        </button>

        <button
          onClick={() => onNextAction({ dateISO: date, timeISO: time })}
          disabled={!date || !time}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 transition enabled:hover:bg-blue-700 enabled:active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- helpers -------------------------------- */

function isSameDate(dateISO: string, d: Date) {
  const a = new Date(dateISO);
  return (
    a.getFullYear() === d.getFullYear() &&
    a.getMonth() === d.getMonth() &&
    a.getDate() === d.getDate()
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function Legend() {
  return (
    <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1">
        <i className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" /> free
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> held
      </span>
      <span className="inline-flex items-center gap-1">
        <i className="h-2.5 w-2.5 rounded-full bg-zinc-400 inline-block" /> booked
      </span>
    </div>
  );
}
