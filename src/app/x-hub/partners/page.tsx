import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import PartnerReferralForm from "@/components/Platform/PartnerReferralForm";
import StatusPill from "@/components/Platform/StatusPill";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Partner Portal | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PartnerPortalPage() {
  const user = await requirePortalUser(["partner", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);

  return (
    <PortalShell user={user} active="partners">
      <PartnerReferralForm />
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold">Referral pipeline</h2>
        <div className="mt-4 grid gap-3">
          {snapshot.partnerReferrals.map((referral) => (
            <article key={referral.id} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{referral.clientName}</h3>
                  <p className="text-sm text-slate-500">
                    {referral.targetCountry || "Country pending"} - {referral.targetProgram || "Program pending"}
                  </p>
                </div>
                <StatusPill tone={referral.status === "accepted" || referral.status === "case_opened" ? "green" : "blue"}>
                  {referral.status.replaceAll("_", " ")}
                </StatusPill>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}

