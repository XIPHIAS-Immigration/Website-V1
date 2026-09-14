// src/lib/xia/explain.ts
// -----------------------------------------------------------------------------
// Put the rules engine's output into plain English.
//
// The engine decides. This only rephrases what it decided, and is given nothing
// else to work from — so it cannot invent a route, a fee or a timeline.
// -----------------------------------------------------------------------------

import "server-only";
import { z } from "zod";

import { XIA_SYSTEM_PREAMBLE, callModel } from "./model-client";

const explanationSchema = z.object({
  headline: z.string().max(160),
  paragraphs: z.array(z.string().max(600)).min(1).max(3),
  nextQuestion: z.string().max(200).optional(),
});

export type Explanation = z.infer<typeof explanationSchema>;

export type AssessmentFacts = {
  topRoutes: Array<{ title: string; country: string; fitScore: number; confidence: number; reasons: string[]; warnings: string[] }>;
  knockouts: string[];
  missingInputs: string[];
};

const SYSTEM = [
  XIA_SYSTEM_PREAMBLE,
  "You are writing a short, plain-English summary of an assessment that has already been completed by a rules engine.",
  "Use only the routes, reasons, warnings and gaps supplied. Do not add routes, countries, costs, timelines or probabilities.",
  "Write for an intelligent person who is not an immigration specialist. No jargon, no hedging padding, no sales language.",
  "If a mandatory requirement is unmet, say so first and plainly.",
].join(" ");

export async function explainAssessment(
  facts: AssessmentFacts,
  ip: string,
): Promise<Explanation | null> {
  const result = await callModel({
    system: SYSTEM,
    user: [
      'Return JSON: {"headline":string,"paragraphs":string[],"nextQuestion":string}',
      "",
      "ASSESSMENT FACTS:",
      JSON.stringify(facts, null, 2),
    ].join("\n"),
    schema: explanationSchema,
    ip,
    task: "writing",
    maxTokens: 500,
    temperature: 0.2,
  });

  return result.ok ? result.data : null;
}
