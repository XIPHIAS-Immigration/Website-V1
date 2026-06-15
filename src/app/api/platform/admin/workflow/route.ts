import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";
import type {
  B2GInquiryStatus,
  CaseStage,
  DocumentStatus,
  LeadStatus,
  PartnerReferralStatus,
  RiskLevel,
} from "@/lib/platform/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const leadStatuses = new Set<LeadStatus>(["new", "qualified", "consultation_booked", "case_opened", "closed"]);
const referralStatuses = new Set<PartnerReferralStatus>(["submitted", "screening", "accepted", "case_opened", "not_a_fit"]);
const b2gStatuses = new Set<B2GInquiryStatus>(["submitted", "triage", "proposal", "active", "closed"]);
const documentStatuses = new Set<DocumentStatus>(["requested", "uploaded", "reviewing", "accepted", "rework"]);
const caseStages = new Set<CaseStage>([
  "intake",
  "documents",
  "due_diligence",
  "strategy",
  "filing",
  "government_review",
  "decision",
  "post_approval",
]);
const riskLevels = new Set<RiskLevel>(["low", "medium", "high", "blocked"]);

async function requireOperator() {
  const user = await getCurrentPortalUser();
  if (!user) return { response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  if (!["admin", "staff"].includes(user.role)) {
    return { response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(req: NextRequest) {
  const guard = await requireOperator();
  if (guard.response) return guard.response;

  const body = await req.json().catch(() => ({}));
  const entityType = normalizeText(body.entityType, 40);
  const id = normalizeText(body.id, 80);
  const status = normalizeText(body.status, 80);
  const repo = getPlatformRepository();

  if (!entityType || !id) {
    return NextResponse.json({ ok: false, error: "Entity type and id are required." }, { status: 400 });
  }

  if (entityType === "lead" && leadStatuses.has(status as LeadStatus)) {
    return NextResponse.json({ ok: true, entity: repo.updateLeadStatus(id, status as LeadStatus) });
  }

  if (entityType === "partner_referral" && referralStatuses.has(status as PartnerReferralStatus)) {
    return NextResponse.json({
      ok: true,
      entity: repo.updatePartnerReferral(id, {
        status: status as PartnerReferralStatus,
        notes: normalizeText(body.notes, 1600) || undefined,
      }),
    });
  }

  if (entityType === "b2g_inquiry" && b2gStatuses.has(status as B2GInquiryStatus)) {
    return NextResponse.json({ ok: true, entity: repo.updateB2GInquiry(id, { status: status as B2GInquiryStatus }) });
  }

  if (entityType === "document" && documentStatuses.has(status as DocumentStatus)) {
    return NextResponse.json({
      ok: true,
      entity: repo.updateDocumentStatus(id, status as DocumentStatus, normalizeText(body.notes, 1200) || undefined),
    });
  }

  if (entityType === "case") {
    const patch = {
      stage: caseStages.has(status as CaseStage) ? (status as CaseStage) : undefined,
      nextAction: normalizeText(body.nextAction, 240) || undefined,
      nextActionDue: normalizeText(body.nextActionDue, 40) || undefined,
      riskLevel: riskLevels.has(normalizeText(body.riskLevel, 40) as RiskLevel)
        ? (normalizeText(body.riskLevel, 40) as RiskLevel)
        : undefined,
      progress: Number.isFinite(Number(body.progress)) ? Math.max(0, Math.min(100, Number(body.progress))) : undefined,
    };
    return NextResponse.json({ ok: true, entity: repo.updateCase(id, patch) });
  }

  return NextResponse.json({ ok: false, error: "Unsupported workflow update." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const guard = await requireOperator();
  if (guard.response) return guard.response;

  const body = await req.json().catch(() => ({}));
  const entityType = normalizeText(body.entityType, 40);
  const id = normalizeText(body.id, 80);

  if (!entityType || !id) {
    return NextResponse.json({ ok: false, error: "Entity type and id are required." }, { status: 400 });
  }

  if (entityType === "lead") {
    const deleted = getPlatformRepository().deleteLead(id, guard.user.id);
    if (!deleted) {
      return NextResponse.json(
        {
          ok: false,
          error: "Lead not found. It may already be deleted; refresh X-Hub and try again.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, entity: deleted });
  }

  return NextResponse.json({ ok: false, error: "Unsupported delete operation." }, { status: 400 });
}
