import type { Vertical } from "@/lib/content/types";

export type RouteIntelligenceInput = {
  goal: "not-sure" | "pr" | "work-visa" | "citizenship" | "investment" | "business-setup" | "family-migration";
  track: Vertical | "all";
  destination: string;
  profile: "investor" | "entrepreneur" | "professional" | "family" | "company" | "remote" | "researcher" | "student";
  budget: number;
  timeline: number;
  family: boolean;
  presence: "any" | "low" | "moderate" | "high";
  priority: "speed" | "cost" | "mobility" | "stability" | "tax" | "business";
  notes: string;
};

export type ProgrammeRouteSource = {
  id: string;
  title: string;
  country: string;
  countrySlug: string;
  track: Vertical;
  href: string;
  summary: string;
  tags: string[];
  investmentUsd: number;
  investmentLabel: string;
  timelineMonths: number;
  timelineLabel: string;
  presence: "low" | "moderate" | "high" | "variable";
  family: boolean;
  risk: "standard" | "enhanced" | "high";
  source: "site-content" | "catalog";
  keywords: string;
};

export type ScoredProgrammeRoute = ProgrammeRouteSource & {
  fitScore: number;
  reasons: string[];
  warnings: string[];
};

export type HighSkillEvidenceKey =
  | "advancedDegree"
  | "awards"
  | "publications"
  | "citations"
  | "patents"
  | "media"
  | "judging"
  | "criticalRole"
  | "highSalary"
  | "leadership"
  | "businessImpact"
  | "nationalInterest"
  | "jobOffer"
  | "employerSponsor"
  | "companyTransfer"
  | "recommendations";

export type HighSkillInput = {
  targetCountry: "usa" | "canada" | "uk" | "australia" | "global";
  goal: "permanent-residency" | "temporary-work" | "talent-visa" | "founder" | "not-sure";
  field: "technology" | "science" | "business" | "arts" | "healthcare" | "academia" | "sports" | "other";
  role: string;
  age: number;
  education: "unknown" | "bachelor" | "master" | "phd";
  yearsExperience: number;
  languageScore: number;
  evidence: Record<HighSkillEvidenceKey, boolean>;
  citationCount: number;
  publicationCount: number;
  patentCount: number;
  resumeFileName: string;
  profileSummary: string;
};

export type HighSkillVisaRoute = {
  id: string;
  title: string;
  country: string;
  visaFamily: string;
  href: string;
  summary: string;
  bestFor: string[];
  timeline: string;
  difficulty: "moderate" | "high" | "very-high";
  requiresSponsor: boolean;
  permanent: boolean;
  evidenceWeights: Partial<Record<HighSkillEvidenceKey, number>>;
  keywords: string[];
};

export type ScoredHighSkillRoute = HighSkillVisaRoute & {
  fitScore: number;
  tier: "Strong" | "Possible" | "Needs work" | "Advisor review";
  reasons: string[];
  gaps: string[];
  nextEvidence: string[];
};

export const evidenceLabels: Record<HighSkillEvidenceKey, string> = {
  advancedDegree: "Advanced degree or exceptional education",
  awards: "National/international awards",
  publications: "Publications or authored work",
  citations: "Citations or measurable recognition",
  patents: "Patents, IP, or product innovation",
  media: "Media coverage or public recognition",
  judging: "Judging, reviewing, or selection panels",
  criticalRole: "Critical role in notable organisations",
  highSalary: "High salary or compensation evidence",
  leadership: "Leadership, founder, or managerial role",
  businessImpact: "Business, revenue, or field impact",
  nationalInterest: "Work with national/public importance",
  jobOffer: "Job offer or active employer interest",
  employerSponsor: "Employer/sponsor support",
  companyTransfer: "Qualifying company transfer history",
  recommendations: "Expert recommendation letters",
};

