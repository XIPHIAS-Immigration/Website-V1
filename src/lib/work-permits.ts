export type WorkPermitCountry = {
  slug: string;
  country: string;
  code: string;
  region: string;
  image: string;
  href: string;
  permitTypes: string[];
  advisoryFocus: string;
  processingSignal: string;
  proofPoints: string[];
  routeReadiness: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  documentChecklist: string[];
  advisorChecks: string[];
};

export const workPermitCountries: WorkPermitCountry[] = [
  {
    slug: "canada",
    country: "Canada",
    code: "CA",
    region: "North America",
    image: "/images/skilled/canada/global-talent-stream.webp",
    href: "/skilled/canada/global-talent-stream",
    permitTypes: ["Global Talent Stream", "Employer-specific work permit", "LMIA-backed pathway", "Intra-company transfer"],
    advisoryFocus: "Employer support, NOC fit, wage evidence, LMIA/LMIA-exempt logic, and family work/study planning.",
    processingSignal: "High demand for technology, healthcare, trades, and employer-sponsored profiles.",
    proofPoints: ["Resume and role match", "Employer documentation", "Education and experience proof"],
    routeReadiness: [
      { label: "Sponsor basis", value: "Employer-led", detail: "Most routes need a Canadian employer or LMIA-exempt category." },
      { label: "Profile fit", value: "NOC + wage", detail: "Role duties, wage level, and experience must align." },
      { label: "Family planning", value: "Often possible", detail: "Spouse/dependent options depend on job category and status." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Education proof", "Employment letters", "Offer letter or employer details", "Language or licensing proof if applicable"],
    advisorChecks: ["NOC match", "LMIA vs LMIA-exempt pathway", "Employer compliance readiness", "Family permit strategy"],
  },
  {
    slug: "usa",
    country: "United States",
    code: "US",
    region: "North America",
    image: "/images/skilled/usa/h1b-visa.webp",
    href: "/skilled/usa/h1b-specialty-occupation",
    permitTypes: ["H-1B", "L-1 transfer", "O-1 profile review", "J-1 exchange visitor"],
    advisoryFocus: "Specialty occupation fit, employer sponsorship, profile strength, petition category, and evidence gaps.",
    processingSignal: "Best for sponsored roles, intra-company transfers, founders, researchers, and high-skill specialists.",
    proofPoints: ["Degree and role alignment", "Employer sponsorship", "Achievements or specialized skills"],
    routeReadiness: [
      { label: "Sponsor basis", value: "Required", detail: "H-1B/L-1/J-1 routes require a sponsor or qualifying host structure." },
      { label: "Profile fit", value: "Evidence-heavy", detail: "Degree, specialty role, prior employment, or exceptional profile must be documented." },
      { label: "Timing risk", value: "Category-led", detail: "Lottery, petition timing, premium processing, and consular slots vary by route." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Degree and transcripts", "Employment letters", "Job offer or petition basis", "Awards/publications if O-1/NIW direction"],
    advisorChecks: ["Specialty occupation fit", "L-1 qualifying relationship", "O-1 evidence strength", "Petition and consular readiness"],
  },
  {
    slug: "united-kingdom",
    country: "United Kingdom",
    code: "GB",
    region: "Europe",
    image: "/images/skilled/united-kingdom/uk-skilled-visa.webp",
    href: "/skilled/united-kingdom/uk-global-talent-visa",
    permitTypes: ["Skilled Worker", "Global Talent", "Expansion Worker", "Self-sponsorship direction"],
    advisoryFocus: "Sponsor readiness, occupation code, salary threshold, endorsement route, and dependent planning.",
    processingSignal: "Useful for sponsored employment, corporate expansion, founders, and exceptional talent profiles.",
    proofPoints: ["Certificate of Sponsorship", "Salary threshold", "English and role evidence"],
    routeReadiness: [
      { label: "Sponsor basis", value: "Usually required", detail: "Skilled Worker depends on a licensed sponsor and eligible occupation." },
      { label: "Profile fit", value: "Salary + code", detail: "Occupation code, salary threshold, and English ability must be checked." },
      { label: "Talent route", value: "Endorsement", detail: "Global Talent depends on endorsement or recognised evidence." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Job offer or sponsor details", "Education proof", "English evidence", "Endorsement material if applicable"],
    advisorChecks: ["Occupation code fit", "Sponsor licence readiness", "Salary threshold", "Dependent and settlement path"],
  },
  {
    slug: "australia",
    country: "Australia",
    code: "AU",
    region: "Oceania",
    image: "/images/skilled/australia/australia-186-employer-visa.webp",
    href: "/skilled/australia/employer-nomination-scheme-186",
    permitTypes: ["Employer Nomination 186", "Skilled Independent 189", "Skilled Nominated 190", "Regional 491"],
    advisoryFocus: "Skills assessment, occupation list, English score, points position, employer nomination, and regional strategy.",
    processingSignal: "Strong for points-tested professionals and employer-sponsored applicants with documented work history.",
    proofPoints: ["Skills assessment", "English score", "Occupation and points fit"],
    routeReadiness: [
      { label: "Route basis", value: "Points or employer", detail: "189/190/491 are points-led; 186/187 need employer nomination." },
      { label: "Profile fit", value: "Occupation list", detail: "Skills assessment and occupation list fit drive route viability." },
      { label: "State strategy", value: "Important", detail: "Nomination and regional options can change the best pathway." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Skills assessment material", "English score", "Employment references", "Education certificates"],
    advisorChecks: ["Occupation list fit", "Points estimate", "State/region nomination", "Employer nomination readiness"],
  },
  {
    slug: "germany",
    country: "Germany",
    code: "DE",
    region: "Europe",
    image: "/images/skilled/germany/germany-job-seeker-visa.webp",
    href: "/skilled/germany/germany-job-seeker-visa",
    permitTypes: ["Opportunity Card", "EU Blue Card", "Skilled Worker Residence", "Job seeker route"],
    advisoryFocus: "Degree recognition, salary threshold, occupation shortage, German/English profile, and job-search readiness.",
    processingSignal: "Good fit for STEM, engineering, healthcare, IT, and recognized qualification profiles.",
    proofPoints: ["Recognized qualification", "Salary or job offer", "Language and funds readiness"],
    routeReadiness: [
      { label: "Route basis", value: "Offer or points", detail: "EU Blue Card needs salary/job fit; Opportunity Card is points-based." },
      { label: "Profile fit", value: "Recognition", detail: "Degree and professional recognition are major review points." },
      { label: "Readiness", value: "Funds + language", detail: "Funds, insurance, and language evidence can affect file quality." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Degree recognition proof", "Employment letters", "Job offer if available", "Funds and insurance proof"],
    advisorChecks: ["Degree recognition", "Blue Card salary fit", "Opportunity Card score", "Consular document readiness"],
  },
  {
    slug: "uae",
    country: "UAE",
    code: "AE",
    region: "Middle East",
    image: "/images/corporate/uae/dubai-mainland-employment-visa.webp",
    href: "/corporate/uae/dubai-mainland-employment-visa",
    permitTypes: ["Mainland employment visa", "Freezone employment visa", "Investor plus employment setup", "Golden Visa talent review"],
    advisoryFocus: "Employment sponsor, freezone/mainland structure, medical/Emirates ID steps, family sponsorship, and compliance timing.",
    processingSignal: "Practical for employer-led relocation, company formation, and professional mobility into the Gulf.",
    proofPoints: ["Sponsor or company setup", "Passport and medical readiness", "Role and salary documentation"],
    routeReadiness: [
      { label: "Sponsor basis", value: "Employer/company", detail: "Mainland/freezone employment depends on sponsor or company setup." },
      { label: "Profile fit", value: "Role + salary", detail: "Role classification, salary, and company status affect process flow." },
      { label: "Family planning", value: "Structured", detail: "Family sponsorship depends on salary, tenancy, and document readiness." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Photo", "Education proof", "Employment contract or company details", "Civil documents for family"],
    advisorChecks: ["Freezone vs mainland flow", "Medical and Emirates ID sequence", "Family sponsorship", "Document attestation need"],
  },
  {
    slug: "portugal",
    country: "Portugal",
    code: "PT",
    region: "Europe",
    image: "/images/news/portugal-skilled-work-visa.webp",
    href: "/corporate/portugal/portugal-d2-visa",
    permitTypes: ["Work residence direction", "D2 business route", "Highly qualified activity", "Remote/freelance route review"],
    advisoryFocus: "Employment or business basis, consular file readiness, funds, accommodation, and route timing.",
    processingSignal: "Suitable for professionals, entrepreneurs, and applicants planning European residence with a clear activity basis.",
    proofPoints: ["Work/business basis", "Funds and accommodation", "Consular documents"],
    routeReadiness: [
      { label: "Route basis", value: "Activity-led", detail: "Work, business, or highly qualified activity must be clearly supported." },
      { label: "Profile fit", value: "Consular file", detail: "Funds, accommodation, insurance, and purpose need clean documentation." },
      { label: "Timing", value: "Appointment-led", detail: "Embassy/consular timing often controls the practical calendar." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Work/business proof", "Funds proof", "Accommodation proof", "Insurance and civil documents"],
    advisorChecks: ["Route basis", "Consular file quality", "Funds and accommodation", "Family/dependent readiness"],
  },
  {
    slug: "spain",
    country: "Spain",
    code: "ES",
    region: "Europe",
    image: "/images/skilled/spain/spain-digital-nomad-visa.webp",
    href: "/skilled/spain/spain-digital-nomad-visa",
    permitTypes: ["Digital Nomad", "Highly qualified professional", "Entrepreneur route", "Corporate transfer direction"],
    advisoryFocus: "Remote income evidence, employer/client structure, social security/tax exposure, and family file readiness.",
    processingSignal: "Relevant for remote professionals, founders, and specialists with cross-border income or Spanish employer support.",
    proofPoints: ["Remote income proof", "Contracts and compliance", "Family and civil documents"],
    routeReadiness: [
      { label: "Route basis", value: "Remote/professional", detail: "Digital nomad and highly qualified routes need different evidence." },
      { label: "Profile fit", value: "Income + contracts", detail: "Income continuity, client/employer terms, and remote work basis are reviewed." },
      { label: "Compliance", value: "Tax/social security", detail: "Tax and social-security exposure should be checked before filing." },
    ],
    documentChecklist: ["Resume/CV", "Passport", "Remote work contracts", "Income proof", "Insurance", "Civil documents for family"],
    advisorChecks: ["Remote income structure", "Employer/client documentation", "Tax and social-security exposure", "Family file readiness"],
  },
];

export function findWorkPermitCountry(slugOrCountry: string | undefined) {
  if (!slugOrCountry) return undefined;
  const value = slugOrCountry.toLowerCase().trim();
  return workPermitCountries.find(
    (item) => item.slug === value || item.country.toLowerCase() === value,
  );
}
