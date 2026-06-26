import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { resolveProgrammes } from "@/lib/reports/programme";
import { buildDossierPages, programmeNarrativePages, type DossierSection } from "../dossier-sections";
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
} from "../components";
import { renderReportPdf } from "../render";

// The flagship eligibility report (product premium_report), rebuilt on the premium
// framework so it shares the same full-page editorial design as the other reports and
// carries the full programme dossier. Replaces the older premium-report.js engine.

const ACRONYMS = new Set(["pr", "niw", "eb-1a", "eb-1", "eb-2", "eb-3", "eb-5", "o-1a", "o-1", "h-1b", "l-1", "uk", "uae", "usa", "us", "eu", "uscis", "ec a", "eca"]);
const GOAL_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "permanent-residency": "Permanent residency",
  "work-visa": "Work visa",
  "work-permit": "Work permit",
  citizenship: "Citizenship",
  investment: "Investment migration",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};
const PROFILE_LABELS: Record<string, string> = {
  investor: "Investor",
  entrepreneur: "Entrepreneur / business owner",
  professional: "Skilled professional",
  family: "Family applicant",
  company: "Corporate / company-sponsored",
  remote: "Remote professional",
  researcher: "Researcher / academic",
  student: "Student",
};
const PRESENCE_LABELS: Record<string, string> = {
  low: "Minimal physical presence",
  moderate: "Moderate presence",
  high: "Full relocation",
  any: "Flexible on presence",
};
const PRIORITY_LABELS: Record<string, string> = {
  speed: "Speed to status",
  cost: "Lowest cost",
  mobility: "Global mobility",
  stability: "Long-term stability",
  tax: "Tax efficiency",
  business: "Business growth",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}
