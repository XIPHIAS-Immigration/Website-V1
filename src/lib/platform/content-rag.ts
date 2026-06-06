import "server-only";

import MiniSearch from "minisearch";
import { getAllContentCached } from "@/lib/content";
import type { AnyDoc } from "@/lib/content/types";
import type { Track } from "@/lib/eligibility/types";

type IndexedChunk = {
  id: string;
  docIndex: number;
  chunkIndex: number;
  title: string;
  text: string;
  summary: string;
  url: string;
  country: string;
  countryLabel: string;
  verticals: string;
  tags: string;
  kind: string;
};

export type RetrievedContentChunk = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  score: number;
  country?: string;
  verticals: string[];
  reasons: string[];
};

export type RetrievalResult = {
  chunks: RetrievedContentChunk[];
  countryLabel?: string;
  hasCountryIntent: boolean;
  exactCountryMatchCount: number;
};

export type CountryOfferingGroup = {
  track: Track;
  label: string;
  href: string;
  countries: string[];
};

const COUNTRY_ALIASES: Record<string, string[]> = {
  "antigua-barbuda": ["antigua barbuda", "antigua", "barbuda"],
  australia: ["australia", "au"],
  bahrain: ["bahrain", "bh"],
  bulgaria: ["bulgaria"],
  canada: ["canada", "ca"],
  curacao: ["curacao", "curacao"],
  cyprus: ["cyprus"],
  dominica: ["dominica"],
  egypt: ["egypt", "eg"],
  germany: ["germany", "de"],
  greece: ["greece", "gr"],
  grenada: ["grenada"],
  "hong-kong": ["hong kong", "hk"],
  hungary: ["hungary"],
  italy: ["italy", "it"],
  latvia: ["latvia"],
  malaysia: ["malaysia", "my"],
  malta: ["malta", "mt"],
  mauritius: ["mauritius"],
  monaco: ["monaco"],
  nauru: ["nauru"],
  "new-zealand": ["new zealand", "nz"],
  oman: ["oman", "om"],
  panama: ["panama", "pa"],
  portugal: ["portugal", "pt"],
  qatar: ["qatar", "qa"],
  "saint-lucia": ["saint lucia", "st lucia"],
  saintkitts: ["saint kitts", "st kitts", "saint kitts nevis"],
  saotome: ["sao tome", "sao tome principe"],
  "saudi-arabia": ["saudi arabia", "saudi", "sa"],
  singapore: ["singapore", "sg"],
  spain: ["spain", "es"],
  switzerland: ["switzerland"],
  turkey: ["turkey"],
  uae: ["uae", "united arab emirates", "emirates", "ae", "dubai"],
  "united-kingdom": ["united kingdom", "uk", "great britain", "britain", "england"],
  uruguay: ["uruguay"],
  usa: ["usa", "us", "united states", "america"],
  vanuatu: ["vanuatu"],
};

const COUNTRY_LABELS: Record<string, string> = {
  "antigua-barbuda": "Antigua and Barbuda",
  australia: "Australia",
  bahrain: "Bahrain",
  bulgaria: "Bulgaria",
  canada: "Canada",
  curacao: "Curacao",
  cyprus: "Cyprus",
  dominica: "Dominica",
  egypt: "Egypt",
  germany: "Germany",
  greece: "Greece",
  grenada: "Grenada",
  "hong-kong": "Hong Kong",
  hungary: "Hungary",
  italy: "Italy",
  latvia: "Latvia",
  malaysia: "Malaysia",
  malta: "Malta",
  mauritius: "Mauritius",
  monaco: "Monaco",
  nauru: "Nauru",
  "new-zealand": "New Zealand",
  oman: "Oman",
  panama: "Panama",
  portugal: "Portugal",
  qatar: "Qatar",
  "saint-lucia": "Saint Lucia",
  saintkitts: "Saint Kitts and Nevis",
  saotome: "Sao Tome and Principe",
  "saudi-arabia": "Saudi Arabia",
  singapore: "Singapore",
  spain: "Spain",
  switzerland: "Switzerland",
  turkey: "Turkey",
  uae: "UAE",
  "united-kingdom": "United Kingdom",
  uruguay: "Uruguay",
  usa: "United States",
  vanuatu: "Vanuatu",
};

let cache: {
  docs: AnyDoc[];
  chunks: IndexedChunk[];
  index: MiniSearch<IndexedChunk>;
} | null = null;

