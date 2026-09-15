// src/lib/xia/concierge-catalogue.ts
// -----------------------------------------------------------------------------
// The closed world the concierge is allowed to operate in.
//
// The model decides WHICH question to ask next and HOW to word it. It does not
// decide what exists. Every option it may offer and every page it may route to
// is listed here, and the server rejects anything outside these lists before the
// response reaches a visitor. That is what makes an understanding assistant safe
// on a regulated site: natural conversation, closed vocabulary.
//
// Values match src/lib/xia-concierge-prefill.ts exactly, so a routed visitor
// lands with the form already filled.
// -----------------------------------------------------------------------------

export const CONCIERGE_FIELDS = [
  "destination",
  "goal",
  "profile",
  "timeline",
  "family",
  "nationality",
] as const;

export type ConciergeField = (typeof CONCIERGE_FIELDS)[number];

export type ConciergeState = Partial<{
  destination: string;
  goal: string;
  profile: string;
  timeline: string;
  family: string;
  nationality: string;
}>;

export type Option = { value: string; label: string; hint?: string };

/** Destinations XIPHIAS actually has programme coverage for. */
export const DESTINATIONS: Option[] = [
  { value: "canada", label: "Canada", hint: "PR, Express Entry, PNP, Start-up Visa" },
  { value: "australia", label: "Australia", hint: "Points-tested PR, employer sponsored" },
  { value: "united kingdom", label: "United Kingdom", hint: "Global Talent, Innovator, Skilled Worker" },
  { value: "united states", label: "United States", hint: "EB-1A, EB-2 NIW, O-1, L-1, EB-5" },
  { value: "new zealand", label: "New Zealand", hint: "Skilled Migrant, Green List" },
  { value: "portugal", label: "Portugal", hint: "Residency by investment, D7, D8" },
  { value: "greece", label: "Greece", hint: "Golden Visa" },
  { value: "uae", label: "UAE", hint: "Golden Visa, business set-up" },
  { value: "caribbean", label: "Caribbean", hint: "Citizenship by investment" },
  { value: "europe", label: "Somewhere in Europe", hint: "Compare EU residency routes" },
  { value: "not-sure", label: "I'm not sure yet", hint: "Compare on outcome instead of country" },
];

/** Must mirror getRoutePrefill's allowed goals. */
export const GOALS: Option[] = [
  { value: "pr", label: "Permanent residence", hint: "Settle long term" },
  { value: "work-visa", label: "Work abroad", hint: "Job or employer sponsorship" },
  { value: "citizenship", label: "A second passport", hint: "Travel freedom, family security" },
  { value: "investment", label: "Residency through investment", hint: "Property, funds, contribution" },
  { value: "business-setup", label: "Start or move a business", hint: "Founder, entrepreneur, expansion" },
  { value: "family-migration", label: "Join or bring family", hint: "Spouse, parents, dependants" },
  // Post-study settlement. Carried by the PNP graduate streams, Australia's 189
  // and 190 and the UK Skilled Worker route — see programme-requirements.
  { value: "study", label: "Study, then settle", hint: "Graduate routes to residence" },
  { value: "not-sure", label: "Still deciding", hint: "Show me what's realistic" },
];

/** Must mirror getRoutePrefill's allowed profiles. */
export const PROFILES: Option[] = [
  { value: "professional", label: "Salaried professional" },
  { value: "entrepreneur", label: "Founder or business owner" },
  { value: "investor", label: "Investor" },
  { value: "researcher", label: "Researcher or academic" },
  { value: "student", label: "Student or recent graduate" },
  { value: "family", label: "Applying as a family" },
  { value: "remote", label: "Remote worker or freelancer" },
  { value: "company", label: "Moving staff for a company" },
];

export const TIMELINES: Option[] = [
  { value: "3", label: "Within 3 months" },
  { value: "6", label: "3 to 6 months" },
  { value: "12", label: "6 to 12 months" },
  { value: "24", label: "1 to 2 years" },
  { value: "0", label: "No fixed date" },
];

export const FAMILY: Option[] = [
  { value: "alone", label: "Just me" },
  { value: "partner", label: "Me and my partner" },
  { value: "children", label: "With children" },
  { value: "parents", label: "Including parents" },
];

export const FIELD_OPTIONS: Record<ConciergeField, Option[]> = {
  destination: DESTINATIONS,
  goal: GOALS,
  profile: PROFILES,
  timeline: TIMELINES,
  family: FAMILY,
  nationality: [],
};