function num(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
function smartLabel(value: string): string {
  return value
    .split(/\s+/)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.replace(/\b\w/g, (c) => c.toUpperCase())))
    .join(" ")
    .trim();
}
function goalLabel(value: unknown): string {
  const s = str(value).toLowerCase();
  if (!s) return "";
  return GOAL_LABELS[s] ?? smartLabel(s.replace(/-/g, " "));
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
function fitWord(score: number): string {
  if (score >= 80) return "Strong route-fit";
  if (score >= 65) return "Promising route-fit";
  if (score >= 50) return "Possible route-fit";
  return "Advisor review";
}

export async function buildPremiumStrategyReport(order: JiopayOrder): Promise<Buffer> {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const country = order.country || str(a.country) || str(a.destination) || str(a.countryFocus);
  const programName = order.program || str(a.recommendedProgram) || str(a.program);
  // Carry the primary route plus its strongest alternative (each with full dossier +
  // prose narrative) so the flagship report has real programme depth, not one route.
  const dossiers = resolveProgrammes({ country, program: programName, track: order.track }, 2);
  const dossier = dossiers[0] ?? null;
  const route = dossier?.title || (programName ? smartLabel(programName) : "Advisor-led route");
  const countryLabel = smartLabel(country) || dossier?.country || "Global mobility";

  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = await loadCountryImages(country || dossier?.country);

  const fit = clampScore(num(a.fitScore) ?? num(a.score) ?? num(a.routeFit) ?? 82, 82);
  const hasFamily = Boolean(str(a.family) || str(a.familyMembers));
  const scores = {
    routeFit: fit,
    evidence: clampScore(num(a.evidenceStrength) ?? 68, 68),
    docs: clampScore(num(a.documentReadiness) ?? 56, 56),
    risk: clampScore(num(a.riskClarity) ?? 72, 72),
    family: hasFamily ? 70 : 62,
  };

  const reportTitle = "Personal Immigration Strategy Report";
  const ref = order.merchantTxnNo;
  const head = runningHeader(reportTitle, { country: countryLabel, route });
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Personal Strategy", label);
  let panel = 3;
  const nextImg = (): string | undefined => (imgs.length ? imgs[panel++ % imgs.length] : undefined);

  const goal = goalLabel(a.goals ?? a.objective ?? a.goal ?? order.track);
  const profileKey = str(a.profile ?? a.applicantProfile).toLowerCase();
  const profileLabel = PROFILE_LABELS[profileKey] || (profileKey ? smartLabel(profileKey) : "Private client");
  const presenceKey = str(a.presence).toLowerCase();
  const presenceLabel = PRESENCE_LABELS[presenceKey] || "Flexible on presence";
  const priorityKey = str(a.priority).toLowerCase();
  const priorityLabel = PRIORITY_LABELS[priorityKey] || "Long-term stability";
  const timelineMonths = num(a.timeline ?? a.timelineMonths) ?? dossier?.timelineMonths ?? 12;
  const budget = num(a.budget ?? a.budgetUsd) ?? 0;
  const budgetLabel = budget > 0 ? `~ USD ${Math.round(budget).toLocaleString("en-US")}` : "To confirm at review";
  const benefits = (dossier?.benefits ?? []).map((b) => String(b ?? "").trim()).filter(Boolean).slice(0, 5);
  const tagline = dossier?.tagline || `An advisor-led ${route} strategy for ${countryLabel}.`;

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "Private Client Assessment",
    title: reportTitle,
    preparedFor: order.customer.name,
    subtitle: `A focused recommendation for ${countryLabel} immigration planning.`,
    chips: [route, goal || "Advisor-led plan", dateLabel()].filter(Boolean),
    fitScore: fit,
    fitLabel: fitWord(fit),
    countryLabel,
    dateLabel: dateLabel(),
  });

  // 2 — Executive recommendation (split, fills via image panel)
  const execContent =
    sectionHeader({
      eyebrow: "Recommended direction",
      title: route,
      desc: dossier?.tagline || `XIPHIAS recommends an advisor-led ${route} evidence review before full filing preparation.`,
    }) +
    grid(2, [
      card({ k: "Country", v: countryLabel }),
      card({ k: "Recommended route", v: route }),
      card({ k: "Objective", v: goal || "Advisor-led plan" }),
      card({ k: "Family", v: hasFamily ? "Dependants in scope" : "Primary applicant" }),
    ]) +
    `<div class="spacer-16"></div>` +
    callout({
      k: "Working result",
      text: `${fitWord(fit)} (${fit}/100). Your profile can support this route once the evidence pack and document set are confirmed at advisor review.`,
    });
  const execPage = splitPage({ header: head, footer: foot("02"), content: execContent, imageDataUri: nextImg(), capEyebrow: "Recommended route", capTitle: route });

  // 3 — Readiness scorecard (split)
  const scoreContent =
    sectionHeader({ eyebrow: "Route-fit analytics", title: "Readiness scorecard", desc: "Directional advisory signals. The advisor review decides the final evidence positioning." }) +
    scoreBar({ label: "Route fit", value: scores.routeFit, tag: fitWord(scores.routeFit) }) +
    scoreBar({ label: "Evidence strength", value: scores.evidence, tag: scores.evidence >= 70 ? "Strong" : "Build proof" }) +
    scoreBar({ label: "Document readiness", value: scores.docs, tag: scores.docs >= 70 ? "On track" : "Collect & verify" }) +
    scoreBar({ label: "Risk clarity", value: scores.risk, tag: "Review with advisor" }) +
    scoreBar({ label: "Family readiness", value: scores.family, tag: hasFamily ? "Dependants in scope" : "Primary applicant" }) +
    `<div class="spacer-16"></div>` +
    callout({ k: "Best next move", text: "Complete the evidence matrix and confirm your route positioning with a XIPHIAS advisor before filing." });
  const scorePage = splitPage({ header: head, footer: foot("03"), content: scoreContent, imageDataUri: nextImg(), capEyebrow: "Assessment dashboard", capTitle: "Readiness scorecard" });

  // 4 — Your profile at a glance (split)
  const profileContent =
    sectionHeader({ eyebrow: "Client profile", title: "Your profile at a glance", desc: "The inputs behind this recommendation — and what each one signals for your route." }) +
    grid(2, [
      card({ k: "Primary objective", v: goal || "Advisor-led plan", note: "The outcome your plan is optimised toward." }),
      card({ k: "Applicant profile", v: profileLabel, note: "Determines which programme families fit best." }),
      card({ k: "Planning window", v: `${timelineMonths} months`, note: "Your target timeline to a confirmed status." }),
      card({ k: "Indicative budget", v: budgetLabel, note: "Anchors the cost modelling and route shortlist." }),
      card({ k: "Family", v: hasFamily ? "Including dependants" : "Primary applicant", note: hasFamily ? "Dependant inclusion factored into the plan." : "Can be extended to family later." }),
      card({ k: "Decision priority", v: priorityLabel, note: "The single factor weighted most heavily." }),
    ]) +
    `<div class="spacer-16"></div>` +
    callout({ k: "What this means for you", text: `As a ${profileLabel.toLowerCase()} prioritising ${priorityLabel.toLowerCase()}, ${route} in ${countryLabel} is the route that best balances your objective, budget and timeline — detailed in full across this report.` });
  const profilePage = splitPage({ header: head, footer: foot("04"), content: profileContent, imageDataUri: nextImg(), capEyebrow: "Private client", capTitle: profileLabel });

  // 5 — How this strategy was built (split, methodology)
  const methodologyContent =
    sectionHeader({ eyebrow: "Our method", title: "How this strategy was built", desc: "A transparent view of the steps behind your personalised recommendation." }) +
    steps([
      { title: "Profile intake", body: "Your objective, profile, budget, timeline and family position were captured from your assessment responses." },
      { title: "Route matching", body: `Your profile was matched against XIPHIAS programme content to surface ${route} as the strongest-fit route for ${countryLabel}.` },
      { title: "Readiness scoring", body: "Route fit, evidence strength, document readiness, risk clarity and family readiness were scored to show where to focus." },
      { title: "Cost & timeline modelling", body: "Indicative programme, government and professional costs were mapped against your planning window." },
      { title: "Advisor validation", body: "Every figure and requirement in this report is confirmed by a XIPHIAS advisor against current rules before you file." },
    ]);
  const methodologyPage = splitPage({ header: head, footer: foot("05"), content: methodologyContent, imageDataUri: nextImg(), capEyebrow: "Methodology", capTitle: "How we built this" });

  // 6 — Why this route fits you (full, rationale)
  const reasons = (benefits.length
    ? benefits
    : [
        `${route} aligns with a ${priorityLabel.toLowerCase()} priority for globally mobile applicants.`,
        `Your ${profileLabel.toLowerCase()} profile maps to this route's core eligibility.`,
        `The indicative timeline fits inside your ${timelineMonths}-month planning window.`,
      ]
  ).map((r) => String(r));
  const whyFitsPage = page({
    header: head,
    body:
      heroBand(nextImg(), { eyebrow: "Strategic rationale", title: `Why ${route} fits you` }) +
      sectionHeader({ eyebrow: "Why this route", title: `The case for ${countryLabel}`, desc: tagline }) +
      `<h3 class="h-sub">What makes this route right for your profile</h3>` +
      ticks(reasons) +
      `<div class="spacer-16"></div>` +
      grid(3, [
        card({ k: "Recommended route", v: route }),
        card({ k: "Route fit", v: `${fit} / 100`, note: fitWord(fit) }),
        card({ k: "Decision priority", v: priorityLabel }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "The bottom line", text: `On your stated priority of ${priorityLabel.toLowerCase()}, ${route} in ${countryLabel} is the route that converts your profile into a credible, advisor-backed plan with the fewest open risks.` }),
    footer: foot("06"),
  });

  // 7 — Eligibility self-check (full, actionable matrix — distinct from the dossier's
  // descriptive eligibility list: this is a personal "can you evidence it?" tracker).
  const reqs = (dossier?.requirements ?? []).map((r) => String(r ?? "").trim()).filter(Boolean).slice(0, 8);
  const disq = (dossier?.disqualifiers ?? []).map((d) => String(d ?? "").trim()).filter(Boolean).slice(0, 4);
  const selfCheckPage = reqs.length
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "Eligibility self-check",
            title: "Can you evidence each requirement?",
            desc: `Work through each criterion for ${route}. Note where you are strong and where you need to build proof — your advisor confirms the rest at review.`,
          }) +
          table({
            head: ["Requirement", "Your status", "Evidence to show"],
            rows: reqs.map((r) => [esc(r), pill("Confirm", "warn"), `<span class="muted">To prepare</span>`]),
          }) +
          `<div class="spacer-16"></div>` +
          callout({ k: "How to use this", text: "Bring this completed self-check to your advisor strategy call. The gaps you flag here are exactly what we close before filing." }) +
          `<div class="spacer-24"></div>` +
          sectionHeader({ eyebrow: "Evidence quality", title: "What strong evidence looks like" }) +
          ticks([
            "Independent and verifiable — backed by third parties, not just your own statements.",
            "Consistent — names, dates and roles match across every document you submit.",
            "Quantified — achievements shown with numbers, outcomes and credible references.",
            "Current — assessments, tests and clearances are within their validity windows.",
          ]) +
          (disq.length
            ? `<div class="spacer-16"></div>` + callout({ k: "Common reasons this route is refused", text: disq.join("  •  ") })
            : ""),
        footer: foot("07"),
      })
    : "";

  // 8+ — Full programme dossier(s) + prose narrative. The primary route gets the full
  // dossier; an alternative route (if found) gets a focused dossier so the report compares
  // real options. Each programme also contributes its page narrative (the site write-up).
  const footLabel = "XIPHIAS Immigration Private Limited · Personal Strategy";
  const ALT_SECTIONS: DossierSection[] = ["divider", "snapshot", "eligibility", "costs", "family", "risk"];
  const dossierPages = dossiers.flatMap((d, idx) => [
    ...buildDossierPages(d, { header: head, footLabel, images: imgs, sections: idx === 0 ? undefined : ALT_SECTIONS }),
    ...programmeNarrativePages(d, { header: head, footLabel, images: imgs, maxSections: idx === 0 ? 4 : 2 }),
  ]);

  // Milestone plan — month-by-month (full, distinct from the 90-day roadmap)
  const milestonePage = page({
    header: head,
    body:
      heroBand(nextImg(), { eyebrow: "Timeline", title: "Your 12-month milestone plan" }) +
      sectionHeader({
        eyebrow: "Milestones",
        title: `A month-by-month path to ${countryLabel}`,
        desc: `Indicative milestones for ${route}, paced across your ${timelineMonths}-month planning window. Government processing can shift dates — your advisor keeps the plan live in X-Hub.`,
      }) +
      table({
        head: ["Window", "Focus", "Milestone"],
        rows: [
          ["Month 1", "Confirm", "Advisor strategy call; route and evidence plan locked."],
          ["Months 1-2", "Mobilise", "Long-lead documents ordered; secure X-Hub file opened."],
          ["Months 2-4", "Assemble", "Identity, civil, professional and funds evidence gathered."],
          ["Months 4-5", "Engineer", "Evidence shaped to the route's tests; case narrative drafted."],
          ["Months 5-6", "Verify", "Advisor review; certify and translate; finalise the pack."],
          ["Months 6+", "File & track", "Submission, government correspondence and follow-ups managed for you."],
        ].map((r) => r.map(esc)),
      }) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Stay on track", text: "Every milestone has a clear owner and document set in X-Hub, so nothing stalls in the gaps between steps." }),
    footer: foot("Timeline"),
  });

  // Advisor-prep (split) — high-leverage questions to bring to the strategy call
  const advisorPrepContent =
    sectionHeader({ eyebrow: "Prepare", title: "Questions to raise with your advisor", desc: "Make your strategy call count — these are the highest-leverage questions for your route." }) +
    ticks([
      `What is the strongest evidence angle for ${route} given my profile?`,
      "Which of my requirements are most likely to draw scrutiny, and how do we pre-empt it?",
      "What is the realistic all-in cost, including government and professional fees?",
      "What is the fastest credible timeline, and what could delay it?",
      hasFamily ? "How and when are my dependants added to the application?" : "Can this route be extended to my family later, and how?",
      "What is my backup route if my circumstances or the rules change?",
    ]) +
    `<div class="spacer-16"></div>` +
    callout({ k: "Bring these to your call", text: "Your advisor works through each question against current rules and your evidence, then turns the answers into your filing plan." });
  const advisorPrepPage = splitPage({ header: head, footer: foot("Advisor prep"), content: advisorPrepContent, imageDataUri: nextImg(), capEyebrow: "Strategy call", capTitle: "Come prepared" });

  // Roadmap — your next 90 days (full)
  const roadmapPage = page({
    header: head,
    body:
      heroBand(nextImg(), { eyebrow: "Action plan", title: "Your next 90 days" }) +
      sectionHeader({ eyebrow: "Roadmap", title: `From assessment to filing`, desc: `A focused sequence to move ${route} from this strategy into a confirmed, document-ready application.` }) +
      steps([
        { title: "Book your advisor strategy call", body: `Confirm ${route} eligibility, lock the evidence plan and finalise the cost schedule with a XIPHIAS advisor.` },
        { title: "Open your evidence file", body: "Begin assembling identity, civil, professional and funds documents in X-Hub, prioritising long-lead items." },
        { title: "Order long-lead documents", body: "Police clearances, credential assessments and any language tests are requested first — issuers control the timing." },
        { title: "Build the funds & source-of-funds trail", body: budget > 0 ? `Document the ${budgetLabel} clearly with a clean, traceable origin for every figure.` : "Document maintained balances with a clean, traceable origin for every figure." },
        { title: "Advisor verification & filing", body: "Your complete pack is reviewed against current rules, then filing is coordinated end-to-end." },
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Suggested cadence" }) +
      grid(3, [
        card({ k: "Weeks 1-3", v: "Confirm & order", note: "Strategy call, then order long-lead documents immediately." }),
        card({ k: "Weeks 3-8", v: "Assemble the pack", note: "Identity, civil, professional and funds evidence." }),
        card({ k: "Weeks 8-12", v: "Verify & file", note: "Certify, translate, advisor review, then file." }),
      ]),
    footer: foot("Roadmap"),
  });

  // What XIPHIAS delivers (split)
  const deliversContent =
    sectionHeader({ eyebrow: "Your engagement", title: "What XIPHIAS delivers", desc: "Beyond this report, your engagement converts strategy into a filed, defensible application." }) +
    grid(2, [
      card({ k: "Dedicated case advisor", v: "One point of contact", note: "A named advisor owns your file from strategy to decision." }),
      card({ k: "Evidence engineering", v: "Built, not collected", note: "We shape your evidence to the route's exact tests, not a generic list." }),
      card({ k: "Document verification", v: "Pre-filing review", note: "Every document is checked for consistency and validity before it is filed." }),
      card({ k: "Filing coordination", v: "End to end", note: "Submission, government correspondence and follow-ups are managed for you." }),
    ]) +
    `<div class="spacer-16"></div>` +
    callout({ k: "Why it matters", text: "Most refusals trace to weak or inconsistent evidence — not ineligibility. A managed engagement closes exactly those gaps before they reach a case officer." });
  const deliversPage = splitPage({ header: head, footer: foot("Engagement"), content: deliversContent, imageDataUri: nextImg(), capEyebrow: "XIPHIAS service", capTitle: "What we deliver" });

  // Engagement options (full)
  const engagementPage = page({
    header: head,
    body:
      sectionHeader({ eyebrow: "Next step", title: "Your engagement options", desc: "Choose the level of support that fits where you are in your journey." }) +
      grid(3, [
        card({ k: "Advisor strategy call", v: "Confirm & plan", note: "Validate this route, finalise costs and lock your evidence plan." }),
        card({ k: "Full representation", v: "End-to-end filing", note: "We build, verify and file your application and manage the process." }),
        card({ k: "X-Hub managed", v: "Track everything", note: "Your documents, milestones and advisor in one secure portal." }),
      ]) +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">What happens on your strategy call</h3>` +
      ticks([
        `Confirm ${route} eligibility against current rules for ${countryLabel}.`,
        "Walk through your readiness scores and close the priority gaps.",
        "Finalise the indicative cost schedule and payment milestones.",
        "Agree a filing timeline that fits your planning window.",
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Ready when you are", text: "Reply to your report email or contact the advisory desk to book your strategy call — your assessment and this report are already on file." }),
    footer: foot("Next steps"),
  });

  // Closing — advisor summary (dark)
  const closer = page({
    dark: true,
    body:
      `<div class="eyebrow">Final recommendation</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">Proceed to ${esc(route)}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        `Your profile points to ${route} in ${countryLabel}. The next step is an advisor review to confirm eligibility, build the evidence plan and finalise costs before filing.`,
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Route", v: route }),
        card({ dark: true, k: "Route fit", v: `${fit} / 100` }),
        card({ dark: true, k: "Next service", v: "Advisor strategy call" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">XIPHIAS Immigration Advisory Desk</div><p>immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This document is an advisory assessment prepared from your submitted profile information and XIPHIAS programme content. It is not legal advice and does not guarantee any government or visa-office decision. Final eligibility, fees, documents and timelines must be verified by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  const bodyHtml = [
    cover,
    execPage,
    scorePage,
    profilePage,
    methodologyPage,
    whyFitsPage,
    selfCheckPage,
    ...dossierPages,
    milestonePage,
    roadmapPage,
    advisorPrepPage,
    deliversPage,
    engagementPage,
    closer,
  ].join("");
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
