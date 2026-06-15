import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import puppeteer from "puppeteer";

const root = process.cwd();

const DEFAULT_CLIENT = {
  name: "Arjun Mehta",
  reportRef: "XIP-US-NIW-2026-001",
  date: "14 June 2026",
  country: "United States",
  countryCode: "USA",
  route: "EB-2 NIW - National Interest Waiver",
  objective: "U.S. permanent residency through a self-petition route",
  profile: "Senior Software Engineer / Product Builder",
  location: "India, with global work exposure",
  family: "Spouse and one dependent to be reviewed",
  timeline: "12-18 months planning window",
  budget: "Government and professional fees; no fixed investment route",
  advisor: "XIPHIAS Immigration Advisory Desk",
};

const DEFAULT_ASSETS = {
  logo: "public/xiphias-immigration.png",
  hero: "public/images/articles/xiphias-immigration.jpg",
  routeHero: "public/images/skilled/usa/eb2-niw.webp",
  usa: "public/images/skilled/usa/usa.webp",
  greenCard: "public/images/articles/american-green-card.webp",
  usWork: "public/images/blogs/us-work-permit-indians.png",
  passport: "public/images/blogs/passport.png",
  investment: "public/images/blogs/investment-immigration-business.png",
  advisor: "public/images/avtar/varun-singh-md-xiphias.jpg",
  flag: "public/images/flags/USA.png",
  eb1: "public/images/articles/eb-1-visa-rules.webp",
};

const DEFAULT_SCORE_CARDS = [
  ["Route fit", 82, "Promising"],
  ["Evidence strength", 68, "Build proof"],
  ["Document readiness", 56, "Incomplete"],
  ["Risk clarity", 72, "Review needed"],
  ["Family readiness", 64, "Confirm stage"],
];

const DEFAULT_EVIDENCE_ROWS = [
  ["Technology profile", "Strong", "Software/product background can support a national-interest argument if impact evidence is specific."],
  ["Advanced degree or exceptional ability", "Review", "Degree, equivalency, experience and exceptional-ability evidence must be checked."],
  ["National importance", "Needs framing", "The proposed U.S. work must show benefit beyond one employer or personal career growth."],
  ["Independent recognition", "Gap", "Priority improvement area: awards, press, expert letters, citations, patents, publications or public product impact."],
  ["Family planning", "Review", "Spouse and child strategy depends on immigrant stage, documents and timing."],
];

const DEFAULT_IMPROVEMENT_ROWS = [
  ["First 7 days", "Prepare immigration-format CV, passport, degree records, role proof and a project impact list."],
  ["Next 30 days", "Build an EB-2 NIW evidence matrix with quantified work impact, expert letter targets and proposed endeavor notes."],
  ["Before filing", "Advisor validates national-interest narrative, document consistency, family strategy and route alternatives."],
  ["Service conversion", "Move into the evidence matrix and documentation package once the advisor confirms route strength."],
];

const DEFAULT_SERVICE_PRODUCTS = [
  ["EB-2 NIW Strategy + Evidence Matrix", "INR 35,000", "Advisor-led route validation, NIW prong mapping and evidence gap report."],
  ["US High-Skill Documentation Pack", "INR 75,000 - 1,25,000", "CV direction, exhibit index, recommendation letter briefs and document preparation support."],
  ["EB-2 NIW Filing Coordination", "INR 1,50,000 - 3,00,000", "Case preparation coordination. Attorney, USCIS, courier, translation and third-party fees separate."],
  ["Advisor Strategy Call", "Included after package selection", "Route, risk, document and next-step review with the advisory desk."],
];

const DEFAULT_ALTERNATIVES = [
  ["EB-1A Extraordinary Ability", "Not primary today", "Can become relevant if public recognition, awards, judging, media, patents or citations are stronger."],
  ["O-1A Extraordinary Ability", "Temporary route option", "Useful if a U.S. petitioner and strong achievement evidence are available."],
  ["H-1B Specialty Occupation", "Employer-led option", "Requires qualifying employer strategy and timing review for cap or cap-exempt pathways."],
  ["EB-5 Investor Route", "Investment alternative", "Relevant only if the client chooses capital-led Green Card planning."],
];

let client = DEFAULT_CLIENT;
let assets = DEFAULT_ASSETS;
let scoreCards = DEFAULT_SCORE_CARDS;
let evidenceRows = DEFAULT_EVIDENCE_ROWS;
let improvementRows = DEFAULT_IMPROVEMENT_ROWS;
let serviceProducts = DEFAULT_SERVICE_PRODUCTS;
let alternatives = DEFAULT_ALTERNATIVES;

