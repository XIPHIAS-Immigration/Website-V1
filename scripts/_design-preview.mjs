// Design-exploration harness (NOT used in production). Renders a self-contained HTML
// mock — with {{PLACEHOLDER}} image tokens swapped for real base64 data URIs — into one
// high-resolution PNG per `section.page`, so report design directions can be previewed
// without touching the live report pipeline.
//
// Usage: node scripts/_design-preview.mjs <input.html> <out-basename>
//   -> writes report-design-previews/<out-basename>-1.png, -2.png, ...
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import puppeteer from "puppeteer";

const inFile = process.argv[2];
const outBase = process.argv[3] || "preview";
const OUT_DIR = "report-design-previews";

async function dataUri(rel, { maxPx = 2400, quality = 84, png = false } = {}) {
  const p = path.join(process.cwd(), rel);
  if (!existsSync(p)) return "";
  try {
    if (png) {
      const out = await sharp(p).resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).png().toBuffer();
      return `data:image/png;base64,${out.toString("base64")}`;
    }
    const meta = await sharp(p).metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    const t = longEdge > 0 ? Math.min(maxPx, longEdge) : maxPx;
    const out = await sharp(p).rotate().resize({ width: t, height: t, fit: "inside", withoutEnlargement: false }).sharpen({ sigma: 0.6 }).jpeg({ quality, mozjpeg: true }).toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return "";
  }
}

const firstExisting = async (rels, opts) => {
  for (const r of rels) {
    const u = await dataUri(r, opts);
    if (u) return u;
  }
  return "";
};

const tokens = {
  LOGO_WHITE: await firstExisting(["public/images/logo/xiphias-immigration-white.png", "public/images/logo/xiphias-immigration.png"], { png: true }),
  LOGO_DARK: await firstExisting(["public/images/logo/xiphias-immigration.png", "public/images/logo/xiphias-immigration-white.png"], { png: true }),
  PORTRAIT: await firstExisting(["public/images/report-assets/_cover/cover.jpeg", "public/images/report-assets/_cover/cover.jpg", "public/images/avtar/varun-singh-md-xiphias.jpg"], { minPx: 1800 }),
  IMG0: await firstExisting(["public/images/report-assets/usa/cover.jpg"]),
  IMG1: await firstExisting(["public/images/skilled/usa/eb2-niw.webp", "public/images/skilled/usa/eb1a.webp"]),
  IMG2: await firstExisting(["public/images/skilled/usa/eb1a.webp", "public/images/skilled/usa/eb1c.webp"]),
};

let html = await readFile(inFile, "utf8");
for (const [k, v] of Object.entries(tokens)) html = html.replaceAll(`{{${k}}}`, v);

await mkdir(OUT_DIR, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.setViewport({ width: 820, height: 1160, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  const handles = await page.$$("section.page");
  let i = 0;
  for (const h of handles) {
    i++;
    const out = path.join(OUT_DIR, `${outBase}-${i}.png`);
    await h.screenshot({ type: "png", path: out });
    console.log("wrote", out);
  }
  if (!handles.length) console.log("WARNING: no section.page elements found");
} finally {
  await browser.close();
}
