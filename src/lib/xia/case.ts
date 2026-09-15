// src/lib/xia/case.ts
// -----------------------------------------------------------------------------
// The XIA Case — one object that follows a visitor from the first sentence they
// type to the PDF they download.
//
// WHY THIS EXISTS
// Every tool used to own its own input shape (RouteIntelligenceInput,
// HighSkillInput, DocumentReadinessInput, CostProgram) and the report builder
// owned yet another, assembled from the payment order. Nothing was shared, so a
// visitor who told Route Intelligence their destination, goal and shortlist was
// asked for all of it again at checkout. That was ten steps to a paid report and
// two identical forms.
//
// From here, there is exactly one place an answer can live. Every surface — the
// concierge, the tool pages, checkout, the report builder, the scheduler, X-Hub
// — reads and writes this object. Nobody is asked twice.
//
// Pure module, no server imports: the client hook and the server store both use it.
// -----------------------------------------------------------------------------

export const CASE_COOKIE = "xia_case";
export const CASE_VERSION = 1;
export const CASE_TTL_DAYS = 90;

/* -------------------------------------------------------------------------- */
/*  Shape                                                                      */
/* -------------------------------------------------------------------------- */

/** Where a case was opened. Useful for attribution and for tuning the funnel. */
export type CaseSource =
  | "hero"
  | "dock"
  | "tool"
  | "programme-page"
  | "checkout"
  | "advisor"
  | "unknown";

export type CaseEvent = {
  at: string;
  kind:
    | "opened"
    | "answered"
    | "shortlisted"
    | "viewed-programme"
    | "started-checkout"
    | "paid"
    | "booked-consultation"
    | "uploaded-cv";
  detail?: string;
};

/** A matched programme as the engine returned it. Never typed by a human. */
export type CaseMatch = {
  programmeId: string;
  title: string;
  country: string;
  track: string;
  href: string;
  /** The only three honest outcomes — see lib/xia/requirements. */
  state: "open" | "gaps" | "closed";
  /** 0-100 where the rules can produce one; null when they cannot. */
  score: number | null;
  /** Named, specific, human-readable. "IELTS 8 in every band", not "language". */
  gaps: string[];
  reason: string;
};

export type XiaCase = {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  source: CaseSource;

  /* -- Identity. Only written once the visitor has actually submitted it. --- */
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  residence?: string;
  age?: number;

  /* -- Intent: what the concierge establishes in the first exchange. -------- */
  destination?: string;
  goal?: string;
  profile?: string;
  timelineMonths?: number;
  /** alone | partner | children | parents */
  family?: string;
  dependants?: number;
  budgetUsd?: number;

  /* -- Profile detail: feeds CRS, the Australian points test, high-skill. --- */
  education?: string;
  fieldOfStudy?: string;
  occupation?: string;
  yearsExperience?: number;
  canadianWorkYears?: number;
  languageTest?: string;
  languageScores?: {
    speaking?: number;
    listening?: number;
    reading?: number;
    writing?: number;
  };
  publicationCount?: number;
  citationCount?: number;
  patentCount?: number;

  /* -- Non-skilled detail. What actually decides an investment, business or -- */
  /*    family route, where a language score decides nothing.                 -- */
  /** How much time they can physically spend in the country each year. */
  stayTolerance?: string;
  /** idea | under-2-years | 2-5-years | over-5-years */
  businessStage?: string;
  /** What they are setting up: new | expansion | staff | acquisition */
  businessIntent?: string;
  /** Relationship of the person already in the destination country. */
  relativeInDestination?: string;
  /** That person's status there: citizen | pr | work | student | not-sure */
  relativeStatus?: string;

  /* -- Knock-out flags. Asked plainly, never inferred. ---------------------- */
  previousRefusal?: boolean;
  criminalRecord?: boolean;

  /* -- Free text and uploads ------------------------------------------------ */
  notes?: string;
  resumeFileName?: string;
  resumeText?: string;

  /* -- Derived. Written by the engine, never by a form. --------------------- */
  matches?: CaseMatch[];
  matchedAt?: string;

  /* -- Journey -------------------------------------------------------------- */
  events: CaseEvent[];
  consent?: { marketing: boolean; at: string };
};

/* -------------------------------------------------------------------------- */
/*  Creation and merging                                                       */
/* -------------------------------------------------------------------------- */

