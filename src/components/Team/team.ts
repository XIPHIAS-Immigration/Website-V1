// ==============================================
// data/team.ts
// ==============================================
export type Social = { platform: "x" | "linkedin" | "github" | "dribbble" | "youtube" | "website"; url: string };
export type Person = { id: string; name: string; role: string; headshot?: string; bio?: string; socials?: Social[]; email?: string; location?: string; tags?: string[] };
export type EventItem = { id: string; date: string; title: string; summary?: string; link?: string };

export const ORG = {
  name: "Your Company Name",
  legalName: "Your Company Pvt. Ltd.",
  slogan: "Building trust through great execution.",
  url: "https://www.example.com",
  logo: "/images/logo.svg",
  contactEmail: "hello@example.com",
  sameAs: [
    "https://www.linkedin.com/company/example",
    "https://twitter.com/example",
  ],
};

export const LEADERSHIP: Person[] = [
  { id: "ceo", name: "Aarav Mehta", role: "Founder & CEO", headshot: "/images/team/aarav.jpg", bio: "Product-first operator with 12+ years in scaling SaaS.", socials: [{ platform: "linkedin", url: "https://www.linkedin.com/in/aarav-mehta" }, { platform: "x", url: "https://x.com/aarav" }], email: "aarav@example.com", location: "Bengaluru, IN", tags: ["Leadership", "Strategy", "Growth"] },
  { id: "cto", name: "Riya Sharma", role: "CTO", headshot: "/images/team/riya.jpg", bio: "Leads platform architecture and AI-driven UX.", socials: [{ platform: "linkedin", url: "https://www.linkedin.com/in/riya-sharma" }, { platform: "github", url: "https://github.com/riya" }], location: "Pune, IN", tags: ["Engineering", "AI", "DevEx"] },
  { id: "cxo", name: "Kabir Nair", role: "COO", headshot: "/images/team/kabir.jpg", bio: "Owns delivery excellence and global ops.", socials: [{ platform: "linkedin", url: "https://www.linkedin.com/in/kabir" }], location: "Gurugram, IN", tags: ["Operations", "Compliance"] },
];

export const ADVISORS: Person[] = [
  { id: "adv1", name: "Elena Martins", role: "Advisor – Capital & Partnerships", headshot: "/images/team/elena.jpg", socials: [{ platform: "linkedin", url: "https://www.linkedin.com/in/elena" }], tags: ["Finance", "Partnerships"] },
];

export const TEAM: Person[] = [
  { id: "p1", name: "Dev Gupta", role: "Lead Designer", tags: ["Design", "Brand"], socials: [{ platform: "dribbble", url: "https://dribbble.com/dev" }] },
  { id: "p2", name: "Nisha Rao", role: "Senior Product Manager", tags: ["Product"], socials: [{ platform: "linkedin", url: "https://linkedin.com/in/nisharao" }] },
  { id: "p3", name: "Anil Kumar", role: "Frontend Engineer", tags: ["Engineering", "Web"], socials: [{ platform: "github", url: "https://github.com/anilk" }] },
  { id: "p4", name: "Sara Khan", role: "Growth Marketer", tags: ["Marketing"], socials: [{ platform: "x", url: "https://x.com/sarak" }] },
  { id: "p5", name: "Harsh Patel", role: "QA & SRE", tags: ["Engineering", "Quality"], socials: [{ platform: "github", url: "https://github.com/harsh" }] },
];

export const EVENTS: EventItem[] = [
  { id: "e1", date: "2025-05-12", title: "Design Meetup: Crafting Lightweight UX", link: "https://example.com/events/design-meetup" },
  { id: "e2", date: "2025-08-02", title: "Web Summit APAC – Speaker Session", summary: "Riya on high-performance Next.js patterns." },
  { id: "e3", date: "2025-11-15", title: "Open Source Day", summary: "Company-wide contribution sprint." },
];