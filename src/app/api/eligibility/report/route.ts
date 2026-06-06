import { NextRequest, NextResponse } from "next/server";
import type { Track, AnswerMap } from "@/lib/eligibility/types";
import { getEligibilityAdvisory } from "@/lib/platform/eligibility-advisor";
import { PDFDocument, rgb } from "pdf-lib";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const runtime = "nodejs";

/** ---------- Brand / Config ---------- */
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "XIPHIAS Immigration";
const REPORT_TITLE = "Eligibility Report";
const PDF_LOGO_BASE64 = process.env.PDF_LOGO_BASE64 || ""; // data:image/png;base64,...

const FOOTER_ADDRESS =
  process.env.NEXT_PUBLIC_PDF_ADDRESS ||
  "Aurbis Prime No. 1, Koramangala, Bengaluru, India 560034";
const FOOTER_EMAIL = process.env.NEXT_PUBLIC_PDF_EMAIL || "immigration@xiphias.in";
const FOOTER_PHONE = process.env.NEXT_PUBLIC_PDF_PHONE || "+91 9021335577";
const FOOTER_WEBSITE = process.env.NEXT_PUBLIC_PDF_WEBSITE || "www.xiphiasimmigration.com";

/** ---------- Palette & Layout ---------- */
const COLOR_TEXT = rgb(0.07, 0.07, 0.09);
const COLOR_MUTED = rgb(0.34, 0.36, 0.40);
const COLOR_ACCENT = rgb(0.85, 0.69, 0.15);
const COLOR_HEADER_BG = rgb(0.96, 0.97, 1);
const COLOR_CARD_BORDER = rgb(0.82, 0.82, 0.84);
const COLOR_DIVIDER = rgb(0.92, 0.92, 0.94);

const A4: [number, number] = [595.28, 841.89];
const MARGIN_X = 56;
const HEADER_H = 78;
const FOOTER_H = 64;
const LINE = 14;

const SIZE_H1 = 20;
const SIZE_H2 = 12;
const SIZE_TEXT = 10;

type Fonts = { regular: any; bold: any };

/** ---------- Helpers ---------- */
function labelize(k: string) {
  return k.replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function toStr(v: unknown) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v == null) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function wrap(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = String(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) > maxWidth) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = t;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function loadFontBytes(file: string) {
  try {
    const p = path.join(process.cwd(), "public", "fonts", file);
    return await fs.readFile(p);
  } catch {
    return null;
  }
}

async function embedLogo(pdf: PDFDocument) {
  if (!PDF_LOGO_BASE64.includes("base64")) return null;
  try {
    const base64 = PDF_LOGO_BASE64.split(",").pop()!;
    const bytes = Buffer.from(base64, "base64");
    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}

function drawHeader(page: any, fonts: Fonts, logo: any | null) {
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: HEADER_H, color: COLOR_HEADER_BG });

  if (logo) {
    const logoW = 56;
    const logoH = (logoW / logo.width) * logo.height;
    page.drawImage(logo, {
      x: MARGIN_X,
      y: height - HEADER_H + (HEADER_H - logoH) / 2,
      width: logoW,
      height: logoH,
    });
  }

  const x0 = MARGIN_X + (logo ? 64 : 0) + 4;

  page.drawText(COMPANY_NAME, {
    x: x0,
    y: height - 28,
    size: 11,
    font: fonts.regular,
    color: COLOR_MUTED,
  });

  page.drawText(REPORT_TITLE, {
    x: x0,
    y: height - 44,
    size: SIZE_H1,
    font: fonts.bold,
    color: COLOR_TEXT,
  });

  page.drawRectangle({
    x: MARGIN_X,
    y: height - HEADER_H - 1,
    width: width - MARGIN_X * 2,
    height: 1.2,
    color: COLOR_ACCENT,
  });

  return height - HEADER_H - 18;
}

