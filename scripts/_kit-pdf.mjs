// Assemble the rendered A-style page-kit PNGs into one A4 PDF (one designed page per
// PDF page) so the full page-type kit can be reviewed as a flip-through mini-report.
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer";

const order = [1, 2, 3, 4, 5, 6, 7];
const imgs = [];
for (const n of order) {
  const p = `report-design-previews/kitA-${n}.png`;
  if (existsSync(p)) imgs.push(`data:image/png;base64,${(await readFile(p)).toString("base64")}`);
}

const pages = imgs.map((src) => `<section class="pg"><img src="${src}"></section>`).join("");
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;}
  @page{ size:A4; margin:0; }
  .pg{ width:210mm; height:297mm; overflow:hidden; page-break-after:always; }
  .pg img{ width:210mm; height:297mm; object-fit:cover; display:block; }
</style></head><body>${pages}</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await writeFile("report-samples/PAGE-KIT-A.pdf", pdf);
  console.log("wrote report-samples/PAGE-KIT-A.pdf", (pdf.length / 1048576).toFixed(2), "MB,", imgs.length, "pages");
} finally {
  await browser.close();
}
