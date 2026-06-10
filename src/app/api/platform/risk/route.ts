import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { screenApplicant } from "@/lib/platform/compliance";
import { evaluateRisk } from "@/lib/platform/risk";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const repo = getPlatformRepository();
  const caseId = normalizeText(body.caseId, 80) || undefined;
  const visibleCaseIds = new Set(repo.getCasesForUser(user).map((item) => item.id));
  const canUseCase = !caseId || ["admin", "staff"].includes(user.role) || visibleCaseIds.has(caseId);
  if (!canUseCase) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

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

  const profile = repo.addRiskProfile({
    caseId,
    leadId: normalizeText(body.leadId, 80) || undefined,
    ...evaluation,
  });
  repo.audit("compliance.screened", "risk_profile", profile.id, user.id, {
    provider: compliance.provider,
    mode: compliance.mode,
    status: compliance.status,
    referenceId: compliance.referenceId,
  });

  return NextResponse.json({ ok: true, profile, compliance });
}
