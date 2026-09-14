// src/lib/xia/model-client.ts
// -----------------------------------------------------------------------------
// The XIA language-model client.
//
// Open models through the Hugging Face router, which speaks the OpenAI
// chat-completions shape. Three rules hold everywhere this is used:
//
//   1. The model explains and extracts. It NEVER decides eligibility. The rules
//      engine is the source of truth; the model puts its output into English.
//   2. Every response is schema-validated before it reaches a user. An invalid
//      response is discarded, not shown.
//   3. Spend is capped in code. An unmetered LLM endpoint behind a public form
//      is a budget incident waiting for a bot to find it.
//
// Configure in .env.local — see docs/env-reference.md. With no key the module
// reports unavailable and every caller falls back to the deterministic path.
// -----------------------------------------------------------------------------

import "server-only";
import { z } from "zod";

const ENDPOINT =
  process.env.XIA_CONVERSATION_MODEL_ENDPOINT || "https://router.huggingface.co/v1/chat/completions";
const API_KEY = process.env.XIA_CONVERSATION_MODEL_API_KEY;
const PROVIDER = process.env.XIA_CONVERSATION_MODEL_PROVIDER || "rules";

/**
 * Three jobs, three models. They are not equally hard, and paying the reasoning
 * price to pull a job title out of a CV is money burnt.
 *
 *   reasoning   decide what to ask next, pick a route — needs judgement
 *   extraction  read a sentence or a CV into fields — needs accuracy, not judgement
 *   writing     rephrase a completed assessment in plain English
 *
 * All three route through the same HF endpoint and the same key. The :cheapest
 * suffix lets the router pick the lowest-priced provider serving that model.
 */
export type ModelTask = "reasoning" | "extraction" | "writing";

const FALLBACK_MODEL = process.env.XIA_CONVERSATION_MODEL || "openai/gpt-oss-120b:cheapest";

const MODELS: Record<ModelTask, string> = {
  reasoning: process.env.XIA_MODEL_REASONING || FALLBACK_MODEL,
  extraction: process.env.XIA_MODEL_EXTRACTION || "meta-llama/Llama-3.1-8B-Instruct:cheapest",
  writing: process.env.XIA_MODEL_WRITING || "openai/gpt-oss-20b:cheapest",
};

/** USD per million tokens, for the in-process spend ledger. Update with the models. */
const PRICES: Record<ModelTask, { input: number; output: number }> = {
  reasoning: { input: 0.037, output: 0.17 },
  extraction: { input: 0.02, output: 0.05 },
  writing: { input: 0.03, output: 0.14 },
};

const MONTHLY_USD_CAP = Number(process.env.XIA_MODEL_MONTHLY_USD_CAP) || 15;
const RATE_LIMIT_PER_IP = Number(process.env.XIA_MODEL_RATE_LIMIT_PER_IP) || 20;

export function isModelEnabled() {
  return Boolean(
    API_KEY && !API_KEY.includes("PASTE_YOUR_TOKEN") && PROVIDER === "openai-compatible",
  );
}

/* ------------------------------ spend ledger ------------------------------ */
// In-process, resets on deploy. Deliberately conservative: a restart can only
// ever under-count spend within one month, and HF's own billing cap is the
// backstop. Move to the platform store if the portal is load-balanced.

let ledgerMonth = new Date().getUTCMonth();
let spentUsd = 0;
const ipCalls = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000;

function rollMonth() {
  const month = new Date().getUTCMonth();
  if (month !== ledgerMonth) {
    ledgerMonth = month;
    spentUsd = 0;
  }
}

function recordSpend(task: ModelTask, promptTokens: number, completionTokens: number) {
  const price = PRICES[task];
  spentUsd += (promptTokens / 1_000_000) * price.input + (completionTokens / 1_000_000) * price.output;
}

