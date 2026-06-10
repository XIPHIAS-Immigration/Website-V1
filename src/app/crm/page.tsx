import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Headphones, ListChecks, Mail, UsersRound } from "lucide-react";
import CrmShell, { CrmActionLink } from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Panel, StatusPill, money, number } from "@/components/crm/CrmUi";
import { getIndiaDashboard } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "India CRM | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CrmDashboardPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const dashboard = await getIndiaDashboard();

  return (
    <CrmShell
      user={user}
      active="dashboard"
      title="Live Indian CRM operations"
      subtitle="Restored SQL Server data from immigration_com, wired into the new employee CRM shell."
      actions={<CrmActionLink href="/crm/schema">Review data coverage</CrmActionLink>}
    >
      <div className="space-y-5">
        <ErrorNotice message={dashboard.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Clients" value={dashboard.counts.clients} hint="tbl_Client" tone="cyan" />
          <MetricCard label="Documents" value={dashboard.counts.documents} hint="ClientDocs linked" tone="emerald" />
          <MetricCard label="Invoices" value={dashboard.counts.invoices} hint={money(dashboard.finance.invoiceTotal)} tone="amber" />
          <MetricCard label="Receipts" value={dashboard.counts.receipts} hint={money(dashboard.finance.receiptTotal)} tone="slate" />
          <MetricCard label="Client files" value={dashboard.counts.clientFiles} hint="Case file rows" tone="slate" />
          <MetricCard label="Support tickets" value={dashboard.counts.support} hint={`${number(dashboard.counts.openSupport)} open`} tone="cyan" />
          <MetricCard label="Notes" value={dashboard.counts.notes} hint="Staff/client notes" tone="emerald" />
          <MetricCard label="Tasks" value={dashboard.counts.tasks} hint="Task records" tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title="Latest clients"
            eyebrow="Client list"
            action={
              <Link href="/crm/clients" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-300">
                Open all <ArrowRight className="size-4" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Coordinator</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {dashboard.latestClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                      <td className="px-3 py-3">
                        <Link href={`/crm/clients/${client.id}`} className="font-black text-slate-950 hover:text-cyan-700 dark:text-white">
                          {client.name}
                        </Link>
                        <p className="text-xs font-semibold text-slate-500">#{client.id} · Joined {client.joinedOn || "not set"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p>{client.email || "No email"}</p>
                        <p className="text-xs text-slate-500">{client.phone || "No phone"}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{client.coordinators || "Unassigned"}</td>
                      <td className="px-3 py-3">
                        <StatusPill active={client.active} label={client.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel title="Client status mix" eyebrow="Pipeline">
              <div className="space-y-3">
                {dashboard.statusBreakdown.slice(0, 8).map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
                      <span>{item.label}</span>
                      <span>{number(item.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${Math.min(100, (item.value / Math.max(1, dashboard.counts.clients)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Source breakdown" eyebrow="Acquisition">
              <div className="grid gap-2 sm:grid-cols-2">
                {dashboard.sourceBreakdown.slice(0, 8).map((item) => (
                  <div key={item.label} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-xl font-black">{number(item.value)}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Panel title="Recent support" eyebrow="Tickets">
            <div className="space-y-3">
              {dashboard.recentSupport.map((ticket) => (
                <Link key={ticket.id} href={`/crm/clients/${ticket.clientId}`} className="block rounded-md border border-slate-200 p-3 transition hover:border-cyan-200 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <Headphones className="mt-1 size-4 text-cyan-600" />
                    <div>
                      <p className="font-black">{ticket.subject || "No subject"}</p>
                      <p className="mt-1 text-xs text-slate-500">{ticket.client} · {ticket.created || "No date"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Recent tasks" eyebrow="Work queue">
            <div className="space-y-3">
              {dashboard.recentTasks.map((task) => (
                <Link key={`${task.id}-${task.taskId}`} href={`/crm/clients/${task.clientId}`} className="block rounded-md border border-slate-200 p-3 transition hover:border-cyan-200 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <ListChecks className="mt-1 size-4 text-emerald-600" />
                    <div>
                      <p className="font-black">{task.subject || "Task"}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.clientName || `Client #${task.clientId}`} · Due {task.dueDate || "not set"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Module shortcuts" eyebrow="Employee actions">
            <div className="grid gap-3">
              {[
                { href: "/crm/clients", label: "Open client list", icon: UsersRound },
                { href: "/crm/documents", label: "Review uploads", icon: FileText },
                { href: "/crm/communication", label: "Open communication", icon: Mail },
                { href: "/crm/accounts", label: "Check accounts", icon: ArrowRight },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-md border border-slate-200 p-3 font-bold transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4" />
                      {item.label}
                    </span>
                    <ArrowRight className="size-4" />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </CrmShell>
  );
}
