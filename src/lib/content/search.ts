import "server-only";
import MiniSearch from "minisearch";
import { getAllContentCached } from "./index";

type SDoc = {
  id: string;
  title: string;
  summary?: string;
  kind: "program" | "hub";
  url: string;
  verticals?: string[];
  countries?: string[];
  programs?: string[];
  tags?: string[];
  body: string;
};

let mini: MiniSearch<SDoc> | null = null;

export function getSearch() {
  if (mini) return mini;

  const all = getAllContentCached();
  const docs: SDoc[] = all.map((d, i) =>
    d.kind === "program"
      ? {
          id: `p_${i}`,
          title: d.title,
          summary: d.summary,
          kind: d.kind,
          url: d.url,
          verticals: [d.vertical],
          countries: [d.country],
          programs: [d.program],
          tags: d.tags ?? [],
          body: d.body,
        }
      : {
          id: `h_${i}`,
          title: d.title,
          summary: d.summary,
          kind: d.kind,
          url: d.url,
          verticals: d.verticals ?? [],
          countries: d.countries ?? [],
          programs: d.programs ?? [],
          tags: d.tags ?? [],
          body: d.body,
        },
  );

  mini = new MiniSearch<SDoc>({
    fields: [
      "title",
      "summary",
      "tags",
      "verticals",
      "countries",
      "programs",
      "body",
    ],
    storeFields: [
      "title",
      "summary",
      "kind",
      "url",
      "verticals",
      "countries",
      "programs",
      "tags",
    ],
    searchOptions: {
      boost: { title: 4, tags: 2, summary: 1.5 },
      prefix: true,
      fuzzy: 0.1,
    },
  });

  mini.addAll(docs);
  return mini;
}
