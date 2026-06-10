import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AtSign, Inbox, Mail, MessageSquareText, RadioTower, Send, ShieldCheck, UsersRound } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, FileLinks, MetricCard, Panel, StatusPill, compactText, number } from "@/components/crm/CrmUi";
import { getIndiaCommunication, valueBool, valueNumber, valueText, type CrmFileLink } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Communication | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ModuleCard({
  icon: Icon,
  title,
  count,
  detail,
  active = count > 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  detail: string;
  active?: boolean;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-md bg-cyan-50 p-2 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200">
          <Icon className="size-5" />
        </div>
        <StatusPill active={active} label={active ? "Mapped" : "Needs setup"} />
      </div>
      <p className="mt-4 text-xs font-bold uppercase text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{number(count)}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
    </article>
  );
}

export default async function CrmCommunicationPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const data = await getIndiaCommunication();
  const smtpReady = data.counts.activeSmtpConfigs > 0 && data.counts.defaultSmtpConfigs > 0;
  const bulkMailReady = smtpReady && data.counts.emailTemplates > 0 && data.counts.mailingLists > 0;

  return (
    <CrmShell
      user={user}
      active="communication"
      title="Communication command center"
      subtitle="Client email logs, bulk mail history, templates, mailing lists, mailbox records, and sanitized SMTP/SMS readiness from the restored Indian CRM database."
    >
      <div className="space-y-5">
        <ErrorNotice message={data.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Client emails" value={data.counts.clientEmails} hint="tbl_client_Email" tone="cyan" />
          <MetricCard label="Bulk email logs" value={data.counts.bulkEmailLogs} hint="tbl_EmailLog" tone="emerald" />
          <MetricCard label="Subscribers" value={data.counts.subscribers} hint="Mailing audience" tone="amber" />
          <MetricCard label="Mailbox rows" value={data.counts.mailbox + data.counts.mailboxDetails} hint="Inbox + thread detail" tone="slate" />
          <MetricCard label="Email templates" value={data.counts.emailTemplates} hint="Reusable mail bodies" tone="cyan" />
          <MetricCard label="Mailing lists" value={data.counts.mailingLists} hint="Audience groups" tone="emerald" />
          <MetricCard label="SMTP configs" value={data.counts.smtpConfigs} hint={`${number(data.counts.activeSmtpConfigs)} active, ${number(data.counts.defaultSmtpConfigs)} default`} tone={smtpReady ? "emerald" : "amber"} />
          <MetricCard label="SMS setup" value={data.counts.smsConfigs} hint={`${number(data.counts.activeSmsConfigs)} active config, ${number(data.counts.smsTemplates)} templates`} tone={data.counts.activeSmsConfigs ? "emerald" : "amber"} />
        </div>

        <Panel
          title="Legacy communication modules"
          eyebrow="Old CRM architecture"
          action={
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
              <ShieldCheck className="size-4" />
              Sending locked for staging
            </span>
          }
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ModuleCard icon={Send} title="Client SendEmail" count={data.counts.clientEmails} detail="Per-client email history with attachment references." />
            <ModuleCard icon={RadioTower} title="Bulk Mail" count={data.counts.bulkEmailLogs} detail="Campaign log rows from the legacy communication area." active={bulkMailReady} />
            <ModuleCard icon={MessageSquareText} title="Bulk SMS" count={data.counts.smsTemplates} detail="SMS config and templates are mapped without exposing provider secrets." active={data.counts.activeSmsConfigs > 0} />
            <ModuleCard icon={Inbox} title="Mailbox" count={data.counts.mailbox} detail="Internal mailbox rows and thread records from the old staff system." />
            <ModuleCard icon={AtSign} title="SMTP" count={data.counts.smtpConfigs} detail="Host, port, SSL, active, and default flags only. Credentials remain hidden." active={smtpReady} />
            <ModuleCard icon={Mail} title="Email templates" count={data.counts.emailTemplates} detail="Template codes and subjects are available for the new composer." />
            <ModuleCard icon={UsersRound} title="Mailing lists" count={data.counts.mailingLists} detail="Legacy audience lists are visible for campaign planning." />
            <ModuleCard icon={ShieldCheck} title="Default mailers" count={data.counts.defaultMailers} detail="Default sender mapping is available for branch/workflow review." />
          </div>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Recent client emails" eyebrow="tbl_client_Email">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Client</th>
                    <th className="px-3 py-2">Recipient</th>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Sent</th>
                    <th className="px-3 py-2">Files</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {data.recentClientEmails.map((row) => {
                    const clientId = valueNumber(row, "CLIENT_ID");
                    return (
                      <tr key={valueText(row, "ID")} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                        <td className="px-3 py-3">
                          {clientId ? (
                            <Link href={`/crm/clients/${clientId}`} className="inline-flex items-center gap-1 font-black text-slate-950 hover:text-cyan-700 dark:text-white">
                              #{clientId}
                              <ArrowRight className="size-3" />
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-500">No client</span>
                          )}
                          <p className="text-xs text-slate-500">By {valueText(row, "SENT_BY") || "system"}</p>
                        </td>
                        <td className="px-3 py-3">{compactText(row.RECIPIENT || row.MAILINGTO)}</td>
                        <td className="px-3 py-3 font-bold">{compactText(row.SUBJECT || "No subject")}</td>
                        <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{valueText(row, "TIME_STAMP") || "Not set"}</td>
                        <td className="px-3 py-3"><FileLinks links={(row.links as CrmFileLink[]) || []} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Sanitized send configuration" eyebrow="SMTP / SMS">
            <div className="space-y-4">
              {data.smtpConfigs.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-slate-950 dark:text-white">{valueText(row, "DOMAIN") || valueText(row, "HOST") || `SMTP #${valueText(row, "ID")}`}</p>
                    <StatusPill active={valueBool(row, "ACTIVE")} label={valueBool(row, "ACTIVE") ? "Active" : "Inactive"} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {valueText(row, "HOST") || "No host"} : {valueText(row, "PORT") || "No port"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    SSL {valueBool(row, "SSL") ? "on" : "off"} / HTML {valueBool(row, "HTML") ? "on" : "off"} / Default {valueBool(row, "IS_DEFAULT") ? "yes" : "no"}
                  </p>
                </div>
              ))}
              {data.smsConfigs.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-slate-950 dark:text-white">SMS config #{valueText(row, "ID")}</p>
                    <StatusPill active={valueBool(row, "ACTIVE")} label={valueBool(row, "ACTIVE") ? "Active" : "Inactive"} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Provider URLs, usernames, passwords, and sender IDs are intentionally hidden.</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Bulk email logs" eyebrow="tbl_EmailLog">
            <div className="space-y-3">
              {data.recentBulkEmails.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 transition hover:border-cyan-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">{compactText(row.SUBJECT || "No subject")}</p>
                      <p className="mt-1 text-xs text-slate-500">{valueText(row, "MAILINGLIST") || "No list"} / {valueText(row, "TIME_STAMP") || "No date"}</p>
                    </div>
                    <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      {compactText(row.RECIPIENT || "No recipient")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Mailbox activity" eyebrow="tbl_MailBox">
            <div className="space-y-3">
              {data.mailbox.map((row) => (
                <div key={valueText(row, "MAIL_ID")} className="rounded-md border border-slate-200 p-3 transition hover:border-cyan-200 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950 dark:text-white">{compactText(row.SUBJECT || "No subject")}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        From {valueText(row, "FROM_ID") || "unknown"} to {valueText(row, "TO_ID") || "unknown"} / {valueText(row, "MAIL_DATE") || "No date"}
                      </p>
                    </div>
                    <StatusPill active={!valueBool(row, "FLAG")} label={valueBool(row, "FLAG") ? "Flagged" : valueText(row, "MAIL_STATUS") || "Mail"} />
                  </div>
                  <div className="mt-3">
                    <FileLinks links={(row.links as CrmFileLink[]) || []} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Panel title="Email templates" eyebrow="tbl_EmailTemplates">
            <div className="space-y-3">
              {data.emailTemplates.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{valueText(row, "CODE") || `Template #${valueText(row, "ID")}`}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{compactText(row.SUBJECT || "No subject")}</p>
                    </div>
                    <StatusPill active={valueBool(row, "ACTIVE")} label={valueBool(row, "ACTIVE") ? "Active" : "Inactive"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Mailing lists" eyebrow="tbl_MailingList">
            <div className="space-y-3">
              {data.mailingLists.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <p className="font-black">{valueText(row, "MAILING_LIST") || valueText(row, "NAME") || `List #${valueText(row, "ID")}`}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{valueText(row, "DEFAULT_SENDER") || "No default sender"}</p>
                  <p className="mt-1 text-xs text-slate-500">{valueText(row, "DOMAIN") || "No domain"}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Default mailers and SMS templates" eyebrow="System">
            <div className="space-y-3">
              {data.defaultMailers.map((row) => (
                <div key={`mailer-${valueText(row, "ID")}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <p className="font-black">{valueText(row, "NAME") || `Mailer #${valueText(row, "ID")}`}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{valueText(row, "CATEGORY") || "No category"} / {valueText(row, "DOMAIN") || "No domain"}</p>
                </div>
              ))}
              {data.smsTemplates.map((row) => (
                <div key={`sms-${valueText(row, "ID")}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{valueText(row, "CODE") || `SMS template #${valueText(row, "ID")}`}</p>
                    <StatusPill active={valueBool(row, "ACTIVE")} label={valueBool(row, "ACTIVE") ? "Active" : "Inactive"} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </CrmShell>
  );
}
