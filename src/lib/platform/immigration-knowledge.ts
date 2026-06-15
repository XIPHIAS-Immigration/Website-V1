import "server-only";

import { getAllContentCached } from "@/lib/content";
import type { AnyDoc, ProgramDoc, Vertical } from "@/lib/content/types";
import type { Track } from "@/lib/eligibility/types";

type KnowledgeKind = "program" | "country" | "insight";

type KnowledgeDoc = {
  title: string;
  href: string;
  kind: KnowledgeKind;
  country?: string;
  countrySlug?: string;
  verticals: Vertical[];
  program?: string;
  summary?: string;
  tags: string[];
  updatedAt?: string;
};

type VerticalCoverage = {
  vertical: Vertical;
  label: string;
  countries: number;
  countryPages: number;
  programPages: number;
  insightPages: number;
};

export type ImmigrationKnowledgeSnapshot = {
  totalDocs: number;
  programPages: number;
  countryPages: number;
  insightPages: number;
  countries: number;
  verticals: VerticalCoverage[];
  generatedFrom: string;
};

export type ImmigrationKnowledgeContext = {
  snapshot: ImmigrationKnowledgeSnapshot;
  requestedCountry?: {
    slug: string;
    label: string;
  };
  exactCountryDocs: number;
  exactProgramPages: number;
  availableVerticals: Vertical[];
  topDocs: KnowledgeDoc[];
  gaps: string[];
  coverageSummary: string;
};

const VERTICAL_LABELS: Record<Vertical, string> = {
  residency: "Residency",
  citizenship: "Citizenship",
  skilled: "Skilled migration",
  corporate: "Corporate immigration",
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  "antigua-barbuda": ["antigua barbuda", "antigua and barbuda", "antigua", "barbuda"],
  australia: ["australia", "au"],
  bahrain: ["bahrain", "bh"],
  bulgaria: ["bulgaria"],
  canada: ["canada", "ca"],
  curacao: ["curacao", "curaçao"],
  cyprus: ["cyprus"],
  dominica: ["dominica"],
  egypt: ["egypt", "eg"],
  germany: ["germany", "deutschland"],
  greece: ["greece"],
  grenada: ["grenada"],
  "hong-kong": ["hong kong", "hk"],
  hungary: ["hungary"],
  italy: ["italy", "italia"],
  latvia: ["latvia"],
  malaysia: ["malaysia"],
  malta: ["malta"],
  mauritius: ["mauritius"],
  monaco: ["monaco"],
  nauru: ["nauru"],
  "new-zealand": ["new zealand", "nz"],
  panama: ["panama"],
  portugal: ["portugal"],
  qatar: ["qatar"],
  "saint-lucia": ["saint lucia", "st lucia"],
  saintkitts: ["saint kitts", "st kitts", "saint kitts and nevis", "st kitts and nevis"],
  saotome: ["sao tome", "sao tome and principe", "são tomé", "são tomé and príncipe"],
  singapore: ["singapore"],
  spain: ["spain", "españa"],
  switzerland: ["switzerland", "swiss"],
  turkey: ["turkey", "turkiye", "türkiye"],
  uae: ["uae", "united arab emirates", "emirates", "dubai"],
  "united-kingdom": ["united kingdom", "uk", "great britain", "britain", "england"],
  uruguay: ["uruguay"],
  usa: ["usa", "us", "united states", "united states of america", "america"],
  vanuatu: ["vanuatu"],
};

const SHORT_ALIAS_ALLOWLIST = new Set(["au", "ca", "eg", "hk", "nz", "uk", "us", "usa", "uae"]);

let snapshotCache: ImmigrationKnowledgeSnapshot | null = null;

function norm(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: unknown) {
  return norm(value).replace(/\s+/g, "-");
}

function titleCaseSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function countryLabel(slug: string) {
  if (slug === "usa") return "United States";
  if (slug === "uae") return "United Arab Emirates";
  if (slug === "united-kingdom") return "United Kingdom";
  if (slug === "saintkitts") return "Saint Kitts and Nevis";
  if (slug === "saotome") return "Sao Tome and Principe";
  if (slug === "antigua-barbuda") return "Antigua and Barbuda";
  return titleCaseSlug(slug);
}

