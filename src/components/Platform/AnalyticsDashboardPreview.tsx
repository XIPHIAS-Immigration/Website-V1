import Link from "next/link";
import type { ComponentType } from "react";
import { BarChart3, MousePointerClick, Search, UsersRound } from "lucide-react";

type CountItem = {
  label: string;
  count: number;
};

type AnalyticsDashboardPreviewProps = {
  visitors: number;
  sessions: number;
  pageViews: number;
  clicks: number;
  leads: number;
  knownContacts: number;
  topInterests: CountItem[];
  dailyEvents: CountItem[];
};

function maxCount(items: CountItem[]) {
  return Math.max(1, ...items.map((item) => item.count));
}

function MiniMetric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{hint}</p>
        </div>
        <span className="rounded-lg bg-blue-50 p-2 text-primary dark:bg-blue-950/40">
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}

function BarList({ items }: { items: CountItem[] }) {
  const max = maxCount(items);
  return (
    <div className="space-y-3">
      {items.length ? (
        items.slice(0, 6).map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold">
              <span className="truncate text-slate-700 dark:text-slate-200">{item.label}</span>
              <span className="text-slate-500">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary to-[#d8b848]"
                style={{ width: `${Math.max(8, Math.round((item.count / max) * 100))}%` }}
              />
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm font-semibold text-slate-500">No visitor data yet.</p>
      )}
    </div>
  );
}

function DailyBars({ items }: { items: CountItem[] }) {
  const max = maxCount(items);
  return (
    <div className="flex h-36 items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      {items.length ? (
        items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary to-[#d8b848]"
              style={{ height: `${Math.max(10, Math.round((item.count / max) * 100))}%` }}
              title={`${item.label}: ${item.count}`}
            />
            <span className="w-full truncate text-center text-[10px] font-bold text-slate-500">
              {item.label.slice(5)}
            </span>
          </div>
        ))
      ) : (
        <div className="flex w-full items-center justify-center text-sm font-semibold text-slate-500">
          Activity graph will appear as visitors use the site.
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboardPreview({
  visitors,
  sessions,
  pageViews,
  clicks,
  leads,
  knownContacts,
  topInterests,
  dailyEvents,
}: AnalyticsDashboardPreviewProps) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Live site intelligence</p>
          <h2 className="mt-1 text-xl font-black">Visitor and lead activity</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Dashboard summary only. Open Site Analytics for searchable visitor details.
          </p>
        </div>
        <Link
          href="/x-hub/admin/analytics"
          className="rounded-lg bg-primary px-3 py-2 text-sm font-black text-white transition hover:bg-blue-800"
        >
          Open analytics
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="People" value={visitors} hint={`${sessions} sessions tracked`} icon={UsersRound} />
        <MiniMetric label="Leads" value={leads} hint={`${knownContacts} known visitor events`} icon={Search} />
        <MiniMetric label="Page views" value={pageViews} hint="Public page visits" icon={BarChart3} />
        <MiniMetric label="CTA clicks" value={clicks} hint="Buttons and links clicked" icon={MousePointerClick} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">14-day activity</h3>
            <span className="text-xs font-bold text-slate-500">{dailyEvents.reduce((sum, item) => sum + item.count, 0)} events</span>
          </div>
          <DailyBars items={dailyEvents} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">Interest signals</h3>
            <span className="text-xs font-bold text-slate-500">{topInterests.length} categories</span>
          </div>
          <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <BarList items={topInterests} />
          </div>
        </div>
      </div>
    </section>
  );
}