export const highSkillRoutes: HighSkillVisaRoute[] = [
  {
    id: "usa-eb1a",
    title: "EB-1A Extraordinary Ability",
    country: "United States",
    visaFamily: "High-skill immigrant visa",
    href: "/skilled/usa/eb1a-extraordinary-ability",
    summary: "For applicants with sustained national or international recognition and strong evidence across multiple criteria.",
    bestFor: ["researchers", "founders", "senior technologists", "artists", "athletes"],
    timeline: "Case dependent",
    difficulty: "very-high",
    requiresSponsor: false,
    permanent: true,
    evidenceWeights: {
      awards: 14,
      publications: 10,
      citations: 10,
      patents: 8,
      media: 10,
      judging: 10,
      criticalRole: 12,
      highSalary: 8,
      leadership: 8,
      businessImpact: 10,
      recommendations: 5,
    },
    keywords: ["usa", "extraordinary", "eb1a", "research", "founder", "talent", "award", "citation"],
  },
  {
    id: "usa-eb2-niw",
    title: "EB-2 NIW National Interest Waiver",
    country: "United States",
    visaFamily: "High-skill immigrant visa",
    href: "/skilled/usa/eb2-national-interest-waiver",
    summary: "For advanced-degree or exceptional-ability profiles whose work has substantial merit and national importance.",
    bestFor: ["advanced degree professionals", "researchers", "entrepreneurs", "public-interest specialists"],
    timeline: "Case dependent",
    difficulty: "high",
    requiresSponsor: false,
    permanent: true,
    evidenceWeights: {
      advancedDegree: 12,
      publications: 7,
      citations: 8,
      patents: 7,
      criticalRole: 8,
      businessImpact: 12,
      nationalInterest: 18,
      recommendations: 10,
      leadership: 6,
    },
    keywords: ["usa", "eb2", "niw", "national interest", "advanced degree", "research", "entrepreneur"],
  },
  {
    id: "usa-o1a",
    title: "O-1A Extraordinary Ability",
    country: "United States",
    visaFamily: "Temporary high-skill work visa",
    href: "/skilled/usa",
    summary: "For highly accomplished professionals entering for specific work with evidence of distinction and sponsor support.",
    bestFor: ["founders", "scientists", "tech leaders", "business experts"],
    timeline: "2-4 months",
    difficulty: "high",
    requiresSponsor: true,
    permanent: false,
    evidenceWeights: {
      awards: 12,
      publications: 8,
      citations: 8,
      media: 10,
      judging: 9,
      criticalRole: 10,
      highSalary: 8,
      leadership: 8,
      businessImpact: 8,
      employerSponsor: 12,
      jobOffer: 8,
      recommendations: 6,
    },
    keywords: ["usa", "o1", "o-1", "extraordinary", "temporary", "sponsor", "talent"],
  },
  {
    id: "usa-h1b",
    title: "H-1B Specialty Occupation",
    country: "United States",
    visaFamily: "Employer-sponsored work visa",
    href: "/skilled/usa/h1b-specialty-occupation",
    summary: "For specialty occupation workers with employer sponsorship, relevant education, and a qualifying role.",
    bestFor: ["software engineers", "finance professionals", "healthcare", "engineering"],
    timeline: "Lottery / employer process",
    difficulty: "moderate",
    requiresSponsor: true,
    permanent: false,
    evidenceWeights: {
      advancedDegree: 8,
      jobOffer: 18,
      employerSponsor: 22,
      criticalRole: 6,
      highSalary: 5,
      recommendations: 4,
    },
    keywords: ["usa", "h1b", "h-1b", "specialty occupation", "job offer", "employer"],
  },
  {
    id: "usa-l1",
    title: "L-1 Intracompany Transfer",
    country: "United States",
    visaFamily: "Corporate transfer visa",
    href: "/corporate/usa/l1-corporate-transfer-visa",
    summary: "For executives, managers, or specialised employees transferring within a qualifying international company group.",
    bestFor: ["executives", "managers", "company founders", "specialised knowledge employees"],
    timeline: "2-5 months",
    difficulty: "moderate",
    requiresSponsor: true,
    permanent: false,
    evidenceWeights: {
      companyTransfer: 26,
      leadership: 14,
      criticalRole: 10,
      businessImpact: 8,
      employerSponsor: 10,
      recommendations: 4,
    },
    keywords: ["usa", "l1", "l-1", "corporate", "transfer", "executive", "manager"],
  },
  {
    id: "canada-express-entry",
    title: "Canada Express Entry / Skilled PR",
    country: "Canada",
    visaFamily: "Points-based skilled migration",
    href: "/skilled/canada/express-entry",
    summary: "For skilled professionals with competitive age, education, language, experience, and settlement factors.",
    bestFor: ["skilled professionals", "tech workers", "healthcare", "finance", "engineers"],
    timeline: "6-12 months",
    difficulty: "moderate",
    requiresSponsor: false,
    permanent: true,
    evidenceWeights: {
      advancedDegree: 10,
      jobOffer: 8,
      recommendations: 4,
    },
    keywords: ["canada", "express entry", "pr", "skilled", "points", "language"],
  },
  {
    id: "uk-global-talent",
    title: "UK Global Talent Visa",
    country: "United Kingdom",
    visaFamily: "Talent visa",
    href: "/skilled/united-kingdom/uk-global-talent-visa",
    summary: "For leaders or emerging leaders in qualifying fields with endorsement-ready evidence.",
    bestFor: ["researchers", "technology leaders", "arts and culture", "academia"],
    timeline: "3-5 months",
    difficulty: "high",
    requiresSponsor: false,
    permanent: false,
    evidenceWeights: {
      awards: 10,
      publications: 8,
      citations: 8,
      media: 8,
      judging: 8,
      criticalRole: 10,
      leadership: 10,
      businessImpact: 8,
      recommendations: 10,
    },
    keywords: ["uk", "united kingdom", "global talent", "endorsement", "leader"],
  },
  {
    id: "australia-global-talent",
    title: "Australia Global Talent / Distinguished Talent",
    country: "Australia",
    visaFamily: "Talent migration",
    href: "/skilled/australia/global-talent-visa-858",
    summary: "For globally recognised professionals with strong achievement and evidence of benefit to Australia.",
    bestFor: ["researchers", "tech specialists", "founders", "high-impact professionals"],
    timeline: "6-12 months",
    difficulty: "high",
    requiresSponsor: false,
    permanent: true,
    evidenceWeights: {
      awards: 9,
      publications: 8,
      citations: 8,
      patents: 8,
      criticalRole: 10,
      highSalary: 8,
      leadership: 8,
      businessImpact: 10,
      recommendations: 8,
    },
    keywords: ["australia", "global talent", "distinguished", "858", "talent"],
  },
];

