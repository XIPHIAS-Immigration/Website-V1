export type EventPhoto = {
  src: string;
  alt?: string;
  w: number;
  h: number;
  caption?: string;
};

export type EventRecord = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  location?: string;
  summary?: string;
  description: string; // plain text or markdown-like string
  photos?: EventPhoto[];
};
