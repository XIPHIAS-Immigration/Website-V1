import { NextRequest, NextResponse } from "next/server";
import type { Track, AnswerMap, Program } from "@/lib/eligibility/types";
import { getEligibilityAdvisory } from "@/lib/platform/eligibility-advisor";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const runtime = "nodejs";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "XIPHIAS Immigration";
const REPORT_TITLE = "Assessment Preview Report";
const DEFAULT_SITE_URL = "https://www.xiphiasimmigration.com";
const DEFAULT_REPORT_PAYMENT_PATH = "/registration";
const DEFAULT_REPORT_PRICE_INR = "10000";
const PDF_LOGO_BASE64 = process.env.PDF_LOGO_BASE64 || "";

const FOOTER_ADDRESS =
  process.env.NEXT_PUBLIC_PDF_ADDRESS ||
  "Aurbis Prime No. 1, Koramangala, Bengaluru, India 560034";
const FOOTER_EMAIL = process.env.NEXT_PUBLIC_PDF_EMAIL || "immigration@xiphias.in";
const FOOTER_PHONE = process.env.NEXT_PUBLIC_PDF_PHONE || "+91 9021335577";
const FOOTER_WEBSITE = process.env.NEXT_PUBLIC_PDF_WEBSITE || "www.xiphiasimmigration.com";

const A4: [number, number] = [595.28, 841.89];
const MARGIN_X = 42;
const FOOTER_H = 44;
const HEADER_H = 62;

const NAVY = rgb(0.03, 0.1, 0.24);
const BLUE = rgb(0.03, 0.24, 0.55);
const GOLD = rgb(0.86, 0.68, 0.14);
const PALE_BLUE = rgb(0.94, 0.97, 1);
const ICE = rgb(0.975, 0.985, 1);
const WHITE = rgb(1, 1, 1);
const TEXT = rgb(0.05, 0.08, 0.15);
const MUTED = rgb(0.33, 0.39, 0.48);
const BORDER = rgb(0.82, 0.87, 0.94);
const GREEN = rgb(0.02, 0.46, 0.31);
const AMBER = rgb(0.58, 0.38, 0.05);

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
};

type ImageSet = {
  logo: PDFImage | null;
  whiteLogo: PDFImage | null;
  hero: PDFImage | null;
  flag: PDFImage | null;
};

type ReportProgram = Program & {
  fitNotes: string[];
  verificationNotes: string[];
  sourceLabel?: string;
};

const COUNTRY_CODES: Record<string, string> = {
  australia: "AU",
  bahrain: "BH",
  canada: "CA",
  egypt: "EG",
  germany: "DE",
  greece: "GR",
  india: "IN",
  italy: "IT",
  malta: "MT",
  oman: "OM",
  portugal: "PT",
  qatar: "QA",
  singapore: "SG",
  spain: "ES",
  switzerland: "CH",
  turkey: "TR",
  uae: "AE",
  unitedarabemirates: "AE",
  unitedkingdom: "GB",
  uk: "GB",
  unitedstates: "US",
  usa: "US",
 };

