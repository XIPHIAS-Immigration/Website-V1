import type { Metadata } from "next";
import ClientProfileWorkspace from "@/components/Platform/ClientProfileWorkspace";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Client Profile | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ClientProfilePage() {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const repo = getPlatformRepository();
  const snapshot = repo.snapshotForUser(user);
  const profiles = snapshot.clientProfiles ?? [];
  const targetClientId =
    user.clientId ||
    snapshot.cases[0]?.clientId ||
    profiles[0]?.clientId ||
    `cli_${user.id}`;
  const activeCase = snapshot.cases.find((item) => item.clientId === targetClientId);
  const existingProfile = profiles.find((profile) => profile.clientId === targetClientId);
  const initialProfile =
    existingProfile ||
    repo.upsertClientProfile(
      {
        clientId: targetClientId,
        userId: user.role === "client" ? user.id : undefined,
        fullName: user.name,
        email: user.email,
        preferredTrack: activeCase?.track ?? "residency",
        targetCountry: activeCase?.country,
        targetProgram: activeCase?.program,
        notes: "Profile created from the portal workspace.",
      },
      user.id,
    );
  const refreshedSnapshot = existingProfile ? snapshot : repo.snapshotForUser(user);

  return (
    <PortalShell user={user} active="profile">
      <ClientProfileWorkspace
        initialProfile={initialProfile}
        snapshot={refreshedSnapshot}
        targetClientId={targetClientId}
      />
    </PortalShell>
  );
}
