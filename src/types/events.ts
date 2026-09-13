export type EventPhoto = {
  src: string;
  alt?: string;
  w: number;
  h: number;
  caption?: string;
};

export type EventRecord = {
  slug: string;
  /** Optional official/external event page, rendered as a short labelled button. */
  link?: { href: string; label?: string };
  title: string;
  date: string; // YYYY-MM-DD
  location?: string;
  summary?: string;
  description: string; // plain text or markdown-like string
  photos?: EventPhoto[];
};