const profileKeywords: Record<RouteIntelligenceInput["profile"], string[]> = {
  investor: ["investment", "investor", "property", "fund", "capital", "golden", "bank deposit"],
  entrepreneur: ["business", "startup", "entrepreneur", "company", "founder", "innovation"],
  professional: ["skilled", "talent", "employment", "worker", "points", "job", "occupation"],
  family: ["family", "spouse", "dependent", "children", "settlement", "residence"],
  company: ["corporate", "company", "transfer", "sponsorship", "employer", "entity", "freezone"],
  remote: ["remote", "digital nomad", "freelancer", "low presence", "work remotely"],
  researcher: ["research", "publication", "citation", "award", "extraordinary", "talent", "niw"],
  student: ["student", "study", "graduate", "university", "f-1", "j-1", "opt", "stem"],
};

const priorityKeywords: Record<RouteIntelligenceInput["priority"], string[]> = {
  speed: ["fast", "weeks", "quick", "expedited", "streamlined"],
  cost: ["low", "affordable", "donation", "deposit", "no investment"],
  mobility: ["citizenship", "passport", "visa free", "global mobility"],
  stability: ["pr", "permanent", "residency", "renewal", "settlement"],
  tax: ["tax", "presence", "residence", "non-dom"],
  business: ["business", "company", "entrepreneur", "startup", "entity", "founder"],
};

const goalKeywords: Record<RouteIntelligenceInput["goal"], string[]> = {
  "not-sure": [],
  pr: ["pr", "permanent", "residency", "settlement", "green card"],
  "work-visa": ["work", "employment", "skilled", "job", "sponsor", "h1b", "l1", "permit"],
  citizenship: ["citizenship", "passport", "cbi", "naturalisation", "visa free"],
  investment: ["investment", "investor", "golden visa", "property", "fund", "donation", "rbi"],
  "business-setup": ["business", "company", "startup", "entrepreneur", "founder", "corporate"],
  "family-migration": ["family", "spouse", "dependent", "children", "settlement"],
};

