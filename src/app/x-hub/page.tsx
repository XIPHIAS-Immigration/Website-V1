import type { Metadata } from "next";
import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  DatabaseZap,
  FileSearch,
  FileText,
  FileUp,
  Gauge,
  Globe2,
  Orbit,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

import ClientDueDiligenceScan from "@/components/Platform/ClientDueDiligenceScan";
import ClientHubPlayground from "@/components/Platform/ClientHubPlayground";
import DocumentUploadForm from "@/components/Platform/DocumentUploadForm";
import MetricCard from "@/components/Platform/MetricCard";
import PortalShell from "@/components/Platform/PortalShell";
import StatusPill from "@/components/Platform/StatusPill";
import { buildDocumentPlan } from "@/lib/platform/document-intelligence";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import type { ClientDocument, MigrationCase, PortalRole } from "@/lib/platform/types";

export const metadata: Metadata = {
  title: "X-Hub | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FeatureCard = {
  href: string;
  title: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: PortalRole[];
};

const stages: MigrationCase["stage"][] = [
  "intake",
  "documents",
  "due_diligence",
  "strategy",
  "filing",
  "government_review",
  "decision",
  "post_approval",
];

const featureCards: FeatureCard[] = [
  {
    href: "/x-hub/profile",
    title: "Client Profile",
    label: "Single record",
    description: "Editable client identity, goals, budget, family, source-of-funds notes, and linked case data.",
    icon: UserRound,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/mobility-os",
    title: "Mobility OS",
    label: "Command center",
    description: "Combines case progress, document readiness, risk signals, and automation prompts.",
    icon: Orbit,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/documents",
    title: "Document Intelligence",
    label: "Evidence graph",
    description: "Builds route-specific document plans and flags missing or critical items.",
    icon: FileSearch,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/imt",
    title: "Investment + Migration Tracker",
    label: "IMT",
    description: "Tracks the file from intake to document review, filing, government stage, and post-approval.",
    icon: Gauge,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/xia",
    title: "XIA Advisor",
    label: "Advisor",
    description: "Uses approved site content and rules to suggest pathways and route advisor review.",
    icon: Bot,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/x-passport",
    title: "X-Passport Engine",
    label: "Mobility fit",
    description: "Ranks countries and programmes by budget, timeline, family, region, and risk preferences.",
    icon: Globe2,
    roles: ["client", "staff", "admin", "partner", "b2g"],
  },
  {
    href: "/x-hub/admin/risk",
    title: "Risk Review",
    label: "Due diligence",
    description: "Staff view for deterministic risk checks, mismatch flags, and vendor-ready screening records.",
    icon: ShieldCheck,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/operations",
    title: "Operations",
    label: "Staff workflow",
    description: "Update lead status, case stage, document review, partner referrals, and B2G inquiries.",
    icon: ClipboardCheck,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/admin/reports",
    title: "Paid Reports",
    label: "Manual desk",
    description: "Confirm payment manually, create client access, and generate or send the detailed PDF.",
    icon: FileText,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/partners",
    title: "Partner Desk",
    label: "B2B",
    description: "Partner login area for referrals, notes, status tracking, and staff handoff.",
    icon: BriefcaseBusiness,
    roles: ["partner", "staff", "admin"],
  },
  {
    href: "/x-hub/b2g",
    title: "B2G Desk",
    label: "B2G",
    description: "Institutional intake, bulk mobility requirements, dashboards, and controlled exchange.",
    icon: Building2,
    roles: ["b2g", "staff", "admin"],
  },
  {
    href: "/x-hub/admin/content-review",
    title: "Content Review",
    label: "AI content",
    description: "Keeps source-backed content update suggestions in human approval queues.",
    icon: FileUp,
    roles: ["staff", "admin"],
  },
];

function statusTone(status: string) {
  if (["accepted", "complete", "qualified", "approved"].includes(status)) return "green" as const;
  if (["reviewing", "active", "screening", "triage", "uploaded"].includes(status)) return "blue" as const;
  if (["rework", "blocked", "high"].includes(status)) return "red" as const;
  return "amber" as const;
}

function documentReadiness(documents: ClientDocument[]) {
  if (!documents.length) return 0;
  const points = documents.reduce((total, doc) => {
    if (doc.status === "accepted") return total + 100;
    if (doc.status === "reviewing") return total + 75;
    if (doc.status === "uploaded") return total + 60;
    if (doc.status === "rework") return total + 20;
    return total;
  }, 0);
  return Math.round(points / documents.length);
}

function stageLabel(stage: string) {
  return stage.replaceAll("_", " ");
}

