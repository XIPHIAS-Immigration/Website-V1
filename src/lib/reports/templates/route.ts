import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getXiaIntelligenceData } from "@/lib/xia-intelligence";
import {
  scoreProgrammeRoutes,
  type RouteIntelligenceInput,
  type ScoredProgrammeRoute,
} from "@/lib/xia-intelligence-model";
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
  type PillTone,
} from "../components";
import { renderReportPdf } from "../render";
import { buildCompanyProfilePages } from "../company-profile";
import { resolveProgramme } from "@/lib/reports/programme";
import { buildDossierPages } from "../dossier-sections";
import { allocateReportImages, cleanReportPunctuation, depthFor } from "./report-depth";
import { assessPersonalisation, buildClientCase, caseCoverProfileLine, factValue, referenceMatches, reportBasis } from "../client-case";

const GOALS = new Set(["not-sure", "pr", "work-visa", "citizenship", "investment", "business-setup", "family-migration"]);
const PROFILES = new Set(["investor", "entrepreneur", "professional", "family", "company", "remote", "researcher", "student"]);
const TRACKS = new Set(["residency", "citizenship", "corporate", "skilled", "all"]);
const PRESENCE = new Set(["any", "low", "moderate", "high"]);
const PRIORITIES = new Set(["speed", "cost", "mobility", "stability", "tax", "business"]);

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
// Map coded enum values to human labels.
const GOAL_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "work-visa": "Work visa",
  citizenship: "Citizenship",
  investment: "Investment",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};

// True acronyms that should be upper-cased rather than title-cased inside a label.
const ACRONYMS = new Set(["PR", "NIW", "EB-1A", "EB1A", "O-1A", "O1A", "H-1B", "H1B", "UK", "UAE", "USA", "EU", "GCC"]);

