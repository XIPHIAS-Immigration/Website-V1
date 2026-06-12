"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

type TrackPayload = {
  type: "page_view" | "cta_click" | "engaged" | "search";
  path: string;
  title?: string;
  referrer?: string;
  label?: string;
  href?: string;
  query?: string;
  interests?: string[];
};

const visitorKey = "xiphias_visitor_id";
const sessionKey = "xiphias_session_id";

function getId(key: string, prefix: string) {
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const next = `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(key, next);
    return next;
  } catch {
    return `${prefix}_${Date.now().toString(36)}`;
  }
}

function interestHints(pathname: string, query: string) {
  const joined = `${pathname} ${query}`.toLowerCase();
  return [
    ["citizenship", /citizenship|passport|cbi/],
    ["residency", /residency|golden|investor|eb-5|eb5/],
    ["skilled migration", /skilled|work|express|h-1b|h1b/],
    ["corporate mobility", /corporate|business|l1|company/],
    ["assessment", /eligibility|assessment|report/],
    ["consultation", /consultation|book|topmate/],
  ]
    .filter(([, pattern]) => (pattern as RegExp).test(joined))
    .map(([label]) => label as string);
}

export default function VisitorAnalyticsTracker() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const query = searchParams?.toString() || "";

  const send = React.useCallback(
    (payload: TrackPayload) => {
      const body = JSON.stringify({
        visitorId: getId(visitorKey, "vis"),
        sessionId: getId(sessionKey, "ses"),
        userAgent: window.navigator.userAgent,
        ...payload,
      });

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/platform/visitor/track", blob);
        return;
      }

      void fetch("/api/platform/visitor/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    },
    [],
  );

  React.useEffect(() => {
    const path = query ? `${pathname}?${query}` : pathname;
    const timer = window.setTimeout(() => {
      send({
        type: query ? "search" : "page_view",
        path,
        title: document.title,
        referrer: document.referrer,
        query,
        interests: interestHints(pathname, query),
      });
    }, 700);

    const engagedTimer = window.setTimeout(() => {
      send({
        type: "engaged",
        path,
        title: document.title,
        query,
        interests: interestHints(pathname, query),
      });
    }, 20000);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(engagedTimer);
    };
  }, [pathname, query, send]);

  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest("a,button") as HTMLElement | null;
      if (!interactive) return;

      const label = interactive.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) || interactive.getAttribute("aria-label") || "Interaction";
      const href = interactive instanceof HTMLAnchorElement ? interactive.href : interactive.getAttribute("data-href") || undefined;

      send({
        type: "cta_click",
        path: query ? `${pathname}?${query}` : pathname,
        title: document.title,
        label,
        href,
        query,
        interests: interestHints(pathname, `${query} ${label} ${href || ""}`),
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname, query, send]);

  return null;
}
