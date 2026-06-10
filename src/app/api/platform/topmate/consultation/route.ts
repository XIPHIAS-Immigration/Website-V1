import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getByPath(input: Payload, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Payload)[part];
  }, input);
}

function pickText(input: Payload, keys: string[], max = 240) {
  for (const key of keys) {
    const value = normalizeText(getByPath(input, key), max);
    if (value) return value;
  }
  return "";
}

function authorized(req: NextRequest, body: Payload) {
  const configured =
    normalizeText(process.env.XIPHIAS_TOPMATE_WEBHOOK_SECRET, 240) ||
    normalizeText(process.env.XIPHIAS_REGISTRATION_WEBHOOK_SECRET, 240);
  const supplied =
    normalizeText(req.headers.get("x-topmate-secret"), 240) ||
    normalizeText(req.headers.get("x-webhook-secret"), 240) ||
    normalizeText(body.secret, 240);

  if (configured) return Boolean(supplied && safeEqual(supplied, configured));
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  if (!authorized(req, body)) {
    return NextResponse.json({ ok: false, error: "Unauthorized webhook." }, { status: 401 });
  }

  const name =
    pickText(body, ["name", "customerName", "clientName", "buyer.name", "customer.name"], 120) ||
    "Topmate consultation client";
  const email = normalizeEmail(
    pickText(body, ["email", "customerEmail", "clientEmail", "buyer.email", "customer.email"], 160),
  );
  const phone = normalizePhone(
    pickText(body, ["phone", "customerPhone", "clientPhone", "buyer.phone", "customer.phone"], 40),
  );
  const bookingId = pickText(body, ["bookingId", "orderId", "paymentId", "transactionId", "id"], 160) || `topmate_${Date.now()}`;
  const product = pickText(body, ["product", "service", "title", "event.name"], 160) || "Topmate consultation";
  const scheduledAt = pickText(body, ["scheduledAt", "slot", "startTime", "bookingTime"], 160);

  if (!email && !phone) {
    return NextResponse.json({ ok: false, error: "Email or phone is required." }, { status: 400 });
  }

  const repo = getPlatformRepository();
  const lead = repo.createLead({
    source: "website",
    status: "consultation_booked",
    name,
    email: email || undefined,
    phone: phone || undefined,
    program: product,
    message: `Topmate consultation booked. Ref: ${bookingId}${scheduledAt ? `, slot: ${scheduledAt}` : ""}`,
    page: "topmate-consultation",
    consent: true,
    score: 100,
    tags: ["topmate", "consultation-booked", `booking:${bookingId}`],
  });

  repo.createConversation({
    leadId: lead.id,
    channel: "portal",
    direction: "inbound",
    from: name,
    to: "XIPHIAS",
    body: `Topmate consultation booking captured: ${product}. Ref: ${bookingId}${scheduledAt ? `, slot: ${scheduledAt}` : ""}.`,
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
