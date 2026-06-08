import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import StatusPill from "@/components/Platform/StatusPill";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Investment + Migration Tracker | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stages = [
  "intake",
  "documents",
  "due_diligence",
  "strategy",
  "filing",
  "government_review",
  "decision",
  "post_approval",
];

export default async function IMTPage() {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];

  return (
    <PortalShell user={user} active="imt">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Investment + Migration Tracker</h2>
            {activeCase ? (
              <p className="mt-1 text-sm text-slate-500">
                {activeCase.title} - {activeCase.progress}% complete
              </p>
            ) : null}
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              IMT is the case timeline. It shows which stage is complete, where the file is currently sitting, and what still needs staff or client action.
            </p>
          </div>
          {activeCase ? <StatusPill tone="blue">{activeCase.track}</StatusPill> : null}
        </div>

        {activeCase ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            {stages.map((stage) => {
              const current = stage === activeCase.stage;
              const complete = stages.indexOf(stage) < stages.indexOf(activeCase.stage);
              return (
                <div
                  key={stage}
                  className={`rounded-md border p-3 ${
                    current
                      ? "border-primary bg-blue-50 dark:bg-blue-950/40"
                      : complete
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <p className="text-sm font-bold capitalize">{stage.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {current ? "Current stage" : complete ? "Completed" : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">No migration tracker is assigned to this account.</p>
        )}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold">Document progress</h3>
          <div className="mt-4 space-y-3">
            {snapshot.documents.map((doc) => (
              <div key={doc.id} className="flex justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <span className="font-semibold">{doc.label}</span>
                <span className="text-sm text-slate-500">{doc.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-bold">Risk status</h3>
          <div className="mt-4 space-y-3">
            {snapshot.riskProfiles.map((risk) => (
              <div key={risk.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold">Review {risk.id}</span>
                  <StatusPill tone={risk.level === "high" || risk.level === "blocked" ? "red" : risk.level === "medium" ? "amber" : "green"}>
                    {risk.level}
                  </StatusPill>
                </div>
                <ul className="mt-2 list-inside list-disc text-sm text-slate-600 dark:text-slate-300">
                  {risk.flags.map((flag) => (
                    <li key={flag.code}>{flag.label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