function docCountry(doc: AnyDoc) {
  if (doc.kind === "program") return doc.country;
  return doc.countries?.[0] ?? "";
}

function docVerticals(doc: AnyDoc): Vertical[] {
  if (doc.kind === "program") return [doc.vertical];
  return doc.verticals ?? [];
}

function docPrograms(doc: AnyDoc) {
  if (doc.kind === "program") return [doc.program];
  return doc.programs ?? [];
}

function docKind(doc: AnyDoc): KnowledgeKind {
  if (doc.kind === "program") return "program";
  if (doc.url.split("/").length === 3 && docVerticals(doc).length && docCountry(doc)) return "country";
  return "insight";
}

function toKnowledgeDoc(doc: AnyDoc): KnowledgeDoc {
  const country = docCountry(doc);
  return {
    title: doc.title,
    href: doc.url,
    kind: docKind(doc),
    country: country ? countryLabel(country) : undefined,
    countrySlug: country || undefined,
    verticals: docVerticals(doc),
    program: doc.kind === "program" ? doc.program : docPrograms(doc)[0],
    summary: doc.summary,
    tags: doc.tags ?? [],
    updatedAt: doc.updatedAt,
  };
}

function resolveCountry(input?: string) {
  const normalized = norm(input);
  if (!normalized) return null;

  for (const [slug, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (slugify(slug) === slugify(normalized)) return { slug, label: countryLabel(slug) };
    if (aliases.some((alias) => norm(alias) === normalized)) return { slug, label: countryLabel(slug) };
  }

  return { slug: slugify(normalized), label: titleCaseSlug(slugify(normalized)) };
}

function detectCountry(query?: string) {
  const haystack = ` ${norm(query)} `;
  if (!haystack.trim()) return null;

  for (const [slug, aliases] of Object.entries(COUNTRY_ALIASES)) {
    const hit = aliases.some((alias) => {
      const token = norm(alias);
      if (token.length <= 2 && !SHORT_ALIAS_ALLOWLIST.has(token)) return false;
      return haystack.includes(` ${token} `);
    });
    if (hit) return { slug, label: countryLabel(slug) };
  }

  return null;
}

function isExactCountry(doc: AnyDoc, countrySlug: string) {
  const country = slugify(docCountry(doc));
  const requested = slugify(countrySlug);
  if (country && country === requested) return true;

  const aliases = COUNTRY_ALIASES[countrySlug] ?? [];
  const search = norm([doc.title, doc.tags?.join(" "), doc.url, doc.summary].join(" "));
  return aliases.some((alias) => {
    const normalized = norm(alias);
    if (normalized.length <= 2 && !SHORT_ALIAS_ALLOWLIST.has(normalized)) return false;
    return search.includes(normalized);
  });
}

function textScore(doc: AnyDoc, query?: string) {
  const tokens = norm(query)
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 18);
  if (!tokens.length) return 0;

  const haystack = norm([
    doc.title,
    doc.summary,
    doc.tags?.join(" "),
    doc.kind === "program" ? (doc as ProgramDoc).quickFacts?.map((fact) => `${fact.label} ${fact.value}`).join(" ") : "",
    doc.body.slice(0, 2400),
  ].join(" "));

  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 4 : 0), 0);
}