// Title-case a phrase while preserving known acronyms in upper-case.
function smartLabel(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const up = word.toUpperCase();
      if (ACRONYMS.has(up)) return up;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function goalLabel(goal: string): string {
  return GOAL_LABELS[goal] ?? smartLabel(goal.replace(/-/g, " "));
}

function buildRouteInput(order: JiopayOrder): RouteIntelligenceInput {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const clientCase = buildClientCase(order);
  return {
    goal: pickEnum(a.goal, GOALS, "not-sure") as RouteIntelligenceInput["goal"],
    track: pickEnum(order.track ?? a.track, TRACKS, "all") as RouteIntelligenceInput["track"],
    destination: str(order.country ?? a.destination ?? a.country),
    profile: pickEnum(a.profile, PROFILES, "professional") as RouteIntelligenceInput["profile"],
    budget: toInt(a.budget ?? a.budgetUsd, 0),
    timeline: toInt(a.timeline ?? a.timelineMonths, 0),
    family: factValue(clientCase.family.included) === true,
    presence: pickEnum(a.presence, PRESENCE, "any") as RouteIntelligenceInput["presence"],
    priority: pickEnum(a.priority, PRIORITIES, "stability") as RouteIntelligenceInput["priority"],
    notes: str(a.notes ?? a.goals),
  };
}

function fitTone(score: number): PillTone {
  if (score >= 75) return "good";
  if (score >= 55) return "warn";
  return "muted";
}
function riskTone(risk: ScoredProgrammeRoute["risk"]): PillTone {
  return risk === "high" ? "bad" : risk === "enhanced" ? "warn" : "good";
}
function fitLabel(score: number): string {
  if (score >= 80) return "Strong fit";
  if (score >= 65) return "Promising fit";
  if (score >= 50) return "Possible fit";
  return "Stretch";
}

function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export async function buildRouteReport(order: JiopayOrder): Promise<Buffer> {
  const depth = depthFor("route");
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  const data = getXiaIntelligenceData();
  const input = buildRouteInput(order);
  const modelCap = clampScore(35 + personalisation.completeness * 0.6);
  const advisorFit = clientCase.advisor.routeFitScore.value;
  const allScored = scoreProgrammeRoutes(data.programme.items, input);
  const selected = clientCase.objective.selectedProgrammes.value ?? [];
  const selectedRoutes = selected.flatMap((name) => {
    const hit = allScored.find((route) => referenceMatches(`${route.id} ${route.title}`, name));
    return hit ? [hit] : [];
  });
  const scored = (selectedRoutes.length
    ? [...selectedRoutes, ...allScored.filter((route) => !selectedRoutes.some((selectedRoute) => selectedRoute.id === route.id))]
    : allScored)
    .slice(0, 4)
    .map((route, index) => ({
      ...route,
      fitScore: index === 0 && advisorFit !== undefined ? clampScore(advisorFit) : Math.min(route.fitScore, modelCap),
    }));
  const top = scored[0];
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = allocateReportImages(await loadCountryImages(order.country), "route", order.merchantTxnNo);

  const reportTitle = "Route Intelligence Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Route Intelligence", label);
  const head = runningHeader(reportTitle, { country: input.destination ? smartLabel(input.destination) : "Global", route: top?.title });
  const basisPage = reportBasisPage({ header: head, footer: foot("Candidate profile"), basis: reportBasis(clientCase, personalisation) });

  const avgTop3 = scored.slice(0, 3).reduce((sum, r) => sum + r.fitScore, 0) / Math.max(1, Math.min(3, scored.length));

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "XIA · Route Intelligence",
    title: "Route Intelligence Report",
    preparedFor: order.customer.name,
    profileLine: caseCoverProfileLine(clientCase),
    subtitle: "A ranked, evidence-led view of the immigration routes that best match your goal, profile, budget and timeline.",
    chips: [
      input.destination ? `Destination: ${smartLabel(input.destination)}` : "Global search",
      `Profile: ${smartLabel(input.profile)}`,
      `Goal: ${goalLabel(input.goal)}`,
    ],
    fitScore: top?.fitScore,
    fitLabel: top ? fitLabel(top.fitScore) : undefined,
    countryLabel: top?.country,
    dateLabel: dateLabel(),
  });

  // 2 — Your brief
  const briefCards = grid(2, [
    card({ k: "Destination", v: input.destination ? smartLabel(input.destination) : "Open / global" }),
    card({ k: "Primary goal", v: goalLabel(input.goal) }),
    card({ k: "Profile", v: smartLabel(input.profile) }),
    card({ k: "Indicative budget", v: input.budget > 0 ? `USD ${input.budget.toLocaleString("en-US")}` : "To confirm" }),
    card({ k: "Timeline", v: input.timeline > 0 ? `${input.timeline} months` : "Not provided" }),
    card({ k: "Family", v: clientCase.family.included.status === "unknown" ? "Not provided" : input.family ? "Including dependants" : "Primary applicant" }),
  ]);
  const briefPage = splitPage({
    header: head,
    footer: foot("02"),
    imageDataUri: imgs[3 % Math.max(1, imgs.length)] ?? imgs[0],
    capEyebrow: input.destination ? "Destination in focus" : "Your global search",
    capTitle: input.destination ? smartLabel(input.destination) : "Global mobility",
    content:
      sectionHeader({
        eyebrow: "Assessment brief",
        title: "What this report is built on",
        desc: "Your route recommendations are scored against approved XIPHIAS programme content using the inputs below. The advisor review confirms final positioning.",
      }) +
      briefCards +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Best next move",
        text: top
          ? `${top.title} (${top.country}) is the highest-ranked working match from the information supplied. It is not a final eligibility decision; resolve the listed limitations and hard eligibility gates first.`
          : "Refine your destination and goal with an advisor to surface a stronger shortlist.",
      }),
  });

  // 3 — Top recommendation
  const topPage = top
    ? page({
        header: head,
        body:
          heroBand(imgs[2] ?? imgs[1] ?? imgs[0], {
            eyebrow: `Primary route · ${smartLabel(top.country)}`,
            title: top.title,
          }) +
          sectionHeader({ eyebrow: "Primary recommendation", title: top.title, desc: top.summary }) +
          grid(3, [
            card({ k: "Country", v: smartLabel(top.country) }),
            card({ k: "Track", v: smartLabel(top.track) }),
            card({ k: "Indicative cost", v: top.investmentLabel || (top.investmentUsd ? `USD ${top.investmentUsd.toLocaleString("en-US")}` : "Advisor quote") }),
            card({ k: "Timeline", v: top.timelineLabel || `${top.timelineMonths} months` }),
            card({ k: "Physical presence", v: smartLabel(top.presence) }),
            card({ k: "Due-diligence", v: smartLabel(top.risk) }),
          ]) +
          `<div class="spacer-16"></div>` +
          scoreBar({ label: "Route fit", value: top.fitScore, tag: fitLabel(top.fitScore) }) +
          `<div class="spacer-8"></div>` +
          `<h3 class="h-sub">Why this route fits you</h3>` +
          ticks(top.reasons.length ? top.reasons.slice(0, 6) : ["Matched against your destination, goal and profile inputs."]) +
          (top.warnings.length
            ? `<div class="spacer-8"></div><h3 class="h-sub">Watch-outs</h3>` + ticks(top.warnings.slice(0, 5))
            : ""),
        footer: foot("03"),
      })
    : "";

  // 4 — Shortlist comparison
  const rows = scored.map((r) => [
    `<strong>${esc(r.title)}</strong>`,
    esc(smartLabel(r.country)),
    esc(smartLabel(r.track)),
    pill(`${clampScore(r.fitScore)}`, fitTone(r.fitScore)),
    esc(r.investmentLabel || (r.investmentUsd ? `USD ${r.investmentUsd.toLocaleString("en-US")}` : "—")),
    esc(r.timelineLabel || `${r.timelineMonths} mo`),
    pill(smartLabel(r.risk), riskTone(r.risk)),
  ]);
  const comparePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Shortlist",
        title: "Your ranked route comparison",
        desc: "The strongest matches for your inputs, ranked by fit score. Scores are directional advisory signals confirmed at advisor review.",
      }) +
      bigStats(
        [
          { k: "Routes assessed", v: String(scored.length), n: "Matched to your brief" },
          top ? { k: "Top fit score", v: `${clampScore(top.fitScore)}`, n: fitLabel(top.fitScore) } : null,
          { k: "Shortlist average", v: `${clampScore(avgTop3)}`, n: "Top three routes" },
          { k: "Primary goal", v: goalLabel(input.goal), n: smartLabel(input.profile) },
        ].filter(Boolean) as { k: string; v: string; n?: string }[],
      ) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Route", "Country", "Track", "Fit", "Indicative cost", "Timeline", "Due-diligence"],
        rows,
      }),
    footer: foot("04"),
  });

  // 4b — Readiness scorecard (own page, image-panel split so it stays full)
  const readinessPage = splitPage({
    header: head,
    footer: foot("05"),
    imageDataUri: imgs[5 % Math.max(1, imgs.length)] ?? imgs[0],
    capEyebrow: "Assessment",
    capTitle: "Readiness scorecard",
    content:
      sectionHeader({
        eyebrow: "Route-fit analytics",
        title: "Readiness scorecard",
        desc: "Directional signals from your inputs and shortlist — where you are strong and where to focus before filing.",
      }) +
      scoreBar({ label: "Top route fit", value: top?.fitScore ?? 60, tag: top ? fitLabel(top.fitScore) : "Refine inputs" }) +
      scoreBar({ label: "Shortlist strength", value: avgTop3, tag: "Average of your top matches" }) +
      (input.budget > 0 ? scoreBar({ label: "Budget information", value: 60, tag: "Amount provided; costs not yet verified" }) : callout({ k: "Budget not assessed", text: "No budget was supplied, so affordability did not contribute a favourable score." })) +
      (input.timeline > 0 ? scoreBar({ label: "Timeline information", value: 60, tag: `${input.timeline}-month preference provided` }) : callout({ k: "Timeline not assessed", text: "No planning window was supplied." })) +
      (clientCase.family.included.status !== "unknown" ? scoreBar({ label: "Family information", value: clientCase.family.details.value || clientCase.family.dependants.value !== undefined ? 65 : 50, tag: input.family ? "Dependants need route-specific review" : "Primary applicant" }) : callout({ k: "Family scope not assessed", text: "Family composition was not confirmed." })),
  });

  // 5 — Why the alternatives fit
  const altCards = scored.slice(1, 4).map((r) =>
    card({
      k: `Fit ${clampScore(r.fitScore)} · ${smartLabel(r.country)}`,
      v: r.title,
      note:
        (r.reasons[0] ? r.reasons[0] : "Matched on your profile and goal.") +
        (r.warnings[0] ? `  Watch-out: ${r.warnings[0]}` : ""),
    }),
  );
  const altPage = scored.length > 1
    ? splitPage({
        header: head,
        footer: foot("06"),
        imageDataUri: imgs[4 % Math.max(1, imgs.length)] ?? imgs[0],
        capEyebrow: "Alternatives",
        capTitle: "Routes worth weighing",
        content:
          sectionHeader({
            eyebrow: "Alternatives",
            title: "Other routes worth weighing",
            desc: "Strong secondary options if your evidence, budget, timing or destination preference shifts.",
          }) + (altCards.length ? `<div class="grid">${altCards.join("")}</div>` : "") +
          `<div class="spacer-16"></div>` +
          callout({
            k: "How to read fit scores",
            text: "Fit reflects how well a route matches your stated inputs — not a guarantee of approval. Evidence quality, current rules and document consistency decide the outcome, which is why advisor verification comes before any filing.",
          }),
      })
    : "";

  // 6 — Action plan + risk
  const planPage = page({
    header: head,
    body:
      sectionHeader({ eyebrow: "Action plan", title: "Your next four moves", desc: "A focused sequence to convert this shortlist into a confirmed route." }) +
      steps([
        { title: "Confirm your shortlist", body: "Review the ranked routes with a XIPHIAS advisor and lock your primary destination and route." },
        { title: "Prepare your profile pack", body: "Assemble CV, identity and civil documents, funds evidence and a destination-specific checklist." },
        { title: "Validate eligibility", body: "Advisor verifies current fees, timelines, quotas and rules for your top route before you commit." },
        { title: "Begin your application", body: "Move into documentation and filing coordination once the route and evidence are confirmed." },
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Risk & due diligence" }) +
      grid(2, [
        card({ k: "Rules change", v: "Verify before filing", note: "Government fees, quotas and timelines shift; confirm current rules at advisor review." }),
        card({ k: "Evidence quality", v: "Strong proof wins", note: "Well-organised, verifiable evidence is the biggest driver of approvals." }),
        card({ k: "Source of funds", v: "Be ready to evidence", note: "Investment and several residency routes require a clean, documented funds trail." }),
        card({ k: "Document consistency", v: "Avoid mismatches", note: "Inconsistent names, dates or histories across documents cause avoidable delays." }),
      ]),
    footer: foot("07"),
  });

  const summaryHeading = !top
    ? "Complete the route profile before deciding"
    : personalisation.completeness >= 80
      ? "Validate the leading route"
      : personalisation.completeness >= 50
        ? "Resolve the open route questions"
        : "Add the missing profile evidence";

  // 7 — Report summary (dark close)
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Report summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">${esc(summaryHeading)}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        top
          ? `${top.title} in ${top.country} is the current working lead based on ${personalisation.completeness}% profile completeness. The next step is to resolve hard eligibility, admissibility and evidence questions before confirming it.`
          : "Refine your destination and goal with an advisor to lock a strong primary route.",
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Primary route", v: top?.title ?? "To confirm" }),
        card({ dark: true, k: "Fit score", v: top ? `${clampScore(top.fitScore)} / 100` : "—" }),
        card({ dark: true, k: "Next service", v: "Advisor strategy call" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This automated report was generated from your submitted inputs and XIPHIAS programme content. It has not been independently verified by an advisor. It is not legal advice and does not guarantee any government or visa-office decision. Fit scores are directional and must be confirmed by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  const routeFootLabel = "XIPHIAS Immigration Private Limited · Route Intelligence";
  const dossier = resolveProgramme({ country: order.country, program: order.program, track: order.track });
  const dossierPages = dossier
    ? [
        ...buildDossierPages(dossier, {
          header: head,
          footLabel: routeFootLabel,
          images: imgs,
          // Mid-tier depth: the core programme picture without the full scoring /
          // document / projects deep-dive reserved for the higher-priced reports.
          sections: [...depth.primaryDossierSections],
        }),
      ]
    : [];

  const companyPages = buildCompanyProfilePages({ header: head, footer: foot });
  const bodyHtml = cleanReportPunctuation([cover, basisPage, briefPage, topPage, comparePage, readinessPage, altPage, planPage, ...dossierPages, ...companyPages, summaryPage].join(""));
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