function labelize(k: string) {
  return k.replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

function toStr(v: unknown) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v == null) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function absoluteUrl(pathOrUrl: string, siteUrl = getSiteUrl()) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function formatInr(value: string) {
  const numeric = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return `INR ${value}`;
  return `INR ${numeric.toLocaleString("en-IN")}`;
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeKey(value?: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

function countryCode(country?: string) {
  const key = normalizeKey(country);
  return COUNTRY_CODES[key] || key.slice(0, 2).toUpperCase() || "XI";
}

function cleanCopy(value?: string) {
  return String(value || "")
    .replace(/#+\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function publicPath(assetPath: string) {
  return path.join(process.cwd(), "public", assetPath.replace(/^\/+/, "").split(/[?#]/, 1)[0]);
}

async function fileExists(assetPath: string) {
  try {
    await fs.access(publicPath(assetPath));
    return true;
  } catch {
    return false;
  }
}

async function embedAsset(pdf: PDFDocument, assetPath?: string | null) {
  if (!assetPath || /^https?:\/\//i.test(assetPath)) return null;
  try {
    const clean = assetPath.split(/[?#]/, 1)[0];
    const ext = path.extname(clean).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) return null;
    const bytes = await fs.readFile(publicPath(clean));
    if (ext === ".png") return await pdf.embedPng(bytes);
    return await pdf.embedJpg(bytes);
  } catch {
    return null;
  }
}

async function embedLogo(pdf: PDFDocument, dark = false) {
  if (PDF_LOGO_BASE64.includes("base64")) {
    try {
      const bytes = Buffer.from(PDF_LOGO_BASE64.split(",").pop() || "", "base64");
      return await pdf.embedPng(bytes);
    } catch {
      // Fall through to bundled logo.
    }
  }
  return embedAsset(pdf, dark ? "/images/logo/xiphias-immigration-white.png" : "/images/logo/xiphias-immigration.png");
}

function countryAliases(country?: string) {
  const c = country || "";
  const key = normalizeKey(c);
  const aliases = new Set<string>([key]);
  if (/unitedstates|usa|us/.test(key)) ["usa", "unitedstates", "america"].forEach((v) => aliases.add(v));
  if (/unitedarabemirates|uae|dubai/.test(key)) ["uae", "dubai", "unitedarabemirates"].forEach((v) => aliases.add(v));
  if (/qatar|qa/.test(key)) ["qatar", "qa"].forEach((v) => aliases.add(v));
  if (/bahrain|bh/.test(key)) ["bahrain", "bh"].forEach((v) => aliases.add(v));
  if (/egypt|ejypt/.test(key)) ["egypt", "ejypt"].forEach((v) => aliases.add(v));
  if (/newzealand|newzeland/.test(key)) ["newzealand", "newzeland"].forEach((v) => aliases.add(v));
  if (/mauritius|maurtius/.test(key)) ["mauritius", "maurtius"].forEach((v) => aliases.add(v));
  if (/luxembourg|laxembourg/.test(key)) ["luxembourg", "laxembourg"].forEach((v) => aliases.add(v));
  if (/cyprus|cyprust/.test(key)) ["cyprus", "cyprust"].forEach((v) => aliases.add(v));
  return [...aliases].filter(Boolean);
}

async function findFlagPath(country?: string) {
  if (!country) return null;
  const aliases = countryAliases(country);
  try {
    const dir = path.join(process.cwd(), "public", "images", "flags");
    const files = await fs.readdir(dir);
    const match = files.find((file) => aliases.includes(normalizeKey(path.basename(file, path.extname(file)))));
    return match ? `/images/flags/${match}` : null;
  } catch {
    return null;
  }
}

async function selectHeroAsset(track: Track, country?: string, programName?: string) {
  const key = normalizeKey(`${country || ""} ${programName || ""}`);
  const candidates: string[] = [];

  if (/qatar|gulf|uae|unitedarabemirates/.test(key)) candidates.push("/images/articles/uae-investment-migration-2026.webp");
  if (/greece/.test(key)) candidates.push("/images/articles/greece-golden-visa-pro.jpg");
  if (/unitedstates|usa|eb5|eb3/.test(key)) candidates.push("/images/skilled/usa/eb3-visa.png");
  if (/australia/.test(key)) candidates.push("/images/skilled/australia/australia-858-talent-visa.png");
  if (track === "citizenship") candidates.push("/images/hero/citizenship.png");
  if (track === "residency" || track === "corporate") candidates.push("/images/hero/residency.png");
  candidates.push("/images/articles/xiphias-immigration.jpg", "/xiphias-immigration.png");

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

function wrap(text: string, maxWidth: number, font: PDFFont, size: number) {
  const words = String(text || "").replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fonts: Fonts,
  options: {
    size?: number;
    color?: RGB;
    bold?: boolean;
    italic?: boolean;
    lineHeight?: number;
    maxLines?: number;
  } = {}
) {
  const size = options.size ?? 10;
  const lineHeight = options.lineHeight ?? size + 4;
  const font = options.bold ? fonts.bold : options.italic ? fonts.italic : fonts.regular;
  let lines = wrap(text, maxWidth, font, size);
  if (options.maxLines && lines.length > options.maxLines) {
    lines = lines.slice(0, options.maxLines);
    const last = lines[lines.length - 1] || "";
    lines[lines.length - 1] = `${last.replace(/[.,;:\s]+$/, "")}...`;
  }
  let cursor = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cursor, size, font, color: options.color ?? TEXT });
    cursor -= lineHeight;
  }
  return cursor;
}

function drawImageContain(page: PDFPage, image: PDFImage, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, {
    x: x + (width - w) / 2,
    y: y + (height - h) / 2,
    width: w,
    height: h,
  });
}

function drawImageCoverSoft(page: PDFPage, image: PDFImage, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, {
    x: x + (width - w) / 2,
    y: y + (height - h) / 2,
    width: w,
    height: h,
  });
}

function drawIcon(page: PDFPage, kind: "passport" | "travel" | "shield" | "report" | "briefcase", x: number, y: number, size: number, color: RGB) {
  if (kind === "passport") {
    page.drawRectangle({ x, y, width: size * 0.72, height: size, color, borderColor: WHITE, borderWidth: 0.8 });
    page.drawCircle({ x: x + size * 0.36, y: y + size * 0.58, size: size * 0.16, color: WHITE });
    page.drawLine({ start: { x: x + size * 0.18, y: y + size * 0.28 }, end: { x: x + size * 0.54, y: y + size * 0.28 }, thickness: 1, color: WHITE });
    return;
  }
  if (kind === "travel") {
    page.drawLine({ start: { x, y: y + size * 0.42 }, end: { x: x + size, y: y + size * 0.72 }, thickness: 2, color });
    page.drawLine({ start: { x: x + size * 0.58, y: y + size * 0.6 }, end: { x: x + size * 0.28, y: y + size * 0.95 }, thickness: 1.5, color });
    page.drawLine({ start: { x: x + size * 0.58, y: y + size * 0.6 }, end: { x: x + size * 0.43, y: y + size * 0.14 }, thickness: 1.5, color });
    return;
  }
  if (kind === "shield") {
    page.drawRectangle({ x: x + size * 0.15, y: y + size * 0.16, width: size * 0.7, height: size * 0.68, color, borderColor: color, borderWidth: 1 });
    page.drawLine({ start: { x: x + size * 0.3, y: y + size * 0.48 }, end: { x: x + size * 0.46, y: y + size * 0.32 }, thickness: 1.6, color: WHITE });
    page.drawLine({ start: { x: x + size * 0.46, y: y + size * 0.32 }, end: { x: x + size * 0.72, y: y + size * 0.62 }, thickness: 1.6, color: WHITE });
    return;
  }
  if (kind === "report") {
    page.drawRectangle({ x, y, width: size * 0.78, height: size, borderColor: color, borderWidth: 1.4 });
    for (let i = 0; i < 3; i++) {
      page.drawLine({ start: { x: x + size * 0.18, y: y + size * (0.72 - i * 0.2) }, end: { x: x + size * 0.62, y: y + size * (0.72 - i * 0.2) }, thickness: 1.2, color });
    }
    return;
  }
  page.drawRectangle({ x, y: y + size * 0.15, width: size, height: size * 0.58, borderColor: color, borderWidth: 1.6 });
  page.drawLine({ start: { x: x + size * 0.34, y: y + size * 0.76 }, end: { x: x + size * 0.66, y: y + size * 0.76 }, thickness: 1.5, color });
}

function drawHeader(page: PDFPage, fonts: Fonts, images: ImageSet) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: HEADER_H, color: WHITE });
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: 4, color: GOLD });
  if (images.logo) drawImageContain(page, images.logo, MARGIN_X, height - 48, 118, 28);
  page.drawText(REPORT_TITLE, {
    x: width - MARGIN_X - fonts.bold.widthOfTextAtSize(REPORT_TITLE, 12),
    y: height - 34,
    size: 12,
    font: fonts.bold,
    color: NAVY,
  });
  return height - HEADER_H - 24;
}

