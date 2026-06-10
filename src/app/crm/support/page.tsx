import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquarePlus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Pager, Panel, SearchBox, StatusPill } from "@/components/crm/CrmUi";
import { getIndiaSupport, parseListParams } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Support | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrmSupportPage({ searchParams }: PageProps) {
  const user = await requirePortalUser(["staff", "admin"]);
  const params = parseListParams(await Promise.resolve(searchParams ?? {}));
  const support = await getIndiaSupport(params);
  const open = support.tickets.filter((ticket) => ticket.status === "Open").length;

  return (
    <CrmShell
      user={user}
      active="support"
      title="Support tickets"
      subtitle="Ticket queue from vw_Support, with client links and assignment columns preserved from the old CRM."
      actions={
        <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
          <MessageSquarePlus className="size-4" />
          New ticket
        </button>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={support.error} />

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Matched tickets" value={support.total} hint="vw_Support" tone="cyan" />
          <MetricCard label="Open on page" value={open} hint="Current page status" tone="amber" />
          <MetricCard label="Page size" value={support.pageSize} hint="Rows per page" tone="slate" />
        </div>

        <Panel title="Find tickets" eyebrow="Search">
          <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/crm/support">
            <SearchBox q={support.q} placeholder="Subject, client, type, or client id" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              Search
            </button>
          </form>
        </Panel>

        <Panel title="Ticket queue" eyebrow="Live support">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Ticket</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">Responsible</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {support.tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-3 py-3">
                      <p className="font-black">{ticket.subject || "No subject"}</p>
                      <p className="text-xs text-slate-500">#{ticket.id}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/crm/clients/${ticket.clientId}`} className="font-black hover:text-cyan-700">
                        {ticket.client || `Client #${ticket.clientId}`}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{ticket.type || "-"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{ticket.created || "-"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{ticket.responsible || "Unassigned"}</td>
                    <td className="px-3 py-3"><StatusPill active={ticket.status === "Open"} label={ticket.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pager page={support.page} total={support.total} pageSize={support.pageSize} basePath="/crm/support" query={support.q} />
          </div>
        </Panel>
      </div>
    </CrmShell>
  );
}
