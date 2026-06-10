import type { Metadata } from "next";
import Link from "next/link";
import { FileUp } from "lucide-react";
import CrmShell from "@/components/crm/CrmShell";
import { ErrorNotice, FileLinks, MetricCard, Pager, Panel, SearchBox, number } from "@/components/crm/CrmUi";
import { getIndiaDocuments, parseListParams, valueBool, valueText, type CrmFileLink } from "@/lib/crm/india-live";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "Documents | India CRM",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrmDocumentsPage({ searchParams }: PageProps) {
  const user = await requirePortalUser(["staff", "admin"]);
  const params = parseListParams(await Promise.resolve(searchParams ?? {}));
  const data = await getIndiaDocuments(params);

  return (
    <CrmShell
      user={user}
      active="documents"
      title="Documents and uploads"
      subtitle="Client documents, application uploads, signed agreements, support files, and case update attachments mapped to the old private upload folders."
      actions={
        <button className="inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
          <FileUp className="size-4" />
          Upload document
        </button>
      }
    >
      <div className="space-y-5">
        <ErrorNotice message={data.error} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {data.folders.map((folder) => (
            <MetricCard
              key={folder.folder}
              label={folder.folder}
              value={folder.total}
              hint={`${number(folder.empty)} empty DB file values`}
              tone={folder.empty > 0 ? "amber" : "emerald"}
            />
          ))}
        </div>

        <Panel title="Find uploaded documents" eyebrow="Search">
          <form className="grid gap-3 lg:grid-cols-[1fr_auto]" action="/crm/documents">
            <SearchBox q={data.q} placeholder="Document title, filename, client, email, or client id" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-500">
              Search
            </button>
          </form>
        </Panel>

        <Panel title="Client document rows" eyebrow="ClientDocs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-3 py-2">Client</th>
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                    <td className="px-3 py-3">
                      <Link href={`/crm/clients/${doc.clientId}`} className="font-black text-slate-950 hover:text-cyan-700 dark:text-white">
                        {doc.clientName || `Client #${doc.clientId}`}
                      </Link>
                      <p className="text-xs text-slate-500">#{doc.clientId}</p>
                    </td>
                    <td className="px-3 py-3 font-bold">{doc.title || "Untitled"}</td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{doc.description || "-"}</td>
                    <td className="px-3 py-3"><FileLinks links={doc.links} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pager page={data.page} total={data.total} pageSize={data.pageSize} basePath="/crm/documents" query={data.q} />
          </div>
        </Panel>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Recent application uploads" eyebrow="ClientForms">
            <div className="space-y-3">
              {data.applications.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/crm/clients/${valueText(row, "CLIENT_ID")}`} className="font-black hover:text-cyan-700">
                        {valueText(row, "CLIENT") || `Client #${valueText(row, "CLIENT_ID")}`}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">Uploaded {valueText(row, "UP_DATE") || "not set"} · {valueBool(row, "APPROVED") ? "Approved" : "Pending"}</p>
                    </div>
                    <FileLinks links={(row.links as CrmFileLink[]) || []} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Recent signed agreements" eyebrow="AgreementUploads">
            <div className="space-y-3">
              {data.agreements.map((row) => (
                <div key={valueText(row, "ID")} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link href={`/crm/clients/${valueText(row, "CLIENT_ID")}`} className="font-black hover:text-cyan-700">
                        {valueText(row, "CLIENT") || `Client #${valueText(row, "CLIENT_ID")}`}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">Updated {valueText(row, "LAST_UPDATED") || "not set"}</p>
                    </div>
                    <FileLinks links={(row.links as CrmFileLink[]) || []} />
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