function drawFooter(page: any, fonts: Fonts, pageNum: number, total: number) {
  const { width } = page.getSize();

  page.drawRectangle({
    x: MARGIN_X,
    y: FOOTER_H - 10,
    width: width - MARGIN_X * 2,
    height: 0.8,
    color: COLOR_DIVIDER,
  });

  const footer = `${FOOTER_ADDRESS}  ·  ${FOOTER_EMAIL}  ·  ${FOOTER_PHONE}  ·  ${FOOTER_WEBSITE}`;
  page.drawText(footer, {
    x: MARGIN_X,
    y: FOOTER_H - 32,
    size: 8.5,
    font: fonts.regular,
    color: COLOR_MUTED,
  });

  const pn = `Page ${pageNum} of ${total}`;
  const pnWidth = fonts.regular.widthOfTextAtSize(pn, 8.5);
  page.drawText(pn, {
    x: MARGIN_X + (width - MARGIN_X * 2) - pnWidth,
    y: FOOTER_H - 32,
    size: 8.5,
    font: fonts.regular,
    color: COLOR_MUTED,
  });
}

function newPage(pdf: PDFDocument) {
  return pdf.addPage(A4);
}

/** ---------- API ---------- */
export async function POST(req: NextRequest) {
  const { name, track, answers } = (await req.json()) as {
    name: string;
    track: Track;
    answers: AnswerMap;
  };

  if (!name || !track || !answers) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const result = getEligibilityAdvisory(track, answers);

  const pdf = await PDFDocument.create();

  // Try custom fonts first; gracefully fall back to built-ins
  let regular: any;
  let bold: any;
  const regBytes = await loadFontBytes("Inter-Regular.ttf");
  const boldBytes = await loadFontBytes("Inter-Bold.ttf");
  if (regBytes && boldBytes) {
    regular = await pdf.embedFont(regBytes, { subset: true });
    bold = await pdf.embedFont(boldBytes, { subset: true });
  } else {
    const { StandardFonts } = await import("pdf-lib");
    regular = await pdf.embedFont(StandardFonts.Helvetica);
    bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }

  const logo = await embedLogo(pdf);

  let page = newPage(pdf);
  let y = drawHeader(page, { regular, bold }, logo);

  const usableW = A4[0] - MARGIN_X * 2;
  const ensure = (need: number) => {
    if (y - need < FOOTER_H + 24) {
      page = newPage(pdf);
      y = drawHeader(page, { regular, bold }, logo);
    }
  };

  const write = (text: string, size = SIZE_TEXT) => {
    const lines = wrap(text, usableW, regular, size);
    for (const ln of lines) {
      page.drawText(ln, { x: MARGIN_X, y, size, font: regular, color: COLOR_TEXT });
      y -= LINE;
    }
  };

  const section = (title: string) => {
    page.drawText(title, { x: MARGIN_X, y, size: SIZE_H2, font: bold, color: COLOR_TEXT });
    y -= LINE;
  };

  /* --- Meta --- */
  ensure(LINE * 4);
  write(`Name: ${name || "-"}`);
  write(`Track: ${track}`);
  write(`Generated: ${new Date().toLocaleString()}`);

  /* --- Summary --- */
  ensure(LINE * 4);
  section("Summary");
  write(`${result.tier} — ${result.summary}`);

  /* --- Highlight card (first program) --- */
  if (result.programs?.length) {
    ensure(92);
    const cardX = MARGIN_X;
    const cardW = usableW;
    const cardH = 82;
    const cardY = y - cardH + 6;

    page.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardW,
      height: cardH,
      color: rgb(1, 1, 1),
      borderColor: COLOR_CARD_BORDER,
      borderWidth: 1,
    });

    const p0 = result.programs[0];
    page.drawText(p0?.name ?? "Suggested Program", {
      x: cardX + 12,
      y: cardY + cardH - 22,
      size: SIZE_H2,
      font: bold,
      color: COLOR_TEXT,
    });

    const lines = wrap(p0?.why ?? "Based on your profile.", cardW - 24, regular, SIZE_TEXT);
    let yy = cardY + cardH - 22 - LINE;
    for (const ln of lines) {
      page.drawText(ln, { x: cardX + 12, y: yy, size: SIZE_TEXT, font: regular, color: COLOR_MUTED });
      yy -= LINE;
    }

    y = cardY - 12;
  }

  /* --- Additional programs --- */
  const rest = (result.programs || []).slice(1, 5);
  if (rest.length) {
    ensure(LINE * (rest.length * 3));
    section("Additional Options");
    for (const p of rest) {
      const text = `${p.name}${p.why ? ` — ${p.why}` : ""}`;
      const lines = wrap(text, usableW - 14, regular, SIZE_TEXT);
      page.drawText("•", { x: MARGIN_X, y, size: SIZE_TEXT, font: bold, color: COLOR_TEXT });
      let yy = y;
      for (const ln of lines) {
        page.drawText(ln, { x: MARGIN_X + 12, y: yy, size: SIZE_TEXT, font: regular, color: COLOR_TEXT });
        yy -= LINE;
      }
      y = yy;
    }
  }

  if (result.criteria?.length) {
    ensure(LINE * (result.criteria.length + 3));
    section("Assessment Criteria");
    for (const item of result.criteria.slice(0, 6)) {
      const lines = wrap(`- ${item}`, usableW, regular, SIZE_TEXT);
      for (const ln of lines) {
        page.drawText(ln, { x: MARGIN_X, y, size: SIZE_TEXT, font: regular, color: COLOR_TEXT });
        y -= LINE;
      }
    }
  }

  if (result.sources?.length) {
    ensure(LINE * (result.sources.length + 3));
    section("Content Sources");
    for (const source of result.sources.slice(0, 5)) {
      const lines = wrap(`- ${source.label}: ${source.href}`, usableW, regular, SIZE_TEXT);
      for (const ln of lines) {
        page.drawText(ln, { x: MARGIN_X, y, size: SIZE_TEXT, font: regular, color: COLOR_TEXT });
        y -= LINE;
      }
    }
  }

  /* --- Your Inputs (strict two-column grid) --- */
  ensure(LINE * 6);
  section("Your Inputs");

  const entries = Object.entries(answers);
  const half = Math.ceil(entries.length / 2);
  const left = entries.slice(0, half);
  const right = entries.slice(half);

  // exact grid: two columns, each column has fixed label width
  const gap = 24;
  const colW = (usableW - gap) / 2;
  const labelW = 92;

  const drawCol = (items: [string, unknown][], x: number) => {
    let yy = y;
    for (const [k, v] of items) {
      // label
      page.drawText(`${labelize(k)}:`, { x, y: yy, size: SIZE_TEXT, font: bold, color: COLOR_TEXT });

      // value (wrapped), start after labelW
      const text = toStr(v);
      const lines = wrap(text, colW - labelW, regular, SIZE_TEXT);
      let vy = yy;
      for (const ln of lines) {
        page.drawText(ln, {
          x: x + labelW,
          y: vy,
          size: SIZE_TEXT,
          font: regular,
          color: COLOR_TEXT,
        });
        vy -= LINE;
      }
      yy = Math.min(yy - LINE, vy) - 2; // step row down uniformly
    }
    return yy;
  };

  const yLeft = drawCol(left, MARGIN_X);
  const yRight = drawCol(right, MARGIN_X + colW + gap);
  y = Math.min(yLeft, yRight) - 8;

  /* --- Next steps --- */
  ensure(LINE * 4);
  section("Next Steps");
  write(
    `Book a free consultation to review your profile, documents and timelines. ` +
      `Contact ${FOOTER_EMAIL} or visit ${FOOTER_WEBSITE}.`
  );

  /* --- Footer on each page --- */
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    drawFooter(pages[i], { regular, bold }, i + 1, pages.length);
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Eligibility_${track}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
