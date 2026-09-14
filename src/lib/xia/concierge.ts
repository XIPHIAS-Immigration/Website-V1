// src/lib/xia/concierge.ts
// -----------------------------------------------------------------------------
// The concierge brain.
//
// One turn in, one turn out. The model reads what is already known and decides
// what genuinely matters next — which is the difference between understanding
// someone and matching keywords. It may:
//
//   * write the reply and the next question in its own words
//   * choose WHICH field to ask about, or skip straight to routing
//   * choose which of our real pages to send them to
//
// It may NOT invent a country, a programme, an option value or a URL. Every
// field name, option value and href in its response is checked against the
// catalogue before anything is returned; one bad value and the whole response is
// discarded in favour of the deterministic ladder. A visitor never sees a
// hallucination because a hallucinated response never leaves this file.
// -----------------------------------------------------------------------------

import "server-only";
import { z } from "zod";

import { XIA_SYSTEM_PREAMBLE, callModel } from "./model-client";
import {
  CONCIERGE_FIELDS,
  FIELD_OPTIONS,
  FIELD_PROMPT_HINT,
  ROUTE_BY_HREF,
  ROUTE_TARGETS,
  buildRouteHref,
  missingFields,
  type ConciergeField,
  type ConciergeState,
  type Option,
} from "./concierge-catalogue";

export type ConciergeLanguage = "en" | "hi" | "kn";

export type ConciergeTurn = {
  state: ConciergeState;
  /** What the visitor typed or picked this turn. */
  message?: string;
  language: ConciergeLanguage;
  /** How many questions have already been asked. Keeps the flow short. */
  step: number;
};

export type ConciergeStep = {
  reply: string;
  question: string | null;
  field: ConciergeField | null;
  options: Option[];
  allowFreeText: boolean;
  route: { href: string; label: string; reason: string } | null;
  /** Where the answer came from, so the UI can show an honest badge. */
  source: "model" | "guided";
};

const MAX_QUESTIONS = 4;

const LANGUAGE_NAME: Record<ConciergeLanguage, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
};

/* --------------------------- deterministic ladder -------------------------- */
// Runs whenever the model is off, over budget, unreachable, or returns anything
// that fails validation. The concierge therefore works with no API key at all —
// it is simply less conversational.

const GUIDED_QUESTIONS: Record<ConciergeField, string> = {
  goal: "What are you hoping this move achieves?",
  destination: "Where are you thinking of going?",
  profile: "Which of these describes you best?",
  timeline: "How soon would you want to move?",
  family: "Who would be coming with you?",
  nationality: "Which passport do you hold today?",
};

function guidedStep(turn: ConciergeTurn): ConciergeStep {
  const missing = missingFields(turn.state);

  if (turn.step >= MAX_QUESTIONS || missing.length === 0) {
    const target = pickRouteDeterministically(turn.state);
    return {
      reply: "Here is the most useful place to start with what you have told me.",
      question: null,
      field: null,
      options: [],
      allowFreeText: false,
      route: target,
      source: "guided",
    };
  }

  const field = missing[0];
  return {
    reply: turn.step === 0 ? "Let's narrow this down — two or three questions, no forms." : "",
    question: GUIDED_QUESTIONS[field],
    field,
    options: FIELD_OPTIONS[field],
    allowFreeText: field === "nationality" || field === "destination",
    route: null,
    source: "guided",
  };
}

function pickRouteDeterministically(state: ConciergeState) {
  const href = (() => {
    if (state.destination === "united states") return "/us-visa-intelligence";
    if (state.goal === "citizenship") return "/citizenship";
    if (state.goal === "investment") return "/residency";
    if (state.goal === "business-setup") return "/corporate";
    if (state.goal === "work-visa" || state.profile === "professional") return "/route-intelligence";
    if (state.profile === "researcher" || state.profile === "student") return "/deep-analysis";
    if (state.goal === "not-sure" && !state.destination) return "/programme-explorer";
    return "/route-intelligence";
  })();

  const target = ROUTE_BY_HREF.get(href);
  const built = buildRouteHref(href, state);
  if (!target || !built) return null;

  return {
    href: built,
    label: target.label,
    reason: "Based on what you have told me so far.",
  };
}

/* ------------------------------- model path ------------------------------- */

const modelStepSchema = z.object({
  reply: z.string().max(320),
  question: z.string().max(200).nullable(),
  field: z.string().nullable(),
  optionValues: z.array(z.string().max(60)).max(8),
  allowFreeText: z.boolean(),
  routeHref: z.string().max(120).nullable(),
  routeReason: z.string().max(200).nullable(),
});

function systemPrompt(language: ConciergeLanguage) {
  return [
    XIA_SYSTEM_PREAMBLE,
    `You are the first thing a visitor meets on the XIPHIAS Immigration website. Reply in ${LANGUAGE_NAME[language]}.`,
    "Your job is to understand what this person actually came for and send them to the right place in at most four short questions.",
    "Be warm and extremely direct. No sales language, no filler, no flattery, no emoji. One or two sentences maximum in `reply`.",
    "You never assess eligibility, quote a fee, promise an outcome, or state an immigration rule. You route.",
    "Ask about the thing that would change the answer most, not the next item on a list. If someone has already told you enough, route them immediately rather than asking a fourth question for the sake of it.",
    "If they say they only want to browse or explore, respect that and route them somewhere they can browse.",
    "`field` must be one of the allowed field names or null. `optionValues` must be chosen from the allowed values for that field and may be a shorter, smarter subset. `routeHref` must be one of the allowed hrefs or null.",
  ].join(" ");
}

