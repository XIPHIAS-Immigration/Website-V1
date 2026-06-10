import type { Metadata } from "next";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Panel, StatusPill, number } from "@/components/crm/CrmUi";
import { getIndiaCoverage } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Data Map | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusLabel(status: "live" | "partial" | "missing") {
  if (status === "live") return "Live";
  if (status === "partial") return "Partial";
  return "Missing";
}

export default async function CrmSchemaPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const coverage = await getIndiaCoverage();

  return (
    <CrmShell
      user={user}
      active="schema"
      title="Indian CRM data coverage"
      subtitle="A live coverage check against immigration_com so we know which old tables, views, procedures, and folders already have a place in the Next CRM."
    >
      <div className="space-y-5">
        <ErrorNotice message={coverage.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Tables" value={coverage.totals.tables} hint="User tables" tone="cyan" />
          <MetricCard label="Views" value={coverage.totals.views} hint="Legacy joins/business views" tone="emerald" />
          <MetricCard label="Procedures" value={coverage.totals.procedures} hint="Old write/function surface" tone="amber" />
          <MetricCard label="Triggers" value={coverage.totals.triggers} hint="DB-side automation" tone="slate" />
        </div>

        <div className="grid gap-5">
          {coverage.modules.map((module) => (
            <Panel
              key={module.module}
              title={module.module}
              eyebrow="Coverage"
              action={<StatusPill active={module.status === "live"} label={statusLabel(module.status)} />}
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_0.7fr]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Table</th>
                        <th className="px-3 py-2">Rows</th>
                        <th className="px-3 py-2">Columns</th>
                        <th className="px-3 py-2">In Next CRM</th>
                        <th className="px-3 py-2">Use</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {module.tables.map((table) => (
                        <tr key={table.table} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                          <td className="px-3 py-3 font-black">{table.table}</td>
                          <td className="px-3 py-3">{number(table.rows)}</td>
                          <td className="px-3 py-3">{number(table.columns)}</td>
                          <td className="px-3 py-3">
                            <StatusPill active={table.usedInNext} label={table.usedInNext ? "Mapped" : "Protected / pending"} />
                          </td>
                          <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{table.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Legacy SQL functions/views used for parity</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {module.functions.map((fn) => (
                      <span key={fn} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </CrmShell>
  );
}
