"use client";

// src/components/Xia/useXiaCase.ts
// -----------------------------------------------------------------------------
// The client side of the case.
//
// Design rules that matter:
//   * Optimistic. A patch updates local state immediately and syncs in the
//     background, so answering a question never feels like waiting on a server.
//   * Debounced. Typing does not produce one request per keystroke.
//   * Survivable. If the network is down the case still works for the session;
//     the next successful patch catches the server up.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";

import {
  CASE_COOKIE,
  createCase,
  mergeCase,
  type CaseEvent,
  type CaseSource,
  type XiaCase,
} from "@/lib/xia/case";

const ENDPOINT = "/api/xia/case";
const SYNC_DEBOUNCE_MS = 700;
const LOCAL_KEY = "xia_case_snapshot";

function readCookieId() {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CASE_COOKIE}=`))
    ?.split("=")[1];
}

function readSnapshot(): XiaCase | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as XiaCase) : null;
  } catch {
    // Private windows and blocked site data both throw here. Not fatal.
    return null;
  }
}

function writeSnapshot(item: XiaCase) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(item));
  } catch {
    /* storage unavailable — the server copy is the real one anyway */
  }
}

export function useXiaCase(source: CaseSource = "unknown") {
  const [item, setItem] = useState<XiaCase>(() => readSnapshot() ?? createCase(source));
  const [synced, setSynced] = useState(false);
  const pending = useRef<Partial<XiaCase>>({});
  const timer = useRef<number | null>(null);

  // Pull the server's copy once. It wins on first load, because another device
  // or an earlier session may know more than this tab's snapshot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${ENDPOINT}?source=${source}`, { credentials: "same-origin" });
        const data = await response.json();
        if (cancelled || !data?.ok) return;
        setItem(data.case as XiaCase);
        writeSnapshot(data.case as XiaCase);
      } catch {
        /* offline or blocked — carry on with the local copy */
      } finally {
        if (!cancelled) setSynced(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flush = useCallback(async () => {
    const payload = pending.current;
    pending.current = {};
    if (!Object.keys(payload).length) return;
    try {
      const response = await fetch(`${ENDPOINT}?source=${source}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.ok) {
        setItem(data.case as XiaCase);
        writeSnapshot(data.case as XiaCase);
      }
    } catch {
      // Put it back so the next flush retries rather than losing the answer.
      pending.current = { ...payload, ...pending.current };
    }
  }, [source]);

  /** Optimistic write. Local state updates now; the server catches up shortly. */
  const patch = useCallback(
    (fields: Partial<XiaCase> & { event?: { kind: CaseEvent["kind"]; detail?: string } }) => {
      const { event, ...rest } = fields as Partial<XiaCase> & {
        event?: { kind: CaseEvent["kind"]; detail?: string };
      };

      setItem((current) => {
        const next = mergeCase(current, {
          ...rest,
          ...(event ? { events: [{ at: new Date().toISOString(), ...event }] } : {}),
        });
        writeSnapshot(next);
        return next;
      });

      pending.current = { ...pending.current, ...rest, ...(event ? { event } : {}) } as Partial<XiaCase>;

      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void flush(), SYNC_DEBOUNCE_MS);
    },
    [flush],
  );

  /** For a navigation that must not lose the last answer. */
  const patchNow = useCallback(
    async (fields: Partial<XiaCase>) => {
      patch(fields);
      if (timer.current) window.clearTimeout(timer.current);
      await flush();
    },
    [patch, flush],
  );

  // Never lose an answer to a tab close mid-debounce.
  useEffect(() => {
    const onHide = () => {
      if (!Object.keys(pending.current).length) return;
      try {
        navigator.sendBeacon?.(
          `${ENDPOINT}?source=${source}`,
          new Blob([JSON.stringify(pending.current)], { type: "application/json" }),
        );
        pending.current = {};
      } catch {
        /* best effort */
      }
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [source]);

  return { case: item, patch, patchNow, synced, caseId: item.id || readCookieId() };
}