function drawFooter(page: PDFPage, fonts: Fonts, pageNum: number, total: number) {
  const { width } = page.getSize();
  page.drawRectangle({ x: MARGIN_X, y: FOOTER_H - 10, width: width - MARGIN_X * 2, height: 0.8, color: BORDER });
  const footer = `${FOOTER_EMAIL} | ${FOOTER_PHONE} | ${FOOTER_WEBSITE}`;
  page.drawText(footer, { x: MARGIN_X, y: FOOTER_H - 30, size: 7.5, font: fonts.regular, color: MUTED });
  const pn = `Page ${pageNum} of ${total}`;
  page.drawText(pn, {
    x: width - MARGIN_X - fonts.regular.widthOfTextAtSize(pn, 7.5),
    y: FOOTER_H - 30,
    size: 7.5,
    font: fonts.regular,
    color: MUTED,
  });
}

function drawMetricCard(page: PDFPage, fonts: Fonts, label: string, value: string, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y, width: w, height: h, color: WHITE, borderColor: BORDER, borderWidth: 1 });
  page.drawText(label.toUpperCase(), { x: x + 12, y: y + h - 18, size: 7.5, font: fonts.bold, color: MUTED });
  drawWrappedText(page, value, x + 12, y + h - 38, w - 24, fonts, { size: 14, bold: true, color: NAVY, maxLines: 2, lineHeight: 15 });
}

function drawFlagMark(
  page: PDFPage,
  fonts: Fonts,
  images: ImageSet,
  country: string | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const code = countryCode(country);
  if (images.flag) {
    drawImageContain(page, images.flag, x, y, w, h);
    return;
  }

  if (code === "QA") {
    page.drawRectangle({ x, y, width: w, height: h, color: rgb(0.55, 0.06, 0.22), borderColor: BORDER, borderWidth: 0.6 });
    page.drawRectangle({ x, y, width: Math.max(8, w * 0.32), height: h, color: WHITE });
    const toothCount = 6;
    for (let i = 0; i < toothCount; i++) {
      const toothY = y + i * (h / toothCount);
      page.drawLine({
        start: { x: x + w * 0.32, y: toothY },
        end: { x: x + w * 0.5, y: toothY + h / (toothCount * 2) },
        thickness: Math.max(0.9, h / 18),
        color: WHITE,
      });
    }
    return;
  }

  page.drawCircle({ x: x + w / 2, y: y + h / 2, size: Math.min(w, h) / 2, color: BLUE });
  page.drawText(code, {
    x: x + w / 2 - fonts.bold.widthOfTextAtSize(code, Math.min(12, h * 0.38)) / 2,
    y: y + h / 2 - Math.min(12, h * 0.38) / 3,
    size: Math.min(12, h * 0.38),
    font: fonts.bold,
    color: WHITE,
  });
}

