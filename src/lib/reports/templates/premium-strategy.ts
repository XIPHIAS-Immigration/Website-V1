import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { resolveProgramme, resolveProgrammes, type Dossier } from "@/lib/reports/programme";
import { buildDossierPages, programmeNarrativePages } from "../dossier-sections";
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
import { allocateReportImages, cleanReportPunctuation, depthFor } from "./report-depth";
import { assessPersonalisation, buildClientCase, caseCoverProfileLine, factValue, reportBasis, verifiedDocumentReadiness } from "../client-case";

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
function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const normalized = str(value).toLowerCase();
  return normalized === "true" || normalized === "yes" || normalized === "1";
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
  const depth = depthFor("premium_strategy");
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  const documentReadiness = verifiedDocumentReadiness(clientCase.documents);
  const country = order.country || str(a.country) || str(a.destination) || str(a.countryFocus);
  const programName = order.program || str(a.recommendedProgram) || str(a.program);
  // Resolve advisor-selected routes first. Alternatives are added only after every
  // explicit selection has been considered, preserving the report desk's shortlist.
  const selectedProgrammes = clientCase.objective.selectedProgrammes.value ?? [];
  const dossiers: Dossier[] = [];
  const dossierKeys = new Set<string>();
  const addDossier = (candidate: Dossier | null) => {
    if (!candidate) return;
    const key = `${candidate.vertical}:${candidate.programSlug ?? candidate.title ?? ""}`.toLowerCase();
    if (!key || dossierKeys.has(key)) return;
    dossierKeys.add(key);
    dossiers.push(candidate);
  };
  for (const selected of selectedProgrammes) {
    if (dossiers.length >= depth.maxProgrammes) break;
    addDossier(resolveProgramme({ country, program: selected, track: order.track }));
  }
  // An explicit advisor/user shortlist is authoritative. Do not silently pad it
  // with country-level alternatives, because those extra routes can be mistaken
  // for assessed or recommended programmes. Fall back to discovery only when no
  // supplied programme resolves to a dossier.
  if (dossiers.length === 0) {
    for (const alternative of resolveProgrammes({ country, program: programName, track: order.track }, depth.maxProgrammes)) {
      if (dossiers.length >= depth.maxProgrammes) break;
      addDossier(alternative);
    }
  }
  const dossier = dossiers[0] ?? null;
  const route = dossier?.title || (programName ? smartLabel(programName) : "Advisor-led route");
  const countryLabel = smartLabel(country) || dossier?.country || "Global mobility";
  const isDraft = clientCase.reviewStatus === "draft";

  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = allocateReportImages(await loadCountryImages(country || dossier?.country), "premium_strategy", order.merchantTxnNo);

  const explicitFit = factValue(clientCase.advisor.routeFitScore);
  const hasFamily = factValue(clientCase.family.included) === true;
  const fit = explicitFit;
  const scores = {
    routeFit: fit,
    evidence: factValue(clientCase.advisor.evidenceStrengthScore),
    docs: factValue(clientCase.advisor.documentReadinessScore) ?? documentReadiness.score,
    risk: factValue(clientCase.advisor.riskClarityScore),
    family: factValue(clientCase.advisor.familyReadinessScore),
  };

  const reportTitle = "Personal Immigration Strategy Report";
  const ref = order.merchantTxnNo;
  const head = runningHeader(reportTitle, { country: countryLabel, route });
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Personal Strategy", label);
  let panel = 3;
  const nextImg = (): string | undefined => (imgs.length ? imgs[panel++ % imgs.length] : undefined);
  const basisPage = reportBasisPage({ header: head, footer: foot("Case basis"), basis: reportBasis(clientCase, personalisation) });

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
    eyebrow: isDraft ? "Draft Sample · Unverified" : "Private Client Assessment",
    title: reportTitle,
    preparedFor: order.customer.name,
    profileLine: caseCoverProfileLine(clientCase),
    subtitle: isDraft
      ? `A preliminary planning example for ${countryLabel}. Not for filing or decision-making.`
      : `A focused recommendation for ${countryLabel} immigration planning.`,
    chips: [isDraft ? "DRAFT - UNVERIFIED" : route, goal || "Advisor-led plan", dateLabel()].filter(Boolean),
    fitScore: fit,
    fitLabel: fit !== undefined ? fitWord(fit) : "Advisor scoring required",
    countryLabel,
    dateLabel: dateLabel(),
  });

  // 2 — Executive recommendation (split, fills via image panel)
  const execContent =
    sectionHeader({
      eyebrow: isDraft ? "Working direction" : "Recommended direction",
      title: isDraft ? `${route} for verification` : route,
      desc: isDraft
        ? `This route is included for comparison only. Verify eligibility, evidence and current rules before treating it as a recommendation.`
        : dossier?.tagline || `XIPHIAS recommends an advisor-led ${route} evidence review before full filing preparation.`,
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
      text: fit !== undefined
        ? `${fitWord(fit)} (${fit}/100). This remains conditional on the evidence pack and document set being confirmed.`
        : `${route} is a working direction only. Route fit has not been scored because the supporting case facts are incomplete or unconfirmed.`,
    });
  const execPage = splitPage({ header: head, footer: foot("02"), content: execContent, imageDataUri: nextImg(), capEyebrow: "Recommended route", capTitle: route });

  // 3 — Readiness scorecard (split)
  const scoreBars = [
    scores.routeFit !== undefined ? scoreBar({ label: "Route fit", value: scores.routeFit, tag: fitWord(scores.routeFit) }) : "",
    scores.evidence !== undefined ? scoreBar({ label: "Evidence strength", value: scores.evidence, tag: scores.evidence >= 70 ? "Strong" : "Build proof" }) : "",
    scores.docs !== undefined ? scoreBar({ label: "Document readiness", value: scores.docs, tag: `${documentReadiness.verified} verified · ${documentReadiness.incomplete} incomplete` }) : "",
    scores.risk !== undefined ? scoreBar({ label: "Risk clarity", value: scores.risk, tag: "Advisor assessed" }) : "",
    scores.family !== undefined ? scoreBar({ label: "Family readiness", value: scores.family, tag: hasFamily ? "Dependants assessed" : "Primary applicant" }) : "",
  ].filter(Boolean).join("");
  const scoreContent =
    sectionHeader({ eyebrow: "Route-fit analytics", title: "Readiness scorecard", desc: "Directional advisory signals. The advisor review decides the final evidence positioning." }) +
    (scoreBars || callout({ k: "Scores not yet assigned", text: "Complete the advisor review before treating this strategy as final." })) +
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
      { title: "Route matching", body: `${route} was selected or matched as the working route for ${countryLabel}; the advisor confirms it against legal criteria and evidence.` },
      { title: "Readiness scoring", body: "Only supplied or advisor-confirmed scores are shown. Missing dimensions remain unscored rather than receiving defaults." },
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
        card({ k: "Route fit", v: fit !== undefined ? `${fit} / 100` : "Not assessed", note: fit !== undefined ? fitWord(fit) : "Advisor review required" }),
        card({ k: "Decision priority", v: priorityLabel }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "The bottom line", text: clientCase.reviewStatus === "draft" ? `${route} is the current working route, not a final recommendation. Resolve the open case limitations and obtain advisor confirmation before acting.` : `On the confirmed case information, ${route} in ${countryLabel} is the current primary strategy. Remaining evidence and risk items must still be closed before filing.` }),
    footer: foot("06"),
  });

  // 7 — Eligibility self-check (full, actionable matrix — distinct from the dossier's
  // descriptive eligibility list: this is a personal "can you evidence it?" tracker).
  const reqs = (dossier?.requirements ?? []).map((r) => String(r ?? "").trim()).filter(Boolean).slice(0, 6);
  const disq = (dossier?.disqualifiers ?? []).map((d) => String(d ?? "").trim()).filter(Boolean).slice(0, 2);
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
          (disq.length
            ? `<div class="spacer-8"></div>` + callout({ k: "Refusal risks to review", text: disq.join("; ") })
            : ""),
        footer: foot("07"),
      })
    : "";

  // 8+ — Full programme dossier(s) + prose narrative. The primary route gets the full
  // dossier; an alternative route (if found) gets a focused dossier so the report compares
  // real options. Each programme also contributes its page narrative (the site write-up).
  const footLabel = "XIPHIAS Immigration Private Limited · Personal Strategy";
  const dossierPages = dossiers.flatMap((d, idx) => [
    ...buildDossierPages(d, {
      header: head,
      footLabel,
      images: imgs,
      sections: [...(idx === 0 ? depth.primaryDossierSections : depth.alternativeDossierSections)],
    }),
    ...programmeNarrativePages(d, {
      header: head,
      footLabel,
      images: imgs,
      maxSections: idx === 0 ? depth.maxNarrativeSections : Math.min(2, depth.maxNarrativeSections),
    }),
  ]);

  const decisionPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Decision framework",
        title: "The conditions for a confident go decision",
        desc: `A premium strategy should state not only why ${route} fits, but also what must be true before you commit time and capital.`,
      }) +
      grid(2, [
        card({ k: "Eligibility gate", v: "Evidence confirmed", note: "Every mandatory criterion is mapped to a current, independently verifiable document." }),
        card({ k: "Financial gate", v: budget > 0 ? budgetLabel : "Budget confirmed", note: "Government, professional, relocation and contingency costs fit your available funds." }),
        card({ k: "Timing gate", v: `${timelineMonths}-month objective`, note: "Long-lead documents and government processing fit the planning window." }),
        card({ k: "Family gate", v: hasFamily ? "Dependants modelled" : "Primary applicant", note: "Inclusion timing, status rights and dependant evidence are confirmed." }),
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Pause and reassess when" }) +
      ticks([
        "A mandatory criterion depends on evidence that cannot be independently verified.",
        "The all-in cost or maintained-funds requirement exceeds the confirmed budget.",
        "A deadline relies on an issuer or government processing time outside your control.",
        "A material profile, family, employment or source-of-funds fact changes before filing.",
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Advisor decision", text: "Proceed only after the advisor records each gate as confirmed, conditional or unresolved and gives the unresolved items a named owner and due date." }),
    footer: foot("Decision framework"),
  });

  const assumptionsPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Strategy assumptions",
        title: "What this recommendation assumes",
        desc: "A premium recommendation is only useful when its assumptions are explicit. Confirm each item during advisor review and record any change before filing.",
      }) +
      table({
        head: ["Planning assumption", "Current basis", "Advisor confirmation"],
        rows: [
          ["Destination", countryLabel, "Confirm jurisdiction and intended place of settlement"],
          ["Primary route", route, "Confirm current eligibility and programme availability"],
          ["Objective", goal || "Advisor-led plan", "Confirm the status and long-term outcome sought"],
          ["Planning window", `${timelineMonths} months`, "Test against document and government lead times"],
          ["Budget basis", budgetLabel, "Confirm all-in funds, reserves and payment timing"],
          ["Family scope", hasFamily ? "Dependants included" : "Primary applicant only", "Confirm who applies now and who may join later"],
        ].map((row) => row.map(esc)),
      }) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Change control", text: "Re-score the strategy if employment, family composition, available funds, destination, immigration history or the intended filing date changes materially." }),
    footer: foot("Assumptions"),
  });

  const evidenceRequirements = (dossier?.requirements ?? []).map((item) => String(item ?? "").trim()).filter(Boolean).slice(0, 6);
  const evidenceBlueprintPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Evidence ownership",
        title: "Your evidence production blueprint",
        desc: `Convert the tests for ${route} into named evidence workstreams. Your advisor replaces each provisional status with verified, build or unavailable.`,
      }) +
      table({
        head: ["Evidence workstream", "Proof standard", "Owner", "Status"],
        rows: (evidenceRequirements.length ? evidenceRequirements : [
          "Identity and immigration history",
          "Education and professional standing",
          "Employment or business track record",
          "Funds and source-of-funds evidence",
          "Family and civil-status records",
        ]).map((item, index) => [
          esc(item),
          index % 2 === 0 ? "Independent, current and internally consistent" : "Primary record plus third-party corroboration",
          index < 2 ? "Client" : index < 4 ? "Client + issuer" : "Advisor review",
          pill("To verify", "warn"),
        ]),
      }) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Evidence rule", text: "Do not treat a document as complete merely because it exists. It must prove the specific legal or programme test, agree with the rest of the file and remain valid on the filing date." }),
    footer: foot("Evidence blueprint"),
  });

  const riskInputs = [
    ...(dossier?.disqualifiers ?? []),
    ...(dossier?.riskNotes ?? []),
    ...(dossier?.complianceNotes ?? []),
  ].map((item) => String(item ?? "").trim()).filter(Boolean).slice(0, 6);
  const riskRegisterPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Risk register",
        title: "Risks to close before commitment",
        desc: `The controls below turn known ${countryLabel} and ${route} risks into concrete pre-filing decisions.`,
      }) +
      table({
        head: ["Risk", "Control", "Decision gate"],
        rows: (riskInputs.length ? riskInputs : [
          "Eligibility evidence is incomplete or inconsistent",
          "Government rules or intake conditions change",
          "Funds cannot be traced to a lawful source",
          "A third-party document misses the filing window",
          "Family facts are not aligned across the application",
        ]).map((item, index) => [
          esc(item),
          index % 3 === 0 ? "Advisor eligibility verification" : index % 3 === 1 ? "Current-rule and deadline check" : "Document and narrative quality control",
          index < 2 ? "Before engagement scope" : "Before filing approval",
        ]),
      }) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Escalation rule", text: "Any unresolved mandatory criterion, adverse immigration fact, unexplained funds movement or contradictory record must be escalated before a filing date is agreed." }),
    footer: foot("Risk register"),
  });

  const financialControlPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Financial readiness",
        title: "Control the all-in financial exposure",
        desc: `The stated budget of ${budgetLabel} is a planning input. The advisor must convert it into a timed and evidenced funding plan for ${route}.`,
      }) +
      grid(2, [
        card({ k: "Programme threshold", v: dossier?.minInvestment ? `${dossier.currency || "USD"} ${dossier.minInvestment.toLocaleString("en-US")}` : "Confirm current amount", note: "Qualifying capital, maintained funds or route threshold where applicable." }),
        card({ k: "Government and third parties", v: "Verify current schedules", note: "Filing, biometrics, assessment, translation, medical and clearance costs." }),
        card({ k: "Professional scope", v: "Written quotation", note: "Tie fees to deliverables, milestones and any exclusions." }),
        card({ k: "Contingency reserve", v: "Hold separately", note: "Allow for exchange-rate movement, repeat documents, travel and timing changes." }),
      ]) +
      `<div class="spacer-16"></div>` +
      steps([
        { title: "Confirm the amount", body: "Replace every indicative number with a dated source or written advisor confirmation." },
        { title: "Prove lawful origin", body: "Map each material balance or transfer to bank, tax, sale, business or income records." },
        { title: "Sequence payments", body: "Identify what is payable at engagement, document preparation, filing and government decision stages." },
        { title: "Protect liquidity", body: "Keep relocation and emergency reserves outside funds committed to the immigration plan." },
      ]),
    footer: foot("Financial controls"),
  });

  const familyPlanningPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Family and status planning",
        title: hasFamily ? "Plan every dependant into the same strategy" : "Protect future family flexibility",
        desc: "A route decision should account for status rights, timing and evidence for every person affected, even when only one applicant files first.",
      }) +
      grid(2, [
        card({ k: "Application scope", v: hasFamily ? "Family included" : "Primary applicant", note: "Confirm who applies together and who follows later." }),
        card({ k: "Civil evidence", v: "Verify early", note: "Birth, marriage, custody, name-change and dependency records often have long lead times." }),
        card({ k: "Work and study rights", v: "Route-specific", note: "Confirm dependant rights and any separate permits before relocation decisions." }),
        card({ k: "Status continuity", v: "Sequence carefully", note: "Avoid gaps between current status, travel, filing and activation requirements." }),
      ]) +
      `<div class="spacer-16"></div>` +
      ticks([
        "Confirm passport validity and consistent names for every applicant.",
        "Record previous visas, refusals, residence and travel history consistently.",
        "Check medical, police-clearance and biometrics requirements by age and location.",
        "Confirm whether dependants can be added after filing and what delay or cost that creates.",
        "Plan schooling, healthcare, accommodation and work rights before the intended move date.",
      ]),
    footer: foot("Family planning"),
  });

  const alternativeRoutes = dossiers.slice(1, 3).map((item) => item.title).filter(Boolean) as string[];
  const scenarioPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Scenario planning",
        title: "Primary plan, fallback and trigger points",
        desc: `Keep ${route} as the lead strategy while defining exactly when an alternative should replace it.`,
      }) +
      grid(3, [
        card({ k: "Primary scenario", v: route, note: `Proceed when eligibility, evidence, funds and timing gates are confirmed for ${countryLabel}.` }),
        card({ k: "Alternative scenario", v: alternativeRoutes[0] || "Advisor-selected fallback", note: "Use when the primary route depends on evidence or timing that cannot be secured." }),
        card({ k: "Second fallback", v: alternativeRoutes[1] || "Re-scope destination or timing", note: "Use only after comparing status outcome, family rights, cost and processing risk." }),
      ]) +
      `<div class="spacer-8"></div>` +
      table({
        head: ["Trigger", "Action", "Owner"],
        rows: [
          ["Mandatory evidence cannot be obtained", "Re-score the fallback route before further spend", "Advisor"],
          ["Budget or maintained-funds position changes", "Rebuild the cost plan and payment sequence", "Client + advisor"],
          ["Government intake or rule changes", "Verify transition provisions and alternative filing window", "Advisor"],
          ["Employment, business or family facts change", "Update the profile, documents and route assumptions", "Client"],
          ["Timeline becomes non-negotiable", "Compare a temporary bridge against the long-term route", "Advisor"],
        ].map((row) => row.map(esc)),
      }),
    footer: foot("Scenario planning"),
  });

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
      `<div class="eyebrow">${isDraft ? "Draft conclusion" : "Final recommendation"}</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">${isDraft ? "Complete verification before choosing a route" : `Proceed to ${esc(route)}`}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        isDraft
          ? `${route} in ${countryLabel} is a working comparison route only. Replace sample facts, verify the evidence and complete advisor review before making an immigration or payment decision.`
          : `Your profile points to ${route} in ${countryLabel}. The next step is an advisor review to confirm eligibility, build the evidence plan and finalise costs before filing.`,
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Route", v: route }),
        card({ dark: true, k: "Route fit", v: fit !== undefined ? `${fit} / 100` : "Not assessed" }),
        card({ dark: true, k: "Next service", v: "Advisor strategy call" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">XIPHIAS Immigration Advisory Desk</div><p>immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This document is an advisory assessment prepared from your submitted profile information and XIPHIAS programme content. It is not legal advice and does not guarantee any government or visa-office decision. Final eligibility, fees, documents and timelines must be verified by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });
  const companyPages = buildCompanyProfilePages({ header: head, footer: foot });

  const bodyHtml = cleanReportPunctuation([
    cover,
    basisPage,
    execPage,
    scorePage,
    profilePage,
    methodologyPage,
    whyFitsPage,
    selfCheckPage,
    decisionPage,
    assumptionsPage,
    evidenceBlueprintPage,
    riskRegisterPage,
    financialControlPage,
    familyPlanningPage,
    scenarioPage,
    ...dossierPages,
    milestonePage,
    roadmapPage,
    advisorPrepPage,
    deliversPage,
    engagementPage,
    ...companyPages,
    closer,
  ].join(""));
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
