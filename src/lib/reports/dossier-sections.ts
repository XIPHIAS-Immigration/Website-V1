import "server-only";

import type { Dossier } from "./programme";
import { mdToHtml, proseLength, splitProseSections } from "./markdown";
import {
  bigStats,
  callout,
  card,
  esc,
  grid,
  imageDividerPage,
  page,
  pill,
  runningFooter,
  sectionHeader,
  splitPage,
  steps,
  table,
  ticks,
} from "./components";

// Renders a programme's full content (the depth of the public programme page) into a
// sequence of premium, FULL A4 pages: a full-bleed chapter divider, image-panel split
// pages for shorter sections, and dense full-width pages for tables/checklists. Every
// section is optional and skipped when the programme lacks that data.

// The dossier is composed of independent, optional sections. A report can request a
// focused subset (cheaper tiers) or the full set (flagship tiers) via `sections`.
export type DossierSection =
  | "divider"
  | "snapshot"
  | "eligibility"
  | "scoring"
  | "costs"
  | "documents"
  | "family"
  | "process"
  | "projects"
  | "risk"
  | "faq";

export const ALL_DOSSIER_SECTIONS: DossierSection[] = [
  "divider",
  "snapshot",
  "eligibility",
  "scoring",
  "costs",
  "documents",
  "family",
  "process",
  "projects",
  "risk",
  "faq",
];

type DossierOpts = {
  header: string;
  footLabel: string;
  images?: string[];
  /** Restrict which dossier sections render. Defaults to all sections. */
  sections?: DossierSection[];
};

function money(amount?: number, currency?: string): string {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return "On request";
  return `${currency || "USD"} ${Math.round(amount).toLocaleString("en-US")}`;
}
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
function clean(list?: string[], max = 60): string[] {
  return (list ?? []).map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, max);
}
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function packBlocks<T extends { weight: number }>(blocks: T[], maxWeight: number): T[][] {
  const pages: T[][] = [];
  let page: T[] = [];
  let used = 0;
  for (const block of blocks) {
    if (page.length && used + block.weight > maxWeight) {
      pages.push(page);
      page = [];
      used = 0;
    }
    page.push(block);
    used += block.weight;
  }
  if (page.length) pages.push(page);
  return pages;
}
function faqBlock(faq: { q?: string; a?: string }[]): string {
  return faq
    .filter((f) => (f.q || "").trim())
    .map((f) => `<div class="faq"><div class="faq__q">${esc(f.q)}</div>${f.a ? `<div class="faq__a">${esc(f.a)}</div>` : ""}</div>`)
    .join("");
}

