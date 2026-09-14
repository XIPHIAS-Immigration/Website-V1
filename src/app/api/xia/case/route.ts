import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { CASE_COOKIE, CASE_TTL_DAYS, type CaseSource, type XiaCase } from "@/lib/xia/case";
import { getCase, openCase, saveCase } from "@/lib/xia/case-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Only the fields a visitor is allowed to set. Matches are engine-written and
 * are deliberately absent — a client cannot post its own shortlist.
 */
const patchSchema = z
  .object({
    name: z.string().max(120).optional(),
    email: z.string().email().max(160).optional(),
    phone: z.string().max(40).optional(),
    nationality: z.string().max(80).optional(),
    residence: z.string().max(80).optional(),
    age: z.number().int().min(16).max(99).optional(),
    destination: z.string().max(80).optional(),
    goal: z.string().max(40).optional(),
    profile: z.string().max(40).optional(),
    timelineMonths: z.number().int().min(0).max(120).optional(),
    family: z.string().max(20).optional(),
    dependants: z.number().int().min(0).max(12).optional(),
    budgetUsd: z.number().min(0).max(50_000_000).optional(),
    education: z.string().max(60).optional(),
    fieldOfStudy: z.string().max(120).optional(),
    occupation: z.string().max(120).optional(),
    yearsExperience: z.number().min(0).max(60).optional(),
    canadianWorkYears: z.number().min(0).max(60).optional(),
    languageTest: z.string().max(40).optional(),
    languageScores: z
      .object({
        speaking: z.number().min(0).max(12).optional(),
        listening: z.number().min(0).max(12).optional(),
        reading: z.number().min(0).max(12).optional(),
        writing: z.number().min(0).max(12).optional(),
      })
      .optional(),
    publicationCount: z.number().int().min(0).max(5000).optional(),
    citationCount: z.number().int().min(0).max(1_000_000).optional(),
    patentCount: z.number().int().min(0).max(1000).optional(),
    previousRefusal: z.boolean().optional(),
    criminalRecord: z.boolean().optional(),
    notes: z.string().max(4000).optional(),
    resumeFileName: z.string().max(200).optional(),
    resumeText: z.string().max(14_000).optional(),
    consent: z.object({ marketing: z.boolean(), at: z.string() }).optional(),
    event: z
      .object({ kind: z.string().max(40), detail: z.string().max(160).optional() })
      .optional(),
  })
  .strict();

const SOURCES: CaseSource[] = ["hero", "dock", "tool", "programme-page", "checkout", "advisor", "unknown"];

function withCookie(response: NextResponse, item: XiaCase) {
  response.cookies.set(CASE_COOKIE, item.id, {
    httpOnly: false, // the client hook reads it to survive a hard refresh
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CASE_TTL_DAYS * 86_400,
  });
  return response;
}

/** Return the current case, opening one if this is a first visit. */
export async function GET(req: NextRequest) {
  const id = req.cookies.get(CASE_COOKIE)?.value;
  const existing = id ? getCase(id) : null;
  const sourceParam = req.nextUrl.searchParams.get("source") as CaseSource | null;
  const source = sourceParam && SOURCES.includes(sourceParam) ? sourceParam : "unknown";
  const item = existing ?? openCase(source);
  return withCookie(NextResponse.json({ ok: true, case: item }), item);
}

/** Merge answers into the case. Additive — a patch never deletes an answer. */
export async function PATCH(req: NextRequest) {
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Unrecognised field in patch." }, { status: 400 });
  }

  const { event, ...fields } = parsed.data;
  const id = req.cookies.get(CASE_COOKIE)?.value;
  const sourceParam = req.nextUrl.searchParams.get("source") as CaseSource | null;
  const source = sourceParam && SOURCES.includes(sourceParam) ? sourceParam : "unknown";

  const item = saveCase(
    id,
    {
      ...(fields as Partial<XiaCase>),
      ...(event
        ? { events: [{ at: new Date().toISOString(), kind: event.kind as never, detail: event.detail }] }
        : {}),
    },
    source,
  );

  return withCookie(NextResponse.json({ ok: true, case: item }), item);
}

/**
 * sendBeacon can only POST, and the client uses it to flush a pending answer on
 * tab close. Same semantics as PATCH.
 */
export const POST = PATCH;
