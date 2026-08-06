import type { HighSkillInput, RouteIntelligenceInput } from "@/lib/xia-intelligence-model";

export type PageSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function allowedValue<T extends string>(value: string | undefined, allowed: readonly T[]) {
  return value && allowed.includes(value as T) ? (value as T) : undefined;
}

export function getJourneySource(params: PageSearchParams) {
  return firstValue(params.source)?.slice(0, 80) || undefined;
}

export function getRoutePrefill(params: PageSearchParams): Partial<RouteIntelligenceInput> {
  const goal = allowedValue(firstValue(params.goal), [
    "not-sure",
    "pr",
    "work-visa",
    "citizenship",
    "investment",
    "business-setup",
    "family-migration",
  ] as const);
  const profile = allowedValue(firstValue(params.profile), [
    "investor",
    "entrepreneur",
    "professional",
    "family",
    "company",
    "remote",
    "researcher",
    "student",
  ] as const);
  const destination = firstValue(params.destination)?.trim().slice(0, 80);

  return {
    ...(goal ? { goal } : {}),
    ...(profile ? { profile } : {}),
    ...(destination ? { destination } : {}),
    ...(goal === "investment" ? { track: "residency" as const } : {}),
    ...(goal === "citizenship" ? { track: "citizenship" as const } : {}),
    ...(goal === "business-setup" ? { track: "corporate" as const, priority: "business" as const } : {}),
  };
}

export function getHighSkillPrefill(params: PageSearchParams): Partial<HighSkillInput> {
  const destination = firstValue(params.destination)?.toLowerCase() || "";
  const profile = firstValue(params.profile);
  const targetCountry: HighSkillInput["targetCountry"] = destination.includes("canada")
    ? "canada"
    : destination.includes("united states") || destination === "usa"
      ? "usa"
      : destination.includes("united kingdom") || destination === "uk"
        ? "uk"
        : destination.includes("australia")
          ? "australia"
          : "global";

  const field: HighSkillInput["field"] = profile === "researcher"
    ? "science"
    : profile === "student"
      ? "academia"
      : profile === "entrepreneur" || profile === "investor"
        ? "business"
        : "technology";

  return {
    targetCountry,
    field,
    goal: profile === "entrepreneur" ? "founder" : "not-sure",
  };
}
