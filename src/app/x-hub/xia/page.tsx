import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import XiaAdvisorClient from "@/components/Platform/XiaAdvisorClient";
import { requirePortalUser } from "@/lib/platform/auth";

export const metadata: Metadata = {
  title: "XIA | XIPHIAS Intelligent Advisor",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function XiaPage() {
  const user = await requirePortalUser();
  return (
    <PortalShell user={user} active="xia">
      <XiaAdvisorClient />
    </PortalShell>
  );
}

