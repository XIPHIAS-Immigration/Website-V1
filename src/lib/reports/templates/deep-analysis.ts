import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import {
  evidenceLabels,
  highSkillCompletion,
  highSkillRoutes,
  scoreHighSkillRoutes,
  type HighSkillEvidenceKey,
  type HighSkillInput,
  type ScoredHighSkillRoute,
} from "@/lib/xia-intelligence-model";
import { resolveProgrammes } from "@/lib/reports/programme";
import { loadCoverBg, loadCountryImages, loadLogo } from "../assets";
import { buildDossierPages, programmeNarrativePages, type DossierSection } from "../dossier-sections";
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

const TARGET_COUNTRIES = new Set(["usa", "canada", "uk", "australia", "global"]);
const GOALS = new Set(["permanent-residency", "temporary-work", "talent-visa", "founder", "not-sure"]);
const FIELDS = new Set(["technology", "science", "business", "arts", "healthcare", "academia", "sports", "other"]);
const EDUCATION = new Set(["unknown", "bachelor", "master", "phd"]);

const EVIDENCE_KEYS = Object.keys(evidenceLabels) as HighSkillEvidenceKey[];

const COUNTRY_LABELS: Record<HighSkillInput["targetCountry"], string> = {
  usa: "United States",
  canada: "Canada",
  uk: "United Kingdom",
  australia: "Australia",
  global: "Open globally",
};

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
  return s === "true" || s === "yes" || s === "1" || s === "on";
}
function toInt(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}
// True acronyms / programme codes that must stay uppercase rather than being title-cased
// (e.g. "EB-1A" not "Eb-1A", "PR" not "Pr"). Matched case-insensitively as whole words.
const ACRONYMS = new Set([
  "PR",
  "NIW",
  "EB-1A",
  "EB-2",
  "O-1A",
  "O-1",
  "H-1B",
  "L-1",
  "IP",
  "UK",
  "UAE",
  "USA",
  "EU",
  "PhD",
]);
const ACRONYM_LOOKUP = new Map<string, string>(Array.from(ACRONYMS, (a) => [a.toLowerCase(), a]));

// Title-cases free text but preserves true acronyms / programme codes (PR, NIW, EB-1A …).
function titleCase(value: string): string {
  return value
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token) || token === "") return token;
      const acronym = ACRONYM_LOOKUP.get(token.toLowerCase());
      if (acronym) return acronym;
      return token.replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .join("");
}