export function buildDossierPages(dossier: Dossier, opts: DossierOpts): string[] {
  const pages: string[] = [];
  const imgs = (opts.images ?? []).filter(Boolean);
  let ptr = 0;
  const img = (): string | undefined => imgs[ptr++];

  const allow = new Set<DossierSection>(opts.sections ?? ALL_DOSSIER_SECTIONS);
  const want = (s: DossierSection): boolean => allow.has(s);

  const country = dossier.country || "";
  const vLabel = titleCase(dossier.vertical);
  const title = dossier.title || "Recommended programme";
  const foot = (section: string) => runningFooter(opts.footLabel, `${section} · Programme dossier`);

  const addFull = (section: string, body: string) => {
    if (body.trim()) pages.push(page({ header: opts.header, body, footer: foot(section) }));
  };
  const addSplit = (section: string, content: string, capTitle?: string) => {
    if (content.trim())
      pages.push(splitPage({ header: opts.header, footer: foot(section), content, imageDataUri: img(), capEyebrow: country || vLabel, capTitle: capTitle ?? title }));
  };
  // Full-width when content is genuinely dense, otherwise a split so the page never looks empty.
  const addAuto = (section: string, content: string, capTitle: string, dense: boolean) => {
    if (dense) addFull(section, content);
    else addSplit(section, content, capTitle);
  };

  // 0 — Full-bleed chapter divider
  if (want("divider"))
    pages.push(imageDividerPage({ imageDataUri: imgs.length > 1 ? img() : undefined, eyebrow: `${vLabel} programme`, title, desc: dossier.tagline }));

  // 1 — Snapshot (facts + natural media card + full-width benefits module)
  if (want("snapshot")) {
    const factCards = [
      card({ k: "Destination", v: country || "To confirm" }),
      card({ k: "Programme type", v: dossier.routeType ? titleCase(String(dossier.routeType).replace(/-/g, " ")) : vLabel }),
      card({ k: "Indicative timeline", v: dossier.timelineLabel || (dossier.timelineMonths ? `${dossier.timelineMonths} months` : "Advisor estimate") }),
      card({ k: "Investment from", v: money(dossier.minInvestment, dossier.currency) }),
    ];
    const benefits = clean(dossier.benefits, 7);
    const tagPills = clean(dossier.tags, 6).map((t) => pill(t, "muted")).join(" ");
    const media = img();
    const mediaCard = media
      ? `<figure class="snapshot-media"><img src="${media}" alt="" /><figcaption><span>${esc(country || vLabel)}</span><strong>${esc(title)}</strong></figcaption></figure>`
      : "";
    const snapshot =
      `<div class="snapshot-page">` +
      sectionHeader({ eyebrow: "About the programme", title: "Programme snapshot", desc: dossier.tagline }) +
      `<div class="snapshot-top"><div class="snapshot-facts">${grid(2, factCards)}</div>${mediaCard}</div>` +
      (benefits.length
        ? `<div class="snapshot-benefits"><div><div class="card__k">Key benefits</div><h3 class="h-sub">Why this route matters</h3></div>${ticks(benefits, benefits.length >= 4)}</div>`
        : "") +
      (tagPills ? `<div class="snapshot-tags">${tagPills}</div>` : "") +
      `</div>`;
    pages.push(page({ header: opts.header, body: snapshot, footer: foot("Snapshot") }));
  }

  // 2 — Eligibility & requirements (full width, dense)
  const requirements = clean(dossier.requirements, 14);
  const pointsRows = (dossier.pointsGrid ?? []).filter((r) => (r.category || "").trim()).slice(0, 12);
  const occBlocks = (dossier.occupationLists ?? [])
    .filter((l) => clean(l.occupations).length)
    .slice(0, 3)
    .map((l) => `<h3 class="h-sub">${esc(l.listName || "Eligible occupations")}</h3>` + ticks(clean(l.occupations, 16)))
    .join("");
  const langTests = clean(dossier.language?.tests, 6);
  const disqualifiers = clean(dossier.disqualifiers, 8);
  // Eligibility — list-based, rendered as an image-panel split so the page is full.
  if (want("eligibility") && (requirements.length || langTests.length || disqualifiers.length)) {
    let body = sectionHeader({ eyebrow: "Eligibility", title: "How you qualify", desc: "The criteria this route is assessed against, subject to confirmation at advisor review." });
    if (requirements.length) body += `<h3 class="h-sub">Core requirements</h3>` + ticks(requirements);
    if (langTests.length || dossier.language?.minLevel)
      body += `<div class="spacer-8"></div><h3 class="h-sub">Language</h3>` + ticks([...langTests, ...(dossier.language?.minLevel ? [`Minimum level: ${dossier.language.minLevel}`] : [])]);
    if (disqualifiers.length) body += `<div class="spacer-16"></div>` + callout({ k: "This route may not fit if", text: disqualifiers.join("  •  ") });
    addSplit("Eligibility", body, "Eligibility");
  }
  // Scoring & occupations — dense, full width, only when present.
  if (want("scoring") && (pointsRows.length || occBlocks)) {
    let body = sectionHeader({ eyebrow: "Scoring", title: "Points & eligible occupations", desc: "How this route is scored and the occupations it covers." });
    if (pointsRows.length) body += table({ head: ["Category", "Max", "Notes"], rows: pointsRows.map((r) => [esc(r.category), esc(String(r.max ?? "To confirm")), esc(r.notes || "")]) });
    if (occBlocks) body += `<div class="spacer-16"></div>` + occBlocks;
    addAuto("Scoring", body, "Scoring & occupations", pointsRows.length >= 6 || Boolean(occBlocks));
  }

  // 3 — Costs & fees (full width, tables)
  const prices = (dossier.prices ?? []).filter((r) => (r.label || "").trim()).slice(0, 14);
  const govFees = (dossier.governmentFees ?? []).filter((r) => (r.label || "").trim()).slice(0, 14);
  const pof = (dossier.proofOfFunds ?? []).filter((r) => (r.label || r.amount) != null).slice(0, 10);
  if (want("costs") && (prices.length || govFees.length || pof.length || (dossier.minInvestment ?? 0) > 0)) {
    const summary =
      sectionHeader({ eyebrow: "Commercial view", title: "Indicative costs & fees", desc: "Programme, government and professional cost lines. Final quotation follows advisor verification." }) +
      bigStats(
        [
          (dossier.minInvestment ?? 0) > 0 ? { k: "Investment from", v: money(dossier.minInvestment, dossier.currency) } : null,
          { k: "Timeline", v: dossier.timelineLabel || (dossier.timelineMonths ? `${dossier.timelineMonths} mo` : "To confirm") },
          typeof dossier.holdingPeriodMonths === "number" && dossier.holdingPeriodMonths > 0 ? { k: "Holding period", v: `${dossier.holdingPeriodMonths} mo` } : null,
        ].filter(Boolean) as { k: string; v: string }[],
      );
    const totalRows = prices.length + govFees.length + pof.length;
    if (totalRows <= 7) {
      let body = summary + `<div class="spacer-16"></div>`;
      if (prices.length)
        body += `<h3 class="h-sub">Programme costs</h3>` + table({ head: ["Item", "Amount", "When / notes"], rows: prices.map((r) => [esc(r.label), esc(money(r.amount, r.currency)), esc([r.when, r.notes].filter(Boolean).join(". "))]) });
      if (govFees.length)
        body += `<div class="spacer-8"></div><h3 class="h-sub">Government / statutory fees</h3>` + table({ head: ["Fee", "Amount", "Source"], rows: govFees.map((r) => [esc(r.label), esc(money(r.amount, r.currency)), esc(r.sourceLabel || "Official schedule")]) });
      if (pof.length)
        body += `<div class="spacer-8"></div><h3 class="h-sub">Proof of funds</h3>` + table({ head: ["Requirement", "Amount", "Notes"], rows: pof.map((r) => [esc(r.label || "Maintained funds"), esc(money(r.amount, r.currency)), esc(r.notes || "")]) });
      addAuto("Costs", body, "Costs & fees", totalRows >= 6);
    } else {
      addFull("Costs", summary + `<div class="spacer-16"></div>` + callout({ k: "Cost review", text: "The cost schedule is split across the following pages so every line remains readable and clear of the footer." }));
      chunk(prices, 6).forEach((rows, i) =>
        addFull(
          "Costs",
          sectionHeader({ eyebrow: i === 0 ? "Programme costs" : "Programme costs continued", title: i === 0 ? "Programme cost lines" : "Programme cost lines continued" }) +
            table({ head: ["Item", "Amount", "When / notes"], rows: rows.map((r) => [esc(r.label), esc(money(r.amount, r.currency)), esc([r.when, r.notes].filter(Boolean).join(". "))]) }),
        ),
      );
      chunk(govFees, 6).forEach((rows, i) =>
        addFull(
          "Costs",
          sectionHeader({ eyebrow: i === 0 ? "Government fees" : "Government fees continued", title: i === 0 ? "Government / statutory fees" : "Government / statutory fees continued" }) +
            table({ head: ["Fee", "Amount", "Source"], rows: rows.map((r) => [esc(r.label), esc(money(r.amount, r.currency)), esc(r.sourceLabel || "Official schedule")]) }),
        ),
      );
      chunk(pof, 6).forEach((rows, i) =>
        addFull(
          "Costs",
          sectionHeader({ eyebrow: i === 0 ? "Proof of funds" : "Proof of funds continued", title: i === 0 ? "Proof-of-funds schedule" : "Proof-of-funds schedule continued" }) +
            table({ head: ["Requirement", "Amount", "Notes"], rows: rows.map((r) => [esc(r.label || "Maintained funds"), esc(money(r.amount, r.currency)), esc(r.notes || "")]) }),
        ),
      );
    }
  }

  // 4 — Documents (full width, chunked) + family
  const docGroups = (dossier.documentChecklist ?? []).filter((g) => clean(g.documents).length);
  if (want("documents") && docGroups.length) {
    const groupsHtml = docGroups.map((g) => {
      const documents = clean(g.documents, 16);
      return {
        html:
          `<h3 class="h-sub">${esc(g.group || "Documents")}</h3>` +
          ticks(documents) +
          (g.notes ? `<p class="muted" style="font-size:11px;margin-top:4px;">${esc(g.notes)}</p>` : ""),
        weight: 1 + Math.ceil(documents.length / 6) + (g.notes ? 0.5 : 0),
      };
    });
    packBlocks(groupsHtml, 11).forEach((gc, i) => {
      const head = i === 0
        ? sectionHeader({ eyebrow: "Upload plan", title: "Documents to prepare", desc: "Collect these in X-Hub before final filing strategy is confirmed. Your list is tailored at advisor review." })
        : sectionHeader({ title: "Documents to prepare (continued)" });
      addFull("Documents", head + gc.map((g) => g.html).join(`<div class="spacer-8"></div>`));
    });
  }
  const fm = dossier.familyMatrix;
  if (want("family") && fm && (fm.spouse != null || fm.childrenUpTo != null || fm.parentsFromAge != null || fm.siblings != null)) {
    const famContent =
      sectionHeader({ eyebrow: "Dependants", title: "Who you can include", desc: "Family inclusion is confirmed against current rules at advisor review." }) +
      grid(2, [
        card({ k: "Spouse / partner", v: fm.spouse ? "Eligible" : "Review with advisor" }),
        card({ k: "Children", v: fm.childrenUpTo ? `Up to age ${fm.childrenUpTo}` : "Review with advisor" }),
        card({ k: "Parents", v: fm.parentsFromAge ? `From age ${fm.parentsFromAge}` : "Case dependent" }),
        card({ k: "Siblings", v: fm.siblings ? "Possible" : "Not typically" }),
      ]);
    addSplit("Family", famContent, "Family inclusion");
  }

  // 5 — Process (split) + projects (full width cards)
  const stepItems = (dossier.processSteps ?? [])
    .filter((s) => (s.title || "").trim())
    .slice(0, 8)
    .map((s) => ({ title: String(s.title), body: String(s.description || "") }));
  if (want("process") && stepItems.length)
    addSplit(
      "Process",
      sectionHeader({ eyebrow: "Execution sequence", title: "How the application progresses", desc: "This sequence is indicative. Government processing and document readiness can change the plan." }) + steps(stepItems),
      "Process timeline",
    );

  const projects = (dossier.projectList ?? []).filter((p) => (p.name || "").trim()).slice(0, 6);
  if (want("projects") && projects.length)
    addSplit(
      "Projects",
      sectionHeader({ eyebrow: "Approved options", title: "Featured investment routes" }) +
        projects
          .map((p) =>
            card({
              k: [p.minBuyIn ? `From ${money(p.minBuyIn)}` : "", p.holdMonths ? `${p.holdMonths}-mo hold` : ""].filter(Boolean).join(" · ") || "Investment option",
              v: String(p.name),
              note: p.notes || "",
            }),
          )
          .join('<div class="spacer-8"></div>'),
      "Investment options",
    );

  // 6 — Risk & compliance (split)
  const risk = clean(dossier.riskNotes, 8);
  const compliance = clean(dossier.complianceNotes, 8);
  const tax = clean(dossier.taxNotes, 6);
  if (want("risk") && (risk.length || compliance.length || tax.length)) {
    let body = sectionHeader({ eyebrow: "Risk & due diligence", title: "What to verify before you commit" });
    if (risk.length) body += `<h3 class="h-sub">Risk notes</h3>` + ticks(risk);
    if (compliance.length) body += `<div class="spacer-8"></div><h3 class="h-sub">Compliance</h3>` + ticks(compliance);
    if (tax.length) body += `<div class="spacer-8"></div><h3 class="h-sub">Tax considerations</h3>` + ticks(tax);
    addSplit("Risk", body, "Due diligence");
  }

  // 7 — FAQ (full width, chunked)
  const faq = (dossier.faq ?? []).filter((f) => (f.q || "").trim());
  if (want("faq") && faq.length) {
    chunk(faq, 6).forEach((fc, i) => {
      const head = i === 0 ? sectionHeader({ eyebrow: "Answers", title: "Frequently asked questions" }) : sectionHeader({ title: "Frequently asked questions (continued)" });
      addAuto("FAQ", head + faqBlock(fc), "Common questions", fc.length >= 4);
    });
  }

  return pages;
}

