import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import {
  evidenceLabels,
  highSkillCompletion,
  scoreHighSkillRoutes,
  type HighSkillEvidenceKey,
  type HighSkillInput,
  type ScoredHighSkillRoute,
} from "@/lib/xia-intelligence-model";
import { resolveProgramme } from "@/lib/reports/programme";
import { loadCoverBg, loadCountryImages, loadLogo } from "../assets";
import { buildDossierPages, programmeNarrativePages } from "../dossier-sections";
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

const GOALS = new Set(["permanent-residency", "temporary-work", "talent-visa", "founder", "not-sure"]);
const FIELDS = new Set(["technology", "science", "business", "arts", "healthcare", "academia", "sports", "other"]);
const EDUCATION = new Set(["unknown", "bachelor", "master", "phd"]);

// The four US visa families this report is locked to (plus EB-5 as an investment alternative
// presented narratively). EB-1A / EB-2 NIW / O-1A / H-1B map directly onto the engine's
// US routes; we surface them in a fixed strategic order for the side-by-side comparison.
const US_ROUTE_ORDER = ["usa-eb1a", "usa-eb2-niw", "usa-o1a", "usa-h1b"] as const;

const EVIDENCE_KEYS = Object.keys(evidenceLabels) as HighSkillEvidenceKey[];

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
  return s === "true" || s === "yes" || s === "1" || s === "on" || s === "checked";
}
function toInt(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}
function toFloat(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

// True acronyms that must stay fully uppercased (or in their canonical hyphenated form)
// rather than being title-cased into "Niw" / "Eb-1a" / "Usa".
const ACRONYMS: Record<string, string> = {
  pr: "PR",
  niw: "NIW",
  "eb-1a": "EB-1A",
  eb1a: "EB-1A",
  "eb-1": "EB-1",
  eb1: "EB-1",
  "eb-2": "EB-2",
  eb2: "EB-2",
  "eb-5": "EB-5",
  eb5: "EB-5",
  "o-1a": "O-1A",
  o1a: "O-1A",
  "o-1": "O-1",
  o1: "O-1",
  "h-1b": "H-1B",
  h1b: "H-1B",
  uk: "UK",
  uae: "UAE",
  usa: "USA",
  us: "US",
  uscis: "USCIS",
};

// Title-case a free-text label while preserving true acronyms in uppercase form.
function acronymTitleCase(value: string): string {
  return value
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token) || token === "") return token;
      const key = token.toLowerCase();
      if (ACRONYMS[key]) return ACRONYMS[key];
      return token.replace(/\b\w/g, (c) => c.toUpperCase());
    })
    .join("");
}

// Map coded answer values (e.g. "work-visa", "business-setup", "not-sure") to human labels.
const CODED_VALUE_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "work-visa": "Work visa",
  citizenship: "Citizenship",
  investment: "Investment",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};

