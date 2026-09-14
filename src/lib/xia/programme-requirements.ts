// src/lib/xia/programme-requirements.ts
// -----------------------------------------------------------------------------
// The programmes XIPHIAS works on, expressed as rules rather than keywords.
//
// EVERY entry carries `officialUrl` and `lastVerified`. A route whose rules have
// not been checked against the destination government's own page in the last six
// months is shown with a staleness warning by the confidence scorer — that is
// deliberate pressure to keep this file current.
//
// Thresholds here are the PUBLISHED floors, not XIPHIAS's opinion of a good
// application. "Meets the floor" is not "will be approved", and the card copy
// says so.
// -----------------------------------------------------------------------------

import {
  ageBetween,
  cleanRecord,
  educationAtLeast,
  experienceAtLeast,
  familyInclusive,
  fundsAtLeast,
  languageAtLeast,
  needsCheck,
  noPriorRefusal,
  notOwnCountry,
  requiresSponsor,
  type Requirement,
} from "./requirements";

export type Track = "residency" | "citizenship" | "skilled" | "corporate";

export type ProgrammeRule = {
  id: string;
  title: string;
  country: string;
  countryKey: string;
  track: Track;
  href: string;
  /** One sentence a visitor understands. No marketing. */
  summary: string;
  /** Goals from the case this route can satisfy. */
  goals: string[];
  /** Applicant profiles it suits. */
  profiles: string[];
  investmentUsd: number;
  investmentLabel: string;
  timelineMonths: number;
  timelineLabel: string;
  /** Which scoring engine, if any, can give this route a real number. */
  scoring: "crs" | "australia-points" | "none";
  requirements: Requirement[];
  officialUrl: string;
  lastVerified: string;
};

const V = "2026-09-13";

