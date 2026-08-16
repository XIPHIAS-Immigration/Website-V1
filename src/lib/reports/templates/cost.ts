import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import type { Vertical } from "@/lib/content/types";
import { getProgrammeExplorerData, type ProgrammeExplorerItem } from "@/lib/programme-explorer";
import {
  estimateCost,
  toCostProgram,
  type CostBreakdown,
  type CostProgram,
} from "@/lib/cost-estimator";
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
  reportBasisPage,
  scoreBar,
  sectionHeader,
  splitPage,
  steps,
  table,
  ticks,
} from "../components";
import { renderReportPdf } from "../render";
import { buildCompanyProfilePages } from "../company-profile";
import { allocateReportImages, cleanReportPunctuation } from "./report-depth";
import { assessPersonalisation, buildClientCase, caseCoverProfileLine, reportBasis } from "../client-case";

const TRACKS = new Set<Vertical>(["residency", "citizenship", "skilled", "corporate"]);

const TRACK_LABELS: Record<Vertical, string> = {
  residency: "Residency",
  citizenship: "Citizenship",
  skilled: "Skilled migration",
  corporate: "Corporate mobility",
};

// Representative anchors used only when no catalogue programme matches the order.
const TRACK_DEFAULT_INVESTMENT: Record<Vertical, number> = {
  residency: 250000,
  citizenship: 200000,
  corporate: 50000,
  skilled: 0,
};
const TRACK_DEFAULT_TIMELINE: Record<Vertical, number> = {
  residency: 9,
  citizenship: 8,
  corporate: 3,
  skilled: 12,
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}
function pickEnum<T extends string>(value: unknown, set: Set<T>, fallback: T): T {
  const s = str(value).toLowerCase() as T;
  return set.has(s) ? s : fallback;
}
function toInt(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}
// Acronyms that must stay fully uppercase rather than being title-cased
// (e.g. "uae" → "UAE", not "Uae"; "eb-1a" → "EB-1A").
const ACRONYMS: Record<string, string> = {
  uae: "UAE",
  usa: "USA",
  uk: "UK",
  pr: "PR",
  niw: "NIW",
  eb1a: "EB-1A",
  "eb-1a": "EB-1A",
  o1a: "O-1A",
  "o-1a": "O-1A",
  h1b: "H-1B",
  "h-1b": "H-1B",
};

// Title-case a free-text label while preserving true acronyms in uppercase.
function smartLabel(value: string): string {
  const v = value.trim();
  if (!v) return v;
  const key = v.toLowerCase();
  if (ACRONYMS[key]) return ACRONYMS[key];
  return v
    .split(/(\s+|-)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === "-") return part;
      const lower = part.toLowerCase();
      return ACRONYMS[lower] ?? lower.replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .join("");
}

// Map coded goal/objective answers to proper human-readable labels.
const GOAL_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "work-visa": "Work visa",
  citizenship: "Citizenship",
  investment: "Investment",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};