function norm(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: unknown) {
  return norm(value).replace(/\s+/g, "-");
}

function titleCaseSlug(slug: string) {
  return COUNTRY_LABELS[slug] ?? slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function docCountry(doc: AnyDoc) {
  if (doc.kind === "program") return doc.country;
  return doc.countries?.[0] ?? "";
}

function docVerticals(doc: AnyDoc) {
  if (doc.kind === "program") return [doc.vertical];
  return doc.verticals ?? [];
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

function splitIntoChunks(text: string, maxChars = 900) {
  const paragraphs = text
    .split(/(?:\r?\n){2,}|(?<=\.)\s+(?=[A-Z0-9])/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter((part) => part.length > 40);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current} ${paragraph}` : paragraph;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [text.slice(0, maxChars)];
}

function resolveCountry(value?: string) {
  const input = norm(value);
  if (!input) return null;

  for (const [slug, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (slug === slugify(input) || aliases.some((alias) => norm(alias) === input)) {
      return { slug, label: titleCaseSlug(slug), aliases };
    }
  }

  const asSlug = slugify(input);
  return { slug: asSlug, label: titleCaseSlug(asSlug), aliases: [input] };
}

function detectCountryFromText(value: string) {
  const text = ` ${norm(value)} `;
  const allowedShortAliases = new Set(["nz", "uae", "uk", "usa"]);
  const matches = Object.entries(COUNTRY_ALIASES)
    .map(([slug, aliases]) => {
      const hit = aliases.some((alias) => {
        const normalizedAlias = norm(alias);
        if (normalizedAlias.length <= 2 && !allowedShortAliases.has(normalizedAlias)) return false;
        const needle = ` ${normalizedAlias} `;
        return normalizedAlias.length > 1 && text.includes(needle);
      });
      return hit ? { slug, label: titleCaseSlug(slug), aliases } : null;
    })
    .filter(Boolean) as { slug: string; label: string; aliases: string[] }[];

  return matches[0] ?? null;
}

function isExactCountryDoc(doc: AnyDoc, country: { slug: string; aliases: string[] }) {
  const countrySlug = slugify(docCountry(doc));
  const title = norm(doc.title);
  const tags = norm(doc.tags?.join(" "));
  const url = norm(doc.url);

  if (countrySlug && countrySlug === country.slug) return true;
  if (country.aliases.some((alias) => countrySlug && countrySlug === slugify(alias))) return true;
  return country.aliases.some((alias) => {
    const needle = norm(alias);
    if (needle.length <= 2) return false;
    return title.includes(needle) || tags.includes(needle) || url.includes(needle.replace(/\s+/g, "-"));
  });
}

function buildIndex() {
  if (cache) return cache;

  const docs = getAllContentCached();
  const chunks: IndexedChunk[] = [];

  docs.forEach((doc, docIndex) => {
    const country = docCountry(doc);
    const verticals = docVerticals(doc);
    const bodyText = stripMdx(doc.body);
    const pieces = splitIntoChunks([doc.summary, bodyText].filter(Boolean).join("\n\n"));

    pieces.slice(0, 12).forEach((piece, chunkIndex) => {
      chunks.push({
        id: `${docIndex}:${chunkIndex}`,
        docIndex,
        chunkIndex,
        title: doc.title,
        text: piece,
        summary: doc.summary ?? "",
        url: doc.url,
        country,
        countryLabel: titleCaseSlug(country),
        verticals: verticals.join(" "),
        tags: doc.tags?.join(" ") ?? "",
        kind: doc.kind,
      });
    });
  });

  const index = new MiniSearch<IndexedChunk>({
    fields: ["title", "summary", "text", "country", "countryLabel", "verticals", "tags"],
    storeFields: ["id"],
    searchOptions: {
      boost: { title: 4, country: 4, countryLabel: 4, verticals: 2, tags: 2, summary: 2, text: 1 },
      prefix: true,
      fuzzy: 0.1,
      combineWith: "OR",
    },
  });

  index.addAll(chunks);
  cache = { docs, chunks, index };
  return cache;
}

function queryTokens(value: string) {
  return norm(value)
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 18);
}

function uniqueByUrl(chunks: RetrievedContentChunk[]) {
  const seen = new Set<string>();
  return chunks.filter((chunk) => {
    if (seen.has(chunk.href)) return false;
    seen.add(chunk.href);
    return true;
  });
}

export function retrieveContent(args: {
  query?: string;
  country?: string;
  track?: Track;
  limit?: number;
}): RetrievalResult {
  const built = buildIndex();
  const country = resolveCountry(args.country) ?? detectCountryFromText(args.query ?? "");
  const hasCountryIntent = Boolean(country);

  const exactDocIndexes = country
    ? built.docs
        .map((doc, index) => (isExactCountryDoc(doc, country) ? index : -1))
        .filter((index) => index >= 0)
    : [];
  const exactDocSet = new Set(exactDocIndexes);

  if (country && exactDocIndexes.length === 0) {
    return {
      chunks: [],
      countryLabel: country.label,
      hasCountryIntent: true,
      exactCountryMatchCount: 0,
    };
  }

  const query = [
    args.query,
    args.country,
    country?.label,
    args.track,
  ]
    .filter(Boolean)
    .join(" ");

  const rawResults = built.index.search(query || args.track || "immigration").slice(0, 40);
  const tokens = queryTokens(query);

  let enriched = rawResults
    .map((result) => {
      const chunk = built.chunks.find((item) => item.id === String(result.id));
      if (!chunk) return null;
      if (country && !exactDocSet.has(chunk.docIndex)) return null;
      if (args.track && !chunk.verticals.split(" ").includes(args.track)) return null;

      const haystack = norm([chunk.title, chunk.summary, chunk.text, chunk.countryLabel, chunk.tags].join(" "));
      const reasons: string[] = [];
      let score = Number(result.score ?? 0);

      if (country && exactDocSet.has(chunk.docIndex)) {
        score += 80;
        reasons.push(`Exact ${country.label} page/program in site content.`);
      }
      if (args.track && chunk.verticals.split(" ").includes(args.track)) {
        score += 25;
        reasons.push(`Matches ${args.track} pathway.`);
      }

      const hits = tokens.filter((token) => haystack.includes(token));
      if (hits.length) {
        score += Math.min(30, hits.length * 4);
        reasons.push(`Query terms matched: ${hits.slice(0, 4).join(", ")}.`);
      }

      return {
        id: chunk.id,
        title: chunk.title,
        href: chunk.url,
        excerpt: chunk.text.slice(0, 360),
        score: Math.min(100, Math.max(45, Math.round(score))),
        country: chunk.countryLabel,
        verticals: chunk.verticals.split(" ").filter(Boolean),
        reasons: reasons.length ? reasons : ["Retrieved from approved site content."],
      } satisfies RetrievedContentChunk;
    })
    .filter(Boolean) as RetrievedContentChunk[];

  if (!enriched.length && country) {
    enriched = built.chunks
      .filter((chunk) => exactDocSet.has(chunk.docIndex) && (!args.track || chunk.verticals.split(" ").includes(args.track)))
      .slice(0, args.limit ?? 5)
      .map((chunk) => ({
        id: chunk.id,
        title: chunk.title,
        href: chunk.url,
        excerpt: chunk.text.slice(0, 360),
        score: 72,
        country: chunk.countryLabel,
        verticals: chunk.verticals.split(" ").filter(Boolean),
        reasons: [`Exact ${country.label} page/program in site content.`],
      }));
  }

  return {
    chunks: uniqueByUrl(enriched)
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit ?? 5),
    countryLabel: country?.label,
    hasCountryIntent,
    exactCountryMatchCount: exactDocIndexes.length,
  };
}

export function listCountryOfferings(): CountryOfferingGroup[] {
  const docs = getAllContentCached();
  const tracks: { track: Track; label: string; href: string }[] = [
    { track: "residency", label: "Residency", href: "/residency" },
    { track: "citizenship", label: "Citizenship", href: "/citizenship" },
    { track: "skilled", label: "Skilled migration", href: "/skilled" },
    { track: "corporate", label: "Corporate immigration", href: "/corporate" },
  ];

  return tracks.map((item) => {
    const countries = new Set<string>();

    docs.forEach((doc) => {
      if (!doc.url.startsWith(`/${item.track}/`)) return;
      const country = docCountry(doc);
      if (!country) return;
      countries.add(titleCaseSlug(country));
    });

    return {
      ...item,
      countries: [...countries].sort((a, b) => a.localeCompare(b)),
    };
  });
}
