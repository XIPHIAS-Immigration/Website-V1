import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
]);

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 140) || "document";
}

function uploadRoot() {
  return process.env.XIPHIAS_UPLOAD_DIR
    ? path.resolve(process.env.XIPHIAS_UPLOAD_DIR)
    : path.join(process.cwd(), ".xiphias-platform", "uploads");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ ok: false, error: "Invalid form data." }, { status: 400 });

  const documentId = normalizeText(formData.get("documentId"), 80);
  const file = formData.get("file");
  if (!documentId || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Document id and file are required." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "Upload must be between 1 byte and 15 MB." }, { status: 400 });
  }

  const extAllowed = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name);
  if (!ALLOWED_TYPES.has(file.type) && !extAllowed) {
    return NextResponse.json({ ok: false, error: "Only PDF, Word, JPG, and PNG files are allowed." }, { status: 400 });
  }

  const repo = getPlatformRepository();
  const doc = repo.getDocumentById(documentId);
  if (!doc) return NextResponse.json({ ok: false, error: "Document item not found." }, { status: 404 });

  const visibleCaseIds = new Set(repo.getCasesForUser(user).map((item) => item.id));
  const canUpload = ["admin", "staff"].includes(user.role) || visibleCaseIds.has(doc.caseId);
  if (!canUpload) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  const fileName = safeFileName(file.name);
  const storageKey = `${doc.caseId}/${doc.id}-${Date.now()}-${fileName}`;
  const targetPath = path.join(uploadRoot(), storageKey);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, Buffer.from(await file.arrayBuffer()));

  const updated = repo.updateDocument(doc.id, {
    status: "uploaded",
    uploadedAt: new Date().toISOString(),
    uploadedBy: user.email,
    fileName,
    fileSize: file.size,
    mimeType: file.type || "application/octet-stream",
    storageKey,
    notes: "Uploaded through X-Hub. Staff review pending.",
  });

  repo.createConversation({
    caseId: doc.caseId,
    channel: "portal",
    direction: "inbound",
    from: user.email,
    to: "XIPHIAS staff",
    body: `Uploaded ${doc.label}: ${fileName}`,
  });

  return NextResponse.json({ ok: true, document: updated });
}
