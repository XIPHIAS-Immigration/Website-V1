import { NextResponse, type NextRequest } from "next/server";
import { rankMobilityPrograms } from "@/lib/platform/passport";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const result = rankMobilityPrograms({
    nationality: normalizeText(body.nationality, 80) || undefined,
    targetRegions: Array.isArray(body.targetRegions)
      ? body.targetRegions.map((item: unknown) => normalizeText(item, 80)).filter(Boolean)
      : [],
    budgetUsd: Number.isFinite(Number(body.budgetUsd)) ? Number(body.budgetUsd) : undefined,
    timelineMonths: Number.isFinite(Number(body.timelineMonths)) ? Number(body.timelineMonths) : undefined,
    includeFamily: body.includeFamily === true,
    priorities: Array.isArray(body.priorities)
      ? body.priorities.map((item: unknown) => normalizeText(item, 80)).filter(Boolean)
      : [],
  });

  return NextResponse.json({ ok: true, result });
}