export const FIELD_PROMPT_HINT: Record<ConciergeField, string> = {
  destination: "which country or region they are drawn to",
  goal: "what outcome they actually want",
  profile: "how they would describe themselves professionally",
  timeline: "how soon they want to move",
  family: "who is coming with them",
  nationality: "which passport they hold today",
};

/* -------------------------------------------------------------------------- */
/*  Destinations the concierge may send a visitor to                           */
/* -------------------------------------------------------------------------- */

export type RouteTarget = {
  id: string;
  label: string;
  href: string;
  /** When this destination makes sense, in the model's own terms. */
  suitedTo: string;
  /** Fields that must be known before routing here. */
  requires: ConciergeField[];
};

export const ROUTE_TARGETS: RouteTarget[] = [
  {
    id: "route-intelligence",
    label: "Route Intelligence",
    href: "/route-intelligence",
    suitedTo: "They know roughly where and why, and want a shortlist of programmes that fit their constraints.",
    requires: ["destination", "goal"],
  },
  {
    id: "deep-analysis",
    label: "Deep Analysis",
    href: "/deep-analysis",
    suitedTo: "A skilled professional, researcher or founder whose case rests on their CV and evidence.",
    requires: ["profile"],
  },
  {
    id: "us-visa-intelligence",
    label: "US Visa Intelligence",
    href: "/us-visa-intelligence",
    suitedTo: "The destination is the United States.",
    requires: ["destination"],
  },
  {
    id: "eligibility",
    label: "Eligibility check",
    href: "/eligibility",
    suitedTo: "They want a straight yes/no/what's-missing on a specific track.",
    requires: [],
  },
  {
    id: "cost-estimator",
    label: "Family cost estimator",
    href: "/cost-estimator",
    suitedTo: "Cost is the question — especially with dependants.",
    requires: [],
  },
  {
    id: "compare-programs",
    label: "Compare programmes",
    href: "/compare-programs",
    suitedTo: "They are torn between two or more countries or programmes.",
    requires: [],
  },
  {
    id: "passport-index",
    label: "Passport Power",
    href: "/passport-index",
    suitedTo: "Travel freedom or a second passport is the driver.",
    requires: [],
  },
  {
    id: "programme-explorer",
    label: "Programme Explorer",
    href: "/programme-explorer",
    suitedTo: "They want to browse everything rather than be narrowed down. Good for 'I just want to explore'.",
    requires: [],
  },
  {
    id: "document-readiness",
    label: "Document readiness",
    href: "/document-readiness",
    suitedTo: "They have already chosen a route and are asking what paperwork is needed.",
    requires: [],
  },
  {
    id: "citizenship",
    label: "Citizenship programmes",
    href: "/citizenship",
    suitedTo: "Citizenship by investment specifically.",
    requires: [],
  },
  {
    id: "residency",
    label: "Residency programmes",
    href: "/residency",
    suitedTo: "Residence by investment or lifestyle relocation.",
    requires: [],
  },
  {
    id: "skilled",
    label: "Skilled migration",
    href: "/skilled",
    suitedTo: "Points-based skilled migration.",
    requires: [],
  },
  {
    id: "corporate",
    label: "Corporate mobility",
    href: "/corporate",
    suitedTo: "A company moving staff, or business expansion.",
    requires: [],
  },
  {
    id: "personal-booking",
    label: "Speak to a senior advisor",
    href: "/personal-booking#schedule",
    suitedTo: "The case is complex, urgent, or they have had a refusal. Always acceptable as a next step.",
    requires: [],
  },
];

export const ROUTE_BY_HREF = new Map(ROUTE_TARGETS.map((target) => [target.href, target]));

/**
 * Build the destination URL, carrying everything known into the prefill params
 * so the visitor never re-types an answer they have already given.
 */
export function buildRouteHref(href: string, state: ConciergeState) {
  const target = ROUTE_BY_HREF.get(href);
  if (!target) return null;

  const [path, hash] = href.split("#");
  const params = new URLSearchParams();
  if (state.destination && state.destination !== "not-sure") params.set("destination", state.destination);
  if (state.goal && state.goal !== "not-sure") params.set("goal", state.goal);
  if (state.profile) params.set("profile", state.profile);
  if (state.nationality) params.set("nationality", state.nationality);
  params.set("source", "concierge");

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

/** Fields still unknown, in the order they matter most. */
export function missingFields(state: ConciergeState): ConciergeField[] {
  const order: ConciergeField[] = ["goal", "destination", "profile", "timeline", "family"];
  return order.filter((field) => !state[field]);
}
