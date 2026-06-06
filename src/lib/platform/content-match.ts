import "server-only";

import { getAllContentCached } from "@/lib/content";
import type { AnyDoc, ProgramDoc } from "@/lib/content/types";
import type { Track } from "@/lib/eligibility/types";

export type ContentMatch = {
  doc: AnyDoc;
  score: number;
  matchKind: "country" | "program" | "mention";
  reasons: string[];
};

function norm(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: unknown) {
  return norm(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function docCountry(doc: AnyDoc) {
  if (doc.kind === "program") return doc.country;
  return doc.countries?.[0] ?? "";
}

function docVerticals(doc: AnyDoc) {
  if (doc.kind === "program") return [doc.vertical];
  return doc.verticals ?? [];
}

function docHaystack(doc: AnyDoc) {
  return norm([
    doc.title,
    doc.summary,
    doc.tags?.join(" "),
    doc.kind === "program" ? doc.program : doc.programs?.join(" "),
    docCountry(doc),
    docVerticals(doc).join(" "),
    doc.body.slice(0, 4000),
  ].join(" "));
}

function isExactCountryDoc(doc: AnyDoc, country: string) {
  if (!country) return false;
  const needle = norm(country);
  const slugNeedle = needle.replace(/\s+/g, "-");
  const countrySlug = norm(docCountry(doc)).replace(/\s+/g, "-");
  const title = norm(doc.title);
  const tags = norm(doc.tags?.join(" "));
  return countrySlug === slugNeedle || title.includes(needle) || tags.includes(needle);
}

export function findContentMatches(args: {
  query?: string;
  country?: string;
  track?: Track;
  targetRegions?: string[];
  limit?: number;
  includeMentions?: boolean;
}) {
  const all = getAllContentCached();
  const queryTokens = tokens([
    args.query,
    args.country,
    args.track,
    ...(args.targetRegions ?? []),
  ].join(" "));
  const countryNeedles = [args.country, ...(args.targetRegions ?? [])]
    .map((item) => norm(item))
    .filter(Boolean);
  const hasCountryIntent = countryNeedles.length > 0;

  const scored: ContentMatch[] = all
    .map((doc) => {
      const haystack = docHaystack(doc);
      let score = 0;
      const reasons: string[] = [];

      const exactCountry = countryNeedles.some((country) => isExactCountryDoc(doc, country));
      const mentionedCountry = countryNeedles.some((country) => haystack.includes(country));

      if (exactCountry) {
        score += 120;
        reasons.push("Exact country match in site content.");
      } else if (mentionedCountry) {
        score += args.includeMentions ? 25 : 0;
        if (args.includeMentions) reasons.push("Country mentioned in supporting content.");
      }

      if (args.track && docVerticals(doc).includes(args.track)) {
        score += 35;
        reasons.push(`Matches selected ${args.track} track.`);
      }

      if (doc.kind === "program") {
        score += 18;
        reasons.push("Program-level page.");
      } else if (doc.url.includes("/citizenship/") || doc.url.includes("/residency/")) {
        score += 10;
        reasons.push("Country overview page.");
      }

      const tokenHits = queryTokens.filter((token) => haystack.includes(token));
      if (tokenHits.length) {
        score += Math.min(40, tokenHits.length * 4);
        reasons.push(`Keyword match: ${tokenHits.slice(0, 4).join(", ")}.`);
      }

      return {
        doc,
        score,
        matchKind: exactCountry ? "country" : doc.kind === "program" ? "program" : "mention",
        reasons,
      } satisfies ContentMatch;
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const exactCountryMatches = hasCountryIntent
    ? scored.filter((item) => countryNeedles.some((country) => isExactCountryDoc(item.doc, country)))
    : [];

  const matches = exactCountryMatches.length
    ? exactCountryMatches
    : scored.filter((item) => args.includeMentions || item.matchKind !== "mention");

  return {
    matches: matches.slice(0, args.limit ?? 8),
    exactCountryMatchCount: exactCountryMatches.length,
    hasCountryIntent,
  };
}

export function contentDocToProgram(match: ContentMatch) {
  const doc = match.doc;
  const programDoc = doc.kind === "program" ? (doc as ProgramDoc) : null;
  return {
    name: doc.title,
    country: programDoc?.country ?? (doc.kind === "hub" ? doc.countries?.[0] : undefined),
    pathway: programDoc?.vertical ?? (doc.kind === "hub" ? doc.type : "site content"),
    url: doc.url,
    summary: doc.summary || doc.body.replace(/\s+/g, " ").trim().slice(0, 220),
    reasons: match.reasons,
    score: Math.min(100, Math.max(45, Math.round(match.score / 1.6))),
  };
}
