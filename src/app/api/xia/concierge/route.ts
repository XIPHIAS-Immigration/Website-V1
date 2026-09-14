import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  nextConciergeStep,
  readOpeningMessage,
  type ConciergeLanguage,
} from "@/lib/xia/concierge";
import { CONCIERGE_FIELDS, type ConciergeState } from "@/lib/xia/concierge-catalogue";
import { isModelEnabled } from "@/lib/xia/model-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  state: z.record(z.string(), z.string().max(80)).default({}),
  message: z.string().max(600).optional(),
  language: z.enum(["en", "hi", "kn"]).default("en"),
  step: z.number().int().min(0).max(8).default(0),
  /** True only for the very first free-text message, which we also mine for facts. */
  isOpening: z.boolean().default(false),
});

/**
 * A language model asked to extract a field it cannot find will sometimes answer
 * with the word for "nothing" rather than omitting the key. Those strings then
 * render straight into an input box, which is how a visitor ends up looking at a
 * field that says "null". Drop them here, once, for every caller.
 */
const JUNK = new Set([
  "null", "undefined", "none", "n/a", "na", "nil", "unknown", "not specified",
  "not mentioned", "not provided", "-", "--", "", "string", "any",
]);

function meaningful(value: unknown): value is string {
  return typeof value === "string" && !JUNK.has(value.trim().toLowerCase());
}

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const ip = clientIp(req);
  const { message, language, step, isOpening } = parsed.data;

  // Only keep state keys the catalogue knows about — the client cannot smuggle
  // extra fields into the model prompt.
  const state: ConciergeState = {};
  for (const field of CONCIERGE_FIELDS) {
    const value = parsed.data.state[field];
    if (meaningful(value)) state[field] = value.trim();
  }

  let merged = state;
  if (isOpening && message) {
    const extracted = await readOpeningMessage(message, language as ConciergeLanguage, ip);
    const clean: ConciergeState = {};
    for (const field of CONCIERGE_FIELDS) {
      const value = (extracted as Record<string, unknown>)[field];
      if (meaningful(value)) clean[field] = value.trim();
    }
    merged = { ...clean, ...state };
  }

  const next = await nextConciergeStep(
    { state: merged, message, language: language as ConciergeLanguage, step },
    ip,
  );

  return NextResponse.json({
    ok: true,
    state: merged,
    step: next,
    modelEnabled: isModelEnabled(),
  });
}
