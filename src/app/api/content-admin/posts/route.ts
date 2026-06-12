import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireContentAdmin } from "@/lib/content-admin/auth";
import {
  deleteContentAdminItem,
  isContentAdminKind,
  listContentAdminItems,
  saveContentAdminItem,
} from "@/lib/content-admin/store";
import { invalidateInsightsCache } from "@/lib/insights-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireContentAdmin();
    const items = await listContentAdminItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireContentAdmin();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "Invalid delete payload." }, { status: 400 });
    }

    const deleted = await deleteContentAdminItem((body as any).kind, (body as any).slug);
    await invalidateInsightsCache();

    const basePath = deleted.kind === "blog" ? "/blog" : `/${deleted.kind}`;
    revalidatePath(basePath);
    revalidatePath(`${basePath}/${deleted.slug}`);

    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete content.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireContentAdmin();
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, message: "Invalid content payload." }, { status: 400 });
    }

    const item = await saveContentAdminItem(body);
    await invalidateInsightsCache();

    if (isContentAdminKind(item.kind)) {
      const basePath = item.kind === "blog" ? "/blog" : `/${item.kind}`;
      revalidatePath(basePath);
      revalidatePath(item.url);
    }

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save content.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
