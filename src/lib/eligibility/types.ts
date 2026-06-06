export type Track = "residency" | "citizenship" | "corporate" | "skilled";

/** Small helpers (optional to use) */
export const TRACKS: readonly Track[] = ["residency", "citizenship", "corporate", "skilled"] as const;
export const isTrack = (v: unknown): v is Track =>
  typeof v === "string" && (TRACKS as readonly string[]).includes(v as string);

export type QuestionType = "select" | "radio" | "number" | "text" | "yesno";

export type Option = {
  label: string;
  /** allow numbers/booleans for richer radios/selects (strings still work) */
  value: string | number | boolean;
  /** optional supporting copy under the label (used in enhanced UI) */
  hint?: string;
};

export type Question = {
  key: string;
  prompt: string;
  type: QuestionType;
  options?: Option[];
  helper?: string;
  optional?: boolean;

  /** UI niceties used by QuestionCard (optional) */
  placeholder?: string;

  /** for number inputs (optional) */
  min?: number;
  max?: number;
  step?: number;
};

export type AnswerMap = Record<string, unknown>;

export type Program = {
  name: string;
  why: string;
  country?: string;
  href?: string;
  score?: number;
};

export type Result = {
  /** keep your existing tiers to match scoring logic */
  tier: "Eligible" | "Borderline" | "Not Yet Eligible";
  summary: string;
  programs: Program[];
  confidence?: number;
  criteria?: string[];
  sources?: { label: string; href: string }[];
  handoffRequired?: boolean;
  countryFocus?: string;
};