function goalLabel(value: string): string {
  const key = value.trim().toLowerCase();
  return GOAL_LABELS[key] ?? smartLabel(value.replace(/-/g, " "));
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
function usd(value: number): string {
  return `USD ${Math.max(0, Math.round(value)).toLocaleString("en-US")}`;
}
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function programmeIdentifiers(value: string): string[] {
  return normalize(value).match(/\b(?:subclass\s*)?\d{3}\b|\b(?:eb|o|h)\s*\d+[a-z]?\b/g)?.map((item) => item.replace(/\s+/g, "")) ?? [];
}

type CostInput = {
  track: Vertical;
  programName: string;
  country: string;
  goal: string;
  dependents: number;
  familySize: number;
};

function buildCostInput(order: JiopayOrder): CostInput {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const track = pickEnum<Vertical>(order.track ?? a.track, TRACKS, "residency");

  // Dependents = people in addition to the main applicant. Accept either an explicit
  // dependent count or a total family size (in which case we subtract the main applicant).
  let dependents = toInt(a.dependents, -1);
  if (dependents < 0) {
    const familyTotal = toInt(a.familySize ?? a.family ?? a.familyMembers, -1);
    dependents = familyTotal > 0 ? familyTotal - 1 : 0;
  }
  dependents = Math.max(0, Math.min(8, dependents));

  return {
    track,
    programName: str(order.program ?? a.program ?? order.productName),
    country: str(order.country ?? a.country ?? a.destination),
    goal: str(a.goal ?? a.objective),
    dependents,
    familySize: dependents + 1,
  };
}

/** Find the closest catalogue programme for the order, scoring on name/country/track. */
function matchProgram(input: CostInput, items: ProgrammeExplorerItem[]): ProgrammeExplorerItem | null {
  const wantName = normalize(input.programName);
  const wantCountry = normalize(input.country);
  if (!wantName && !wantCountry) return null;

  let best: ProgrammeExplorerItem | null = null;
  let bestScore = 0;

  for (const item of items) {
    let score = 0;
    const itemName = normalize(item.title);
    const itemCountry = normalize(item.country);
    const requestedIds = programmeIdentifiers(input.programName);
    if (requestedIds.length) {
      const itemIds = new Set(programmeIdentifiers(`${item.title} ${item.id}`));
      if (!requestedIds.some((value) => itemIds.has(value))) continue;
      score += 80;
    }

    if (wantName && itemName === wantName) score += 60;
    else if (wantName && (itemName.includes(wantName) || wantName.includes(itemName))) score += 32;

    if (wantCountry && itemCountry === wantCountry) score += 28;
    else if (wantCountry && (itemCountry.includes(wantCountry) || wantCountry.includes(itemCountry))) score += 16;

    if (item.track === input.track) score += 12;

    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  // Require a meaningful signal (more than just a track match) to claim a match.
  return bestScore >= 24 ? best : null;
}

/** A representative, synthetic programme used when no catalogue match is found. */
function fallbackProgram(input: CostInput): CostProgram {
  const investment = TRACK_DEFAULT_INVESTMENT[input.track];
  const months = TRACK_DEFAULT_TIMELINE[input.track];
  const countryLabel = input.country ? smartLabel(input.country) : "your destination";
  return {
    id: `fallback:${input.track}`,
    title: input.programName ? smartLabel(input.programName) : `${TRACK_LABELS[input.track]} programme`,
    country: countryLabel,
    countrySlug: "",
    track: input.track,
    href: `/${input.track}`,
    investmentUsd: investment,
    investmentLabel: investment > 0 ? usd(investment) : "No investment route",
    timelineMonths: months,
    timelineLabel: months >= 12 ? `${(months / 12).toFixed(months % 12 ? 1 : 0)} years` : `${months} months`,
  };
}

export async function buildCostReport(order: JiopayOrder): Promise<Buffer> {
  const input = buildCostInput(order);
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = allocateReportImages(await loadCountryImages(order.country), "cost", order.merchantTxnNo);

  // Resolve a real programme where possible; otherwise use a representative track estimate.
  let matched: ProgrammeExplorerItem | null = null;
  try {
    matched = matchProgram(input, getProgrammeExplorerData().items);
  } catch {
    matched = null;
  }
  const isFallback = !matched;
  const program: CostProgram = matched ? toCostProgram(matched) : fallbackProgram(input);
  const breakdown: CostBreakdown = estimateCost(program, input.dependents);

  const trackLabel = TRACK_LABELS[program.track] ?? smartLabel(program.track);
  const countryLabel = program.country || (input.country ? smartLabel(input.country) : "Global");
  const objectiveLabel = input.goal ? goalLabel(input.goal) : "";

  const reportTitle = "Cost & Budget Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Cost & Budget", label);
  const head = runningHeader(reportTitle, { country: countryLabel, route: program.title });
  const basisPage = reportBasisPage({ header: head, footer: foot("Case basis"), basis: reportBasis(clientCase, personalisation) });

  // ── Derived budgeting figures ───────────────────────────────────────────────
  const verifiedCosts = clientCase.finances.verifiedCosts.value ?? [];
  const verifiedUsdCosts = verifiedCosts.filter((item) => item.currency.toUpperCase() === "USD");
  const usesVerifiedCosts = verifiedCosts.length > 0 && verifiedUsdCosts.length === verifiedCosts.length;
  const total = usesVerifiedCosts ? verifiedUsdCosts.reduce((sum, item) => sum + item.amount, 0) : breakdown.totalUsd;
  const perApplicant = Math.round(total / Math.max(1, breakdown.familySize));
  const govtItem = breakdown.lineItems.find((i) => i.key === "govt");
  const ddItem = breakdown.lineItems.find((i) => i.key === "due-diligence");
  const depItem = breakdown.lineItems.find((i) => i.key === "dependents");
  const serviceItem = breakdown.lineItems.find((i) => i.key === "service");
  const govtPlusDd = (govtItem?.amountUsd ?? 0) + (ddItem?.amountUsd ?? 0);
  const dependantCost = (depItem?.amountUsd ?? 0) + (ddItem ? Math.round((ddItem.amountUsd / breakdown.familySize) * breakdown.dependents) : 0);
  // A 12% indicative contingency advisors typically reserve for FX, valuations and re-issuance.
  const contingency = Math.round(total * 0.12);
  const allInWithBuffer = total + contingency;

  // Single-applicant baseline (for the family-impact view).
  const soloTotal = estimateCost(program, 0).totalUsd;
  const familyDelta = total - soloTotal;

  // Readiness signals (directional, advisory).
  const familyKnown = clientCase.family.dependants.status !== "unknown" || clientCase.family.included.status !== "unknown";
  const budgetKnown = clientCase.finances.budgetUsd.value !== undefined;
  const fundsKnown = clientCase.finances.availableFundsUsd.value !== undefined || clientCase.finances.sourceOfFunds.status !== "unknown";
  const dataConfidence = isFallback ? 25 : 55;
  const budgetClarity = budgetKnown ? 60 : undefined;
  const timelineClarity = clientCase.objective.timelineMonths.value !== undefined ? 60 : undefined;
  const familyReadiness = familyKnown ? 55 : undefined;
  const fundsReadiness = fundsKnown ? 55 : undefined;
  const readinessParts = [dataConfidence, budgetClarity, timelineClarity, familyReadiness, fundsReadiness].filter((value): value is number => value !== undefined);
  const overallReadiness = clientCase.advisor.riskClarityScore.value ?? (readinessParts.length >= 4 ? Math.round(readinessParts.reduce((sum, value) => sum + value, 0) / readinessParts.length) : undefined);

  // Distinct image-panel picker for the split (editorial two-column) pages. Starts at
  // imgs[3] and cycles so each analytical panel uses a different photo and avoids the
  // cover image (imgs[1]). Returns null when no images exist (splitPage falls back to
  // a full-width page).
  let panelCursor = 3;
  const nextPanel = (): string | null => {
    if (!imgs.length) return null;
    const uri = imgs[panelCursor % imgs.length] ?? imgs[0];
    panelCursor += 1;
    return uri;
  };

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "XIA · Cost & Budget",
    title: "Cost & Budget Report",
    preparedFor: order.customer.name,
    profileLine: caseCoverProfileLine(clientCase),
    subtitle:
      "An itemised, family-tailored cost plan for your chosen route — government fees, due diligence, professional fees and dependant add-ons, with a headline budget you can plan against.",
    chips: [
      `Programme: ${program.title}`,
      `Track: ${trackLabel}`,
      ...(objectiveLabel ? [`Objective: ${objectiveLabel}`] : []),
      `Applicants: ${breakdown.familySize} (you + ${breakdown.dependents})`,
    ],
    fitScore: overallReadiness,
    fitLabel: "Budget readiness",
    countryLabel,
    dateLabel: dateLabel(),
  });

  // 2 — Cost summary (headline total + brief)
  const summaryPage = page({
    header: head,
    body:
      heroBand(imgs[0], {
        eyebrow: `${trackLabel} · Cost & budget`,
        title: countryLabel ? `${program.title} — ${countryLabel}` : program.title,
      }) +
      sectionHeader({
        eyebrow: "Cost summary",
        title: usesVerifiedCosts ? "Your sourced USD budget" : "Your indicative all-in budget",
        desc: `An itemised estimate for ${program.title}${countryLabel ? ` (${countryLabel})` : ""}, sized for ${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"}. Every figure is an advisory planning placeholder confirmed at review.`,
      }) +
      grid(3, [
        card({ k: "Estimated total", v: usd(total), note: `Across ${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"}.` }),
        card({ k: "Per applicant", v: usd(perApplicant), note: "Blended average per person in the application." }),
        card({ k: "With 12% buffer", v: usd(allInWithBuffer), note: "Headroom for FX, valuations and re-issuance." }),
        card({ k: "Programme", v: program.title, note: `${trackLabel} route.` }),
        card({ k: "Country", v: countryLabel, note: isFallback ? "Representative track-level estimate." : "Matched to a XIPHIAS programme." }),
        card({ k: "Indicative timeline", v: breakdown.timelineLabel, note: "Government processing varies by case." }),
      ]) +
      `<div class="spacer-16"></div>` +
      (isFallback
        ? callout({
            k: "Note on this estimate",
            text: `We could not match a precise programme for "${input.programName || "your selection"}", so this report uses a representative ${trackLabel.toLowerCase()} estimate anchored on typical ${trackLabel.toLowerCase()} figures. Share the exact programme with your advisor to refine every line.`,
          })
        : callout({
            k: "How to read this budget",
            text: usesVerifiedCosts ? "The headline total uses the advisor-entered cost items and recorded sources. Confirm that each item remains current before payment." : "The headline total uses an indicative internal planning model. It is not a government fee schedule or binding quote.",
          })),
    footer: foot("02"),
  });

  // 3 — Itemised cost table
  const reportLineItems = usesVerifiedCosts
    ? verifiedUsdCosts.map((item) => ({ label: item.label, amountUsd: item.amount, note: [item.source, item.verifiedAt ? `Verified ${item.verifiedAt}` : ""].filter(Boolean).join(" · ") || "Advisor-entered sourced item." }))
    : breakdown.lineItems;
  const itemRows = reportLineItems.map((item) => [
    `<strong>${esc(item.label)}</strong>`,
    esc(item.note),
    `<span class="num">${esc(usd(item.amountUsd))}</span>`,
    pill(`${clampScore((item.amountUsd / Math.max(1, total)) * 100)}%`, "muted"),
  ]);
  itemRows.push([
    `<strong>Estimated total</strong>`,
    esc(`Indicative all-in cost for ${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"}.`),
    `<span class="num">${esc(usd(total))}</span>`,
    pill("100%", "good"),
  ]);

  const tablePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Itemised breakdown",
        title: "Where every dollar goes",
        desc: "A line-by-line view of the cost components, each shown as a share of your total so you can see what drives the budget.",
      }) +
      bigStats([
        { k: "Estimated total", v: usd(total), n: `${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"}` },
        { k: "Per applicant", v: usd(perApplicant), n: "Blended average" },
        { k: "With 12% buffer", v: usd(allInWithBuffer), n: "Plan against this" },
        { k: "Indicative timeline", v: breakdown.timelineLabel, n: "Govt processing varies" },
      ]) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Cost component", "What it covers", "Indicative cost", "Share"],
        rows: itemRows,
      }) +
      `<div class="spacer-8"></div>` +
      grid(2, [
        card({
          k: "Fees & checks",
          v: usd(govtPlusDd),
          note: "Government, application and due-diligence costs combined — the non-negotiable regulatory layer.",
        }),
        card({
          k: "Professional service",
          v: usd(serviceItem?.amountUsd ?? 0),
          note: "End-to-end XIPHIAS advisory, document readiness and filing coordination.",
        }),
      ]),
    footer: foot("03"),
  });

  // 4 — Cost composition (score bars per component as % of total)
  const compositionPage = splitPage({
    header: head,
    footer: foot("04"),
    imageDataUri: nextPanel(),
    capEyebrow: countryLabel,
    capTitle: "Cost composition",
    content:
      sectionHeader({
        eyebrow: "Composition",
        title: "What shapes your total",
        desc: "Each bar shows a component as a percentage of the estimated total — useful for spotting where the budget concentrates.",
      }) +
      reportLineItems
        .map((item) =>
          scoreBar({
            label: item.label,
            value: (item.amountUsd / Math.max(1, total)) * 100,
            tag: `${usd(item.amountUsd)} · ${Math.round((item.amountUsd / Math.max(1, total)) * 100)}% of total`,
          }),
        )
        .join("") +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Reading the mix",
        text:
          breakdown.baseUsd > 0
            ? "On investment-led routes the qualifying investment usually dominates the total. Government fees, due diligence and the service fee are smaller but mandatory — and due diligence scales with every applicant you add."
            : "On points-based or skilled routes there is no large investment, so government fees and the professional service fee carry most of the budget, with due-diligence costs scaling per applicant.",
      }),
  });

  // 5 — Family-size impact view
  const familyRows: string[][] = [];
  for (let deps = 0; deps <= Math.max(3, breakdown.dependents); deps += 1) {
    const b = estimateCost(program, deps);
    const isCurrent = deps === breakdown.dependents;
    familyRows.push([
      `${deps + 1} ${deps + 1 === 1 ? "applicant" : "applicants"}${isCurrent ? " (your plan)" : ""}`,
      esc(`you + ${deps} ${deps === 1 ? "dependant" : "dependants"}`),
      `<span class="num">${esc(usd(b.totalUsd))}</span>`,
      isCurrent ? pill("Your plan", "good") : pill(`+${usd(b.totalUsd - soloTotal).replace("USD ", "$")}`, deps === 0 ? "muted" : "warn"),
    ]);
  }

  const familyPage = page({
    header: head,
    body:
      heroBand(imgs[2] ?? imgs[1] ?? imgs[0], {
        eyebrow: "Family provisioning",
        title: `Budgeting for ${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"} in ${countryLabel}`,
      }) +
      sectionHeader({
        eyebrow: "Family impact",
        title: "How family size moves the budget",
        desc: "Adding dependants increases due-diligence and government add-on costs. This view models the total at several family sizes so you can plan with confidence.",
      }) +
      grid(3, [
        card({ k: "Single applicant", v: usd(soloTotal), note: "Baseline cost for the main applicant alone." }),
        card({ k: "Your family plan", v: usd(total), note: `You + ${breakdown.dependents} ${breakdown.dependents === 1 ? "dependant" : "dependants"}.` }),
        card({ k: "Cost of dependants", v: usd(familyDelta), note: breakdown.dependents > 0 ? "Added by your dependants over the solo baseline." : "No dependants added in this plan." }),
      ]) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Family size", "Composition", "Estimated total", "Vs. solo"],
        rows: familyRows,
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Dependant economics",
        text: `Each dependant currently adds roughly ${usd(breakdown.dependents > 0 ? Math.round(dependantCost / breakdown.dependents) : (estimateCost(program, 1).totalUsd - soloTotal))} to your total through due-diligence and government add-ons. Confirm exact per-dependant schedules with your advisor.`,
      }),
    footer: foot("05"),
  });

  // 6 — Budget-readiness scorecard
  const scorecardPage = splitPage({
    header: head,
    footer: foot("06"),
    imageDataUri: nextPanel(),
    capEyebrow: trackLabel,
    capTitle: "Budget readiness",
    content:
      sectionHeader({
        eyebrow: "Readiness",
        title: "Your budget-readiness scorecard",
        desc: "Directional advisory signals on how ready this budget is to move forward. Scores improve as you confirm figures and assemble evidence with an advisor.",
      }) +
      (overallReadiness !== undefined ? scoreBar({ label: "Overall budget readiness", value: overallReadiness, tag: "Based only on supplied financial facts" }) : callout({ k: "Budget readiness not scored", text: "Provide budget, available funds, source of funds and exact family composition before assigning a readiness score." })) +
      scoreBar({ label: "Estimate confidence", value: dataConfidence, tag: isFallback ? "Representative track estimate" : "Matched to a programme" }) +
      (budgetClarity !== undefined ? scoreBar({ label: "Budget information", value: budgetClarity, tag: "Client budget supplied" }) : "") +
      (timelineClarity !== undefined ? scoreBar({ label: "Timeline information", value: timelineClarity, tag: breakdown.timelineLabel }) : "") +
      (familyReadiness !== undefined ? scoreBar({ label: "Family information", value: familyReadiness, tag: `${breakdown.familySize} applicant${breakdown.familySize === 1 ? "" : "s"} stated` }) : "") +
      (fundsReadiness !== undefined ? scoreBar({ label: "Source-of-funds information", value: fundsReadiness, tag: "Details supplied; verification pending" }) : ""),
  });

  const readinessNotesPage = page({
    header: head,
    footer: foot("07"),
    body:
      sectionHeader({
        eyebrow: "Score interpretation",
        title: "What your budget readiness means",
        desc: "The score reflects only the financial facts and source material supplied for this case. It is not an approval prediction or a fee quote.",
      }) +
      callout({ k: "Fee basis", text: usesVerifiedCosts ? `This total uses ${verifiedCosts.length} advisor-entered source item${verifiedCosts.length === 1 ? "" : "s"}. Reverify dated sources before payment.` : isFallback ? "This report uses a synthetic track-level planning model because no exact programme matched. Do not use its total as a quote." : "Government, due-diligence and professional-fee components are planning assumptions, not a current government fee schedule. Obtain a dated advisor quote before payment." }) +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Readiness band", v: overallReadiness !== undefined ? `${overallReadiness} / 100` : "Not assessed", note: overallReadiness !== undefined ? pillBand(overallReadiness) : "Financial facts required" }),
        card({ k: "Buffer recommended", v: usd(contingency), note: "12% indicative contingency over the headline total." }),
      ]) +
      `<div class="spacer-16"></div>` +
      ticks([
        "Confirm every government and third-party fee against a dated source before payment.",
        "Document the source and availability of funds needed for the selected route.",
        "Recalculate for currency movement, family changes and programme updates.",
        "Treat any unverified component as a planning placeholder, not a payable amount.",
      ]),
  });

  // 7 — Payment & timeline notes
  const timelinePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Payment & timeline",
        title: "How and when costs fall due",
        desc: "Costs rarely land all at once. This is the typical sequencing so you can stage funds rather than holding the full total upfront.",
      }) +
      steps([
        {
          title: "Engagement & due diligence",
          body: `Professional service fee and due-diligence costs (${usd((serviceItem?.amountUsd ?? 0) + (ddItem?.amountUsd ?? 0))}) are typically the first outlay, before any government commitment.`,
        },
        {
          title: "Application & government fees",
          body: `Government and application fees (${usd(govtItem?.amountUsd ?? 0)}) fall due as your file is prepared and lodged with the authority.`,
        },
        {
          title: "Qualifying investment / contribution",
          body:
            breakdown.baseUsd > 0
              ? `The qualifying investment or contribution (${usd(breakdown.baseUsd)}) is committed only after approval-in-principle on most routes — never at the start.`
              : "This route is points-based with no large qualifying investment, so there is no major investment milestone to fund.",
        },
        {
          title: "Issuance & dependants",
          body:
            breakdown.dependents > 0
              ? `Dependant add-ons (${usd(depItem?.amountUsd ?? 0)}) and issuance fees are settled as residence cards or passports are issued for each family member.`
              : "Final issuance fees are settled as your residence card or passport is issued.",
        },
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Cost risk & due diligence" }) +
      grid(2, [
        card({ k: "Currency & FX", v: "Hold a buffer", note: "Government fees are often set in local currency; FX swings can move your INR/USD total." }),
        card({ k: "Schedules change", v: "Verify before paying", note: "Government fee schedules and quotas change; confirm current figures before any payment." }),
        card({ k: "Source of funds", v: "Evidence early", note: "Investment and many residency routes require a clean, documented funds trail before approval." }),
        card({ k: "Hidden costs", v: "Plan extras", note: "Translation, apostille, medicals, travel and property valuation sit outside this core estimate." }),
      ]),
    footer: foot("07"),
  });

  // 8 — Action plan
  const planPage = splitPage({
    header: head,
    footer: foot("08"),
    imageDataUri: nextPanel(),
    capEyebrow: objectiveLabel || trackLabel,
    capTitle: "Your action plan",
    content:
      sectionHeader({
        eyebrow: "Action plan",
        title: "Turn this budget into a plan",
        desc: "A focused sequence to validate the numbers and stage your funds with confidence.",
      }) +
      steps([
        { title: "Confirm the programme", body: `Lock ${program.title}${countryLabel ? ` in ${countryLabel}` : ""} with an advisor and validate the current fee schedule.` },
        { title: "Verify the figures", body: "Advisor confirms government fees, due-diligence costs and dependant add-ons against today's published schedules." },
        { title: "Stage your funds", body: `Plan against ${usd(allInWithBuffer)} (total plus a 12% buffer) and sequence payments across the milestones above.` },
        { title: "Prepare evidence", body: "Assemble identity, civil and source-of-funds documentation so due diligence and filing run without delay." },
      ]) +
      `<div class="spacer-16"></div>` +
      sectionHeader({ title: "What this estimate includes" }) +
      ticks([
        breakdown.baseUsd > 0 ? `Qualifying investment / contribution (${usd(breakdown.baseUsd)})` : "No large qualifying investment on this route",
        `Government & application fees (${usd(govtItem?.amountUsd ?? 0)})`,
        `Due diligence for ${breakdown.familySize} applicant${breakdown.familySize === 1 ? "" : "s"} (${usd(ddItem?.amountUsd ?? 0)})`,
        breakdown.dependents > 0 ? `Dependant government add-ons (${usd(depItem?.amountUsd ?? 0)})` : "No dependant add-ons (single applicant)",
        `XIPHIAS professional service fee (${usd(serviceItem?.amountUsd ?? 0)})`,
      ]),
  });

  const closeHeading = usesVerifiedCosts
    ? "Reverify the sourced budget before payment"
    : isFallback
      ? "Confirm the programme before using this estimate"
      : "Validate the indicative budget";

  // 9 — Report summary (dark close)
  const closePage = page({
    dark: true,
    body:
      `<div class="eyebrow">Report summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">${esc(closeHeading)}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        `Your indicative all-in budget for ${program.title} is ${usd(total)} for ${breakdown.familySize} ${breakdown.familySize === 1 ? "applicant" : "applicants"}. Plan against ${usd(allInWithBuffer)} with a buffer, then book an advisor review to confirm every figure before you commit funds.`,
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Estimated total", v: usd(total) }),
        card({ dark: true, k: "Budget readiness", v: overallReadiness !== undefined ? `${overallReadiness} / 100` : "Not assessed" }),
        card({ dark: true, k: "Next service", v: "Advisor budget review" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This automated Cost & Budget Report was generated from your submitted inputs and XIPHIAS programme content. It has not been independently verified by an advisor. Unless a line is explicitly labelled as a sourced advisor-entered amount, every figure is an indicative planning assumption. Government fees, due diligence, dependant add-ons and investment thresholds vary by case, route, dependants and current government schedules, and change without notice. This is not legal, financial or tax advice and does not guarantee any government or visa-office decision. All figures must be confirmed by a XIPHIAS advisor before any decision or payment of government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  const bodyHtml = cleanReportPunctuation([
    cover,
    basisPage,
    summaryPage,
    tablePage,
    compositionPage,
    familyPage,
    scorecardPage,
    readinessNotesPage,
    timelinePage,
    planPage,
    ...buildCompanyProfilePages({ header: head, footer: foot }),
    closePage,
  ].join(""));

  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}

function pillBand(score: number): string {
  if (score >= 75) return "Strong — well positioned to plan and proceed.";
  if (score >= 55) return "Moderate — confirm a few figures to firm up the plan.";
  return "Early — refine inputs with an advisor before committing.";
}
