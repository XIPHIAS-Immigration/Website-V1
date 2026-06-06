import "server-only";

import { Programs } from "@/lib/eligibility/programCatalog";
import type { PassportEngineRequest, PassportEngineResult } from "./types";
import { contentDocToProgram, findContentMatches } from "./content-match";

type CatalogProgram = {
  name: string;
  country?: string;
  pathway?: string;
  minInvestmentUSD?: string;
  processingTime?: string;
  familyIncluded?: boolean | string;
  requiresPhysicalPresence?: string;
  notes?: string;
};

function flattenPrograms(): CatalogProgram[] {
  return Object.values(Programs).flat() as CatalogProgram[];
}

function numericInvestment(value?: string) {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const number = Number(match[1]);
  if (value.toLowerCase().includes("k")) return number * 1000;
  if (value.toLowerCase().includes("m")) return number * 1000000;
  return number;
}

function numericMonths(value?: string) {
  if (!value) return undefined;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

export function rankMobilityPrograms(request: PassportEngineRequest): PassportEngineResult {
  const priorities = (request.priorities ?? []).join(" ").toLowerCase();
  const targetRegions = (request.targetRegions ?? []).map((item) => item.toLowerCase());
  const content = findContentMatches({
    query: priorities,
    targetRegions,
    limit: 12,
    includeMentions: false,
  });

  const contentMatches = content.matches.map(contentDocToProgram).map((program) => {
    let score = program.score + 12;
    const rationale = [...program.reasons];

    if (request.includeFamily && /family|spouse|children|dependent/i.test(program.summary)) {
      score += 8;
      rationale.push("Family inclusion language appears in the site content.");
    }
    if (request.timelineMonths && new RegExp(`\\b([1-9]|1[0-${Math.min(request.timelineMonths, 9)}])\\s*(month|months)`, "i").test(program.summary)) {
      score += 5;
      rationale.push("Timeline language appears compatible with the requested planning window.");
    }

    return {
      name: program.name,
      country: program.country ?? "Site content",
      pathway: program.pathway,
      score: Math.min(100, score),
      rationale,
      caution: "Matched from current website content. Staff must verify rules, fees, and timelines before advice is issued.",
    };
  });

  if (contentMatches.length) {
    return {
      generatedAt: new Date().toISOString(),
      criteria: [
        "Uses current MDX website content first.",
        "Exact country/program pages outrank generic catalog items.",
        "Program pages outrank blog/news mentions.",
        "Budget, timeline, family and low-presence preferences adjust score only after content match.",
      ],
      matches: contentMatches,
    };
  }

  const matches = flattenPrograms()
    .map((program) => {
      let score = 45;
      const rationale: string[] = [];
      const haystack = [
        program.country,
        program.name,
        program.pathway,
        program.notes,
        program.requiresPhysicalPresence,
      ]
        .join(" ")
        .toLowerCase();

      if (targetRegions.some((region) => haystack.includes(region))) {
        score += 18;
        rationale.push("Matches preferred region or country.");
      }

      const investment = numericInvestment(program.minInvestmentUSD);
      if (request.budgetUsd && investment && investment <= request.budgetUsd) {
        score += 16;
        rationale.push("Indicative investment level fits the stated budget.");
      }

      const months = numericMonths(program.processingTime);
      if (request.timelineMonths && months && months <= request.timelineMonths) {
        score += 12;
        rationale.push("Indicative timeline fits the requested planning window.");
      }

      if (request.includeFamily && program.familyIncluded) {
        score += 10;
        rationale.push("Family inclusion is supported or commonly available.");
      }

      if (priorities.includes("low presence") && String(program.requiresPhysicalPresence).toLowerCase().includes("low")) {
        score += 8;
        rationale.push("Low physical-presence requirement aligns with stated priority.");
      }

      if (!rationale.length) rationale.push("Included as a baseline program for advisor comparison.");

      return {
        name: program.name,
        country: program.country ?? "Multiple",
        pathway: program.pathway ?? "Migration pathway",
        score: Math.min(100, score),
        rationale,
        caution: "Indicative only. Program rules, fees, and processing times require staff verification.",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    criteria: [
      "No exact current-content country match found, so catalog fallback was used.",
      "Region/country text match comes first.",
      "Budget, timeline, family and low-presence preferences adjust score.",
    ],
    matches,
  };
}
