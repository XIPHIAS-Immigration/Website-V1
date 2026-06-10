import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, MetricCard, Pager, Panel, SearchBox, StatusPill } from "@/components/crm/CrmUi";
import { getIndiaTasks, parseListParams } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Tasks | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrmTasksPage({ searchParams }: PageProps) {
  const user = await requirePortalUser(["staff", "admin"]);
  const params = parseListParams(await Promise.resolve(searchParams ?? {}));
  const data = await getIndiaTasks(params);
  const openOnPage = data.tasks.filter((task) => !task.done).length;

  return (
    <CrmShell
      user={user}
      active="tasks"
      title="Tasks and work queue"
      subtitle="Task logs and active task counts from the restored Indian CRM work-tracking tables."
      actions={
        <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
          <Plus className="size-4" />
          New task
        </button>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={data.error} />

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Matched log rows" value={data.total} hint="vw_TaskLog" tone="cyan" />
          <MetricCard label="Open tasks" value={data.openTasks} hint="tbl_Tasks" tone="amber" />
          <MetricCard label="Open on page" value={openOnPage} hint="Current page" tone="slate" />
        </div>

        <Panel title="Find tasks" eyebrow="Search">
          <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/crm/tasks">
            <SearchBox q={data.q} placeholder="Subject, note, assignee, or client id" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              Search
            </button>
          </form>
        </Panel>

        <Panel title="Task log" eyebrow="Live queue">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Assigned</th>
                  <th className="px-3 py-2">Done</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.tasks.map((task) => (
                  <tr key={`${task.id}-${task.taskId}`} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-3 py-3">
                      <p className="font-black">{task.subject || "Task"}</p>
                      <p className="max-w-md truncate text-xs text-slate-500">{task.note || "No note"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/crm/clients/${task.clientId}`} className="font-black hover:text-cyan-700">
                        {task.clientName || `Client #${task.clientId}`}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{task.dueDate || "-"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                      <p>{task.assignedTo || "Unassigned"}</p>
                      <p className="text-xs text-slate-500">By {task.assignedBy || "-"}</p>
                    </td>
                    <td className="px-3 py-3"><StatusPill active={task.done} label={task.done ? "Done" : "Open"} /></td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{task.status || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pager page={data.page} total={data.total} pageSize={data.pageSize} basePath="/crm/tasks" query={data.q} />
          </div>
        </Panel>
      </div>
    </CrmShell>
  );
}