const goalTrackBoost: Record<RouteIntelligenceInput["goal"], Partial<Record<Vertical, number>>> = {
  "not-sure": {},
  pr: { residency: 16, skilled: 10 },
  "work-visa": { skilled: 16, corporate: 12 },
  citizenship: { citizenship: 20 },
  investment: { residency: 12, citizenship: 12, corporate: 6 },
  "business-setup": { corporate: 16, residency: 8 },
  "family-migration": { residency: 8, skilled: 6, citizenship: 6 },
};

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenise(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 16);
}

function clamp(value: number, min = 20, max = 98) {
  return Math.min(max, Math.max(min, value));
}

function trackLabel(track: Vertical) {
  if (track === "skilled") return "Skilled migration";
  if (track === "corporate") return "Corporate mobility";
  return `${track.charAt(0).toUpperCase()}${track.slice(1)}`;
}

export function scoreProgrammeRoutes(items: ProgrammeRouteSource[], input: RouteIntelligenceInput): ScoredProgrammeRoute[] {
  const destination = normalize(input.destination);
  const notesTokens = tokenise(input.notes);
  const isExactDestination = (item: Pick<ProgrammeRouteSource, "country" | "countrySlug">) =>
    Boolean(
      destination &&
        (normalize(item.country) === destination ||
          normalize(item.country).includes(destination) ||
          normalize(item.countrySlug).includes(destination) ||
          destination.includes(normalize(item.country))),
    );

  const scored = items
    .map((item) => {
      let score = 42;
      const reasons: string[] = [];
      const warnings: string[] = [];
      const keywords = item.keywords || normalize([item.title, item.summary, item.tags.join(" ")].join(" "));

      if (input.track === "all") {
        score += 7;
        reasons.push("Open pathway search across all programme families.");
      } else if (item.track === input.track) {
        score += 22;
        reasons.push(`Matches ${trackLabel(item.track)} focus.`);
      } else {
        score -= 14;
        warnings.push(`Different pathway family: ${trackLabel(item.track)}.`);
      }

      const goalBoost = goalTrackBoost[input.goal]?.[item.track] || 0;
      if (goalBoost) {
        score += goalBoost;
        reasons.push("Matches stated immigration goal.");
      } else if (input.goal !== "not-sure") {
        const goalHits = goalKeywords[input.goal].filter((word) => keywords.includes(word));
        if (goalHits.length) {
          score += Math.min(10, goalHits.length * 3);
          reasons.push(`Goal signal matched: ${goalHits.slice(0, 2).join(", ")}.`);
        }
      }

      if (destination) {
        const countryMatch = isExactDestination(item);
        if (countryMatch) {
          score += 34;
          reasons.push(`Destination match: ${item.country}.`);
        } else if (keywords.includes(destination)) {
          score += 8;
          reasons.push("Destination appears in approved programme content.");
        } else {
          score -= 24;
          warnings.push("Not an exact country match.");
        }
      } else {
        score += 4;
      }

      if (item.investmentUsd <= 0) {
        score += input.budget <= 100000 ? 16 : 10;
        reasons.push("No direct investment threshold detected.");
      } else if (input.budget >= item.investmentUsd) {
        score += 17;
        reasons.push("Capital level appears compatible.");
      } else if (input.budget * 1.25 >= item.investmentUsd) {
        score += 8;
        warnings.push("Capital may be close; advisor must verify final fees.");
      } else {
        score -= 14;
        warnings.push("Capital may be below the indicative route threshold.");
      }

      if (item.timelineMonths <= input.timeline) {
        score += 12;
        reasons.push("Timeline fits the planning window.");
      } else if (item.timelineMonths <= input.timeline + 6) {
        score += 5;
        warnings.push("Timeline is close but may need flexibility.");
      } else {
        score -= 8;
        warnings.push("Timeline may be longer than requested.");
      }

      if (input.family && item.family) {
        score += 9;
        reasons.push("Family inclusion is supported or commonly available.");
      } else if (input.family && !item.family) {
        score -= 7;
        warnings.push("Family inclusion needs separate advisor review.");
      }

      if (input.presence !== "any") {
        if (item.presence === input.presence) {
          score += 9;
          reasons.push(`${input.presence} physical-presence preference matched.`);
        } else if (input.presence === "low" && item.presence === "moderate") {
          score += 3;
          warnings.push("Presence may be manageable but not minimal.");
        } else if (item.presence === "variable") {
          score += 1;
        } else {
          score -= 5;
          warnings.push("Physical-presence preference may not match.");
        }
      }

      const profileHits = profileKeywords[input.profile].filter((word) => keywords.includes(word));
      if (profileHits.length) {
        score += Math.min(12, profileHits.length * 4);
        reasons.push(`Profile signal matched: ${profileHits.slice(0, 2).join(", ")}.`);
      }

      const priorityHits = priorityKeywords[input.priority].filter((word) => keywords.includes(word));
      if (priorityHits.length) {
        score += Math.min(9, priorityHits.length * 3);
        reasons.push(`Priority signal matched: ${priorityHits.slice(0, 2).join(", ")}.`);
      }

      const noteHits = notesTokens.filter((token) => keywords.includes(token) || normalize(item.title).includes(token));
      if (noteHits.length) {
        score += Math.min(10, noteHits.length * 3);
        reasons.push(`User notes matched: ${noteHits.slice(0, 3).join(", ")}.`);
      }

      if (input.priority === "speed" && item.timelineMonths <= 6) score += 6;
      if (input.priority === "mobility" && item.track === "citizenship") score += 7;
      if (input.priority === "business" && (item.track === "corporate" || keywords.includes("business"))) score += 7;
      if (item.source === "site-content") score += 4;
      if (item.risk === "high") warnings.push("Enhanced due diligence likely required.");
      if (item.source === "catalog") warnings.push("Catalog route; advisor should verify current final rules.");

      return {
        ...item,
        fitScore: clamp(Math.round(score)),
        reasons: reasons.slice(0, 4),
        warnings: warnings.slice(0, 3),
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || a.title.localeCompare(b.title));

  if (destination) {
    const exactCountryMatches = scored.filter(isExactDestination);
    if (exactCountryMatches.length) return exactCountryMatches;
  }

  return scored;
}

export function highSkillCompletion(input: HighSkillInput) {
  const checks = [
    Boolean(input.role.trim()),
    input.education !== "unknown",
    input.yearsExperience > 0,
    input.languageScore > 0 || input.targetCountry === "usa",
    input.citationCount > 0 || input.publicationCount > 0 || input.patentCount > 0,
    input.profileSummary.trim().length > 20 || input.resumeFileName.trim().length > 0,
    Object.values(input.evidence).some(Boolean),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function tierFor(score: number): ScoredHighSkillRoute["tier"] {
  if (score >= 82) return "Strong";
  if (score >= 68) return "Possible";
  if (score >= 52) return "Needs work";
  return "Advisor review";
}

export function scoreHighSkillRoutes(input: HighSkillInput): ScoredHighSkillRoute[] {
  const selectedEvidence = Object.entries(input.evidence)
    .filter(([, selected]) => selected)
    .map(([key]) => key as HighSkillEvidenceKey);
  const notes = normalize(`${input.role} ${input.field} ${input.profileSummary}`);

  return highSkillRoutes
    .map((route) => {
      let score = 34;
      const reasons: string[] = [];
      const gaps: string[] = [];
      const nextEvidence: string[] = [];

      if (input.targetCountry === "global") {
        score += 4;
      } else if (route.keywords.includes(input.targetCountry) || normalize(route.country).includes(input.targetCountry)) {
        score += 17;
        reasons.push(`Country focus matches ${route.country}.`);
      } else {
        score -= 10;
        gaps.push(`Different country: ${route.country}.`);
      }

      if (input.goal === "permanent-residency" && route.permanent) {
        score += 12;
        reasons.push("Matches permanent-residency objective.");
      } else if (input.goal === "temporary-work" && !route.permanent) {
        score += 10;
        reasons.push("Matches temporary work objective.");
      } else if (input.goal === "talent-visa" && /talent|extraordinary|global/i.test(`${route.title} ${route.visaFamily}`)) {
        score += 12;
        reasons.push("Matches high-talent visa objective.");
      } else if (input.goal === "founder" && ["business", "technology"].includes(input.field)) {
        score += route.id.includes("niw") || route.id.includes("o1") || route.id.includes("l1") ? 8 : 3;
      }

      if (["technology", "science", "business", "academia"].includes(input.field)) {
        score += route.id.includes("eb") || route.id.includes("o1") || route.id.includes("global") ? 5 : 2;
      }

      if (input.education === "phd") {
        score += 10;
        reasons.push("Doctorate strengthens evidence-led visa review.");
      } else if (input.education === "master") {
        score += 7;
        reasons.push("Advanced degree supports skilled/talent categories.");
      } else if (input.education === "bachelor") {
        score += route.id === "usa-h1b" || route.id.includes("express-entry") ? 7 : 3;
      } else if (route.id.includes("niw") || route.id.includes("express-entry")) {
        gaps.push("Education level needs review for this route.");
      }

      if (input.yearsExperience >= 10) {
        score += 10;
        reasons.push("Long experience supports senior profile positioning.");
      } else if (input.yearsExperience >= 5) {
        score += 7;
      } else if (input.yearsExperience > 0) {
        score += 2;
      } else {
        gaps.push("Work experience is not yet captured.");
      }

      if (input.languageScore >= 8 && /canada|australia|uk/i.test(route.country)) {
        score += 10;
        reasons.push("Strong language score supports points or endorsement routes.");
      } else if (input.languageScore >= 6 && /canada|australia|uk/i.test(route.country)) {
        score += 5;
      } else if (input.languageScore > 0 && /canada|australia|uk/i.test(route.country)) {
        gaps.push("Language score may need improvement.");
      }

      for (const key of selectedEvidence) {
        const weight = route.evidenceWeights[key] || 0;
        if (weight) {
          score += weight;
          reasons.push(evidenceLabels[key]);
        }
      }

      if (input.publicationCount >= 5) score += 4;
      if (input.citationCount >= 100) score += 7;
      else if (input.citationCount >= 25) score += 4;
      if (input.patentCount >= 2) score += 5;
      else if (input.patentCount === 1) score += 3;

      if (route.requiresSponsor && !input.evidence.employerSponsor && !input.evidence.jobOffer) {
        score -= 12;
        gaps.push("Sponsor/employer support is required or highly useful.");
      }

      if (route.id === "usa-l1" && !input.evidence.companyTransfer) {
        score -= 18;
        gaps.push("L-1 needs qualifying company transfer history.");
      }

      if (route.id === "usa-eb2-niw" && !input.evidence.nationalInterest) {
        score -= 10;
        gaps.push("NIW needs a clear national-interest narrative.");
      }

      if (route.id === "usa-eb1a" || route.id === "usa-o1a") {
        const criterionCount = selectedEvidence.filter((key) => route.evidenceWeights[key]).length;
        if (criterionCount >= 5) {
          score += 8;
          reasons.push(`${criterionCount} relevant evidence categories selected.`);
        } else if (criterionCount < 3) {
          score -= 8;
          gaps.push("Extraordinary-ability routes need more independent evidence categories.");
        }
      }

      const missing = Object.entries(route.evidenceWeights)
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .filter(([key]) => !input.evidence[key as HighSkillEvidenceKey])
        .slice(0, 3)
        .map(([key]) => evidenceLabels[key as HighSkillEvidenceKey]);
      nextEvidence.push(...missing);

      if (notes) {
        const routeHits = route.keywords.filter((keyword) => notes.includes(normalize(keyword)));
        if (routeHits.length) {
          score += Math.min(8, routeHits.length * 3);
          reasons.push(`Profile notes match: ${routeHits.slice(0, 2).join(", ")}.`);
        }
      }

      const finalScore = clamp(Math.round(score), 25, 97);
      return {
        ...route,
        fitScore: finalScore,
        tier: tierFor(finalScore),
        reasons: Array.from(new Set(reasons)).slice(0, 5),
        gaps: Array.from(new Set(gaps)).slice(0, 4),
        nextEvidence: Array.from(new Set(nextEvidence)).slice(0, 4),
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || a.title.localeCompare(b.title));
}