export const programmeRules: ProgrammeRule[] = [
  /* ------------------------------- CANADA -------------------------------- */
  {
    id: "ca-express-entry-fsw",
    title: "Express Entry — Federal Skilled Worker",
    country: "Canada", countryKey: "canada", track: "skilled",
    href: "/skilled/canada",
    summary: "Points-ranked permanent residence for skilled workers, drawn from a pool every two weeks.",
    goals: ["pr", "work-visa", "not-sure"],
    profiles: ["professional", "researcher", "family"],
    investmentUsd: 0, investmentLabel: "No investment — settlement funds only",
    timelineMonths: 8, timelineLabel: "6–12 months after an invitation",
    scoring: "crs",
    requirements: [
      notOwnCountry("Canada"),
      languageAtLeast("clb", 7, "Federal Skilled Worker needs CLB 7 in all four abilities — roughly IELTS 6.0 each. Your test result decides this."),
      educationAtLeast("secondary", "A completed credential with an Educational Credential Assessment is required for foreign qualifications."),
      experienceAtLeast(1, "One year of continuous skilled work in the last ten years is the minimum."),
      ageBetween(18, 47),
      cleanRecord, noPriorRefusal, familyInclusive(),
      needsCheck("ee-funds", "Settlement funds", "Proof of settlement funds is required unless you have a valid Canadian job offer — the amount depends on family size."),
    ],
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    lastVerified: V,
  },
  {
    id: "ca-pnp",
    title: "Provincial Nominee Program",
    country: "Canada", countryKey: "canada", track: "skilled",
    href: "/skilled/canada",
    summary: "A province nominates you, which adds 600 CRS points and effectively guarantees an invitation.",
    goals: ["pr", "work-visa", "not-sure"],
    profiles: ["professional", "entrepreneur", "family", "student"],
    investmentUsd: 0, investmentLabel: "No investment for most streams",
    timelineMonths: 14, timelineLabel: "12–18 months including nomination",
    scoring: "crs",
    requirements: [
      notOwnCountry("Canada"),
      languageAtLeast("clb", 5, "Most PNP streams need CLB 5 or higher; the skilled streams need CLB 7."),
      experienceAtLeast(1, "Most streams require a year of relevant experience, often in an occupation the province is short of."),
      cleanRecord, noPriorRefusal, familyInclusive(),
      needsCheck("pnp-stream", "Provincial stream match", "Each province publishes its own occupation and tie requirements — which one fits depends on your occupation."),
    ],
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/provincial-nominees.html",
    lastVerified: V,
  },
  {
    id: "ca-start-up-visa",
    title: "Start-up Visa",
    country: "Canada", countryKey: "canada", track: "corporate",
    href: "/corporate/canada",
    summary: "Permanent residence for founders whose business is backed by a designated Canadian investor or incubator.",
    goals: ["business-setup", "pr", "investment"],
    profiles: ["entrepreneur", "investor"],
    investmentUsd: 0, investmentLabel: "No fixed investment — a designated organisation must commit",
    timelineMonths: 30, timelineLabel: "Depends entirely on securing designation",
    scoring: "none",
    requirements: [
      notOwnCountry("Canada"),
      languageAtLeast("clb", 5, "CLB 5 in all four abilities is the floor for the Start-up Visa."),
      cleanRecord, familyInclusive(),
      needsCheck("suv-designation", "Letter of support", "A designated incubator, angel group or VC must issue a letter of support. This is the real gate, and it takes months."),
      needsCheck("suv-ownership", "Qualifying ownership", "You must hold at least 10% of voting rights, and together with the designated organisation more than 50%."),
    ],
    officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/start-visa.html",
    lastVerified: V,
  },

  /* ------------------------------ AUSTRALIA ------------------------------ */
  {
    id: "au-189",
    title: "Skilled Independent visa (subclass 189)",
    country: "Australia", countryKey: "australia", track: "skilled",
    href: "/skilled/australia",
    summary: "Points-tested permanent residence with no sponsor and no state nomination needed.",
    goals: ["pr", "not-sure"],
    profiles: ["professional", "researcher"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 12, timelineLabel: "Skills assessment, then invitation round",
    scoring: "australia-points",
    requirements: [
      notOwnCountry("Australia"),
      ageBetween(18, 44),
      languageAtLeast("ielts", 6, "Competent English (IELTS 6 each band) is the minimum; Proficient is worth 10 points and Superior 20."),
      educationAtLeast("diploma", "Your qualification must be assessed by the authority named for your occupation."),
      experienceAtLeast(3, "Three years of skilled employment is where points begin — less is allowed but scores zero.", false),
      cleanRecord, familyInclusive(),
      needsCheck("au-skills-assessment", "Skills assessment", "A positive skills assessment for the nominated occupation is mandatory, and usually the longest step."),
      needsCheck("au-occupation-list", "Occupation on the list", "Your occupation must appear on the relevant skilled occupation list."),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189",
    lastVerified: V,
  },
  {
    id: "au-190",
    title: "Skilled Nominated visa (subclass 190)",
    country: "Australia", countryKey: "australia", track: "skilled",
    href: "/skilled/australia",
    summary: "Permanent residence with a state or territory nomination, which adds 5 points.",
    goals: ["pr", "not-sure"],
    profiles: ["professional", "family"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 14, timelineLabel: "Nomination dependent",
    scoring: "australia-points",
    requirements: [
      notOwnCountry("Australia"),
      ageBetween(18, 44),
      languageAtLeast("ielts", 6, "Competent English is the floor for subclass 190."),
      educationAtLeast("diploma", "A positive skills assessment is required for the nominated occupation."),
      cleanRecord, familyInclusive(),
      needsCheck("au-state-nomination", "State nomination", "Each state publishes its own occupation list and requirements, and they change through the year."),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
    lastVerified: V,
  },
  {
    id: "au-482",
    title: "Skills in Demand visa (subclass 482)",
    country: "Australia", countryKey: "australia", track: "corporate",
    href: "/skilled/australia",
    summary: "Employer-sponsored work visa, with a pathway to permanent residence in most streams.",
    goals: ["work-visa", "pr"],
    profiles: ["professional", "company"],
    investmentUsd: 0, investmentLabel: "Employer-funded",
    timelineMonths: 6, timelineLabel: "Nomination and application dependent",
    scoring: "none",
    requirements: [
      notOwnCountry("Australia"),
      languageAtLeast("ielts", 5, "English requirements vary by stream; Core Skills generally needs IELTS 5 each band."),
      experienceAtLeast(1, "At least one year of relevant experience in the nominated occupation."),
      requiresSponsor("An approved Australian sponsor must nominate you. Without an employer, this route does not open."),
      cleanRecord, familyInclusive(),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    lastVerified: V,
  },

  /* -------------------------------- UK ----------------------------------- */
  {
    id: "uk-global-talent",
    title: "Global Talent visa",
    country: "United Kingdom", countryKey: "united kingdom", track: "skilled",
    href: "/skilled/uk",
    summary: "For leaders or emerging leaders in academia, research, arts or digital technology. No job offer needed.",
    goals: ["work-visa", "pr"],
    profiles: ["researcher", "professional", "entrepreneur"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 5, timelineLabel: "Endorsement, then visa",
    scoring: "none",
    requirements: [
      notOwnCountry("United Kingdom"),
      cleanRecord, familyInclusive(),
      needsCheck("uk-endorsement", "Endorsement", "An approved endorsing body must recognise you as a leader or emerging leader. Evidence quality decides this, not job title."),
      experienceAtLeast(3, "Endorsement realistically needs a sustained track record — recognition, publications, or significant contributions.", false),
    ],
    officialUrl: "https://www.gov.uk/global-talent",
    lastVerified: V,
  },
  {
    id: "uk-skilled-worker",
    title: "Skilled Worker visa",
    country: "United Kingdom", countryKey: "united kingdom", track: "corporate",
    href: "/skilled/uk",
    summary: "Sponsored employment route with a path to settlement after five years.",
    goals: ["work-visa", "pr"],
    profiles: ["professional", "company"],
    investmentUsd: 0, investmentLabel: "Employer-sponsored",
    timelineMonths: 3, timelineLabel: "Once a certificate of sponsorship is issued",
    scoring: "none",
    requirements: [
      notOwnCountry("United Kingdom"),
      languageAtLeast("ielts", 4, "English at B1 (roughly IELTS 4.0 each) is the floor."),
      requiresSponsor("A UK employer holding a sponsor licence must issue a Certificate of Sponsorship."),
      cleanRecord, familyInclusive(),
      needsCheck("uk-salary", "Salary threshold", "The role must meet both the general salary floor and the going rate for the occupation code."),
    ],
    officialUrl: "https://www.gov.uk/skilled-worker-visa",
    lastVerified: V,
  },

  /* ------------------------------ UNITED STATES --------------------------- */
  {
    id: "us-eb1a",
    title: "EB-1A — Extraordinary Ability",
    country: "United States", countryKey: "united states", track: "skilled",
    href: "/skilled/usa",
    summary: "Permanent residence for those at the very top of their field. No employer, no labour certification.",
    goals: ["pr", "work-visa"],
    profiles: ["researcher", "professional", "entrepreneur"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 14, timelineLabel: "Petition, then visa bulletin waiting",
    scoring: "none",
    requirements: [
      notOwnCountry("United States"),
      cleanRecord, familyInclusive(),
      needsCheck("eb1a-criteria", "Three of ten criteria", "You must satisfy at least three of the ten regulatory criteria, then survive a final-merits assessment. Evidence quality is everything."),
      experienceAtLeast(5, "Sustained national or international acclaim is not usually demonstrable early in a career.", false),
    ],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-first-preference-eb-1",
    lastVerified: V,
  },
  {
    id: "us-eb2-niw",
    title: "EB-2 National Interest Waiver",
    country: "United States", countryKey: "united states", track: "skilled",
    href: "/skilled/usa",
    summary: "Self-petitioned permanent residence where your work is judged to be in the US national interest.",
    goals: ["pr", "work-visa"],
    profiles: ["researcher", "professional", "entrepreneur"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 16, timelineLabel: "Petition, then visa bulletin waiting",
    scoring: "none",
    requirements: [
      notOwnCountry("United States"),
      educationAtLeast("masters", "An advanced degree, or a bachelor's with five years of progressive experience, is the entry requirement."),
      cleanRecord, familyInclusive(),
      needsCheck("niw-dhanasar", "The three-prong test", "Substantial merit and national importance, well positioned to advance it, and a balance favouring waiver of the job offer."),
    ],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-second-preference-eb-2",
    lastVerified: V,
  },
  {
    id: "us-eb5",
    title: "EB-5 Immigrant Investor",
    country: "United States", countryKey: "united states", track: "residency",
    href: "/residency/usa",
    summary: "Permanent residence through a qualifying investment that creates ten American jobs.",
    goals: ["investment", "pr"],
    profiles: ["investor"],
    investmentUsd: 800_000, investmentLabel: "US$800,000 in a targeted employment area, otherwise US$1,050,000",
    timelineMonths: 30, timelineLabel: "Long, and country-dependent",
    scoring: "none",
    requirements: [
      notOwnCountry("United States"),
      fundsAtLeast(800_000, "The minimum qualifying investment is US$800,000 in a targeted employment area. Below that, the route does not exist."),
      cleanRecord, familyInclusive(),
      needsCheck("eb5-sof", "Source of funds", "Every rupee must be traced to a lawful source, with documentation. This is where most EB-5 cases actually fail."),
      needsCheck("eb5-jobs", "Job creation", "The investment must create or preserve ten full-time American jobs."),
    ],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5",
    lastVerified: V,
  },

  /* -------------------------------- EUROPE -------------------------------- */
  {
    id: "pt-golden-visa",
    title: "Portugal Residence by Investment",
    country: "Portugal", countryKey: "portugal", track: "residency",
    href: "/residency/portugal",
    summary: "Residence with very low stay requirements, and a citizenship pathway after five years.",
    goals: ["investment", "citizenship", "pr"],
    profiles: ["investor", "family", "remote"],
    investmentUsd: 550_000, investmentLabel: "From about €500,000 depending on the qualifying option",
    timelineMonths: 12, timelineLabel: "Application to first residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("Portugal"),
      fundsAtLeast(550_000, "Qualifying options start around €500,000. Which options remain open changes with Portuguese law, so this needs current confirmation."),
      cleanRecord, familyInclusive(),
      needsCheck("pt-options", "Which route still qualifies", "Portugal has repeatedly narrowed the qualifying investment types. An advisor must confirm what is open this month."),
      needsCheck("pt-presence", "Minimum stay", "Low but not zero — a set number of days per two-year period must be met to renew."),
    ],
    officialUrl: "https://www.aima.gov.pt/",
    lastVerified: V,
  },
  {
    id: "gr-golden-visa",
    title: "Greece Golden Visa",
    country: "Greece", countryKey: "greece", track: "residency",
    href: "/residency/greece",
    summary: "Residence through property investment, with no minimum stay requirement.",
    goals: ["investment", "pr"],
    profiles: ["investor", "family"],
    investmentUsd: 270_000, investmentLabel: "From €250,000, higher in the main urban zones",
    timelineMonths: 8, timelineLabel: "Property purchase to residence permit",
    scoring: "none",
    requirements: [
      notOwnCountry("Greece"),
      fundsAtLeast(270_000, "The threshold is €250,000 in some areas and substantially higher in Athens, Thessaloniki, Mykonos and Santorini."),
      cleanRecord, familyInclusive(),
      needsCheck("gr-zone", "Which zone", "The threshold depends entirely on where the property sits. The zone map decides your minimum."),
    ],
    officialUrl: "https://www.enterprisegreece.gov.gr/en/invest-in-greece/golden-visa",
    lastVerified: V,
  },

  /* --------------------------------- UAE ---------------------------------- */
  {
    id: "ae-golden-visa",
    title: "UAE Golden Visa",
    country: "United Arab Emirates", countryKey: "uae", track: "residency",
    href: "/residency/uae",
    summary: "Long-term renewable residence for investors, specialists and outstanding talent.",
    goals: ["investment", "work-visa", "business-setup"],
    profiles: ["investor", "entrepreneur", "professional", "remote"],
    investmentUsd: 545_000, investmentLabel: "From AED 2 million for the property route; talent routes require no investment",
    timelineMonths: 3, timelineLabel: "Among the faster routes",
    scoring: "none",
    requirements: [
      notOwnCountry("United Arab Emirates"),
      cleanRecord, familyInclusive(),
      needsCheck("ae-category", "Which category", "Investor, specialised talent, outstanding student and entrepreneur categories each have separate criteria — the right one depends on your profile."),
    ],
    officialUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",
    lastVerified: V,
  },

  /* ------------------------------ CARIBBEAN ------------------------------- */
  {
    id: "cbi-caribbean",
    title: "Caribbean Citizenship by Investment",
    country: "Caribbean", countryKey: "caribbean", track: "citizenship",
    href: "/citizenship",
    summary: "Citizenship and a passport in months, through a government-approved contribution or investment.",
    goals: ["citizenship", "investment"],
    profiles: ["investor", "family", "entrepreneur"],
    investmentUsd: 200_000, investmentLabel: "From US$200,000 contribution, plus fees",
    timelineMonths: 8, timelineLabel: "6–12 months to passport in most programmes",
    scoring: "none",
    requirements: [
      fundsAtLeast(200_000, "The minimum contribution across the current Caribbean programmes is around US$200,000 before due-diligence and legal fees."),
      cleanRecord, familyInclusive(),
      needsCheck("cbi-dd", "Due diligence", "Every applicant is investigated. Source of funds, business history and any adverse media are examined before approval."),
      needsCheck("cbi-country", "Which island", "Five programmes with different costs, timelines and family rules. The right one depends on your family and your travel needs."),
    ],
    officialUrl: "https://www.xiphiasimmigration.com/citizenship",
    lastVerified: V,
  },
];

export const programmeRuleById = new Map(programmeRules.map((rule) => [rule.id, rule]));
