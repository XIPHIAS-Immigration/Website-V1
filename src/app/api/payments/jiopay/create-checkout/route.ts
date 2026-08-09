import { NextResponse, type NextRequest } from "next/server";
import {
  getJiopayConfig,
  initiateJiopaySale,
  makeJiopayTxnNo,
  auditJiopayPayload,
  publicJiopayPayload,
} from "@/lib/payments/jiopay";
import { saveJiopayOrder } from "@/lib/payments/jiopay-store";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText, parseBoolean } from "@/lib/platform/sanitize";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { resolveCheckoutPrice } from "@/lib/payments/product-catalog";
import { PAYMENTS_DISABLED, PAYMENTS_COMING_SOON_LABEL } from "@/lib/payments/payments-status";
import { protectPublicLead } from "@/lib/security/public-lead-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

const DEFAULT_PRODUCT_TYPE = "premium_report";

function requestedAmount(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function safeAnswers(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const cleanKey = key.replace(/[^\w.-]/g, "").slice(0, 64);
    if (!cleanKey) continue;
    if (typeof raw === "string") out[cleanKey] = raw.slice(0, cleanKey === "profileSummary" ? 12_000 : 1_000);
    else if (typeof raw === "number" || typeof raw === "boolean" || raw == null) out[cleanKey] = raw;
    else out[cleanKey] = String(raw).slice(0, 300);
  }
  return Object.keys(out).length ? out : undefined;
}

function resolveTrack(value: unknown): Track | undefined {
  return isTrack(value) ? value : undefined;
}

export async function POST(req: NextRequest) {
  if (PAYMENTS_DISABLED) {
    return NextResponse.json(
      { ok: false, disabled: true, error: PAYMENTS_COMING_SOON_LABEL },
      { status: 422 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const name = normalizeText(body.name, 120);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const consent = parseBoolean(body.consent);

  const securityResponse = await protectPublicLead(
    req,
    {
      name,
      email,
      phone,
      message: body.productName,
      honeypot: body.company || body.websiteField || body.hp || body.honeypot,
      startedAt: body.startedAt,
      extra: [body.productType, body.track, body.country, body.program],
    },
    { endpoint: "jiopay-checkout", ipLimit: 5, contactLimit: 3 },
  );
  if (securityResponse) return securityResponse;

  if (!name || !email) {
    return NextResponse.json(
      { ok: false, error: "Name and email are required to start Jiopay checkout." },
      { status: 400 },
    );
  }

  try {
    const productType = normalizeText(body.productType, 60) || DEFAULT_PRODUCT_TYPE;
    const portalUser = await getCurrentPortalUser();
    const isStaff = portalUser?.role === "staff" || portalUser?.role === "admin";
    const priced = resolveCheckoutPrice(
      productType,
      requestedAmount(body.amountInr ?? body.amount),
      { isStaff },
    );
    if (!priced.ok) {
      const status = priced.reason === "staff_required" ? 403 : 400;
      const error =
        priced.reason === "staff_required"
          ? "Staff sign-in is required to create custom payment links."
          : priced.reason === "invalid_amount"
            ? "A valid amount is required for custom payment links."
            : "Unknown product type.";
      return NextResponse.json({ ok: false, error }, { status });
    }
    const { config: product, amountInr } = priced;

    const config = getJiopayConfig(req);
    const merchantTxnNo = makeJiopayTxnNo();
    const productName = normalizeText(body.productName, 120) || product.label;
    const track = resolveTrack(body.track);
    const country = normalizeText(body.country, 80) || undefined;
    const program = normalizeText(body.program, 140) || undefined;
    const page = normalizeText(body.page, 240) || req.headers.get("referer") || "/xia-intelligence";

    const repo = getPlatformRepository();
    const lead = repo.createLead({
      source: product.fulfillment === "registration" ? "registration" : "programme_ai",
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
            request: auditJiopayPayload(result.requestPayload),
            response: auditJiopayPayload(result.responsePayload),
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