// Conservative per-page character budgets for rendered prose (tuned to fit one A4 with the
// editorial density; pages clip overflow, so we err toward slightly under-filling).
const PROSE_FIRST_BUDGET = 1450;
const PROSE_CONT_BUDGET = 1950;

// Break a section's markdown into page-sized chunks by paragraph/block so a long narrative
// paginates cleanly instead of overflowing (and being clipped) on one page.
function chunkMarkdown(md: string): string[] {
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length <= 1) return [md.trim()];
  const chunks: string[] = [];
  let cur: string[] = [];
  let len = 0;
  let budget = PROSE_FIRST_BUDGET;
  for (const b of blocks) {
    const bl = proseLength(b) + 40; // overhead for headings/spacing
    if (cur.length && len + bl > budget) {
      chunks.push(cur.join("\n\n"));
      cur = [];
      len = 0;
      budget = PROSE_CONT_BUDGET;
    }
    cur.push(b);
    len += bl;
  }
  if (cur.length) chunks.push(cur.join("\n\n"));
  return chunks;
}

function titleCaseLite(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Render a programme's MDX prose narrative (Overview / Why-country / Investment / etc.) into
 * premium pages — the richest written content on the site, previously discarded. Short
 * sections render as image-panel splits (so they fill); long sections paginate full-width.
 * Returns [] when the programme has no usable prose.
 */
export function programmeNarrativePages(
  dossier: Dossier,
  opts: DossierOpts & { eyebrow?: string; maxSections?: number },
): string[] {
  const body = (dossier.body ?? "").trim();
  if (!body) return [];
  const imgs = (opts.images ?? []).filter(Boolean);
  let ptr = 0;
  const img = (): string | undefined => imgs[ptr++];
  const country = dossier.country || "";
  const eyebrow = opts.eyebrow ?? "Programme insight";
  const foot = (section: string) => runningFooter(opts.footLabel, `${section} · Programme insight`);

  const sections = splitProseSections(body)
    .filter((s) => proseLength(s.md) >= 240)
    .slice(0, opts.maxSections ?? 4);

  const pages: string[] = [];
  for (const sec of sections) {
    const title = titleCaseLite(sec.title);
    const chunks = chunkMarkdown(sec.md);
    chunks.forEach((md, ci) => {
      const head = sectionHeader({
        eyebrow: ci === 0 ? eyebrow : "",
        title: ci === 0 ? title : `${title} (continued)`,
      });
      const content = head + `<div class="prose">${mdToHtml(md)}</div>`;
      // A short, single-chunk section reads thin full-width — render it as an image-panel
      // split so the page stays full; denser narrative uses the full text column.
      if (chunks.length === 1 && proseLength(sec.md) < 850) {
        pages.push(splitPage({ header: opts.header, footer: foot(country || "Insight"), content, imageDataUri: img(), capEyebrow: country || eyebrow, capTitle: title }));
      } else {
        pages.push(page({ header: opts.header, body: content, footer: foot(country || "Insight") }));
      }
    });
  }
  return pages;
}
