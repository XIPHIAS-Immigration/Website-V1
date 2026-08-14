import { NextResponse, type NextRequest } from "next/server";
import { defaultPaidDueDiligenceInput, paidInputFromAnswers, type PaidDueDiligenceInput } from "@/lib/due-diligence-paid";
import { fulfillJiopayOrder } from "@/lib/payments/fulfillment";
import { getJiopayOrder, updateJiopayOrder } from "@/lib/payments/jiopay-store";
import { verifyReportDownloadGrant } from "@/lib/payments/report-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function access(req: NextRequest) {
  const order = req.nextUrl.searchParams.get("order")?.trim() || "";
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const expires = Number(req.nextUrl.searchParams.get("expires"));
  return { order, token, expires, valid: Boolean(order && token && verifyReportDownloadGrant(order, expires, token)) };
}

function clean(value: unknown, max = 4_000) {
  return typeof value === "string" ? value.trim().slice(0, max) : value == null ? "" : String(value).trim().slice(0, max);
}

function sanitizePaidInput(value: unknown): PaidDueDiligenceInput {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const result = { ...defaultPaidDueDiligenceInput };
  for (const key of Object.keys(result) as Array<keyof PaidDueDiligenceInput>) {
    if (key === "accuracyConfirmed" || key === "consentConfirmed") {
      result[key] = (raw[key] === true || raw[key] === "true" || raw[key] === "yes") as never;
    } else {
      result[key] = clean(raw[key], key === "objectives" || key === "visaHistory" ? 8_000 : 4_000) as never;
    }
  }
  return result;
}

function paidOrder(reference: string) {
  const order = getJiopayOrder(reference);
  if (!order || order.productType !== "due_diligence_report") return null;
  if (order.status !== "paid" && order.status !== "report_sent") return null;
  return order;
}

export async function GET(req: NextRequest) {
  const grant = access(req);
  if (!grant.valid) return NextResponse.json({ ok: false, error: "Invalid or expired paid-intake link." }, { status: 403 });
  const order = paidOrder(grant.order);
  if (!order) return NextResponse.json({ ok: false, error: "Paid due-diligence order was not found or is not confirmed." }, { status: 404 });
  return NextResponse.json({
    ok: true,
    order: {
      reference: order.merchantTxnNo,
      amountInr: order.amountInr,
      customer: order.customer,
      track: order.track,
      country: order.country,
      program: order.program,
      completed: order.answers?.paidIntakeCompleted === true,
    },
    intake: paidInputFromAnswers(order.answers),
  });
}

export async function POST(req: NextRequest) {
  const grant = access(req);
  if (!grant.valid) return NextResponse.json({ ok: false, error: "Invalid or expired paid-intake link." }, { status: 403 });
  const order = paidOrder(grant.order);
  if (!order) return NextResponse.json({ ok: false, error: "Paid due-diligence order was not found or is not confirmed." }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { intake?: unknown };
  const intake = sanitizePaidInput(body.intake);
  if (!intake.fullLegalName || !intake.dateOfBirth || !intake.nationality || !intake.residenceCountry || !intake.objectives) {
    return NextResponse.json({ ok: false, error: "Complete the required identity, residence and objective fields." }, { status: 400 });
  }
  if (!intake.accuracyConfirmed || !intake.consentConfirmed) {
    return NextResponse.json({ ok: false, error: "Accuracy and report-processing consent must be confirmed." }, { status: 400 });
  }

  const updated = updateJiopayOrder(
    order.merchantTxnNo,
    {
      country: order.country || intake.residenceCountry,
      answers: {
        ...(order.answers ?? {}),
        ...intake,
        paidIntakeCompleted: true,
        paidIntakeVersion: 1,
        paidIntakeSubmittedAt: new Date().toISOString(),
        dataSource: "Client paid due-diligence intake",
        reviewStatus: "draft",
      },
    },
    {
      type: "paid_intake_submitted",
      at: new Date().toISOString(),
      data: { productType: order.productType, paidIntakeVersion: 1 },
    },
  );
  if (!updated) return NextResponse.json({ ok: false, error: "Could not save the paid intake." }, { status: 500 });

  const fulfillment = await fulfillJiopayOrder(order.merchantTxnNo, {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || req.nextUrl.origin,
  });
  const downloadUrl = `/api/payments/jiopay/report-download?${new URLSearchParams({
    order: grant.order,
    expires: String(grant.expires),
    token: grant.token,
  }).toString()}`;
  return NextResponse.json({
    ok: fulfillment.status === "report_sent" || fulfillment.status === "already_fulfilled" || fulfillment.status === "report_failed",
    fulfillment,
    downloadUrl,
    message: fulfillment.status === "report_failed"
      ? "The intake was saved. The report email could not be completed, but the secure download can still be retried."
      : "Your personalised due-diligence report is ready.",
  });
}
