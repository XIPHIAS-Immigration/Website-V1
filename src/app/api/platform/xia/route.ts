import { NextResponse, type NextRequest } from "next/server";
import { getXiaRecommendation } from "@/lib/platform/xia";
import { generateConversationalSummary } from "@/lib/platform/conversation-model";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { isTrack } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const message = normalizeText(body.message, 1600);
  const track = isTrack(body.track) ? body.track : undefined;
  const recommendation = getXiaRecommendation({
    message,
    track,
    answers: body.answers && typeof body.answers === "object" ? body.answers : undefined,
    goals: Array.isArray(body.goals) ? body.goals.map((goal: unknown) => normalizeText(goal, 80)).filter(Boolean) : undefined,
    country: normalizeText(body.country, 80) || undefined,
  });
  const modelAnswer = await generateConversationalSummary({ userMessage: message, recommendation });
  if (modelAnswer?.text) {
    recommendation.summary = modelAnswer.text;
  }

  let lead = null;
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  if (name && (email || phone)) {
    lead = getPlatformRepository().createLead({
      source: "chat",
      name,
      email: email || undefined,
      phone: phone || undefined,
      track,
      country: normalizeText(body.country, 80) || undefined,
      message,
      consent: parseBoolean(body.consent),
      tags: ["xia-lite", recommendation.intent],
    });
  }

  return NextResponse.json({
    ok: true,
    recommendation,
    lead,
    conversationModel: modelAnswer
      ? { provider: modelAnswer.provider, model: modelAnswer.model }
      : { provider: "rules" },
  });
}
