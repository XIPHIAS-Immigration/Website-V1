// src/data/credentials.ts
// -----------------------------------------------------------------------------
// Verifiable regulatory credentials and firm facts.
//
// RULE: nothing goes in this file unless it can be checked by a member of the
// public against a primary source. Every entry carries the register URL, the
// exact name the regulator holds, and the date we last confirmed it. Marketing
// claims that cannot be verified (client counts, success rates, awards sourced
// only to paid-placement magazines) belong somewhere else, not here.
//
// The CICC Code of Professional Conduct (SOR/2022-128) s.44(1)(b) requires any
// written advertisement carrying a licence to include the College's public
// register address — which is why every credential below renders as a link.
// -----------------------------------------------------------------------------

export type Credential = {
  id: string;
  /** Short label for a chip. */
  label: string;
  /** The regulator or body, spelled as it spells itself. */
  authority: string;
  authorityShort: string;
  /** Registration / licence number exactly as the register holds it. */
  reference: string;
  /** The person or entity the register holds the number against. */
  heldBy: string;
  /** What this licence actually permits — no puffery. */
  scope: string;
  /** Public register URL. Required. */
  verifyUrl: string;
  /** ISO date we last confirmed the entry on the register. */
  lastVerified: string;
  /** Country the licence governs. */
  country: string;
};

export const credentials: Credential[] = [
  {
    id: "rcic",
    label: "RCIC R516194",
    authority: "College of Immigration and Citizenship Consultants",
    authorityShort: "CICC",
    reference: "R516194",
    heldBy: "Lijun Wang — listed against XIPHIAS Immigration Pvt Ltd (India) and XIPHIAS Immigration DMCC",
    scope:
      "Regulated Canadian Immigration Consultant, Class L2. Status on the public register: entitled to practise.",
    verifyUrl: "https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx",
    lastVerified: "2026-09-13",
    country: "Canada",
  },
  {
    id: "mara",
    label: "MARA 1680615",
    authority: "Office of the Migration Agents Registration Authority",
    authorityShort: "OMARA",
    reference: "1680615",
    heldBy: "Registered migration agent acting for XIPHIAS Immigration",
    scope: "Registered to provide Australian immigration assistance.",
    verifyUrl: "https://portal.mara.gov.au/search-the-register-of-migration-agents/",
    lastVerified: "2026-09-13",
    country: "Australia",
  },
  {
    id: "imc",
    label: "Fellow IMC",
    authority: "Investment Migration Council",
    authorityShort: "IMC",
    reference: "Fellow · Cert IMC",
    heldBy: "Varun Singh, Managing Director",
    scope:
      "Fellow and certified member of the industry body for residence and citizenship by investment.",
    verifyUrl: "https://investmentmigration.org/fellow-members-directory/",
    lastVerified: "2026-09-13",
    country: "Global",
  },
];

/** The one credential that is the strongest differentiator in the Indian market. */
export const primaryCredentialId = "rcic";

export type Office = {
  city: string;
  region: string;
  country: string;
  headquarters?: boolean;
};

export const offices: Office[] = [
  { city: "Bengaluru", region: "Koramangala", country: "India", headquarters: true },
  { city: "Gurugram", region: "Haryana", country: "India" },
  { city: "Dubai", region: "JLT", country: "United Arab Emirates" },
  { city: "Doha", region: "", country: "Qatar" },
  { city: "Melbourne", region: "Victoria", country: "Australia" },
  { city: "Waterloo", region: "Ontario", country: "Canada" },
];

/** Firm facts we can stand behind. Anything not checkable stays out. */
export const firmFacts = {
  foundedYear: 2009,
  advisorYearsExperience: 17,
  officeCount: offices.length,
  headquarters: "Koramangala, Bengaluru",
  cin: "U74900KA2015PTC078396",
  googleRating: 4.8,
  /** What XIPHIAS is, and is not. Repeated verbatim on regulated surfaces. */
  serviceBoundary:
    "XIPHIAS provides immigration consulting and documentation support. It is not a law firm, and nothing on this page is legal advice.",
} as const;