function randomId() {
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? Array.from(crypto.getRandomValues(new Uint8Array(9)))
      : Array.from({ length: 9 }, () => Math.floor(Math.random() * 256));
  return `xc_${bytes.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function createCase(source: CaseSource = "unknown"): XiaCase {
  const now = new Date().toISOString();
  return {
    id: randomId(),
    version: CASE_VERSION,
    createdAt: now,
    updatedAt: now,
    source,
    events: [{ at: now, kind: "opened", detail: source }],
  };
}

/** Fields a client is allowed to set. Everything else is server-derived. */
const WRITABLE_FIELDS = [
  "name", "email", "phone", "nationality", "residence", "age",
  "destination", "goal", "profile", "timelineMonths", "family", "dependants", "budgetUsd",
  "education", "fieldOfStudy", "occupation", "yearsExperience", "canadianWorkYears",
  "languageTest", "languageScores", "publicationCount", "citationCount", "patentCount",
  "stayTolerance", "businessStage", "businessIntent", "relativeInDestination", "relativeStatus",
  "previousRefusal", "criminalRecord", "notes", "resumeFileName", "resumeText", "consent",
] as const;

export type WritableCaseField = (typeof WRITABLE_FIELDS)[number];

/**
 * Merge a patch into a case.
 *
 * Deliberately additive: a patch never deletes an answer. Undefined and empty
 * string are ignored, so a half-filled form on one page cannot wipe what the
 * visitor told us on another. To clear a field, write a new value.
 */
export function mergeCase(base: XiaCase, patch: Partial<XiaCase>): XiaCase {
  const next: XiaCase = { ...base };

  for (const field of WRITABLE_FIELDS) {
    const value = patch[field as keyof XiaCase];
    if (value === undefined || value === null || value === "") continue;
    if (field === "languageScores" && typeof value === "object") {
      next.languageScores = { ...(base.languageScores ?? {}), ...(value as object) };
      continue;
    }
    (next as Record<string, unknown>)[field] = value;
  }

  // Derived fields: engine-written, so they replace rather than merge.
  if (patch.matches) {
    next.matches = patch.matches;
    next.matchedAt = new Date().toISOString();
  }

  if (patch.events?.length) {
    next.events = [...base.events, ...patch.events].slice(-60);
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

export function addEvent(base: XiaCase, kind: CaseEvent["kind"], detail?: string): XiaCase {
  return mergeCase(base, { events: [{ at: new Date().toISOString(), kind, detail }] });
}

/* -------------------------------------------------------------------------- */
/*  Completeness                                                               */
/* -------------------------------------------------------------------------- */

/** The fields the matching engine genuinely needs, in the order they matter. */
export const CORE_FIELDS: Array<keyof XiaCase> = [
  "goal",
  "destination",
  "profile",
  "nationality",
  "timelineMonths",
];

export function caseCompleteness(item: XiaCase) {
  const filled = CORE_FIELDS.filter((field) => item[field] !== undefined && item[field] !== "");
  return {
    filled: filled.length,
    total: CORE_FIELDS.length,
    percent: Math.round((filled.length / CORE_FIELDS.length) * 100),
    missing: CORE_FIELDS.filter((field) => !filled.includes(field)),
  };
}

/** Enough to show a meaningful shortlist. Deliberately low — cards beat questions. */
export function canMatch(item: XiaCase) {
  return Boolean(item.goal || item.destination || item.profile);
}

/** Enough to take money without asking anything further. */
export function canCheckout(item: XiaCase) {
  return Boolean(item.name && item.email && item.phone);
}

/* -------------------------------------------------------------------------- */
/*  Adapters — let the existing tools read the case without being rewritten    */
/* -------------------------------------------------------------------------- */

/** Query string carrying the case forward through a plain link. */
export function caseToParams(item: XiaCase, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  if (item.destination && item.destination !== "not-sure") params.set("destination", item.destination);
  if (item.goal && item.goal !== "not-sure") params.set("goal", item.goal);
  if (item.profile) params.set("profile", item.profile);
  if (item.nationality) params.set("nationality", item.nationality);
  params.set("case", item.id);
  params.set("source", "xia");
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params;
}

/** Shape the current Route Intelligence tool expects. */
export function caseToRouteInput(item: XiaCase) {
  return {
    destination: item.destination ?? "",
    nationality: item.nationality ?? "",
    goal: (item.goal ?? "not-sure") as string,
    profile: (item.profile ?? "not-provided") as string,
    timeline: item.timelineMonths ?? 0,
    budget: item.budgetUsd ?? 0,
    family: item.family ? item.family !== "alone" : false,
    notes: item.notes ?? "",
  };
}

/** Shape the Deep Analysis / high-skill tool expects. */
export function caseToHighSkillInput(item: XiaCase) {
  return {
    role: item.occupation ?? "",
    nationality: item.nationality ?? "",
    yearsExperience: item.yearsExperience ?? 0,
    education: item.education ?? "unknown",
    profileSummary: item.notes ?? "",
    resumeFileName: item.resumeFileName ?? "",
    citationCount: item.citationCount ?? 0,
    publicationCount: item.publicationCount ?? 0,
    patentCount: item.patentCount ?? 0,
  };
}

/** Everything checkout needs, so the payment step asks for nothing. */
export function caseToCheckout(item: XiaCase, productType: string) {
  return {
    productType,
    caseId: item.id,
    name: item.name ?? "",
    email: item.email ?? "",
    phone: item.phone ?? "",
    destination: item.destination ?? "",
    goal: item.goal ?? "",
    programmes: (item.matches ?? []).slice(0, 4).map((match) => match.title).join(", "),
  };
}
