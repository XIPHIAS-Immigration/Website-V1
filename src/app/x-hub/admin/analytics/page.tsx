import type { Metadata } from "next";
import type { ComponentType } from "react";
import { BarChart3, Clock3, MousePointerClick, Search, UsersRound } from "lucide-react";

import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { getVisitorAnalyticsSummary } from "@/lib/platform/visitor-analytics";

export const metadata: Metadata = {
  title: "Site Analytics | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <span className="rounded-md bg-blue-50 p-2 text-primary dark:bg-blue-950/40">
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </article>
  );
}

function RankedList({ title, items }: { title: string; items: { label: string; count: number }[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <span className="min-w-0 truncate text-sm font-semibold text-slate-700 dark:text-slate-200" title={item.label}>
                {item.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {item.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No activity recorded yet.</p>
        )}
      </div>
    </section>
  );
}

export default async function AnalyticsPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const summary = await getVisitorAnalyticsSummary();
  const snapshot = getPlatformRepository().snapshotForUser(user);

  return (
    <PortalShell user={user} active="analytics">
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Visitor intelligence</p>
        <h2 className="mt-1 text-xl font-bold">Site activity and captured intent</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Tracks public page visits, CTA clicks, engagement, search/query interest, and lead/contact capture into the server runtime store.
        </p>
        <p className="mt-2 break-all text-xs text-slate-500">Store: {summary.storePath}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Visitors" value={summary.totals.visitors} hint={`${summary.totals.sessions} tracked sessions`} icon={UsersRound} />
        <MetricCard label="Page views" value={summary.totals.pageViews} hint={`${summary.totals.events} total tracked events`} icon={BarChart3} />
        <MetricCard label="CTA clicks" value={summary.totals.clicks} hint="Buttons and links clicked on public pages" icon={MousePointerClick} />
        <MetricCard label="Known contacts" value={snapshot.leads.length + summary.totals.knownContacts} hint={`${snapshot.leads.length} lead records in X-Hub`} icon={Search} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <RankedList title="Top pages" items={summary.topPages} />
        <RankedList title="Top interests" items={summary.topInterests} />
        <RankedList title="Top clicks" items={summary.topClicks} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold">Recent known contacts</h2>
          <div className="mt-4 space-y-3">
            {[...summary.recentContacts].slice(0, 10).map((event) => (
              <article key={event.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{event.name || event.email || event.phone || "Known visitor"}</p>
                    <p className="mt-1 truncate text-slate-500">{[event.email, event.phone].filter(Boolean).join(" - ")}</p>
                    <p className="mt-1 truncate text-slate-500">{event.path}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                    {event.type.replaceAll("_", " ")}
                  </span>
                </div>
              </article>
            ))}
            {!summary.recentContacts.length ? <p className="text-sm text-slate-500">No contact-enriched visitor event yet.</p> : null}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Clock3 className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Live event feed</h2>
          </div>
          <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {summary.recentEvents.map((event) => (
              <article key={event.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
                    {event.type.replaceAll("_", " ")}
                  </span>
                  <span className="text-xs text-slate-500">{formatTime(event.createdAt)}</span>
                </div>
                <p className="mt-2 break-all font-semibold">{event.label || event.title || event.path}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{event.path}</p>
                {event.interests.length ? (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.interests.map((interest) => (
                      <span key={interest} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
            {!summary.recentEvents.length ? <p className="text-sm text-slate-500">No events recorded yet.</p> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
