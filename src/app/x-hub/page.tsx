import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import MetricCard from "@/components/Platform/MetricCard";
import StatusPill from "@/components/Platform/StatusPill";
import DocumentUploadForm from "@/components/Platform/DocumentUploadForm";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "X-Hub | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusTone(status: string) {
  if (["accepted", "complete", "qualified", "approved"].includes(status)) return "green" as const;
  if (["reviewing", "active", "screening", "triage"].includes(status)) return "blue" as const;
  if (["rework", "blocked", "high"].includes(status)) return "red" as const;
  return "amber" as const;
}

export default async function XHubPage() {
  const user = await requirePortalUser();
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const activeDocs = activeCase ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id) : [];
  const activeMilestones = activeCase ? snapshot.milestones.filter((item) => item.caseId === activeCase.id) : [];

  return (
    <PortalShell user={user} active="dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Cases" value={snapshot.cases.length} hint="Active migration files" />
        <MetricCard label="Documents" value={activeDocs.length} hint="Checklist items" />
        <MetricCard label="Leads" value={snapshot.leads.length} hint="Visible pipeline" />
        <MetricCard label="Risk reviews" value={snapshot.riskProfiles.length} hint="Staff-reviewed flags" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Primary case</h2>
              {activeCase ? (
                <p className="mt-1 text-sm text-slate-500">
                  {activeCase.country} - {activeCase.program}
                </p>
              ) : null}
            </div>
            {activeCase ? <StatusPill tone={statusTone(activeCase.stage)}>{activeCase.stage.replaceAll("_", " ")}</StatusPill> : null}
          </div>

          {activeCase ? (
            <div className="mt-5">
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${activeCase.progress}%` }} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Advisor</p>
                  <p className="mt-1 font-bold">{activeCase.advisorName}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Next action</p>
                  <p className="mt-1 font-bold">{activeCase.nextAction}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">No active cases are assigned to this account.</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Documents</h2>
          <div className="mt-4 space-y-3">
            {activeDocs.map((doc) => (
              <div key={doc.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{doc.label}</p>
                    <p className="text-sm text-slate-500">
                      {doc.category}
                      {doc.fileName ? ` - ${doc.fileName}` : ""}
                    </p>
                    {doc.notes ? <p className="mt-1 text-xs text-slate-500">{doc.notes}</p> : null}
                  </div>
                  <StatusPill tone={statusTone(doc.status)}>{doc.status}</StatusPill>
                </div>
                {["requested", "rework"].includes(doc.status) ? <DocumentUploadForm document={doc} /> : null}
              </div>
            ))}
            {!activeDocs.length ? <p className="text-sm text-slate-500">No document items visible.</p> : null}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold">Milestones</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {activeMilestones.map((milestone) => (
            <article key={milestone.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">{milestone.title}</h3>
                <StatusPill tone={statusTone(milestone.status)}>{milestone.status}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{milestone.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