function userPrompt(turn: ConciergeTurn) {
  const known = Object.entries(turn.state)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");

  const fieldCatalogue = CONCIERGE_FIELDS.map((field) => {
    const values = FIELD_OPTIONS[field].map((option) => option.value);
    return `- ${field} (${FIELD_PROMPT_HINT[field]}): ${values.length ? values.join(" | ") : "free text"}`;
  }).join("\n");

  const routeCatalogue = ROUTE_TARGETS.map(
    (target) => `- ${target.href} — ${target.label}. ${target.suitedTo}`,
  ).join("\n");

  return [
    'Return JSON: {"reply":string,"question":string|null,"field":string|null,"optionValues":string[],"allowFreeText":boolean,"routeHref":string|null,"routeReason":string|null}',
    "",
    `QUESTIONS ASKED SO FAR: ${turn.step} of a maximum ${MAX_QUESTIONS}.`,
    `ALREADY KNOWN: ${known || "nothing yet"}`,
    turn.message ? `THE VISITOR JUST SAID: "${turn.message.slice(0, 400)}"` : "THE VISITOR HAS JUST ARRIVED.",
    "",
    "ALLOWED FIELDS AND THEIR ALLOWED VALUES:",
    fieldCatalogue,
    "",
    "ALLOWED ROUTES:",
    routeCatalogue,
    "",
    "Either ask one more question (set field and optionValues, routeHref null) or route them now (set routeHref, field null, question null).",
  ].join("\n");
}

/** Everything the model returned is checked here. Anything unknown is a discard. */
function validateModelStep(
  raw: z.infer<typeof modelStepSchema>,
  state: ConciergeState,
): ConciergeStep | null {
  const field = raw.field && (CONCIERGE_FIELDS as readonly string[]).includes(raw.field)
    ? (raw.field as ConciergeField)
    : null;

  if (raw.field && !field) return null; // invented a field name
  if (!field && !raw.routeHref) return null; // asked nothing and routed nowhere

  let options: Option[] = [];
  if (field) {
    const allowed = FIELD_OPTIONS[field];
    if (allowed.length) {
      options = raw.optionValues
        .map((value) => allowed.find((option) => option.value === value))
        .filter((option): option is Option => Boolean(option));
      // The model offered only values we do not have — do not silently show none.
      if (!options.length) options = allowed;
    }
  }

  let route: ConciergeStep["route"] = null;
  if (raw.routeHref) {
    const target = ROUTE_BY_HREF.get(raw.routeHref);
    if (!target) return null; // invented a URL
    const built = buildRouteHref(raw.routeHref, state);
    if (!built) return null;
    route = {
      href: built,
      label: target.label,
      reason: raw.routeReason?.slice(0, 200) || "Based on what you have told me.",
    };
  }

  return {
    reply: raw.reply,
    question: field ? raw.question : null,
    field,
    options,
    allowFreeText: field ? raw.allowFreeText || !FIELD_OPTIONS[field].length : false,
    route,
    source: "model",
  };
}

export async function nextConciergeStep(turn: ConciergeTurn, ip: string): Promise<ConciergeStep> {
  if (turn.step >= MAX_QUESTIONS) return guidedStep(turn);

  const result = await callModel({
    system: systemPrompt(turn.language),
    user: userPrompt(turn),
    schema: modelStepSchema,
    ip,
    task: "reasoning",
    maxTokens: 320,
    temperature: 0.35,
  });

  if (!result.ok) return guidedStep(turn);

  const validated = validateModelStep(result.data, turn.state);
  if (!validated) {
    console.warn("[xia] Concierge response failed catalogue validation; using guided ladder.");
    return guidedStep(turn);
  }

  return validated;
}

/**
 * Read a free-text opening line into whatever state it already reveals, so the
 * concierge never asks something the visitor has just told it.
 */
export const openingExtractionSchema = z.object({
  destination: z.string().max(60).nullable(),
  goal: z.string().max(40).nullable(),
  profile: z.string().max(40).nullable(),
  nationality: z.string().max(60).nullable(),
});

export async function readOpeningMessage(
  message: string,
  language: ConciergeLanguage,
  ip: string,
): Promise<ConciergeState> {
  if (message.trim().length < 8) return {};

  const result = await callModel({
    system: [
      XIA_SYSTEM_PREAMBLE,
      `The visitor wrote this in ${LANGUAGE_NAME[language]}. Extract only what they explicitly said.`,
      "Use null for anything they did not say. Never infer a goal from a country, or a country from a goal.",
    ].join(" "),
    user: [
      'Return JSON: {"destination":string|null,"goal":string|null,"profile":string|null,"nationality":string|null}',
      `destination must be one of: ${FIELD_OPTIONS.destination.map((o) => o.value).join(" | ")} or null`,
      `goal must be one of: ${FIELD_OPTIONS.goal.map((o) => o.value).join(" | ")} or null`,
      `profile must be one of: ${FIELD_OPTIONS.profile.map((o) => o.value).join(" | ")} or null`,
      "nationality is a country name in English, or null.",
      "",
      `VISITOR: "${message.slice(0, 400)}"`,
    ].join("\n"),
    schema: openingExtractionSchema,
    ip,
    task: "extraction",
    maxTokens: 160,
    temperature: 0,
  });

  if (!result.ok) return {};

  const state: ConciergeState = {};
  const keep = (field: ConciergeField, value: string | null) => {
    if (!value) return;
    const allowed = FIELD_OPTIONS[field];
    if (!allowed.length || allowed.some((option) => option.value === value)) {
      state[field] = value;
    }
  };
  keep("destination", result.data.destination);
  keep("goal", result.data.goal);
  keep("profile", result.data.profile);
  if (result.data.nationality) state.nationality = result.data.nationality;

  return state;
}
