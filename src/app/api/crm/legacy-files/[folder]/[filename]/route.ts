import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getContentType, resolveLegacyFilePath } from "@/lib/crm/legacy-file-storage";
import { getCurrentPortalUser } from "@/lib/platform/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> }
) {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (user.role !== "staff" && user.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const { folder, filename } = await params;
  const resolved = resolveLegacyFilePath(decodeURIComponent(folder), decodeURIComponent(filename));

  if (!resolved) {
    return NextResponse.json({ ok: false, error: "Invalid legacy file path" }, { status: 400 });
  }

  if (!resolved.exists) {
    return NextResponse.json(
      {
        ok: false,
        error: "Legacy file not found",
        folder: resolved.folder.folder,
        filename: resolved.fileName,
      },
      { status: 404 }
    );
  }

  const file = await readFile(resolved.filePath);
  return new Response(file, {
    headers: {
      "Content-Type": getContentType(resolved.fileName),
      "Content-Disposition": `inline; filename="${resolved.fileName.replaceAll('"', "")}"`,
      "X-Robots-Tag": "noindex",
    },
  });
}
