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
  languageTest: "not-provided" | "ielts" | "celpip" | "pte" | "toefl" | "oet" | "tef" | "tcf" | "other";
  languageScore: number;
  evidence: Record<HighSkillEvidenceKey, boolean>;
  citationCount: number;
  publicationCount: number;
  patentCount: number;
  resumeFileName: string;
  resumeParseStatus: "not-provided" | "parsed" | "needs-review";
  profileSummary: string;
};

export type HighSkillVisaRoute = {
  id: string;
  title: string;
  country: string;
  countryKey: Exclude<HighSkillInput["targetCountry"], "global">;
  visaFamily: string;
  href: string;
  summary: string;
  bestFor: string[];
  timeline: string;
  difficulty: "moderate" | "high" | "very-high";
  requiresSponsor: boolean;
  permanent: boolean;
  settlementPathway: boolean;
  goals: HighSkillInput["goal"][];
  fields?: HighSkillInput["field"][];
  maxAge?: number;
  pointsSensitive?: boolean;
  languageRelevant?: boolean;
  status: "active" | "paused" | "legacy";
  lastVerified: string;
  officialUrl: string;
  dossier?: {
    country: string;
    programSlug: string;
    vertical: "skilled" | "residency" | "citizenship" | "corporate";
  };
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

type RouteDefinition = Omit<HighSkillVisaRoute, "lastVerified" | "settlementPathway" | "status"> &
  Partial<Pick<HighSkillVisaRoute, "lastVerified" | "settlementPathway" | "status">>;

function defineRoute(route: RouteDefinition): HighSkillVisaRoute {
  return {
    ...route,
    status: route.status ?? "active",
    lastVerified: route.lastVerified ?? "2026-08-08",
    settlementPathway: route.settlementPathway ?? route.permanent,
  };
}

const TALENT_FIELDS: HighSkillInput["field"][] = ["technology", "science", "business", "academia", "arts", "sports"];
const PROFESSIONAL_FIELDS: HighSkillInput["field"][] = ["technology", "science", "business", "healthcare", "academia", "other"];
const RECOGNITION_WEIGHTS: Partial<Record<HighSkillEvidenceKey, number>> = {
  awards: 12,
  publications: 8,
  citations: 8,
  patents: 7,
  media: 9,
  judging: 8,
  criticalRole: 10,
  highSalary: 7,
  leadership: 8,
  businessImpact: 9,
  recommendations: 7,
};

export const highSkillRoutes: HighSkillVisaRoute[] = [
  defineRoute({
    id: "usa-eb1a", title: "EB-1A Extraordinary Ability", country: "United States", countryKey: "usa",
    visaFamily: "High-skill immigrant visa", href: "/skilled/usa/eb1a-extraordinary-ability",
    summary: "Permanent residence for applicants with sustained national or international acclaim and extensive independent evidence.",
    bestFor: ["researchers", "founders", "senior technologists", "artists", "athletes"], timeline: "Case dependent", difficulty: "very-high",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency", "talent-visa", "founder"], fields: TALENT_FIELDS,
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
    dossier: { country: "United States", programSlug: "eb1a-extraordinary-ability", vertical: "skilled" },
    evidenceWeights: RECOGNITION_WEIGHTS, keywords: ["usa", "extraordinary", "eb1a", "research", "founder", "talent", "award", "citation"],
  }),
  defineRoute({
    id: "usa-eb1b", title: "EB-1B Outstanding Professor or Researcher", country: "United States", countryKey: "usa",
    visaFamily: "Employer-sponsored immigrant visa", href: "/skilled/usa/eb1b-outstanding-professors",
    summary: "Permanent residence for internationally recognised professors and researchers with a qualifying US employer offer.",
    bestFor: ["professors", "researchers", "research leaders"], timeline: "Case dependent", difficulty: "very-high",
    requiresSponsor: true, permanent: true, goals: ["permanent-residency", "talent-visa"], fields: ["science", "academia"],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
    dossier: { country: "United States", programSlug: "eb1b-outstanding-professors", vertical: "skilled" },
    evidenceWeights: { ...RECOGNITION_WEIGHTS, jobOffer: 12, employerSponsor: 14 }, keywords: ["usa", "eb1b", "professor", "researcher", "academic"],
  }),
  defineRoute({
    id: "usa-eb2-niw", title: "EB-2 NIW National Interest Waiver", country: "United States", countryKey: "usa",
    visaFamily: "High-skill immigrant visa", href: "/skilled/usa/eb2-national-interest-waiver",
    summary: "Permanent residence for advanced-degree or exceptional-ability profiles whose proposed work has national importance.",
    bestFor: ["advanced-degree professionals", "researchers", "entrepreneurs", "public-interest specialists"], timeline: "Case dependent", difficulty: "high",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency", "founder", "talent-visa"], fields: PROFESSIONAL_FIELDS,
    officialUrl: "https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-5",
    dossier: { country: "United States", programSlug: "eb2-national-interest-waiver", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 12, publications: 7, citations: 8, patents: 7, criticalRole: 8, businessImpact: 12, nationalInterest: 18, recommendations: 10, leadership: 6 },
    keywords: ["usa", "eb2", "niw", "national interest", "advanced degree", "research", "entrepreneur"],
  }),
  defineRoute({
    id: "usa-o1a", title: "O-1A Extraordinary Ability", country: "United States", countryKey: "usa",
    visaFamily: "Temporary high-skill work visa", href: "/corporate/usa/o1-entrepreneur-visa",
    summary: "Temporary work classification for extraordinary ability in science, education, business or athletics with a US petitioner or agent.",
    bestFor: ["founders", "scientists", "technology leaders", "business experts", "athletes"], timeline: "Case dependent", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: false, goals: ["temporary-work", "talent-visa", "founder"], fields: ["technology", "science", "business", "academia", "sports"],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
    dossier: { country: "United States", programSlug: "o1-entrepreneur-visa", vertical: "corporate" },
    evidenceWeights: { ...RECOGNITION_WEIGHTS, employerSponsor: 10, jobOffer: 8 }, keywords: ["usa", "o1", "o-1", "extraordinary", "temporary", "sponsor", "talent", "founder"],
  }),
  defineRoute({
    id: "usa-o1b", title: "O-1B Arts or Motion Picture Achievement", country: "United States", countryKey: "usa",
    visaFamily: "Temporary creative talent visa", href: "/skilled/usa",
    summary: "Temporary work classification for extraordinary ability in the arts or extraordinary achievement in motion pictures or television.",
    bestFor: ["artists", "designers", "performers", "film and television professionals"], timeline: "Case dependent", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: false, goals: ["temporary-work", "talent-visa"], fields: ["arts"],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement",
    evidenceWeights: RECOGNITION_WEIGHTS, keywords: ["usa", "o1b", "o-1b", "arts", "film", "television", "talent"],
  }),
  defineRoute({
    id: "usa-h1b", title: "H-1B Specialty Occupation", country: "United States", countryKey: "usa",
    visaFamily: "Employer-sponsored work visa", href: "/skilled/usa/h1b-specialty-occupation",
    summary: "Temporary specialty-occupation work classification requiring a qualifying role, relevant education and a US employer petition.",
    bestFor: ["technology professionals", "finance professionals", "healthcare professionals", "engineers"], timeline: "Cap or cap-exempt employer process", difficulty: "moderate",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work"], fields: PROFESSIONAL_FIELDS,
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations",
    dossier: { country: "United States", programSlug: "h1b-specialty-occupation", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 8, jobOffer: 18, employerSponsor: 22, criticalRole: 6, highSalary: 5, recommendations: 4 },
    keywords: ["usa", "h1b", "h-1b", "specialty occupation", "job offer", "employer"],
  }),
  defineRoute({
    id: "usa-l1", title: "L-1 Intracompany Transfer", country: "United States", countryKey: "usa",
    visaFamily: "Corporate transfer visa", href: "/corporate/usa/l1-corporate-transfer-visa",
    summary: "Temporary transfer route for executives, managers or specialised-knowledge employees in a qualifying multinational group.",
    bestFor: ["executives", "managers", "company founders", "specialised-knowledge employees"], timeline: "Case dependent", difficulty: "moderate",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work", "founder"], fields: PROFESSIONAL_FIELDS,
    officialUrl: "https://www.uscis.gov/forms/explore-my-options/l-visas-l-1a-and-l-1b-for-temporary-workers",
    dossier: { country: "United States", programSlug: "l1-corporate-transfer-visa", vertical: "corporate" },
    evidenceWeights: { companyTransfer: 26, leadership: 14, criticalRole: 10, businessImpact: 8, employerSponsor: 10, recommendations: 4 },
    keywords: ["usa", "l1", "l-1", "corporate", "transfer", "executive", "manager", "founder"],
  }),

  defineRoute({
    id: "canada-express-entry", title: "Canada Express Entry", country: "Canada", countryKey: "canada",
    visaFamily: "Points-based skilled permanent residence", href: "/skilled/canada/express-entry",
    summary: "Federal system managing skilled-worker permanent residence applications through programme eligibility and competitive ranking.",
    bestFor: ["skilled professionals", "technology workers", "healthcare professionals", "finance professionals", "engineers"], timeline: "Invitation and application dependent", difficulty: "moderate",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    dossier: { country: "Canada", programSlug: "express-entry", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 10, jobOffer: 8 }, keywords: ["canada", "express entry", "pr", "skilled", "points", "language"],
  }),
  defineRoute({
    id: "canada-pnp", title: "Canada Provincial Nominee Program", country: "Canada", countryKey: "canada",
    visaFamily: "Provincial nomination to permanent residence", href: "/skilled/canada/provincial-nominee-program",
    summary: "Province or territory nomination for candidates who meet a specific local stream and labour-market need.",
    bestFor: ["professionals with province fit", "in-demand occupations", "regional candidates"], timeline: "Province and stream dependent", difficulty: "moderate",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html",
    dossier: { country: "Canada", programSlug: "provincial-nominee-program", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 8, jobOffer: 10, employerSponsor: 8 }, keywords: ["canada", "pnp", "province", "nomination", "pr", "occupation"],
  }),
  defineRoute({
    id: "canada-cec", title: "Canadian Experience Class", country: "Canada", countryKey: "canada",
    visaFamily: "Express Entry permanent residence", href: "/skilled/canada/canadian-experience-class",
    summary: "Permanent residence route for eligible skilled workers with qualifying recent Canadian work experience.",
    bestFor: ["temporary residents with Canadian skilled experience"], timeline: "Invitation and application dependent", difficulty: "moderate",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/canadian-experience-class.html",
    dossier: { country: "Canada", programSlug: "canadian-experience-class", vertical: "skilled" },
    evidenceWeights: { jobOffer: 5, employerSponsor: 4 }, keywords: ["canada", "cec", "canadian experience", "express entry", "pr"],
  }),
  defineRoute({
    id: "canada-fstp", title: "Federal Skilled Trades Program", country: "Canada", countryKey: "canada",
    visaFamily: "Express Entry skilled trades permanent residence", href: "/skilled/canada/federal-skilled-trades",
    summary: "Permanent residence programme for eligible skilled tradespeople with qualifying experience and a job offer or Canadian trade certificate.",
    bestFor: ["qualified tradespeople", "trade certificate holders"], timeline: "Invitation and application dependent", difficulty: "moderate",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: ["other"], pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/eligibility/federal-skilled-trades.html",
    dossier: { country: "Canada", programSlug: "federal-skilled-trades", vertical: "skilled" },
    evidenceWeights: { jobOffer: 14, employerSponsor: 8 }, keywords: ["canada", "fstp", "trade", "certificate", "express entry", "pr"],
  }),
  defineRoute({
    id: "canada-gts", title: "Canada Global Talent Stream", country: "Canada", countryKey: "canada",
    visaFamily: "Employer-led temporary foreign worker stream", href: "/skilled/canada/global-talent-stream",
    summary: "Expedited employer-led process for eligible innovative firms or occupations on the Global Talent Occupations List.",
    bestFor: ["highly skilled technology workers", "specialised talent with Canadian employer demand"], timeline: "Employer LMIA and work-permit process", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work", "talent-visa"], fields: ["technology", "science"], languageRelevant: false,
    officialUrl: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/global-talent.html",
    dossier: { country: "Canada", programSlug: "global-talent-stream", vertical: "skilled" },
    evidenceWeights: { jobOffer: 22, employerSponsor: 22, criticalRole: 8, highSalary: 7 }, keywords: ["canada", "global talent", "gts", "technology", "employer", "temporary"],
  }),
  defineRoute({
    id: "canada-ict", title: "Canada Intra-Company Transfer Work Permit", country: "Canada", countryKey: "canada",
    visaFamily: "Corporate transfer work permit", href: "/corporate/canada/intra-company-transfer",
    summary: "Employer-specific work permit for eligible executives, managers or specialised-knowledge employees in a qualifying corporate group.",
    bestFor: ["multinational executives", "managers", "specialised-knowledge employees", "expanding companies"], timeline: "Case dependent", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work", "founder"], fields: PROFESSIONAL_FIELDS,
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/foreign-workers/exemption-codes/intra-company-transferees.html",
    dossier: { country: "Canada", programSlug: "intra-company-transfer", vertical: "corporate" },
    evidenceWeights: { companyTransfer: 26, leadership: 12, employerSponsor: 14, criticalRole: 8 }, keywords: ["canada", "ict", "intra company", "transfer", "executive", "manager", "founder"],
  }),
  defineRoute({
    id: "canada-bc-entrepreneur", title: "BC PNP Entrepreneur Immigration", country: "Canada", countryKey: "canada",
    visaFamily: "Provincial entrepreneur pathway", href: "/residency/canada/british-columbia-entrepreneur-base",
    summary: "Provincial entrepreneur pathway requiring active business management, investment, net worth and job-creation commitments.",
    bestFor: ["experienced business owners", "senior managers", "entrepreneurs prepared to operate in British Columbia"], timeline: "Registration, invitation and performance dependent", difficulty: "high",
    requiresSponsor: false, permanent: false, settlementPathway: true, goals: ["founder"], fields: ["business", "technology", "other"], languageRelevant: true,
    officialUrl: "https://www.welcomebc.ca/immigrate-to-b-c/entrepreneur-immigration",
    dossier: { country: "Canada", programSlug: "british-columbia-entrepreneur-base", vertical: "residency" },
    evidenceWeights: { leadership: 18, businessImpact: 18, highSalary: 5, recommendations: 4 }, keywords: ["canada", "british columbia", "entrepreneur", "business", "founder", "pnp"],
  }),

  defineRoute({
    id: "uk-global-talent", title: "UK Global Talent Visa", country: "United Kingdom", countryKey: "uk",
    visaFamily: "Talent visa with settlement pathway", href: "/skilled/united-kingdom/uk-global-talent-visa",
    summary: "Unsponsored route for leaders or potential leaders in academia or research, arts and culture, or digital technology.",
    bestFor: ["researchers", "digital technology leaders", "arts and culture professionals", "academics"], timeline: "Endorsement and visa-stage dependent", difficulty: "high",
    requiresSponsor: false, permanent: false, settlementPathway: true, goals: ["temporary-work", "talent-visa", "permanent-residency"], fields: ["technology", "science", "academia", "arts"],
    officialUrl: "https://www.gov.uk/global-talent",
    dossier: { country: "United Kingdom", programSlug: "uk-global-talent-visa", vertical: "skilled" },
    evidenceWeights: RECOGNITION_WEIGHTS, keywords: ["uk", "united kingdom", "global talent", "endorsement", "leader", "settlement"],
  }),
  defineRoute({
    id: "uk-skilled-worker", title: "UK Skilled Worker Visa", country: "United Kingdom", countryKey: "uk",
    visaFamily: "Sponsored work visa with settlement pathway", href: "/skilled/united-kingdom",
    summary: "Employer-sponsored route for an eligible occupation meeting sponsorship, skill, salary and English requirements.",
    bestFor: ["sponsored professionals", "healthcare professionals", "technology and business specialists"], timeline: "Certificate of Sponsorship and application dependent", difficulty: "moderate",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work", "permanent-residency"], fields: PROFESSIONAL_FIELDS, languageRelevant: true,
    officialUrl: "https://www.gov.uk/skilled-worker-visa",
    evidenceWeights: { jobOffer: 22, employerSponsor: 24, advancedDegree: 6, highSalary: 7 }, keywords: ["uk", "united kingdom", "skilled worker", "sponsor", "job offer", "settlement"],
  }),
  defineRoute({
    id: "uk-innovator-founder", title: "UK Innovator Founder Visa", country: "United Kingdom", countryKey: "uk",
    visaFamily: "Endorsed founder visa with settlement pathway", href: "/corporate/united-kingdom",
    summary: "Founder route for an endorsed innovative, viable and scalable business that the applicant will lead in the UK.",
    bestFor: ["innovative founders", "venture builders", "scalable business owners"], timeline: "Endorsement and application dependent", difficulty: "high",
    requiresSponsor: false, permanent: false, settlementPathway: true, goals: ["founder", "permanent-residency"], fields: ["technology", "business", "science", "other"], languageRelevant: true,
    officialUrl: "https://www.gov.uk/innovator-founder-visa",
    evidenceWeights: { leadership: 16, businessImpact: 18, patents: 10, criticalRole: 8, recommendations: 8 }, keywords: ["uk", "united kingdom", "innovator founder", "founder", "business", "endorsement"],
  }),
  defineRoute({
    id: "uk-expansion-worker", title: "UK Expansion Worker Visa", country: "United Kingdom", countryKey: "uk",
    visaFamily: "Global Business Mobility route", href: "/corporate/united-kingdom/expansion-worker-visa",
    summary: "Sponsored temporary route for eligible senior managers or specialist employees establishing a UK branch of an overseas business.",
    bestFor: ["overseas business expansion teams", "senior managers", "specialists"], timeline: "Sponsor licence and application dependent", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: false, goals: ["temporary-work", "founder"], fields: PROFESSIONAL_FIELDS,
    officialUrl: "https://www.gov.uk/uk-expansion-worker-visa",
    dossier: { country: "United Kingdom", programSlug: "expansion-worker-visa", vertical: "corporate" },
    evidenceWeights: { companyTransfer: 22, employerSponsor: 18, leadership: 12, criticalRole: 8 }, keywords: ["uk", "united kingdom", "expansion worker", "branch", "transfer", "business"],
  }),
  defineRoute({
    id: "uk-international-sportsperson", title: "UK International Sportsperson Visa", country: "United Kingdom", countryKey: "uk",
    visaFamily: "Sponsored elite sport route", href: "/skilled/united-kingdom",
    summary: "Route for elite sportspersons or qualified coaches who are internationally established and endorsed by the governing body.",
    bestFor: ["elite athletes", "internationally established coaches"], timeline: "Endorsement, sponsorship and application dependent", difficulty: "high",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work", "talent-visa", "permanent-residency"], fields: ["sports"], languageRelevant: true,
    officialUrl: "https://www.gov.uk/sportsperson-visa",
    evidenceWeights: { awards: 18, media: 12, criticalRole: 10, employerSponsor: 16, recommendations: 10 }, keywords: ["uk", "united kingdom", "sportsperson", "athlete", "coach", "endorsement"],
  }),

  defineRoute({
    id: "australia-niv-858", title: "Australia National Innovation Visa (subclass 858)", country: "Australia", countryKey: "australia",
    visaFamily: "Invitation-only exceptional talent permanent visa", href: "/skilled/australia/global-talent-visa-858",
    summary: "Permanent invitation-only visa for exceptionally talented migrants able to make a significant contribution to Australia.",
    bestFor: ["global researchers", "entrepreneurs", "innovative investors", "athletes", "creatives", "high-impact professionals"], timeline: "EOI, invitation and application dependent", difficulty: "very-high",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency", "talent-visa", "founder"], fields: TALENT_FIELDS,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/visas-for-innovation/national-innovation-visa",
    dossier: { country: "Australia", programSlug: "global-talent-visa-858", vertical: "skilled" },
    evidenceWeights: RECOGNITION_WEIGHTS, keywords: ["australia", "national innovation", "niv", "858", "talent", "exceptional", "founder"],
  }),
  defineRoute({
    id: "australia-189", title: "Australia Skilled Independent Visa (subclass 189)", country: "Australia", countryKey: "australia",
    visaFamily: "Points-tested skilled permanent visa", href: "/skilled/australia/skilled-independent-189",
    summary: "Independent permanent skilled route requiring an eligible occupation, skills assessment, points test, EOI and invitation.",
    bestFor: ["competitive points-tested skilled professionals"], timeline: "Invitation and application dependent", difficulty: "high",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, maxAge: 44, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
    dossier: { country: "Australia", programSlug: "skilled-independent-189", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 12 }, keywords: ["australia", "189", "skilled independent", "points", "skills assessment", "pr"],
  }),
  defineRoute({
    id: "australia-190", title: "Australia Skilled Nominated Visa (subclass 190)", country: "Australia", countryKey: "australia",
    visaFamily: "State-nominated skilled permanent visa", href: "/skilled/australia/skilled-nominated-190",
    summary: "Permanent skilled route requiring an eligible occupation, skills assessment, state or territory nomination, EOI and invitation.",
    bestFor: ["skilled professionals aligned with state nomination priorities"], timeline: "State nomination and invitation dependent", difficulty: "high",
    requiresSponsor: false, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, maxAge: 44, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
    dossier: { country: "Australia", programSlug: "skilled-nominated-190", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 10, jobOffer: 5 }, keywords: ["australia", "190", "skilled nominated", "state nomination", "points", "pr"],
  }),
  defineRoute({
    id: "australia-491", title: "Australia Skilled Work Regional Visa (subclass 491)", country: "Australia", countryKey: "australia",
    visaFamily: "Regional provisional skilled visa with PR pathway", href: "/skilled/australia/skilled-work-regional-491",
    summary: "Provisional regional route requiring state nomination or eligible family sponsorship, an occupation, skills assessment, EOI and invitation.",
    bestFor: ["skilled professionals open to regional Australia"], timeline: "Nomination and invitation dependent", difficulty: "moderate",
    requiresSponsor: false, permanent: false, settlementPathway: true, goals: ["temporary-work", "permanent-residency"], fields: PROFESSIONAL_FIELDS, maxAge: 44, pointsSensitive: true, languageRelevant: true,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-work-regional-provisional-491",
    dossier: { country: "Australia", programSlug: "skilled-work-regional-491", vertical: "skilled" },
    evidenceWeights: { advancedDegree: 8 }, keywords: ["australia", "491", "regional", "skilled work", "points", "pathway"],
  }),
  defineRoute({
    id: "australia-186", title: "Australia Employer Nomination Scheme (subclass 186)", country: "Australia", countryKey: "australia",
    visaFamily: "Employer-nominated permanent visa", href: "/skilled/australia/employer-nomination-scheme-186",
    summary: "Permanent employer-nominated route for eligible skilled workers meeting the requirements of the selected stream.",
    bestFor: ["experienced professionals with an eligible Australian employer"], timeline: "Nomination and application dependent", difficulty: "high",
    requiresSponsor: true, permanent: true, goals: ["permanent-residency"], fields: PROFESSIONAL_FIELDS, languageRelevant: true,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/employer-nomination-scheme-186",
    dossier: { country: "Australia", programSlug: "employer-nomination-scheme-186", vertical: "skilled" },
    evidenceWeights: { jobOffer: 20, employerSponsor: 22, advancedDegree: 6, criticalRole: 7 }, keywords: ["australia", "186", "employer nomination", "sponsor", "job offer", "pr"],
  }),
  defineRoute({
    id: "australia-482", title: "Australia Skills in Demand Visa (subclass 482)", country: "Australia", countryKey: "australia",
    visaFamily: "Employer-sponsored temporary skilled visa", href: "/skilled/australia",
    summary: "Temporary employer-sponsored route for eligible skilled workers under the Specialist Skills, Core Skills or Labour Agreement stream.",
    bestFor: ["professionals with an eligible Australian employer", "specialist and core-skills workers"], timeline: "Nomination and application dependent", difficulty: "moderate",
    requiresSponsor: true, permanent: false, settlementPathway: true, goals: ["temporary-work"], fields: PROFESSIONAL_FIELDS, languageRelevant: true,
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    evidenceWeights: { jobOffer: 22, employerSponsor: 24, advancedDegree: 5, highSalary: 8 }, keywords: ["australia", "482", "skills in demand", "sponsor", "job offer", "temporary"],
  }),
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
    (input.languageTest !== "not-provided" && input.languageScore > 0) || input.targetCountry === "usa",
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

  const countryRoutes = highSkillRoutes.filter(
    (route) => route.status === "active" && (input.targetCountry === "global" || route.countryKey === input.targetCountry),
  );
  const goalRoutes = input.goal === "not-sure" ? countryRoutes : countryRoutes.filter((route) => route.goals.includes(input.goal));
  const goalPool = goalRoutes.length ? goalRoutes : countryRoutes;
  const fieldRoutes = goalPool.filter((route) => !route.fields || route.fields.includes(input.field));
  const candidateRoutes = fieldRoutes.length ? fieldRoutes : goalPool;

  return candidateRoutes
    .map((route) => {
      let score = 24;
      const reasons: string[] = [];
      const gaps: string[] = [];
      const nextEvidence: string[] = [];

      score += input.targetCountry === "global" ? 3 : 12;
      reasons.push(input.targetCountry === "global" ? `Active ${route.country} route in the global search.` : `Country focus matches ${route.country}.`);

      if (input.goal !== "not-sure" && route.goals.includes(input.goal)) {
        score += 14;
        reasons.push(`Route supports the ${input.goal.replace(/-/g, " ")} objective.`);
      }

      if (!route.fields || route.fields.includes(input.field)) {
        score += 6;
        reasons.push(`Route family is relevant to the stated ${input.field} field.`);
      } else {
        score -= 22;
        gaps.push(`The stated ${input.field} field is not a standard fit for this route and needs advisor confirmation.`);
      }

      if (input.education === "phd") {
        score += 8;
        reasons.push("Doctorate strengthens evidence-led visa review.");
      } else if (input.education === "master") {
        score += 5;
        reasons.push("Advanced degree supports skilled/talent categories.");
      } else if (input.education === "bachelor") {
        score += route.id === "usa-h1b" || route.id.includes("express-entry") ? 5 : 3;
      } else if (route.id.includes("niw") || route.id.includes("express-entry")) {
        gaps.push("Education level needs review for this route.");
      }

      if (input.yearsExperience >= 10) {
        score += 7;
        reasons.push("Long experience supports senior profile positioning.");
      } else if (input.yearsExperience >= 5) {
        score += 5;
      } else if (input.yearsExperience > 0) {
        score += 2;
      } else {
        gaps.push("Work experience is not yet captured.");
      }

      if (route.maxAge != null && input.age > route.maxAge) {
        score -= 32;
        gaps.push(`This route normally requires the applicant to be no older than ${route.maxAge} at the relevant invitation stage.`);
      } else if (route.pointsSensitive && input.age > 0) {
        if (input.age >= 20 && input.age <= 29) score += 8;
        else if (input.age <= 34) score += 7;
        else if (input.age <= 39) score += 5;
        else if (input.age <= 44) score += 3;
        else score -= 6;
        reasons.push("Age has been applied as a points-competitiveness signal.");
      }

      if (route.languageRelevant) {
        if (input.languageTest === "not-provided" || input.languageScore <= 0) {
          score -= 9;
          gaps.push("An accepted language test and route-specific component scores still need to be confirmed.");
        } else if (input.languageTest === "ielts") {
          if (input.languageScore >= 8) {
            score += 8;
            reasons.push("The stated IELTS overall score is a positive language signal, subject to component-score conversion.");
          } else if (input.languageScore >= 6) {
            score += 4;
            reasons.push("A language result is available for route-specific conversion.");
          } else {
            score -= 6;
            gaps.push("The stated IELTS overall score may be below the route or points threshold; component scores must be checked.");
          }
        } else {
          score += 3;
          reasons.push(`${input.languageTest.toUpperCase()} results are available for official route-specific conversion.`);
        }
      }

      let weightedEvidenceScore = 0;
      for (const key of selectedEvidence) {
        const weight = route.evidenceWeights[key] || 0;
        if (weight) {
          weightedEvidenceScore += weight;
          reasons.push(evidenceLabels[key]);
        }
      }
      score += Math.min(30, weightedEvidenceScore);

      if (input.publicationCount >= 5) score += 4;
      if (input.citationCount >= 100) score += 7;
      else if (input.citationCount >= 25) score += 4;
      if (input.patentCount >= 2) score += 5;
      else if (input.patentCount === 1) score += 3;

      if (route.requiresSponsor && !input.evidence.employerSponsor && !input.evidence.jobOffer) {
        score -= 20;
        gaps.push("This route requires qualifying sponsor, employer, petitioner or job-offer evidence that has not yet been indicated.");
      }

      if ((route.id === "usa-l1" || route.id === "canada-ict" || route.id === "uk-expansion-worker") && !input.evidence.companyTransfer) {
        score -= 24;
        gaps.push("A qualifying corporate relationship and transfer history have not yet been indicated.");
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

      if (route.id === "canada-cec" && !/canad(?:a|ian).{0,20}(work|experience)|worked.{0,20}canada/i.test(notes)) {
        score -= 24;
        gaps.push("Canadian Experience Class requires qualifying skilled work experience in Canada; none is stated in the profile summary.");
      }

      if (route.id === "canada-fstp" && !/trade|electrician|plumber|welder|machinist|carpenter|construction|chef|cook|mechanic/i.test(notes)) {
        score -= 24;
        gaps.push("Federal Skilled Trades fit requires an eligible trade and qualifying trade experience that are not yet stated.");
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
