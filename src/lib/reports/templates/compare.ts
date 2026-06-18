import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";
import type { ProgrammeRouteSource } from "@/lib/xia-intelligence-model";
import { loadCoverBg, loadCountryImages, loadLogo } from "../assets";
import {
  bigStats,
  callout,
  card,
  clampScore,
  coverPage,
  disclaimer,
  esc,
  grid,
  heroBand,
  page,
  pill,
  runningFooter,
  runningHeader,
  scoreBar,
  sectionHeader,
  splitPage,
  steps,
  table,
  ticks,
  type PillTone,
} from "../components";
import { renderReportPdf } from "../render";
import { resolveProgramme } from "@/lib/reports/programme";
import { buildDossierPages } from "../dossier-sections";

const TRACKS = new Set(["residency", "citizenship", "corporate", "skilled", "all"]);
const PRIORITIES = new Set(["speed", "cost", "mobility", "stability", "tax", "business"]);

type Programme = ProgrammeRouteSource;

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}
function pickEnum(value: unknown, set: Set<string>, fallback: string): string {
  const s = str(value).toLowerCase();
  return set.has(s) ? s : fallback;
}
function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const s = str(value).toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}
function toInt(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

// Acronyms that must stay fully upper-cased rather than title-cased.
const ACRONYMS = new Set(["pr", "niw", "eb-1a", "o-1a", "h-1b", "uk", "uae", "usa", "eu"]);
// Coded answer values (goal / objective) mapped to human labels.
const GOAL_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "work-visa": "Work visa",
  citizenship: "Citizenship",
  investment: "Investment",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};

// Human-friendly label for a possibly-coded value: known goal codes map to a full
// label, true acronyms upper-case, everything else title-cases on word boundaries
// (treating hyphenated codes like "work-visa" as space-separated words).
function properLabel(value: string): string {
  const raw = str(value);
  if (!raw) return "";
  const key = raw.toLowerCase();
  if (GOAL_LABELS[key]) return GOAL_LABELS[key];
  if (ACRONYMS.has(key)) return key.toUpperCase();
  return raw
    .split(/[-\s]+/)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : titleCase(w)))
    .join(" ");
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Parse a list of candidate programme/country references from the order answers.
// Accepts comma / pipe / newline / semicolon separated strings, JSON arrays, or
// any of the common answer keys used across the intake tools.
function parseCandidateList(order: JiopayOrder): string[] {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const out: string[] = [];
  const push = (raw: unknown) => {
    if (Array.isArray(raw)) {
      for (const r of raw) out.push(str(r));
      return;
    }
    const s = str(raw);
    if (!s) return;
    if (s.startsWith("[")) {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) {
          for (const r of parsed) out.push(str(r));
          return;
        }
      } catch {
        // fall through to delimiter split
      }
    }
    for (const part of s.split(/[,|;\n]+/)) {
      const p = part.trim();
      if (p) out.push(p);
    }
  };
  push(a.programmes);
  push(a.programs);
  push(a.compare);
  push(a.options);
  push(a.shortlist);
  push(a.routes);
  push(a.countries);
  // de-duplicate while preserving order
  return Array.from(new Set(out.filter(Boolean)));
}

function matchProgramme(items: Programme[], needle: string): Programme | undefined {
  const n = normalize(needle);
  if (!n) return undefined;
  // exact title, then title contains, then country, then keyword/tag signal
  return (
    items.find((i) => normalize(i.title) === n) ??
    items.find((i) => normalize(i.title).includes(n) || n.includes(normalize(i.title))) ??
    items.find((i) => normalize(i.country) === n || normalize(i.countrySlug) === n) ??
    items.find((i) => normalize(i.country).includes(n) || n.includes(normalize(i.country))) ??
    items.find((i) => normalize(i.keywords).includes(n) || i.tags.some((t) => normalize(t).includes(n)))
  );
}

