import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  advisor_request: "Advisor review requested",
  scenario_saved: "Scenario saved",
  document_playground: "Document readiness explored",
  report_note: "Report note added",
};

export async function POST(req: NextRequest) {
  const user = await requirePortalUser(["client", "staff", "admin", "partner", "b2g"]);
  const body = await req.json().catch(() => ({}));
  const repo = getPlatformRepository();
  const action = normalizeText(body.action, 60) || "portal_action";
  const label = ACTION_LABELS[action] || normalizeText(body.label, 120) || "Portal activity";
  const message = normalizeText(body.message, 900) || label;
  const cases = repo.getCasesForUser(user);
  const activeCase = normalizeText(body.caseId, 80)
    ? cases.find((item) => item.id === normalizeText(body.caseId, 80))
    : cases[0];

  if (action === "advisor_request" && activeCase) {
    repo.updateCase(activeCase.id, {
      nextAction: "Advisor to review the latest client portal request and scenario notes.",
      progress: Math.max(activeCase.progress, Math.min(96, activeCase.progress + 4)),
    });
  }

  const activity = repo.createConversation({
    caseId: activeCase?.id,
    leadId: activeCase?.leadId,
    channel: "portal",
    direction: "inbound",
    from: user.email,
    to: "XIPHIAS staff",
    body: `${label}: ${message}`,
  });

  repo.audit("portal.viewed", "portal_activity", activity.id, user.id, {
    action,
    role: user.role,
    caseId: activeCase?.id,
  });

  return NextResponse.json({ ok: true, activity });
}
