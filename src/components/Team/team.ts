// ==============================================
// data/team.ts
// ==============================================
export type Social = { platform: "x" | "linkedin" | "github" | "dribbble" | "youtube" | "website"; url: string };
export type Person = { id: string; name: string; role: string; headshot?: string; bio?: string; socials?: Social[]; email?: string; location?: string; tags?: string[] };
export type EventItem = { id: string; date: string; title: string; summary?: string; link?: string };

export const ORG = {
  name: "XIPHIAS Immigration",
  legalName: "XIPHIAS Immigration Pvt. Limited",
  slogan: "Trusted investment-migration advisory across citizenship and residency.",
  url: "https://www.xiphiasimmigration.com",
  logo: "/images/logo.svg",
  contactEmail: "immigration@xiphias.in",
  sameAs: [
    "https://www.linkedin.com/company/xiphias-immigration-pvt-limited",
    "https://www.linkedin.com/company/xiphias-immigration/",
    "https://twitter.com/xiphiasimmig",
    "https://x.com/XiphiasInfo",
    "https://www.youtube.com/@immigrationxiphias5228",
    "https://www.facebook.com/xiphiasimmigration",
    "https://www.instagram.com/xiphias.immigration/",
  ],
};

export const LEADERSHIP: Person[] = [
  { id: "md", name: "Varun Singh", role: "Managing Director", bio: "17+ years of expertise in investment migration, resettlement, and international business expansion. Certified IMC Fellow with CPD credentials. Leads award-winning teams delivering compliant solutions across citizenship- and residency-by-investment, global real estate, and cross-border business growth.", socials: [{ platform: "linkedin", url: "https://www.linkedin.com/in/varunxiphias/" }], location: "Bengaluru, India", tags: ["Leadership", "Investment Migration"] },
];

export const ADVISORS: Person[] = [];

export const TEAM: Person[] = [];

export const EVENTS: EventItem[] = [];