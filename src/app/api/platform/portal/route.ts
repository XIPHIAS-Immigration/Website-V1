import { NextResponse } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const repo = getPlatformRepository();
  repo.audit("portal.viewed", "portal", user.id, user.id, { role: user.role });
  return NextResponse.json({ ok: true, snapshot: repo.snapshotForUser(user) });
}