// Render any coded value cleanly: known code → friendly label, otherwise acronym-aware title case.
function prettyValue(value: string): string {
  const key = value.trim().toLowerCase();
  return CODED_VALUE_LABELS[key] ?? acronymTitleCase(value);
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// Map a free-text education answer to the engine's enum, with sensible synonyms.
function pickEducation(value: unknown): HighSkillInput["education"] {
  const s = str(value).toLowerCase();
  if (EDUCATION.has(s)) return s as HighSkillInput["education"];
  if (/phd|doctor|d\.?phil|dphil/.test(s)) return "phd";
  if (/master|m\.?s|m\.?tech|mba|postgrad|pg\b/.test(s)) return "master";
  if (/bachelor|b\.?s|b\.?tech|b\.?e\b|undergrad|degree/.test(s)) return "bachelor";
  return "unknown";
}

// Map a free-text goal answer (route-style or high-skill-style) to the high-skill enum.
function pickGoal(value: unknown): HighSkillInput["goal"] {
  const s = str(value).toLowerCase();
  if (GOALS.has(s)) return s as HighSkillInput["goal"];
  if (/pr\b|permanent|green ?card|residency|settle/.test(s)) return "permanent-residency";
  if (/talent|extraordinary|eb1|eb-1|o1|o-1/.test(s)) return "talent-visa";
  if (/found|startup|entrepreneur|business/.test(s)) return "founder";
  if (/work|h1b|h-1b|employ|job|sponsor|temporary/.test(s)) return "temporary-work";
  return "not-sure";
}

// answers arrive as STRINGS; coerce each evidence flag defensively. We accept either an
// explicit boolean-ish answer keyed by the evidence name, OR derive some flags from the
// numeric strength counts so a sparse order still produces a meaningful evidence map.
function buildEvidence(a: Record<string, unknown>, counts: { citations: number; publications: number; patents: number }): Record<HighSkillEvidenceKey, boolean> {
  const evidence = {} as Record<HighSkillEvidenceKey, boolean>;
  for (const key of EVIDENCE_KEYS) {
    evidence[key] = toBool(a[key]);
  }
  // Derive structural evidence from quantitative inputs when not explicitly flagged.
  if (counts.publications > 0) evidence.publications = true;
  if (counts.citations > 0) evidence.citations = true;
  if (counts.patents > 0) evidence.patents = true;
  // Common alternative answer keys.
  if (toBool(a.hasJobOffer ?? a.offer)) evidence.jobOffer = true;
  if (toBool(a.sponsor ?? a.hasSponsor)) evidence.employerSponsor = true;
  return evidence;
}

function buildHighSkillInput(order: JiopayOrder): HighSkillInput {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const citationCount = toInt(a.citationCount ?? a.citations, 0);
  const publicationCount = toInt(a.publicationCount ?? a.publications, 0);
  const patentCount = toInt(a.patentCount ?? a.patents, 0);
  return {
    targetCountry: "usa", // locked to the United States, exactly like the us-visa-intelligence page
    goal: pickGoal(a.goal ?? a.objective),
    field: pickEnum(a.field ?? a.industry, FIELDS, "technology") as HighSkillInput["field"],
    role: str(a.role ?? a.profile ?? a.occupation ?? order.program),
    age: toInt(a.age, 30),
    education: pickEducation(a.education ?? a.qualification),
    yearsExperience: toInt(a.yearsExperience ?? a.experience, 5),
    languageScore: toFloat(a.languageScore ?? a.language, 0),
    evidence: buildEvidence(a, { citations: citationCount, publications: publicationCount, patents: patentCount }),
    citationCount,
    publicationCount,
    patentCount,
    resumeFileName: str(a.resumeFileName ?? a.resume ?? a.cv),
    profileSummary: str(a.profileSummary ?? a.summary ?? a.notes ?? a.goals),
  };
}

function fitTone(score: number): PillTone {
  if (score >= 75) return "good";
  if (score >= 55) return "warn";
  return "muted";
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
function difficultyLabel(difficulty: ScoredHighSkillRoute["difficulty"]): string {
  return difficulty === "very-high" ? "Very high" : difficulty === "high" ? "High" : "Moderate";
}
function fitLabel(score: number): string {
  if (score >= 80) return "Strong fit";
  if (score >= 65) return "Promising fit";
  if (score >= 50) return "Possible fit";
  return "Stretch";
}
function fieldLabel(field: HighSkillInput["field"]): string {
  return field === "other" ? "Cross-disciplinary" : titleCase(field);
}
function goalLabel(goal: HighSkillInput["goal"]): string {
  const map: Record<HighSkillInput["goal"], string> = {
    "permanent-residency": "US permanent residency (Green Card)",
    "temporary-work": "Temporary US work authorisation",
    "talent-visa": "US talent / extraordinary-ability visa",
    founder: "US founder / business pathway",
    "not-sure": "Open — US route to be confirmed",
  };
  return map[goal];
}
function educationLabel(education: HighSkillInput["education"]): string {
  const map: Record<HighSkillInput["education"], string> = {
    unknown: "To confirm",
    bachelor: "Bachelor's degree",
    master: "Master's degree",
    phd: "Doctorate (PhD)",
  };
  return map[education];
}

// Short strategic descriptors keyed by route id, used in the side-by-side comparison.
const ROUTE_BRIEF: Record<string, { criteria: string; selfPetition: string; jobOffer: string; evidenceBar: string }> = {
  "usa-eb1a": {
    criteria: "3 of 10 USCIS criteria (or a one-time major award)",
    selfPetition: "Yes — self-petition",
    jobOffer: "Not required",
    evidenceBar: "Highest — sustained acclaim",
  },
  "usa-eb2-niw": {
    criteria: "Advanced degree or exceptional ability + 3-prong national-interest test",
    selfPetition: "Yes — self-petition",
    jobOffer: "Not required",
    evidenceBar: "High — merit & national importance",
  },
  "usa-o1a": {
    criteria: "3 of 8 evidentiary criteria + US agent/employer",
    selfPetition: "No — needs petitioner",
    jobOffer: "Sponsor / engagement required",
    evidenceBar: "High — distinction in the field",
  },
  "usa-h1b": {
    criteria: "Specialty occupation + relevant degree + LCA",
    selfPetition: "No — employer petitions",
    jobOffer: "Required (cap lottery)",
    evidenceBar: "Moderate — role & credential fit",
  },
};

export async function buildUsVisaReport(order: JiopayOrder): Promise<Buffer> {
  const input = buildHighSkillInput(order);
  const allScored = scoreHighSkillRoutes(input);
  // Force the report to the four US work/immigration families, in strategic order.
  const usRoutes = US_ROUTE_ORDER
    .map((id) => allScored.find((r) => r.id === id))
    .filter((r): r is ScoredHighSkillRoute => Boolean(r));
  // Recommended primary = highest-scoring US family (engine already ranks by fit).
  const ranked = [...usRoutes].sort((a, b) => b.fitScore - a.fitScore);
  const top = ranked[0];
  const completion = highSkillCompletion(input);
  const evidenceSelected = EVIDENCE_KEYS.filter((k) => input.evidence[k]);
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = await loadCountryImages(order.country || "United States");

  const reportTitle = "US Visa Strategy Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · US Visa Strategy", label);
  const head = runningHeader(reportTitle, { country: "United States", route: top?.title });

  const avgUsFit = ranked.length
    ? ranked.reduce((sum, r) => sum + r.fitScore, 0) / ranked.length
    : 60;
  const roleLabel = input.role ? prettyValue(input.role) : "High-skill professional";

  // 1 — Cover
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "XIA · US Visa Intelligence",
    title: "US Visa Strategy Report",
    preparedFor: order.customer.name,
    subtitle:
      "An evidence-led strategy across the US high-skill visa families — EB-1A, EB-2 NIW, O-1A and H-1B — matched to your profile, with the recommended primary route and the evidence to build.",
    chips: [
      "Destination: United States",
      `Field: ${fieldLabel(input.field)}`,
      `Goal: ${goalLabel(input.goal).replace(/ \(.*\)/, "")}`,
    ],
    fitScore: top?.fitScore,
    fitLabel: top ? fitLabel(top.fitScore) : undefined,
    countryLabel: top ? top.title : "United States",
    dateLabel: dateLabel(),
  });

  // 2 — Profile snapshot / brief
  const briefCards = grid(3, [
    card({ k: "Destination", v: "United States" }),
    card({ k: "Current / target role", v: roleLabel }),
    card({ k: "Field", v: fieldLabel(input.field) }),
    card({ k: "Education", v: educationLabel(input.education) }),
    card({ k: "Experience", v: `${input.yearsExperience} year${input.yearsExperience === 1 ? "" : "s"}` }),
    card({ k: "Objective", v: goalLabel(input.goal) }),
  ]);
  const strengthCards = grid(3, [
    card({ k: "Publications", v: input.publicationCount > 0 ? String(input.publicationCount) : "—", note: "Authored or co-authored work on record." }),
    card({ k: "Citations", v: input.citationCount > 0 ? input.citationCount.toLocaleString("en-US") : "—", note: "Independent recognition of your contributions." }),
    card({ k: "Patents / IP", v: input.patentCount > 0 ? String(input.patentCount) : "—", note: "Granted or filed innovation evidence." }),
  ]);
  const briefPage = page({
    header: head,
    body:
      heroBand(imgs[0], {
        eyebrow: "Destination",
        title: top ? `United States · ${top.title}` : "United States",
      }) +
      sectionHeader({
        eyebrow: "Profile snapshot",
        title: "Your US visa profile at a glance",
        desc:
          "This report is locked to the United States and scores your profile against the US high-skill visa families using the XIA intelligence model. The advisor review confirms final positioning before any filing.",
      }) +
      briefCards +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Evidence strength signals</h3>` +
      `<div class="spacer-8"></div>` +
      strengthCards +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Best next move",
        text: top
          ? `Your strongest US match today is ${top.title}. Use this report to compare it against the other US families and confirm the evidence you will need to file with confidence.`
          : "Add your role, education and evidence details so an advisor can lock a strong US primary route.",
      }),
    footer: foot("02"),
  });

  // Distinct image picker for the split-page panels: start at imgs[3] and cycle so each
  // analytical page gets its own photo (avoids repeating the cover image imgs[1]).
  let panelCursor = 3;
  const nextPanel = (): string | null => {
    if (!imgs.length) return null;
    const img = imgs[panelCursor % imgs.length] ?? imgs[0] ?? null;
    panelCursor += 1;
    return img;
  };

  // 3 — US route-fit scorecard
  const scorecardPage = splitPage({
    header: head,
    footer: foot("03"),
    imageDataUri: nextPanel(),
    capEyebrow: "United States",
    capTitle: "Route-fit scorecard",
    content:
      sectionHeader({
        eyebrow: "Route-fit scorecard",
        title: "How you score across the US families",
        desc: "Directional fit signals for each US route, plus the readiness measures that drive your filing strategy. Scores are confirmed at advisor review.",
      }) +
      ranked
        .map((r) => scoreBar({ label: r.title, value: r.fitScore, tag: `${r.tier} · ${difficultyLabel(r.difficulty)} difficulty` }))
        .join("") +
      `<div class="spacer-16"></div>` +
      sectionHeader({ title: "Readiness measures" }) +
      scoreBar({ label: "Profile depth captured", value: completion, tag: `${completion}% of key inputs provided` }) +
      scoreBar({ label: "Evidence breadth", value: clampScore(20 + evidenceSelected.length * 10), tag: `${evidenceSelected.length} evidence categor${evidenceSelected.length === 1 ? "y" : "ies"} on record` }) +
      scoreBar({ label: "Self-petition readiness", value: top && !top.requiresSponsor ? 74 : 56, tag: top && !top.requiresSponsor ? "Top route allows self-petition" : "Top route needs a US petitioner" }) +
      scoreBar({ label: "US route shortlist strength", value: avgUsFit, tag: "Average across the four families" }),
  });

  // 4 — Side-by-side comparison of the four US families
  const compareRows = usRoutes.map((r) => {
    const brief = ROUTE_BRIEF[r.id] ?? { criteria: "Advisor-defined criteria", selfPetition: r.requiresSponsor ? "No" : "Yes", jobOffer: r.requiresSponsor ? "Required" : "Not required", evidenceBar: "Advisor review" };
    return [
      `<strong>${esc(r.title)}</strong>`,
      esc(brief.criteria),
      pill(brief.selfPetition.startsWith("Yes") ? "Self-petition" : "Petitioner", brief.selfPetition.startsWith("Yes") ? "good" : "warn"),
      esc(brief.jobOffer),
      esc(r.timeline),
      pill(`${clampScore(r.fitScore)}`, fitTone(r.fitScore)),
    ];
  });
  const selfPetitionCount = usRoutes.filter((r) => !r.requiresSponsor).length;
  const comparePage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Side-by-side",
        title: "EB-1A vs EB-2 NIW vs O-1A vs H-1B",
        desc: "The four core US high-skill families compared on criteria, self-petition ability, job-offer requirement, timeline and your fit. EB-5 is covered separately as an investment alternative.",
      }) +
      bigStats([
        { k: "US families compared", v: String(usRoutes.length), n: "Core high-skill routes" },
        { k: "Self-petition routes", v: String(selfPetitionCount), n: "No employer required" },
        { k: "Your top fit", v: top ? `${clampScore(top.fitScore)}` : "—", n: top ? top.title : "Advisor review" },
        { k: "Shortlist average", v: `${clampScore(avgUsFit)}`, n: "Across all four" },
      ]) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["US route", "Headline criteria", "Petition", "Job offer", "Timeline", "Your fit"],
        rows: compareRows,
      }) +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Permanent vs temporary", v: "Green Card vs work status", note: "EB-1A and EB-2 NIW lead to permanent residency; O-1A and H-1B are non-immigrant work statuses that can bridge to a Green Card later." }),
        card({ k: "Evidence bar", v: "Distinction wins cases", note: "EB-1A demands the highest sustained-acclaim bar; H-1B turns on the specialty occupation and degree-role fit plus the cap lottery." }),
        card({ k: "Control of timing", v: "Self-petition = independence", note: "EB-1A and EB-2 NIW let you self-petition without an employer; O-1A and H-1B depend on a US petitioner or sponsor." }),
        card({ k: "EB-5 alternative", v: "Investment route", note: "If a qualifying capital investment is available, EB-5 offers a self-directed Green Card path independent of the employment-based evidence tests above." }),
      ]),
    footer: foot("04"),
  });

  // 5 — Recommended primary route
  const topBrief = top ? ROUTE_BRIEF[top.id] : undefined;
  const topPage = top
    ? page({
        header: head,
        body:
          heroBand(imgs[2] ?? imgs[1] ?? imgs[0], {
            eyebrow: "Recommended US route",
            title: top.title,
          }) +
          sectionHeader({ eyebrow: "Recommended primary route", title: top.title, desc: top.summary }) +
          grid(3, [
            card({ k: "Visa family", v: top.visaFamily }),
            card({ k: "Outcome", v: top.permanent ? "Permanent residency" : "Temporary work status" }),
            card({ k: "Petition", v: top.requiresSponsor ? "US petitioner required" : "Self-petition allowed" }),
            card({ k: "Indicative timeline", v: top.timeline }),
            card({ k: "Difficulty", v: difficultyLabel(top.difficulty) }),
            card({ k: "Headline criteria", v: topBrief ? topBrief.criteria : "Advisor-defined" }),
          ]) +
          `<div class="spacer-16"></div>` +
          scoreBar({ label: "Primary route fit", value: top.fitScore, tag: `${fitLabel(top.fitScore)} · ${top.tier}` }) +
          `<div class="spacer-8"></div>` +
          `<h3 class="h-sub">Why this route fits you</h3>` +
          ticks(top.reasons.length ? top.reasons.slice(0, 6) : ["Matched to your US-focused profile, field and evidence inputs."]) +
          `<div class="spacer-8"></div>` +
          `<h3 class="h-sub">Evidence gaps to close</h3>` +
          ticks(
            top.gaps.length
              ? top.gaps.slice(0, 5)
              : ["No blocking gaps detected from your inputs — focus on packaging and corroboration."],
          ),
        footer: foot("05"),
      })
    : "";

  // 6 — Evidence build plan (next evidence to gather)
  const nextEvidence = top && top.nextEvidence.length ? top.nextEvidence : [];
  const bestFor = top?.bestFor ?? [];
  const evidencePage = top
    ? splitPage({
        header: head,
        footer: foot("06"),
        imageDataUri: nextPanel(),
        capEyebrow: "Evidence strategy",
        capTitle: top.title,
        content:
          sectionHeader({
            eyebrow: "Evidence strategy",
            title: "Build the evidence that wins your case",
            desc: `The highest-weighted evidence categories still open for ${top.title}, plus the profiles this route is built for.`,
          }) +
          (nextEvidence.length
            ? `<h3 class="h-sub">Priority evidence to gather next</h3>` + ticks(nextEvidence)
            : `<h3 class="h-sub">Priority evidence</h3>` +
              ticks(["Your selected categories already cover the highest-weighted evidence — focus on depth and independent corroboration."])) +
          `<div class="spacer-16"></div>` +
          `<h3 class="h-sub">Evidence already on record</h3>` +
          (evidenceSelected.length
            ? ticks(evidenceSelected.map((k) => evidenceLabels[k]))
            : `<p class="lead">No evidence categories were flagged yet. The action plan below shows how to assemble a USCIS-ready evidence map.</p>`) +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Best suited for",
            text: bestFor.length
              ? `${top.title} is built for ${bestFor.join(", ")}. Position your narrative to match one of these profiles.`
              : "Position your narrative around sustained, independent recognition rather than day-to-day job performance.",
          }),
      })
    : "";

  // 7 — Action roadmap
  const planPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Action roadmap",
        title: "Your path to filing",
        desc: "A focused sequence to convert this strategy into a confirmed US filing.",
      }) +
      steps([
        {
          title: "Lock your primary US route",
          body: top
            ? `Confirm ${top.title} (or the best alternative) with a XIPHIAS advisor and align it to your goal of ${goalLabel(input.goal).toLowerCase()}.`
            : "Confirm your strongest US route with a XIPHIAS advisor based on your full evidence picture.",
        },
        {
          title: "Build the USCIS evidence map",
          body: "Assemble awards, publications, citations, media, judging, critical-role proof, salary evidence and expert recommendation letters mapped to each criterion.",
        },
        {
          title: "Draft the petition narrative",
          body: top && !top.requiresSponsor
            ? "Self-petition: craft the merit, recognition and (for NIW) national-interest argument with corroborating exhibits."
            : "Sponsored route: align the US petitioner, the role, and the supporting evidence before filing.",
        },
        {
          title: "File and track",
          body: "Submit through the correct service centre or process, monitor status, and prepare for any Request for Evidence with the advisory desk.",
        },
      ]) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "US-specific risk & due diligence" }) +
      grid(2, [
        card({ k: "Rules & fees", v: "Verify before filing", note: "USCIS fees, processing times and policy memos change; confirm current rules at advisor review." }),
        card({ k: "Evidence independence", v: "Outside recognition wins", note: "EB-1A and O-1A turn on recognition independent of your employer — not internal performance reviews." }),
        card({ k: "H-1B cap risk", v: "Lottery is not guaranteed", note: "H-1B selection depends on the annual cap lottery; build a self-petition fallback (EB-2 NIW / EB-1A) where you qualify." }),
        card({ k: "RFE readiness", v: "Anticipate challenges", note: "Strong, consistent, well-indexed exhibits reduce Requests for Evidence and adjudication delays." }),
      ]),
    footer: foot("07"),
  });

  // 8 — Advisor summary (dark close)
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Advisor summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">Your US route, ready to advance</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        top
          ? `Your profile points most strongly to ${top.title} for entry to the United States. The next step is an advisor review to confirm eligibility and build the evidence package that wins.`
          : "Add your role, education and evidence so an advisor can lock a strong US primary route and evidence plan.",
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Primary US route", v: top?.title ?? "To confirm" }),
        card({ dark: true, k: "Route fit", v: top ? `${clampScore(top.fitScore)} / 100` : "—" }),
        card({ dark: true, k: "Next service", v: "US visa strategy call" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the US advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This report is an advisory assessment prepared from your submitted inputs and the XIPHIAS US visa intelligence model. It is not legal advice and does not guarantee any USCIS, US Department of State, or consular decision. Fit scores are directional and must be confirmed by a XIPHIAS advisor before filing or payment of any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  // As the top-tier US report, carry full dossiers for the key US routes (the user's
  // recommended route first, then the major families) — deduped, so it is the deepest.
  const usRefs = [
    order.program,
    "EB-1A Extraordinary Ability",
    "EB-2 NIW National Interest Waiver",
    "O-1 Extraordinary Ability",
    "H-1B Specialty Occupation",
  ].filter(Boolean) as string[];
  const seenSlugs = new Set<string>();
  const dossierPages: string[] = [];
  for (const ref of usRefs) {
    // This is the top-tier report: carry up to three full US route dossiers so it is
    // the most comprehensive in the catalogue (30+ pages).
    if (seenSlugs.size >= 3) break;
    const d = resolveProgramme({ country: "United States", program: ref, track: "skilled" });
    if (d && d.programSlug && !seenSlugs.has(d.programSlug)) {
      seenSlugs.add(d.programSlug);
      const usFoot = "XIPHIAS Immigration Private Limited · US Visa Strategy";
      dossierPages.push(...buildDossierPages(d, { header: head, footLabel: usFoot, images: imgs }));
      // The route's own write-up, where it carries usable prose (US routes are often terse).
      dossierPages.push(...programmeNarrativePages(d, { header: head, footLabel: usFoot, images: imgs, maxSections: 1 }));
    }
  }

  const bodyHtml = [cover, briefPage, scorecardPage, comparePage, topPage, evidencePage, planPage, ...dossierPages, summaryPage].join("");
  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
