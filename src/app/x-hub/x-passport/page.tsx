import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import PassportEngineClient from "@/components/Platform/PassportEngineClient";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "X-Passport Engine | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function XPassportPage() {
  const user = await requirePortalUser();
  return (
    <PortalShell user={user} active="passport">
      <PassportEngineClient />
    </PortalShell>
  );
}

