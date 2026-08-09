import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { REPORT_CSS } from "./theme";

function browserExecutablePath(): string | undefined {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  const candidates = [
    configured,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter((value): value is string => Boolean(value));
  return candidates.find((candidate) => existsSync(candidate));
}

let brandFontCss: string | null = null;
function embeddedBrandFontCss(): string {
  if (brandFontCss != null) return brandFontCss;
  const faces: string[] = [];
  for (const family of ["Inter", "Sora"] as const) {
    for (const weight of [400, 600, 700, 800]) {
      const file = `${family.toLowerCase()}-latin-${weight}-normal.woff2`;
      try {
        const data = readFileSync(path.join(process.cwd(), "public", "fonts", "reports", file)).toString("base64");
        faces.push(`@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${data}) format("woff2");}`);
      } catch {
        // The system-font fallback remains available if deployment omitted a font asset.
      }
    }
  }
  brandFontCss = faces.join("");
  return brandFontCss;
}

function wrapReportHtml(title: string, bodyHtml: string, embedBrandFonts: boolean): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>${embedBrandFonts ? embeddedBrandFontCss() : ""}${REPORT_CSS}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

// Debug-only: when set (by the report-preview endpoint), renderReportPdf returns a PNG
// screenshot of the Nth `.page` instead of the full PDF, so the design can be reviewed
// visually. Reset to null after each preview request.
let PNG_PAGE_INDEX: number | null = null;
export function setRenderPngPage(index: number | null): void {
  PNG_PAGE_INDEX = index;
}
export function getRenderPngPage(): number | null {
  return PNG_PAGE_INDEX;
}

// Debug-only: when true, renderReportPdf returns a JSON Buffer listing each
// `section.page` element's rendered height in px (and the A4 reference height) so
// overflowing pages — which spill onto half-empty printed pages — can be found.
let PROBE_HEIGHTS = false;
export function setRenderProbe(on: boolean): void {
  PROBE_HEIGHTS = on;
}

// Debug-only: device scale factor for PNG previews. A value >1 renders the page at higher
// pixel density so a preview screenshot reflects how sharp the embedded images actually
// are in print (a 1× preview hides upscaling blur).
let PNG_SCALE = 2;
export function setRenderPngScale(scale: number): void {
  PNG_SCALE = Math.max(1, Math.min(4, scale));
}

/**
 * Render a full HTML document (a sequence of `.page` sections) to an A4 PDF Buffer
 * using headless Chromium. Shared by every report template.
 */
export async function renderReportPdf(opts: { title: string; bodyHtml: string; embedBrandFonts?: boolean }): Promise<Buffer> {
  const html = wrapReportHtml(opts.title, opts.bodyHtml, Boolean(opts.embedBrandFonts));
  const pngPage = PNG_PAGE_INDEX;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: browserExecutablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    // Reports embed several high-resolution images as inline data URIs, so decode + layout
    // can take well over Puppeteer's default 30s on a busy server (the synchronous webhook
    // render must not fail). Give it generous headroom.
    page.setDefaultTimeout(120000);
    await page.setViewport({ width: 820, height: 1160, deviceScaleFactor: pngPage != null ? PNG_SCALE : 1 });
    // Images are inline data URIs (no network), so "load" settles as soon as the document
    // and its embedded images are parsed — more reliable than networkidle0 here.
    await page.setContent(html, { waitUntil: "load", timeout: 120000 });

    if (PROBE_HEIGHTS) {
      const data = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll("section.page"));
        const mm = (document.querySelector("section.page") as HTMLElement | null)?.offsetWidth ?? 0;
        return {
          count: els.length,
          a4Width: mm,
          heights: els.map((el, i) => ({
            i,
            h: Math.round((el as HTMLElement).getBoundingClientRect().height),
            scrollH: Math.round((el as HTMLElement).scrollHeight),
            cls: el.className,
            title: (el.querySelector("h1,h2,.divider__title")?.textContent ?? "").trim(),
            footer: (el.querySelector(".runfoot")?.textContent ?? "").trim(),
          })),
        };
      });
      return Buffer.from(JSON.stringify(data, null, 2));
    }

    if (pngPage != null) {
      const handles = await page.$$("section.page");
      const target = handles[Math.max(0, Math.min(pngPage, handles.length - 1))];
      const shot = target ? await target.screenshot({ type: "png" }) : await page.screenshot({ type: "png", fullPage: false });
      return Buffer.from(shot);
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
