import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import PlatformHealthClient from "@/components/Platform/PlatformHealthClient";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformEmailStatus } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { getWhatsAppConfigStatus } from "@/lib/platform/whatsapp";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";

export const metadata: Metadata = {
  title: "Platform Health | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PlatformHealthPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const health = {
    generatedAt: new Date().toISOString(),
    storage: getPlatformRepository().storageMode(),
    email: getPlatformEmailStatus(),
    whatsapp: getWhatsAppConfigStatus(),
    registration: {
      topmateUrlConfigured: Boolean(TOPMATE_REGISTRATION_URL),
      webhookSecretConfigured: Boolean(process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET),
      provisioningMode: process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET
        ? "protected"
        : process.env.NODE_ENV === "production"
          ? "blocked"
          : "local-demo",
    },
    compliance: {
      mode: process.env.COMPLIANCE_VENDOR_ENDPOINT ? "vendor" : "demo",
      endpointConfigured: Boolean(process.env.COMPLIANCE_VENDOR_ENDPOINT),
      apiKeyConfigured: Boolean(process.env.COMPLIANCE_VENDOR_API_KEY),
      provider: process.env.COMPLIANCE_VENDOR_NAME || "XIPHIAS demo compliance screen",
    },
    uploads: {
      mode: process.env.XIPHIAS_UPLOAD_DIR ? "custom" : "local-file",
      configuredDirectory: process.env.XIPHIAS_UPLOAD_DIR || ".xiphias-platform/uploads",
    },
  };

  return (
    <PortalShell user={user} active="health">
      <PlatformHealthClient initialHealth={health} />
    </PortalShell>
  );
}
