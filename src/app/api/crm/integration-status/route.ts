import { NextResponse } from "next/server";
import { getLegacyCrmIntegrationSnapshot } from "@/lib/crm/legacy-integration-status";
import { getCurrentPortalUser } from "@/lib/platform/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (user.role !== "staff" && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    snapshot: getLegacyCrmIntegrationSnapshot(),
  });
}
