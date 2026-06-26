import "server-only";

import { getProgrammeExplorerData, type ProgrammeExplorerItem } from "@/lib/programme-explorer";
import type { Vertical } from "@/lib/content/types";

/**
 * Country-first view over the programme catalogue. Powers the new "Countries"
 * navigation: a /countries index and a /countries/[country] overview page that
 * aggregates every programme we offer in that country across all four verticals
 * (residency, citizenship, skilled, corporate). Built on top of the existing
 * site-content programmes so it always reflects real MDX pages.
 */

export const TRACK_LABEL: Record<Vertical, string> = {
  residency: "Residency by Investment",
  citizenship: "Citizenship by Investment",
  skilled: "Skilled Migration",
  corporate: "Corporate & Business",
};

export const TRACK_ORDER: Vertical[] = ["citizenship", "residency", "skilled", "corporate"];

export type CountrySummary = {
  slug: string;
  name: string;
  code: string; // ISO-2 for the flag
  region: string;
  tracks: Vertical[];
  programmeCount: number;
  heroImage?: string;
};

export type CountryTrackGroup = {
  track: Vertical;
  label: string;
  items: ProgrammeExplorerItem[];
};

export type CountryOverview = CountrySummary & {
  groups: CountryTrackGroup[];
  programmes: ProgrammeExplorerItem[];
};

// Canonical display name, ISO-2 flag code and region, keyed by the content
// directory slug (content/{vertical}/{slug}). Keeps the title-cased fallback
// from looking wrong (e.g. "Uae" -> "UAE", "Usa" -> "USA").
const COUNTRY_META: Record<string, { name: string; code: string; region: string }> = {
  "antigua-barbuda": { name: "Antigua & Barbuda", code: "AG", region: "Caribbean" },
  australia: { name: "Australia", code: "AU", region: "Asia-Pacific" },
  bulgaria: { name: "Bulgaria", code: "BG", region: "Europe" },
  canada: { name: "Canada", code: "CA", region: "Americas" },
  curacao: { name: "Curaçao", code: "CW", region: "Caribbean" },
  cyprus: { name: "Cyprus", code: "CY", region: "Europe" },
  dominica: { name: "Dominica", code: "DM", region: "Caribbean" },
  egypt: { name: "Egypt", code: "EG", region: "Africa & Middle East" },
  germany: { name: "Germany", code: "DE", region: "Europe" },
  greece: { name: "Greece", code: "GR", region: "Europe" },
  grenada: { name: "Grenada", code: "GD", region: "Caribbean" },
  "hong-kong": { name: "Hong Kong", code: "HK", region: "Asia-Pacific" },
  hungary: { name: "Hungary", code: "HU", region: "Europe" },
  italy: { name: "Italy", code: "IT", region: "Europe" },
  latvia: { name: "Latvia", code: "LV", region: "Europe" },
  malaysia: { name: "Malaysia", code: "MY", region: "Asia-Pacific" },
  malta: { name: "Malta", code: "MT", region: "Europe" },
  mauritius: { name: "Mauritius", code: "MU", region: "Africa & Middle East" },
  monaco: { name: "Monaco", code: "MC", region: "Europe" },
  nauru: { name: "Nauru", code: "NR", region: "Asia-Pacific" },
  "new-zealand": { name: "New Zealand", code: "NZ", region: "Asia-Pacific" },
  panama: { name: "Panama", code: "PA", region: "Americas" },
  portugal: { name: "Portugal", code: "PT", region: "Europe" },
  saintkitts: { name: "Saint Kitts & Nevis", code: "KN", region: "Caribbean" },
  "saint-lucia": { name: "Saint Lucia", code: "LC", region: "Caribbean" },
  saotome: { name: "São Tomé & Príncipe", code: "ST", region: "Africa & Middle East" },
  singapore: { name: "Singapore", code: "SG", region: "Asia-Pacific" },
  spain: { name: "Spain", code: "ES", region: "Europe" },
  switzerland: { name: "Switzerland", code: "CH", region: "Europe" },
  turkey: { name: "Turkey", code: "TR", region: "Europe" },
  uae: { name: "United Arab Emirates", code: "AE", region: "Africa & Middle East" },
  "united-kingdom": { name: "United Kingdom", code: "GB", region: "Europe" },
  uruguay: { name: "Uruguay", code: "UY", region: "Americas" },
  usa: { name: "United States", code: "US", region: "Americas" },
  vanuatu: { name: "Vanuatu", code: "VU", region: "Asia-Pacific" },
};

export const REGION_ORDER = [
  "Europe",
  "Caribbean",
  "Asia-Pacific",
  "Americas",
  "Africa & Middle East",
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function metaFor(slug: string) {
  return (
    COUNTRY_META[slug] ?? {
      name: titleFromSlug(slug),
      code: "",
      region: "Other",
    }
  );
}

/** All countries we offer, grouped from real site-content programmes. */
function siteItemsByCountry() {
  const items = getProgrammeExplorerData().items.filter((i) => i.source === "site-content");
  const byCountry = new Map<string, ProgrammeExplorerItem[]>();
  for (const item of items) {
    const slug = item.countrySlug;
    if (!slug) continue;
    const list = byCountry.get(slug) ?? [];
    list.push(item);
    byCountry.set(slug, list);
  }
  return byCountry;
}

function buildGroups(items: ProgrammeExplorerItem[]): CountryTrackGroup[] {
  return TRACK_ORDER.map((track) => ({
    track,
    label: TRACK_LABEL[track],
    items: items
      .filter((i) => i.track === track)
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((g) => g.items.length > 0);
}

export function getAllCountries(): CountrySummary[] {
  const byCountry = siteItemsByCountry();
  const out: CountrySummary[] = [];
  for (const [slug, items] of byCountry) {
    const meta = metaFor(slug);
    const tracks = TRACK_ORDER.filter((t) => items.some((i) => i.track === t));
    const heroImage = items.find((i) => i.heroImage)?.heroImage;
    out.push({
      slug,
      name: meta.name,
      code: meta.code,
      region: meta.region,
      tracks,
      programmeCount: items.length,
      heroImage,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountriesByRegion(): { region: string; countries: CountrySummary[] }[] {
  const all = getAllCountries();
  const byRegion = new Map<string, CountrySummary[]>();
  for (const c of all) {
    const list = byRegion.get(c.region) ?? [];
    list.push(c);
    byRegion.set(c.region, list);
  }
  const ordered = [...REGION_ORDER, ...[...byRegion.keys()].filter((r) => !REGION_ORDER.includes(r))];
  return ordered
    .filter((region) => byRegion.has(region))
    .map((region) => ({ region, countries: byRegion.get(region)! }));
}

export function getCountryOverview(slug: string): CountryOverview | null {
  const items = siteItemsByCountry().get(slug);
  if (!items || items.length === 0) return null;
  const meta = metaFor(slug);
  const tracks = TRACK_ORDER.filter((t) => items.some((i) => i.track === t));
  return {
    slug,
    name: meta.name,
    code: meta.code,
    region: meta.region,
    tracks,
    programmeCount: items.length,
    heroImage: items.find((i) => i.heroImage)?.heroImage,
    groups: buildGroups(items),
    programmes: items,
  };
}

export function getCountrySlugs(): string[] {
  return [...siteItemsByCountry().keys()].sort();
}
