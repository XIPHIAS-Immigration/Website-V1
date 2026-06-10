import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Edit3, FileUp, Mail, Plus } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, FileLinks, MetricCard, Panel, StatusPill, compactText, money, text } from "@/components/crm/CrmUi";
import { getIndiaClientProfile, valueBool, valueNumber, valueText, type CrmFileLink } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Client Profile | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-950 dark:text-white">{text(value)}</p>
    </div>
  );
}

function SectionTable({
  columns,
  rows,
}: {
  columns: Array<{ key: string; label: string; render?: (row: Record<string, unknown>) => React.ReactNode }>;
  rows: Record<string, unknown>[];
}) {
  if (!rows.length) return <p className="text-sm font-semibold text-slate-500">No rows found in the restored DB.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr key={`${valueText(row, "ID")}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-950">
              {columns.map((column) => (
                <td key={column.key} className="px-3 py-3 align-top">
                  {column.render ? column.render(row) : compactText(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function CrmClientProfilePage({ params }: PageProps) {
  const user = await requirePortalUser(["staff", "admin"]);
  const { id } = await params;
  const clientId = Number(id);
  const profile = await getIndiaClientProfile(clientId);
  const client = profile.client;
  const clientName = client
    ? [client.FIRST_NAME, client.MIDDLE_NAME, client.LAST_NAME]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter(Boolean)
        .join(" ") || valueText(client, "EMAIL")
    : `Client #${id}`;
  const invoiceTotal = profile.invoices.reduce((sum, row) => sum + (valueNumber(row, "PAYABLE_AMOUNT") || valueNumber(row, "AMOUNT")), 0);
  const receiptTotal = profile.receipts.reduce((sum, row) => sum + valueNumber(row, "AMOUNT"), 0);

  return (
    <CrmShell
      user={user}
      active="clients"
      title={clientName}
      subtitle={client ? `${valueText(client, "CLIENT_STATUS") || "No status"} · ${valueText(client, "EMAIL")} · ${valueText(client, "PHONE")}` : "Client profile could not be loaded from the restored DB."}
      actions={
        <>
          <Link href="/crm/clients" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
            <ArrowLeft className="size-4" />
            Clients
          </Link>
          <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
            <Edit3 className="size-4" />
            Edit profile
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={profile.error} />

        {client ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Documents" value={profile.documents.length} hint="ClientDocs" tone="cyan" />
              <MetricCard label="Applications" value={profile.applications.length} hint="ClientForms" tone="emerald" />
              <MetricCard label="Invoices" value={profile.invoices.length} hint={money(invoiceTotal)} tone="amber" />
              <MetricCard label="Receipts" value={profile.receipts.length} hint={money(receiptTotal)} tone="slate" />
              <MetricCard label="Open work" value={profile.tasks.filter((task) => !task.done).length + profile.support.filter((ticket) => ticket.status === "Open").length} hint="Tasks + tickets" tone="cyan" />
            </div>

            <Panel
              title="Editable profile"
              eyebrow="Client master"
              action={<StatusPill active={valueBool(client, "STATUS")} label={valueText(client, "CLIENT_STATUS")} />}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Email" value={client.EMAIL} />
                <Field label="Phone" value={client.PHONE} />
                <Field label="DOB" value={client.DOB} />
                <Field label="Passport" value={client.PASSPORT_NO} />
                <Field label="Birth country" value={client.BIRTH_COUNTRY} />
                <Field label="Residence" value={client.RESIDENCE_COUNTRY} />
                <Field label="Citizenship" value={client.CITIZEN_COUNTRY} />
                <Field label="Source" value={client.SOURCE} />
                <Field label="Branch" value={client.BR_ID} />
                <Field label="Assigned to" value={client.ASSIGNED_TO} />
                <Field label="Client category" value={client.CLIENT_CATEGORY} />
                <Field label="Closing" value={client.CLOSING} />
              </div>
            </Panel>

            <Panel
              title="Contact and case file"
              eyebrow="Address / file"
              action={<button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-800"><Edit3 className="size-4" /> Edit</button>}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Address 1" value={client.ADDRESS1} />
                <Field label="Address 2" value={client.ADDRESS2} />
                <Field label="City" value={client.CITY} />
                <Field label="State" value={client.STATE} />
                <Field label="Country" value={client.COUNTRY} />
                <Field label="ZIP" value={client.ZIP} />
                <Field label="Program ID" value={client.PROGRAM_ID} />
                <Field label="File status" value={client.FILE_STATUS} />
                <Field label="File no" value={client.FILE_NO} />
                <Field label="Application submit" value={client.APP_SUBMIT_DATE} />
                <Field label="Interview" value={client.INTERVIEW_DATE} />
                <Field label="Visa post" value={client.VISA_POSTS} />
              </div>
            </Panel>

            <Panel
              title="Documents"
              eyebrow="ClientDocs"
              action={<button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white"><FileUp className="size-4" /> Upload</button>}
            >
              <SectionTable
                rows={profile.documents}
                columns={[
                  { key: "TITLE", label: "Document" },
                  { key: "DESCRIPTION", label: "Description" },
                  { key: "FILE", label: "File", render: (row) => <FileLinks links={(row.links as CrmFileLink[]) || []} /> },
                ]}
              />
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Applications" eyebrow="ClientForms">
                <SectionTable
                  rows={profile.applications}
                  columns={[
                    { key: "APP_ID", label: "App" },
                    { key: "UP_DATE", label: "Upload date" },
                    { key: "APPROVED", label: "Approved", render: (row) => <StatusPill active={valueBool(row, "APPROVED")} label={valueBool(row, "APPROVED") ? "Approved" : "Pending"} /> },
                    { key: "APPLICATION", label: "File", render: (row) => <FileLinks links={(row.links as CrmFileLink[]) || []} /> },
                  ]}
                />
              </Panel>

              <Panel title="Agreements" eyebrow="AgreementUploads">
                <SectionTable
                  rows={profile.agreements}
                  columns={[
                    { key: "ID", label: "ID" },
                    { key: "LAST_UPDATED", label: "Updated" },
                    { key: "UPDATED_BY", label: "By" },
                    { key: "AGREEMENT", label: "File", render: (row) => <FileLinks links={(row.links as CrmFileLink[]) || []} /> },
                  ]}
                />
              </Panel>
            </div>

            <Panel title="Case updates" eyebrow="Timeline">
              <SectionTable
                rows={profile.caseUpdates}
                columns={[
                  { key: "DATE", label: "Date" },
                  { key: "CATEGORY", label: "Category" },
                  { key: "SUBJECT", label: "Subject" },
                  { key: "BODY", label: "Body" },
                  { key: "FILE", label: "File", render: (row) => <FileLinks links={(row.links as CrmFileLink[]) || []} /> },
                ]}
              />
            </Panel>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Invoices" eyebrow="Accounts">
                <SectionTable
                  rows={profile.invoices}
                  columns={[
                    { key: "INV_ID", label: "Invoice" },
                    { key: "DATE", label: "Date" },
                    { key: "INSTALLMENT", label: "Installment" },
                    { key: "PAYABLE_AMOUNT", label: "Amount", render: (row) => money(valueNumber(row, "PAYABLE_AMOUNT") || valueNumber(row, "AMOUNT")) },
                    { key: "PAYMENT_STATUS", label: "Payment" },
                    { key: "APPROVAL_STATUS", label: "Approval" },
                  ]}
                />
              </Panel>

              <Panel title="Receipts" eyebrow="Accounts">
                <SectionTable
                  rows={profile.receipts}
                  columns={[
                    { key: "ID", label: "Receipt" },
                    { key: "RECEIPT_DATE", label: "Date" },
                    { key: "DESCRIPTION", label: "Description" },
                    { key: "AMOUNT", label: "Amount", render: (row) => money(valueNumber(row, "AMOUNT")) },
                    { key: "PAY_MODE", label: "Mode" },
                  ]}
                />
              </Panel>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <Panel title="Support" eyebrow="Tickets" action={<button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white"><Plus className="size-4" /> Ticket</button>}>
                <SectionTable
                  rows={profile.support as unknown as Record<string, unknown>[]}
                  columns={[
                    { key: "subject", label: "Subject" },
                    { key: "type", label: "Type" },
                    { key: "status", label: "Status" },
                    { key: "created", label: "Created" },
                  ]}
                />
              </Panel>

              <Panel title="Communication and notes" eyebrow="Notes">
                <SectionTable
                  rows={profile.notes}
                  columns={[
                    { key: "PostedOn", label: "Posted" },
                    { key: "PostedBy", label: "By" },
                    { key: "Notes", label: "Note" },
                    { key: "VisibleToClient", label: "Client visible", render: (row) => <StatusPill active={valueBool(row, "VisibleToClient")} label={valueBool(row, "VisibleToClient") ? "Visible" : "Internal"} /> },
                  ]}
                />
              </Panel>
            </div>

            <Panel title="Tasks" eyebrow="Work queue">
              <SectionTable
                rows={profile.tasks as unknown as Record<string, unknown>[]}
                columns={[
                  { key: "subject", label: "Subject" },
                  { key: "dueDate", label: "Due" },
                  { key: "assignedTo", label: "Assigned to" },
                  { key: "done", label: "Done", render: (row) => <StatusPill active={Boolean(row.done)} label={row.done ? "Done" : "Open"} /> },
                ]}
              />
            </Panel>

            <Panel title="Assessment profile data" eyebrow="Family / education / language / work">
              <div className="grid gap-5 xl:grid-cols-2">
                <SectionTable rows={profile.education} columns={[{ key: "DIPLOMA_NAME", label: "Diploma" }, { key: "STUDY_AREA", label: "Area" }, { key: "STUDY_COUNTRY", label: "Country" }]} />
                <SectionTable rows={profile.occupation} columns={[{ key: "JOB_TITLE", label: "Job" }, { key: "NOC", label: "NOC" }, { key: "DURATION", label: "Duration" }, { key: "LOCATION", label: "Location" }]} />
                <SectionTable rows={profile.family} columns={[{ key: "MARITAL_STATUS", label: "Marital" }, { key: "SPOUSE_DOB", label: "Spouse DOB" }, { key: "NO_OF_CHILD", label: "Children" }]} />
                <SectionTable rows={profile.business} columns={[{ key: "NET_WORTH", label: "Net worth" }, { key: "EXPR_YEAR", label: "Experience" }, { key: "ANNUAL_SALE", label: "Annual sale" }]} />
              </div>
            </Panel>

            <Panel title="Communication actions" eyebrow="Ready for integration">
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-bold text-white dark:bg-cyan-600">
                  <Mail className="size-4" />
                  Send email
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-800">
                  <Plus className="size-4" />
                  Add note
                </button>
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-800">
                  <Plus className="size-4" />
                  Add task
                </button>
              </div>
            </Panel>
          </>
        ) : (
          <Panel title="Client not found" eyebrow="Lookup">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No client was returned for ID {id}.</p>
          </Panel>
        )}
      </div>
    </CrmShell>
  );
}