export function modelBudgetStatus() {
  rollMonth();
  return {
    spentUsd: Number(spentUsd.toFixed(4)),
    capUsd: MONTHLY_USD_CAP,
    remainingUsd: Number(Math.max(MONTHLY_USD_CAP - spentUsd, 0).toFixed(4)),
    enabled: isModelEnabled(),
    models: MODELS,
  };
}

function withinRateLimit(ip: string) {
  const now = Date.now();
  const record = ipCalls.get(ip);
  if (!record || now - record.windowStart > RATE_WINDOW_MS) {
    ipCalls.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= RATE_LIMIT_PER_IP) return false;
  record.count += 1;
  return true;
}

/* --------------------------------- client --------------------------------- */

export type ModelFailure =
  | "disabled"
  | "budget-exhausted"
  | "rate-limited"
  | "upstream-error"
  | "invalid-response";

export type ModelResult<T> =
  | { ok: true; data: T; usage: { promptTokens: number; completionTokens: number } }
  | { ok: false; reason: ModelFailure };

type CallOptions<T extends z.ZodTypeAny> = {
  system: string;
  user: string;
  schema: T;
  /** Caller's IP, for the per-IP limit. Pass "server" for internal jobs. */
  ip: string;
  /** Which of the three models handles this call. Defaults to reasoning. */
  task?: ModelTask;
  maxTokens?: number;
  temperature?: number;
};

/**
 * Ask the model for JSON matching `schema`. Returns ok:false rather than
 * throwing — every caller must have a deterministic fallback.
 */
export async function callModel<T extends z.ZodTypeAny>(
  options: CallOptions<T>,
): Promise<ModelResult<z.infer<T>>> {
  if (!isModelEnabled()) return { ok: false, reason: "disabled" };

  rollMonth();
  if (spentUsd >= MONTHLY_USD_CAP) {
    console.warn(`[xia] Monthly model budget of $${MONTHLY_USD_CAP} reached; falling back to rules.`);
    return { ok: false, reason: "budget-exhausted" };
  }
  if (!withinRateLimit(options.ip)) return { ok: false, reason: "rate-limited" };

  let payload: unknown;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELS[options.task ?? "reasoning"],
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens ?? 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.user },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      console.warn("[xia] Model endpoint returned", response.status);
      return { ok: false, reason: "upstream-error" };
    }
    payload = await response.json();
  } catch (error) {
    console.warn("[xia] Model call failed; using rules fallback.", error);
    return { ok: false, reason: "upstream-error" };
  }

  const envelope = z
    .object({
      choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1),
      usage: z
        .object({ prompt_tokens: z.number().optional(), completion_tokens: z.number().optional() })
        .optional(),
    })
    .safeParse(payload);

  if (!envelope.success) return { ok: false, reason: "invalid-response" };

  const promptTokens = envelope.data.usage?.prompt_tokens ?? 0;
  const completionTokens = envelope.data.usage?.completion_tokens ?? 0;
  recordSpend(options.task ?? "reasoning", promptTokens, completionTokens);

  let parsed: unknown;
  try {
    parsed = JSON.parse(envelope.data.choices[0].message.content);
  } catch {
    return { ok: false, reason: "invalid-response" };
  }

  const result = options.schema.safeParse(parsed);
  if (!result.success) {
    console.warn("[xia] Model returned JSON that failed schema validation; discarding.");
    return { ok: false, reason: "invalid-response" };
  }

  return { ok: true, data: result.data, usage: { promptTokens, completionTokens } };
}

/** Shared preamble. Repeated deliberately — the boundary is the whole safety model. */
export const XIA_SYSTEM_PREAMBLE = [
  "You are XIA, the assistant for XIPHIAS Immigration.",
  "You never decide eligibility and never invent immigration rules, fees, timelines or guarantees.",
  "You only restate, structure or explain the facts given to you.",
  "If a fact is not in the supplied context, say it is not known rather than filling the gap.",
  "Respond with JSON only, matching the requested shape exactly.",
].join(" ");
