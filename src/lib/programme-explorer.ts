import "server-only";

import { getAllContentCached } from "@/lib/content";
import type { ProgramDoc, Vertical } from "@/lib/content/types";
import { Programs } from "@/lib/eligibility/programCatalog";

export type ProgrammeExplorerItem = {
  id: string;
  title: string;
  country: string;
  countrySlug: string;
  track: Vertical;
  href: string;
  summary: string;
  heroImage?: string;
  tags: string[];
  investmentUsd: number;
  investmentLabel: string;
  timelineMonths: number;
  timelineLabel: string;
  presence: "low" | "moderate" | "high" | "variable";
  family: boolean;
  risk: "standard" | "enhanced" | "high";
  source: "site-content" | "catalog";
  evidence: string[];
  keywords: string;
};

export type ProgrammeExplorerData = {
  generatedAt: string;
  items: ProgrammeExplorerItem[];
  countries: string[];
  totals: {
    programmes: number;
    countries: number;
    siteContent: number;
    catalogFallback: number;
  };
};

type CatalogTrack = keyof typeof Programs;
type CatalogProgram = (typeof Programs)[CatalogTrack][number];

const DEFAULT_INVESTMENT: Record<Vertical, number> = {
  residency: 250000,
  citizenship: 200000,
  corporate: 50000,
  skilled: 0,
};

const DEFAULT_TIMELINE: Record<Vertical, number> = {
  residency: 9,
  citizenship: 8,
  corporate: 3,
  skilled: 12,
};

const TRACK_LABELS: Record<Vertical, string> = {
  residency: "Residency",
  citizenship: "Citizenship",
  corporate: "Corporate mobility",
  skilled: "Skilled migration",
};

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: unknown) {
  return normalize(value).replace(/\s+/g, "-");
}

function countryLookupKey(value: unknown) {
  const base = normalize(value);
  const aliases: Record<string, string> = {
    "united states": "usa",
    "united states of america": "usa",
    "u s a": "usa",
    "united arab emirates": "uae",
    "saint kitts and nevis": "saintkitts",
    "st kitts and nevis": "saintkitts",
    "sao tome and principe": "saotome",
  };

  return (aliases[base] ?? base)
    .replace(/\b(and|the|of)\b/g, " ")
    .replace(/\s+/g, "");
}

function titleCaseSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripMdx(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/import\s+.*?from\s+["'][^"']+["'];?/g, " ")
    .replace(/export\s+const\s+\w+\s*=\s*[\s\S]*?;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`{}[\]|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordText(value: string) {
  const tokens = normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2);
  return Array.from(new Set(tokens)).slice(0, 260).join(" ");
}

function excerpt(value: string, fallback: string, max = 210) {
  const clean = stripMdx(value || fallback);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}...`;
}

function parseMoney(text: string, track: Vertical) {
  const source = text.toLowerCase();
  if (track === "skilled" || /\bn\/a\b|not applicable|no investment|points based/.test(source)) {
    return 0;
  }

  const values: number[] = [];

  for (const match of source.matchAll(/(?:usd|\$|us\$)\s*([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)?/g)) {
    const base = Number(match[1]);
    const unit = match[2] ?? "";
    values.push(unit.startsWith("m") ? base * 1_000_000 : unit === "k" ? base * 1_000 : base);
  }

  for (const match of source.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)\s*(?:usd|dollars|\+)?/g)) {
    const base = Number(match[1]);
    const unit = match[2] ?? "";
    if (base >= 10 || unit !== "k") {
      values.push(unit.startsWith("m") ? base * 1_000_000 : base * 1_000);
    }
  }

  for (const match of source.matchAll(/aed\s*([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)?/g)) {
    const base = Number(match[1]);
    const unit = match[2] ?? "";
    const aed = unit.startsWith("m") ? base * 1_000_000 : unit === "k" ? base * 1_000 : base;
    values.push(Math.round(aed * 0.272));
  }

  for (const match of source.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+)/g)) {
    const number = Number(match[1].replace(/,/g, ""));
    if (number >= 10_000) values.push(number);
  }

  const realistic = values.filter((value) => value >= 10_000 && value <= 10_000_000);
  return realistic.length ? Math.min(...realistic) : DEFAULT_INVESTMENT[track];
}