// Proper, human-readable labels for this template's coded goal values so a goal never
// renders as a half-formed slug (e.g. "not-sure" → "Not Sure"). Falls back gracefully.
function goalLabel(goal: HighSkillInput["goal"]): string {
  switch (goal) {
    case "permanent-residency":
      return "Permanent residency";
    case "temporary-work":
      return "Work visa";
    case "talent-visa":
      return "Talent visa";
    case "founder":
      return "Founder / startup";
    case "not-sure":
      return "Open / advisor-led";
    default:
      return titleCase(String(goal).replace(/-/g, " "));
  }
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function normTargetCountry(value: unknown): HighSkillInput["targetCountry"] {
  const raw = str(value).toLowerCase();
  if (/united states|america|^us$|u\.s\./.test(raw)) return "usa";
  if (/united kingdom|britain|england|^gb$/.test(raw)) return "uk";
  return pickEnum(raw, TARGET_COUNTRIES, "global") as HighSkillInput["targetCountry"];
}

function buildHighSkillInput(order: JiopayOrder): HighSkillInput {
  const a = (order.answers ?? {}) as Record<string, unknown>;

  const evidence = EVIDENCE_KEYS.reduce((acc, key) => {
    acc[key] = toBool(a[key] ?? a[`evidence_${key}`]);
    return acc;
  }, {} as Record<HighSkillEvidenceKey, boolean>);

  return {
    targetCountry: normTargetCountry(order.country ?? a.targetCountry ?? a.country),
    goal: pickEnum(a.goal, GOALS, "not-sure") as HighSkillInput["goal"],
    field: pickEnum(a.field, FIELDS, "technology") as HighSkillInput["field"],
    role: str(a.role ?? a.profile ?? a.occupation) || "High-skill professional",
    age: toInt(a.age, 0),
    education: pickEnum(a.education, EDUCATION, "unknown") as HighSkillInput["education"],
    yearsExperience: toInt(a.yearsExperience ?? a.experience, 0),
    languageScore: toInt(a.languageScore ?? a.ielts, 0),
    evidence,
    citationCount: toInt(a.citationCount ?? a.citations, 0),
    publicationCount: toInt(a.publicationCount ?? a.publications ?? a.papers, 0),
    patentCount: toInt(a.patentCount ?? a.patents, 0),
    resumeFileName: str(a.resumeFileName ?? a.cv),
    profileSummary: str(a.profileSummary ?? a.summary ?? a.notes ?? a.goals),
  };
}

function tierTone(tier: ScoredHighSkillRoute["tier"]): PillTone {
  if (tier === "Strong") return "good";
  if (tier === "Possible") return "warn";
  if (tier === "Needs work") return "muted";
  return "bad";
}
function difficultyTone(difficulty: ScoredHighSkillRoute["difficulty"]): PillTone {
  return difficulty === "very-high" ? "bad" : difficulty === "high" ? "warn" : "good";
}
function fitLabel(score: number): string {
  if (score >= 82) return "Strong fit";
  if (score >= 68) return "Promising fit";
  if (score >= 52) return "Possible fit";
  return "Advisor review";
}
function educationLabel(education: HighSkillInput["education"]): string {
  if (education === "phd") return "Doctorate (PhD)";
  if (education === "master") return "Master's degree";
  if (education === "bachelor") return "Bachelor's degree";
  return "To confirm";
}

// Derive directional profile-signal scores (0-100) from the reconstructed input.
// These mirror the on-site profile-signal review and stay defensive on sparse data.
function profileSignals(input: HighSkillInput, top: ScoredHighSkillRoute | undefined) {
  const evidenceSelected = EVIDENCE_KEYS.filter((key) => input.evidence[key]);

  const recognitionKeys: HighSkillEvidenceKey[] = ["awards", "media", "judging", "citations", "publications"];
  const leadershipKeys: HighSkillEvidenceKey[] = ["leadership", "criticalRole", "businessImpact", "highSalary"];
  const sponsorKeys: HighSkillEvidenceKey[] = ["jobOffer", "employerSponsor", "companyTransfer"];

  const eduScore = input.education === "phd" ? 92 : input.education === "master" ? 80 : input.education === "bachelor" ? 64 : 40;
  const expScore =
    input.yearsExperience >= 12 ? 92 : input.yearsExperience >= 8 ? 82 : input.yearsExperience >= 5 ? 70 : input.yearsExperience > 0 ? 54 : 38;

  const recognitionHits = recognitionKeys.filter((key) => input.evidence[key]).length;
  const outputBonus =
    (input.citationCount >= 100 ? 14 : input.citationCount >= 25 ? 9 : input.citationCount > 0 ? 5 : 0) +
    (input.publicationCount >= 5 ? 10 : input.publicationCount > 0 ? 6 : 0) +
    (input.patentCount >= 2 ? 10 : input.patentCount === 1 ? 6 : 0);
  const recognition = clampScore(34 + recognitionHits * 11 + outputBonus, 34);

  const leadershipHits = leadershipKeys.filter((key) => input.evidence[key]).length;
  const leadership = clampScore(36 + leadershipHits * 13 + (input.yearsExperience >= 8 ? 10 : 0), 36);

  const sponsorHits = sponsorKeys.filter((key) => input.evidence[key]).length;
  const sponsorship = clampScore(30 + sponsorHits * 20, 30);

  const evidenceBreadth = clampScore(30 + evidenceSelected.length * 9, 30);

  const recommendation = input.evidence.recommendations ? 78 : evidenceSelected.length >= 2 ? 50 : 38;

  return {
    evidenceSelected,
    bars: [
      { label: "Education credential", value: eduScore, tag: educationLabel(input.education) },
      { label: "Experience depth", value: expScore, tag: `${input.yearsExperience || "—"} years stated` },
      { label: "Recognition & output", value: recognition, tag: `${recognitionHits}/5 recognition signals` },
      { label: "Leadership & critical role", value: leadership, tag: `${leadershipHits}/4 leadership signals` },
      { label: "Evidence breadth", value: evidenceBreadth, tag: `${evidenceSelected.length}/${EVIDENCE_KEYS.length} categories` },
      { label: "Sponsor / employer support", value: sponsorship, tag: sponsorHits ? `${sponsorHits} support signals` : "Not yet evidenced" },
      { label: "Expert recommendations", value: recommendation, tag: input.evidence.recommendations ? "Letters indicated" : "To collect" },
    ],
    topGaps: top?.gaps ?? [],
  };
}

export async function buildDeepAnalysisReport(order: JiopayOrder): Promise<Buffer> {
  const input = buildHighSkillInput(order);
  const scored = scoreHighSkillRoutes(input).slice(0, 6);
  const top = scored[0];
  const completion = highSkillCompletion(input);
  const signals = profileSignals(input, top);
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = await loadCountryImages(order.country);

  const reportTitle = "High-Skill Deep Analysis Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Deep Analysis", label);
  const head = runningHeader(reportTitle, { country: COUNTRY_LABELS[input.targetCountry], route: top?.title });

  const avgTop3 = scored.slice(0, 3).reduce((sum, r) => sum + r.fitScore, 0) / Math.max(1, Math.min(3, scored.length));
  const totalEvidenceCategories = highSkillRoutes.reduce(
    (set, r) => {
      Object.keys(r.evidenceWeights).forEach((k) => set.add(k));
      return set;
    },
    new Set<string>(),
  ).size;

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "XIA · Deep Analysis",
    title: "High-Skill Deep Analysis Report",
    preparedFor: order.customer.name,
    subtitle:
      "An evidence-led analysis of your high-skill profile, ranking the visa routes worldwide that best match your achievements, recognition and target.",
    chips: [
      `Target: ${COUNTRY_LABELS[input.targetCountry]}`,
      `Field: ${titleCase(input.field)}`,
      `Goal: ${goalLabel(input.goal)}`,
    ],
    fitScore: top?.fitScore,
    fitLabel: top ? fitLabel(top.fitScore) : undefined,
    countryLabel: top?.country,
    dateLabel: dateLabel(),
  });

  // 2 — Profile snapshot
  const briefCards = grid(3, [
    card({ k: "Target country", v: COUNTRY_LABELS[input.targetCountry] }),
    card({ k: "Primary goal", v: goalLabel(input.goal) }),
    card({ k: "Field", v: titleCase(input.field) }),
    card({ k: "Role", v: titleCase(input.role) }),
    card({ k: "Education", v: educationLabel(input.education) }),
    card({ k: "Experience", v: input.yearsExperience > 0 ? `${input.yearsExperience} years` : "To confirm" }),
    card({ k: "Language score", v: input.languageScore > 0 ? `${input.languageScore} / 9` : input.targetCountry === "usa" ? "Not required" : "To confirm" }),
    card({ k: "Research output", v: `${input.publicationCount} papers · ${input.citationCount} citations` }),
    card({ k: "Innovation", v: input.patentCount > 0 ? `${input.patentCount} patent${input.patentCount > 1 ? "s" : ""}` : "No patents stated" }),
  ]);
  const briefPage = page({
    header: head,
    body:
      heroBand(imgs[0], {
        eyebrow: "Target destination",
        title: top ? `${COUNTRY_LABELS[input.targetCountry]} · ${top.title}` : COUNTRY_LABELS[input.targetCountry],
      }) +
      sectionHeader({
        eyebrow: "Profile snapshot",
        title: "The profile this analysis is built on",
        desc: "Your high-skill routes are ranked against approved XIPHIAS visa intelligence using the inputs below. The advisor review confirms final evidence positioning.",
      }) +
      briefCards +
      `<div class="spacer-16"></div>` +
      scoreBar({ label: "Profile depth captured", value: completion, tag: completion >= 70 ? "Strong detail provided" : "Add detail to sharpen the analysis" }) +
      `<div class="spacer-8"></div>` +
      callout({
        k: "Headline read",
        text: top
          ? `Your strongest match today is ${top.title} (${top.country}) at ${clampScore(top.fitScore)}/100 — a ${top.tier.toLowerCase()} position. Use this report to compare it against the alternatives and confirm the evidence you still need to build.`
          : "Provide more profile detail with an advisor to surface a stronger ranked shortlist of high-skill routes.",
      }),
    footer: foot("02"),
  });

  // 3 — Profile-signal scorecard
  const scorecardPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Profile signals",
        title: "Your evidence & profile-signal scorecard",
        desc: "Directional strength of each signal that high-skill visa officers weigh. Scores reflect what you have stated so far and rise as verifiable evidence is added.",
      }) +
      signals.bars.map((bar) => scoreBar(bar)).join("") +
      `<div class="spacer-16"></div>` +
      grid(3, [
        card({ k: "Evidence categories", v: `${signals.evidenceSelected.length} / ${EVIDENCE_KEYS.length}`, note: "Independent categories you have flagged across the high-skill criteria set." }),
        card({ k: "Top route fit", v: top ? `${clampScore(top.fitScore)} / 100` : "—", note: top ? top.tier : "Refine inputs to rank routes." }),
        card({ k: "Shortlist strength", v: `${clampScore(avgTop3)} / 100`, note: "Average fit across your three strongest matches." }),
      ]),
    footer: foot("03"),
  });

  // 4 — Top recommended route
  const topPage = top
    ? page({
        header: head,
        body:
          heroBand(imgs[2] ?? imgs[1] ?? imgs[0], { eyebrow: "Primary route", title: `${top.title} · ${top.country}` }) +
          sectionHeader({ eyebrow: "Primary recommendation", title: top.title, desc: top.summary }) +
          grid(3, [
            card({ k: "Country", v: top.country }),
            card({ k: "Visa family", v: top.visaFamily }),
            card({ k: "Tier", v: top.tier }),
            card({ k: "Timeline", v: top.timeline }),
            card({ k: "Difficulty", v: titleCase(top.difficulty.replace(/-/g, " ")) }),
            card({ k: "Pathway type", v: top.permanent ? "Permanent residency" : "Temporary / staged" }),
          ]) +
          `<div class="spacer-16"></div>` +
          scoreBar({ label: "Route fit", value: top.fitScore, tag: fitLabel(top.fitScore) }) +
          `<div class="spacer-8"></div>` +
          `<h3 class="h-sub">Why this route fits your profile</h3>` +
          ticks(top.reasons.length ? top.reasons.slice(0, 6) : ["Matched against your target, field, education and evidence inputs."]) +
          (top.gaps.length
            ? `<div class="spacer-8"></div><h3 class="h-sub">What to strengthen</h3>` + ticks(top.gaps.slice(0, 5))
            : "") +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Best suited to",
            text: `Typically strong for ${top.bestFor.slice(0, 4).join(", ")}.${top.requiresSponsor ? " This route relies on employer or sponsor support — line that up early." : " This route does not require employer sponsorship, so you can self-petition on evidence."}`,
          }),
        footer: foot("04"),
      })
    : "";

  // 5 — Ranked visa-family comparison
  const rows = scored.map((r) => [
    `<strong>${esc(r.title)}</strong>`,
    esc(r.country),
    esc(r.visaFamily),
    pill(`${clampScore(r.fitScore)}`, tierTone(r.tier)),
    pill(r.tier, tierTone(r.tier)),
    pill(titleCase(r.difficulty.replace(/-/g, " ")), difficultyTone(r.difficulty)),
    esc(r.permanent ? "Permanent" : "Temporary"),
  ]);
  const comparePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Ranked comparison",
        title: "Your high-skill visa families, ranked",
        desc: "The strongest visa families for your profile, ranked by fit score. Scores are directional advisory signals confirmed at advisor review.",
      }) +
      bigStats([
        { k: "Routes ranked", v: `${scored.length}`, n: "matched to your profile" },
        { k: "Top route fit", v: top ? `${clampScore(top.fitScore)}` : "—", n: top ? `${top.country} · ${top.tier}` : "refine inputs" },
        { k: "Shortlist strength", v: `${clampScore(avgTop3)}`, n: "average of your top 3" },
        { k: "Permanent options", v: `${scored.filter((r) => r.permanent).length}`, n: "lead to residency" },
      ]) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Visa route", "Country", "Family", "Fit", "Tier", "Difficulty", "Pathway"],
        rows,
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "How to read this ranking",
        text: "Fit scores are directional signals from your profile and evidence — your dedicated readiness scorecard and the evidence-gap map that follow show exactly where to focus before filing.",
      }),
    footer: foot("05"),
  });

  // 6 — Alternative routes worth weighing
  const altCards = scored.slice(1, 4).map((r) =>
    card({
      k: `Fit ${clampScore(r.fitScore)} · ${r.country}`,
      v: r.title,
      note:
        (r.reasons[0] ? r.reasons[0] : "Matched on your profile and target.") +
        (r.gaps[0] ? `  To strengthen: ${r.gaps[0]}` : ""),
    }),
  );
  const altPage = scored.length > 1
    ? splitPage({
        header: head,
        footer: foot("06"),
        imageDataUri: imgs[3 % imgs.length],
        capEyebrow: top?.country ?? COUNTRY_LABELS[input.targetCountry],
        capTitle: "Alternative routes",
        content:
          sectionHeader({
            eyebrow: "Alternatives",
            title: "Other routes worth weighing",
            desc: "Strong secondary high-skill options if your evidence, sponsorship, timing or target preference shifts.",
          }) + (altCards.length ? `<div class="grid">${altCards.join("")}</div>` : "") +
          `<div class="spacer-16"></div>` +
          callout({
            k: "How to read fit scores",
            text: "Fit reflects how well a route matches your stated profile and evidence — not a guarantee of approval. The quantity and independence of your evidence, current rules and document consistency decide the outcome, which is why advisor verification comes before any filing.",
          }),
      })
    : "";

  // 7 — Evidence-gap map (what to build)
  const gapRows = (top ? top.nextEvidence : EVIDENCE_KEYS.slice(0, 4).map((k) => evidenceLabels[k])).map((label) => {
    // Resolve the underlying evidence key so we can show current status.
    const key = EVIDENCE_KEYS.find((k) => evidenceLabels[k] === label);
    const have = key ? input.evidence[key] : false;
    return [
      `<strong>${esc(label)}</strong>`,
      have ? pill("On file", "good") : pill("To build", "warn"),
      esc(have ? "Already flagged — package and verify for filing." : "High-impact for your top routes; gather and document this evidence."),
    ];
  });
  const missingTopRoutes = EVIDENCE_KEYS.filter((key) => !input.evidence[key])
    .slice(0, 5)
    .map((key) => evidenceLabels[key]);
  const gapPage = splitPage({
    header: head,
    footer: foot("07"),
    imageDataUri: imgs[4 % imgs.length],
    capEyebrow: "Evidence plan",
    capTitle: "Build before you file",
    content:
      sectionHeader({
        eyebrow: "Evidence-gap map",
        title: "What to build before you file",
        desc: "The evidence categories that most move your top routes. Prioritise the items marked to build — these have the highest scoring weight for your profile.",
      }) +
      table({
        head: ["Evidence category", "Status", "Why it matters"],
        rows: gapRows.length ? gapRows : [[esc("Profile evidence"), pill("To capture", "warn"), esc("Add CV detail and evidence flags to generate a targeted gap map.")]],
      }) +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Evidence still open across your shortlist</h3>` +
      ticks(missingTopRoutes.length ? missingTopRoutes : ["Your stated evidence already covers the core categories — focus on verification and packaging."]) +
      `<div class="spacer-8"></div>` +
      callout({
        k: "Coverage",
        text: `You have flagged ${signals.evidenceSelected.length} of ${EVIDENCE_KEYS.length} evidence categories that high-skill routes weigh across ${totalEvidenceCategories} criteria. Independent, verifiable evidence in three or more categories materially strengthens extraordinary-ability and talent petitions.`,
      }),
  });

  // 8 — Action roadmap + risk
  const planPage = page({
    header: head,
    body:
      sectionHeader({ eyebrow: "Action roadmap", title: "Your next four moves", desc: "A focused sequence to convert this ranked analysis into a filing-ready high-skill case." }) +
      steps([
        {
          title: "Confirm your route",
          body: top
            ? `Review ${top.title} and the ranked alternatives with a XIPHIAS advisor, and lock your primary high-skill route and target.`
            : "Add profile and evidence detail with an advisor to lock a primary high-skill route.",
        },
        { title: "Close the evidence gaps", body: "Build the to-build items from your evidence-gap map — awards, publications, media, judging, critical role, salary or recommendation letters as relevant." },
        { title: "Package the evidence", body: "Organise each criterion into a verifiable, well-labelled exhibit set with expert letters that explain impact and independence." },
        { title: "Validate & file", body: "Advisor verifies current rules, timelines and criteria for your top route, then moves into petition drafting and filing coordination." },
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Risk & due diligence" }) +
      grid(2, [
        card({ k: "Evidence independence", v: "Show external recognition", note: "Extraordinary-ability and talent routes need recognition beyond your employer — independent awards, media and expert letters." }),
        card({ k: "Sponsor dependency", v: input.evidence.employerSponsor || input.evidence.jobOffer ? "Support indicated" : "Line up early", note: "Sponsor-based routes (H-1B, O-1A, L-1) need a confirmed employer or qualifying transfer before filing." }),
        card({ k: "Rules change", v: "Verify before filing", note: "Government criteria, caps and processing windows shift; confirm current rules at advisor review." }),
        card({ k: "Document consistency", v: "Avoid mismatches", note: "Inconsistent names, dates, titles or histories across documents cause avoidable delays and queries." }),
      ]),
    footer: foot("08"),
  });

  // 9 — Advisor summary (dark close)
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Advisor summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">Proceed with confidence</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        top
          ? `Your profile points most strongly to ${top.title} in ${top.country} (${clampScore(top.fitScore)}/100, ${top.tier.toLowerCase()}). The next step is an advisor review to confirm criteria and build your evidence plan.`
          : "Add profile and evidence detail with an advisor to lock a strong primary high-skill route.",
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Primary route", v: top?.title ?? "To confirm" }),
        card({ dark: true, k: "Fit score", v: top ? `${clampScore(top.fitScore)} / 100` : "—" }),
        card({ dark: true, k: "Next service", v: "Advisor evidence review" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This report is an advisory assessment prepared from your submitted profile and XIPHIAS high-skill visa intelligence. It is not legal advice and does not guarantee any government, immigration or visa-office decision. Fit scores and signal strengths are directional and must be confirmed by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  // Carry the top route (full dossier + prose narrative) plus a focused alternative, so the
  // deep analysis has real programme depth and compares the routes it ranked.
  const footLabel = "XIPHIAS Immigration Private Limited · Deep Analysis";
  const dossiers = resolveProgrammes({ country: order.country, program: order.program, track: order.track }, 2);
  const ALT_SECTIONS: DossierSection[] = ["divider", "snapshot", "eligibility", "costs", "risk"];
  const dossierPages = dossiers.flatMap((d, idx) => [
    ...buildDossierPages(d, { header: head, footLabel, images: imgs, sections: idx === 0 ? undefined : ALT_SECTIONS }),
    ...programmeNarrativePages(d, { header: head, footLabel, images: imgs, maxSections: idx === 0 ? 3 : 1 }),
  ]);

  const bodyHtml = [cover, briefPage, scorecardPage, topPage, comparePage, altPage, gapPage, planPage, ...dossierPages, summaryPage].join("");
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
