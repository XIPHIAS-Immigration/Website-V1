import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  FolderGit2,
  Layers3,
  Mail,
  ShieldCheck,
} from "lucide-react";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";
import {
  legacyCrmConversionPhases,
  legacyCrmModules,
  legacyCrmSchemaGroups,
  legacyCrmSources,
} from "@/lib/crm/legacy-map";

export const metadata: Metadata = {
  title: "CRM Migration Console | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function priorityLabel(priority: string) {
  if (priority === "p1") return "Priority 1";
  if (priority === "p2") return "Priority 2";
  return "Later";
}

function priorityClass(priority: string) {
  if (priority === "p1") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (priority === "p2") return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function statusClass(status: string) {
  if (status === "mapped") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "ready-next") return "border-blue-200 bg-blue-50 text-blue-800";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function statusIcon(status: string) {
  if (status === "mapped") return CheckCircle2;
  if (status === "ready-next") return ArrowRight;
  return AlertTriangle;
}

export default async function CrmMigrationPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const totalControllers = legacyCrmModules.reduce((sum, item) => sum + item.controllers, 0);
  const totalViews = legacyCrmModules.reduce((sum, item) => sum + item.views, 0);
  const p1Modules = legacyCrmModules.filter((item) => item.migrationPriority === "p1");

  return (
    <PortalShell user={user} active="crm">
      <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm dark:border-slate-800">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">CRM conversion cockpit</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">
              Legacy CRM mapped for a Next.js rebuild
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              This console tracks the old ASP.NET CRM modules, schema evidence, and the safest conversion order into the modern XIPHIAS platform.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Modules</p>
              <p className="mt-2 text-3xl font-bold">{legacyCrmModules.length}</p>
            </div>
            <div className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Controllers</p>
              <p className="mt-2 text-3xl font-bold">{totalControllers}</p>
            </div>
            <div className="rounded-md border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Views</p>
              <p className="mt-2 text-3xl font-bold">{totalViews}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FolderGit2 className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Source map</p>
              <h3 className="mt-1 text-xl font-bold">Which CRM folder matters</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                The conversion should start from the Visual Studio source tree, while deployment snapshots are used only for validation.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {legacyCrmSources.map((source) => (
              <article key={source.path} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold">{source.path}</h4>
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-bold uppercase text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {source.role.replace("-", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{source.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <Database className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Database status</p>
              <h3 className="mt-1 text-xl font-bold">Schema is mapped, exact DB is still needed</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                EDMX files expose the table/view map, but the full Prisma migration needs a SQL Server backup, read-only DB access, or generated schema and procedure scripts.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">EDMX models</p>
              <p className="mt-2 text-2xl font-bold">2</p>
              <p className="mt-1 text-xs text-slate-500">81 + 311 entity maps</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">DB export</p>
              <p className="mt-2 text-2xl font-bold">Missing</p>
              <p className="mt-1 text-xs text-slate-500">No .bak/.mdf found</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stored procs</p>
              <p className="mt-2 text-2xl font-bold">70+</p>
              <p className="mt-1 text-xs text-slate-500">Need definitions</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Port order</p>
            <h3 className="mt-1 text-xl font-bold">Start with the modules that connect to the website</h3>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-800">
            {p1Modules.length} priority modules
          </span>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {legacyCrmModules.map((module) => (
            <article
              key={module.area}
              className="group rounded-lg border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-slate-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-bold">{module.area}</h4>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {module.controllers} controllers - {module.views} views
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(module.migrationPriority)}`}>
                  {priorityLabel(module.migrationPriority)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{module.responsibility}</p>
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Modern target</p>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{module.target}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Layers3 className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Hub linkage</p>
              <h3 className="mt-1 text-xl font-bold">Legacy tables mapped to modern profiles</h3>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {legacyCrmSchemaGroups.map((group) => (
              <article key={group.label} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-bold">{group.label}</h4>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {group.hubLink}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{group.tables.join(", ")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Conversion state</p>
              <h3 className="mt-1 text-xl font-bold">What is ready and what is blocked</h3>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {legacyCrmConversionPhases.map((phase) => {
              const Icon = statusIcon(phase.status);
              return (
                <article key={phase.title} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`flex size-9 items-center justify-center rounded-md border ${statusClass(phase.status)}`}>
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <h4 className="font-bold">{phase.title}</h4>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {phase.status.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{phase.detail}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm leading-6">
                SMTP and SMS modules are present in the legacy CRM. During migration, credentials must move to deployment env vars or secret storage; only templates and logs should live in the database.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
