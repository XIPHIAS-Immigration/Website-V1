// Combine the rendered design-direction previews into ONE easy-to-open PDF, one
// landscape page per direction (cover + content side by side, clearly labelled).
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer";

const DIRS = [
  { key: "dirA", name: "A — Editorial Luxury", note: "Warm ivory · serif · image strip + bottom quote" },
  { key: "dirB", name: "B — Modern Consulting", note: "Navy/white · route-fit dial · meta column + bottom insight band" },
  { key: "dirC", name: "C — Immersive Editorial", note: "Full-bleed photography · bold cinematic cover" },
  { key: "dirD", name: "D — Dossier with Sidebar", note: "Navy full-height sidebar + ivory content · contents list" },
];

const b64 = async (p) => (existsSync(p) ? `data:image/png;base64,${(await readFile(p)).toString("base64")}` : "");

const pages = [];
for (const d of DIRS) {
  const cover = await b64(`report-design-previews/${d.key}-1.png`);
  const content = await b64(`report-design-previews/${d.key}-2.png`);
  if (!cover) continue;
  pages.push(`
  <section class="sheet">
    <div class="hd"><div class="nm">${d.name}</div><div class="nt">${d.note}</div></div>
    <div class="imgs">
      <figure><img src="${cover}"><figcaption>Cover</figcaption></figure>
      <figure><img src="${content}"><figcaption>Content page (the one that used to look empty)</figcaption></figure>
    </div>
  </section>`);
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;}
  @page{ size:A4 landscape; margin:0; }
  body{ font-family:"Segoe UI",Arial,sans-serif; }
  .sheet{ width:297mm; height:210mm; padding:10mm 12mm; page-break-after:always; background:#fff; display:flex; flex-direction:column; }
  .hd{ border-bottom:2px solid #c2992f; padding-bottom:4mm; margin-bottom:6mm; }
  .nm{ font-size:20pt; font-weight:800; color:#0a1f44; }
  .nt{ font-size:10.5pt; color:#5b6678; margin-top:1.5mm; }
  .imgs{ flex:1; display:flex; gap:10mm; align-items:flex-start; justify-content:center; }
  figure{ display:flex; flex-direction:column; align-items:center; gap:3mm; }
  figure img{ height:165mm; width:auto; box-shadow:0 2mm 8mm rgba(0,0,0,.18); border:.2mm solid #e4ddd0; }
  figcaption{ font-size:9pt; color:#5b6678; letter-spacing:.04em; }
</style></head><body>${pages.join("")}</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load", timeout: 120000 });
  const pdf = await page.pdf({ format: "A4", landscape: true, printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await writeFile("report-samples/DESIGN-OPTIONS.pdf", pdf);
  console.log("wrote report-samples/DESIGN-OPTIONS.pdf", (pdf.length / 1048576).toFixed(2), "MB,", pages.length, "directions");
} finally {
  await browser.close();
}
