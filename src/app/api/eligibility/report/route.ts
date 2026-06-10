import { NextRequest, NextResponse } from "next/server";
import type { Track, AnswerMap, Program } from "@/lib/eligibility/types";
import { getEligibilityAdvisory } from "@/lib/platform/eligibility-advisor";
import { getPlatformRepository } from "@/lib/platform/repository";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const runtime = "nodejs";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "XIPHIAS Immigration";
const REPORT_TITLE = "Assessment Preview Report";
const DETAILED_REPORT_TITLE = "Detailed Personal Mobility Report";
const DEFAULT_SITE_URL = "https://www.xiphiasimmigration.com";
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

function drawHeader(page: PDFPage, fonts: Fonts, images: ImageSet, title = REPORT_TITLE) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: HEADER_H, color: WHITE });
  page.drawRectangle({ x: 0, y: height - HEADER_H, width, height: 4, color: GOLD });
  if (images.logo) drawImageContain(page, images.logo, MARGIN_X, height - 48, 118, 28);
  page.drawText(title, {
    x: width - MARGIN_X - fonts.bold.widthOfTextAtSize(title, 12),
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

function extractMoneyHints(text: string) {
  const matches = text.match(/(?:USD|US\$|\$|EUR|€|INR|₹)\s?[\d,.]+(?:\s?(?:k|m|million|lakh|crore))?/gi);
  return matches?.slice(0, 3).join(", ") || "";
}

function indicativeCostBand(track: Track, program: ReportProgram) {
  const hinted = extractMoneyHints(`${program.name} ${program.why}`);
  if (hinted) return `Referenced in content: ${hinted}. Staff must verify official fees and service scope.`;
  if (track === "citizenship") return "Indicative programme capital, due-diligence fees, government fees, and family additions must be confirmed by destination.";
  if (track === "residency") return "Indicative costs vary by investment, real-estate, company, remote-worker, or professional route. Government and third-party fees are separate.";
  if (track === "corporate") return "Costs can include entity setup, licensing, immigration quota, establishment card, work/residence permits, payroll, and compliance.";
  return "Costs can include credential assessment, language testing, government application fees, medicals, PCC, relocation, and representation.";
}

function timelineBand(track: Track, program: ReportProgram) {
  const text = `${program.name} ${program.why}`.toLowerCase();
  const month = text.match(/\b([1-9]|1[0-9]|2[0-4])\s*(?:month|months)\b/);
  if (month) return `Content indicates a possible ${month[1]} month planning window, subject to official processing.`;
  if (track === "corporate") return "Typical planning: 2-8 weeks for setup readiness, then visa/residence processing based on jurisdiction.";
  if (track === "residency") return "Typical planning: 1-6 months for many residence pathways; investment and government stages can extend this.";
  if (track === "citizenship") return "Typical planning: 4-12+ months, depending on due diligence, investment route, and government queue.";
  return "Typical planning: 2-12 months, depending on job offer, credential assessment, language test, and invitation cycles.";
}

function addDetailedPage(
  pdf: PDFDocument,
  fonts: Fonts,
  images: ImageSet,
  args: {
    kicker: string;
    title: string;
    intro?: string;
    items: Array<{ title: string; body: string; bullets?: string[]; accent?: RGB }>;
  },
) {
  const page = pdf.addPage(A4);
  let y = drawHeader(page, fonts, images, DETAILED_REPORT_TITLE);
  const usableW = A4[0] - MARGIN_X * 2;
  page.drawText(args.kicker.toUpperCase(), { x: MARGIN_X, y, size: 8, font: fonts.bold, color: GOLD });
  y -= 24;
  y = drawWrappedText(page, args.title, MARGIN_X, y, usableW, fonts, {
    size: 19,
    bold: true,
    color: NAVY,
    lineHeight: 22,
    maxLines: 2,
  });
  if (args.intro) {
    y -= 8;
    y = drawWrappedText(page, args.intro, MARGIN_X, y, usableW, fonts, {
      size: 10,
      color: MUTED,
      lineHeight: 13,
      maxLines: 5,
    });
  }
  y -= 16;

  for (const item of args.items) {
    const cardH = item.bullets?.length ? 120 : 92;
    if (y - cardH < FOOTER_H + 18) break;
    page.drawRectangle({ x: MARGIN_X, y: y - cardH, width: usableW, height: cardH, color: ICE, borderColor: BORDER, borderWidth: 1 });
    page.drawRectangle({ x: MARGIN_X, y: y - cardH, width: 4, height: cardH, color: item.accent || BLUE });
    drawWrappedText(page, item.title, MARGIN_X + 18, y - 18, usableW - 36, fonts, {
      size: 12,
      bold: true,
      color: NAVY,
      lineHeight: 14,
      maxLines: 2,
    });
    let innerY = y - 46;
    innerY = drawWrappedText(page, item.body, MARGIN_X + 18, innerY, usableW - 36, fonts, {
      size: 9,
      color: TEXT,
      lineHeight: 12,
      maxLines: item.bullets?.length ? 3 : 4,
    });
    for (const bullet of item.bullets?.slice(0, 4) || []) {
      if (innerY < y - cardH + 18) break;
      page.drawCircle({ x: MARGIN_X + 23, y: innerY - 1, size: 2, color: GOLD });
      innerY = drawWrappedText(page, bullet, MARGIN_X + 34, innerY + 2, usableW - 54, fonts, {
        size: 8.4,
        color: MUTED,
        lineHeight: 10,
        maxLines: 1,
      });
    }
    y -= cardH + 12;
  }
}

function addProgramDeepDivePages(
  pdf: PDFDocument,
  fonts: Fonts,
  images: ImageSet,
  track: Track,
  programs: ReportProgram[],
) {
  programs.slice(0, 6).forEach((program, index) => {
    addDetailedPage(pdf, fonts, images, {
      kicker: `Programme deep dive ${index + 1}`,
      title: program.name,
      intro: `${program.country || "Global route"} - ${program.sourceLabel || "XIPHIAS route logic"}`,
      items: [
        {
          title: "Why this appears in your shortlist",
          body: cleanCopy(program.why) || "This route matched your submitted profile and the approved XIPHIAS content index.",
          bullets: program.fitNotes,
          accent: index === 0 ? GOLD : BLUE,
        },
        {
          title: "Indicative cost and fee planning",
          body: indicativeCostBand(track, program),
          bullets: [
            "Government fees, due-diligence fees, translations, medicals, and third-party costs are verified before filing.",
            "XIPHIAS service scope and country product fee must be confirmed in the advisor stage.",
            "Investment routes require source-of-funds and transaction timing review.",
          ],
          accent: GREEN,
        },
        {
          title: "Timeline and decision points",
          body: timelineBand(track, program),
          bullets: [
            "Profile confirmation comes first, then document collection and route validation.",
            "Filing starts only after document, risk, and official rule checks are complete.",
            "Government processing timelines can change without notice.",
          ],
          accent: AMBER,
        },
      ],
    });
  });
}

function addDetailedReportPages(
  pdf: PDFDocument,
  fonts: Fonts,
  images: ImageSet,
  args: {
    name: string;
    track: Track;
    country?: string;
    answers: AnswerMap;
    result: ReturnType<typeof getEligibilityAdvisory>;
    programs: ReportProgram[];
    reportPrice: string;
    reportPaymentUrl: string;
  },
) {
  const topProgram = args.programs[0];
  addDetailedPage(pdf, fonts, images, {
    kicker: "Premium report",
    title: DETAILED_REPORT_TITLE,
    intro:
      "This expanded report is structured for advisor review: route fit, programme comparison, cost planning, document readiness, risk intelligence, and X-Hub execution.",
    items: [
      {
        title: "Client objective",
        body: `${args.name || "Client"} is being assessed for ${trackLabel(args.track)} with focus on ${args.country || "advisor shortlist"}.`,
        bullets: [
          `Primary match: ${topProgram?.name || "Advisor review required"}`,
          `Assessment tier: ${args.result.tier}`,
          `Confidence score: ${typeof args.result.confidence === "number" ? `${args.result.confidence}/100` : "Advisor review"}`,
        ],
        accent: GOLD,
      },
      {
        title: "How XIPHIAS should use this report",
        body:
          "The report is not a legal opinion or guarantee. It is a structured working file for sales, advisor review, document collection, due diligence, and client onboarding.",
        bullets: [
          "Use this as the client-facing premium deliverable after registration.",
          "Staff should verify rules, fees, timelines, and official channels before filing.",
          "CRM integration can later attach this report to the single client profile.",
        ],
      },
    ],
  });

  addDetailedPage(pdf, fonts, images, {
    kicker: "Route matrix",
    title: "Programme comparison and route ranking",
    intro: "Routes are ranked using the submitted answers, approved XIPHIAS content, and deterministic fit rules.",
    items: args.programs.slice(0, 5).map((program) => ({
      title: `${program.name}${typeof program.score === "number" ? ` - ${program.score}/100` : ""}`,
      body: `${program.country || "Global route"}: ${cleanCopy(program.why) || "Matched against XIPHIAS advisory rules."}`,
      bullets: [
        indicativeCostBand(args.track, program),
        timelineBand(args.track, program),
        program.href ? `Source page: ${program.href}` : "Advisor validation required.",
      ],
      accent: program === topProgram ? GOLD : BLUE,
    })),
  });

  addProgramDeepDivePages(pdf, fonts, images, args.track, args.programs);

  addDetailedPage(pdf, fonts, images, {
    kicker: "Document plan",
    title: "Document readiness and upload checklist",
    intro: "The X-Hub document vault should collect evidence by category and flag gaps before advisor filing review.",
    items: [
      {
        title: "Identity and civil documents",
        body: "Passport, birth/marriage documents, civil status records, police clearance planning, and translated/legalised copies where applicable.",
        bullets: ["Check expiry dates and name consistency.", "Prepare spouse/children records where family inclusion is requested.", "Keep scanned originals and certified copies separated."],
        accent: BLUE,
      },
      {
        title: "Financial and source-of-funds evidence",
        body: "Bank statements, asset records, sale deeds, tax returns, company documents, salary/dividend proof, and investment trail documents.",
        bullets: ["High-value routes require enhanced source-of-funds review.", "Mismatch flags should be resolved before filing.", "PEP/sanctions checks remain staff-verified."],
        accent: GREEN,
      },
      {
        title: "Programme-specific evidence",
        body: "Business plans, employment letters, education credentials, language test results, investment confirmations, or entity setup records depending on the route.",
        bullets: ["Use route-specific checklists inside X-Hub.", "Document status should move from requested to uploaded, review, accepted, or rework.", "Advisor notes should be kept with the case."],
        accent: GOLD,
      },
    ],
  });

  addDetailedPage(pdf, fonts, images, {
    kicker: "Risk intelligence",
    title: "Due diligence and risk review layer",
    intro: "The v1 risk layer is deterministic and staff-reviewed. It avoids black-box decisions and keeps every flag explainable.",
    items: [
      {
        title: "Profile mismatch checks",
        body: "Compare submitted name, nationality, date of birth, family details, country focus, funds, and document extracts for mismatches.",
        bullets: ["Name mismatch", "Expired passport", "Missing source-of-funds record", "Family member evidence gap"],
        accent: AMBER,
      },
      {
        title: "Compliance adapter",
        body: "The portal is prepared for PEP/sanctions vendor integration. Until live vendor credentials are configured, outputs are marked for staff verification.",
        bullets: ["No automatic approval is issued.", "High-risk or blocked flags force manual review.", "Every check is stored as an auditable record."],
        accent: GREEN,
      },
      {
        title: "Decision controls",
        body: "Official programme rules, fees, timelines, and eligibility details must be checked against current government guidance before submission.",
        bullets: ["No auto-publish", "No auto-filing", "No legal guarantee", "Advisor confirmation required"],
        accent: BLUE,
      },
    ],
  });

  addDetailedPage(pdf, fonts, images, {
    kicker: "Execution plan",
    title: "X-Hub onboarding and IMT workflow",
    intro: "After registration, the client can use X-Hub as a standalone workspace before CRM integration is connected.",
    items: [
      {
        title: "Client profile",
        body: "Captures contact details, nationality, residence, family, budget, timeline, source-of-funds notes, target country, and programme interest.",
        bullets: ["Every profile update is logged.", "Profile fields can later map to CRM.", "Client can sign in directly during demo/no-fee mode."],
        accent: BLUE,
      },
      {
        title: "Investment + Migration Tracker",
        body: "Tracks intake, documents, due diligence, strategy, filing, government review, decision, and post-approval stages.",
        bullets: ["Client sees progress and next actions.", "Staff can update stages.", "Later CRM sync can become the source of truth."],
        accent: GOLD,
      },
      {
        title: "Premium report fulfilment",
        body: `Registration CTA uses ${args.reportPaymentUrl}. Price shown: ${args.reportPrice}. Topmate owns payment; XIPHIAS owns lead, report, portal, and workflow records.`,
        bullets: ["Provision route can create credentials after payment webhook.", "Detailed PDF can attach when assessment answers are included.", "Advisor should review before final advice."],
        accent: GREEN,
      },
    ],
  });

  addDetailedPage(pdf, fonts, images, {
    kicker: "Submitted answers",
    title: "Client input record",
    intro: "These answers were used for the route match. They should be confirmed by staff before relying on the recommendation.",
    items: Object.entries(args.answers)
      .slice(0, 12)
      .map(([key, value]) => ({
        title: labelize(key),
        body: toStr(value),
        bullets: ["Stored as part of the assessment trail.", "Can be mapped into CRM/client profile fields later."],
        accent: BLUE,
      })),
  });

  addDetailedPage(pdf, fonts, images, {
    kicker: "Advisor questions",
    title: "Questions to resolve before final recommendation",
    intro: "These are the practical discussion points that make the report feel personal and help convert the client into the correct product path.",
    items: [
      {
        title: "Goal and destination",
        body: "Confirm whether the client is optimizing for passport strength, residence, business expansion, tax/residency planning, family relocation, education, or speed.",
        bullets: ["Main applicant objective", "Spouse/children inclusion", "Long-term citizenship intent", "Physical presence tolerance"],
        accent: GOLD,
      },
      {
        title: "Capital and risk appetite",
        body: "Confirm liquid funds, investable capital, source-of-funds evidence, country risk tolerance, and expected exit horizon.",
        bullets: ["Budget range", "Investment route preference", "Government donation vs real estate/funds/company", "Timeline sensitivity"],
        accent: GREEN,
      },
      {
        title: "Execution readiness",
        body: "Confirm document availability, travel history, refusals, background flags, language/education records, and business ownership evidence.",
        bullets: ["Passport validity", "Police clearance readiness", "Tax records", "Company ownership records"],
        accent: BLUE,
      },
    ],
  });

  if (args.result.sources?.length) {
    addDetailedPage(pdf, fonts, images, {
      kicker: "Source-backed references",
      title: "Website content used in this assessment",
      intro: "These are source pages from the current XIPHIAS site used to support the route direction.",
      items: args.result.sources.slice(0, 8).map((source) => ({
        title: source.label,
        body: source.href,
        bullets: ["Staff should verify latest government rule, fee, and timing before presenting final advice."],
        accent: BLUE,
      })),
    });
  }
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
    `Registration starts at ${args.reportPrice}. Full report includes route comparison, document checklist, timeline, risk flags, advisor notes, and X-Hub onboarding.`,
    MARGIN_X + 56,
    unlockY + 34,
    410,
    fonts,
    { size: 8.8, color: rgb(0.86, 0.91, 0.98), lineHeight: 11, maxLines: 3 }
  );
  page.drawText(args.reportPaymentUrl, { x: MARGIN_X + 56, y: unlockY + 12, size: 7.8, font: fonts.bold, color: GOLD });
}

export async function POST(req: NextRequest) {
  const { name, email, phone, track, answers, reportType, full } = (await req.json()) as {
    name: string;
    email?: string;
    phone?: string;
    track: Track;
    answers: AnswerMap;
    reportType?: "preview" | "detailed";
    full?: boolean;
  };

  if (!name || !track || !answers) {
    return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
  }

  const detailed = reportType === "detailed" || full === true;
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
  const reportReference = `XIP-${Date.now().toString(36).toUpperCase()}`;
  const siteUrl = getSiteUrl();
  const reportPaymentUrl = absoluteUrl(
    process.env.ASSESSMENT_REPORT_PAYMENT_URL ||
      process.env.NEXT_PUBLIC_ASSESSMENT_REPORT_PAYMENT_URL ||
      TOPMATE_REGISTRATION_URL,
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

  ensure(92);
  const contactY = y - 76;
  page.drawRectangle({ x: MARGIN_X, y: contactY, width: usableW, height: 76, color: ICE, borderColor: BORDER, borderWidth: 1 });
  page.drawText("Client contact captured", { x: MARGIN_X + 16, y: contactY + 52, size: 12, font: fonts.bold, color: NAVY });
  const contactItems = [
    ["Name", name],
    ["Email", email || "Not provided"],
    ["Phone", phone || "Not provided"],
    ["Report ref", reportReference],
  ];
  const contactColW = (usableW - 32) / 4;
  contactItems.forEach(([label, value], index) => {
    const x = MARGIN_X + 16 + index * contactColW;
    page.drawText(label, { x, y: contactY + 31, size: 7.2, font: fonts.bold, color: MUTED });
    drawWrappedText(page, value, x, contactY + 18, contactColW - 10, fonts, { size: 8.4, bold: true, color: TEXT, maxLines: 1 });
  });
  y = contactY - 24;

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
    `Use this preview to confirm the direction, then register for the detailed personal report at ${reportPaymentUrl}. The full report is prepared for advisor review, document planning, risk notes, and X-Hub onboarding.`,
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

  if (detailed) {
    addDetailedReportPages(pdf, fonts, images, {
      name,
      track,
      country,
      answers,
      result,
      programs: reportPrograms,
      reportPrice,
      reportPaymentUrl,
    });
  }

  try {
    const repo = getPlatformRepository();
    const lead = repo.createLead({
      source: detailed ? "registration" : "eligibility",
      status: detailed ? "qualified" : "new",
      name,
      email,
      phone,
      track,
      country,
      program: primaryProgram?.name,
      message: `${detailed ? "Detailed" : "Preview"} assessment PDF generated. ${result.tier}: ${result.summary}`,
      page: req.headers.get("referer") || "/eligibility",
      referrer: req.headers.get("referer") || undefined,
      consent: true,
      score: result.confidence,
      tags: [
        detailed ? "detailed-report-generated" : "preview-report-generated",
        `report:${reportReference}`,
        result.handoffRequired ? "staff-review" : "auto-triaged",
      ],
    });
    repo.createConversation({
      leadId: lead.id,
      channel: "portal",
      direction: "inbound",
      from: name,
      to: "XIPHIAS",
      body: `${detailed ? "Detailed" : "Preview"} assessment PDF generated for ${track}. Report ref: ${reportReference}. Contact: ${email || "no email"} / ${phone || "no phone"}.`,
    });
  } catch (error) {
    console.warn("[eligibility:report] Could not record report generation.", error);
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
      "Content-Disposition": `attachment; filename="XIPHIAS_Assessment_${detailed ? "Detailed" : "Preview"}_${track}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
