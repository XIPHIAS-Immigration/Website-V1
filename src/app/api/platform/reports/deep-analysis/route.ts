import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";
import { generateReportPdf } from "@/lib/payments/report-router";
import { getJiopayOrder, updateJiopayOrder, type JiopayOrder } from "@/lib/payments/jiopay-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = Record<string, unknown>;

function numberOrUndefined(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function safeText(value: unknown, max = 1000) {
  return normalizeText(value, max);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user || !["client", "staff", "admin"].includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Sign in to X-Hub to prepare this report." }, { status: 401 });
  }

  const paymentReference = user.registrationPaymentRef || "";
  const registrationOrder = paymentReference ? getJiopayOrder(paymentReference) : null;
  if (user.role === "client" && (!registrationOrder || registrationOrder.productType !== "registration" || !["paid", "processing", "provisioned"].includes(registrationOrder.status))) {
    return NextResponse.json({ ok: false, error: "A verified full-assessment registration is required." }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const repo = getPlatformRepository();
  const snapshot = repo.snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const profile = snapshot.clientProfiles?.find((item) => item.clientId === (user.clientId || activeCase?.clientId));
  const occupation = safeText(body.occupation || profile?.occupation, 160);
  const profileSummary = safeText(body.profileSummary, 4000);
  if (!occupation || !profileSummary) {
    return NextResponse.json({ ok: false, error: "Occupation and a detailed profile summary are required." }, { status: 400 });
  }

  const answers: Record<string, unknown> = {
    source: "x-hub-registration-deep-analysis",
    reviewStatus: "draft",
    goal: safeText(body.goal, 120),
    occupation,
    role: occupation,
    field: safeText(body.field, 120),
    education: safeText(body.education, 120),
    languageTest: safeText(body.languageTest, 80),
    cpaAssessment: safeText(body.cpaAssessment, 500),
    assessingBody: safeText(body.assessingBody, 240),
    proposedEndeavour: safeText(body.proposedEndeavour, 2000),
    profileSummary,
    documentsAvailable: safeText(body.documentsAvailable, 2000),
  };
  for (const [key, raw] of [
    ["age", body.age],
    ["yearsExperience", body.yearsExperience],
    ["languageScore", body.languageScore],
    ["publicationCount", body.publicationCount],
    ["citationCount", body.citationCount],
    ["patentCount", body.patentCount],
  ] as const) {
    const value = numberOrUndefined(raw);
    if (value !== undefined) answers[key] = value;
  }
  const evidence = body.evidence && typeof body.evidence === "object" ? body.evidence as Record<string, unknown> : {};
  for (const [key, value] of Object.entries(evidence)) {
    const cleanKey = key.replace(/[^A-Za-z0-9_]/g, "").slice(0, 48);
    if (cleanKey && value === true) {
      answers[cleanKey] = true;
      answers[`evidence_${cleanKey}`] = true;
    }
  }

  const reference = registrationOrder?.merchantTxnNo || `XHUB-${Date.now()}`;
  const reportOrder: JiopayOrder = {
    merchantTxnNo: reference,
    amountInr: registrationOrder?.amountInr || 5000,
    productType: "deep_analysis_report",
    productName: "Deep Analysis Report — Included with Registration",
    customer: {
      name: profile?.fullName || user.name,
      email: profile?.email || user.email,
      phone: profile?.phone,
    },
    track: activeCase?.track || profile?.preferredTrack || "skilled",
    country: safeText(body.country || activeCase?.country || profile?.targetCountry, 120),
    program: safeText(body.program || activeCase?.program || profile?.targetProgram, 180),
    answers,
    status: "paid",
    createdAt: registrationOrder?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [],
  };

  try {
    const pdf = await generateReportPdf("deep_analysis", reportOrder);
    if (registrationOrder) {
      updateJiopayOrder(reference, {
        answers: { ...(registrationOrder.answers || {}), ...answers, deferDetailedReport: false, deepAnalysisCompleted: true },
      }, {
        type: "included_deep_analysis_downloaded",
        at: new Date().toISOString(),
        data: { caseId: activeCase?.id, generatedBy: user.id },
      });
    }
    if (activeCase) {
      repo.createConversation({
        caseId: activeCase.id,
        leadId: activeCase.leadId,
        channel: "portal",
        direction: "inbound",
        from: user.email,
        to: "X-Hub",
        body: "Client completed the included Deep Analysis intake and downloaded the draft report.",
      });
    }
    const filename = `XIPHIAS_Deep_Analysis_${reference}.pdf`;
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "The Deep Analysis report could not be generated." }, { status: 500 });
  }
}
