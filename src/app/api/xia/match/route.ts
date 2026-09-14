import { NextResponse, type NextRequest } from "next/server";

import { CASE_COOKIE, type XiaCase } from "@/lib/xia/case";
import { getCase, saveCase } from "@/lib/xia/case-store";
import { matchProgrammes, sharpeningQuestion } from "@/lib/xia/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Programme cards for the current case. Deterministic and fast — no model call
 * sits in this path, because the visitor is waiting on it.
 */
export async function GET(req: NextRequest) {
  const id = req.cookies.get(CASE_COOKIE)?.value;
  const item = id ? getCase(id) : null;

  if (!item) {
    return NextResponse.json({ ok: true, matches: [], question: null, case: null });
  }

  const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 3, 1), 12);
  const includeClosed = req.nextUrl.searchParams.get("closed") === "1";
  const matches = matchProgrammes(item, { limit, includeClosed });

  // Store the shortlist on the case so checkout and the report builder inherit it.
  saveCase(item.id, {
    matches,
    events: [
      {
        at: new Date().toISOString(),
        kind: "shortlisted",
        detail: matches.map((match) => match.programmeId).join(","),
      },
    ],
  } as Partial<XiaCase>);

  return NextResponse.json({
    ok: true,
    matches,
    question: sharpeningQuestion(item),
  });
}
