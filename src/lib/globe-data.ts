import "server-only";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import type { Vertical } from "@/lib/content/types";
import { headerMenu } from "@/components/Layout/Header/Navigation/menu.data";
import type { HeaderItem } from "@/components/Layout/Header/menu.types";
import { countryCentroids, centroidForCode } from "@/data/country-centroids";
import type { GlobeArc, GlobeMarker } from "@/components/globe/types";

export type GlobeTrack = {
  track: Vertical;
  label: string;
  href: string;
  count: number;
};

export type GlobeProgramme = {
  title: string;
  track: Vertical;
  href: string;
  investment: string;
  timeline: string;
};

export type GlobeCountryDetail = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  programmeCount: number;
  tracks: GlobeTrack[];
  topProgrammes: GlobeProgramme[];
};

export type GlobeExplorerData = {
  markers: GlobeMarker[];
  details: GlobeCountryDetail[];
  arcs: GlobeArc[];
  totalCountries: number;
  totalProgrammes: number;
};

const TRACK_LABELS: Record<Vertical, string> = {
  residency: "Residency",
  citizenship: "Citizenship",
  corporate: "Corporate",
  skilled: "Skilled",
};

const TRACK_ORDER: Vertical[] = ["citizenship", "residency", "skilled", "corporate"];

function normKey(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/** Walk the nav tree to map a country slug -> { ISO-2 code, display label }. */
function buildSlugIndex() {
  const slugToCode = new Map<string, string>();
  const slugToLabel = new Map<string, string>();
  const codeToLabel = new Map<string, string>();

  const walk = (nodes: HeaderItem[]) => {
    for (const node of nodes) {
      const code = node.meta?.code;
      const segments = node.href.split("/").filter(Boolean);
      // Country hub links look like /{vertical}/{slug}
      if (code && segments.length === 2) {
        const slug = segments[1].toLowerCase();
        slugToCode.set(slug, code.toUpperCase());
        slugToLabel.set(slug, node.label);
        if (!codeToLabel.has(code.toUpperCase())) codeToLabel.set(code.toUpperCase(), node.label);
      }
      if (node.submenu) walk(node.submenu);
    }
  };
  walk(headerMenu);

  return { slugToCode, slugToLabel, codeToLabel };
}

// Centroid name -> code, for fallback resolution when the nav has no entry.
const centroidByName = new Map(countryCentroids.map((c) => [normKey(c.name), c.code.toUpperCase()]));

function resolveCode(countrySlug: string, countryName: string, slugToCode: Map<string, string>) {
  return (
    slugToCode.get(countrySlug.toLowerCase()) ??
    centroidByName.get(normKey(countryName)) ??
    centroidByName.get(normKey(countrySlug)) ??
    null
  );
}

/**
 * Aggregates every site programme into per-country globe markers (placed by
 * ISO-2 centroid) plus a serialisable detail record the client panel renders.
 * Arcs run from India (the primary client origin) to the richest destinations.
 */
export function getGlobeExplorerData(): GlobeExplorerData {
  const { items } = getProgrammeExplorerData();
  const { slugToCode, slugToLabel, codeToLabel } = buildSlugIndex();

  const byCode = new Map<string, GlobeCountryDetail>();

  for (const item of items) {
    const code = resolveCode(item.countrySlug, item.country, slugToCode);
    if (!code) continue;
    const centroid = centroidForCode(code);
    if (!centroid) continue;

    let detail = byCode.get(code);
    if (!detail) {
      const name = slugToLabel.get(item.countrySlug.toLowerCase()) ?? codeToLabel.get(code) ?? centroid.name;
      detail = {
        code,
        name,
        lat: centroid.lat,
        lng: centroid.lng,
        programmeCount: 0,
        tracks: [],
        topProgrammes: [],
      };
      byCode.set(code, detail);
    }

    detail.programmeCount += 1;

    let track = detail.tracks.find((t) => t.track === item.track);
    if (!track) {
      track = {
        track: item.track,
        label: TRACK_LABELS[item.track],
        href: `/${item.track}/${item.countrySlug}`,
        count: 0,
      };
      detail.tracks.push(track);
    }
    track.count += 1;

    if (detail.topProgrammes.length < 6) {
      detail.topProgrammes.push({
        title: item.title,
        track: item.track,
        href: item.href,
        investment: item.investmentLabel,
        timeline: item.timelineLabel,
      });
    }
  }

  const details = Array.from(byCode.values())
    .map((d) => ({
      ...d,
      tracks: d.tracks.sort((a, b) => TRACK_ORDER.indexOf(a.track) - TRACK_ORDER.indexOf(b.track)),
    }))
    .sort((a, b) => b.programmeCount - a.programmeCount || a.name.localeCompare(b.name));

  const maxCount = details.reduce((m, d) => Math.max(m, d.programmeCount), 1);

  const markers: GlobeMarker[] = details.map((d) => ({
    code: d.code,
    lat: d.lat,
    lng: d.lng,
    label: d.name,
    weight: Math.max(0.25, d.programmeCount / maxCount),
  }));

  // Arcs: from India to the top destinations.
  const origin = centroidForCode("IN");
  const arcs: GlobeArc[] = origin
    ? details
        .filter((d) => d.code !== "IN")
        .slice(0, 7)
        .map((d) => ({
          from: [origin.lat, origin.lng] as [number, number],
          to: [d.lat, d.lng] as [number, number],
        }))
    : [];

  const totalProgrammes = details.reduce((sum, d) => sum + d.programmeCount, 0);

  return {
    markers,
    details,
    arcs,
    totalCountries: details.length,
    totalProgrammes,
  };
}