// Choose 2-4 programmes to compare. Honour explicit picks from the order; otherwise
// anchor on the order's country/programme/track and fill with the closest peers.
function selectProgrammes(order: JiopayOrder, items: Programme[]): Programme[] {
  const picked: Programme[] = [];
  const seen = new Set<string>();
  const add = (p?: Programme) => {
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      picked.push(p);
    }
  };

  for (const ref of parseCandidateList(order)) {
    if (picked.length >= 4) break;
    add(matchProgramme(items, ref));
  }

  // Anchor on the order's own programme / country.
  if (order.program) add(matchProgramme(items, order.program));
  if (picked.length < 2 && order.country) add(matchProgramme(items, order.country));

  const anchor = picked[0];
  const track = pickEnum(order.track ?? (order.answers as Record<string, unknown> | undefined)?.track, TRACKS, "all");

  // Fill with closest peers: prefer same track / same anchor track, then any.
  if (picked.length < 2) {
    const peers = items
      .filter((i) => !seen.has(i.id))
      .sort((p, q) => {
        const score = (x: Programme) => {
          let s = 0;
          if (anchor && x.track === anchor.track) s += 4;
          else if (track !== "all" && x.track === track) s += 3;
          if (anchor && normalize(x.country) === normalize(anchor.country)) s -= 2; // diversify country
          if (x.source === "site-content") s += 1;
          return s;
        };
        return score(q) - score(p);
      });
    for (const p of peers) {
      if (picked.length >= 3) break;
      add(p);
    }
  }

  // Absolute fallback: ensure at least two programmes so the layout never collapses.
  if (picked.length < 2) {
    for (const p of items) {
      if (picked.length >= 2) break;
      add(p);
    }
  }

  return picked.slice(0, 4);
}

// Human label for a programme track code (avoids title-casing raw codes).
function trackLabel(track: Programme["track"]): string {
  return track === "skilled"
    ? "Skilled migration"
    : track === "corporate"
      ? "Corporate mobility"
      : track === "citizenship"
        ? "Citizenship"
        : track === "residency"
          ? "Residency"
          : properLabel(String(track));
}

function presenceLabel(p: Programme["presence"]): string {
  return p === "low"
    ? "Low / minimal"
    : p === "moderate"
      ? "Moderate"
      : p === "high"
        ? "High"
        : "Variable";
}
function presenceTone(p: Programme["presence"]): PillTone {
  return p === "low" ? "good" : p === "moderate" ? "warn" : p === "high" ? "bad" : "muted";
}
function riskLabel(r: Programme["risk"]): string {
  return r === "high" ? "Enhanced+" : r === "enhanced" ? "Enhanced" : "Standard";
}
function riskTone(r: Programme["risk"]): PillTone {
  return r === "high" ? "bad" : r === "enhanced" ? "warn" : "good";
}
function familyTone(f: boolean): PillTone {
  return f ? "good" : "muted";
}
function costLabel(p: Programme): string {
  if (p.investmentLabel) return p.investmentLabel;
  if (p.investmentUsd > 0) return `USD ${p.investmentUsd.toLocaleString("en-US")}`;
  return "No direct investment";
}
function timelineDisplay(p: Programme): string {
  return p.timelineLabel || (p.timelineMonths > 0 ? `${p.timelineMonths} months` : "Case dependent");
}

// A lightweight "fit" signal derived only from the comparison context + stated
// priority — no scoring engine is needed here because the user has already
// pre-selected the programmes they want compared.
function priorityFit(p: Programme, priority: string, budget: number): number {
  let s = 60;
  if (p.source === "site-content") s += 4;
  if (priority === "speed") s += p.timelineMonths <= 6 ? 18 : p.timelineMonths <= 12 ? 8 : -6;
  if (priority === "cost") s += p.investmentUsd <= 0 ? 20 : p.investmentUsd <= 200000 ? 8 : -8;
  if (priority === "mobility") s += p.track === "citizenship" ? 18 : p.track === "residency" ? 6 : -4;
  if (priority === "stability") s += p.track === "residency" ? 14 : p.track === "skilled" ? 8 : 2;
  if (priority === "tax") s += p.presence === "low" ? 14 : p.presence === "moderate" ? 6 : -4;
  if (priority === "business") s += p.track === "corporate" ? 16 : normalize(p.keywords).includes("business") ? 8 : -2;
  if (budget > 0) s += p.investmentUsd <= 0 || budget >= p.investmentUsd ? 10 : budget * 1.25 >= p.investmentUsd ? 3 : -10;
  if (p.risk === "high") s -= 4;
  return clampScore(s);
}

