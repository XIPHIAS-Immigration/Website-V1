import type { Metadata } from "next";
import MobilityOSView from "@/components/Platform/MobilityOSView";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";
import { buildMobilityOS } from "@/lib/platform/mobility-os";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Mobility OS | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MobilityOSPage() {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const result = buildMobilityOS(snapshot);

  return (
    <PortalShell user={user} active="mobility-os">
      <MobilityOSView result={result} role={user.role} />
    </PortalShell>
  );
}
