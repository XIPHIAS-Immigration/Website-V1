import "server-only";

import type { XiaRecommendation } from "./types";

type ConversationInput = {
  userMessage: string;
  recommendation: XiaRecommendation;
};

type ConversationResult = {
  text: string;
  provider: "ollama" | "openai-compatible";
  model: string;
};

function trimAnswer(value: unknown) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 420);
}

function systemPrompt() {
  return [
    "You are XIA, a polite immigration advisory assistant for XIPHIAS.",
    "Use only the supplied recommendation facts.",
    "Do not invent immigration rules, prices, guarantees, or timelines.",
    "Keep the answer warm, direct, and under 70 words.",
    "End with one useful follow-up question.",
  ].join(" ");
}

function userPrompt(input: ConversationInput) {
  const programs = input.recommendation.recommendedPrograms
    .slice(0, 3)
    .map((program) => `${program.name}${program.country ? ` (${program.country})` : ""}: ${program.reason}`)
    .join("\n");

  return [
    `User said: ${input.userMessage || "No message"}`,
    `Intent: ${input.recommendation.intent}`,
    `Current safe summary: ${input.recommendation.summary}`,
    programs ? `Candidate routes:\n${programs}` : "Candidate routes: none",
  ].join("\n\n");
}

async function generateWithOllama(input: ConversationInput): Promise<ConversationResult | null> {
  const endpoint = process.env.XIA_CONVERSATION_MODEL_ENDPOINT || "http://127.0.0.1:11434/api/chat";
  const model = process.env.XIA_CONVERSATION_MODEL || "qwen2.5:0.5b-instruct";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(input) },
      ],
      options: {
        temperature: 0.2,
        num_predict: 120,
      },
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json().catch(() => ({}))) as { message?: { content?: string }; response?: string };
  const text = trimAnswer(data.message?.content || data.response);
  return text ? { text, provider: "ollama", model } : null;
}

async function generateWithOpenAICompatible(input: ConversationInput): Promise<ConversationResult | null> {
  const endpoint = process.env.XIA_CONVERSATION_MODEL_ENDPOINT;
  const apiKey = process.env.XIA_CONVERSATION_MODEL_API_KEY;
  const model = process.env.XIA_CONVERSATION_MODEL || "small-chat-model";
  if (!endpoint || !apiKey) return null;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(input) },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = trimAnswer(data.choices?.[0]?.message?.content);
  return text ? { text, provider: "openai-compatible", model } : null;
}

export async function generateConversationalSummary(input: ConversationInput): Promise<ConversationResult | null> {
  const provider = process.env.XIA_CONVERSATION_MODEL_PROVIDER;
  if (!provider || provider === "rules") return null;

  try {
    if (provider === "ollama") return await generateWithOllama(input);
    if (provider === "openai-compatible") return await generateWithOpenAICompatible(input);
  } catch (error) {
    console.warn("[xia] Conversation model unavailable; using rules summary.", error);
  }

  return null;
}
