import { NextResponse, type NextRequest } from "next/server";
import { screenApplicant } from "@/lib/platform/compliance";
import { evaluateRisk } from "@/lib/platform/risk";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const compliance = await screenApplicant({
    fullName: normalizeText(body.fullName, 120),
    dateOfBirth: normalizeText(body.dateOfBirth, 40) || undefined,
    nationality: normalizeText(body.nationality, 80) || undefined,
    country: normalizeText(body.country, 80),
    program: normalizeText(body.program, 120),
    declaredPep: body.pepDeclared === true,
  });

  const evaluation = evaluateRisk({
    fullName: normalizeText(body.fullName, 120),
    country: normalizeText(body.country, 80),
    program: normalizeText(body.program, 120),
    investmentUsd: Number.isFinite(Number(body.investmentUsd)) ? Number(body.investmentUsd) : undefined,
    sourceOfFundsProvided: body.sourceOfFundsProvided === true,
    pepDeclared: body.pepDeclared === true || compliance.pepHit,
    sanctionsHit: body.sanctionsHit === true || compliance.sanctionsHit,
    documents: Array.isArray(body.documents)
      ? body.documents.map((doc: Record<string, unknown>) => ({
          label: normalizeText(doc.label, 120),
          status: normalizeText(doc.status, 40),
          extractedName: normalizeText(doc.extractedName, 120),
        }))
      : [],
  });

  const profile = getPlatformRepository().addRiskProfile({
    caseId: normalizeText(body.caseId, 80) || undefined,
    leadId: normalizeText(body.leadId, 80) || undefined,
    ...evaluation,
  });
  getPlatformRepository().audit("compliance.screened", "risk_profile", profile.id, undefined, {
    provider: compliance.provider,
    mode: compliance.mode,
    status: compliance.status,
    referenceId: compliance.referenceId,
  });

  return NextResponse.json({ ok: true, profile, compliance });
}
