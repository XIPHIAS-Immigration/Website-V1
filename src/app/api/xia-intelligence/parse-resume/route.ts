import { NextResponse, type NextRequest } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

import { protectPublicLead } from "@/lib/security/public-lead-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TEXT = 12_000;

function cleanExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_TEXT);
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const resume = form?.get("resume") ?? null;
  if (!form || !isFile(resume)) {
    return NextResponse.json({ ok: false, error: "Choose a CV to analyse." }, { status: 400 });
  }

  const guard = await protectPublicLead(
    req,
    { message: `${resume.name}:${resume.size}` },
    { endpoint: "xia-resume-parse", ipLimit: 12, duplicateWindowMs: 1_000 },
  );
  if (guard) return guard;

  if (resume.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "CV must be 8 MB or smaller." }, { status: 400 });
  }

  const name = resume.name || "resume";
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (!["pdf", "docx", "txt", "md", "csv", "json"].includes(extension)) {
    return NextResponse.json({ ok: false, error: "Use PDF, DOCX, TXT, MD, CSV, or JSON." }, { status: 400 });
  }

  const buffer = Buffer.from(await resume.arrayBuffer());
  let extracted = "";
  try {
    if (extension === "pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        extracted = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else if (extension === "docx") {
      extracted = (await mammoth.extractRawText({ buffer })).value;
    } else {
      extracted = buffer.toString("utf8");
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "The CV could not be read. Try a text-based PDF, DOCX, or pasted CV highlights." },
      { status: 422 },
    );
  }

  const text = cleanExtractedText(extracted);
  if (text.length < 80) {
    return NextResponse.json(
      { ok: false, error: "No usable text was found. This may be a scanned CV and needs OCR or pasted highlights." },
      { status: 422 },
    );
  }

  return NextResponse.json({ ok: true, fileName: name.slice(0, 160), text, characters: text.length });
}
