import { NextResponse, type NextRequest } from "next/server";
import { requirePortalUser } from "@/lib/platform/auth";
import { buildDocumentPlan } from "@/lib/platform/document-intelligence";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";
import { isTrack, type Track } from "@/lib/eligibility/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const body = await req.json().catch(() => ({}));
  const repository = getPlatformRepository();
  const snapshot = repository.snapshotForUser(user);
  const requestedCaseId = normalizeText(body.caseId, 80);
  const activeCase =
    (requestedCaseId ? snapshot.cases.find((item) => item.id === requestedCaseId) : snapshot.cases[0]) ?? null;
  const documents = activeCase
    ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id)
    : snapshot.documents;
  const track: Track | undefined = isTrack(body.track) ? body.track : activeCase?.track;

  const plan = buildDocumentPlan({
    user,
    activeCase,
    documents,
    track,
    country: normalizeText(body.country, 80) || activeCase?.country,
    program: normalizeText(body.program, 140) || activeCase?.program,
  });

  repository.audit("document.plan.generated", "document_plan", activeCase?.id ?? user.id, user.id, {
    track: plan.track,
    country: plan.country,
    readinessScore: plan.readinessScore,
  });

  return NextResponse.json({ ok: true, plan });
}
