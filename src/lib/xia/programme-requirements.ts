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
  ageScored,
  businessIntentKnown,
  businessStageKnown,
  cleanRecord,
  educationAtLeast,
  experienceAtLeast,
  familyInclusive,
  fundsAtLeast,
  includesFamily,
  languageAtLeast,
  minimumStayFits,
  needsCheck,
  noPriorRefusal,
  notOwnCountry,
  priorityDateQueue,
  programmeClosed,
  requiresSponsor,
  sourceOfFundsKnown,
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

const V = "2026-09-15";

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
      languageAtLeast("clb", 7, "Federal Skilled Worker needs CLB 7 in all four abilities — roughly IELTS 6.0 each. Below CLB 7 you cannot apply at all."),
      educationAtLeast("secondary", "A completed credential with an Educational Credential Assessment is required for foreign qualifications. Secondary school is only the floor — education is worth up to 25 of the 67 selection points, so a school-only profile rarely reaches the pass mark."),
      experienceAtLeast(1, "One year of continuous skilled work in the last ten years, OR 1,560 hours in total — part-time and multiple jobs can be added together at up to 30 hours a week."),
      // NOT ageBetween. FSW has no age eligibility criterion: age is a selection
      // factor worth up to 12 points, zero at 47 and over, and scoring zero does
      // not close the route. The old rule wrongly excluded everyone over 47.
      ageScored("Age is worth up to 12 of the 67 selection points — 12 up to 35, sliding to zero at 47. Scoring nothing on age does not make you ineligible, it just means the other factors have to carry you."),
      cleanRecord, noPriorRefusal, familyInclusive(),
      needsCheck("ee-funds", "Settlement funds", "Proof of settlement funds is required unless you BOTH hold a valid Canadian job offer AND are already authorised to work in Canada. A job offer on its own does not waive it. The amount depends on family size."),
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
    goals: ["pr", "work-visa", "study", "not-sure"],
    profiles: ["professional", "entrepreneur", "family", "student"],
    investmentUsd: 0, investmentLabel: "No investment for most streams",
    timelineMonths: 14, timelineLabel: "12–18 months including nomination",
    scoring: "crs",
    requirements: [
      notOwnCountry("Canada"),
      // IRCC publishes no federal language or experience floor for the PNP — each
      // province sets its own. The only fixed floor is on the Express Entry PNP
      // route, where a federal program minimum also applies.
      needsCheck("pnp-language", "Language, per province", "There is no single PNP language requirement. Each province sets its own, and the Express Entry PNP route additionally requires you to meet a federal program minimum (CLB 7 for Federal Skilled Worker)."),
      needsCheck("pnp-experience", "Experience, per province", "Experience requirements are set by the province and by the stream, usually tied to an occupation that province is short of."),
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
    timelineMonths: 30, timelineLabel: "Paused — closed to new applications",
    scoring: "none",
    requirements: [
      // Paused by IRCC on 30 June 2026. Applications accepted before that date
      // are still being processed; nothing new is accepted and no reopening date
      // has been published. Selling this as live would be the worst kind of
      // wrong, so the card says closed and says why.
      programmeClosed("The Start-up Visa was PAUSED by IRCC on 30 June 2026 and is closed to new applications. Files accepted before that date are still being processed. No reopening date has been published. Federal Business admissions are capped at 500 a year through 2028."),
      notOwnCountry("Canada"),
      languageAtLeast("clb", 5, "CLB 5 in all four abilities is the floor for the Start-up Visa."),
      businessIntentKnown("The Start-up Visa is for a new venture with a designated organisation behind it, not for moving an existing profitable company."),
      businessStageKnown("A designated incubator, angel group or venture fund must commit to the business — what they want to see depends on how far along it already is."),
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
    goals: ["pr", "study", "not-sure"],
    profiles: ["professional", "researcher"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 12, timelineLabel: "Skills assessment, then invitation round",
    scoring: "australia-points",
    requirements: [
      notOwnCountry("Australia"),
      ageBetween(18, 44),
      languageAtLeast("ielts", 6, "Competent English is the floor — IELTS 6 in every band, or the equivalent on PTE, TOEFL, CELPIP, OET or C1 Advanced. Citizens of the UK, USA, Canada, Ireland and New Zealand are exempt. Proficient is worth 10 points, Superior 20. The points threshold is 65, and real invitation rounds sit well above it."),
      educationAtLeast("diploma", "Your qualification must be assessed by the authority named for your occupation."),
      experienceAtLeast(3, "Three years of skilled employment is where points begin — less is allowed but scores zero.", false),
      cleanRecord, familyInclusive(),
      needsCheck("au-skills-assessment", "Skills assessment", "A positive skills assessment for the nominated occupation is mandatory, and usually the longest step."),
      needsCheck("au-occupation-list", "Occupation on the list", "For subclass 189 and 190 the list is the MLTSSL under LIN 19/051, on ANZSCO 2013 — NOT the Core Skills Occupation List, which governs the 482 and the 186."),
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
    goals: ["pr", "study", "not-sure"],
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
      experienceAtLeast(1, "Twelve months of work experience in the nominated occupation or a related field."),
      requiresSponsor("An approved Australian sponsor must nominate you, and must pay at least the relevant income threshold: AUD 79,423 for the Core Skills stream and AUD 146,576 for the Specialist Skills stream, for nominations lodged between 1 July 2026 and 30 June 2027. Without an employer, this route does not open."),
      cleanRecord, familyInclusive(),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skills-in-demand-visa-subclass-482",
    lastVerified: V,
  },

  {
    id: "au-niv-858",
    title: "National Innovation visa (subclass 858)",
    country: "Australia", countryKey: "australia", track: "skilled",
    href: "/skilled/australia",
    summary: "Permanent residence for people with an internationally recognised record of exceptional achievement — the route that replaced Global Talent.",
    goals: ["pr", "business-setup", "investment", "work-visa"],
    profiles: ["researcher", "entrepreneur", "investor", "professional"],
    investmentUsd: 0, investmentLabel: "No investment required",
    timelineMonths: 12, timelineLabel: "Expression of interest, then invitation",
    scoring: "none",
    requirements: [
      notOwnCountry("Australia"),
      // No language test appears in the published eligibility criteria. This is
      // the ONE Australian permanent route where a founder's achievements count
      // for more than their IELTS band, which is exactly why it belongs here.
      needsCheck("niv-invitation", "Invitation", "The Department must invite you before you can apply. You submit an expression of interest on the Department's own National Innovation visa form — not through SkillSelect — and an invitation is not a promise of grant."),
      needsCheck("niv-record", "Record of achievement", "An internationally recognised record of exceptional and outstanding achievement in a profession, sport, the arts, or academia and research. The Department names global researchers, entrepreneurs, innovative investors, athletes and creatives as the target group."),
      needsCheck("niv-nominator", "Nominator", "A nominator with a national reputation in your field — an Australian citizen, permanent resident, eligible New Zealand citizen, or an Australian organisation."),
      cleanRecord, familyInclusive(),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/national-innovation-visa-858",
    lastVerified: V,
  },
  {
    id: "au-188-closed",
    title: "Business Innovation and Investment (subclass 188)",
    country: "Australia", countryKey: "australia", track: "corporate",
    href: "/corporate/australia",
    summary: "Australia's business and investor migration programme, closed to new applications since July 2024.",
    goals: ["business-setup", "investment"],
    profiles: ["entrepreneur", "investor", "company"],
    investmentUsd: 0, investmentLabel: "Closed — no new applications accepted",
    timelineMonths: 0, timelineLabel: "Closed",
    scoring: "none",
    requirements: [
      // Shown, not hidden. People arrive having read about the 188 and will ask
      // for it by name; the useful answer is that it is gone and what replaced it.
      programmeClosed("The Business Innovation and Investment Program closed to new applications on 31 July 2024. Applications lodged before that date are still being processed, and existing 188 holders can still progress to the permanent subclass 888. There is no replacement business or investor route — Australia's innovation pathway is now the National Innovation visa (subclass 858), which is assessed on achievement rather than capital."),
      notOwnCountry("Australia"),
    ],
    officialUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/business-innovation-and-investment-188",
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
      needsCheck("uk-endorsement", "Endorsement", "An approved endorsing body must recognise you as a leader or emerging leader — or you must have won a prize on the published prestigious prize list, which skips endorsement entirely. Evidence quality decides this, not job title."),
      needsCheck("gt-settlement", "Settlement timing", "Settlement comes after 3 years for exceptional talent endorsees and prize winners, 5 years for exceptional promise. There is no English test to get the visa, but there is one at settlement."),
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
    goals: ["work-visa", "pr", "study"],
    profiles: ["professional", "company"],
    investmentUsd: 0, investmentLabel: "Employer-sponsored",
    timelineMonths: 3, timelineLabel: "Once a certificate of sponsorship is issued; settlement at 5 years",
    scoring: "none",
    requirements: [
      notOwnCountry("United Kingdom"),
      languageAtLeast("ielts", 6, "English is CEFR B2 in all four components, raised from B1 on 8 January 2026. People who already held the visa before that date keep B1 on an extension. B2 is roughly IELTS 5.5–6.0 a band, but the Home Office publishes no IELTS mapping — the test must be an approved SELT."),
      requiresSponsor("A UK employer holding a sponsor licence must issue a Certificate of Sponsorship."),
      cleanRecord, familyInclusive(),
      needsCheck("uk-salary", "Salary threshold", "The role must pay the HIGHER of GBP 41,700 a year and the going rate for its SOC 2020 code. Discounted floors exist for a relevant PhD, the Immigration Salary List and new entrants, down to GBP 33,400."),
      needsCheck("uk-skill-level", "Skill level of the job", "Since 22 July 2025 the job must sit at RQF level 6 — degree level — unless it is on the Immigration Salary List or the Temporary Shortage List. That change closed the route to a large number of roles that previously qualified."),
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
    timelineMonths: 14, timelineLabel: "Petition in months; for Indian applicants the queue is years",
    scoring: "none",
    requirements: [
      notOwnCountry("United States"),
      cleanRecord, familyInclusive(),
      needsCheck("eb1a-criteria", "Three of ten criteria", "You must satisfy at least three of the ten regulatory criteria — or hold one major internationally recognised award — then survive a final-merits assessment against the standard of being in the small percentage at the very top of your field. No job offer is needed and you may self-petition."),
      priorityDateQueue("For applicants born in India the wait is set by the Visa Bulletin, not by processing speed. On the September 2026 bulletin the EB-1 final action date for India is 15 October 2022 — roughly four years back — and the State Department has warned EB-1 India may become unavailable before the fiscal year ends. Approving the petition is not the same as getting the green card."),
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
    timelineMonths: 16, timelineLabel: "Petition in months; for Indian applicants the queue is over a decade",
    scoring: "none",
    requirements: [
      notOwnCountry("United States"),
      educationAtLeast("bachelor", "An advanced degree, or a bachelor's with five years of progressive experience in the specialty. There is also a separate Exceptional Ability basis needing three of six listed criteria, which can work without an advanced degree."),
      cleanRecord, familyInclusive(),
      needsCheck("niw-dhanasar", "The three-prong test", "Substantial merit and national importance, well positioned to advance it, and a balance favouring waiver of the job offer. You may self-petition and need no labour certification."),
      priorityDateQueue("For applicants born in India, EB-2 is UNAVAILABLE on the September 2026 Visa Bulletin, and the date for filing sits at January 2015 — more than eleven years back. An approved NIW petition for an Indian national means a place in a queue measured in over a decade, not a green card in months. Anyone telling you otherwise is selling."),
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
      fundsAtLeast(800_000, "The minimum qualifying investment is US$800,000 in a targeted employment area or an infrastructure project, otherwise US$1,050,000. These amounts are indexed and rise automatically on 1 January 2027, so a decision taken now is cheaper than the same decision in three months."),
      cleanRecord, includesFamily("Spouse and unmarried children under 21 are included on the same petition — a child turning 21 mid-process is a real risk worth planning for."),
      needsCheck("eb5-sof", "Source of funds", "Every rupee must be traced to a lawful source, with documentation. This is where most EB-5 cases actually fail."),
      needsCheck("eb5-jobs", "Job creation", "The investment must create at least ten full-time jobs for US workers — 35 hours a week, and not the investor or their family."),
      priorityDateQueue("For applicants born in India the unreserved EB-5 category is UNAVAILABLE on the September 2026 Visa Bulletin. The rural, high-unemployment and infrastructure set-asides are Current for India, which makes them the only genuinely fast EB-5 lane and is worth choosing deliberately."),
    ],
    officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/employment-based-immigration-fifth-preference-eb-5",
    lastVerified: V,
  },

  /* -------------------------------- FRANCE -------------------------------- */
  // France has NO residency-by-investment programme. The official register of
  // French residence permits contains no investor card. Everything below is a
  // work or talent permit with published criteria — which is the honest answer
  // to anyone who arrives asking for a "France golden visa".
  {
    id: "fr-talent-investment",
    title: "Talent Card — Direct Economic Investment",
    country: "France", countryKey: "france", track: "residency",
    href: "/residency/france/france-talent-economic-investment",
    summary: "€300,000 into fixed assets of a French business you control, for a multi-year card with the right to work.",
    goals: ["investment", "pr", "business-setup"],
    profiles: ["investor", "entrepreneur", "family"],
    investmentUsd: 330_000, investmentLabel: "€300,000 in tangible or intangible fixed assets",
    timelineMonths: 6, timelineLabel: "Consular application to residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("France"),
      fundsAtLeast(330_000, "This route needs €300,000 placed in tangible or intangible fixed assets in France — held personally, or through a company in which you hold at least 30% of the capital. It is equity in a real business, not a contribution and not a product with a return."),
      cleanRecord,
      includesFamily("A spouse and minor children receive a talent-famille card through the accompanying-family route, which skips the ordinary family reunification procedure."),
      sourceOfFundsKnown("The origin of the investment funds must be documented for both the consulate and the French bank handling the transfer."),
      needsCheck("fr-inv-jobs", "Employment undertaking", "The investment must come with a commitment to create or preserve employment in France. That undertaking is part of the file, not an afterthought."),
      needsCheck("fr-inv-structure", "Holding structure", "Investing through a company requires you to hold at least 30% of its capital. Below that the route does not open, however large the investment."),
    ],
    officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922",
    lastVerified: V,
  },
  {
    id: "fr-talent-business-creation",
    title: "Talent Card — Business Creation",
    country: "France", countryKey: "france", track: "corporate",
    href: "/residency/france/france-talent-business-creation",
    summary: "Start a business in France with €30,000 of financing, a master's-level qualification or five years of comparable experience.",
    goals: ["business-setup", "pr", "work-visa"],
    profiles: ["entrepreneur", "professional", "investor"],
    investmentUsd: 33_000, investmentLabel: "€30,000 project financing, own or borrowed",
    timelineMonths: 5, timelineLabel: "Consular application to residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("France"),
      educationAtLeast("masters", "This route needs a master's-level qualification, or at least five years of professional experience at a comparable level. The experience alternative exists so that founders without a postgraduate degree are not shut out."),
      fundsAtLeast(33_000, "At least €30,000 of financing must sit behind the project. It can be borrowed. Separately you need personal resources at the annual gross SMIC, currently €22,404.20, to live on."),
      businessIntentKnown("This route is for creating or taking over a business in France, and the prefecture assesses whether the project is real and serious — a judgement about the plan, not just the number."),
      cleanRecord,
      includesFamily("A spouse and minor children receive a talent-famille card without the family reunification procedure."),
      needsCheck("fr-bc-viability", "Project viability", "The decisive words in the criteria are 'real and serious'. A thinly capitalised plan in a capital-intensive sector can clear €30,000 and still fail on viability."),
    ],
    officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922",
    lastVerified: V,
  },
  {
    id: "fr-talent-innovative",
    title: "Talent Card — Innovative Economic Project",
    country: "France", countryKey: "france", track: "corporate",
    href: "/residency/france/france-talent-innovative-project",
    summary: "France's startup route: no minimum investment, but the project must be recognised as innovative by the economy ministry.",
    goals: ["business-setup", "pr", "work-visa", "not-sure"],
    profiles: ["entrepreneur", "researcher", "professional"],
    investmentUsd: 0, investmentLabel: "No minimum investment specified",
    timelineMonths: 7, timelineLabel: "Ministry recognition, then visa",
    scoring: "none",
    requirements: [
      notOwnCountry("France"),
      // Deliberately no fundsAtLeast. Capital is not the gate here and pretending
      // otherwise would push away exactly the founders this route exists for.
      businessIntentKnown("This is the innovation route. Capital does not help and its absence does not hurt — recognition of the project by the ministry responsible for the economy is the whole test."),
      businessStageKnown("How far along the venture is shapes the recognition case: novelty, team and whether the French market already has this."),
      cleanRecord,
      includesFamily("A spouse and minor children receive a talent-famille card without the family reunification procedure."),
      needsCheck("fr-innov-recognition", "Ministry recognition", "The project must be recognised as innovative by the ministry responsible for the economy. This is the step you control least, and the timeline follows it rather than you."),
      needsCheck("fr-innov-means", "Personal resources", "You still need personal means at the annual gross SMIC, currently €22,404.20, to live on while the venture develops."),
    ],
    officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922",
    lastVerified: V,
  },
  {
    id: "fr-blue-card",
    title: "EU Blue Card (carte bleue européenne)",
    country: "France", countryKey: "france", track: "skilled",
    href: "/skilled/france/france-eu-blue-card",
    summary: "A multi-year French talent card for salaried professionals earning €59,373 or more, with family rights and EU portability.",
    goals: ["work-visa", "pr"],
    profiles: ["professional", "researcher", "company"],
    investmentUsd: 0, investmentLabel: "No investment — employer contract required",
    timelineMonths: 4, timelineLabel: "Offer to residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("France"),
      educationAtLeast("bachelor", "A diploma covering at least three years of higher education, or five years of professional experience at a comparable level relevant to the sector. For professions on a ministerial list the experience requirement drops to three years within the previous seven."),
      requiresSponsor("A French employment contract of at least six months, paying at least €59,373 gross a year — one and a half times the reference average gross annual salary. There is no discounted rate and no age concession."),
      cleanRecord,
      includesFamily("A spouse and minor children receive a talent-famille card without the family reunification procedure."),
      needsCheck("fr-bc-duration", "Card length", "A contract of two years or more gives a card matching it, capped at four years. Under two years gives the contract plus three months, capped at two."),
      needsCheck("fr-bc-mobility", "EU mobility", "Already hold a Blue Card in another member state for a year? You can move to France on it — but the French application must be filed within one month of entering."),
    ],
    officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F16922",
    lastVerified: V,
  },
  {
    id: "fr-visitor",
    title: "Long-Stay Visitor Card",
    country: "France", countryKey: "france", track: "residency",
    href: "/residency/france/france-long-stay-visitor",
    summary: "Live in France on your own means — no business, no employer, and no right to work of any kind.",
    goals: ["pr", "not-sure"],
    profiles: ["investor", "family", "remote"],
    investmentUsd: 0, investmentLabel: "No investment — €1,477.93 net per month in resources",
    timelineMonths: 3, timelineLabel: "Consular application to residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("France"),
      fundsAtLeast(19_500, "You must evidence at least €1,477.93 net a month across a full year — officially €17,735.19 for a single person. Own pensions and rental income count; family allowances do not."),
      cleanRecord,
      needsCheck("fr-visitor-nowork", "No work permitted", "This card forbids all work — employment, trading, self-employment, craft trades and the liberal professions — and you sign a handwritten declaration confirming it. Remote work for a foreign employer is a grey area needing case-specific advice."),
      needsCheck("fr-visitor-naturalisation", "Citizenship caveat", "Naturalisation needs five years AND stable income from professional integration, which official guidance calls an essential condition. No official page says whether visitor years count towards the five. If citizenship is the goal, a talent card is the safer foundation."),
    ],
    officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F302",
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
    investmentUsd: 550_000, investmentLabel: "Qualifying options and amounts need current confirmation — residential property no longer qualifies",
    timelineMonths: 12, timelineLabel: "Application to first residence card",
    scoring: "none",
    requirements: [
      notOwnCountry("Portugal"),
      // [VERIFY] Deliberately NOT a hard threshold. AIMA, the competent authority
      // since SEF was abolished, does not currently publish the ARI programme at
      // all — its investment section lists only the Startup Visa. We will not
      // close a route, or quote a figure, on a number we cannot source from the
      // government that runs it.
      needsCheck("pt-amount", "Qualifying amount", "Portugal removed residential real estate as a qualifying investment and has narrowed the remaining options more than once. The surviving routes are fund subscriptions, company creation with job creation, and cultural or scientific support — each with its own floor. An advisor must confirm what is open and at what amount before you commit to anything."),
      cleanRecord,
      includesFamily("Dependants change the government fees and the documents required for each person."),
      minimumStayFits("Portugal's stay requirement is low but real — seven days in the first year, fourteen in each two-year period after that. It matters if you plan to keep living elsewhere."),
      sourceOfFundsKnown("Portuguese banks and AIMA both trace the origin of the investment funds before the application proceeds."),
      needsCheck("pt-citizenship", "Citizenship timing", "The five-year route to citizenship is the main reason people choose Portugal, and the qualifying period has been the subject of repeated legislative change. Confirm what is in force on the day you apply rather than what was true when an article was written."),
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
    investmentUsd: 440_000, investmentLabel: "From €400,000, and €800,000 in Attica, Thessaloniki, Mykonos, Santorini and islands over 3,100 people",
    timelineMonths: 8, timelineLabel: "About 50 days from a complete digital application",
    scoring: "none",
    requirements: [
      notOwnCountry("Greece"),
      fundsAtLeast(440_000, "Article 64 of Law 5100/2024 raised the real-estate floor to €800,000 across the whole Region of Attica, the Regional Unit of Thessaloniki, Mykonos, Santorini and every island with more than 3,100 inhabitants, and to €400,000 everywhere else. The old €250,000 figure survives only for two narrow routes: converting a commercial building to residential use, and restoring a listed building."),
      cleanRecord,
      includesFamily("Spouse, children under 21 and both sets of parents can be included — which is unusually generous and worth planning around."),
      minimumStayFits("Greece has no minimum stay at all. Say so and it becomes a strong answer for someone who cannot relocate."),
      sourceOfFundsKnown("Funds must arrive from a bank account in your name and the origin must be evidenced."),
      needsCheck("gr-zone", "Which zone", "Where the property sits decides your minimum: €800,000 in Attica, Thessaloniki, Mykonos, Santorini and islands over 3,100 people, €400,000 elsewhere. Get the zone wrong and the application fails on the threshold."),
      needsCheck("gr-250k-routes", "The €250,000 routes", "Two exceptions keep the old floor — a commercial property converted to residential use, and a listed building restored. Both are real options and both carry conditions worth understanding before you buy."),
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
    investmentUsd: 545_000, investmentLabel: "AED 2 million for the investor route — 5 years on real estate, 10 on public investment; talent routes need no investment",
    timelineMonths: 3, timelineLabel: "Among the faster routes",
    scoring: "none",
    requirements: [
      notOwnCountry("United Arab Emirates"),
      cleanRecord,
      includesFamily("Spouse, children and domestic staff can be sponsored once the Golden Visa is issued."),
      minimumStayFits("The Golden Visa is exempt from the six-month absence rule that cancels an ordinary UAE residence visa. That exemption, not a promise it can never lapse, is what makes it work for someone living elsewhere."),
      needsCheck("ae-category", "Which category", "Investors get 10 years on public investment and 5 on real estate, both from AED 2 million. Entrepreneurs get 5 years and need an incubator or emirate authority letter — the UAE publishes no capital figure for that route. Exceptional talent and top university students get 10 years, high-school achievers 5."),
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
    investmentUsd: 200_000, investmentLabel: "From US$200,000 (Dominica); Antigua US$230,000, St Lucia US$240,000, St Kitts US$250,000",
    timelineMonths: 8, timelineLabel: "6–12 months to passport in most programmes",
    scoring: "none",
    requirements: [
      fundsAtLeast(200_000, "US$200,000 buys one programme, not five. Dominica starts at US$200,000, Antigua & Barbuda at US$230,000, St Lucia at US$240,000 and St Kitts & Nevis at US$250,000, all before due diligence, processing and legal fees. Budget at the programme you actually want."),
      cleanRecord,
      noPriorRefusal,
      includesFamily("Which relatives can be added, and at what age, is the single biggest difference between the five programmes."),
      sourceOfFundsKnown("Every Caribbean programme runs a full source-of-funds investigation. Unexplained funds are the most common reason an application fails."),
      needsCheck("cbi-dd", "Due diligence", "Every applicant is investigated. Source of funds, business history and any adverse media are examined before approval. An interview is now mandatory in Dominica, St Kitts & Nevis, St Lucia and Grenada — Antigua reserves the right to require one."),
      needsCheck("cbi-visa-free", "Visa-free access, checked today", "Visa-free access is the product, and it is not static. Antigua & Barbuda is currently subject to a US entry proclamation and a US visa bond pilot, which its own Citizenship by Investment Unit is publishing about. Check the current position for the specific passport before you buy it, not the position in last year's brochure."),
      needsCheck("cbi-country", "Which island", "Five programmes with different costs, timelines and family rules. The right one depends on your family and your travel needs."),
    ],
    officialUrl: "https://www.cbiu.gov.dm/investment-options/economic-diversification-fund/",
    lastVerified: V,
  },
];

export const programmeRuleById = new Map(programmeRules.map((rule) => [rule.id, rule]));
