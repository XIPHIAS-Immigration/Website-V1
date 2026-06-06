import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import B2GIntakeForm from "@/components/Platform/B2GIntakeForm";
import StatusPill from "@/components/Platform/StatusPill";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "B2G Portal | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function B2GPortalPage() {
  const user = await requirePortalUser(["b2g", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);

  return (
    <PortalShell user={user} active="b2g">
      <B2GIntakeForm />
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold">Institutional inquiries</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.b2gInquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{inquiry.organizationName}</h3>
                  <p className="text-sm text-slate-500">
                    {inquiry.region || "Region pending"} - {inquiry.volumeEstimate || "Volume pending"}
                  </p>
                </div>
                <StatusPill tone={inquiry.status === "active" ? "green" : "blue"}>
                  {inquiry.status}
                </StatusPill>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{inquiry.requirement}</p>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}

