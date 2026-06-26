"use client";

import { useEffect, useState } from "react";

/**
 * True on devices where heavy WebGL / continuous rAF work should be avoided:
 * phones & small tablets (≤1024px), touch/coarse-pointer devices, low CPU
 * core counts, or when the user has Data Saver on. SSR-safe — returns `false`
 * until mounted so the server and first client render agree (the caller should
 * already render a static fallback pre-hydration).
 */
export function useLowPowerDevice(): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const queries = [
      window.matchMedia("(max-width: 1024px)"),
      window.matchMedia("(pointer: coarse)"),
    ];
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8;
    const saveData =
      typeof navigator !== "undefined" &&
      (navigator as { connection?: { saveData?: boolean } }).connection?.saveData === true;

    const update = () => {
      const constrained = queries.some((q) => q.matches);
      setLow(constrained || cores <= 4 || saveData);
    };

    update();
    queries.forEach((q) => q.addEventListener("change", update));
    return () => queries.forEach((q) => q.removeEventListener("change", update));
  }, []);

  return low;
}

/** True on touch / coarse-pointer devices. SSR-safe (false until mounted). */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}