function clean(value) {
  return String(value ?? "")
    .replace(/â€”|â€“|\u2013|\u2014/g, "-")
    .replace(/â€™|\u2019/g, "'")
    .replace(/â€œ|\u201C/g, '"')
    .replace(/â€\u009d|\u201D/g, '"')
    .replace(/â€¢/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMdx(value) {
  return clean(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`{}[\]|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function esc(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(amount, currency = "USD") {
  if (!amount) return "Advisor review";
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return clean(amount);
  return `${currency} ${numeric.toLocaleString("en-US")}`;
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

function countrySlug(value) {
  const key = slugify(value);
  const aliases = {
    "antigua-and-barbuda": "antigua-barbuda",
    "united-states": "usa",
    "united-states-of-america": "usa",
    "u-s-a": "usa",
    us: "usa",
    "united-arab-emirates": "uae",
    "u-a-e": "uae",
    "united-kingdom": "uk",
    "great-britain": "uk",
    "saint-kitts-and-nevis": "saintkitts",
    "saint-kitts-nevis": "saintkitts",
    "st-kitts-and-nevis": "saintkitts",
    "st-kitts-nevis": "saintkitts",
    "saint-lucia-citizenship": "saint-lucia",
    "sao-tome-and-principe": "saotome",
    "sao-tome-principe": "saotome",
  };
  return aliases[key] || key || "usa";
}

function countrySlugCandidates(value) {
  const primary = countrySlug(value);
  const aliases = {
    "antigua-barbuda": ["antigua"],
    monaco: ["Monaco"],
    saintkitts: ["st-kitts-nevis", "saint-kitts-nevis"],
    "saint-lucia": ["saint-lucia-citizenship"],
    saotome: ["sao-tome-principe", "sao-tome-and-principe"],
    uae: ["dubai", "united-arab-emirates"],
    uk: ["united-kingdom"],
  };
  return [...new Set([primary, ...(aliases[primary] || [])])];
}

function imageCandidates(countrySlugs, folder, fileNames) {
  return countrySlugs.flatMap((slug) =>
    fileNames.flatMap((fileName) =>
      [".webp", ".jpg", ".jpeg", ".png"].map((ext) => `public/images/${folder}/${slug}/${fileName}${ext}`),
    ),
  );
}

function displayCountry(value) {
  const country = clean(value);
  const known = {
    usa: "United States",
    us: "United States",
    "united states": "United States",
    uae: "United Arab Emirates",
    uk: "United Kingdom",
  };
  const key = country.toLowerCase();
  if (known[key]) return known[key];
  return country
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

async function exists(relPath) {
  try {
    await fs.access(path.join(root, relPath));
    return relPath;
  } catch {
    return "";
  }
}

async function firstExisting(candidates) {
  for (const candidate of candidates.filter(Boolean)) {
    const found = await exists(candidate);
    if (found) return found;
  }
  return "";
}

async function firstImageInDirectory(relDir) {
  if (!relDir) return "";
  try {
    const entries = await fs.readdir(path.join(root, relDir), { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile() && /\.(webp|png|jpe?g)$/i.test(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
    return images[0] ? path.join(relDir, images[0]).replace(/\\/g, "/") : "";
  } catch {
    return "";
  }
}

async function firstImageFromDirectories(relDirs) {
  for (const relDir of relDirs.filter(Boolean)) {
    const imagePath = await firstImageInDirectory(relDir);
    if (imagePath) return imagePath;
  }
  return "";
}

async function dataUri(relPath) {
  try {
    const file = path.join(root, relPath);
    const bytes = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    const mime =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".svg"
            ? "image/svg+xml"
            : "image/jpeg";
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return "";
  }
}

async function scanMdxFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await scanMdxFiles(full)));
    else if (entry.isFile() && entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

function hrefToContentPath(href) {
  const cleanHref = clean(href).replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "");
  if (!cleanHref) return "";
  const parts = cleanHref.split("/");
  if (parts.length < 3) return "";
  const [track, country, program] = parts;
  if (!["residency", "citizenship", "corporate", "skilled"].includes(track)) return "";
  return path.join(root, "content", track, country, `${program}.mdx`);
}

function contentPathToHref(filePath) {
  const relative = path.relative(path.join(root, "content"), filePath).replace(/\\/g, "/");
  if (!relative || relative.startsWith("..")) return "";
  return `/${relative.replace(/\.mdx$/i, "")}`;
}

async function findProgramDocPath(input = {}) {
  const directFromHref = hrefToContentPath(input.programHref || input.href || "");
  if (directFromHref) {
    try {
      await fs.access(directFromHref);
      return directFromHref;
    } catch {
      // Continue to scored lookup.
    }
  }

  const track = clean(input.track || input.vertical || "skilled").toLowerCase();
  const targetCountrySlug = countrySlug(input.country || input.targetCountry || "usa");
  const programKey = normalizeKey(input.program || input.route || input.selectedVisa || "");
  const fallback = path.join(root, "content", "skilled", "usa", "eb2-national-interest-waiver.mdx");
  const files = await scanMdxFiles(path.join(root, "content"));
  let best = { file: fallback, score: -1 };

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8").catch(() => "");
    if (!raw) continue;
    const parsed = matter(raw);
    const data = parsed.data || {};
    const fileNorm = normalizeKey(file);
    const countryNorm = normalizeKey(data.country || data.countrySlug || "");
    const titleNorm = normalizeKey(`${data.title || ""} ${data.program || ""} ${data.programSlug || ""}`);
    let score = 0;
    if (fileNorm.includes(normalizeKey(track))) score += 6;
    if (countryNorm.includes(normalizeKey(targetCountrySlug)) || fileNorm.includes(normalizeKey(targetCountrySlug))) score += 14;
    if (programKey && titleNorm.includes(programKey)) score += 18;
    if (programKey && programKey.includes(titleNorm.slice(0, Math.min(12, titleNorm.length)))) score += 4;
    if (!programKey && score > 0) score += 1;
    if (score > best.score) best = { file, score };
  }

  return best.file;
}

async function loadProgramDoc(input = {}) {
  const filePath = await findProgramDocPath(input);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data;
  return {
    filePath,
    data,
    title: clean(data.title || client.route),
    tagline: clean(data.tagline || ""),
    body: stripMdx(parsed.content).slice(0, 900),
    benefits: Array.isArray(data.benefits) ? data.benefits.map(clean) : [],
    requirements: Array.isArray(data.requirements) ? data.requirements.map(clean) : [],
    risks: Array.isArray(data.riskNotes) ? data.riskNotes.map(clean) : [],
    compliance: Array.isArray(data.complianceNotes) ? data.complianceNotes.map(clean) : [],
    prices: Array.isArray(data.prices) ? data.prices : [],
    checklist: Array.isArray(data.documentChecklist) ? data.documentChecklist : [],
    process: Array.isArray(data.processSteps) ? data.processSteps : [],
  };
}

function stat(label, value, note = "") {
  return `<div class="stat"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
}

function bar(label, value, note = "") {
  return `
    <div class="bar-row">
      <div class="bar-head"><strong>${esc(label)}</strong><span>${value}/100</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(6, Math.min(100, value))}%"></div></div>
      ${note ? `<p>${esc(note)}</p>` : ""}
    </div>
  `;
}

function sectionHeader(kicker, title, copy = "") {
  return `
    <header class="section-head">
      <p class="kicker">${esc(kicker)}</p>
      <h1>${esc(title)}</h1>
      ${copy ? `<p class="lead">${esc(copy)}</p>` : ""}
    </header>
  `;
}

function image(src, alt, className = "") {
  return src ? `<img class="${className}" src="${src}" alt="${esc(alt)}" />` : `<div class="image-fallback ${className}">XIPHIAS</div>`;
}

function page(content, theme = "light") {
  return `<section class="page ${theme}">${content}</section>`;
}

function header(assetsMap, title, pageNo, theme = "light") {
  return `
    <div class="report-header">
      ${image(assetsMap.logo, "XIPHIAS Immigration", "header-logo")}
      <div>
        <span>${esc(title)}</span>
        <strong>${esc(client.country)} | ${esc(client.route)}</strong>
      </div>
      <em>${String(pageNo).padStart(2, "0")}</em>
    </div>
  `;
}

function footer() {
  return `<div class="report-footer"><span>XIPHIAS Immigration Private Limited</span><span>Private client advisory report</span></div>`;
}

function cover(assetsMap) {
  const score = fitScore();
  return page(`
    <div class="cover-bg">${image(assetsMap.hero, "Global mobility", "cover-image")}</div>
    <div class="cover-frame">
      ${image(assetsMap.logo, "XIPHIAS Immigration", "cover-logo")}
      <div class="cover-grid">
        <div>
          <p class="kicker gold">Private Client Assessment</p>
          <h1>Personal Immigration Strategy Report</h1>
          <p class="cover-copy">Prepared for ${esc(client.name)} with a focused recommendation for ${esc(client.country)} immigration planning.</p>
          <div class="cover-pills">
            <span>${esc(client.route)}</span>
            <span>${esc(client.objective)}</span>
            <span>${esc(client.date)}</span>
          </div>
        </div>
        <div class="cover-card">
          ${image(assetsMap.routeHero, client.route, "cover-card-image")}
          <div class="score-ring">${score}<span>fit</span></div>
          <h2>${esc(client.country)}</h2>
          <p>${esc(client.profile)}</p>
        </div>
      </div>
    </div>
  `, "cover");
}

function executivePage(assetsMap, doc) {
  return page(`
    ${header(assetsMap, "Executive recommendation", 2)}
    <div class="two-col hero-layout">
      <div>
        ${sectionHeader("Recommended direction", client.route, `XIPHIAS recommends proceeding with an advisor-led ${routeShort()} evidence review before full filing preparation.`)}
        <div class="verdict">
          <strong>Working result: Promising route-fit</strong>
          <p>The client profile can support this route if the evidence pack proves eligibility, route purpose, financial/document readiness and a credible reason for choosing ${esc(client.country)}.</p>
        </div>
        <div class="mini-grid">
          ${stat("Country", client.country)}
          ${stat("Route", routeShort())}
          ${stat("Sponsorship", "Advisor review")}
          ${stat("Family", "Review eligible")}
        </div>
      </div>
      <aside class="image-panel">
        ${image(assetsMap.greenCard, `${client.country} immigration`, "panel-photo")}
        <div class="caption-card">
          <span>Primary reason</span>
          <strong>Route selected from the client's target country, profile, timeline, budget and document-readiness signals.</strong>
        </div>
      </aside>
    </div>
    <div class="note-strip">${esc(doc.tagline)}</div>
    ${footer()}
  `);
}

function snapshotPage(assetsMap) {
  const rows = [
    ["Client", client.name],
    ["Current profile", client.profile],
    ["Objective", client.objective],
    ["Family planning", client.family],
    ["Timeline expectation", client.timeline],
    ["Budget position", client.budget],
  ];
  return page(`
    ${header(assetsMap, "Client snapshot", 3)}
    ${sectionHeader("Assessment profile", "Case details used for this recommendation", "This page keeps the report focused on the client instead of showing a generic product catalogue.")}
    <div class="snapshot-grid">
      <div class="profile-table">
        ${rows.map(([a, b]) => `<div><span>${esc(a)}</span><strong>${esc(b)}</strong></div>`).join("")}
      </div>
      <div class="country-card">
        ${image(assetsMap.flag, `${client.country} flag`, "flag")}
        <h2>${esc(client.country)}</h2>
        <p>Destination-specific planning for the client's selected route, including eligibility, documents, timeline, family strategy, cost exposure and advisor verification.</p>
        <div class="small-stats">
          ${stat("Route type", "Immigrant")}
          ${stat("Timeline", client.timeline)}
        </div>
      </div>
    </div>
    ${footer()}
  `);
}

function dashboardPage(assetsMap) {
  const score = fitScore();
  const primaryStrength = evidenceRows.find(([, status]) => /strong|likely|promising|good/i.test(status)) || evidenceRows[0];
  const primaryGap = evidenceRows.find(([, status]) => /gap|need|review|incomplete|build/i.test(status)) || evidenceRows[1] || evidenceRows[0];
  return page(`
    ${header(assetsMap, "Assessment dashboard", 4)}
    ${sectionHeader("Route-fit analytics", `${routeShort()} readiness scorecard`, "Scores are directional advisory signals. The advisor review decides the final evidence positioning.")}
    <div class="dashboard-grid">
      <div class="score-panel">
        <div class="big-score">${score}<span>/100</span></div>
        <h2>Promising route-fit</h2>
        <p>Best next move: complete an evidence matrix and verify route-specific positioning.</p>
      </div>
      <div class="bars">
        ${scoreCards.map(([label, value, note]) => bar(label, value, note)).join("")}
      </div>
    </div>
    <div class="insight-grid">
      <div><strong>Main strength</strong><p>${esc(primaryStrength?.[2] || "The client has useful signals for the selected route.")}</p></div>
      <div><strong>Main gap</strong><p>${esc(primaryGap?.[2] || "Advisor review should confirm evidence quality and document completeness.")}</p></div>
      <div><strong>Decision point</strong><p>Advisor compares this route against alternative country/programme options after document review.</p></div>
    </div>
    ${footer()}
  `);
}

function eligibilityPage(assetsMap, doc) {
  const rows = [
    [doc.requirements[0] || "Core eligibility", "Review", "Confirm the client meets the route's primary eligibility basis."],
    [doc.requirements[1] || "Country-specific fit", "Likely", `Check that the client's objective fits ${client.country} route rules.`],
    [doc.requirements[2] || "Document evidence", "Needs evidence", "Proof must be complete, verifiable and consistent across all documents."],
    [doc.requirements[3] || "Family and timeline", "Possible", "Dependent strategy and expected timing require advisor review."],
    ["Final strategy", "Draft carefully", `Explain why ${client.country} and this route are the best-fit direction for the client.`],
  ];
  return page(`
    ${header(assetsMap, "Visa-specific eligibility", 5, "dark")}
    <div class="dark-content">
      ${sectionHeader(`${routeShort()} matrix`, "How the client compares against the route", "Each criterion needs documentary proof before filing strategy is confirmed.")}
      <div class="matrix">
        ${rows.map(([criterion, signal, note]) => `
          <div class="matrix-row">
            <strong>${esc(criterion)}</strong>
            <span>${esc(signal)}</span>
            <p>${esc(note)}</p>
          </div>
        `).join("")}
      </div>
      <div class="requirement-box">
        <h3>Core programme requirements</h3>
        <ul>${doc.requirements.slice(0, 4).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>
    </div>
    ${footer()}
  `, "dark");
}

function evidencePage(assetsMap) {
  return page(`
    ${header(assetsMap, "Evidence review", 6)}
    <div class="two-col evidence-layout">
      <div>
        ${sectionHeader("CV and profile signals", "Advisor verification points", "The report identifies strengths and gaps that must be supported with documents.")}
        <div class="evidence-list">
          ${evidenceRows.map(([title, status, note]) => `
            <div>
              <span>${esc(status)}</span>
              <strong>${esc(title)}</strong>
              <p>${esc(note)}</p>
            </div>
          `).join("")}
        </div>
      </div>
      <aside class="image-panel">
        ${image(assetsMap.usWork, `${client.country} route planning`, "panel-photo tall")}
        <div class="caption-card">
          <span>CV priority</span>
          <strong>Quantify product impact, leadership scope, public benefit and expert validation.</strong>
        </div>
      </aside>
    </div>
    ${footer()}
  `);
}

function improvementPage(assetsMap) {
  return page(`
    ${header(assetsMap, "Improvement roadmap", 7, "dark")}
    <div class="dark-content">
      ${sectionHeader("Action plan", "Priority improvements before filing", `A strong ${routeShort()} case depends on evidence quality, not just the route name.`)}
      <div class="roadmap">
        ${improvementRows.map(([title, copy], index) => `
          <div>
            <em>${String(index + 1).padStart(2, "0")}</em>
            <h3>${esc(title)}</h3>
            <p>${esc(copy)}</p>
          </div>
        `).join("")}
      </div>
      <div class="premium-callout">
        <strong>Advisor note</strong>
        <p>The immediate goal is not filing. The immediate goal is to make the case evidence-ready and reduce avoidable refusal risk.</p>
      </div>
    </div>
    ${footer()}
  `, "dark");
}

function pricingPage(assetsMap, doc) {
  const routeFees = doc.prices.length
    ? doc.prices
    : [
        {
          label: "Government / route fees",
          amount: "Advisor verification",
          notes: `Final ${client.country} government, legal, translation and third-party costs are confirmed after route selection.`,
        },
      ];
  return page(`
    ${header(assetsMap, "Route costs and service products", 8)}
    ${sectionHeader("Commercial view", `Estimated ${routeShort()} route costs`, "This report includes the recommended route costs and XIPHIAS products for the client's next stage.")}
    <div class="table-card">
      <h3>Government / route fees</h3>
      <table>
        <thead><tr><th>Fee</th><th>Amount</th><th>Notes</th></tr></thead>
        <tbody>
          ${routeFees.map((fee) => `<tr><td>${esc(fee.label)}</td><td>${esc(money(fee.amount))}</td><td>${esc(fee.notes || "")}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="table-card products">
      <h3>XIPHIAS recommended products</h3>
      <table>
        <thead><tr><th>Product</th><th>Price</th><th>Scope</th></tr></thead>
        <tbody>
          ${serviceProducts.map(([name, price, scope]) => `<tr><td>${esc(name)}</td><td>${esc(price)}</td><td>${esc(scope)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="fine-print">Final quotation is issued after advisor verification, document review and service scope confirmation.</div>
    ${footer()}
  `);
}

function timelinePage(assetsMap, doc) {
  const steps = doc.process.length
    ? doc.process.slice(0, 6).map((step) => [clean(step.title), clean(step.description)])
    : [
        ["Eligibility review", "Evaluate profile, documents and route-specific evidence."],
        ["Prepare application", `Submit ${routeShort()} application with supporting documents.`],
        [`${governmentAuthority()} review`, "Government assesses eligibility, admissibility and route-specific justification."],
        ["Decision stage", "Respond to additional document requests, interview requirements or status updates."],
        ["Biometrics and interview", "Complete identity and admissibility checks if required."],
        ["Receive approval", `Move to ${permanentOutcomeLabel()} after final approval.`],
      ];
  return page(`
    ${header(assetsMap, "Process timeline", 9, "dark")}
    <div class="dark-content">
      ${sectionHeader("Execution sequence", `From evidence review to ${permanentOutcomeLabel()}`, "Indicative timeline only. Government processing, visa availability and document requests can change the plan.")}
      <div class="timeline">
        ${steps.map(([title, copy], index) => `
          <div>
            <em>${index + 1}</em>
            <h3>${esc(title)}</h3>
            <p>${esc(copy)}</p>
          </div>
        `).join("")}
      </div>
      <div class="timeline-note">
        <strong>Expected planning window</strong>
        <span>${esc(client.timeline)}</span>
      </div>
    </div>
    ${footer()}
  `, "dark");
}

function documentsPage(assetsMap, doc) {
  const groups = doc.checklist.slice(0, 4);
  return page(`
    ${header(assetsMap, "Document checklist", 10)}
    ${sectionHeader("Upload plan", "Documents required for advisor review", "Collect these items in X-Hub before final filing strategy is confirmed.")}
    <div class="doc-grid">
      ${groups.map((group) => `
        <div class="doc-card">
          <h3>${esc(group.group)}</h3>
          <ul>${(group.documents || []).slice(0, 6).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        </div>
      `).join("")}
    </div>
    ${footer()}
  `);
}

function riskPage(assetsMap, doc) {
  const risks = [...doc.risks, ...doc.compliance].slice(0, 6);
  return page(`
    ${header(assetsMap, "Risk and due diligence", 11, "dark")}
    <div class="dark-content">
      ${sectionHeader("Risk controls", "Issues to verify before engagement", "The objective is to reduce weak evidence, inconsistent documents and strategy mismatch.")}
      <div class="risk-grid">
        ${risks.map((risk, index) => `
          <div>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <p>${esc(risk)}</p>
          </div>
        `).join("")}
      </div>
      <div class="premium-callout">
        <strong>Professional caution</strong>
        <p>Final eligibility and filing strategy must be verified by XIPHIAS advisors. No private report can guarantee a visa office or government decision.</p>
      </div>
    </div>
    ${footer()}
  `, "dark");
}

function alternativesPage(assetsMap) {
  return page(`
    ${header(assetsMap, "Alternative routes", 12)}
    <div class="two-col">
      <div>
        ${sectionHeader("Route comparison", `Why ${routeShort()} is the primary direction`, "Alternatives are useful only if the client's evidence, capital, sponsor, country preference or timing supports them.")}
        <div class="alt-list">
          ${alternatives.map(([name, status, note]) => `
            <div>
              <span>${esc(status)}</span>
              <strong>${esc(name)}</strong>
              <p>${esc(note)}</p>
            </div>
          `).join("")}
        </div>
      </div>
      <aside class="image-panel">
        ${image(assetsMap.eb1, `Alternative ${client.country} route`, "panel-photo tall")}
        <div class="caption-card">
          <span>Route strategy</span>
          <strong>Primary route first, then compare alternatives after advisor review and document verification.</strong>
        </div>
      </aside>
    </div>
    ${footer()}
  `);
}

function countryPage(assetsMap) {
  const items = [
    ["Route fit", `The ${client.country} route must match the client's profile, budget, timing and long-term objective.`],
    ["Document quality", "Advisor review checks whether submitted evidence is complete, consistent and credible."],
    ["Family inclusion", "Spouse and dependent planning must be checked against the selected programme rules."],
    ["Processing variables", `Government timing, document requests, interviews and route availability in ${client.country} must be monitored.`],
  ];
  return page(`
    ${header(assetsMap, "Country planning notes", 13)}
    <div class="two-col country-layout">
      <div>
        ${sectionHeader(client.country, "Planning values for this client", `${client.country} planning must combine route selection, evidence quality, family timing, cost exposure and government-stage risk.`)}
        <div class="country-notes">
          ${items.map(([title, copy]) => `<div><strong>${esc(title)}</strong><p>${esc(copy)}</p></div>`).join("")}
        </div>
      </div>
      <aside class="image-panel">
        ${image(assetsMap.usa, client.country, "panel-photo tall")}
      </aside>
    </div>
    ${footer()}
  `);
}

function hubPage(assetsMap) {
  const steps = [
    ["Report delivered", "Client receives the paid strategy report."],
    ["Case opened", "X-Hub record stores client profile, route and advisor notes."],
    ["Documents uploaded", "CV, passport, degrees and evidence are uploaded for review."],
    ["Advisor verifies", "Route, risk, costs and product scope are finalized."],
    ["Service starts", "Client proceeds with evidence matrix, documentation or filing coordination."],
  ];
  return page(`
    ${header(assetsMap, "X-Hub workflow", 14)}
    <div class="two-col">
      <div>
        ${sectionHeader("Client delivery system", "How this report becomes a managed case", "The report is designed to connect the client into X-Hub for document tracking and advisor follow-up.")}
        <div class="workflow-list">
          ${steps.map(([title, copy], index) => `
            <div>
              <em>${index + 1}</em>
              <strong>${esc(title)}</strong>
              <p>${esc(copy)}</p>
            </div>
          `).join("")}
        </div>
      </div>
      <aside class="image-panel">
        ${image(assetsMap.advisor, "XIPHIAS advisor", "panel-photo advisor")}
        <div class="caption-card">
          <span>Advisor handoff</span>
          <strong>${esc(client.advisor)}</strong>
        </div>
      </aside>
    </div>
    ${footer()}
  `);
}

function summaryPage(assetsMap) {
  const score = fitScore();
  return page(`
    ${header(assetsMap, "Advisor summary", 15, "dark")}
    <div class="dark-content summary-page">
      ${sectionHeader("Final recommendation", `Proceed to ${routeShort()} evidence review`, "The client has a promising route direction, but the case is not filing-ready until the evidence is verified.")}
      <div class="summary-card">
        <h2>Recommended next step</h2>
        <p>Open an X-Hub case, collect supporting documents, prepare a route-specific evidence matrix, and schedule advisor review before full application preparation.</p>
      </div>
      <div class="summary-grid">
        ${stat("Route", routeShort(), "Primary")}
        ${stat("Fit", `${score}/100`, "Promising")}
        ${stat("Main gap", "Evidence", "Improve")}
        ${stat("Next service", "Evidence Matrix", "Recommended")}
      </div>
      <div class="signature">
        ${image(assetsMap.logo, "XIPHIAS Immigration", "signature-logo")}
        <div>
          <strong>XIPHIAS Immigration Advisory Desk</strong>
          <span>immigration@xiphias.in | www.xiphiasimmigration.com</span>
        </div>
      </div>
    </div>
    ${footer()}
  `, "dark");
}

function appendixPage(assetsMap, doc) {
  const facts = [
    ["Programme", doc.title || client.route],
    ["Country", client.country],
    ["Job offer required", doc.data.jobOfferRequired === false ? "No" : "Advisor review"],
    ["Content timeline", doc.data.timelineMonths ? `${doc.data.timelineMonths} months` : "Case dependent"],
    ["Family inclusion", client.family || "Advisor review"],
    ["Source page", contentPathToHref(doc.filePath) || "XIPHIAS programme content"],
  ];
  return page(`
    ${header(assetsMap, "Appendix", 16)}
    ${sectionHeader("Source-backed facts", "Programme content used for this report", "Advisor verification of current government rules is required before filing or paid engagement.")}
    <div class="table-card">
      <table>
        <tbody>${facts.map(([a, b]) => `<tr><th>${esc(a)}</th><td>${esc(b)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="appendix-copy">
      <h3>Programme summary</h3>
      <p>${esc(doc.tagline || doc.body)}</p>
    </div>
    <div class="fine-print">This document is an advisory assessment prepared from submitted profile information and XIPHIAS programme content. It is not legal advice and does not guarantee any government decision.</div>
    ${footer()}
  `);
}

function normaliseServiceProducts(input, doc) {
  if (Array.isArray(input.serviceProducts) && input.serviceProducts.length) {
    return input.serviceProducts
      .slice(0, 5)
      .map((item) =>
        Array.isArray(item)
          ? [clean(item[0]), clean(item[1]), clean(item[2])]
          : [clean(item.name), clean(item.price), clean(item.scope || item.description)],
      )
      .filter(([name]) => Boolean(name));
  }

  const routeName = clean(input.program || input.route || doc.title || "Recommended Route");
  const track = clean(input.track || "").toLowerCase();
  const isHighSkill =
    track === "skilled" ||
    /eb-|h-1b|o-1|niw|talent|skilled|work|express entry|pnp/i.test(routeName);
  const isInvestment = /invest|golden|cbi|rbi|residency|citizenship|property|fund|business/i.test(routeName);

  if (isHighSkill) {
    return [
      [`${routeName} Strategy + Evidence Matrix`, "INR 35,000", "Advisor-led route validation, evidence mapping and case-positioning review."],
      ["High-Skill Documentation Pack", "INR 75,000 - 1,25,000", "CV direction, document index, recommendation letter briefs and evidence preparation support."],
      [`${routeName} Filing Coordination`, "INR 1,50,000 - 3,00,000", "Case preparation coordination. Government, attorney, courier, translation and third-party fees separate."],
      ["Advisor Strategy Call", "Included after package selection", "Route, risk, document and next-step review with the advisory desk."],
    ];
  }

  if (isInvestment) {
    return [
      [`${routeName} Route Strategy`, "INR 50,000", "Country, programme, family, timeline, tax and presence review before onboarding."],
      ["Investment Documentation Pack", "INR 1,00,000 - 2,00,000", "Source-of-funds checklist, document index, due-diligence preparation and advisor review."],
      [`${routeName} Application Coordination`, "Quote after route confirmation", "End-to-end coordination scope depends on government route, agent, property/fund and family size."],
      ["Advisor Strategy Call", "Included after package selection", "Route, risk, document and next-step review with the advisory desk."],
    ];
  }

  return [
    [`${routeName} Route Strategy`, "INR 35,000 - 50,000", "Advisor-led route validation, eligibility review and next-step plan."],
    ["Document Readiness Pack", "INR 75,000 - 1,25,000", "Document checklist, gap review, evidence organization and advisor preparation support."],
    [`${routeName} Application Coordination`, "Quote after route confirmation", "Application coordination scope depends on country, route, family size and third-party requirements."],
    ["Advisor Strategy Call", "Included after package selection", "Route, risk, document and next-step review with the advisory desk."],
  ];
}

function normaliseAlternatives(input) {
  if (Array.isArray(input.alternatives) && input.alternatives.length) {
    return input.alternatives
      .slice(0, 5)
      .map((item) =>
        Array.isArray(item)
          ? [clean(item[0]), clean(item[1]), clean(item[2])]
          : [clean(item.name), clean(item.status), clean(item.note || item.description)],
      )
      .filter(([name]) => Boolean(name));
  }
  if (!normalizeKey(client.country).includes("unitedstates")) {
    return [
      [`Alternative ${client.country} route`, "Advisor comparison", "Compare residence, work, investment, family or business routes for the same destination."],
      ["Different destination option", "Fallback", "Useful if budget, timeline, family eligibility or risk does not fit the selected country."],
      ["Investment-led route", "Capital option", "Relevant if the client prefers capital-led planning instead of profile-led eligibility."],
      ["Work or business route", "Operational option", "Relevant if employer sponsorship, company setup or expansion evidence is stronger."],
    ];
  }
  return DEFAULT_ALTERNATIVES;
}

function normaliseScores(input) {
  const source = input.scores && typeof input.scores === "object" ? input.scores : {};
  const read = (key, fallback) => {
    const value = Number(source[key] ?? input[key]);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : fallback;
  };
  return [
    ["Route fit", read("routeFit", read("fitScore", 82)), "Promising"],
    ["Evidence strength", read("evidenceStrength", 68), "Build proof"],
    ["Document readiness", read("documentReadiness", 56), "Incomplete"],
    ["Risk clarity", read("riskClarity", 72), "Review needed"],
    ["Family readiness", read("familyReadiness", 64), "Confirm stage"],
  ];
}

function normaliseEvidenceRows(input) {
  if (Array.isArray(input.evidenceRows) && input.evidenceRows.length) {
    return input.evidenceRows
      .slice(0, 6)
      .map((item) =>
        Array.isArray(item)
          ? [clean(item[0]), clean(item[1]), clean(item[2])]
          : [clean(item.title), clean(item.status), clean(item.note || item.description)],
      )
      .filter(([title]) => Boolean(title));
  }
  if (!normalizeKey(client.country).includes("unitedstates")) {
    return [
      ["Destination fit", "Strong", `The ${client.country} focus matches the submitted route direction and should be validated against current programme rules.`],
      ["Profile alignment", "Review", "Advisor should verify whether occupation, business, investment, family or residency signals support the selected route."],
      ["Document proof", "Needs evidence", "Passport, civil records, financials, employment or business documents must be complete and consistent."],
      ["Financial readiness", "Review", "Capital, source-of-funds and fee exposure must be checked before recommending paid engagement."],
      ["Family planning", "Review", "Dependent inclusion, timing and document requirements must be confirmed for the selected programme."],
    ];
  }
  return DEFAULT_EVIDENCE_ROWS;
}

function normaliseImprovementRows(input) {
  if (Array.isArray(input.improvementRows) && input.improvementRows.length) {
    return input.improvementRows
      .slice(0, 5)
      .map((item) =>
        Array.isArray(item)
          ? [clean(item[0]), clean(item[1])]
          : [clean(item.title), clean(item.note || item.description)],
      )
      .filter(([title]) => Boolean(title));
  }
  if (!normalizeKey(client.country).includes("unitedstates")) {
    return [
      ["First 7 days", "Collect passport, civil records, profile summary, target-country objective and any existing travel or immigration history."],
      ["Next 30 days", `Build a ${client.country} route matrix with costs, family inclusion, presence rules, document gaps and risk notes.`],
      ["Before filing", "Advisor validates eligibility, government-stage risks, source-of-funds position, translations and route alternatives."],
      ["Service conversion", "Move into document readiness, application coordination or partner/vendor steps once the advisor confirms route strength."],
    ];
  }
  return DEFAULT_IMPROVEMENT_ROWS;
}

async function buildAssetPaths(input, doc) {
  const heroImage = clean(doc.data.heroImage || "");
  const routeHero = heroImage ? `public${heroImage.startsWith("/") ? "" : "/"}${heroImage}` : "";
  const cSlugs = countrySlugCandidates(input.country || doc.data.country || client.country);
  const trackSlug = clean(input.track || doc.data.track || doc.data.vertical || "").toLowerCase();
  const reportCover = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["cover", "hero"]),
  );
  const reportImg1 = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img1", "image1", "landmark", "city"]),
  );
  const reportImg2 = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img2", "image2", "process", "documents", "passport"]),
  );
  const reportRoute = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["route", "programme", "program", "visa", "img1", "cover"]),
  );
  const reportLandmark = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img1", "landmark", "city", "cover"]),
  );
  const reportCity = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img1", "city", "business", "lifestyle", "landmark", "cover"]),
  );
  const reportProcess = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img2", "process", "documents", "passport", "advisor", "route"]),
  );
  const reportAlternative = await firstExisting(
    imageCandidates(cSlugs, "report-assets", ["img2", "alternative", "comparison", "passport", "city", "landmark"]),
  );
  const directoryCountry = await firstImageFromDirectories([
    ...cSlugs.map((slug) => `public/images/report-assets/${slug}`),
    ...cSlugs.flatMap((slug) => [
      trackSlug ? `public/images/${trackSlug}/${slug}` : "",
      `public/images/residency/${slug}`,
      `public/images/citizenship/${slug}`,
      `public/images/corporate/${slug}`,
      `public/images/skilled/${slug}`,
    ]),
  ]);
  const articleCountry = await firstExisting([
    ...cSlugs.flatMap((slug) => [
      trackSlug ? `public/images/${trackSlug}/${slug}/${slug}.webp` : "",
      trackSlug ? `public/images/${trackSlug}/${slug}/${slug}.png` : "",
      `public/images/skilled/${slug}/${slug}.webp`,
      `public/images/skilled/${slug}/${slug}.png`,
      `public/images/articles/${slug}.webp`,
      `public/images/articles/${slug}-immigration.webp`,
      `public/images/articles/${slug}-residency.webp`,
      `public/images/articles/${slug}-golden-visa.webp`,
    ]),
    directoryCountry,
    routeHero,
  ]);
  const countryName = displayCountry(input.country || doc.data.country || "");
  const flag = await firstExisting([
    `public/images/flags/${clean(input.countryCode || "").toUpperCase()}.png`,
    `public/images/flags/${clean(input.countryCode || "").toUpperCase()}.jpg`,
    `public/images/flags/${countryName.replace(/\s+/g, "")}.png`,
    `public/images/flags/${countryName}.png`,
    "public/images/flags/USA.png",
  ]);

  return {
    ...DEFAULT_ASSETS,
    hero: (await firstExisting([reportCover, articleCountry, DEFAULT_ASSETS.hero])) || DEFAULT_ASSETS.hero,
    routeHero: (await firstExisting([routeHero, reportRoute, reportCover, articleCountry, DEFAULT_ASSETS.routeHero])) || DEFAULT_ASSETS.routeHero,
    greenCard: (await firstExisting([reportCover, reportLandmark, reportImg1, articleCountry, routeHero, DEFAULT_ASSETS.greenCard])) || DEFAULT_ASSETS.greenCard,
    usWork: (await firstExisting([reportImg2, reportProcess, reportImg1, reportCity, reportRoute, routeHero, articleCountry, DEFAULT_ASSETS.usWork])) || DEFAULT_ASSETS.usWork,
    usa: (await firstExisting([reportImg1, reportLandmark, reportCity, articleCountry, routeHero, DEFAULT_ASSETS.usa])) || DEFAULT_ASSETS.usa,
    eb1: (await firstExisting([reportImg2, reportAlternative, reportCity, articleCountry, routeHero, DEFAULT_ASSETS.eb1])) || DEFAULT_ASSETS.eb1,
    flag: flag || DEFAULT_ASSETS.flag,
  };
}

function buildClient(input, doc) {
  const country = displayCountry(input.country || doc.data.country || DEFAULT_CLIENT.country);
  const route = clean(input.program || input.route || input.selectedVisa || doc.title || DEFAULT_CLIENT.route);
  const date =
    clean(input.date) ||
    new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  return {
    ...DEFAULT_CLIENT,
    name: clean(input.name) || DEFAULT_CLIENT.name,
    reportRef: clean(input.reportRef) || `XIP-${Date.now().toString(36).toUpperCase()}`,
    date,
    country,
    countryCode: clean(input.countryCode) || clean(doc.data.countrySlug || "").toUpperCase() || DEFAULT_CLIENT.countryCode,
    route,
    objective: clean(input.objective || input.goal) || `${country} immigration planning through ${route}`,
    profile: clean(input.profile || input.role || input.currentRole) || DEFAULT_CLIENT.profile,
    location: clean(input.location || input.currentCountry) || DEFAULT_CLIENT.location,
    family: clean(input.family || input.familyMembers) || DEFAULT_CLIENT.family,
    timeline: clean(input.timeline || input.timelineMonths) || (doc.data.timelineMonths ? `${doc.data.timelineMonths} months planning window` : DEFAULT_CLIENT.timeline),
    budget: clean(input.budget || input.budgetUsd) || DEFAULT_CLIENT.budget,
    advisor: clean(input.advisor) || DEFAULT_CLIENT.advisor,
  };
}

function routeShort() {
  return clean(client.route).split(" - ")[0].slice(0, 58) || "Selected route";
}

function fitScore() {
  const value = Number(scoreCards?.[0]?.[1]);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 82;
}

function governmentAuthority() {
  return normalizeKey(client.country).includes("unitedstates") ? "USCIS" : `${client.country} authorities`;
}

function permanentOutcomeLabel() {
  const route = normalizeKey(client.route);
  if (/citizenship|passport|cbi/.test(route)) return "citizenship or passport stage";
  if (/work|h1b|o1|l1|permit/.test(route)) return "visa or work-authorisation stage";
  if (/business|company|corporate/.test(route)) return "business mobility stage";
  return "residency or approval stage";
}

function styles() {
  return `
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #111827; color: #07142d; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { position: relative; width: 210mm; height: 297mm; overflow: hidden; padding: 23mm 18mm 17mm; background: #f7f9fd; page-break-after: always; }
    .page.dark { background: #031027; color: #f8fbff; }
    .report-header { position: absolute; left: 0; top: 0; width: 100%; height: 23mm; display: grid; grid-template-columns: 36mm 1fr 18mm; align-items: center; gap: 8mm; padding: 5mm 18mm; background: #fff; border-bottom: 1.4mm solid #ddb31a; }
    .dark .report-header { background: #061633; border-bottom-color: #ddb31a; }
    .header-logo { max-width: 26mm; max-height: 14mm; object-fit: contain; }
    .report-header span { display: block; color: #0d55bd; font-weight: 800; font-size: 7pt; text-transform: uppercase; letter-spacing: .08em; }
    .dark .report-header span { color: #ddb31a; }
    .report-header strong { display: block; color: #061633; font-size: 10pt; margin-top: 1.5mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dark .report-header strong { color: #fff; }
    .report-header em { color: #77849a; font-style: normal; font-size: 8pt; font-weight: 800; text-align: right; }
    .report-footer { position: absolute; left: 18mm; right: 18mm; bottom: 8mm; padding-top: 3mm; border-top: .3mm solid #cdd7e8; display: flex; justify-content: space-between; color: #60708a; font-size: 7pt; font-weight: 700; }
    .dark .report-footer { border-color: rgba(255,255,255,.18); color: #b6c4db; }
    .section-head { margin-bottom: 9mm; }
    .kicker { margin: 0 0 3mm; color: #0d55bd; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: .16em; }
    .gold { color: #ddb31a; }
    h1 { margin: 0; color: #061633; font-size: 24pt; line-height: 1.07; letter-spacing: -.02em; }
    .dark h1, .cover h1 { color: #fff; }
    h2 { margin: 0; font-size: 17pt; line-height: 1.15; color: #061633; }
    .dark h2 { color: #fff; }
    h3 { margin: 0; color: inherit; font-size: 11pt; }
    p { margin: 0; font-size: 10pt; line-height: 1.48; color: #30425e; }
    .dark p { color: #cfdbeb; }
    .lead { max-width: 142mm; margin-top: 4mm; font-size: 10.5pt; line-height: 1.55; color: #33445c; }
    .dark .lead { color: #dbe6f4; }
    .cover { padding: 0; color: #fff; background: #04122c; }
    .cover-bg, .cover-bg:after { position: absolute; inset: 0; }
    .cover-bg:after { content: ""; background: linear-gradient(90deg, rgba(3,13,33,.98), rgba(3,13,33,.88), rgba(3,13,33,.44)); }
    .cover-image { width: 100%; height: 100%; object-fit: cover; opacity: .62; }
    .cover-frame { position: absolute; inset: 10mm; padding: 10mm 12mm; border: .45mm solid #ddb31a; }
    .cover-logo { width: 36mm; height: 18mm; object-fit: contain; margin-bottom: 24mm; }
    .cover-grid { display: grid; grid-template-columns: 1fr 64mm; gap: 12mm; align-items: end; }
    .cover h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 38pt; line-height: 1.02; max-width: 112mm; }
    .cover-copy { margin-top: 8mm; color: #e8eef7; font-size: 12pt; max-width: 112mm; }
    .cover-pills { display: flex; flex-wrap: wrap; gap: 3mm; margin-top: 11mm; }
    .cover-pills span { border: .25mm solid rgba(221,179,26,.65); padding: 2.2mm 3.2mm; border-radius: 99mm; color: #fff2b5; font-size: 8pt; font-weight: 800; }
    .cover-card { position: relative; background: rgba(5,22,52,.84); border: .35mm solid rgba(221,179,26,.72); border-radius: 4mm; padding: 5mm; box-shadow: 0 14mm 30mm rgba(0,0,0,.35); }
    .cover-card-image { width: 100%; height: 43mm; object-fit: cover; border-radius: 3mm; margin-bottom: 5mm; }
    .cover-card h2 { color: #fff; margin-top: 2mm; }
    .cover-card p { color: #cbd7e8; }
    .score-ring { position: absolute; right: 6mm; top: 34mm; width: 21mm; height: 21mm; border-radius: 50%; display: grid; place-items: center; background: #ddb31a; color: #061633; font-size: 19pt; font-weight: 900; border: 1.2mm solid #061633; }
    .score-ring span { display: block; font-size: 6pt; text-transform: uppercase; margin-top: -4mm; }
    .two-col { display: grid; grid-template-columns: 1.15fr .85fr; gap: 10mm; align-items: stretch; }
    .hero-layout { min-height: 210mm; }
    .image-panel { position: relative; min-height: 150mm; background: #eaf1fb; border: .3mm solid #cdd9eb; border-radius: 5mm; overflow: hidden; }
    .panel-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
    .panel-photo.tall { height: 178mm; }
    .panel-photo.advisor { height: 130mm; object-position: top; }
    .caption-card { position: absolute; left: 5mm; right: 5mm; bottom: 5mm; padding: 5mm; background: rgba(3,16,39,.9); border: .25mm solid rgba(221,179,26,.7); border-radius: 3mm; color: #fff; }
    .caption-card span { color: #ddb31a; text-transform: uppercase; font-size: 7pt; font-weight: 900; letter-spacing: .12em; }
    .caption-card strong { display: block; margin-top: 2mm; font-size: 11pt; line-height: 1.35; }
    .verdict, .note-strip, .premium-callout, .fine-print { background: #fff5cf; border: .35mm solid #ddb31a; padding: 6mm; border-radius: 3mm; }
    .verdict { margin-top: 9mm; }
    .verdict strong { display: block; font-size: 15pt; color: #061633; margin-bottom: 3mm; }
    .mini-grid, .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4mm; margin-top: 8mm; }
    .stat { min-height: 26mm; padding: 4.5mm; background: #fff; border: .25mm solid #cdd9eb; border-radius: 3mm; }
    .dark .stat { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.14); }
    .stat span { display: block; color: #64748b; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .1em; font-weight: 900; }
    .dark .stat span { color: #aebbd0; }
    .stat strong { display: block; color: #061633; font-size: 15pt; margin-top: 2mm; line-height: 1.15; }
    .dark .stat strong { color: #fff; }
    .stat small { display: block; color: #53657e; font-size: 7.5pt; margin-top: 1.5mm; }
    .dark .stat small { color: #c5d1e2; }
    .note-strip { margin-top: 8mm; font-size: 10pt; font-weight: 700; color: #061633; }
    .snapshot-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 9mm; }
    .profile-table { background: #fff; border: .3mm solid #cdd9eb; border-radius: 4mm; overflow: hidden; }
    .profile-table div { display: grid; grid-template-columns: 39mm 1fr; gap: 5mm; padding: 5mm 6mm; border-bottom: .25mm solid #e1e8f3; min-height: 20mm; }
    .profile-table div:last-child { border-bottom: 0; }
    .profile-table span { color: #64748b; font-size: 8pt; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
    .profile-table strong { color: #061633; font-size: 10.5pt; line-height: 1.35; }
    .country-card { background: #061633; color: #fff; border-radius: 5mm; padding: 8mm; min-height: 190mm; }
    .flag { width: 25mm; height: 25mm; border-radius: 50%; object-fit: cover; border: .7mm solid #fff; margin-bottom: 8mm; }
    .country-card h2 { color: #fff; font-size: 25pt; margin-bottom: 4mm; }
    .country-card p { color: #d8e2f0; }
    .small-stats { display: grid; gap: 4mm; margin-top: 11mm; }
    .dashboard-grid { display: grid; grid-template-columns: 52mm 1fr; gap: 8mm; align-items: stretch; }
    .score-panel { background: #061633; color: #fff; border-radius: 5mm; padding: 8mm; display: flex; flex-direction: column; justify-content: center; }
    .big-score { font-size: 45pt; color: #ddb31a; font-weight: 900; line-height: .9; }
    .big-score span { font-size: 16pt; color: #fff; }
    .score-panel h2 { color: #fff; margin: 7mm 0 3mm; }
    .score-panel p { color: #d8e2f0; }
    .bars { display: grid; gap: 4mm; background: #fff; border: .3mm solid #cdd9eb; border-radius: 5mm; padding: 7mm; }
    .bar-head { display: flex; justify-content: space-between; font-size: 9pt; color: #061633; }
    .bar-head span { font-weight: 900; color: #0d55bd; }
    .bar-track { height: 3.2mm; border-radius: 99mm; background: #e5edf8; overflow: hidden; margin-top: 1.8mm; }
    .bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ddb31a, #0d55bd); }
    .bar-row p { margin-top: 1.5mm; font-size: 7.4pt; color: #66758e; }
    .insight-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; margin-top: 9mm; }
    .insight-grid div, .country-notes div, .appendix-copy { background: #fff; border: .25mm solid #cdd9eb; border-radius: 4mm; padding: 5mm; }
    .insight-grid strong, .country-notes strong { display: block; font-size: 11pt; margin-bottom: 2mm; color: #061633; }
    .insight-grid p, .country-notes p { font-size: 8.5pt; }
    .dark-content { padding-top: 4mm; }
    .dark .kicker { color: #ddb31a; }
    .matrix { display: grid; gap: 4mm; }
    .matrix-row { display: grid; grid-template-columns: 54mm 29mm 1fr; gap: 5mm; align-items: center; background: rgba(255,255,255,.07); border: .25mm solid rgba(255,255,255,.18); border-radius: 3mm; padding: 4.5mm; }
    .matrix-row strong { color: #fff; font-size: 10.2pt; }
    .matrix-row span { display: inline-block; text-align: center; padding: 2mm; border-radius: 99mm; color: #061633; background: #ddb31a; font-weight: 900; font-size: 8pt; }
    .matrix-row p { font-size: 8.5pt; }
    .requirement-box { margin-top: 8mm; padding: 6mm; border: .3mm solid #ddb31a; border-radius: 4mm; background: rgba(221,179,26,.09); }
    ul { margin: 4mm 0 0; padding-left: 5mm; }
    li { margin: 2mm 0; font-size: 9.3pt; line-height: 1.35; }
    .evidence-layout { grid-template-columns: 1.05fr .75fr; }
    .evidence-list, .alt-list, .workflow-list { display: grid; gap: 4mm; }
    .evidence-list div, .alt-list div, .workflow-list div { background: #fff; border: .25mm solid #cdd9eb; border-radius: 4mm; padding: 4.5mm 5mm; }
    .evidence-list span, .alt-list span { display: inline-block; color: #0d55bd; background: #eaf1fb; border-radius: 99mm; padding: 1.4mm 2.8mm; font-size: 7pt; text-transform: uppercase; letter-spacing: .08em; font-weight: 900; margin-bottom: 2mm; }
    .evidence-list strong, .alt-list strong, .workflow-list strong { display: block; font-size: 11.5pt; color: #061633; margin-bottom: 1.6mm; }
    .evidence-list p, .alt-list p, .workflow-list p { font-size: 8.7pt; }
    .roadmap { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5mm; margin-top: 10mm; }
    .roadmap div, .risk-grid div { min-height: 96mm; background: rgba(255,255,255,.07); border: .3mm solid rgba(221,179,26,.7); border-radius: 4mm; padding: 5mm; }
    .roadmap em, .risk-grid span, .workflow-list em { display: grid; place-items: center; width: 10mm; height: 10mm; border-radius: 50%; background: #ddb31a; color: #061633; font-style: normal; font-weight: 900; margin-bottom: 5mm; }
    .roadmap h3 { color: #fff; margin-bottom: 4mm; }
    .roadmap p { font-size: 9pt; }
    .premium-callout { margin-top: 10mm; background: rgba(221,179,26,.1); color: #fff; }
    .premium-callout strong { display: block; color: #ddb31a; text-transform: uppercase; letter-spacing: .12em; font-size: 8pt; margin-bottom: 3mm; }
    .premium-callout p { color: #fff; font-weight: 800; font-size: 11pt; }
    .table-card { background: #fff; border: .3mm solid #cdd9eb; border-radius: 4mm; padding: 5mm; margin-top: 6mm; }
    .table-card h3 { color: #0d55bd; text-transform: uppercase; letter-spacing: .1em; font-size: 8pt; margin-bottom: 3mm; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; border-bottom: .25mm solid #d9e2f0; padding: 3.2mm; font-size: 8.4pt; line-height: 1.35; }
    th { color: #0d55bd; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .08em; background: #e9f2ff; }
    td:first-child { font-weight: 800; color: #061633; }
    .products th:nth-child(2), .products td:nth-child(2) { width: 32mm; }
    .fine-print { margin-top: 5mm; color: #061633; font-weight: 800; font-size: 9pt; }
    .timeline { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; margin-top: 12mm; }
    .timeline div { min-height: 58mm; background: rgba(255,255,255,.07); border: .25mm solid rgba(255,255,255,.18); border-radius: 4mm; padding: 5mm; }
    .timeline em { display: grid; place-items: center; width: 12mm; height: 12mm; border-radius: 50%; border: .45mm solid #ddb31a; color: #ddb31a; font-style: normal; font-weight: 900; margin-bottom: 4mm; }
    .timeline h3 { color: #fff; margin-bottom: 2.5mm; }
    .timeline p { font-size: 8.4pt; }
    .timeline-note { margin-top: 8mm; display: flex; justify-content: space-between; align-items: center; background: rgba(221,179,26,.12); border: .3mm solid #ddb31a; border-radius: 4mm; padding: 6mm; }
    .timeline-note strong { color: #ddb31a; font-size: 10pt; text-transform: uppercase; letter-spacing: .1em; }
    .timeline-note span { color: #fff; font-size: 14pt; font-weight: 900; }
    .doc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; }
    .doc-card { min-height: 79mm; background: #fff; border: .3mm solid #cdd9eb; border-radius: 4mm; padding: 5mm; }
    .doc-card h3 { color: #061633; border-bottom: .25mm solid #d9e2f0; padding-bottom: 2.5mm; margin-bottom: 3mm; }
    .doc-card li { font-size: 8.2pt; margin: 1.7mm 0; }
    .risk-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; }
    .risk-grid div { min-height: 42mm; }
    .risk-grid p { color: #e7eef8; font-size: 9.4pt; }
    .country-layout { grid-template-columns: 1fr .82fr; }
    .country-notes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; margin-top: 8mm; }
    .workflow-list div { display: grid; grid-template-columns: 13mm 1fr; column-gap: 4mm; align-items: start; }
    .workflow-list em { grid-row: span 2; margin: 0; }
    .workflow-list strong { margin: 0; }
    .summary-page { display: flex; flex-direction: column; min-height: 244mm; }
    .summary-card { margin-top: 7mm; padding: 10mm; border-radius: 5mm; border: .35mm solid #ddb31a; background: rgba(221,179,26,.1); }
    .summary-card h2 { color: #ddb31a; margin-bottom: 4mm; }
    .summary-card p { color: #fff; font-size: 14pt; line-height: 1.42; font-weight: 800; }
    .summary-grid { grid-template-columns: repeat(4, 1fr); margin-top: 9mm; }
    .signature { margin-top: auto; display: flex; align-items: center; gap: 7mm; border-top: .3mm solid rgba(255,255,255,.2); padding-top: 8mm; }
    .signature-logo { width: 34mm; height: 18mm; object-fit: contain; }
    .signature strong { display: block; color: #fff; font-size: 13pt; }
    .signature span { color: #cbd7e8; font-size: 9pt; }
    .appendix-copy { margin-top: 7mm; }
    .appendix-copy h3 { color: #061633; margin-bottom: 3mm; }
    .appendix-copy p { font-size: 10pt; }
    .image-fallback { display: grid; place-items: center; background: #061633; color: #ddb31a; font-weight: 900; }
  `;
}

function buildHtml(assetsMap, doc) {
  const pages = [
    cover(assetsMap),
    executivePage(assetsMap, doc),
    snapshotPage(assetsMap),
    dashboardPage(assetsMap),
    eligibilityPage(assetsMap, doc),
    evidencePage(assetsMap),
    improvementPage(assetsMap),
    pricingPage(assetsMap, doc),
    timelinePage(assetsMap, doc),
    documentsPage(assetsMap, doc),
    riskPage(assetsMap, doc),
    alternativesPage(assetsMap),
    countryPage(assetsMap),
    hubPage(assetsMap),
    summaryPage(assetsMap),
    appendixPage(assetsMap, doc),
  ];

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>XIPHIAS Premium Report - ${esc(client.name)}</title>
      <style>${styles()}</style>
    </head>
    <body>${pages.join("")}</body>
  </html>`;
}

export async function generatePremiumReportPdf(input = {}) {
  const doc = await loadProgramDoc(input);
  const nextAssets = await buildAssetPaths(input, doc);
  const assetsEntries = await Promise.all(Object.entries(nextAssets).map(async ([key, relPath]) => [key, await dataUri(relPath)]));

  client = buildClient(input, doc);
  assets = nextAssets;
  scoreCards = normaliseScores(input);
  evidenceRows = normaliseEvidenceRows(input);
  improvementRows = normaliseImprovementRows(input);
  serviceProducts = normaliseServiceProducts(input, doc);
  alternatives = normaliseAlternatives(input);

  const assetsMap = Object.fromEntries(assetsEntries);
  const html = buildHtml(assetsMap, doc);

  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await browser.close();
  }
}

export async function writeSamplePremiumReport(outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const pdf = await generatePremiumReportPdf({
    name: DEFAULT_CLIENT.name,
    country: DEFAULT_CLIENT.country,
    countryCode: DEFAULT_CLIENT.countryCode,
    program: DEFAULT_CLIENT.route,
    track: "skilled",
    profile: DEFAULT_CLIENT.profile,
    objective: DEFAULT_CLIENT.objective,
    family: DEFAULT_CLIENT.family,
    timeline: DEFAULT_CLIENT.timeline,
    budget: DEFAULT_CLIENT.budget,
  });
  await fs.writeFile(outputPath, pdf);
  return outputPath;
}