function drawCountryBadge(
  page: PDFPage,
  fonts: Fonts,
  images: ImageSet,
  country: string | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  page.drawRectangle({ x, y, width: w, height: h, color: ICE, borderColor: BORDER, borderWidth: 1 });
  drawFlagMark(page, fonts, images, country, x + 10, y + 13, 44, h - 26);
  page.drawText("COUNTRY FOCUS", { x: x + 68, y: y + h - 22, size: 7.4, font: fonts.bold, color: MUTED });
  drawWrappedText(page, country || "Advisor shortlist", x + 68, y + h - 42, w - 80, fonts, {
    size: 13,
    bold: true,
    color: NAVY,
    maxLines: 1,
  });
}

function drawStepCard(page: PDFPage, fonts: Fonts, idx: string, title: string, copy: string, x: number, y: number, w: number) {
  page.drawRectangle({ x, y, width: w, height: 66, color: ICE, borderColor: BORDER, borderWidth: 1 });
  page.drawCircle({ x: x + 18, y: y + 46, size: 10, color: BLUE });
  page.drawText(idx, { x: x + 15.4, y: y + 42.5, size: 9, font: fonts.bold, color: WHITE });
  page.drawText(title, { x: x + 34, y: y + 46, size: 10, font: fonts.bold, color: NAVY });
  drawWrappedText(page, copy, x + 12, y + 29, w - 24, fonts, { size: 8.2, color: MUTED, lineHeight: 10, maxLines: 2 });
}

function drawProgramCard(page: PDFPage, fonts: Fonts, p: ReportProgram, x: number, y: number, w: number, h: number, featured = false) {
  page.drawRectangle({ x, y, width: w, height: h, color: featured ? PALE_BLUE : WHITE, borderColor: featured ? GOLD : BORDER, borderWidth: featured ? 1.5 : 1 });
  if (typeof p.score === "number") {
    page.drawCircle({ x: x + w - 24, y: y + h - 22, size: 14, color: GREEN });
    const score = String(p.score);
    page.drawText(score, {
      x: x + w - 24 - fonts.bold.widthOfTextAtSize(score, 8.5) / 2,
      y: y + h - 25,
      size: 8.5,
      font: fonts.bold,
      color: WHITE,
    });
  }
  drawWrappedText(page, p.name || "Suggested Program", x + 16, y + h - 22, w - 58, fonts, {
    size: featured ? 13.5 : 11.5,
    bold: true,
    color: NAVY,
    maxLines: 2,
    lineHeight: featured ? 15 : 13,
  });

  const meta = [p.country, p.sourceLabel].filter(Boolean).join(" - ");
  if (meta) {
    drawWrappedText(page, meta, x + 16, y + h - 52, w - 52, fonts, {
      size: 8.6,
      bold: true,
      color: BLUE,
      maxLines: 1,
    });
  }

  let bodyY = y + h - 70;
  bodyY = drawWrappedText(page, cleanCopy(p.why) || "Matched against your profile and XIPHIAS route criteria.", x + 16, bodyY, w - 34, fonts, {
    size: featured ? 9.2 : 8.7,
    color: MUTED,
    lineHeight: featured ? 12 : 11,
    maxLines: featured ? 3 : 2,
  });

  const notes = [...(p.fitNotes || []), ...(p.verificationNotes || [])].slice(0, featured ? 5 : 3);
  let noteY = Math.min(bodyY - 4, y + h - (featured ? 118 : 96));
  for (const note of notes) {
    if (noteY < y + 14) break;
    page.drawRectangle({ x: x + 17, y: noteY - 4, width: 5, height: 5, color: featured ? GOLD : BLUE });
    noteY = drawWrappedText(page, note, x + 30, noteY, w - 48, fonts, {
      size: featured ? 8.5 : 8.1,
      color: TEXT,
      lineHeight: featured ? 10.5 : 10,
      maxLines: 1,
    });
    noteY -= 2;
  }
}

function trackLabel(track: Track) {
  return titleCase(track);
}

function makeRouteLabel(country?: string, program?: string) {
  return country || program || "Advisor shortlist";
}

function isQatarFocus(country?: string) {
  return normalizeKey(country) === "qatar";
}

