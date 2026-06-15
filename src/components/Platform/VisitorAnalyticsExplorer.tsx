"use client";

import React from "react";
import { Clock3, Search, UserRound } from "lucide-react";

type VisitorEvent = {
  id: string;
  type: string;
  visitorId: string;
  sessionId?: string;
  path: string;
  title?: string;
  label?: string;
  href?: string;
  query?: string;
  interests: string[];
  name?: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type VisitorAnalyticsExplorerProps = {
  events: VisitorEvent[];
  contacts: VisitorEvent[];
  topInterests: { label: string; count: number }[];
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function matches(event: VisitorEvent, query: string, interest: string) {
  const normalized = query.trim().toLowerCase();
  const interestOk = !interest || event.interests.some((item) => item.toLowerCase() === interest.toLowerCase());
  if (!interestOk) return false;
  if (!normalized) return true;

  return [
    event.type,
    event.visitorId,
    event.sessionId,
    event.path,
    event.title,
    event.label,
    event.href,
    event.query,
    event.name,
    event.email,
    event.phone,
    event.metadata ? JSON.stringify(event.metadata) : "",
    ...event.interests,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function metadataText(value: unknown, fallback = "") {
  return typeof value === "string" || typeof value === "number" ? String(value) : fallback;
}

function EventCard({ event }: { event: VisitorEvent }) {
  const bestMatch = event.metadata?.bestMatch && typeof event.metadata.bestMatch === "object"
    ? (event.metadata.bestMatch as Record<string, unknown>)
    : null;
  const completion = metadataText(event.metadata?.completion);
  const mode = metadataText(event.metadata?.mode);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
          {event.type.replaceAll("_", " ")}
        </span>
        <span className="text-xs font-semibold text-slate-500">{formatTime(event.createdAt)}</span>
      </div>
      <p className="mt-2 break-all font-black text-slate-900 dark:text-white">
        {event.label || event.title || event.query || event.path}
      </p>
      <p className="mt-1 break-all text-xs font-semibold text-slate-500">{event.path}</p>
      {event.email || event.phone || event.name ? (
        <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          {[event.name, event.email, event.phone].filter(Boolean).join(" - ")}
        </p>
      ) : null}
      {event.type === "programme_assessment" ? (
        <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50 p-2 text-xs dark:border-blue-900 dark:bg-blue-950/30">
          <p className="font-black text-blue-900 dark:text-blue-100">
            {mode ? `${mode === "deep" ? "Deep assessment" : "Quick explorer"}` : "Programme assessment"}
            {completion ? ` - ${completion}% profile` : ""}
          </p>
          {bestMatch ? (
            <p className="mt-1 text-slate-700 dark:text-slate-200">
              Best match: <span className="font-bold">{metadataText(bestMatch.title, "Route")}</span>
              {metadataText(bestMatch.country) ? `, ${metadataText(bestMatch.country)}` : ""}
              {metadataText(bestMatch.score) ? ` (${metadataText(bestMatch.score)}/100)` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      {event.interests.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {event.interests.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function VisitorAnalyticsExplorer({
  events,
  contacts,
  topInterests,
}: VisitorAnalyticsExplorerProps) {
  const [query, setQuery] = React.useState("");
  const [interest, setInterest] = React.useState("");

  const filteredEvents = React.useMemo(
    () => events.filter((event) => matches(event, query, interest)),
    [events, interest, query],
  );
  const filteredContacts = React.useMemo(
    () => contacts.filter((event) => matches(event, query, interest)),
    [contacts, interest, query],
  );

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Client and visitor interaction</p>
          <h2 className="mt-1 text-xl font-black">Search visitor activity</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Search by email, phone, country, programme, page, button, or interest. Lists stay scrollable so the page does not become heavy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            {filteredEvents.length}/{events.length} events
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
            {filteredContacts.length}/{contacts.length} contacts
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_280px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950"
            placeholder="Search Egypt, UAE, EB-5, email, phone, Topmate..."
          />
        </label>
        <select
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
          className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold outline-none transition focus:border-primary focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950"
        >
          <option value="">All interests</option>
          {topInterests.map((item) => (
            <option key={item.label} value={item.label}>
              {item.label} ({item.count})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" />
            <h3 className="text-lg font-black">Contact-bearing events</h3>
          </div>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {filteredContacts.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {!filteredContacts.length ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500 dark:border-slate-700">
                No matching contact events yet.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Clock3 className="size-5 text-primary" />
            <h3 className="text-lg font-black">Live event feed</h3>
          </div>
          <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {!filteredEvents.length ? (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-500 dark:border-slate-700">
                No matching visitor activity.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}