function parseTimeline(text: string, track: Vertical) {
  const source = text.toLowerCase();
  const monthValues: number[] = [];

  for (const match of source.matchAll(/([0-9]+)\s*(?:-|to|–|—)\s*([0-9]+)\s*months?/g)) {
    monthValues.push(Number(match[2]));
  }

  for (const match of source.matchAll(/([0-9]+)\s*months?/g)) {
    const value = Number(match[1]);
    if (value > 0 && value <= 60) monthValues.push(value);
  }

  for (const match of source.matchAll(/([0-9]+)\s*(?:-|to|–|—)\s*([0-9]+)\s*years?/g)) {
    monthValues.push(Number(match[2]) * 12);
  }

  for (const match of source.matchAll(/([0-9]+)\s*years?/g)) {
    const value = Number(match[1]);
    if (value > 0 && value <= 10) monthValues.push(value * 12);
  }

  return monthValues.length ? Math.min(...monthValues) : DEFAULT_TIMELINE[track];
}

function detectPresence(text: string, track: Vertical): ProgrammeExplorerItem["presence"] {
  const source = text.toLowerCase();
  if (/usually none|no ongoing residence|minimal|low|remote|digital nomad|entry\/medical/.test(source)) return "low";
  if (/moderate|maintain ties|renewal|residence period/.test(source)) return "moderate";
  if (/work location|settlement|physical presence|state commitments|resident in|live in/.test(source)) return "high";
  return track === "skilled" || track === "corporate" ? "high" : "variable";
}

function detectFamily(text: string, track: Vertical) {
  const source = text.toLowerCase();
  if (/familyincluded:\s*false|family not|single applicant/.test(source)) return false;
  if (/family|spouse|dependent|children|lineal descendants/.test(source)) return true;
  return track !== "corporate";
}

function detectRisk(text: string, track: Vertical): ProgrammeExplorerItem["risk"] {
  const source = text.toLowerCase();
  if (/sanction|criminal|pep|source of funds|enhanced due diligence|rigorous due diligence|eb-5|usa|malta/.test(source)) {
    return "high";
  }
  if (/due diligence|investment|business|entrepreneur|startup|tax|property|government/.test(source)) {
    return "enhanced";
  }
  return track === "skilled" ? "standard" : "enhanced";
}

function investmentLabel(value: number) {
  if (value <= 0) return "No investment route";
  if (value >= 1_000_000) return `USD ${(value / 1_000_000).toFixed(value % 1_000_000 ? 1 : 0)}M+`;
  return `USD ${Math.round(value / 1000)}k+`;
}

function timelineLabel(months: number) {
  if (months < 1) return "Case dependent";
  if (months < 12) return `${months} months`;
  const years = months / 12;
  return `${Number.isInteger(years) ? years : years.toFixed(1)} years`;
}

function catalogPrograms() {
  return Object.entries(Programs).flatMap(([track, items]) =>
    items.map((item) => ({ ...item, track: track as Vertical })),
  );
}

function catalogKey(item: Pick<CatalogProgram, "slug" | "name" | "country"> & { track: Vertical }) {
  return `${item.track}:${slugify(item.country)}:${slugify(item.slug || item.name)}`;
}

function findCatalogMatch(doc: ProgramDoc) {
  const countrySlug = slugify(doc.country);
  const title = normalize(`${doc.title} ${doc.program}`);
  return catalogPrograms().find((item) => {
    if (item.track !== doc.vertical) return false;
    if (slugify(item.country) !== countrySlug && !normalize(item.country).includes(countrySlug)) return false;
    return title.includes(slugify(item.slug).replace(/-/g, " ")) || title.includes(normalize(item.name));
  });
}