function defaultFitNotes(track: Track, country?: string) {
  const notes = [
    "Matched to submitted goal, budget, family, and timeline answers.",
    country ? `${country} focus retained; unrelated countries are not substituted.` : "Country focus requires advisor confirmation.",
  ];
  if (track === "residency") notes.push("Residency route requires document, background, and source-of-funds review.");
  if (track === "corporate") notes.push("Corporate route requires entity, ownership, and hiring plan review.");
  if (track === "citizenship") notes.push("Citizenship route requires nationality, family, and investment-source checks.");
  if (track === "skilled") notes.push("Skilled route requires occupation, offer, credential, and language review.");
  return notes;
}

function defaultVerificationNotes(program: Program, country?: string) {
  return [
    program.href ? `Open source page: ${program.href}` : "Final rule, fee, and processing checks are advisor-reviewed.",
    country ? `${country} rules may change; verify latest government criteria before filing.` : "Program fit is indicative until staff review.",
  ];
}

function reportProgram(program: Program, track: Track, country?: string, index = 0): ReportProgram {
  return {
    ...program,
    country: program.country || country,
    why: cleanCopy(program.why),
    score: program.score ?? Math.max(62, 82 - index * 5),
    sourceLabel: program.href ? "XIPHIAS program page" : "Assessment route logic",
    fitNotes: defaultFitNotes(track, program.country || country).slice(0, index === 0 ? 4 : 3),
    verificationNotes: defaultVerificationNotes(program, program.country || country).slice(0, 2),
  };
}

function buildReportPrograms(args: {
  track: Track;
  country?: string;
  programs: Program[];
}): ReportProgram[] {
  const base = args.programs.map((program, index) => reportProgram(program, args.track, args.country, index));

  if (args.track === "residency" && isQatarFocus(args.country)) {
    const qatar: ReportProgram = {
      name: "Qatar 10-Year Residency Review",
      country: "Qatar",
      href: "/articles/uae-investment-migration-2026-avoid-mistakes",
      why:
        "XIPHIAS content references Qatar's 10-year long-term residency direction for entrepreneurs, executives, and investors. This should be treated as a staff-reviewed Qatar route, not an automatic approval.",
      score: Math.max(76, base[0]?.score ?? 76),
      sourceLabel: "Approved Gulf residency article",
      fitNotes: [
        "Best suited for entrepreneur, executive, investor, or business-owner profiles.",
        "Family inclusion and GCC lifestyle objectives should be checked during advisor review.",
        "Route should be compared against UAE Golden Visa and UAE company-residence options.",
        "Use official-channel verification before any filing or investment commitment.",
      ],
      verificationNotes: [
        "No dedicated Qatar product page exists yet, so staff must verify the latest Qatar rules.",
        "Advisor should confirm capital, sector, business plan, and document readiness.",
      ],
    };

    const gulfAlternatives: ReportProgram[] = [
      {
        name: "UAE Golden Visa / Investor Residency",
        country: "United Arab Emirates",
        href: "/residency/uae",
        why:
          "A mature Gulf long-term residency option for investors, entrepreneurs, and selected professional categories; useful as a benchmark against Qatar.",
        score: 72,
        sourceLabel: "XIPHIAS UAE residency content",
        fitNotes: [
          "Relevant Gulf alternative for investor or entrepreneur-led relocation.",
          "Can include family planning, business continuity, and long-term residence objectives.",
          "Useful if Qatar requirements are selective or still being verified.",
        ],
        verificationNotes: [
          "Verify current UAE category, investment threshold, and official application channel.",
          "Compare tax, business setup, and dependent sponsorship implications.",
        ],
      },
      {
        name: "Dubai Investor Visa / Partner Visa",
        country: "United Arab Emirates",
        href: "/corporate/uae/dubai-investor-visa",
        why:
          "A business-linked UAE residence path through verified company shareholding or business investment.",
        score: 70,
        sourceLabel: "XIPHIAS corporate program page",
        fitNotes: [
          "Relevant where company ownership, director relocation, or Gulf expansion is part of the plan.",
          "Can connect registration, company setup, establishment card, and family residence workflow.",
        ],
        verificationNotes: [
          "Company structure, shareholding, license activity, and medical/Emirates ID steps need staff review.",
        ],
      },
    ];

    const existingNames = new Set(base.map((program) => normalizeKey(program.name)));
    return [qatar, ...base.filter((program) => !/taxplanning|documentchecklist/i.test(normalizeKey(program.name))), ...gulfAlternatives]
      .filter((program, index, arr) => {
        const key = normalizeKey(program.name);
        return !existingNames.has(key) || index <= base.length;
      })
      .filter((program, index, arr) => arr.findIndex((item) => normalizeKey(item.name) === normalizeKey(program.name)) === index)
      .slice(0, 6);
  }

  return base.slice(0, 6);
}

