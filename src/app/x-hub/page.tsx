import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileSearch,
  FileUp,
  Gauge,
  Globe2,
  Orbit,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import PortalShell from "@/components/Platform/PortalShell";
import MetricCard from "@/components/Platform/MetricCard";
import StatusPill from "@/components/Platform/StatusPill";
import DocumentUploadForm from "@/components/Platform/DocumentUploadForm";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import type { PortalRole } from "@/lib/platform/types";

export const metadata: Metadata = {
  title: "XIPHIAS Hub | XIPHIAS Immigration",
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

type FeatureCard = {
  href: string;
  title: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: PortalRole[];
};

const featureCards: FeatureCard[] = [
  {
    href: "/x-hub/profile",
    title: "Client Profile",
    label: "Single record",
    description: "Links the portal user to one editable client profile, active cases, documents, milestones, risk reviews, lead history, and messages.",
    icon: UserRound,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/mobility-os",
    title: "Mobility OS",
    label: "Digital twin",
    description: "Combines case stage, document readiness, risk signals, regulation radar, and automation triggers into one client journey command center.",
    icon: Orbit,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/documents",
    title: "Document Intelligence",
    label: "Evidence graph",
    description: "Generates route-specific document plans, flags critical gaps, and prepares client reminders without waiting for CRM sync.",
    icon: FileSearch,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/imt",
    title: "Case Tracker",
    label: "IMT",
    description: "Shows the active immigration journey from intake to post-approval, including documents, filing, government review, and next action.",
    icon: Gauge,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/xia",
    title: "XIA Advisor",
    label: "Advisory",
    description: "Uses approved site content and rule scoring to suggest pathways, ask better intake questions, and route cases to staff review.",
    icon: Bot,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/x-passport",
    title: "X-Passport Engine",
    label: "Mobility fit",
    description: "Ranks country and program options by budget, timeline, family inclusion, region preference, and risk signals.",
    icon: Globe2,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/admin/risk",
    title: "Risk Review",
    label: "Due diligence",
    description: "Checks document completeness, mismatch flags, country/program risk, and compliance-screening status before staff approval.",
    icon: ShieldCheck,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/operations",
    title: "Operations",
    label: "Staff workflow",
    description: "Lets staff update lead status, case stage, document review, partner referrals, and B2G inquiries from one console.",
    icon: ClipboardCheck,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/partners",
    title: "Partner Desk",
    label: "Referrals",
    description: "Allows partner accounts to submit client referrals and track whether they are screening, accepted, or converted into cases.",
    icon: BriefcaseBusiness,
    roles: ["partner", "staff", "admin"],
  },
  {
    href: "/x-hub/b2g",
    title: "B2G Desk",
    label: "Institutions",
    description: "Captures institutional and government-style mobility inquiries with volume, region, requirement, and pipeline status.",
    icon: Building2,
    roles: ["b2g", "staff", "admin"],
  },
  {
    href: "/x-hub/admin/content-review",
    title: "Content Review",
    label: "Approval queue",
    description: "Keeps AI-style content updates in draft and review states, so no program content is published without staff approval.",
    icon: FileUp,
    roles: ["staff", "admin"],
  },
];

export default async function XHubPage() {
  const user = await requirePortalUser();
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const activeDocs = activeCase ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id) : [];
  const activeMilestones = activeCase ? snapshot.milestones.filter((item) => item.caseId === activeCase.id) : [];
  const uploadedDocs = activeDocs.filter((doc) => ["uploaded", "reviewing", "accepted"].includes(doc.status)).length;
  const pendingDocs = activeDocs.filter((doc) => ["requested", "rework"].includes(doc.status)).length;
  const visibleFeatureCards = featureCards.filter((card) => card.roles.includes(user.role));

  return (
    <PortalShell user={user} active="dashboard">
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">XIPHIAS Hub case workspace</p>
            <h2 className="mt-1 text-2xl font-bold">Your active file and next steps</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Use this as the secure operating view for a client, partner, or staff member. It brings case status, document work, advisory tools, risk checks, and follow-up actions into one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/x-hub/imt" className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white">
              Open case tracker
            </Link>
            <Link href="/x-hub/xia" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Ask XIA Advisor
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Case tracker</p>
            <p className="mt-1 text-sm font-semibold">Stage, progress, advisor, and next action are live.</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Documents</p>
            <p className="mt-1 text-sm font-semibold">{uploadedDocs} uploaded/reviewed, {pendingDocs} pending.</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Risk review</p>
            <p className="mt-1 text-sm font-semibold">{snapshot.riskProfiles.length} review record{snapshot.riskProfiles.length === 1 ? "" : "s"} available.</p>
          </div>
          <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Staff workflow</p>
            <p className="mt-1 text-sm font-semibold">Admin updates flow in from Operations.</p>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">What each section does</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              These are the working modules available to your current portal role.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleFeatureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white dark:bg-blue-950/50">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {card.label}
                  </span>
                </div>
                <h3 className="mt-3 font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                <span className="mt-3 inline-flex text-sm font-bold text-primary">Open section</span>
              </Link>
            );
          })}
        </div>
      </section>

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
              <h2 className="text-xl font-bold">Active case file</h2>
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
          <h2 className="text-xl font-bold">Document vault</h2>
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
        <h2 className="text-xl font-bold">Case milestones</h2>
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
