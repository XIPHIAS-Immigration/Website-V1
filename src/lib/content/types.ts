export type Vertical = "residency" | "citizenship" | "skilled" | "corporate";

export type QuickFact = { label: string; value: string };

export type ProgramDoc = {
  kind: "program";
  title: string;
  vertical: Vertical;
  country: string; // slug
  program: string; // slug
  summary?: string;
  updatedAt?: string;
  heroImage?: string;
  heroVideo?: string;
  heroPoster?: string;
  brochure?: string;
  tags?: string[];
  quickFacts?: QuickFact[];
  faq?: { q: string; a: string }[];
  body: string; // MDX raw
  path: string; // fs path
  url: string; // canonical url
  tagline?: string; // ✅ add this
};

export type HubKind = "blog" | "news" | "article" | "media" | "job";
export type HubDoc = {
  kind: "hub";
  type: HubKind;
  title: string;
  summary?: string;
  updatedAt?: string;
  heroImage?: string;
  tags?: string[];
  verticals?: Vertical[];
  countries?: string[];
  programs?: string[]; // program slugs
  body: string;
  path: string;
  url: string;
};

export type AnyDoc = ProgramDoc | HubDoc;
