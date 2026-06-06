export type SearchDocType =
  | "country"
  | "program"
  | "article"
  | "news"
  | "media"
  | "blog"
  | "page";

export type SearchDoc = {
  id: string;
  url: string;
  type: SearchDocType;
  title: string;
  subtitle?: string;
  tags?: string[];
  snippet?: string;
  hero?: string;
  date?: string;
  updated?: string;
  countries?: string[];
  programs?: string[];
};

export type SearchIndexFile = {
  version: number;
  generatedAt: string;
  count: number;
  docs: SearchDoc[];
};

export type ApiSearchResult = SearchDoc & { score: number };

export type ApiSearchResponse = {
  query: string;
  tookMs: number;
  count: number;
  items: ApiSearchResult[];
};