async function loadImages(pdf: PDFDocument, track: Track, country?: string, programName?: string): Promise<ImageSet> {
  const [logo, whiteLogo, hero, flag] = await Promise.all([
    embedLogo(pdf, false),
    embedLogo(pdf, true),
    selectHeroAsset(track, country, programName).then((asset) => embedAsset(pdf, asset)),
    findFlagPath(country).then((asset) => embedAsset(pdf, asset)),
  ]);
  return { logo, whiteLogo, hero, flag };
}

function drawCoverPage(
  page: PDFPage,
  fonts: Fonts,
  images: ImageSet,
  args: {
    name: string;
    track: Track;
    country?: string;
    program?: string;
    tier: string;
    confidence?: number;
    summary: string;
    generatedAt: string;
    reportPrice: string;
    reportPaymentUrl: string;
  }
) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE });
  page.drawRectangle({ x: 0, y: height - 250, width, height: 250, color: NAVY });
  page.drawRectangle({ x: 0, y: height - 250, width, height: 7, color: GOLD });
  page.drawCircle({ x: width - 62, y: height - 52, size: 74, color: BLUE });
  page.drawCircle({ x: width - 132, y: height - 220, size: 42, color: rgb(0.07, 0.18, 0.36) });

  if (images.whiteLogo) {
    drawImageContain(page, images.whiteLogo, MARGIN_X, height - 70, 150, 34);
  } else if (images.logo) {
    page.drawRectangle({ x: MARGIN_X, y: height - 72, width: 150, height: 38, color: WHITE });
    drawImageContain(page, images.logo, MARGIN_X + 8, height - 64, 134, 22);
  } else {
    page.drawText(COMPANY_NAME, { x: MARGIN_X, y: height - 54, size: 16, font: fonts.bold, color: WHITE });
  }

  page.drawText("PRIVATE CLIENT ASSESSMENT", { x: MARGIN_X, y: height - 105, size: 8.5, font: fonts.bold, color: GOLD });
  drawWrappedText(page, REPORT_TITLE, MARGIN_X, height - 135, 255, fonts, { size: 28, bold: true, color: WHITE, lineHeight: 30, maxLines: 2 });
  drawWrappedText(
    page,
    "A concise route preview prepared from your XIPHIAS assessment answers. Full advisor report unlocks after registration.",
    MARGIN_X,
    height - 194,
    252,
    fonts,
    { size: 10.5, color: rgb(0.85, 0.9, 0.98), lineHeight: 14, maxLines: 3 }
  );

  const heroX = 330;
  const heroY = height - 210;
  const heroW = 198;
  const heroH = 132;
  page.drawRectangle({ x: heroX - 8, y: heroY - 8, width: heroW + 16, height: heroH + 16, color: WHITE, borderColor: GOLD, borderWidth: 1 });
  if (images.hero && !isQatarFocus(args.country)) {
    drawImageCoverSoft(page, images.hero, heroX, heroY, heroW, heroH);
  } else {
    page.drawRectangle({ x: heroX, y: heroY, width: heroW, height: heroH, color: PALE_BLUE, borderColor: BORDER, borderWidth: 0.6 });
    drawFlagMark(page, fonts, images, args.country, heroX + 18, heroY + 72, 58, 36);
    page.drawText("ROUTE REVIEW", { x: heroX + 92, y: heroY + 96, size: 8, font: fonts.bold, color: BLUE });
    drawWrappedText(page, args.country || "Advisor shortlist", heroX + 92, heroY + 80, 86, fonts, {
      size: 15,
      bold: true,
      color: NAVY,
      maxLines: 1,
    });
    page.drawRectangle({ x: heroX + 18, y: heroY + 22, width: heroW - 36, height: 34, color: WHITE, borderColor: BORDER, borderWidth: 0.6 });
    drawWrappedText(page, `${trackLabel(args.track)} + advisor verification`, heroX + 30, heroY + 43, heroW - 60, fonts, {
      size: 9.5,
      bold: true,
      color: NAVY,
      maxLines: 1,
    });
    drawWrappedText(page, "Program shortlist prepared from XIPHIAS content and assessment rules.", heroX + 30, heroY + 30, heroW - 60, fonts, {
      size: 7.6,
      color: MUTED,
      maxLines: 1,
    });
  }

  const profileY = height - 355;
  page.drawRectangle({ x: MARGIN_X, y: profileY, width: width - MARGIN_X * 2, height: 96, color: WHITE, borderColor: BORDER, borderWidth: 1 });
  page.drawText("Prepared for", { x: MARGIN_X + 18, y: profileY + 65, size: 8.5, font: fonts.bold, color: MUTED });
  drawWrappedText(page, args.name || "Client", MARGIN_X + 18, profileY + 45, 188, fonts, { size: 18, bold: true, color: NAVY, maxLines: 1 });
  page.drawText(`Generated ${args.generatedAt}`, { x: MARGIN_X + 18, y: profileY + 20, size: 8, font: fonts.regular, color: MUTED });

  drawFlagMark(page, fonts, images, args.country, MARGIN_X + 226, profileY + 36, 44, 28);
  drawMetricCard(page, fonts, "Pathway", trackLabel(args.track), MARGIN_X + 286, profileY + 18, 104, 58);
  drawMetricCard(page, fonts, "Route focus", makeRouteLabel(args.country, args.program), MARGIN_X + 404, profileY + 18, 108, 58);

  const statusY = profileY - 94;
  drawMetricCard(page, fonts, "Result tier", args.tier, MARGIN_X, statusY, 154, 68);
  drawMetricCard(page, fonts, "Confidence", typeof args.confidence === "number" ? `${args.confidence}/100` : "Advisor review", MARGIN_X + 170, statusY, 154, 68);
  drawMetricCard(page, fonts, "Report unlock", args.reportPrice, MARGIN_X + 340, statusY, 170, 68);

  const summaryY = statusY - 114;
  page.drawRectangle({ x: MARGIN_X, y: summaryY, width: width - MARGIN_X * 2, height: 88, color: PALE_BLUE, borderColor: BORDER, borderWidth: 1 });
  page.drawText("Preview Summary", { x: MARGIN_X + 16, y: summaryY + 62, size: 13, font: fonts.bold, color: NAVY });
  drawWrappedText(page, `${args.tier} - ${args.summary}`, MARGIN_X + 16, summaryY + 42, width - MARGIN_X * 2 - 32, fonts, {
    size: 10.2,
    color: TEXT,
    lineHeight: 13,
    maxLines: 3,
  });

  const stepsY = summaryY - 94;
  drawStepCard(page, fonts, "1", "Profile", "Assessment answers captured.", MARGIN_X, stepsY, 118);
  drawStepCard(page, fonts, "2", "Route", "Program match prepared.", MARGIN_X + 130, stepsY, 118);
  drawStepCard(page, fonts, "3", "Review", "Risk and document checks.", MARGIN_X + 260, stepsY, 118);
  drawStepCard(page, fonts, "4", "Report", "Full PDF after registration.", MARGIN_X + 390, stepsY, 118);

  const unlockY = stepsY - 104;
  page.drawRectangle({ x: MARGIN_X, y: unlockY, width: width - MARGIN_X * 2, height: 82, color: NAVY, borderColor: GOLD, borderWidth: 1 });
  drawIcon(page, "report", MARGIN_X + 16, unlockY + 28, 28, GOLD);
  page.drawText("Unlock the detailed 20-30 page personal report", { x: MARGIN_X + 56, y: unlockY + 52, size: 13, font: fonts.bold, color: WHITE });
  drawWrappedText(
    page,
    `Registration starts at ${args.reportPrice}. Full report includes route comparison, document checklist, timeline, risk flags, advisor notes, and XIPHIAS Hub onboarding.`,
    MARGIN_X + 56,
    unlockY + 34,
    410,
    fonts,
    { size: 8.8, color: rgb(0.86, 0.91, 0.98), lineHeight: 11, maxLines: 3 }
  );
  page.drawText(args.reportPaymentUrl, { x: MARGIN_X + 56, y: unlockY + 12, size: 7.8, font: fonts.bold, color: GOLD });
}

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
  const initialProgram = result.programs?.[0];
  const country = result.countryFocus || initialProgram?.country;
  const reportPrograms = buildReportPrograms({ track, country, programs: result.programs || [] });
  const primaryProgram = reportPrograms[0];
  const generatedAt = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const siteUrl = getSiteUrl();
  const reportPaymentUrl = absoluteUrl(
    process.env.ASSESSMENT_REPORT_PAYMENT_URL ||
      process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PAYMENT_URL ||
      DEFAULT_REPORT_PAYMENT_PATH,
    siteUrl
  );
  const reportPrice = formatInr(
    process.env.ASSESSMENT_REPORT_PRICE_INR ||
      process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PRICE_INR ||
      DEFAULT_REPORT_PRICE_INR
  );

  const pdf = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await pdf.embedFont(StandardFonts.Helvetica),
    bold: await pdf.embedFont(StandardFonts.HelveticaBold),
    italic: await pdf.embedFont(StandardFonts.HelveticaOblique),
  };
  const images = await loadImages(pdf, track, country, primaryProgram?.name);

  const cover = pdf.addPage(A4);
  drawCoverPage(cover, fonts, images, {
    name,
    track,
    country,
    program: primaryProgram?.name,
    tier: result.tier,
    confidence: result.confidence,
    summary: result.summary,
    generatedAt,
    reportPrice,
    reportPaymentUrl,
  });

  let page = pdf.addPage(A4);
  let y = drawHeader(page, fonts, images);
  const usableW = A4[0] - MARGIN_X * 2;
  const ensure = (need: number) => {
    if (y - need < FOOTER_H + 24) {
      page = pdf.addPage(A4);
      y = drawHeader(page, fonts, images);
    }
  };

  page.drawText("Recommended route direction", { x: MARGIN_X, y, size: 18, font: fonts.bold, color: NAVY });
  y -= 26;
  drawCountryBadge(page, fonts, images, country, MARGIN_X, y - 58, usableW, 58);
  y -= 82;
  if (primaryProgram) {
    drawProgramCard(page, fonts, primaryProgram, MARGIN_X, y - 158, usableW, 158, true);
    y -= 182;
  }

  const rest = reportPrograms.slice(1, 6);
  if (rest.length) {
    ensure(150);
    page.drawText("Additional options for advisor review", { x: MARGIN_X, y, size: 14, font: fonts.bold, color: NAVY });
    y -= 22;
    for (const program of rest.slice(0, 5)) {
      const cardH = 122;
      ensure(cardH + 18);
      drawProgramCard(page, fonts, program, MARGIN_X, y - cardH, usableW, cardH);
      y -= cardH + 14;
    }
  }

  ensure(160);
  const panelY = y - 132;
  page.drawRectangle({ x: MARGIN_X, y: panelY, width: usableW, height: 132, color: ICE, borderColor: BORDER, borderWidth: 1 });
  page.drawText("What this preview checked", { x: MARGIN_X + 16, y: panelY + 106, size: 13, font: fonts.bold, color: NAVY });
  const criteria = result.criteria?.slice(0, 6) || [
    "Profile, goal, timeline, budget, and family factors.",
    "Country/program fit against approved site content.",
    "Advisor verification required before final advice.",
  ];
  let cy = panelY + 84;
  for (const item of criteria) {
    drawIcon(page, "shield", MARGIN_X + 18, cy - 4, 12, GREEN);
    cy = drawWrappedText(page, item, MARGIN_X + 38, cy, usableW - 58, fonts, { size: 9.2, color: TEXT, lineHeight: 12, maxLines: 2 });
    cy -= 4;
  }
  y = panelY - 24;

  ensure(150);
  page.drawText("Your submitted inputs", { x: MARGIN_X, y, size: 14, font: fonts.bold, color: NAVY });
  y -= 22;
  const entries = Object.entries(answers).slice(0, 12);
  const colGap = 16;
  const colW = (usableW - colGap) / 2;
  let leftY = y;
  let rightY = y;
  entries.forEach(([key, value], index) => {
    const x = index % 2 === 0 ? MARGIN_X : MARGIN_X + colW + colGap;
    const currentY = index % 2 === 0 ? leftY : rightY;
    page.drawRectangle({ x, y: currentY - 36, width: colW, height: 38, color: WHITE, borderColor: BORDER, borderWidth: 1 });
    page.drawText(labelize(key), { x: x + 10, y: currentY - 12, size: 7.4, font: fonts.bold, color: MUTED });
    drawWrappedText(page, toStr(value), x + 10, currentY - 25, colW - 20, fonts, { size: 9, bold: true, color: NAVY, maxLines: 1 });
    if (index % 2 === 0) leftY -= 46;
    else rightY -= 46;
  });
  y = Math.min(leftY, rightY) - 10;

  ensure(118);
  const nextY = y - 98;
  page.drawRectangle({ x: MARGIN_X, y: nextY, width: usableW, height: 98, color: NAVY, borderColor: GOLD, borderWidth: 1 });
  drawIcon(page, "passport", MARGIN_X + 18, nextY + 33, 34, GOLD);
  page.drawText("Next XIPHIAS action", { x: MARGIN_X + 62, y: nextY + 68, size: 14, font: fonts.bold, color: WHITE });
  drawWrappedText(
    page,
    `Use this preview to confirm the direction, then register for the detailed personal report at ${reportPaymentUrl}. The full report is prepared for advisor review, document planning, risk notes, and XIPHIAS Hub onboarding.`,
    MARGIN_X + 62,
    nextY + 48,
    usableW - 84,
    fonts,
    { size: 9.2, color: rgb(0.87, 0.92, 0.98), lineHeight: 12, maxLines: 4 }
  );
  y = nextY - 24;

  if (result.sources?.length) {
    ensure(110);
    page.drawText("Source-backed references", { x: MARGIN_X, y, size: 12, font: fonts.bold, color: NAVY });
    y -= 18;
    for (const source of result.sources.slice(0, 5)) {
      y = drawWrappedText(page, `${source.label}: ${source.href}`, MARGIN_X, y, usableW, fonts, { size: 8.2, color: MUTED, lineHeight: 11, maxLines: 2 });
      y -= 3;
    }
  }

  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    drawFooter(pages[i], fonts, i + 1, pages.length);
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="XIPHIAS_Assessment_Preview_${track}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
