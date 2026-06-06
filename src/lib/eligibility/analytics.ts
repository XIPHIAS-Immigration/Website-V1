// src/lib/eligibility/analytics.ts

type EventParams = Record<string, unknown>;
type Transport = "beacon" | "image" | "xhr";

interface TrackOptions {
  /** If provided, the same key will only fire once per page load */
  onceKey?: string;
  /** Hint for GA transport type */
  transport?: Transport;
}

const isBrowser = typeof window !== "undefined";
const onceCache = new Set<string>();

type Queued = { name: string; params: EventParams; options?: TrackOptions };
const queue: Queued[] = [];

function hasSender(): boolean {
  if (!isBrowser) return false;
  const w = window as any;
  return Boolean(w.gtag || w.dataLayer || w.fbq);
}

function sendNow(name: string, params: EventParams, options?: TrackOptions) {
  const w = window as any;
  const payload: EventParams = { ...params };
  if (options?.transport) payload.transport_type = options.transport;

  // GA4 (gtag)
  if (w.gtag) {
    try {
      w.gtag("event", name, payload);
    } catch {}
  }

  // GTM (dataLayer)
  if (w.dataLayer) {
    try {
      w.dataLayer.push({ event: name, ...payload });
    } catch {}
  }

  // Optional: Meta Pixel custom events if fbq exists
  if (w.fbq) {
    try {
      w.fbq("trackCustom", name, payload);
    } catch {}
  }
}

function flushQueue() {
  if (!hasSender()) return;
  while (queue.length) {
    const e = queue.shift()!;
    sendNow(e.name, e.params, e.options);
  }
}

/**
 * Track a custom analytics event.
 * Returns true if the event was queued/sent.
 */
export function trackEvent(
  name: string,
  params: EventParams = {},
  options?: TrackOptions
): boolean {
  if (!isBrowser) return false;

  // de-dupe if requested
  if (options?.onceKey) {
    if (onceCache.has(options.onceKey)) return false;
    onceCache.add(options.onceKey);
  }

  // lightweight auto context
  const base: EventParams = {
    ts: Date.now(),
    path: location.pathname + location.search,
  };
  const payload = { ...base, ...params };

  if (hasSender()) {
    sendNow(name, payload, options);
  } else {
    // queue until GA/GTM is available
    queue.push({ name, params: payload, options });
    // try flushing on load and shortly after
    window.addEventListener("load", flushQueue, { once: true });
    setTimeout(flushQueue, 1000);
  }

  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, payload);
  }

  return true;
}

/** Fire a page_view (useful on client-side route changes) */
export function trackPageView(title?: string) {
  if (!isBrowser) return;
  const w = window as any;
  const params = {
    page_title: title ?? document.title,
    page_location: location.href,
    page_path: location.pathname + location.search,
  };
  if (w.gtag) w.gtag("event", "page_view", params);
  if (w.dataLayer) w.dataLayer.push({ event: "page_view", ...params });
}

/** Set/merge user properties for GA/GTM dashboards */
export function setUser(id?: string, props: EventParams = {}) {
  if (!isBrowser) return;
  const w = window as any;
  if (w.gtag) w.gtag("set", "user_properties", props);
  if (w.dataLayer) w.dataLayer.push({ userId: id, userProps: props });
}

/** Update consent mode for GA (optional) */
export function consent(mode: "granted" | "denied") {
  if (!isBrowser) return;
  const w = window as any;
  try {
    if (w.gtag && typeof w.gtag === "function") {
      w.gtag("consent", "update", {
        ad_storage: mode,
        analytics_storage: mode,
      });
    }
  } catch {}
}
