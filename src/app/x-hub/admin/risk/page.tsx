import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import RiskReviewClient from "@/components/Platform/RiskReviewClient";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Risk Review | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RiskReviewPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];

  return (
    <PortalShell user={user} active="risk">
      <RiskReviewClient initialProfiles={snapshot.riskProfiles} caseId={activeCase?.id} />
    </PortalShell>
  );
}
