// src/lib/xia/cv-extract.ts
// -----------------------------------------------------------------------------
// Turn an uploaded CV into the fields the assessment forms need.
//
// Until now /api/xia-intelligence/parse-resume returned raw text and nothing
// read it — the upload looked like a feature and behaved like a file picker.
// This module reads that text and fills the form.
//
// The model extracts only what is written in the CV. It does not infer
// eligibility, score anything, or decide which route fits. Every field is
// optional: a CV that does not state something comes back with it missing, and
// the form stays empty rather than being filled with a guess.
// -----------------------------------------------------------------------------

import "server-only";
import { z } from "zod";

import { XIA_SYSTEM_PREAMBLE, callModel } from "./model-client";

export const cvProfileSchema = z.object({
  fullName: z.string().max(120).optional(),
  currentRole: z.string().max(160).optional(),
  field: z
    .enum(["technology", "science", "business", "healthcare", "academia", "arts", "sports", "other"])
    .optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  highestEducation: z
    .enum(["secondary", "diploma", "bachelor", "masters", "doctorate", "unknown"])
    .optional(),
  fieldOfStudy: z.string().max(160).optional(),
  employers: z.array(z.string().max(120)).max(12).optional(),
  countriesWorked: z.array(z.string().max(80)).max(12).optional(),
  publicationCount: z.number().min(0).max(2000).optional(),
  citationCount: z.number().min(0).max(500_000).optional(),
  patentCount: z.number().min(0).max(500).optional(),
  languageTests: z
    .array(z.object({ test: z.string().max(40), score: z.string().max(40) }))
    .max(6)
    .optional(),
  evidenceSignals: z
    .array(
      z.enum([
        "awards",
        "publications",
        "patents",
        "leadership",
        "mediaCoverage",
        "judgingRole",
        "speakingEngagements",
        "professionalMemberships",
        "highSalary",
        "jobOffer",
      ]),
    )
    .max(10)
    .optional(),
  /** Anything the CV states that the fields above do not capture. */
  summary: z.string().max(600).optional(),
});

export type CvProfile = z.infer<typeof cvProfileSchema>;

const SYSTEM = [
  XIA_SYSTEM_PREAMBLE,
  "You are extracting structured facts from a CV so a form can be pre-filled.",
  "Only report what the CV actually states. Omit any field the CV does not support.",
  "Never estimate years of experience from graduation dates — report it only if stated or directly computable from listed employment dates.",
  "Never infer an evidence signal from a job title alone.",
].join(" ");

const SHAPE = `Return JSON with any of these keys that the CV supports:
{"fullName":string,"currentRole":string,"field":"technology|science|business|healthcare|academia|arts|sports|other",
"yearsExperience":number,"highestEducation":"secondary|diploma|bachelor|masters|doctorate|unknown","fieldOfStudy":string,
"employers":string[],"countriesWorked":string[],"publicationCount":number,"citationCount":number,"patentCount":number,
"languageTests":[{"test":string,"score":string}],
"evidenceSignals":("awards"|"publications"|"patents"|"leadership"|"mediaCoverage"|"judgingRole"|"speakingEngagements"|"professionalMemberships"|"highSalary"|"jobOffer")[],
"summary":string}`;

export type CvExtractionResult =
  | { ok: true; profile: CvProfile; source: "model" }
  | { ok: false; reason: string; source: "unavailable" };

export async function extractCvProfile(text: string, ip: string): Promise<CvExtractionResult> {
  const trimmed = text.slice(0, 9_000);
  if (trimmed.length < 120) {
    return { ok: false, reason: "Not enough readable text in the CV to extract anything.", source: "unavailable" };
  }

  const result = await callModel({
    system: SYSTEM,
    user: `${SHAPE}\n\nCV TEXT:\n"""\n${trimmed}\n"""`,
    schema: cvProfileSchema,
    ip,
    task: "extraction",
    maxTokens: 800,
    temperature: 0,
  });

  if (!result.ok) {
    const reason =
      result.reason === "disabled"
        ? "CV reading is not switched on yet — add the model key to enable it."
        : result.reason === "budget-exhausted"
          ? "This month's model budget is used up. The extracted text is still available."
          : result.reason === "rate-limited"
            ? "Too many CV uploads from this connection in the last hour."
            : "The CV could not be read automatically this time.";
    return { ok: false, reason, source: "unavailable" };
  }

  return { ok: true, profile: result.data, source: "model" };
}
