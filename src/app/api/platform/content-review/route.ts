import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { createContentReviewDraft } from "@/lib/platform/content-review";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireReviewer() {
  const user = await getCurrentPortalUser();
  if (!user) return { response: NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }) };
  if (!["admin", "staff"].includes(user.role)) {
    return { response: NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const guard = await requireReviewer();
  if (guard.response) return guard.response;
  return NextResponse.json({ ok: true, tasks: getPlatformRepository().listContentTasks() });
}

export async function POST(req: NextRequest) {
  const guard = await requireReviewer();
  if (guard.response) return guard.response;
  const body = await req.json().catch(() => ({}));
  const title = normalizeText(body.title, 160);
  const sourceUrl = normalizeText(body.sourceUrl, 300);
  const changeSummary = normalizeText(body.changeSummary, 2000);

  if (!title || !sourceUrl || !changeSummary) {
    return NextResponse.json({ ok: false, error: "Title, source URL, and summary are required." }, { status: 400 });
  }

  const task = createContentReviewDraft({
    title,
    sourceUrl,
    targetPath: normalizeText(body.targetPath, 240) || undefined,
    changeSummary,
    sourceExcerpt: normalizeText(body.sourceExcerpt, 2000) || undefined,
  });

  return NextResponse.json({ ok: true, task });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireReviewer();
  if (guard.response) return guard.response;
  const body = await req.json().catch(() => ({}));
  const id = normalizeText(body.id, 80);
  const status = normalizeText(body.status, 40);

  if (!id || !["needs_review", "approved", "rejected", "published"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Valid task id and status are required." }, { status: 400 });
  }

  const existing = getPlatformRepository().listContentTasks().find((item) => item.id === id);
  if (!existing) return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });
  if (status === "published" && existing.status !== "approved") {
    return NextResponse.json({ ok: false, error: "Approve the task before marking it published." }, { status: 400 });
  }
  if (status === "published" && !existing.targetPath) {
    return NextResponse.json({ ok: false, error: "A target content path is required before publish." }, { status: 400 });
  }

  const task = getPlatformRepository().updateContentReviewTask(id, {
    status: status as any,
    reviewerNotes: normalizeText(body.reviewerNotes, 1200) || undefined,
  });

  return NextResponse.json({ ok: true, task });
}
