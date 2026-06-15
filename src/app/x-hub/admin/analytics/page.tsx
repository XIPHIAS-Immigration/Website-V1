import type { Metadata } from "next";
import type { ComponentType } from "react";
import { BarChart3, MousePointerClick, Search, UsersRound } from "lucide-react";

import PortalShell from "@/components/Platform/PortalShell";
import AnalyticsDashboardPreview from "@/components/Platform/AnalyticsDashboardPreview";
import LeadManagementPanel from "@/components/Platform/LeadManagementPanel";
import VisitorAnalyticsExplorer from "@/components/Platform/VisitorAnalyticsExplorer";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { getVisitorAnalyticsSummary } from "@/lib/platform/visitor-analytics";

export const metadata: Metadata = {
  title: "Site Analytics | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function countValues(values: Array<string | undefined | null>) {
  const map = new Map<string, number>();
  for (const value of values) {
    const label = value?.trim();
    if (!label) continue;
    map.set(label, (map.get(label) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function leadDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10) || "Unknown";
  return date.toISOString().slice(0, 10);
}

function leadSourceLabel(value: string) {
  return value.replaceAll("_", " ");
}

function LeadTrendChart({ items }: { items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Lead submission trend</h2>
          <p className="mt-1 text-sm text-slate-500">Daily people captured into X-Hub lead records.</p>
        </div>
        <span className="text-xs font-bold text-slate-500">{items.reduce((sum, item) => sum + item.count, 0)} leads</span>
      </div>
      <div className="mt-4 flex h-44 items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        {items.length ? (
          items.map((item) => (
            <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
              <span className="truncate text-center text-[10px] font-black text-slate-500">{item.count}</span>
              <div className="flex h-28 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-[#1553af] via-[#4d77a6] to-[#d8b848] shadow-sm"
                  style={{ height: `${Math.max(14, Math.round((item.count / max) * 100))}%` }}
                  title={`${item.label}: ${item.count}`}
                />
              </div>
              <span className="w-full truncate text-center text-[10px] font-bold text-slate-500">{item.label.slice(5)}</span>
            </div>
          ))
        ) : (
          <div className="flex w-full items-center justify-center text-sm font-semibold text-slate-500">
            Lead trend appears once forms are submitted.
          </div>
        )}
      </div>
    </section>
  );
}

export default async function AnalyticsPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const summary = await getVisitorAnalyticsSummary();
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const leadSources = countValues(snapshot.leads.map((lead) => leadSourceLabel(lead.source)));
  const leadStatuses = countValues(snapshot.leads.map((lead) => lead.status));
  const leadCountries = countValues(snapshot.leads.map((lead) => lead.country)).slice(0, 10);
  const leadPrograms = countValues(snapshot.leads.map((lead) => lead.program || lead.track)).slice(0, 10);
  const leadDaily = countValues(snapshot.leads.map((lead) => leadDay(lead.createdAt)))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(-14);

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
        <MetricCard label="Visitor IDs" value={summary.totals.visitors} hint={`${summary.totals.sessions} tracked sessions`} icon={UsersRound} />
        <MetricCard label="Page views" value={summary.totals.pageViews} hint={`${summary.totals.events} total tracked events`} icon={BarChart3} />
        <MetricCard label="CTA clicks" value={summary.totals.clicks} hint="Buttons and links clicked on public pages" icon={MousePointerClick} />
        <MetricCard label="Lead records" value={snapshot.leads.length} hint={`${summary.totals.uniqueKnownContacts} contact analytics events`} icon={Search} />
      </div>

      <AnalyticsDashboardPreview
        visitors={summary.totals.visitors}
        sessions={summary.totals.sessions}
        pageViews={summary.totals.pageViews}
        clicks={summary.totals.clicks}
        leads={snapshot.leads.length}
        knownContacts={summary.totals.uniqueKnownContacts}
        topInterests={summary.topInterests}
        dailyEvents={summary.dailyEvents}
        showOpenButton={false}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.75fr_0.75fr]">
        <LeadTrendChart items={leadDaily} />
        <RankedList title="Lead sources" items={leadSources} />
        <RankedList title="Lead statuses" items={leadStatuses} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <RankedList title="Lead countries" items={leadCountries} />
        <RankedList title="Lead programme signals" items={leadPrograms} />
      </div>

      <LeadManagementPanel leads={snapshot.leads} />

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <RankedList title="Top pages" items={summary.topPages} />
        <RankedList title="Top interests" items={summary.topInterests} />
        <RankedList title="Top clicks" items={summary.topClicks} />
      </div>

      <VisitorAnalyticsExplorer
        events={summary.recentEvents}
        contacts={summary.recentContacts}
        topInterests={summary.topInterests}
      />
    </PortalShell>
  );
}
