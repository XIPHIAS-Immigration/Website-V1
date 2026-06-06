import type { Result, Track, AnswerMap } from "@/lib/eligibility/types";

const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "XIPHIAS Immigration";
const COMPANY_WEBSITE = process.env.NEXT_PUBLIC_PDF_WEBSITE || "www.xiphiasimmigration.com";
const COMPANY_EMAIL = process.env.NEXT_PUBLIC_PDF_EMAIL || "immigration@xiphias.in";
const COMPANY_PHONE = process.env.NEXT_PUBLIC_PDF_PHONE || "+91 9021335577";
const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_PDF_ADDRESS ||
  "Aurbis Prime No. 1, Koramangala, Bengaluru, India 560034";

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const yn = (v: unknown) =>
  v === true || v === "yes" ? "Yes" : v === false || v === "no" ? "No" : String(v ?? "-");

const labelize = (k: string) =>
  k.replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());

export function renderEligibilityPDFHtml({
  name,
  track,
  answers,
  result,
}: {
  name: string;
  track: Track;
  answers: AnswerMap;
  result: Result;
}) {
  const entries = Object.entries(answers || {});
  const half = Math.ceil(entries.length / 2);
  const left = entries.slice(0, half);
  const right = entries.slice(half);
  const programs = Array.isArray(result?.programs) ? result.programs : [];

  return /* html */ `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>${esc(COMPANY_NAME)} – Eligibility Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
*{box-sizing:border-box}html,body{margin:0;padding:0}
body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial,"Noto Sans";
  color:#0b0b0c;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;margin:0 auto;padding:22mm 18mm 18mm;position:relative}
header{position:absolute;left:0;right:0;top:0;height:48mm;padding:16mm 18mm 8mm;background:#f4f7ff}
.brand{font-weight:600;font-size:12px;color:#4b5563}
.report-title{margin:6px 0 0;font-size:22px;font-weight:800;letter-spacing:.2px}
.gold-line{position:absolute;left:18mm;right:18mm;height:2px;bottom:0;background:linear-gradient(90deg,#d6b229,#f1d469)}
footer{position:absolute;left:0;right:0;bottom:0;height:22mm;padding:6mm 18mm;border-top:1px solid #e5e7eb;color:#4b5563;font-size:10px;display:flex;align-items:center;justify-content:space-between}
.contact span+span{margin-left:8px}.page-num{opacity:.9}
.content{margin-top:48mm}
h2.section{font-size:14px;font-weight:800;margin:18px 0 8px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#fff}
.summary{display:flex;gap:8px;align-items:center}
.tier{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:11px;padding:3px 8px;border-radius:9999px;border:1px solid #e5e7eb}
.tier--Eligible{background:#e8f8ed;color:#065f46;border-color:#a7f3d0}
.tier--Borderline{background:#fff6db;color:#92400e;border-color:#fde68a}
.tier--Not\\ Yet\\ Eligible{background:#fee2e2;color:#991b1b;border-color:#fecaca}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.program{border:1px solid #e5e7eb;border-radius:10px;padding:12px;background:#fff}
.program h4{font-size:12px;margin:0}.program p{margin:6px 0 0;font-size:11px;color:#374151}
.kv{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.kv-col{display:grid;grid-template-columns:92px 1fr;row-gap:6px}
.kv-label{font-size:11px;font-weight:700;color:#111}
.kv-value{font-size:11px;color:#111}
.meta{margin:8px 0 14px;font-size:11px;color:#374151}
.small{font-size:10px}
</style>
</head>
<body>
<section class="page">
<header>
  <div class="brand">${esc(COMPANY_NAME)}</div>
  <div class="report-title">Eligibility Report</div>
  <div class="gold-line"></div>
</header>

<div class="content">
  <div class="meta">
    <div><b>Name:</b> ${esc(name || "-")}</div>
    <div><b>Track:</b> ${esc(String(track))}</div>
    <div><b>Generated:</b> ${esc(new Date().toLocaleString())}</div>
  </div>

  <h2 class="section">Summary</h2>
  <div class="card">
    <div class="summary">
      <span class="tier tier--${esc(result.tier)}">Tier: ${esc(result.tier)}</span>
      <span>${esc(result.summary)}</span>
    </div>
  </div>

  ${programs.length
      ? `
  <h2 class="section">Suggested Programs</h2>
  <div class="grid-2">
    ${programs
        .slice(0, 6)
        .map(
          (p) => `
      <article class="program">
        <h4>${esc(p.name)}</h4>
        ${p.why ? `<p>${esc(p.why)}</p>` : ""}
      </article>`,
        )
        .join("")}
  </div>`
      : ""
    }

  <h2 class="section">Your Inputs</h2>
  <div class="card kv">
    <div class="kv-col">
      ${left
      .map(
        ([k, v]) =>
          `<div class="kv-label">${esc(labelize(k))}:</div><div class="kv-value">${esc(yn(v))}</div>`,
      )
      .join("")}
    </div>
    <div class="kv-col">
      ${right
      .map(
        ([k, v]) =>
          `<div class="kv-label">${esc(labelize(k))}:</div><div class="kv-value">${esc(yn(v))}</div>`,
      )
      .join("")}
    </div>
  </div>

  <h2 class="section">Next Steps</h2>
  <div class="card small">
    Book a free consultation to review your profile, documents and timelines.
    Contact <b>${esc(COMPANY_EMAIL)}</b> or visit <b>${esc(COMPANY_WEBSITE)}</b>.
  </div>
</div>

<footer>
  <div class="contact">
    <span>${esc(COMPANY_ADDRESS)}</span><span>·</span>
    <span>${esc(COMPANY_EMAIL)}</span><span>·</span>
    <span>${esc(COMPANY_PHONE)}</span><span>·</span>
    <span>${esc(COMPANY_WEBSITE)}</span>
  </div>
  <div class="page-num">Page 1</div>
</footer>
</section>
</body>
</html>`;
}
