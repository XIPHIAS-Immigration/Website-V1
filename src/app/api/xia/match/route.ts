import { NextResponse, type NextRequest } from "next/server";

import { CASE_COOKIE, type XiaCase } from "@/lib/xia/case";
import { getCase, saveCase } from "@/lib/xia/case-store";
import { matchProgrammes, nextQuestions, sharpeningQuestion } from "@/lib/xia/match";

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
    return NextResponse.json({ ok: true, matches: [], question: null, questions: [], case: null });
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

  // `questions` is what the routes on this shortlist are actually waiting on —
  // capital and family for an investment route, age and language for a points
  // one. Functions are not serialisable, so `toPatch` is applied client-side
  // from the same catalogue; the wire format carries data only.
  const asks = nextQuestions(item, 3).map((ask) => ({
    field: ask.field,
    rail: ask.rail,
    question: ask.question,
    chips: ask.chips,
  }));

  return NextResponse.json({
    ok: true,
    matches,
    questions: asks,
    question: sharpeningQuestion(item),
  });
}