function strengthsFor(p: Programme): string[] {
  const out: string[] = [];
  if (p.investmentUsd <= 0) out.push("No direct capital threshold detected — lower upfront cost barrier.");
  else if (p.investmentUsd <= 200000) out.push(`Mid-tier capital level (${costLabel(p)}) versus most investor routes.`);
  if (p.track === "citizenship") out.push("Pathway oriented toward a second passport and broader mobility.");
  if (p.track === "residency") out.push("Residency-led route designed for stability and renewal-based settlement.");
  if (p.track === "skilled") out.push("Merit / points-based route — no large investment outlay required.");
  if (p.track === "corporate") out.push("Built for company structuring, transfers and business presence.");
  if (p.presence === "low") out.push("Minimal physical-presence expectation — friendlier for globally mobile applicants.");
  if (p.family) out.push("Family inclusion is supported or commonly available.");
  if (p.timelineMonths > 0 && p.timelineMonths <= 6) out.push(`Comparatively fast indicative timeline (${timelineDisplay(p)}).`);
  if (p.source === "site-content") out.push("Backed by an approved XIPHIAS programme page for current positioning.");
  for (const t of p.tags.slice(0, 2)) out.push(`Programme emphasis: ${properLabel(t)}.`);
  return Array.from(new Set(out)).slice(0, 5);
}

function tradeoffsFor(p: Programme): string[] {
  const out: string[] = [];
  if (p.investmentUsd >= 500000) out.push(`Higher capital commitment (${costLabel(p)}) — confirm a clean source-of-funds trail.`);
  if (p.risk === "high") out.push("Enhanced due diligence is likely — expect rigorous background and funds review.");
  else if (p.risk === "enhanced") out.push("Standard enhanced due diligence applies; prepare clean documentation.");
  if (p.presence === "high") out.push("Meaningful physical-presence or settlement expectations apply.");
  if (p.timelineMonths >= 18) out.push(`Longer indicative timeline (${timelineDisplay(p)}); plan around the wait.`);
  if (!p.family) out.push("Family inclusion needs separate advisor review for this route.");
  if (p.source === "catalog") out.push("Catalog route — advisor must verify current government fees and rules before quoting.");
  if (p.presence === "variable") out.push("Presence rules vary by case; confirm the exact obligation with an advisor.");
  return Array.from(new Set(out)).slice(0, 4);
}