function fromDoc(doc: ProgramDoc): ProgrammeExplorerItem {
  const catalog = findCatalogMatch(doc);
  const country = titleCaseSlug(doc.country);
  const raw = [
    doc.title,
    doc.summary,
    doc.tags?.join(" "),
    doc.quickFacts?.map((fact) => `${fact.label}: ${fact.value}`).join(" "),
    catalog ? Object.values(catalog).join(" ") : "",
    doc.body,
  ]
    .filter(Boolean)
    .join(" ");

  const investment = catalog ? parseMoney(`${catalog.minInvestmentUSD} ${raw}`, doc.vertical) : parseMoney(raw, doc.vertical);
  const timeline = catalog ? parseTimeline(`${catalog.processingTime} ${raw}`, doc.vertical) : parseTimeline(raw, doc.vertical);

  return {
    id: `doc:${doc.url}`,
    title: doc.title,
    country,
    countrySlug: doc.country,
    track: doc.vertical,
    href: doc.url,
    summary: excerpt(doc.summary || doc.body, `${TRACK_LABELS[doc.vertical]} programme in ${country}`),
    heroImage: doc.heroImage,
    tags: doc.tags ?? [],
    investmentUsd: investment,
    investmentLabel: catalog?.minInvestmentUSD || investmentLabel(investment),
    timelineMonths: timeline,
    timelineLabel: catalog?.processingTime || timelineLabel(timeline),
    presence: detectPresence(raw, doc.vertical),
    family: detectFamily(raw, doc.vertical),
    risk: detectRisk(raw, doc.vertical),
    source: "site-content",
    evidence: [
      "Approved website programme page",
      catalog ? "Matched enriched programme catalog" : "Scored from page summary and body",
    ],
    keywords: keywordText(raw),
  };
}

type CountryRoute = {
  track: Vertical;
  slug: string;
  key: string;
};

function resolveCountryRouteSlug(track: Vertical, country: string, routes: CountryRoute[]) {
  const countryName = country.split("(")[0];
  const slug = slugify(countryName);
  const key = countryLookupKey(countryName);
  const exact = routes.find((route) => route.track === track && (route.slug === slug || route.key === key));
  if (exact) return exact.slug;

  return routes.find((route) => {
    if (route.track !== track) return false;
    if (key.length < 5 || route.key.length < 5) return false;
    return key.includes(route.key) || route.key.includes(key);
  })?.slug;
}

function fromCatalog(item: ReturnType<typeof catalogPrograms>[number], countryRouteSlug?: string): ProgrammeExplorerItem {
  const countrySlug = slugify(item.country.split("(")[0]);
  const raw = Object.values(item).join(" ");
  const investment = parseMoney(raw, item.track);
  const timeline = parseTimeline(raw, item.track);

  return {
    id: `catalog:${catalogKey(item)}`,
    title: item.name,
    country: item.country,
    countrySlug,
    track: item.track,
    href: countryRouteSlug ? `/${item.track}/${countryRouteSlug}` : `/${item.track}`,
    summary: item.notes,
    tags: [item.track, item.pathway],
    investmentUsd: investment,
    investmentLabel: item.minInvestmentUSD,
    timelineMonths: timeline,
    timelineLabel: item.processingTime,
    presence: detectPresence(raw, item.track),
    family: Boolean(item.familyIncluded),
    risk: detectRisk(raw, item.track),
    source: "catalog",
    evidence: ["Enriched XIPHIAS programme catalog", "Use advisor review before quoting final rules"],
    keywords: keywordText(raw),
  };
}

export function getProgrammeExplorerData(): ProgrammeExplorerData {
  const docs = getAllContentCached().filter((doc): doc is ProgramDoc => doc.kind === "program");
  const siteItems = docs.map(fromDoc);
  const countryRoutes: CountryRoute[] = Array.from(
    new Map(
      siteItems.map((item) => [
        `${item.track}:${item.countrySlug}`,
        {
          track: item.track,
          slug: item.countrySlug,
          key: countryLookupKey(`${item.country} ${item.countrySlug}`),
        },
      ]),
    ).values(),
  );

  const seen = new Set(siteItems.map((item) => `${item.track}:${item.countrySlug}:${slugify(item.title)}`));
  const fallbackItems = catalogPrograms()
    .map((item) => fromCatalog(item, resolveCountryRouteSlug(item.track, item.country, countryRoutes)))
    .filter((item) => {
      const key = `${item.track}:${item.countrySlug}:${slugify(item.title)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const items = [...siteItems, ...fallbackItems].sort((a, b) => {
    if (a.source !== b.source) return a.source === "site-content" ? -1 : 1;
    return a.country.localeCompare(b.country) || a.title.localeCompare(b.title);
  });

  const countries = Array.from(new Set(items.map((item) => item.country))).sort((a, b) => a.localeCompare(b));

  return {
    generatedAt: new Date().toISOString(),
    items,
    countries,
    totals: {
      programmes: items.length,
      countries: countries.length,
      siteContent: siteItems.length,
      catalogFallback: fallbackItems.length,
    },
  };
}
