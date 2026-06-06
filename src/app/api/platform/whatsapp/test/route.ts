import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizePhone, normalizeText } from "@/lib/platform/sanitize";
import { getWhatsAppConfigStatus, sendWhatsAppText } from "@/lib/platform/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireOperator() {
  const user = await getCurrentPortalUser();
  if (!user) return { response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  if (!["admin", "staff"].includes(user.role)) {
    return { response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const guard = await requireOperator();
  if (guard.response) return guard.response;
  return NextResponse.json({ ok: true, whatsapp: getWhatsAppConfigStatus() });
}

export async function POST(req: NextRequest) {
  const guard = await requireOperator();
  if (guard.response) return guard.response;

  const body = await req.json().catch(() => ({}));
  const to = normalizePhone(body.to) || process.env.WHATSAPP_TO || "";
  const message =
    normalizeText(body.message, 800) ||
    `XIPHIAS WhatsApp integration test at ${new Date().toISOString()}.`;

  const result = await sendWhatsAppText(to, message);
  getPlatformRepository().audit("whatsapp.tested", "whatsapp", "cloud-api", guard.user?.id, {
    result: result.status,
    reason: "reason" in result ? result.reason : undefined,
  });

  return NextResponse.json({ ok: result.status === "sent", result, whatsapp: getWhatsAppConfigStatus() });
}