export async function buildCompareReport(order: JiopayOrder): Promise<Buffer> {
  const data = getXiaIntelligenceData();
  const items = data.programme.items as Programme[];
  const a = (order.answers ?? {}) as Record<string, unknown>;

  const programmes = selectProgrammes(order, items);
  const priority = pickEnum(a.priority, PRIORITIES, "stability");
  const budget = toInt(a.budget ?? a.budgetUsd, 0);
  const timeline = toInt(a.timeline ?? a.timelineMonths, 12);
  const family = toBool(a.family ?? a.familyMembers);

  // Rank the selected programmes against the user's stated priority + budget.
  const ranked = programmes
    .map((p) => ({ p, fit: priorityFit(p, priority, budget) }))
    .sort((x, y) => y.fit - x.fit);
  const best = ranked[0];
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = await loadCountryImages(order.country);

  const reportTitle = "Programme Comparison Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) =>
    runningFooter("XIPHIAS Immigration Private Limited · Programme Comparison", label);
  const head = runningHeader(reportTitle, {
    country: best ? best.p.country : "Global",
    route: programmes.map((p) => p.country).slice(0, 3).join(" · "),
  });

  const cheapest = [...programmes].sort((x, y) => x.investmentUsd - y.investmentUsd)[0];
  const fastest = [...programmes].sort((x, y) => x.timelineMonths - y.timelineMonths)[0];
  const mostMobile = programmes.find((p) => p.track === "citizenship");
  const avgFit = ranked.reduce((s, r) => s + r.fit, 0) / Math.max(1, ranked.length);

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "XIA · Programme Comparison",
    title: "Programme Comparison Report",
    preparedFor: order.customer.name,
    subtitle:
      "A side-by-side comparison of your shortlisted immigration programmes — cost, timeline, presence, family, due diligence and fit — with a clear recommendation.",
    chips: [
      `${programmes.length} programmes compared`,
      best ? `Lead option: ${properLabel(best.p.country)}` : "Shortlist review",
      `Priority: ${properLabel(priority)}`,
    ],
    fitScore: best?.fit,
    fitLabel: best ? `Top match on your priorities` : undefined,
    countryLabel: best?.p.country,
    dateLabel: dateLabel(),
  });

  // 2 — What we are comparing & why
  const briefCards = grid(3, [
    card({ k: "Programmes compared", v: `${programmes.length} of 4 max` }),
    card({ k: "Decision priority", v: properLabel(priority) }),
    card({ k: "Indicative budget", v: budget > 0 ? `USD ${budget.toLocaleString("en-US")}` : "To confirm" }),
    card({ k: "Planning window", v: `${timeline} months` }),
    card({ k: "Family", v: family ? "Including dependants" : "Primary applicant" }),
    card({ k: "Lead option", v: best ? best.p.title : "To confirm" }),
  ]);
  const briefPage = page({
    header: head,
    body:
      heroBand(imgs[0], {
        eyebrow: "Your shortlist",
        title: best
          ? `Leading toward ${best.p.country}`
          : `${programmes.length} programmes, side by side`,
      }) +
      sectionHeader({
        eyebrow: "Comparison brief",
        title: "What you are comparing — and why",
        desc:
          "This report places your shortlisted programmes side by side against the factors that decide a migration choice: capital, timeline, physical presence, family inclusion and due-diligence intensity. Each is scored against your stated priority so the trade-offs are explicit.",
      }) +
      briefCards +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Programmes in this comparison</h3>` +
      ticks(
        programmes.map(
          (p) =>
            `${p.title} (${properLabel(p.country)}) — ${trackLabel(p.track)}.`,
        ),
      ) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "How to read this report",
        text: best
          ? `On your stated priority of "${priority}", ${best.p.title} (${best.p.country}) leads the shortlist. Use the side-by-side table to weigh it against the alternatives before confirming with an advisor.`
          : "Use the side-by-side table to weigh each option's cost, timeline and obligations before confirming with an advisor.",
      }),
    footer: foot("02"),
  });

  // 3 — Side-by-side comparison table (the core)
  const compareRows: string[][] = [
    ["Country", ...programmes.map((p) => esc(p.country))],
    ["Pathway", ...programmes.map((p) => esc(trackLabel(p.track)))],
    ["Indicative cost", ...programmes.map((p) => esc(costLabel(p)))],
    ["Indicative timeline", ...programmes.map((p) => esc(timelineDisplay(p)))],
    ["Physical presence", ...programmes.map((p) => pill(presenceLabel(p.presence), presenceTone(p.presence)))],
    ["Family inclusion", ...programmes.map((p) => pill(p.family ? "Supported" : "Review", familyTone(p.family)))],
    ["Due diligence", ...programmes.map((p) => pill(riskLabel(p.risk), riskTone(p.risk)))],
    [
      "Fit on your priority",
      ...ranked
        .slice()
        .sort((x, y) => programmes.indexOf(x.p) - programmes.indexOf(y.p))
        .map((r) => pill(`${r.fit}`, r.fit >= 75 ? "good" : r.fit >= 55 ? "warn" : "muted")),
    ],
    ["Evidence basis", ...programmes.map((p) => esc(p.source === "site-content" ? "Approved page" : "Catalog"))],
  ];
  const comparePage = page({
    header: head,
    body:
      bigStats(
        [
          { k: "Programmes compared", v: `${programmes.length}`, n: "side by side" },
          cheapest ? { k: "Lowest indicative cost", v: costLabel(cheapest), n: properLabel(cheapest.country) } : null,
          fastest ? { k: "Fastest indicative timeline", v: timelineDisplay(fastest), n: properLabel(fastest.country) } : null,
          { k: "Average fit", v: `${Math.round(avgFit)}/100`, n: "across this shortlist" },
        ].filter(Boolean) as { k: string; v: string; n?: string }[],
      ) +
      `<div class="spacer-16"></div>` +
      sectionHeader({
        eyebrow: "Side-by-side",
        title: "The full comparison",
        desc: "Each programme scored on the factors that drive the decision. Fit reflects alignment with your stated priority and budget — it is directional and confirmed at advisor review.",
      }) +
      table({
        head: ["Factor", ...programmes.map((p) => p.title)],
        rows: compareRows,
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Reading the table",
        text: `${cheapest ? `Lowest indicative cost: ${cheapest.title} (${cheapest.country}). ` : ""}${fastest ? `Fastest indicative timeline: ${fastest.title} (${fastest.country}). ` : ""}${mostMobile ? `Strongest mobility: ${mostMobile.title}. ` : ""}The recommendation that follows weighs these against your stated priority.`,
      }),
    footer: foot("03"),
  });

  // 4 — Per-programme strengths & trade-offs (paginated, 2 per page)
  const detailPages: string[] = [];
  // Cycle distinct country images for the image-panel pages so the panels vary and
  // never just repeat the cover image (imgs[1]). Start at imgs[3] per the design.
  let splitImg = 3;
  const nextSplitImg = (): string | undefined =>
    imgs.length ? imgs[splitImg++ % imgs.length] : undefined;

  for (let i = 0; i < programmes.length; i += 2) {
    const slice = programmes.slice(i, i + 2);
    const pageIndex = 4 + i / 2;
    const blocks = slice
      .map((p) => {
        const fit = ranked.find((r) => r.p.id === p.id)?.fit ?? 60;
        const tradeoffs = tradeoffsFor(p).slice(0, 3);
        return (
          `<h3 class="h-sub">${esc(p.title)} <span class="muted">· ${esc(properLabel(p.country))}</span></h3>` +
          `<div class="spacer-8"></div>` +
          scoreBar({ label: `${properLabel(p.country)} fit on "${priority}"`, value: fit, tag: fit >= 75 ? "Strong alignment" : fit >= 55 ? "Workable alignment" : "Stretch — verify trade-offs" }) +
          `<div class="spacer-8"></div>` +
          `<h4 class="h-sub" style="font-size:14px;">Strengths</h4>` +
          ticks(strengthsFor(p).slice(0, 3)) +
          `<div class="spacer-8"></div>` +
          `<h4 class="h-sub" style="font-size:14px;">Trade-offs to weigh</h4>` +
          ticks(tradeoffs.length ? tradeoffs : ["No material trade-offs flagged from the available data; advisor confirms final rules."]) +
          `<div class="spacer-16"></div>`
        );
      })
      .join("");
    const heading =
      i === 0
        ? sectionHeader({
            eyebrow: "Deep dive",
            title: "Strengths & trade-offs, programme by programme",
            desc: "What each option does well, and what to weigh before you commit. Use these against your own priorities.",
          })
        : sectionHeader({ title: "Strengths & trade-offs (continued)" });
    const footer = foot(String(pageIndex).padStart(2, "0"));
    if (slice.length === 1) {
      // A single-programme page would leave the lower third empty — render it as a
      // full-height image-panel split so the page stays full and premium.
      const only = slice[0];
      detailPages.push(
        splitPage({
          header: head,
          footer,
          content: heading + blocks,
          imageDataUri: nextSplitImg(),
          capEyebrow: properLabel(only.country),
          capTitle: only.title,
        }),
      );
    } else {
      detailPages.push(page({ header: head, body: heading + blocks, footer }));
    }
  }

  // 5 — Best for you (recommendation + rationale)
  const others = ranked.slice(1);
  const recoPage = page({
    header: head,
    body:
      heroBand(imgs[2] ?? imgs[1] ?? imgs[0], {
        eyebrow: "Recommended destination",
        title: best ? properLabel(best.p.country) : "Your lead option",
      }) +
      sectionHeader({
        eyebrow: "Recommendation",
        title: best ? `Best for you: ${best.p.title}` : "Best for you",
        desc: best
          ? `Across your shortlist, ${best.p.country} aligns most closely with a "${priority}" priority${budget > 0 ? ` and a USD ${budget.toLocaleString("en-US")} budget` : ""}.`
          : "Refine your shortlist with an advisor to surface a clear lead option.",
      }) +
      (best
        ? grid(3, [
            card({ k: "Recommended route", v: best.p.title }),
            card({ k: "Country", v: best.p.country }),
            card({ k: "Fit on your priority", v: `${best.fit} / 100` }),
            card({ k: "Indicative cost", v: costLabel(best.p) }),
            card({ k: "Indicative timeline", v: timelineDisplay(best.p) }),
            card({ k: "Due diligence", v: riskLabel(best.p.risk) }),
          ])
        : "") +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Why it leads your shortlist</h3>` +
      ticks(best ? strengthsFor(best.p) : ["Confirm your priority and budget to rank the shortlist."]) +
      (others.length
        ? `<div class="spacer-16"></div>` +
          `<h3 class="h-sub">When an alternative may win instead</h3>` +
          ticks(
            others.slice(0, 3).map((r) => {
              const p = r.p;
              const angle =
                cheapest && cheapest.id === p.id
                  ? "if upfront cost is the deciding factor"
                  : fastest && fastest.id === p.id
                    ? "if speed to status matters most"
                    : p.track === "citizenship"
                      ? "if a second passport and mobility are the goal"
                      : p.presence === "low"
                        ? "if you need minimal physical presence"
                        : "if its specific profile fits your circumstances better";
              return `${p.title} (${p.country}) — choose this ${angle} (fit ${r.fit}).`;
            }),
          )
        : "") +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Confidence note",
        text: "Fit scores are directional signals based on your inputs and approved programme content. The final choice depends on current government rules, fees and the strength of your evidence — all confirmed at advisor review before any filing.",
      }),
    footer: foot(String(4 + Math.ceil(programmes.length / 2)).padStart(2, "0")),
  });

  // 6 — Decision scorecard + checklist + action plan
  const planPageNo = String(5 + Math.ceil(programmes.length / 2)).padStart(2, "0");
  const planPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Decide with confidence",
        title: "Your decision checklist & action plan",
        desc: "The questions to settle, and the sequence to convert your choice into a confirmed route.",
      }) +
      sectionHeader({ title: "Decision checklist" }) +
      ticks([
        "Confirm which single factor matters most: cost, speed, mobility, stability, tax presence or business.",
        "Verify the current government fees, quotas and timelines for your lead option before committing.",
        "Confirm family inclusion rules and any dependant age limits for the route you choose.",
        "Assemble a clean, documented source-of-funds trail for any investment-based option.",
        "Check physical-presence and renewal obligations against your lifestyle and work plans.",
        "Lock your primary route with an advisor and keep a ranked backup from this shortlist.",
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Your next four moves" }) +
      steps([
        { title: "Confirm your priority", body: "Settle the single factor that decides this choice for you, then re-read the side-by-side table through that lens." },
        { title: "Validate the lead option", body: `Have a XIPHIAS advisor verify current rules, fees and eligibility for ${best ? best.p.title : "your lead programme"}.` },
        { title: "Prepare your evidence pack", body: "Assemble identity, civil, funds and profile documents tailored to the chosen route's requirements." },
        { title: "Begin your application", body: "Move into documentation and filing coordination once the route and evidence are confirmed." },
      ]),
    footer: foot(planPageNo),
  });

  // 7 — Advisor summary (dark close)
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Advisor summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">Choose with clarity</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        best
          ? `On your stated priorities, ${best.p.title} in ${best.p.country} is the strongest fit across this shortlist. The next step is an advisor review to confirm current rules and build your evidence plan — keeping a ranked alternative ready.`
          : "Refine your shortlist and priority with an advisor to lock a clear lead option.",
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Recommended route", v: best ? best.p.title : "To confirm" }),
        card({ dark: true, k: "Fit on your priority", v: best ? `${best.fit} / 100` : "—" }),
        card({ dark: true, k: "Next service", v: "Advisor strategy call" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This report is an advisory comparison prepared from your submitted inputs and XIPHIAS programme content. It is not legal advice and does not guarantee any government or visa-office decision. Costs, timelines and fit scores are indicative and directional; they must be confirmed by a XIPHIAS advisor against current rules before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  // The side-by-side comparison is this report's value; append only a brief snapshot of
  // the lead programme rather than the full dossier (kept for the higher-priced reports).
  const dossier = resolveProgramme({ country: order.country, program: order.program, track: order.track });
  const dossierPages = dossier
    ? buildDossierPages(dossier, {
        header: head,
        footLabel: "XIPHIAS Immigration Private Limited · Programme Comparison",
        images: imgs,
        sections: ["divider", "snapshot"],
      })
    : [];

  const bodyHtml = [cover, briefPage, comparePage, ...detailPages, recoPage, planPage, ...dossierPages, summaryPage].join("");
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
