import { NextResponse } from "next/server";

import { requireContentAdmin } from "@/lib/content-admin/auth";
import { saveContentAdminImage } from "@/lib/content-admin/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireContentAdmin();
    const formData = await request.formData();
    const kind = formData.get("kind");
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, message: "Image file is required." }, { status: 400 });
    }

    const image = await saveContentAdminImage(typeof kind === "string" ? kind : "blog", file);
    return NextResponse.json({ ok: true, image });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image.";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
