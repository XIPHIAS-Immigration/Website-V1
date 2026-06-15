import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

type VisitorEventType =
  | "page_view"
  | "cta_click"
  | "engaged"
  | "search"
  | "form_submit"
  | "lead_capture"
  | "programme_assessment";

export type VisitorAnalyticsEvent = {
  id: string;
  type: VisitorEventType;
  visitorId: string;
  sessionId?: string;
  path: string;
  title?: string;
  referrer?: string;
  label?: string;
  href?: string;
  query?: string;
  interests: string[];
  name?: string;
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  countryHint?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type VisitorAnalyticsInput = Partial<Omit<VisitorAnalyticsEvent, "id" | "createdAt" | "interests">> & {
  type?: string;
  interests?: unknown;
  metadata?: unknown;
};

function nowIso() {
  return new Date().toISOString();
}

function analyticsPath() {
  return process.env.XIPHIAS_ANALYTICS_STORE_PATH
    ? path.resolve(process.env.XIPHIAS_ANALYTICS_STORE_PATH)
    : path.join(process.cwd(), ".xiphias-platform", "visitor-analytics.jsonl");
}

function normalizeText(value: unknown, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalizeText(item, 80)).filter(Boolean).slice(0, 12);
}

function normalizeMetadata(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

  try {
    const json = JSON.stringify(value);
    if (!json || json.length > 12000) return undefined;
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).slice(0, 30));
  } catch {
    return undefined;
  }
}

function eventType(value: unknown): VisitorEventType {
  const next = normalizeText(value, 40);
  if (["page_view", "cta_click", "engaged", "search", "form_submit", "lead_capture", "programme_assessment"].includes(next)) {
    return next as VisitorEventType;
  }
  return "page_view";
}

function eventId() {
  return `va_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function headersGet(headers: Headers | undefined, key: string) {
  return headers?.get(key) || "";
}

function clientIp(headers?: Headers) {
  const forwarded = headersGet(headers, "x-forwarded-for").split(",")[0]?.trim();
  return (
    headersGet(headers, "cf-connecting-ip") ||
    headersGet(headers, "x-real-ip") ||
    forwarded ||
    ""
  ).slice(0, 80);
}

function inferInterests(input: VisitorAnalyticsInput) {
  const pathValue = normalizeText(input.path, 240).toLowerCase();
  const query = normalizeText(input.query, 240).toLowerCase();
  const label = normalizeText(input.label, 160).toLowerCase();
  const joined = `${pathValue} ${query} ${label}`;
  const interests = new Set(normalizeArray(input.interests));

  const rules: Array<[RegExp, string]> = [
    [/citizenship|cbi|passport/, "citizenship"],
    [/residency|golden-visa|investor|eb-5|eb5/, "residency"],
    [/skilled|express-entry|work-permit|h-1b|h1b|global-talent/, "skilled migration"],
    [/corporate|l1|business|company|expansion/, "corporate mobility"],
    [/canada/, "Canada"],
    [/usa|united-states|america/, "United States"],
    [/portugal/, "Portugal"],
    [/greece/, "Greece"],
    [/uae|dubai|emirates/, "UAE"],
    [/qatar/, "Qatar"],
    [/egypt/, "Egypt"],
    [/bahrain/, "Bahrain"],
    [/passport-power|passport-index|x-passport/, "passport mobility"],
    [/eligibility|assessment|report/, "assessment"],
    [/topmate|consultation|book/, "consultation"],
  ];

  for (const [pattern, interest] of rules) {
    if (pattern.test(joined)) interests.add(interest);
  }

  return Array.from(interests).slice(0, 12);
}

export async function captureVisitorEvent(input: VisitorAnalyticsInput, headers?: Headers) {
  const visitorId = normalizeText(input.visitorId, 100) || `anon_${eventId()}`;
  const event: VisitorAnalyticsEvent = {
    id: eventId(),
    type: eventType(input.type),
    visitorId,
    sessionId: normalizeText(input.sessionId, 100) || undefined,
    path: normalizeText(input.path, 260) || "/",
    title: normalizeText(input.title, 180) || undefined,
    referrer: normalizeText(input.referrer, 500) || headersGet(headers, "referer") || undefined,
    label: normalizeText(input.label, 180) || undefined,
    href: normalizeText(input.href, 500) || undefined,
    query: normalizeText(input.query, 260) || undefined,
    interests: inferInterests(input),
    name: normalizeText(input.name, 140) || undefined,
    email: normalizeText(input.email, 180).toLowerCase() || undefined,
    phone: normalizeText(input.phone, 60) || undefined,
    ip: clientIp(headers) || undefined,
    userAgent: normalizeText(input.userAgent, 300) || headersGet(headers, "user-agent") || undefined,
    countryHint: headersGet(headers, "cf-ipcountry") || undefined,
    metadata: normalizeMetadata(input.metadata),
    createdAt: nowIso(),
  };

  const filePath = analyticsPath();
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
  } catch (error) {
    console.warn("[x-hub] Could not persist visitor analytics event.", error);
  }
  return event;
}

async function readEvents(limit = 1000) {
  try {
    const raw = await fs.readFile(analyticsPath(), "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    return lines
      .slice(Math.max(0, lines.length - limit))
      .map((line) => {
        try {
          return JSON.parse(line) as VisitorAnalyticsEvent;
        } catch {
          return null;
        }
      })
      .filter((item): item is VisitorAnalyticsEvent => Boolean(item));
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ENOENT") return [];
    throw error;
  }
}

function countBy<T extends string>(values: T[]) {
  const map = new Map<T, number>();
  for (const value of values) map.set(value, (map.get(value) || 0) + 1);
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function dayKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10) || "Unknown";
  return date.toISOString().slice(0, 10);
}

function contactKey(event: VisitorAnalyticsEvent) {
  return (
    event.email ||
    event.phone ||
    event.name ||
    event.visitorId
  ).toLowerCase();
}

export async function getVisitorAnalyticsSummary(limit = 1500) {
  const events = await readEvents(limit);
  const pageViews = events.filter((event) => event.type === "page_view");
  const clicks = events.filter((event) => event.type === "cta_click");
  const contacts = events.filter((event) => event.email || event.phone || event.name);
  const uniqueContacts = new Set(contacts.map(contactKey));
  const eventTypes = countBy(events.map((event) => event.type));
  const dailyEvents = countBy(events.map((event) => dayKey(event.createdAt)))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-14);

  return {
    totals: {
      events: events.length,
      pageViews: pageViews.length,
      clicks: clicks.length,
      knownContacts: contacts.length,
      uniqueKnownContacts: uniqueContacts.size,
      visitors: new Set(events.map((event) => event.visitorId)).size,
      sessions: new Set(events.map((event) => event.sessionId).filter(Boolean)).size,
    },
    eventTypes,
    dailyEvents,
    topPages: countBy(pageViews.map((event) => event.path).filter(Boolean)).slice(0, 10),
    topInterests: countBy(events.flatMap((event) => event.interests)).slice(0, 12),
    topClicks: countBy(clicks.map((event) => event.label || event.href || "Unknown click")).slice(0, 10),
    recentContacts: contacts.slice(-20).reverse(),
    recentEvents: events.slice(-80).reverse(),
    storePath: analyticsPath(),
  };
}
