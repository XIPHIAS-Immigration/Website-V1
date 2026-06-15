import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Eye,
  Gauge,
  MousePointerClick,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";

import AnalyticsDashboardPreview from "@/components/Platform/AnalyticsDashboardPreview";
import MetricCard from "@/components/Platform/MetricCard";
import PortalShell from "@/components/Platform/PortalShell";
import StatusPill from "@/components/Platform/StatusPill";
import { requirePortalUser } from "@/lib/platform/auth";
import { buildDocumentPlan } from "@/lib/platform/document-intelligence";
import { getPlatformRepository } from "@/lib/platform/repository";
import { getVisitorAnalyticsSummary } from "@/lib/platform/visitor-analytics";
import type { ClientDocument, PortalRole } from "@/lib/platform/types";

export const metadata: Metadata = {
  title: "X-Hub | XIPHIAS Immigration",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IntelligenceAction = {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
  roles: PortalRole[];
  primary?: boolean;
};

const intelligenceActions: IntelligenceAction[] = [
  {
    href: "/x-hub/xia",
    eyebrow: "XIA",
    title: "Route advisor",
    body: "Shortlist programme directions from XIPHIAS content and advisor review rules.",
    icon: Bot,
    roles: ["client", "staff", "admin", "partner", "b2g"],
    primary: true,
  },
  {
    href: "/x-hub/admin/analytics",
    eyebrow: "Signals",
    title: "Visitor signals",
    body: "Review submitted leads, page activity, clicks, and search interest.",
    icon: Radar,
    roles: ["staff", "admin"],
  },
  {
    href: "/x-hub/profile",
    eyebrow: "Client",
    title: "Client profile",
    body: "Maintain intake answers, case notes, profile details, and future CRM sync fields.",
    icon: UsersRound,
    roles: ["client", "staff", "admin"],
  },
  {
    href: "/x-hub/documents",
    eyebrow: "Evidence",
    title: "Document readiness",
    body: "Review missing evidence and next documents before advisor verification.",
    icon: ShieldCheck,
    roles: ["client", "staff", "admin"],
  },
];

function statusTone(status: string) {
  if (["accepted", "complete", "qualified", "approved", "low"].includes(status)) return "green" as const;
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

function compactStage(stage?: string) {
  return stage ? stage.replaceAll("_", " ") : "not assigned";
}

export default async function XHubPage() {
  const user = await requirePortalUser();
  const repo = getPlatformRepository();
  const snapshot = repo.snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const activeDocs = activeCase ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id) : [];
  const documentPlan = buildDocumentPlan({ user, activeCase, documents: activeDocs });
  const readiness = documentReadiness(activeDocs);
  const canSeeAnalytics = user.role === "staff" || user.role === "admin";
  const analyticsSummary = canSeeAnalytics ? await getVisitorAnalyticsSummary() : null;
  const visibleActions = intelligenceActions.filter((action) => action.roles.includes(user.role));
  const topInterest = analyticsSummary?.topInterests[0]?.label || "collecting signals";

  return (
    <PortalShell user={user} active="dashboard">
      <section className="overflow-hidden rounded-xl border border-[#d7e2f2] bg-[#071b3d] text-white shadow-cause-shadow">
        <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
          <div className="flex min-h-[320px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b923]/35 bg-[#e1b923]/10 px-3 py-1 text-xs font-medium text-[#f4d36b]">
                <Sparkles className="size-3.5" />
                X-Hub workspace
              </div>
              <h2 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Client intake, route guidance, and visitor signals in one workspace.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50/80 sm:text-base">
                X-Hub keeps early enquiries, assessment activity, document readiness, and advisor handoff visible before CRM sync.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/x-hub/xia"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#e1b923] px-4 py-3 text-sm font-semibold text-[#071b3d] transition hover:-translate-y-0.5 hover:bg-[#f4d36b]"
              >
                Open XIA
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
              {canSeeAnalytics ? (
                <Link
                  href="/x-hub/admin/analytics"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  View visitor activity
                </Link>
              ) : (
                <Link
                  href="/x-hub/profile"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Update profile
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border border-white/15 bg-white/[0.08] p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#f4d36b]">
                    Route guidance
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">Advisor review shortlist</h3>
                </div>
                <span className="flex size-12 items-center justify-center rounded-lg bg-white text-primary">
                  <BrainCircuit className="size-6" />
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Content retrieval", "Approved website pages and programmes"],
                  ["Rule scoring", "Budget, country, family, timeline, risk"],
                  ["Human handoff", "Staff review before final advice"],
                ].map(([label, value], index) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/[0.07] p-3">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>{label}</span>
                      <span className="text-[#f4d36b]">0{index + 1}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-blue-50/70">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/15 bg-white/[0.08] p-4">
                <p className="text-xs font-medium text-blue-100">Case stage</p>
                <p className="mt-3 text-2xl font-semibold capitalize">{compactStage(activeCase?.stage)}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-blue-50/70">
                  {activeCase?.nextAction || "XIA can guide the first route direction before a case is opened."}
                </p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/[0.08] p-4">
                <p className="text-xs font-medium text-blue-100">Top signal</p>
                <p className="mt-3 text-2xl font-semibold capitalize">{topInterest}</p>
                <p className="mt-2 text-xs leading-5 text-blue-50/70">
                  {canSeeAnalytics ? "Visitor interest from public-site activity." : "Staff can review visitor signals from admin analytics."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {canSeeAnalytics ? (
          <>
            <MetricCard label="Visitors" value={analyticsSummary?.totals.visitors ?? 0} hint={`${analyticsSummary?.totals.sessions ?? 0} tracked sessions`} />
            <MetricCard label="Submitted leads" value={snapshot.leads.length} hint={`${analyticsSummary?.totals.uniqueKnownContacts ?? 0} contact analytics events`} />
            <MetricCard label="Page views" value={analyticsSummary?.totals.pageViews ?? 0} hint="Public website intent" />
            <MetricCard label="CTA clicks" value={analyticsSummary?.totals.clicks ?? 0} hint="Booking, forms, downloads" />
          </>
        ) : (
          <>
            <MetricCard label="Case progress" value={activeCase ? `${activeCase.progress}%` : "-"} hint="Advisor workflow status" />
            <MetricCard label="Document readiness" value={activeDocs.length ? `${readiness}%` : "-"} hint={`${activeDocs.length} required documents`} />
            <MetricCard label="Open actions" value={documentPlan.nextActions.length} hint="What remains before review" />
            <MetricCard label="Risk scans" value={snapshot.riskProfiles.length} hint="Due diligence records" />
          </>
        )}
      </div>

      <section className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-primary">Workspace</p>
              <h2 className="mt-1 text-2xl font-semibold">Key actions</h2>
            </div>
            <span className="rounded-xl bg-blue-50 p-2 text-primary dark:bg-blue-950/40">
              <Target className="size-5" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {visibleActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group flex items-center gap-4 rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                    action.primary
                      ? "border-primary/25 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-primary">
                      {action.eyebrow}
                    </span>
                    <span className="mt-1 block text-base font-semibold">{action.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{action.body}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">
                {canSeeAnalytics ? "Site activity" : "Client file"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold">
                {canSeeAnalytics ? "Visitor and lead summary" : "What your file needs next"}
              </h2>
            </div>
            {activeCase ? <StatusPill tone={statusTone(activeCase.riskLevel)}>{activeCase.riskLevel}</StatusPill> : null}
          </div>

          {canSeeAnalytics ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SignalTile icon={Eye} label="Viewed" value={analyticsSummary?.totals.pageViews ?? 0} />
              <SignalTile icon={MousePointerClick} label="Clicked" value={analyticsSummary?.totals.clicks ?? 0} />
              <SignalTile icon={Search} label="Leads" value={snapshot.leads.length} />
            </div>
          ) : activeCase ? (
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{activeCase.title}</span>
                  <span>{activeCase.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-[#d8b848]" style={{ width: `${activeCase.progress}%` }} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold">Next action</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{activeCase.nextAction}</p>
              </div>
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              No active case is assigned yet. Start with XIA to capture the preferred country, programme family, and advisory direction.
            </p>
          )}

          <div className="mt-5 rounded-lg border border-[#e1b923]/25 bg-[#fff8dc] p-4 text-[#172849] dark:bg-[#1d2740] dark:text-blue-50">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-[#e1b923] p-2 text-[#071b3d]">
                <Gauge className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Operational roadmap</p>
                <p className="mt-1 text-sm leading-6 opacity-80">
                  Guided intake, evidence scoring, route comparison, visitor signals, paid reports, and CRM-linked human review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {analyticsSummary ? (
        <AnalyticsDashboardPreview
          visitors={analyticsSummary.totals.visitors}
          sessions={analyticsSummary.totals.sessions}
          pageViews={analyticsSummary.totals.pageViews}
          clicks={analyticsSummary.totals.clicks}
          leads={snapshot.leads.length}
          knownContacts={analyticsSummary.totals.uniqueKnownContacts}
          topInterests={analyticsSummary.topInterests}
          dailyEvents={analyticsSummary.dailyEvents}
          showOpenButton
        />
      ) : null}
    </PortalShell>
  );
}

function SignalTile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}
