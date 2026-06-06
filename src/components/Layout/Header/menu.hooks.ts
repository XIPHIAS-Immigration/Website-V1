// --------------------------------------
// 📁 File: src/components/Layout/Header/menu.hooks.ts
// --------------------------------------
import { useEffect, useRef, useState } from 'react';

/**
 * useScrollDirection
 * - Returns direction ('up' | 'down'), y (scrollTop), delta (px since last emit), velocity (px/s),
 *   and convenience booleans atTop/atBottom.
 * - rAF throttled, intent hysteresis to avoid jitter, SSR-safe.
 *
 * Usage:
 *   const { direction, y } = useScrollDirection();               // default threshold=6
 *   const s = useScrollDirection(10);                            // threshold=10
 *   const s = useScrollDirection({ threshold: 8, intentMs: 120 });
 */
type ScrollDir = 'up' | 'down';

type Options = {
  /** Minimum pixel change before emitting (default 6) */
  threshold?: number;
  /** Debounce/intent window in ms to avoid micro-jitters (default 120) */
  intentMs?: number;
};

type Result = {
  direction: ScrollDir;
  y: number;
  delta: number;
  velocity: number; // px per second
  atTop: boolean;
  atBottom: boolean;
};

export function useScrollDirection(
  optionsOrThreshold: number | Options = 6
): Result {
  const opts: Required<Options> =
    typeof optionsOrThreshold === 'number'
      ? { threshold: optionsOrThreshold, intentMs: 120 }
      : {
          threshold: optionsOrThreshold.threshold ?? 6,
          intentMs: optionsOrThreshold.intentMs ?? 120,
        };

  const [state, setState] = useState<Result>({
    direction: 'up',
    y: 0,
    delta: 0,
    velocity: 0,
    atTop: true,
    atBottom: false,
  });

  const lastY = useRef(0);
  const lastTs = useRef(0);
  const lastIntentAt = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // initialize
    lastY.current = window.scrollY || 0;
    lastTs.current = performance.now();

    const onScroll = () => {
      if (raf.current != null) return;
      raf.current = window.requestAnimationFrame(() => {
        raf.current = null;

        const y = window.scrollY || 0;
        const now = performance.now();
        const dy = y - lastY.current;
        const ady = Math.abs(dy);
        const dt = Math.max(1, now - lastTs.current);
        const velocity = (ady / dt) * 1000; // px/s

        // Early update for "atTop/atBottom" even if we don't emit direction change
        const doc = document.documentElement;
        const maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
        const atTop = y <= 0;
        const atBottom = y >= maxY - 1;

        // Intent window to prevent flicker
        const sinceIntent = now - lastIntentAt.current;
        const crossedThreshold = ady >= opts.threshold;

        if (crossedThreshold && sinceIntent >= opts.intentMs) {
          const direction: ScrollDir = dy > 0 ? 'down' : 'up';
          setState({
            direction,
            y,
            delta: ady,
            velocity,
            atTop,
            atBottom,
          });
          lastIntentAt.current = now;
        } else {
          // Still update y/edges if needed without flipping direction
          setState((prev) =>
            prev.y !== y || prev.atTop !== atTop || prev.atBottom !== atBottom
              ? { ...prev, y, atTop, atBottom }
              : prev
          );
        }

        lastY.current = y;
        lastTs.current = now;
      });
    };

    const onVis = () => {
      // reset timers after tab switching to avoid huge velocity spikes
      lastY.current = window.scrollY || 0;
      lastTs.current = performance.now();
      lastIntentAt.current = performance.now();
    };

    // Run once to sync initial state
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [opts.threshold, opts.intentMs]);

  return state;
}