function roleCopy(role: PortalRole) {
  if (role === "partner") {
    return {
      kicker: "B2B partnership portal",
      title: "Referral tracking and advisor handoff",
      body: "Submit client referrals, track screening status, and use XIA/X-Passport tools before staff qualification.",
    };
  }
  if (role === "b2g") {
    return {
      kicker: "B2G mobility portal",
      title: "Institutional intake and mobility planning",
      body: "Capture bulk requirements, region priorities, profile volumes, advisory notes, and controlled communication.",
    };
  }
  if (role === "admin" || role === "staff") {
    return {
      kicker: "Staff operating console",
      title: "Client portal, risk, content, and workflow layer",
      body: "Operate client files now, then connect the same records to CRM when the CRM schema is finalized.",
    };
  }
  return {
    kicker: "Client-centric mobile suite",
    title: "Your immigration journey command center",
    body: "Upload documents, track progress, run pre-checks, compare pathways, and see exactly what remains before advisor review.",
  };
}

function StorageModeBadge({ mode }: { mode: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-blue-50">
      <DatabaseZap className="size-3.5" />
      {mode === "file" ? "Standalone file store" : "Memory store"}
    </span>
  );
}

export default async function XHubPage() {
  const user = await requirePortalUser();
  const repo = getPlatformRepository();
  const snapshot = repo.snapshotForUser(user);
  const storage = repo.storageMode();
  const activeCase = snapshot.cases[0];
  const profile = snapshot.clientProfiles[0];
  const activeDocs = activeCase ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id) : [];
  const activeMilestones = activeCase ? snapshot.milestones.filter((item) => item.caseId === activeCase.id) : [];
  const uploadQueue = activeDocs.filter((doc) => ["requested", "rework"].includes(doc.status)).slice(0, 3);
  const acceptedDocs = activeDocs.filter((doc) => doc.status === "accepted").length;
  const uploadedOrReviewing = activeDocs.filter((doc) => ["uploaded", "reviewing"].includes(doc.status)).length;
  const readiness = documentReadiness(activeDocs);
  const documentPlan = buildDocumentPlan({ user, activeCase, documents: activeDocs });
  const visibleFeatureCards = featureCards.filter((card) => card.roles.includes(user.role));
  const copy = roleCopy(user.role);
  const currentStageIndex = activeCase ? Math.max(0, stages.indexOf(activeCase.stage)) : 0;
  const recentActivity = snapshot.conversations.slice(0, 5);

  return (
    <PortalShell user={user} active="dashboard">
      <section className="overflow-hidden rounded-2xl bg-[#071b3d] text-white shadow-xl shadow-slate-950/10">
        <div className="relative p-5 sm:p-7">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-32 w-32 rounded-full bg-[#d8b848]/20 blur-2xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#f4d36b]">
                  <Smartphone className="size-3.5" />
                  {copy.kicker}
                </span>
                <StorageModeBadge mode={storage.mode} />
              </div>
              <h2 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
                {copy.title}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-50/85 sm:text-base">
                {copy.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {activeCase ? (
                  <>
                    <Link href="/x-hub/documents" className="rounded-lg bg-[#d8b848] px-4 py-2.5 text-sm font-black text-[#071b3d] transition hover:bg-[#f1cf55]">
                      Complete documents
                    </Link>
                    <Link href="/x-hub/imt" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
                      Open IMT tracker
                    </Link>
                  </>
                ) : null}
                {user.role === "partner" ? (
                  <Link href="/x-hub/partners" className="rounded-lg bg-[#d8b848] px-4 py-2.5 text-sm font-black text-[#071b3d] transition hover:bg-[#f1cf55]">
                    Submit referral
                  </Link>
                ) : null}
                {user.role === "b2g" ? (
                  <Link href="/x-hub/b2g" className="rounded-lg bg-[#d8b848] px-4 py-2.5 text-sm font-black text-[#071b3d] transition hover:bg-[#f1cf55]">
                    Start institutional intake
                  </Link>
                ) : null}
                <Link href="/x-hub/xia" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/15">
                  Ask XIA
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">Current workspace</p>
              {activeCase ? (
                <>
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black">{activeCase.title}</h3>
                      <p className="mt-1 text-sm text-blue-50/75">
                        {activeCase.country} - {activeCase.program}
                      </p>
                    </div>
                    <StatusPill tone={statusTone(activeCase.riskLevel)}>{activeCase.riskLevel}</StatusPill>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-blue-50/80">
                      <span>Case progress</span>
                      <span>{activeCase.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/15">
                      <div className="h-2 rounded-full bg-[#d8b848]" style={{ width: `${activeCase.progress}%` }} />
                    </div>
                  </div>
                  <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-blue-50">
                    Next: {activeCase.nextAction}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-blue-50/80">
                  No client case is assigned to this role yet. Use the available partner, B2G, or advisory modules below.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Case progress" value={activeCase ? `${activeCase.progress}%` : "-"} hint="IMT completion" />
        <MetricCard label="Document readiness" value={activeDocs.length ? `${readiness}%` : "-"} hint={`${acceptedDocs} accepted, ${uploadedOrReviewing} in review`} />
        <MetricCard label="Open actions" value={documentPlan.nextActions.length + uploadQueue.length} hint="Client and staff next steps" />
        <MetricCard label="Risk records" value={snapshot.riskProfiles.length} hint="Due diligence checks" />
      </div>

      {user.role === "client" ? <ClientHubPlayground activeCase={activeCase} profile={profile} /> : null}

      {activeCase ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Investment + Migration Tracker</p>
                <h3 className="mt-1 text-xl font-black">Journey progress</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  This is the client-visible timeline. Staff can later sync these stages from CRM.
                </p>
              </div>
              <Link href="/x-hub/imt" className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white">
                Open tracker
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {stages.map((stage, index) => {
                const current = stage === activeCase.stage;
                const complete = index < currentStageIndex;
                return (
                  <div
                    key={stage}
                    className={`rounded-lg border p-3 ${
                      current
                        ? "border-primary bg-blue-50 dark:bg-blue-950/40"
                        : complete
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black capitalize">{stageLabel(stage)}</p>
                      {complete ? <CheckCircle2 className="size-4 text-emerald-600" /> : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {current ? "Current stage" : complete ? "Completed" : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Advisor action</p>
                <p className="mt-2 font-bold">{activeCase.nextAction}</p>
                <p className="mt-1 text-sm text-slate-500">Due {activeCase.nextActionDue}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Document plan</p>
                <p className="mt-2 font-bold">{documentPlan.readinessScore}% plan readiness</p>
                <p className="mt-1 text-sm text-slate-500">{documentPlan.flags.length} critical flag{documentPlan.flags.length === 1 ? "" : "s"}</p>
              </div>
            </div>
          </section>

          <ClientDueDiligenceScan activeCase={activeCase} profile={profile} documents={activeDocs} />
        </div>
      ) : null}

      {activeCase ? (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Client action center</p>
                <h3 className="mt-1 text-xl font-black">What should be done next</h3>
              </div>
              <Link href="/x-hub/documents" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                Full document planner
              </Link>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {documentPlan.nextActions.slice(0, 4).map((action, index) => (
                <article key={action} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Action {index + 1}</p>
                  <p className="mt-1 font-black">{action}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    This action is generated from the current document checklist, route, and case stage.
                  </p>
                </article>
              ))}
              {!documentPlan.nextActions.length ? (
                <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                  <p className="font-black">No urgent document actions</p>
                  <p className="mt-1 text-sm">Current portal record is ready for staff verification.</p>
                </article>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Upload vault</p>
            <h3 className="mt-1 text-xl font-black">Pending documents</h3>
            <div className="mt-4 space-y-3">
              {uploadQueue.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{doc.label}</p>
                      <p className="text-sm text-slate-500">{doc.category}</p>
                    </div>
                    <StatusPill tone={statusTone(doc.status)}>{doc.status}</StatusPill>
                  </div>
                  <DocumentUploadForm document={doc} />
                </div>
              ))}
              {!uploadQueue.length ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-950">
                  No upload is pending right now.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {recentActivity.length ? (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Recent portal activity</p>
            <h3 className="mt-1 text-xl font-black">Interactions saved in X-Hub</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Sign-ins, uploads, and portal messages appear here against the active case record.
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentActivity.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{item.from}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {item.channel} - {item.direction}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.createdAt.slice(0, 10)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{item.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {user.role === "partner" ? (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">B2B portal</p>
          <h3 className="mt-1 text-xl font-black">Referral and partner workspace</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {snapshot.partnerReferrals.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="font-black">{item.clientName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.targetCountry || "Country pending"}</p>
                <div className="mt-3">
                  <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {user.role === "b2g" ? (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">B2G portal</p>
          <h3 className="mt-1 text-xl font-black">Institutional mobility workspace</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {snapshot.b2gInquiries.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="font-black">{item.organizationName}</p>
                <p className="mt-1 text-sm text-slate-500">{item.region || "Region pending"}</p>
                <div className="mt-3">
                  <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">Modules available to this role</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              These modules work as the standalone portal template now and can later sync with CRM records.
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
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white dark:bg-blue-950/50">
                    <Icon className="size-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {card.label}
                  </span>
                </div>
                <h3 className="mt-3 font-black">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                <span className="mt-3 inline-flex text-sm font-black text-primary">Open module</span>
              </Link>
            );
          })}
        </div>
      </section>
    </PortalShell>
  );
}
