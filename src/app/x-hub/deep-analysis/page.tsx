import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import RegistrationDeepAnalysisIntake from "@/components/Platform/RegistrationDeepAnalysisIntake";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = { title: "Included Deep Analysis | X-Hub", robots: { index: false, follow: false } };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function IncludedDeepAnalysisPage() {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const profile = snapshot.clientProfiles?.find((item) => item.clientId === (user.clientId || activeCase?.clientId));
  return <PortalShell user={user} active="deep-analysis"><RegistrationDeepAnalysisIntake defaults={{ country: activeCase?.country || profile?.targetCountry, program: activeCase?.program || profile?.targetProgram, occupation: profile?.occupation }} /></PortalShell>;
}
