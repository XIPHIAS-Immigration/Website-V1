import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Pager, Panel, SearchBox, StatusPill, number } from "@/components/crm/CrmUi";
import { getIndiaClients, parseListParams } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Clients | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrmClientsPage({ searchParams }: PageProps) {
  const user = await requirePortalUser(["staff", "admin"]);
  const params = parseListParams(await Promise.resolve(searchParams ?? {}));
  const result = await getIndiaClients(params);
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const hasFilters = Boolean(result.q || result.status);

  return (
    <CrmShell
      user={user}
      active="clients"
      title="Client list"
      subtitle="Search and open the restored Indian CRM client records. Detail pages pull profile, documents, accounts, support, notes, tasks, and case updates together."
      actions={
        <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
          <Plus className="size-4" />
          New client
        </button>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={result.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={hasFilters ? "Filtered SQL clients" : "Live SQL clients"} value={result.total} hint="dbo.vw_ClientList" tone="cyan" />
          <MetricCard label="Visible rows now" value={result.clients.length} hint={`Page size ${number(result.pageSize)}`} tone="slate" />
          <MetricCard label="Current page" value={`${number(result.page)} / ${number(totalPages)}`} hint="Use pager for the full list" tone="emerald" />
          <MetricCard label="Status buckets" value={result.statuses.length} hint="Legacy client statuses" tone="amber" />
        </div>

        <Panel
          title="Find clients"
          eyebrow="Search"
          action={
            hasFilters ? (
              <Link href="/crm/clients" className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-800 dark:text-slate-200">
                Clear filters
              </Link>
            ) : null
          }
        >
          <form className="grid gap-3 lg:grid-cols-[1fr_240px_auto]" action="/crm/clients">
            <SearchBox q={result.q} placeholder="Name, email, phone, or client id" />
            <select
              name="status"
              defaultValue={result.status}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All statuses</option>
              {result.statuses.map((status) => (
                <option key={status.label} value={status.label === "Unknown" ? "" : status.label}>
                  {status.label} ({number(status.value)})
                </option>
              ))}
            </select>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              Search
            </button>
          </form>
        </Panel>

        <Panel
          title="Clients"
          eyebrow="Live records"
          action={
            <span className="rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200">
              Showing {number(result.clients.length)} of {number(result.total)}
            </span>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">Coordinator</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {result.clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-3 py-3">
                      <p className="font-black text-slate-950 dark:text-white">{client.name}</p>
                      <p className="text-xs font-semibold text-slate-500">#{client.id}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p>{client.email || "No email"}</p>
                      <p className="text-xs text-slate-500">{client.phone || "No phone"}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{client.coordinators || "Unassigned"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{client.joinedOn || "Not set"}</td>
                    <td className="px-3 py-3">
                      <StatusPill active={client.active} label={client.status} />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/crm/clients/${client.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800 hover:bg-cyan-100 dark:border-cyan-900/60 dark:bg-cyan-950/30 dark:text-cyan-200"
                      >
                        Profile <ArrowRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pager page={result.page} total={result.total} pageSize={result.pageSize} basePath="/crm/clients" query={result.q} params={{ status: result.status }} />
          </div>
        </Panel>
      </div>
    </CrmShell>
  );
}
