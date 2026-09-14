// src/lib/xia/report-narrative.ts
// -----------------------------------------------------------------------------
// AI-written narrative for the paid reports, with a hard numeric guard.
//
// Every report product currently ships with `maxNarrativeSections: 0` — the
// personalised prose was switched off, almost certainly because writing it by
// hand for every case does not scale. That is exactly what a model is for, and
// exactly where a model is most dangerous on a regulated document.
//
// THE CONTRACT, and it is absolute:
//
//   * Code supplies every number, fee, date, score, threshold and rule.
//   * The model may only arrange those facts into prose addressed to this client.
//   * Before a section reaches the PDF, every number it contains is checked
//     against the supplied facts. One figure we did not provide and the whole
//     section is discarded in favour of the deterministic text.
//
// A report that quotes a fee we never gave it does not get written, let alone
// delivered. That is what makes this safe to sell at ₹4,999.
// -----------------------------------------------------------------------------

import "server-only";
import { z } from "zod";

import { XIA_SYSTEM_PREAMBLE, callModel, type ModelTask } from "./model-client";

export type NarrativeFacts = {
  /** Who this is for. Used for address and tone, never for claims. */
  clientName?: string;
  nationality?: string;
  destination?: string;
  goal?: string;
  /** The programme this section is about. */
  programme: string;
  programmeSummary: string;
  /** Requirements met, verbatim from the rule engine. */
  met: string[];
  /** Gaps, verbatim from the rule engine. */
  gaps: string[];
  /** Every figure the model is permitted to use, with its meaning. */
  figures: Array<{ label: string; value: string }>;
  /** Where the rules came from, and when they were last checked. */
  source: { url: string; lastVerified: string };
};

const sectionSchema = z.object({
  heading: z.string().max(120),
  paragraphs: z.array(z.string().max(1200)).min(2).max(6),
});

export type NarrativeSection = z.infer<typeof sectionSchema>;

const SYSTEM = [
  XIA_SYSTEM_PREAMBLE,
  "You are writing one section of a paid immigration report for a named client.",
  "Write in clear, plain professional English. No marketing language, no reassurance, no predictions of success.",
  "You may ONLY use the facts, requirements and figures supplied. You may not introduce any number, fee, date, processing time, score, threshold or statistic that is not in the FIGURES list.",
  "Do not promise an outcome, estimate a probability, or characterise a case as strong or weak beyond what the met/gap lists state.",
  "Where something is unknown, say plainly that it needs to be established, and name what would establish it.",
].join(" ");

/* -------------------------------------------------------------------------- */
/*  The numeric guard                                                          */
/* -------------------------------------------------------------------------- */

/** Digit groups a model may legitimately produce without us supplying them. */
const SAFE_PATTERNS = [
  /^(19|20)\d{2}$/,              // a year
  /^[1-9]$|^1[0-2]$/,            // small counts: "three of ten criteria"
];

function numbersIn(text: string): string[] {
  return (text.match(/\d[\d,.]*/g) ?? []).map((value) => value.replace(/[.,]$/, ""));
}

/**
 * True when every number in the draft appears in the supplied facts.
 *
 * Deliberately strict and deliberately dumb: a false rejection costs us a
 * paragraph of nicer prose, a false acceptance costs a client a wrong fee.
 */
export function numbersAreSupplied(draft: NarrativeSection, facts: NarrativeFacts) {
  const allowed = new Set<string>();
  for (const figure of facts.figures) {
    for (const value of numbersIn(figure.value)) allowed.add(value);
    for (const value of numbersIn(figure.label)) allowed.add(value);
  }
  for (const line of [...facts.met, ...facts.gaps, facts.programmeSummary, facts.programme]) {
    for (const value of numbersIn(line)) allowed.add(value);
  }

  const used = [draft.heading, ...draft.paragraphs].flatMap(numbersIn);
  const unsupplied = used.filter(
    (value) => !allowed.has(value) && !SAFE_PATTERNS.some((pattern) => pattern.test(value)),
  );

  return { ok: unsupplied.length === 0, unsupplied };
}

/* -------------------------------------------------------------------------- */
/*  Generation                                                                 */
/* -------------------------------------------------------------------------- */

export type NarrativeResult =
  | { ok: true; section: NarrativeSection }
  | { ok: false; reason: "disabled" | "unavailable" | "failed-number-check" };

export async function writeNarrativeSection(
  facts: NarrativeFacts,
  opts: { task?: ModelTask; ip?: string } = {},
): Promise<NarrativeResult> {
  const prompt = [
    'Return JSON: {"heading":string,"paragraphs":string[]}',
    "",
    `CLIENT: ${facts.clientName || "the client"}${facts.nationality ? `, a ${facts.nationality} national` : ""}`,
    facts.destination ? `DESTINATION: ${facts.destination}` : "",
    facts.goal ? `OBJECTIVE: ${facts.goal}` : "",
    "",
    `PROGRAMME: ${facts.programme}`,
    `WHAT IT IS: ${facts.programmeSummary}`,
    "",
    "REQUIREMENTS THIS CLIENT MEETS:",
    ...(facts.met.length ? facts.met.map((line) => `- ${line}`) : ["- none established yet"]),
    "",
    "GAPS AND OPEN QUESTIONS:",
    ...(facts.gaps.length ? facts.gaps.map((line) => `- ${line}`) : ["- none identified"]),
    "",
    "FIGURES — the ONLY numbers you may use:",
    ...facts.figures.map((figure) => `- ${figure.label}: ${figure.value}`),
    "",
    `SOURCE: ${facts.source.url} (rules last verified ${facts.source.lastVerified})`,
    "",
    "Write 3 to 5 paragraphs: where this client stands against this programme, what the gaps mean in practice, and the order things need to happen in.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await callModel({
    system: SYSTEM,
    user: prompt,
    schema: sectionSchema,
    ip: opts.ip ?? "server",
    task: opts.task ?? "writing",
    maxTokens: 1100,
    temperature: 0.25,
  });

  if (!result.ok) {
    return { ok: false, reason: result.reason === "disabled" ? "disabled" : "unavailable" };
  }

  const check = numbersAreSupplied(result.data, facts);
  if (!check.ok) {
    console.warn(
      `[xia] Narrative for "${facts.programme}" discarded — used unsupplied figures: ${check.unsupplied.join(", ")}`,
    );
    return { ok: false, reason: "failed-number-check" };
  }

  return { ok: true, section: result.data };
}

/**
 * Write several sections, never letting one failure take down a report.
 * Any section that fails simply does not appear; the deterministic content that
 * the template already produces stands on its own.
 */
export async function writeNarrativeSections(
  items: NarrativeFacts[],
  opts: { task?: ModelTask } = {},
): Promise<NarrativeSection[]> {
  const results = await Promise.all(items.map((facts) => writeNarrativeSection(facts, opts)));
  return results.flatMap((result) => (result.ok ? [result.section] : []));
}
