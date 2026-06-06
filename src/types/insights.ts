// src/types/insights.ts

export type InsightKind = "articles" | "news" | "media" | "blog";

export type Heading = {
  id: string;
  text: string;
  depth: 2 | 3; // we only extract h2/h3 for the TOC
};

export type InsightMeta = {
  kind: InsightKind;
  slug: string;
  title: string;
  summary?: string;
  author?: string;

  /** Always normalized to arrays */
  country?: string[];
  program?: string[];
  tags?: string[];

  /** Card/list image and generic fallback */
  hero?: string;
  heroAlt?: string;

  /** Detail page video hero (optional). If present, use in MediaHero. */
  heroVideo?: string;
  /** Poster image for the video (falls back to `hero` if absent). */
  heroPoster?: string;

  /** Dates (ISO) */
  date?: string;
  updated?: string;

  /** Derived at build/read time */
  readingTimeMins?: number;

  /** Computed canonical URL for routing */
  url: string;
};

export type InsightRecord = InsightMeta & {
  /** Extracted h2/h3 headings for local ToC */
  headings?: Heading[];
  /** Compiled MDX element tree */
  content?: any; // ReactNode-like, opaque to callers
};

export type GetAllInsightsParams = {
  q?: string;
  kind?: InsightKind;
  country?: string;
  program?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

export type Facets = {
  kinds: InsightKind[];
  countries: string[];
  programs: string[];
  tags: string[];
};
