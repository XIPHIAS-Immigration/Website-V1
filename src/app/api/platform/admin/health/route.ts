import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformEmailStatus } from "@/lib/platform/email";
import { getPlatformRepository } from "@/lib/platform/repository";
import { getWhatsAppConfigStatus } from "@/lib/platform/whatsapp";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (!["admin", "staff"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
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
  });
}
