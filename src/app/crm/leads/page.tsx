import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Panel, StatusPill, compactText } from "@/components/crm/CrmUi";
import { getIndiaLeads, valueBool, valueText } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Pre-sales | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CrmLeadsPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const data = await getIndiaLeads();

  return (
    <CrmShell
      user={user}
      active="leads"
      title="Pre-sales and enquiries"
      subtitle="Lead intake, enquiries, callbacks, appointments, and old opportunity-style client rows from the restored Indian CRM."
      actions={
        <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
          <Plus className="size-4" />
          New enquiry
        </button>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={data.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Enquiries" value={data.counts.enquiries} hint="tbl_Enquiry" tone="cyan" />
          <MetricCard label="Opportunity rows" value={data.counts.opportunities} hint="tbl_Opportunities" tone={data.counts.opportunities ? "emerald" : "amber"} />
          <MetricCard label="Appointments" value={data.counts.appointments} hint="Appointment" tone="slate" />
          <MetricCard label="Caller records" value={data.counts.callers} hint="tbl_caller" tone="slate" />
          <MetricCard label="Missed calls" value={data.counts.missedCalls} hint="tbl_MissedCallData" tone="amber" />
        </div>

        <Panel title="Recent enquiries" eyebrow="tbl_Enquiry">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Enquiry</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.enquiries.map((row) => (
                  <tr key={valueText(row, "ID")} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-3 py-3">
                      <p className="font-black">{valueText(row, "NAME") || `Enquiry #${valueText(row, "ID")}`}</p>
                      <p className="text-xs text-slate-500">#{valueText(row, "ID")}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{valueText(row, "EMAIL") || "No email"}</p>
                      <p className="text-xs text-slate-500">{valueText(row, "PHONE") || "No phone"}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{compactText(row.ENQUIRY)}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{valueText(row, "ENT_DATE") || "-"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{valueText(row, "CODE") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Opportunity-style records" eyebrow="vw_OpportunitiesViewList">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.opportunities.map((row) => {
                  const name = [row.FIRST_NAME, row.MIDDLE_NAME, row.LAST_NAME]
                    .map((part) => (typeof part === "string" ? part.trim() : ""))
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={valueText(row, "ID")} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                      <td className="px-3 py-3">
                        <Link href={`/crm/clients/${valueText(row, "ID")}`} className="font-black hover:text-cyan-700">
                          {name || valueText(row, "EMAIL") || `Client #${valueText(row, "ID")}`}
                        </Link>
                        <p className="text-xs text-slate-500">#{valueText(row, "ID")}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{valueText(row, "EMAIL") || "No email"}</p>
                        <p className="text-xs text-slate-500">{valueText(row, "PHONE") || "No phone"}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{valueText(row, "SOURCE") || "-"}</td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{valueText(row, "ASSIGNED_TO") || "Unassigned"}</td>
                      <td className="px-3 py-3"><StatusPill active={valueBool(row, "STATUS")} label={valueText(row, "CLIENT_STATUS")} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </CrmShell>
  );
}
