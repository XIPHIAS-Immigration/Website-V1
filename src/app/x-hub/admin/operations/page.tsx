import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import CaseQuickUpdateForm from "@/components/Platform/CaseQuickUpdateForm";
import StatusPill from "@/components/Platform/StatusPill";
import WorkflowStatusSelect from "@/components/Platform/WorkflowStatusSelect";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Operations Console | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const leadStatuses = ["new", "qualified", "consultation_booked", "case_opened", "closed"];
const caseStages = ["intake", "documents", "due_diligence", "strategy", "filing", "government_review", "decision", "post_approval"];
const documentStatuses = ["requested", "uploaded", "reviewing", "accepted", "rework"];
const referralStatuses = ["submitted", "screening", "accepted", "case_opened", "not_a_fit"];
const b2gStatuses = ["submitted", "triage", "proposal", "active", "closed"];

function tone(status: string) {
  if (["accepted", "approved", "active", "case_opened", "qualified", "accepted"].includes(status)) return "green" as const;
  if (["blocked", "rework", "not_a_fit", "closed"].includes(status)) return "red" as const;
  if (["reviewing", "screening", "triage", "proposal", "uploaded"].includes(status)) return "blue" as const;
  return "amber" as const;
}

export default async function OperationsPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const repo = getPlatformRepository();
  const snapshot = repo.snapshotForUser(user);

  return (
    <PortalShell user={user} active="operations">
      <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Staff workflow</p>
        <h2 className="mt-1 text-xl font-bold">Operations console</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          This is where staff move leads, cases, documents, referrals, and institutional inquiries through their working statuses.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Lead pipeline</h2>
              <p className="mt-1 text-sm text-slate-500">Website, chat, WhatsApp, eligibility, partner, and B2G intake.</p>
            </div>
            <StatusPill tone="blue">{snapshot.leads.length} leads</StatusPill>
          </div>
          <div className="mt-4 grid gap-3">
            {snapshot.leads.map((lead) => (
              <article key={lead.id} className="grid gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800 md:grid-cols-[1fr_220px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{lead.name}</h3>
                    <StatusPill tone={tone(lead.status)}>{lead.status.replaceAll("_", " ")}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {[lead.source, lead.track, lead.country, lead.program].filter(Boolean).join(" - ")}
                  </p>
                  {lead.message ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{lead.message}</p> : null}
                </div>
                <WorkflowStatusSelect entityType="lead" id={lead.id} value={lead.status} options={leadStatuses} label="Lead status" />
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Case control</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.cases.map((item) => (
              <article key={item.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.country} - {item.program}
                    </p>
                  </div>
                  <StatusPill tone={tone(item.riskLevel)}>{item.riskLevel}</StatusPill>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <WorkflowStatusSelect entityType="case" id={item.id} value={item.stage} options={caseStages} label="Stage" />
                  <CaseQuickUpdateForm item={item} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Document review</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.documents.map((doc) => (
              <article key={doc.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <h3 className="font-bold">{doc.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{doc.fileName || doc.category}</p>
                <WorkflowStatusSelect entityType="document" id={doc.id} value={doc.status} options={documentStatuses} label="Review status" />
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">Partner referrals</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.partnerReferrals.map((referral) => (
              <article key={referral.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <h3 className="font-bold">{referral.clientName}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {referral.partnerName} - {referral.targetCountry || "country pending"}
                </p>
                <WorkflowStatusSelect entityType="partner_referral" id={referral.id} value={referral.status} options={referralStatuses} label="Referral status" />
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold">B2G inquiries</h2>
          <div className="mt-4 grid gap-3">
            {snapshot.b2gInquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                <h3 className="font-bold">{inquiry.organizationName}</h3>
                <p className="mt-1 text-sm text-slate-500">{inquiry.region || "region pending"}</p>
                <WorkflowStatusSelect entityType="b2g_inquiry" id={inquiry.id} value={inquiry.status} options={b2gStatuses} label="Inquiry status" />
              </article>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
