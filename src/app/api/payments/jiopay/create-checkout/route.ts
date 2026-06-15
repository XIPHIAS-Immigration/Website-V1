import { NextResponse, type NextRequest } from "next/server";
import {
  getJiopayConfig,
  initiateJiopaySale,
  makeJiopayTxnNo,
  publicJiopayPayload,
} from "@/lib/payments/jiopay";
import { saveJiopayOrder } from "@/lib/payments/jiopay-store";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { isTrack, type Track } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

const DEFAULT_PRODUCT_TYPE = "premium_report";
const DEFAULT_PRODUCT_NAME = "XIPHIAS personalised report";
const DEFAULT_AMOUNT_INR = 5000;

function cleanAmount(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const fromEnv = Number(process.env.JIOPAY_DEFAULT_AMOUNT_INR);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_AMOUNT_INR;
}

function safeAnswers(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const cleanKey = key.replace(/[^\w.-]/g, "").slice(0, 64);
    if (!cleanKey) continue;
    if (typeof raw === "string") out[cleanKey] = raw.slice(0, 1000);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw == null) out[cleanKey] = raw;
    else out[cleanKey] = String(raw).slice(0, 300);
  }
  return Object.keys(out).length ? out : undefined;
}

function resolveTrack(value: unknown): Track | undefined {
  return isTrack(value) ? value : undefined;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const consent = parseBoolean(body.consent);

  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "Name and email are required to start Jiopay checkout." },
      { status: 400 },
    );
  }

  try {
    const config = getJiopayConfig(req);
    const merchantTxnNo = makeJiopayTxnNo();
    const amountInr = cleanAmount(body.amountInr ?? body.amount);
    const productType = normalizeText(body.productType, 60) || DEFAULT_PRODUCT_TYPE;
    const productName = normalizeText(body.productName, 120) || DEFAULT_PRODUCT_NAME;
    const track = resolveTrack(body.track);
    const country = normalizeText(body.country, 80) || undefined;
    const program = normalizeText(body.program, 140) || undefined;
    const page = normalizeText(body.page, 240) || req.headers.get("referer") || "/xia-intelligence";

    const repo = getPlatformRepository();
    const lead = repo.createLead({
      source: productType === "premium_report" ? "programme_ai" : "registration",
      status: "qualified",
      name,
      email,
      phone: phone || undefined,
      track,
      country,
      program,
      message: `Jiopay checkout started for ${productName}. Order: ${merchantTxnNo}`,
      page,
      referrer: req.headers.get("referer") || undefined,
      consent,
      score: 95,
      tags: ["jiopay", "payment-pending", `payment:${merchantTxnNo}`, `product:${productType}`],
    });

    repo.createConversation({
      leadId: lead.id,
      channel: "portal",
      direction: "inbound",
      from: name,
      to: "XIPHIAS",
      body: `Jiopay checkout initiated for ${productName}. Amount INR ${amountInr.toLocaleString("en-IN")}. Ref: ${merchantTxnNo}`,
    });

    const result = await initiateJiopaySale(
      {
        merchantTxnNo,
        amountInr,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        productType,
        productName,
      },
      config,
    );

    saveJiopayOrder({
      merchantTxnNo,
      leadId: lead.id,
      amountInr,
      productType,
      productName,
      customer: { name, email, phone: phone || undefined },
      track,
      country,
      program,
      answers: safeAnswers(body.answers),
      status: result.checkoutUrl ? "checkout_created" : "initiated",
      checkoutUrl: result.checkoutUrl || undefined,
      lastResponseCode: String(result.responsePayload.responseCode ?? result.status),
      lastStatusLabel: String(result.responsePayload.responseMessage ?? result.responsePayload.message ?? ""),
      events: [
        {
          type: "initiate_sale",
          at: new Date().toISOString(),
          data: {
            httpStatus: result.status,
            hasCheckoutUrl: Boolean(result.checkoutUrl),
            response: publicJiopayPayload(result.responsePayload),
          },
        },
      ],
    });

    if (!result.ok || !result.checkoutUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "Jiopay checkout could not be created.",
          merchantTxnNo,
          leadId: lead.id,
          jiopay: publicJiopayPayload(result.responsePayload),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      merchantTxnNo,
      leadId: lead.id,
      checkoutUrl: result.checkoutUrl,
      jiopay: publicJiopayPayload(result.responsePayload),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Jiopay checkout failed.",
      },
      { status: 500 },
    );
  }
}