export function getImmigrationKnowledgeSnapshot(): ImmigrationKnowledgeSnapshot {
  if (snapshotCache) return snapshotCache;

  const docs = getAllContentCached();
  const countries = new Set<string>();
  const verticalStats = new Map<Vertical, { countries: Set<string>; countryPages: number; programPages: number; insightPages: number }>();

  for (const vertical of Object.keys(VERTICAL_LABELS) as Vertical[]) {
    verticalStats.set(vertical, {
      countries: new Set<string>(),
      countryPages: 0,
      programPages: 0,
      insightPages: 0,
    });
  }

  for (const doc of docs) {
    const country = docCountry(doc);
    const kind = docKind(doc);
    if (country) countries.add(country);

    for (const vertical of docVerticals(doc)) {
      const stat = verticalStats.get(vertical);
      if (!stat) continue;
      if (country) stat.countries.add(country);
      if (kind === "program") stat.programPages += 1;
      else if (kind === "country") stat.countryPages += 1;
      else stat.insightPages += 1;
    }
  }

  const verticals = [...verticalStats.entries()].map(([vertical, stat]) => ({
    vertical,
    label: VERTICAL_LABELS[vertical],
    countries: stat.countries.size,
    countryPages: stat.countryPages,
    programPages: stat.programPages,
    insightPages: stat.insightPages,
  }));

  snapshotCache = {
    totalDocs: docs.length,
    programPages: docs.filter((doc) => doc.kind === "program").length,
    countryPages: docs.filter((doc) => docKind(doc) === "country").length,
    insightPages: docs.filter((doc) => docKind(doc) === "insight").length,
    countries: countries.size,
    verticals,
    generatedFrom: "content/**/*.mdx",
  };

  return snapshotCache;
}

export function getImmigrationKnowledgeContext(args: {
  query?: string;
  country?: string;
  track?: Track;
  limit?: number;
}): ImmigrationKnowledgeContext {
  const docs = getAllContentCached();
  const snapshot = getImmigrationKnowledgeSnapshot();
  const requestedCountry = resolveCountry(args.country) ?? detectCountry(args.query);
  const limit = args.limit ?? 8;

  const matchingDocs = docs
    .map((doc) => {
      let score = textScore(doc, args.query);
      const exactCountry = requestedCountry ? isExactCountry(doc, requestedCountry.slug) : false;
      const verticals = docVerticals(doc);

      if (exactCountry) score += 100;
      if (args.track && verticals.includes(args.track)) score += 35;
      if (doc.kind === "program") score += 18;
      if (docKind(doc) === "country") score += 10;

      return { doc, score, exactCountry };
    })
    .filter((item) => {
      if (requestedCountry && !item.exactCountry) return false;
      if (args.track && !docVerticals(item.doc).includes(args.track)) return false;
      return item.score > 0 || requestedCountry;
    })
    .sort((a, b) => b.score - a.score);

  const exactCountryDocs = requestedCountry ? matchingDocs.filter((item) => item.exactCountry).length : 0;
  const exactProgramPages = matchingDocs.filter((item) => item.doc.kind === "program").length;
  const availableVerticals = [...new Set(matchingDocs.flatMap((item) => docVerticals(item.doc)))] as Vertical[];
  const topDocs = matchingDocs.slice(0, limit).map((item) => toKnowledgeDoc(item.doc));
  const gaps: string[] = [];

  if (requestedCountry && exactCountryDocs === 0) {
    gaps.push(`No dedicated ${requestedCountry.label} country or programme page exists in the current content library.`);
  }
  if (requestedCountry && args.track && !availableVerticals.includes(args.track)) {
    gaps.push(`No ${VERTICAL_LABELS[args.track].toLowerCase()} page was found for ${requestedCountry.label}.`);
  }
  if (!topDocs.length && !requestedCountry) {
    gaps.push("The query is too broad for a confident content-backed recommendation.");
  }

  const coverageSummary = requestedCountry
    ? gaps.length
      ? `${requestedCountry.label}: content gap detected.`
      : `${requestedCountry.label}: ${exactProgramPages} programme page${exactProgramPages === 1 ? "" : "s"} across ${availableVerticals.map((vertical) => VERTICAL_LABELS[vertical]).join(", ")}.`
    : `${snapshot.programPages} programme pages, ${snapshot.countryPages} country pages, ${snapshot.insightPages} supporting articles/news/blogs.`;

  return {
    snapshot,
    requestedCountry: requestedCountry ?? undefined,
    exactCountryDocs,
    exactProgramPages,
    availableVerticals,
    topDocs,
    gaps,
    coverageSummary,
  };
}

export function resetImmigrationKnowledgeSnapshot() {
  snapshotCache = null;
}
