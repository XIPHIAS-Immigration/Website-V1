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
import { resolveProgramme, type Dossier } from "@/lib/reports/programme";
import { loadCountryImageAssets, loadLogo } from "../assets";
import { buildDossierPages } from "../dossier-sections";
import { depthFor } from "./report-depth";
import {
  bigStats,
  callout,
  card,
  clampScore,
  coverPage,
  disclaimer,
  esc,
  featurePage,
  grid,
  heroBand,
  imageDividerPage,
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
import { assessPersonalisation, buildClientCase, caseCoverProfileLine, referenceMatches, reportBasis } from "../client-case";

const TARGET_COUNTRIES = new Set(["usa", "canada", "uk", "australia", "global"]);
const GOALS = new Set(["permanent-residency", "temporary-work", "talent-visa", "founder", "not-sure"]);
const FIELDS = new Set(["technology", "science", "business", "arts", "healthcare", "academia", "sports", "other"]);
const EDUCATION = new Set(["unknown", "bachelor", "master", "phd"]);
const LANGUAGE_TESTS = new Set(["not-provided", "ielts", "celpip", "pte", "toefl", "oet", "tef", "tcf", "other"]);
const RESUME_STATUSES = new Set(["not-provided", "parsed", "needs-review"]);

const EVIDENCE_KEYS = Object.keys(evidenceLabels) as HighSkillEvidenceKey[];

const COUNTRY_LABELS: Record<HighSkillInput["targetCountry"], string> = {
  usa: "United States",
  canada: "Canada",
  uk: "United Kingdom",
  australia: "Australia",
  global: "Open globally",
};
const SPECIFIC_COUNTRIES: HighSkillInput["targetCountry"][] = ["usa", "canada", "uk", "australia"];

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
function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function rotateBySeed<T>(items: T[], seed: string): T[] {
  if (items.length < 2) return items;
  const offset = stableHash(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
function isEditorialRoleSource(source: string): boolean {
  return /technology-leadership|evidence-review|critical-technology-research|contribution-strategy|advisor-consultation/i.test(source);
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

function outsideCountryLabels(target: HighSkillInput["targetCountry"]): string {
  const labels = SPECIFIC_COUNTRIES.filter((country) => country !== target).map((country) => COUNTRY_LABELS[country]);
  if (labels.length < 2) return labels[0] ?? "other countries";
  return `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`;
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

function normCountryText(value: unknown): string {
  return str(value)
    .toLowerCase()
    .replace(/united states of america|united states|america|u\.s\.a\.|u\.s\./g, "usa")
    .replace(/united kingdom|great britain|britain|england|u\.k\./g, "uk")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function routeMatchesTarget(route: ScoredHighSkillRoute, target: HighSkillInput["targetCountry"]): boolean {
  if (target === "global") return true;
  const country = normCountryText(route.country);
  if (target === "usa") return country === "usa";
  if (target === "uk") return country === "uk";
  return country.includes(target);
}

function countryIntelligence(input: HighSkillInput): {
  title: string;
  routeLens: string;
  ecosystem: string[];
  filingLenses: string[];
  documents: string[];
  risks: string[];
} {
  const country = COUNTRY_LABELS[input.targetCountry];
  if (input.targetCountry === "global") {
    return {
      title: "Global high-skill route intelligence",
      routeLens: "Global mode compares only active route families that support the selected goal and field. Each recommendation retains its own country, programme, official source, constraints and evidence logic.",
      ecosystem: [
        "Country fit is kept separate from profile readiness so a strong evidence score cannot erase a route's legal or sponsor constraints.",
        "Permanent, temporary, talent and founder objectives are compared only against routes that support the selected outcome.",
        "Country-specific age, language, sponsorship, invitation and evidence conditions remain visible in the ranked analysis.",
        "The final destination should be locked only after advisor review of eligibility, timing, family position and filing risk.",
      ],
      filingLenses: [
        "Which active route best supports the selected goal and field?",
        "Which country constraints materially change eligibility or readiness?",
        "Is the leading route applicant-led, endorsement-led, invitation-led or sponsor-led?",
        "Which official rule and evidence questions must be verified before choosing a destination?",
      ],
      documents: [
        "Passport, parsed CV, education, employment, language and route-specific achievement evidence.",
        "Country-specific sponsor, invitation, nomination, occupation, licensing, funds and family documents after the route is shortlisted.",
      ],
      risks: [
        "A high global score is not an eligibility decision and cannot substitute for country-specific legal criteria.",
        "Processing, quotas, invitation patterns, fees and programme availability can change after the report date.",
        "Outside-country comparisons should not be treated as filing alternatives until the advisor validates practical relocation constraints.",
      ],
    };
  }
  if (input.targetCountry === "australia") {
    return {
      title: "Australia high-skill immigration intelligence",
      routeLens:
        "Australia should be analysed as a single destination ecosystem: National Innovation / exceptional talent positioning for elite profiles, SkillSelect for points-tested skilled migration, occupation-list and skills-assessment controls, and employer-sponsored options where a specialist role is available.",
      ecosystem: [
        "National Innovation Visa (subclass 858) is the premium permanent pathway lens for exceptional and outstanding achievement; it is invitation-led and evidence-heavy.",
        "SkillSelect remains central for points-tested skilled routes such as subclass 189, 190 and 491, where occupation, points, English and invitation dynamics matter.",
        "A suitable skills assessment can be mandatory for General Skilled Migration routes and must align with the nominated occupation and assessing authority.",
        "Employer-sponsored innovation options, including GTES / SID-style sponsorship, are relevant only when the employer can justify a highly specialised niche role.",
      ],
      filingLenses: [
        "Does the profile show internationally recognised achievement, or is it stronger as a points-tested skilled migration case?",
        "Is the occupation clearly mapped to an eligible Australian occupation / ANZSCO pathway and the right assessing authority?",
        "Are English, age, education and experience competitive enough for SkillSelect if the talent route is not filing-ready?",
        "Can the applicant show benefit to Australia through critical technologies, innovation, job creation, productivity, research or sector contribution?",
      ],
      documents: [
        "Passport bio-data page, CV, highest qualification evidence, English translations where required, and proof that cloud-only files are not relied upon.",
        "Achievement evidence: awards, product impact, patents, media, publications, expert letters, revenue/user metrics, leadership proof and sector relevance.",
        "For skills routes: skills assessment, English test, employment references, occupation mapping, EOI claims evidence and state/territory nomination material if relevant.",
        "For nominated innovation positioning: Form 1000 or government / expert agency support evidence where applicable.",
      ],
      risks: [
        "A strong employer CV is not enough for National Innovation positioning unless external achievement and sector benefit are clearly evidenced.",
        "EOI claims must be document-backed before invitation/application timing; claims that cannot be proven create refusal risk.",
        "Occupation and skills-assessment mismatch can derail points-tested routes even when the profile appears strong.",
        "Invitation does not equal approval; the visa application is still assessed on merits and supporting documentation.",
      ],
    };
  }
  if (input.targetCountry === "usa") {
    return {
      title: "United States high-skill immigration intelligence",
      routeLens:
        "The United States should be analysed through self-petition immigrant routes, sponsor-led temporary work routes, and evidence-heavy extraordinary ability positioning.",
      ecosystem: [
        "EB-1A and O-1A depend on independent recognition and criterion-mapped proof.",
        "EB-2 NIW depends on advanced-degree / exceptional-ability strength plus a national-interest narrative.",
        "H-1B and L-1 are sponsor-controlled and should not be treated as applicant-only routes.",
        "A strong US plan usually needs a primary route and a backup route because timing, sponsor control and priority-date issues can shift.",
      ],
      filingLenses: [
        "Is the evidence strong enough for self-petition, or does the case need a sponsor-led route first?",
        "Can achievements be shown as external recognition rather than internal job performance?",
        "Does the future work have a clear US national-interest or employer need narrative?",
        "Are publications, citations, media, judging, salary and critical-role evidence independently verifiable?",
      ],
      documents: [
        "CV, passport, education records, employment letters, salary proof, publications/citations, media, awards, patents and expert letters.",
        "For sponsor routes: offer, petitioner details, role description, worksite, ability to pay and employer support letter.",
        "For NIW: proposed endeavour, national importance, applicant positioning and evidence that waiver of job offer is beneficial.",
      ],
      risks: [
        "Internal company success alone may not prove national or international recognition.",
        "Sponsor-led routes can fail if the employer, role or worksite evidence is weak.",
        "Evidence must be consistent across CV, letters, public records, salary documents and petitions.",
      ],
    };
  }
  if (input.targetCountry === "canada") {
    return {
      title: "Canada skilled immigration intelligence",
      routeLens:
        "Canada should be analysed through Express Entry competitiveness, provincial nomination fit, occupation demand, language scores and credential assessment.",
      ecosystem: [
        "Express Entry is points-led and rewards age, education, language, skilled experience and arranged employment / nomination signals.",
        "Provincial nomination can materially change competitiveness where the occupation and province fit.",
        "Credential assessment and language testing are often the earliest high-leverage documents.",
        "A strong Canada plan compares CRS competitiveness, PNP realism and timeline tolerance within Canada only.",
      ],
      filingLenses: [
        "Is the profile competitive without nomination, or does it need a PNP strategy?",
        "Are language scores high enough to materially improve ranking?",
        "Does the occupation map to a realistic NOC / TEER pathway?",
        "Are education, employment and settlement documents ready to support every claim?",
      ],
      documents: [
        "Passport, ECA, language test, employment references, proof of funds, civil documents and NOC-aligned role evidence.",
        "For PNP: province-specific occupation, job offer, ties, settlement intent or employer evidence where required.",
      ],
      risks: [
        "Meeting minimum eligibility does not guarantee invitation.",
        "Weak NOC mapping or employment letters can undermine CRS and admissibility claims.",
        "Language and ECA delays can slow the entire plan.",
      ],
    };
  }
  if (input.targetCountry === "uk") {
    return {
      title: "United Kingdom high-skill immigration intelligence",
      routeLens:
        "The United Kingdom should be analysed through endorsement readiness, sponsor availability, founder/commercial traction and evidence of leadership or promise.",
      ecosystem: [
        "Global Talent depends on endorsement-ready evidence in an eligible field.",
        "Sponsor-led work routes depend on the employer, role, salary and sponsorship licence controls.",
        "Founder or scale-up positioning needs commercial evidence, traction and credible UK market logic.",
        "The strongest UK plan distinguishes talent evidence from ordinary employment competence.",
      ],
      filingLenses: [
        "Is the applicant a leader/emerging leader, or better suited to a sponsor-led work route?",
        "Do recommendation letters come from credible independent experts?",
        "Is evidence field-specific and aligned with the relevant endorsing body expectations?",
        "Can salary, role and sponsor requirements be satisfied if talent evidence is not enough?",
      ],
      documents: [
        "CV, passport, qualifications, recommendation letters, media, awards, product impact, publications and employment/sponsor documents where relevant.",
        "Commercial/founder evidence: incorporation, revenue, funding, users, product traction, market evidence and UK expansion logic.",
      ],
      risks: [
        "Generic recommendation letters rarely carry enough weight.",
        "Employer sponsorship is not a substitute for endorsement evidence on Global Talent.",
        "Commercial claims need independent proof, not pitch-deck language alone.",
      ],
    };
  }
  return {
    title: `${country} high-skill immigration intelligence`,
    routeLens:
      "This report is scoped to the selected destination. XIPHIAS advisor review should confirm the current route family, government criteria, evidence requirements, timelines and document standards before filing.",
    ecosystem: [
      "Confirm the destination-specific visa family before comparing any outside-country alternative.",
      "Separate eligibility, evidence quality, document readiness, processing risk and commercial timing.",
      "Prioritise official requirements and advisor-verified programme content over generic global route matching.",
    ],
    filingLenses: [
      "What is the strongest route inside the selected country?",
      "Which evidence categories most affect that country route?",
      "Which documents or current rules could delay filing?",
      "What should be built before paying government or third-party fees?",
    ],
    documents: [
      "Passport, CV, education, employment, language, financial and route-specific achievement documents.",
      "Advisor-confirmed translations, notarisation/certification, validity windows and document naming conventions.",
    ],
    risks: [
      "Country rules, fees and processing windows change and must be verified close to filing.",
      "Documents that look useful may not satisfy the selected country's legal or evidentiary test.",
    ],
  };
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
    languageTest: pickEnum(a.languageTest, LANGUAGE_TESTS, "not-provided") as HighSkillInput["languageTest"],
    languageScore: toInt(a.languageScore ?? a.ielts, 0),
    evidence,
    citationCount: toInt(a.citationCount ?? a.citations, 0),
    publicationCount: toInt(a.publicationCount ?? a.publications ?? a.papers, 0),
    patentCount: toInt(a.patentCount ?? a.patents, 0),
    resumeFileName: str(a.resumeFileName ?? a.cv),
    resumeParseStatus: pickEnum(a.resumeParseStatus, RESUME_STATUSES, "not-provided") as HighSkillInput["resumeParseStatus"],
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

function languageLabel(input: HighSkillInput): string {
  if (input.languageTest === "not-provided" || input.languageScore <= 0) return input.targetCountry === "usa" ? "Not provided" : "To confirm";
  return `${input.languageTest.toUpperCase()} ${input.languageScore}`;
}

function resumeStatusLabel(input: HighSkillInput): string {
  if (input.resumeParseStatus === "parsed") return "Text extracted and analysed";
  if (input.resumeParseStatus === "needs-review") return "Advisor extraction required";
  return input.profileSummary ? "Manual profile summary" : "Not provided";
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
      { label: "Experience depth", value: expScore, tag: input.yearsExperience ? `${input.yearsExperience} years stated` : "Years to confirm" },
      { label: "Recognition & output", value: recognition, tag: `${recognitionHits}/5 recognition signals` },
      { label: "Leadership & critical role", value: leadership, tag: `${leadershipHits}/4 leadership signals` },
      { label: "Evidence breadth", value: evidenceBreadth, tag: `${evidenceSelected.length}/${EVIDENCE_KEYS.length} categories` },
      { label: "Sponsor / employer support", value: sponsorship, tag: sponsorHits ? `${sponsorHits} support signals` : "Not yet evidenced" },
      { label: "Expert recommendations", value: recommendation, tag: input.evidence.recommendations ? "Letters indicated" : "To collect" },
    ],
    topGaps: top?.gaps ?? [],
  };
}

function sentenceJoin(items: string[], fallback: string): string {
  const clean = items.map((item) => item.trim()).filter(Boolean);
  if (!clean.length) return fallback;
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

function routeStrategy(route: ScoredHighSkillRoute): { posture: string; narrative: string; caution: string; decision: string } {
  const sponsor = route.requiresSponsor
    ? "Because this pathway needs sponsor or employer support, the case strategy should confirm role, petitioner strength, work location, duties, and continuing need before document drafting begins."
    : "Because this pathway can usually be built without employer sponsorship, the strategy should focus on independent proof of merit, impact, recognition, and a coherent future contribution narrative.";
  const permanence = route.permanent
    ? "It is strategically valuable where the client wants settlement or a green-card / PR-style outcome."
    : route.settlementPathway
      ? "It is a temporary or provisional route with a potential settlement pathway, subject to the separate requirements in force at that stage."
      : "It is a temporary route and should not be presented as a direct settlement pathway.";
  const posture =
    route.fitScore >= 82
      ? "Lead-route posture"
      : route.fitScore >= 68
        ? "Strong secondary posture"
        : route.fitScore >= 52
          ? "Build-before-filing posture"
          : "Advisor-review posture";
  const caution =
    route.gaps[0] ??
    (route.requiresSponsor ? "Sponsorship evidence and role fit must be verified before this route is treated as filing-ready." : "Evidence independence must be verified before this route is treated as filing-ready.");
  return {
    posture,
    narrative: `${route.title} is being considered because it matches ${sentenceJoin(route.reasons.slice(0, 3), "the profile inputs provided")}. ${sponsor} ${permanence}`,
    caution,
    decision:
      route.fitScore >= 82
        ? "Keep this as the primary filing direction unless advisor review uncovers a rule, timing, or evidence constraint."
        : route.fitScore >= 68
          ? "Keep this as a live alternative and compare it against the primary route after the evidence pack is reviewed."
          : "Do not spend government or third-party fees on this route until the gaps listed in this report are closed.",
  };
}

function evidenceStatus(input: HighSkillInput, key: HighSkillEvidenceKey): { status: string; tone: PillTone; action: string; proof: string } {
  const has = input.evidence[key];
  const proofByKey: Record<HighSkillEvidenceKey, string> = {
    advancedDegree: "Degree certificates, transcripts, credential evaluations, professional licences, or evidence that education is exceptional in the field.",
    awards: "Award pages, judging criteria, selection statistics, press releases, organiser letters, and proof the award is national or international in reach.",
    publications: "Indexed articles, authored reports, book chapters, conference papers, patents-adjacent technical writing, or field-recognised publications.",
    citations: "Google Scholar / Scopus / Web of Science extracts, citation trend, h-index context, downstream adoption, or objective usage metrics.",
    patents: "Patent grants or filings, assignment documents, product use, licensing, commercial deployment, or invention impact evidence.",
    media: "Independent media coverage, podcast/interview features, industry rankings, public recognition, and evidence that coverage is about your work.",
    judging: "Peer-review invitations, hackathon or award judging, editorial board service, grant review panels, or selection-committee roles.",
    criticalRole: "Organisation charts, appointment letters, project charters, KPI ownership, leadership testimonials, and proof the organisation is notable.",
    highSalary: "Salary slips, contracts, bonus letters, equity grants, market salary benchmarks, tax records, and compensation percentile evidence.",
    leadership: "Founder records, board/management appointment, team size, budget ownership, product ownership, and decision-making authority.",
    businessImpact: "Revenue, user growth, cost savings, patents commercialised, grants won, public benefit, field adoption, or measurable organisational impact.",
    nationalInterest: "Policy relevance, public benefit, critical-sector relevance, economic value, job creation, health/security impact, or expert letters.",
    jobOffer: "Signed offer, role description, salary, reporting line, employer profile, worksite, and evidence the role needs your specialised skills.",
    employerSponsor: "Employer support letter, petitioner details, ability to pay, role necessity, immigration history, and HR / legal coordination readiness.",
    companyTransfer: "Group structure, payroll, managerial/specialised role evidence, overseas tenure, US/target entity need, and qualifying relationship proof.",
    recommendations: "Independent expert letters explaining your impact, why it matters, and how the expert knows your work.",
  };
  return {
    status: has ? "Indicated" : "Priority gap",
    tone: has ? "good" : "warn",
    action: has ? "Verify, label, and connect it to the route criteria." : "Build or substitute with the nearest credible evidence category.",
    proof: proofByKey[key],
  };
}

function evidenceRows(input: HighSkillInput, keys: HighSkillEvidenceKey[]): string[][] {
  return keys.map((key) => {
    const status = evidenceStatus(input, key);
    return [`<strong>${esc(evidenceLabels[key])}</strong>`, pill(status.status, status.tone), esc(status.action), esc(status.proof)];
  });
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function removeLongDashes(html: string): string {
  return html
    .replace(/\s+[\u2014\u2013]\s+/g, ". ")
    .replace(/[\u2014\u2013]/g, "-");
}

function dossierForPaidReport(dossier: Dossier, route: ScoredHighSkillRoute): Dossier {
  const feeWarning = `Government charges and third-party costs are intentionally omitted until a XIPHIAS advisor verifies the current schedule for ${route.title}.`;
  const prepared: Dossier = {
    ...dossier,
    title: route.title,
    tagline: route.summary,
    lastUpdated: route.lastVerified,
    prices: undefined,
    proofOfFunds: undefined,
    governmentFees: undefined,
    riskNotes: [...(dossier.riskNotes ?? []), feeWarning],
  };

  if (route.id === "australia-niv-858") {
    return {
      ...prepared,
      tags: ["National Innovation Visa", "Subclass 858", "Permanent residence", "Invitation required"],
      benefits: [
        "Permanent residence for invited applicants who satisfy the exceptional-achievement requirements.",
        "No points test or employer job offer is required for the National Innovation Visa.",
        "Eligible family members can be included, subject to the application requirements.",
        "The route covers exceptional talent including researchers, entrepreneurs, innovative investors, athletes and creatives.",
      ],
      requirements: [
        "Submit an Expression of Interest and receive an invitation before applying.",
        "Show an internationally recognised record of exceptional and outstanding achievement.",
        "Remain prominent in the area and demonstrate ability to establish in Australia.",
        "Show that the applicant would be an asset to the Australian community.",
        "Provide a qualifying nomination and satisfy health, character and other application requirements.",
      ],
      processSteps: [
        { title: "Evidence and priority assessment", description: "Map achievements against the current NIV invitation priorities and identify the strongest independent proof." },
        { title: "Expression of Interest", description: "Submit the NIV EOI with accurate achievement, sector and contribution information." },
        { title: "Invitation decision", description: "Wait for an invitation. An EOI does not guarantee that the Department will invite an application." },
        { title: "Nomination and visa application", description: "After invitation, complete the qualifying nomination and lodge the subclass 858 application with supporting evidence." },
        { title: "Health, character and merits assessment", description: "Complete required checks and respond to any further-information request before decision." },
      ],
      faq: undefined,
      body: "The National Innovation Visa (subclass 858) is an invitation-only permanent visa for exceptionally talented migrants who can make a significant contribution to Australia. The Department considers an Expression of Interest before deciding whether to invite a visa application.\n\nA premium NIV strategy must establish exceptional and outstanding achievement, current prominence, credible benefit to Australia, a qualifying nomination and evidence aligned with the current invitation priorities. An invitation permits an application; it does not guarantee approval.",
    };
  }

  return prepared;
}

export async function buildDeepAnalysisReport(order: JiopayOrder): Promise<Buffer> {
  const depth = depthFor("deep_analysis");
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  const input = buildHighSkillInput(order);
  const allScored = scoreHighSkillRoutes(input);
  const selected = clientCase.objective.selectedProgrammes.value ?? [];
  const selectedRoutes = selected.flatMap((name) => {
    const hit = allScored.find((route) => referenceMatches(`${route.id} ${route.title}`, name));
    return hit ? [hit] : [];
  });
  const modelCap = clampScore(35 + personalisation.completeness * 0.6);
  const advisorFit = clientCase.advisor.routeFitScore.value;
  const scored = (selectedRoutes.length ? [...selectedRoutes, ...allScored.filter((route) => !selectedRoutes.some((selectedRoute) => selectedRoute.id === route.id))] : allScored)
    .slice(0, input.targetCountry === "global" ? 6 : 3)
    .map((route, index) => ({ ...route, fitScore: index === 0 && advisorFit !== undefined ? clampScore(advisorFit) : Math.min(route.fitScore, modelCap) }));
  const top = scored[0];
  const includesNiv = scored.some((route) => route.id === "australia-niv-858");
  const countryIntel = countryIntelligence(input);
  const completion = highSkillCompletion(input);
  const signals = profileSignals(input, top);
  const logo = await loadLogo();
  const imageCountries = input.targetCountry === "global" ? [...new Set(scored.map((route) => route.country))] : [COUNTRY_LABELS[input.targetCountry]];
  const loadedImageAssets = (await Promise.all(imageCountries.map((countryName) => loadCountryImageAssets(countryName))))
    .flat()
    .filter((asset, index, all) => all.findIndex((candidate) => candidate.source === asset.source) === index);
  const imageAssets = rotateBySeed(
    loadedImageAssets,
    `${order.merchantTxnNo}:${input.targetCountry}:${input.goal}:${input.field}:${top?.id ?? "unranked"}`,
  );
  const dossiers = scored
    .map((route) => {
      if (!route.dossier) return null;
      const dossier = resolveProgramme({
        country: route.dossier.country,
        program: route.dossier.programSlug,
        track: route.dossier.vertical,
      });
      return dossier ? dossierForPaidReport(dossier, route) : null;
    })
    .filter((dossier): dossier is NonNullable<typeof dossier> => Boolean(dossier))
    .filter((dossier, index, all) => all.findIndex((candidate) => `${candidate.vertical}:${candidate.programSlug}` === `${dossier.vertical}:${dossier.programSlug}`) === index)
    .slice(0, depth.maxProgrammes);
  const reservedSources = new Set<string>();
  const dossierImgs = dossiers.map((dossier) => {
    const dossierCountry = str(dossier.countrySlug ?? dossier.country).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const countryFragments = dossierCountry === "united-kingdom" ? ["/united-kingdom/", "/uk/"] : dossierCountry === "united-states" ? ["/united-states/", "/usa/"] : [`/${dossierCountry}/`];
    const dossierAssets = imageAssets.filter((asset) => countryFragments.some((fragment) => asset.source.toLowerCase().includes(fragment)));
    const subclass = (dossier.title ?? "").match(/(?:subclass\s*)?(\d{3})/i)?.[1];
    const dossierTitle = (dossier.title ?? "").toLowerCase();
    const programmeSlug = str(dossier.programSlug).toLowerCase();
    const namedDivider = programmeSlug === "express-entry"
      ? "divider-express-entry"
      : programmeSlug === "provincial-nominee-program"
        ? "divider-bc-pnp"
      : dossierTitle.includes("canadian experience class") || dossierTitle.includes("(cec)")
        ? "divider-cec"
        : dossierTitle.includes("federal skilled trades") || dossierTitle.includes("(fstp)")
          ? "divider-fstp"
      : dossierTitle.includes("bc pnp") || (dossierTitle.includes("british columbia") && dossierTitle.includes("entrepreneur"))
        ? "divider-bc-pnp"
        : dossierTitle.includes("start-up visa") || dossierTitle.includes("start up visa")
          ? "divider-start-up"
          : undefined;
    const dividerFragment = subclass ? `divider-${subclass}-` : namedDivider;
    const divider = dividerFragment
      ? dossierAssets.find(
          (asset) => asset.source.toLowerCase().includes(dividerFragment) && !reservedSources.has(asset.source),
        )
      : undefined;
    if (divider) reservedSources.add(divider.source);
    const customSnapshot = subclass
      ? dossierAssets.find(
          (asset) => asset.source.toLowerCase().includes(`snapshot-${subclass}-`) && !reservedSources.has(asset.source),
        )
      : undefined;
    const heroBase = dossier.heroImage?.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "").toLowerCase();
    const heroSnapshot = heroBase
      ? dossierAssets.find((asset) => asset.source.toLowerCase().includes(heroBase) && !reservedSources.has(asset.source))
      : undefined;
    const programmeSnapshot = subclass
      ? dossierAssets.find(
          (asset) =>
            asset.source.toLowerCase().includes("/images/skilled/") &&
            asset.source.toLowerCase().includes(`-${subclass}-`) &&
            !reservedSources.has(asset.source),
        )
      : undefined;
    const fallback = [...dossierAssets].reverse().find(
      (asset) =>
        !reservedSources.has(asset.source) &&
        !isEditorialRoleSource(asset.source) &&
        !asset.source.includes("/generated/") &&
        !asset.source.toLowerCase().includes("/divider-") &&
        !/\/cover\.[a-z0-9]+$/i.test(asset.source),
    );
    const selectedSnapshot = customSnapshot ?? heroSnapshot ?? programmeSnapshot ?? fallback;
    if (selectedSnapshot) reservedSources.add(selectedSnapshot.source);
    return [divider?.uri, selectedSnapshot?.uri].filter((uri): uri is string => Boolean(uri));
  });
  const editorialAssets = imageAssets.filter((asset) => !reservedSources.has(asset.source));

  const reportTitle = "High-Skill Deep Analysis Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Deep Analysis", label);
  const head = runningHeader(reportTitle, { country: COUNTRY_LABELS[input.targetCountry], route: top?.title });
  const basisPage = reportBasisPage({ header: head, footer: foot("Case basis"), basis: reportBasis(clientCase, personalisation) });

  const avgTop3 = scored.slice(0, 3).reduce((sum, r) => sum + r.fitScore, 0) / Math.max(1, Math.min(3, scored.length));
  const totalEvidenceCategories = highSkillRoutes.reduce(
    (set, r) => {
      Object.keys(r.evidenceWeights).forEach((k) => set.add(k));
      return set;
    },
    new Set<string>(),
  ).size;
  const usedImages = new Set<string>();
  const roleImg = (sourceFragment: string): string | undefined => {
    const match = editorialAssets.find(
      (asset) => asset.source.toLowerCase().includes(sourceFragment.toLowerCase()) && !usedImages.has(asset.uri),
    );
    if (!match) return undefined;
    usedImages.add(match.uri);
    return match.uri;
  };
  const nextImg = (preferredIndex?: number): string | undefined => {
    if (typeof preferredIndex === "number") {
      const preferred = editorialAssets[preferredIndex]?.uri;
      if (preferred && !usedImages.has(preferred)) {
        usedImages.add(preferred);
        return preferred;
      }
    }
    const next = editorialAssets.find((asset) => !isEditorialRoleSource(asset.source) && !usedImages.has(asset.uri))?.uri;
    if (!next) return undefined;
    usedImages.add(next);
    return next;
  };
  const fieldVisual = (): string | undefined => {
    const preferredFragment = input.field === "technology"
      ? "technology-leadership"
      : input.field === "science" || input.field === "healthcare" || input.field === "academia"
        ? "critical-technology-research"
        : input.field === "business"
          ? "contribution-strategy"
          : "evidence-review";
    return roleImg(preferredFragment) ?? nextImg();
  };
  const coverImg = roleImg("/cover.") ?? nextImg(0);

  // 1. Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: undefined,
    cardImageDataUri: undefined,
    heroImageDataUri: coverImg,
    eyebrow: "XIA · Deep Analysis",
    title: "High-Skill Deep Analysis Report",
    preparedFor: order.customer.name,
    profileLine: caseCoverProfileLine(clientCase),
    subtitle:
      input.targetCountry === "global"
        ? "An evidence-led analysis of your high-skill profile, ranking the visa routes that best match your achievements, recognition and target."
        : `An evidence-led ${COUNTRY_LABELS[input.targetCountry]} analysis of your high-skill profile, route fit, evidence strength and filing readiness.`,
    chips: [
      `Target: ${COUNTRY_LABELS[input.targetCountry]}`,
      `Field: ${titleCase(input.field)}`,
      `Goal: ${goalLabel(input.goal)}`,
    ],
    fitScore: top?.fitScore,
    fitLabel: top ? fitLabel(top.fitScore) : undefined,
    countryLabel: COUNTRY_LABELS[input.targetCountry],
    dateLabel: dateLabel(),
  });

  // 2. Profile snapshot
  const briefCards = grid(3, [
    card({ k: "Target country", v: COUNTRY_LABELS[input.targetCountry] }),
    card({ k: "Primary goal", v: goalLabel(input.goal) }),
    card({ k: "Field", v: titleCase(input.field) }),
    card({ k: "Role", v: titleCase(input.role) }),
    card({ k: "Age", v: input.age > 0 ? `${input.age} years` : "To confirm" }),
    card({ k: "Education", v: educationLabel(input.education) }),
    card({ k: "Experience", v: input.yearsExperience > 0 ? `${input.yearsExperience} years` : "To confirm" }),
    card({ k: "Language evidence", v: languageLabel(input) }),
    card({ k: "CV analysis", v: resumeStatusLabel(input), note: input.resumeFileName || "Profile based on submitted answers." }),
  ]);
  const briefPage = page({
    header: head,
    body:
      heroBand(nextImg(), {
        eyebrow: "Target destination",
        title: top ? `${COUNTRY_LABELS[input.targetCountry]} · ${top.title}` : COUNTRY_LABELS[input.targetCountry],
      }) +
      sectionHeader({
        eyebrow: "Profile snapshot",
        title: "The profile this analysis is built on",
        desc: "Your high-skill routes are ranked against approved XIPHIAS visa intelligence using the inputs below. The advisor review confirms final evidence positioning.",
      }) +
      briefCards +
      `<div class="spacer-8"></div>` +
      scoreBar({ label: "Profile depth captured", value: completion, tag: completion >= 70 ? "Strong detail provided" : "Add detail to sharpen the analysis" }) +
      `<div class="spacer-8"></div>` +
      callout({
        k: "Headline read",
        text: top
          ? `${selectedRoutes.length ? "The advisor-selected route begins with" : "The current model ranks"} ${top.title} (${top.country}) at ${clampScore(top.fitScore)}/100 from ${personalisation.completeness}% core profile completeness. Treat the score as directional until the evidence claims and route criteria are verified.`
          : "Provide more profile detail with an advisor to surface a stronger ranked shortlist of high-skill routes.",
      }),
    footer: foot("02"),
  });

  const cvText = input.profileSummary.trim();
  const researchOutput = input.publicationCount > 0 || input.citationCount > 0
    ? `${input.publicationCount > 0 ? `${input.publicationCount} publication${input.publicationCount === 1 ? "" : "s"}` : "Publication count not supplied"} · ${input.citationCount > 0 ? `${input.citationCount} citation${input.citationCount === 1 ? "" : "s"}` : "Citation count not supplied"}`
    : input.evidence.publications || input.evidence.citations
      ? "Research or recognition signal selected"
      : "Not stated";
  const innovationOutput = input.patentCount > 0
    ? `${input.patentCount} patent${input.patentCount > 1 ? "s" : ""}`
    : input.evidence.patents
      ? "Patent, IP or innovation signal selected"
      : "Not stated";
  const cvPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "CV intelligence",
        title: "How your submitted career record shaped this analysis",
        desc: "The report uses the extracted CV text and assessment evidence as profile signals. An advisor still verifies every material claim against the original document.",
      }) +
      grid(3, [
        card({ k: "CV source", v: input.resumeFileName || "Manual summary" }),
        card({ k: "Extraction status", v: resumeStatusLabel(input) }),
        card({ k: "Profile text analysed", v: cvText ? `${cvText.length.toLocaleString("en-IN")} characters` : "No text supplied" }),
        card({ k: "Research output", v: researchOutput, note: input.publicationCount || input.citationCount ? undefined : "A count was not supplied in the assessment." }),
        card({ k: "Innovation", v: innovationOutput, note: input.patentCount ? undefined : "A patent count was not supplied in the assessment." }),
        card({ k: "Evidence flags", v: `${signals.evidenceSelected.length} of ${EVIDENCE_KEYS.length}` }),
      ]) +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Profile extract used for route matching</h3>` +
      `<div class="prose"><p>${cvText ? esc(cvText.slice(0, 1_400)).replace(/\n/g, "<br/>") : "No CV text was available. Route scoring is based only on the structured assessment answers and must be treated as preliminary."}</p></div>` +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Verification boundary",
        text: input.resumeParseStatus === "parsed"
          ? "Text extraction succeeded. Formatting, tables, images, signatures and scanned attachments are not treated as verified evidence until an advisor reviews the original CV and supporting documents."
          : "No machine-readable CV was confirmed. Paste the full career record or provide an OCR-readable file before treating this as a document-personalised assessment.",
      }),
    footer: foot("CV intelligence"),
  });

  // 3. Profile-signal scorecard
  const scorecardPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Profile signals",
        title: "Your evidence & profile-signal scorecard",
        desc: "Directional strength of each signal that high-skill visa officers weigh. Scores reflect what you have stated so far and rise as verifiable evidence is added.",
      }) +
      signals.bars.slice(0, 5).map((bar) => scoreBar(bar)).join("") +
      `<div class="spacer-16"></div>` +
      grid(3, [
        card({ k: "Evidence categories", v: `${signals.evidenceSelected.length} / ${EVIDENCE_KEYS.length}`, note: "Independent categories you have flagged across the high-skill criteria set." }),
        card({ k: "Top route fit", v: top ? `${clampScore(top.fitScore)} / 100` : "To confirm", note: top ? top.tier : "Refine inputs to rank routes." }),
        card({ k: "Shortlist strength", v: `${clampScore(avgTop3)} / 100`, note: "Average fit across your three strongest matches." }),
      ]),
    footer: foot("03"),
  });
  const scorecardDetailPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Profile signals continued",
        title: "Sponsor support and recommendation readiness",
        desc: "These supporting signals often decide whether the strongest route is ready for filing or needs more preparation.",
      }) +
      signals.bars.slice(5).map((bar) => scoreBar(bar)).join("") +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Advisor note",
        text: "Employer support and expert letters should be reviewed for independence, detail, authority and consistency with the CV before they are relied on in a filing.",
      }),
    footer: foot("03B"),
  });

  // 4. Top recommended route
  const topPage = top
    ? page({
        header: head,
        body:
          sectionHeader({ eyebrow: "Primary recommendation", title: top.title, desc: top.summary }) +
          grid(3, [
            card({ k: "Country", v: top.country }),
            card({ k: "Visa family", v: top.visaFamily }),
            card({ k: "Timeline", v: top.timeline }),
            card({ k: "Pathway type", v: top.permanent ? "Permanent residency" : top.settlementPathway ? "Temporary with settlement pathway" : "Temporary route" }),
          ]) +
          `<div class="spacer-8"></div>` +
          scoreBar({ label: "Route fit", value: top.fitScore, tag: fitLabel(top.fitScore) }) +
          `<div class="spacer-8"></div>` +
          `<h3 class="h-sub">Why this route fits your profile</h3>` +
          ticks(top.reasons.length ? top.reasons.slice(0, 3) : ["Matched against your target, field, education and evidence inputs."]) +
          (top.gaps.length
            ? `<div class="spacer-8"></div><h3 class="h-sub">What to strengthen</h3>` + ticks(top.gaps.slice(0, 2))
            : "") +
          `<div class="spacer-8"></div>` +
          callout({
            k: "Best suited to",
            text: `Typically strong for ${top.bestFor.slice(0, 4).join(", ")}.${top.requiresSponsor ? " This route relies on employer or sponsor support, which should be secured early." : " This route does not require employer sponsorship, so you can self-petition on evidence."}`,
          }),
        footer: foot("04"),
      })
    : "";

  // 5. Ranked visa-family comparison
  const rows = scored.map((r) => [
    `<strong>${esc(r.title)}</strong>`,
    esc(r.country),
    esc(r.visaFamily),
    pill(`${clampScore(r.fitScore)}`, tierTone(r.tier)),
    pill(r.tier, tierTone(r.tier)),
    pill(titleCase(r.difficulty.replace(/-/g, " ")), difficultyTone(r.difficulty)),
    esc(r.permanent ? "Permanent" : "Temporary"),
  ]);
  const comparePages = chunk(rows, 4).map((pageRows, index) => page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Ranked comparison",
        title:
          index > 0
            ? "Ranked visa families (continued)"
            : input.targetCountry === "global"
            ? "Your high-skill visa families, ranked"
            : `Your ${COUNTRY_LABELS[input.targetCountry]} high-skill route family`,
        desc:
          input.targetCountry === "global"
            ? "The strongest visa families for your profile, ranked by fit score. Scores are directional advisory signals confirmed at advisor review."
            : `This report is scoped to ${COUNTRY_LABELS[input.targetCountry]}. Scores are directional advisory signals confirmed at advisor review, with outside-country alternatives intentionally excluded.`,
      }) +
      (index === 0 && input.targetCountry === "global" ? bigStats([
        { k: "Routes ranked", v: `${scored.length}`, n: "matched to your profile" },
        { k: "Top route fit", v: top ? `${clampScore(top.fitScore)}` : "To confirm", n: top ? `${top.country} · ${top.tier}` : "refine inputs" },
        { k: "Shortlist strength", v: `${clampScore(avgTop3)}`, n: "average of your top 3" },
        { k: "Permanent options", v: `${scored.filter((r) => r.permanent).length}`, n: "lead to residency" },
      ]) : "") +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Visa route", "Country", "Family", "Fit", "Tier", "Difficulty", "Pathway"],
        rows: pageRows,
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "How to read this ranking",
        text: "Fit scores are directional signals from your profile and evidence. Your dedicated readiness scorecard and evidence-gap map show exactly where to focus before filing.",
      }),
    footer: foot(index === 0 ? "05" : `05.${index + 1}`),
  }));

  const countryOverviewPage = featurePage({
    header: head,
    footer: foot("Country intelligence"),
    imageDataUri: fieldVisual(),
    imageAlt: `${COUNTRY_LABELS[input.targetCountry]} destination`,
    capEyebrow: COUNTRY_LABELS[input.targetCountry],
    capTitle: "Country-specific analysis",
    eyebrow: "Country intelligence",
    title: countryIntel.title,
    desc: countryIntel.routeLens,
    content:
      `<h3 class="h-sub">How this destination should be read</h3>` +
      ticks(countryIntel.ecosystem) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Scope correction",
        text:
          input.targetCountry === "global"
            ? "Because the target is open globally, this report can compare countries. If a buyer selects a country, the report narrows to that country only."
            : `Because the buyer selected ${COUNTRY_LABELS[input.targetCountry]}, this report does not add ${outsideCountryLabels(input.targetCountry)} alternatives unless the advisor later changes the target.`,
      }),
  });

  const countryFilingPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Country filing lens",
        title: `What XIPHIAS should verify for ${COUNTRY_LABELS[input.targetCountry]}`,
        desc: "These country-specific checks make the report richer than a generic route score and give the advisor a clear verification agenda.",
      }) +
      grid(2, [
        card({ k: "Destination", v: COUNTRY_LABELS[input.targetCountry], note: "All route analysis in this report is scoped to this selected country." }),
        card({ k: "Primary route", v: top?.title ?? "To confirm", note: top ? `${top.tier} · ${clampScore(top.fitScore)}/100 fit` : "Advisor review required." }),
        card({ k: "Evidence style", v: top?.requiresSponsor ? "Sponsor + profile proof" : "Applicant evidence proof", note: top?.requiresSponsor ? "Employer control is a key filing dependency." : "Independent achievement evidence carries the case." }),
        card({ k: "Advisor task", v: "Verify current rules", note: "Official criteria, fees, occupations, invitations and processing windows are confirmed before filing." }),
      ]) +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Country-specific questions</h3>` +
      ticks(countryIntel.filingLenses),
    footer: foot("Country filing lens"),
  });

  const countryDocumentsPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Country document lens",
        title: `Documents to prepare for ${COUNTRY_LABELS[input.targetCountry]}`,
        desc: "These proof areas should be reviewed for validity, consistency, translation needs and route-specific evidentiary value.",
      }) +
      table({
        head: ["Document / proof area", "Why it matters"],
        rows: countryIntel.documents.map((item) => [esc(item), esc("Advisor checks validity, consistency, translation/certification needs and route-specific evidentiary value.")]),
      }),
    footer: foot("Country documents"),
  });

  const australiaPriorityPage = input.targetCountry === "australia" && includesNiv
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "Official priority framework",
            title: "Where your National Innovation profile may sit",
            desc: "Home Affairs uses a priority framework for National Innovation visa invitations and processing. Priority is not the same as eligibility, so the advisor must test both separately.",
          }) +
          table({
            head: ["Priority", "Official positioning", "Evidence question for this profile"],
            rows: [
              ["1", "Global expert with an international top-of-field award", "Is there a qualifying award and objective proof that it represents the highest level in the field?"],
              ["2", "Exceptional candidate nominated by an expert Australian government agency", "Is a Commonwealth, state or territory agency prepared to nominate and support the contribution case?"],
              ["3", "Exceptional candidate in critical technologies, renewables or health industries", `Does the ${titleCase(input.field)} profile show internationally recognised impact and future Australian benefit in a priority sector?`],
              ["4", "Exceptional candidate in other named priority sectors", "If the sector sits outside Priority 3, is the achievement record strong enough to remain competitive under the relevant priority lens?"],
            ].map((row) => row.map(esc)),
          }) +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Profile-specific read",
            text: input.field === "technology"
              ? "A technology profile should not rely on job title alone. The case needs to connect the applicant's work to a critical-technology domain, demonstrate exceptional standing, and quantify the contribution Australia can realistically gain."
              : "The advisor should map the applicant's field to the current priority framework, then test whether the evidence demonstrates exceptional standing rather than ordinary professional success.",
          }) +
          disclaimer("Source context: Australian Department of Home Affairs, National Innovation visa priorities and official immigration programme administration guidance. Current settings must be rechecked before submission."),
        footer: foot("NIV priority position"),
      })
    : "";

  const australiaSubmissionPage = input.targetCountry === "australia" && includesNiv
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "EOI and nomination controls",
            title: "Submission gates that change the case strategy",
            desc: "A premium report should show not only what to prove, but when the evidence becomes locked, what deadlines follow, and which claims must remain consistent across every stage.",
          }) +
          grid(2, [
            card({ k: "Before EOI", v: "Lock the claim set", note: "Home Affairs states that information cannot be added to the EOI after submission. Review facts, dates, achievements and attachments before filing." }),
            card({ k: "Core attachments", v: "Prepare the base record", note: "Passport bio page, CV, highest qualification evidence and relevant nomination documents form the official starting set." }),
            card({ k: "After invitation", v: "60-day visa window", note: "An invitation starts a limited period to lodge the visa application. Invitation is not a pre-assessment of eligibility." }),
            card({ k: "NSW nomination lens", v: "Evidence before ROI", note: "NSW guidance expects claims to be backed by evidence and asks for credible references, achievements, local connections and a contribution plan." }),
          ]) +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Decision consequence",
            text: "Treat the EOI as a controlled submission, not a draft profile. The evidence list, chronology, referee strategy and contribution case should be reviewed together before any claim becomes fixed.",
          }) +
          disclaimer("Source context: Australian Department of Home Affairs, Submitting your Expression of Interest; NSW Government, NIV registration guidance. Current deadlines and state processes must be rechecked before submission."),
        footer: foot("EOI and nomination gates"),
      })
    : "";

  const australiaEvidenceControlPage = input.targetCountry === "australia" && includesNiv
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "Evidence control matrix",
            title: "Build one proof system across every submission",
            desc: "The strongest file keeps each claim, source document, referee statement and contribution outcome aligned from the first EOI through the final visa application.",
          }) +
          table({
            head: ["Evidence workstream", "What the buyer should prepare", "Advisor quality test"],
            rows: [
              ["Achievement record", "Awards, patents, products, publications, funding, revenue, adoption and leadership proof", "Independent, dated, attributable and material to the field"],
              ["Referee strategy", "Two credible sources where a state nomination pathway expects them, plus Form 1000 nominator positioning where relevant", "Authority, direct knowledge, independence and criterion-specific detail"],
              ["Australian contribution", "Three-to-five-year plan covering innovation, jobs, collaboration, commercialisation or sector capability", "Specific partners, realistic outputs and measurable benefit"],
              ["Consistency control", "One verified chronology across CV, EOI, ROI, forms, letters and exhibits", "No title, date, employer, qualification or achievement conflicts"],
            ].map((row) => row.map(esc)),
          }) +
          `<div class="spacer-8"></div>` +
          callout({
            k: "Control rule",
            text: "Use one verified chronology and flag every claim that depends on a referee, nominator, employer or government agency before the EOI or application is submitted.",
          }) +
          disclaimer("Source context: Australian Department of Home Affairs, Submitting your Expression of Interest; NSW Government, NIV registration and supporting-document guides. State processes vary and must be verified for the selected nomination strategy."),
        footer: foot("Evidence control matrix"),
      })
    : "";

  const countryRiskPage = splitPage({
    header: head,
    footer: foot("Country risk"),
    imageDataUri: undefined,
    capEyebrow: "Risk control",
    capTitle: COUNTRY_LABELS[input.targetCountry],
    content:
      sectionHeader({
        eyebrow: "Country-specific risk",
        title: `Risks to control before filing in ${COUNTRY_LABELS[input.targetCountry]}`,
        desc: "This is where the paid report should be explicit: what looks promising, what can fail, and what must be proven before spending on a filing.",
      }) +
      ticks(countryIntel.risks) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Advisor decision gate",
        text: `The filing should move forward only after the ${COUNTRY_LABELS[input.targetCountry]} route, evidence standard, document set, timing and current government requirements are verified against the buyer's actual CV and documents.`,
      }),
  });

  // Premium value framing helps a paid report feel consultative, not like a quiz result.
  const valuePage = featurePage({
    header: head,
    footer: foot("06"),
    imageDataUri: roleImg("evidence-review") ?? nextImg(),
    imageAlt: "Advisor and applicant reviewing an evidence portfolio",
    eyebrow: "Deep analysis scope",
    title: "What you receive beyond a free eligibility score",
    desc: "This report is designed as a working advisory brief: it ranks route fit, explains trade-offs, turns evidence into a case plan, and prepares the advisor review.",
    content:
      grid(2, [
        card({ k: "Route intelligence", v: "Ranked shortlist", note: "Your routes are compared by country fit, goal fit, evidence fit, sponsor dependency, timeline and permanence." }),
        card({ k: "Evidence engineering", v: "Case-building plan", note: "Each signal is converted into document, proof and narrative actions instead of a generic checklist." }),
        card({ k: "Risk control", v: "Pre-filing review map", note: "The report identifies weak points that should be resolved before paying government or third-party fees." }),
        card({ k: "Advisor handoff", v: "Ready for review", note: "The output gives the advisory desk a structured starting point for a faster, sharper strategy call." }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Why this matters at this price point",
        text: "Premium buyers are not paying for a longer PDF; they are paying for route judgment, evidence prioritisation, risk awareness, and a clear next move. This template is built around those decisions.",
      }),
  });

  const methodologyPage = featurePage({
    header: head,
    footer: foot("07"),
    imageDataUri: roleImg("critical-technology-research") ?? nextImg(),
    imageAlt: "Critical-technology researchers reviewing a prototype",
    eyebrow: "Scoring logic",
    title: "How your route ranking was built",
    desc: "The scoring model reads the profile as a visa officer or reviewing advisor would: objective eligibility first, then evidence strength, then strategic fit.",
    content:
      steps([
        { title: "Normalise the profile", body: "Country, goal, field, role, education, experience, language score and evidence flags are converted into a clean high-skill profile." },
        { title: "Score each route family", body: "Each high-skill route is scored against its own evidence weights, sponsor requirements, country focus, permanence and difficulty." },
        { title: "Separate fit from readiness", body: "A high fit route can still need evidence work. The report therefore shows both route-fit and evidence gaps." },
        { title: "Check same-country route lenses", body: "Where the destination has multiple route families, the report keeps those inside the selected country and separates talent, points-tested, sponsor-led and staged options." },
        { title: "Prepare advisor verification", body: "The final filing decision is made only after current rules, document quality and evidence consistency are reviewed by XIPHIAS." },
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Important distinction",
        text: "This is a planning analysis, not a visa-office decision. Its value is in showing what to file, what not to file yet, and what to build before an advisor commits to a route.",
      }),
  });

  const routeMatrixPages = chunk(scored, 4).map((matrixRoutes, index) => page({
    header: head,
    body:
      sectionHeader({
        eyebrow: index === 0 ? "Decision matrix" : "Decision matrix continued",
        title: index === 0 ? "How your shortlisted routes compare strategically" : "Strategic route comparison (continued)",
        desc: "A premium route decision is not just the highest score. It weighs evidence burden, sponsor control, permanence, difficulty and time sensitivity.",
      }) +
      table({
        head: ["Route", "Strategic posture", "Control point", "Main caution"],
        rows: matrixRoutes.map((r) => {
          const strategy = routeStrategy(r);
          return [
            `<strong>${esc(r.title)}</strong><br/><span class="muted">${esc(r.country)} · ${esc(r.timeline)}</span>`,
            esc(strategy.posture),
            esc(r.requiresSponsor ? "Sponsor / employer support" : "Applicant evidence strength"),
            esc(strategy.caution),
          ];
        }),
      }) +
      `<div class="spacer-16"></div>` +
      (index === 0 ? bigStats([
        { k: "Self-petition style routes", v: `${scored.filter((r) => !r.requiresSponsor).length}`, n: "more applicant-controlled" },
        { k: "Sponsor-led routes", v: `${scored.filter((r) => r.requiresSponsor).length}`, n: "employer/control dependent" },
        { k: "Permanent routes", v: `${scored.filter((r) => r.permanent).length}`, n: "settlement-oriented" },
        { k: "High difficulty routes", v: `${scored.filter((r) => r.difficulty !== "moderate").length}`, n: "evidence-heavy" },
      ]) : ""),
    footer: foot(index === 0 ? "08" : `08.${index + 1}`),
  }));

  const selectedEvidenceKeys = EVIDENCE_KEYS.filter((key) => input.evidence[key]);
  const priorityEvidenceKeys = Array.from(
    new Set<HighSkillEvidenceKey>([
      ...(top
        ? Object.entries(top.evidenceWeights)
            .sort((a, b) => (b[1] || 0) - (a[1] || 0))
            .map(([key]) => key as HighSkillEvidenceKey)
        : []),
      ...selectedEvidenceKeys,
      ...EVIDENCE_KEYS,
    ]),
  );

  const evidenceArchitecturePages = chunk(priorityEvidenceKeys, 3).map((keys, idx) =>
    page({
      header: head,
      body:
        sectionHeader({
          eyebrow: idx === 0 ? "Evidence architecture" : "Evidence architecture continued",
          title: idx === 0 ? "Turn evidence signals into a filing-ready proof system" : "Evidence proof system (continued)",
          desc:
            idx === 0
              ? "High-skill decisions are won on independent, consistent, criterion-mapped proof. Use this map to convert your answers into advisor-reviewable exhibits."
              : "Continue building proof by category. Items already indicated still need verification, labels, translations and route-specific narrative placement.",
        }) +
        table({ head: ["Evidence category", "Status", "Advisor action", "Proof to prepare"], rows: evidenceRows(input, keys) }) +
        `<div class="spacer-16"></div>` +
        callout({
          k: idx === 0 ? "Evidence principle" : "Packaging note",
          text:
            idx === 0
              ? "A strong case does not simply attach documents. It explains why each document proves a legal criterion, why the source is independent, and why the achievement matters."
              : "Documents should be grouped by criterion, named consistently, cross-referenced in the case narrative, and checked for date/title/name mismatches before filing.",
        }),
      footer: foot(`Evidence ${idx + 1}`),
    }),
  );

  const routeDeepDivePages = scored.flatMap((route, idx) => {
    const strategy = routeStrategy(route);
    const weightedKeys = Object.entries(route.evidenceWeights)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .map(([key]) => key as HighSkillEvidenceKey)
      .slice(0, 6);
    const routeProofRows = weightedKeys.map((key) => {
      const status = evidenceStatus(input, key);
      return [
        `<strong>${esc(evidenceLabels[key])}</strong>`,
        pill(status.status, status.tone),
        esc(input.evidence[key] ? "Use as a route-supporting exhibit." : "Build before this route is treated as filing-ready."),
      ];
    });
    return [
      featurePage({
        header: head,
        footer: foot(`Route ${idx + 1}`),
        imageDataUri: nextImg(),
        imageAlt: `${route.country} high-skill route context`,
        capEyebrow: route.country,
        capTitle: route.title,
        eyebrow: `Route deep dive ${idx + 1}`,
        title: route.title,
        desc: route.summary,
        content:
          grid(2, [
            card({ k: "Fit score", v: `${clampScore(route.fitScore)} / 100`, note: fitLabel(route.fitScore) }),
            card({ k: "Strategic posture", v: strategy.posture, note: route.tier }),
            card({ k: "Timeline", v: route.timeline, note: titleCase(route.difficulty.replace(/-/g, " ")) }),
            card({ k: "Pathway control", v: route.requiresSponsor ? "Sponsor-led" : "Applicant-led", note: route.permanent ? "Permanent pathway" : route.settlementPathway ? "Staged settlement pathway" : "Temporary pathway" }),
          ]) +
          `<div class="spacer-16"></div>` +
          callout({ k: "Advisor read", text: strategy.narrative }) +
          `<div class="spacer-8"></div>` +
          disclaimer(`Programme status: ${route.status}. Official source verified ${route.lastVerified}: ${route.officialUrl}`),
      }),
      page({
        header: head,
        body:
          sectionHeader({
            eyebrow: `Route evidence ${idx + 1}`,
            title: `Evidence plan for ${route.title}`,
            desc: "The categories below are the highest-impact proof areas for this route. Your advisor confirms substitutes where a category is weak or unavailable.",
          }) +
          table({ head: ["High-impact criterion", "Current status", "How to use it"], rows: routeProofRows }),
        footer: foot(`Route ${idx + 1} evidence`),
      }),
      page({
        header: head,
        body:
          sectionHeader({
            eyebrow: `Route decision ${idx + 1}`,
            title: `Advisor decision lens for ${route.title}`,
            desc: "Use this page to decide whether the route is ready to file, should be strengthened first, or should remain a staged option.",
          }) +
          `<h3 class="h-sub">Why this route may work</h3>` +
          ticks(route.reasons.length ? route.reasons : ["Profile, field and goal signals should be reviewed against the current route rules."]) +
          (route.gaps.length ? `<div class="spacer-8"></div><h3 class="h-sub">Open risks before filing</h3>` + ticks(route.gaps) : "") +
          `<div class="spacer-16"></div>` +
          callout({ k: "Decision rule", text: strategy.decision }),
        footer: foot(`Route ${idx + 1} decision`),
      }),
    ];
  });

  const reportScopePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Your decision record",
        title: `How this analysis is structured for ${order.customer.name}`,
        desc: "Each section below connects the supplied profile to a decision that must be made before filing. Missing or unverified facts remain explicit rather than being replaced with assumptions.",
      }) +
      table({
        head: ["Decision area", "This report uses", "Result"],
        rows: [
          ["Primary route", top?.title ?? "Not confirmed", top ? `${clampScore(top.fitScore)}/100 (${top.tier})` : "More profile evidence required"],
          ["Destination", COUNTRY_LABELS[input.targetCountry], "Route comparisons remain within the stated country focus"],
          ["Professional profile", `${titleCase(input.role || input.field)}; ${input.yearsExperience} years indicated`, "Matched against route-specific professional and evidence signals"],
          ["Evidence position", `${Object.values(input.evidence).filter(Boolean).length} evidence signals indicated`, "Converted into strengths, gaps and a preparation sequence"],
          ["Advisor handoff", "Open criteria, inconsistencies and verification questions", "A focused brief for current-rule and document review"],
        ].map((row) => row.map(esc)),
      }),
    footer: foot("Decision record"),
  });

  const advisorPrepPage = featurePage({
    header: head,
    footer: foot("Advisor prep"),
    imageDataUri: roleImg("advisor-consultation") ?? nextImg(),
    imageAlt: "Professional advisor preparation session",
    imageSide: "left",
    eyebrow: "Advisor preparation",
    title: "Questions your advisor should answer before you file",
    desc: "Use these questions to convert the report into a verified strategy call, especially where evidence is thin or timelines are sensitive.",
    content:
      ticks([
        top ? `Is ${top.title} still the strongest route after reviewing my CV and documents?` : "Which route should be treated as primary after reviewing my CV and documents?",
        "Which evidence category gives my case the highest marginal improvement?",
        "Which evidence item looks strong but may not satisfy the route's legal test?",
        "What is the weakest inconsistency in my profile, dates, titles, salary or documents?",
        "Should I build a self-petition strategy, sponsor-led strategy, or staged backup route?",
        "What current rule, cap, processing delay or policy shift could change this recommendation?",
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Bring to the call",
        text: "CV, passport, degree proof, employment letters, award links, publications, media, salary proof, organisation evidence and any sponsor/job documents.",
      }),
  });

  const ninetyDayPage = page({
    header: head,
    body:
      heroBand(nextImg(), { eyebrow: "Execution plan", title: "The next 90 days after purchase" }) +
      sectionHeader({
        eyebrow: "Roadmap",
        title: "From paid analysis to filing-ready strategy",
        desc: "A premium assessment should lead to motion. This sequence converts the report into advisor review, evidence build, and route commitment.",
      }) +
      table({
        head: ["Window", "Focus", "Output"],
        rows: [
          ["Days 1-7", "Advisor verification", "Confirm primary route, backup route, current rules, and urgent evidence gaps."],
          ["Days 8-21", "Evidence mobilisation", "Collect high-impact proof, request letters, export citations/media, and secure employer documents if needed."],
          ["Days 22-45", "Narrative build", "Convert achievements into route criteria, map exhibits, identify weak documents and substitutions."],
          ["Days 46-70", "Document QA", "Check names, dates, translations, validity, signatures, compensation proof and independent-source credibility."],
          ["Days 71-90", "Filing decision", "Lock route, confirm costs, finalise timeline, and move into full representation or staged evidence building."],
        ].map((row) => row.map(esc)),
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Best outcome",
        text: "By day 90, you should know whether to file now, build for a stronger filing later, or switch to a route with better timing and lower evidence risk.",
      }),
    footer: foot("90-day plan"),
  });

  const xiphiasHelpPage = featurePage({
    header: head,
    footer: foot("How XIPHIAS helps"),
    imageDataUri: roleImg("contribution-strategy") ?? nextImg(),
    imageAlt: "XIPHIAS advisor presenting a country-specific contribution strategy",
    eyebrow: "How XIPHIAS can help",
    title: `Turning this ${COUNTRY_LABELS[input.targetCountry]} analysis into a real case plan`,
    desc: "The report is the diagnostic layer. XIPHIAS helps convert it into advisor-verified route selection, evidence engineering, document readiness and filing execution.",
    content:
      grid(2, [
        card({ k: "Advisor validation", v: "Confirm the route", note: "A XIPHIAS advisor checks current rules, invitation logic, occupation/sector fit, timing and final eligibility." }),
        card({ k: "Evidence engineering", v: "Build the proof", note: "Achievements are mapped into route criteria, with weak evidence replaced or strengthened before filing." }),
        card({ k: "Document QA", v: "Reduce avoidable risk", note: "Names, dates, roles, translations, validity windows and source consistency are checked before submission." }),
        card({ k: "Case execution", v: "Move with control", note: "The advisor team coordinates milestones, filing preparation, government correspondence and next-step planning." }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Recommended next step",
        text: top
          ? `Book an advisor evidence review for ${top.title}. Bring your CV, proof of achievements, employment documents, education records and any sponsor or recommendation material.`
          : "Book an advisor evidence review with your CV, education records, employment documents and achievement proof so XIPHIAS can lock the correct route.",
      }),
  });

  // 6. Same-country route lenses worth weighing
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
    ? input.targetCountry === "global"
      ? page({
          header: head,
          footer: foot("06"),
          body:
            sectionHeader({
              eyebrow: "Global alternatives",
              title: "Other global route lenses worth weighing",
              desc: "These alternatives support the selected goal and field, but each keeps its own country-specific sponsor, invitation, settlement and evidence conditions.",
            }) +
            grid(3, altCards),
        })
      : splitPage({
        header: head,
        footer: foot("06"),
        imageDataUri: nextImg(),
        capEyebrow: top?.country ?? COUNTRY_LABELS[input.targetCountry],
        capTitle: "Same-country route lenses",
        content:
          sectionHeader({
            eyebrow: "Same-country options",
            title: `Other ${COUNTRY_LABELS[input.targetCountry]} route lenses worth weighing`,
            desc: "Secondary high-skill options inside the selected country if evidence, sponsorship, timing or filing readiness shifts.",
          }) + (altCards.length ? `<div class="grid">${altCards.join("")}</div>` : "") +
          `<div class="spacer-16"></div>` +
          callout({
            k: "How to read fit scores",
            text: "Fit reflects how well a route matches your stated profile and evidence. It is not a guarantee of approval. The quantity and independence of your evidence, current rules and document consistency decide the outcome, which is why advisor verification comes before any filing.",
          }),
      })
    : "";

  // 7. Evidence-gap map (what to build)
  const gapRows = (top ? top.nextEvidence : EVIDENCE_KEYS.slice(0, 4).map((k) => evidenceLabels[k])).map((label) => {
    // Resolve the underlying evidence key so we can show current status.
    const key = EVIDENCE_KEYS.find((k) => evidenceLabels[k] === label);
    const have = key ? input.evidence[key] : false;
    return [
      `<strong>${esc(label)}</strong>`,
      have ? pill("On file", "good") : pill("To build", "warn"),
      esc(have ? "Already flagged. Package and verify for filing." : "High-impact for the selected country route; gather and document this evidence."),
    ];
  });
  const missingTopRoutes = EVIDENCE_KEYS.filter((key) => !input.evidence[key])
    .slice(0, 5)
    .map((key) => evidenceLabels[key]);
  const priorityGapRows = gapRows.slice(0, 2);
  const additionalGapRows = gapRows.slice(2);
  const gapPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Evidence-gap map",
        title: "What to build before you file",
        desc: "The evidence categories that most move the selected-country route. Prioritise the items marked to build because these have the highest scoring weight for your profile.",
      }) +
      table({
        head: ["Evidence category", "Status", "Why it matters"],
        rows: priorityGapRows.length ? priorityGapRows : [[esc("Profile evidence"), pill("To capture", "warn"), esc("Add CV detail and evidence flags to generate a targeted gap map.")]],
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Priority rule",
        text: `For ${COUNTRY_LABELS[input.targetCountry]}, start with the evidence categories that directly affect the selected route. Lower-priority documents can wait until the advisor confirms the filing direction.`,
      }),
    footer: foot("07"),
  });
  const gapMorePage = additionalGapRows.length
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "Evidence-gap map continued",
            title: "Additional evidence to build",
            desc: "These items remain important for the selected country route, but should be sequenced after the highest-priority proof areas are under control.",
          }) +
          table({
            head: ["Evidence category", "Status", "Why it matters"],
            rows: additionalGapRows,
          }) +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Sequencing",
            text: "Build evidence in order of route impact. Advisor review should decide whether each additional item is essential, helpful or optional.",
          }),
        footer: foot("Evidence gaps continued"),
      })
    : "";
  const gapFollowupPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Evidence follow-up",
        title: "Evidence still open after the first review",
        desc: "These remaining areas should be discussed with the advisor. Some will be essential, while others may be useful only if the route strategy changes.",
      }) +
      ticks(missingTopRoutes.length ? missingTopRoutes : ["Your stated evidence already covers the core categories. Focus on verification and packaging."]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Coverage",
        text: `You have flagged ${signals.evidenceSelected.length} of ${EVIDENCE_KEYS.length} evidence categories that high-skill routes weigh across ${totalEvidenceCategories} criteria. Independent, verifiable evidence in three or more categories materially strengthens extraordinary-ability and talent petitions.`,
      }),
    footer: foot("Evidence follow-up"),
  });

  // 8. Action roadmap + risk
  const planPage = page({
    header: head,
    body:
      sectionHeader({ eyebrow: "Action roadmap", title: "Your next four moves", desc: "A focused sequence to convert this ranked analysis into a filing-ready high-skill case." }) +
      steps([
        {
          title: "Confirm your route",
          body: top
            ? `Review ${top.title} and the selected-country evidence plan with a XIPHIAS advisor, and lock your primary high-skill route and target.`
            : "Add profile and evidence detail with an advisor to lock a primary high-skill route.",
        },
        { title: "Close the evidence gaps", body: "Build the to-build items from your evidence-gap map, including awards, publications, media, judging, critical role, salary or recommendation letters as relevant." },
        { title: "Package the evidence", body: "Organise each criterion into a verifiable, well-labelled exhibit set with expert letters that explain impact and independence." },
        { title: "Validate & file", body: "Advisor verifies current rules, timelines and criteria for your top route, then moves into petition drafting and filing coordination." },
      ]),
    footer: foot("08"),
  });

  const riskDueDiligencePage = page({
    header: head,
    body:
      sectionHeader({ title: "Risk & due diligence" }) +
      grid(2, [
        card({ k: "Evidence independence", v: "Show external recognition", note: "Extraordinary-ability and talent routes need recognition beyond your employer, including independent awards, media and expert letters." }),
        card({ k: "Sponsor dependency", v: input.evidence.employerSponsor || input.evidence.jobOffer ? "Support indicated" : "Line up early", note: "Sponsor-based routes (H-1B, O-1A, L-1) need a confirmed employer or qualifying transfer before filing." }),
        card({ k: "Rules change", v: "Verify before filing", note: "Government criteria, caps and processing windows shift; confirm current rules at advisor review." }),
        card({ k: "Document consistency", v: "Avoid mismatches", note: "Inconsistent names, dates, titles or histories across documents cause avoidable delays and queries." }),
      ]),
    footer: foot("Risk controls"),
  });

  const summaryHeading = !top
    ? "Complete the profile before deciding"
    : top.tier === "Strong"
      ? "Validate the leading route"
      : top.tier === "Possible"
        ? "Strengthen the case before deciding"
        : "Build the evidence before filing";

  // 9. Report summary (dark close)
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Report summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">${esc(summaryHeading)}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        top
          ? `Your profile points most strongly to ${top.title} in ${top.country} (${clampScore(top.fitScore)}/100, ${top.tier.toLowerCase()}). The next step is an advisor review to confirm criteria and build your evidence plan.`
          : "Add profile and evidence detail with an advisor to lock a strong primary high-skill route.",
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Primary route", v: top?.title ?? "To confirm" }),
        card({ dark: true, k: "Fit score", v: top ? `${clampScore(top.fitScore)} / 100` : "To confirm" }),
        card({ dark: true, k: "Next service", v: "Advisor evidence review" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This automated report was generated from your submitted profile and XIPHIAS high-skill visa intelligence. It has not been independently verified by an advisor. It is not legal advice and does not guarantee any government, immigration or visa-office decision. Fit scores and signal strengths are directional and must be confirmed by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  // Carry the top route plus focused same-country alternatives. Each dossier receives one
  // unique reserved country image; thin prose-only overview pages are omitted because their
  // content repeats the richer snapshot and programme sections.
  const footLabel = "XIPHIAS Immigration Private Limited · Deep Analysis";
  const dossierPages = dossiers.flatMap((d, idx) =>
    buildDossierPages(d, {
      header: head,
      footLabel,
      images: dossierImgs[idx],
      sections: [...(idx === 0 ? depth.primaryDossierSections : depth.alternativeDossierSections)],
    }),
  );

  const bodyHtml = removeLongDashes([
    cover,
    basisPage,
    briefPage,
    cvPage,
    scorecardPage,
    scorecardDetailPage,
    topPage,
    ...comparePages,
    countryOverviewPage,
    countryFilingPage,
    countryDocumentsPage,
    australiaPriorityPage,
    australiaSubmissionPage,
    australiaEvidenceControlPage,
    countryRiskPage,
    valuePage,
    methodologyPage,
    ...routeMatrixPages,
    altPage,
    ...routeDeepDivePages,
    gapPage,
    gapMorePage,
    gapFollowupPage,
    ...evidenceArchitecturePages,
    reportScopePage,
    advisorPrepPage,
    planPage,
    riskDueDiligencePage,
    ninetyDayPage,
    xiphiasHelpPage,
    ...dossierPages,
    ...buildCompanyProfilePages({ header: head, footer: foot }),
    summaryPage,
  ].join(""));
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml, embedBrandFonts: true });
}
