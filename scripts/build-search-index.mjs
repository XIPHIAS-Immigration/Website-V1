// Node ESM script. Runs before `next build`.
// Walks MDX content, extracts frontmatter + snippet, writes /public/search-index.json

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

// Keep snippets readable without a full remark pipeline
function stripToText(input) {
  if (!input) return "";
  let s = input;
  // fenced code blocks
  s = s.replace(/```[\s\S]*?```/g, " ");
  // MDX/JSX tags (block + self-closing)
  s = s.replace(/<[^>]+>/g, " ");
  // images
  s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
  // links -> keep link text
  s = s.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
  // inline code
  s = s.replace(/`([^`]+)`/g, "$1");
  // collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function firstChars(s, n = 200) {
  if (!s) return "";
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
}

function ensureArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

// Guess doc "type" and canonical URL from absolute path
function guessTypeAndUrl(abs, repoRoot, fm) {
  const rel = abs.split(path.sep).join("/");
  const baseRel = rel.replace(repoRoot.split(path.sep).join("/") + "/", "");

  // content/<section>/<country>/_country.mdx => /<section>/<country>
  // content/<section>/<country>/<program>.mdx => /<section>/<country>/<program>
  // Supported sections: citizenship, residency, corporate, skilled
  const contentMatch = baseRel.match(
    /^content\/(citizenship|residency|corporate|skilled)\/([^/]+)\/([^/]+)\.mdx$/i,
  );
  if (contentMatch) {
    const [, section, country, leaf] = contentMatch;
    if (leaf === "_country") {
      return {
        type: "country",
        url: `/${section}/${country}`,
        section,
        country,
        program: null,
      };
    }
    const program = (fm?.programSlug || leaf).toString();
    return {
      type: "program",
      url: `/${section}/${country}/${program}`,
      section,
      country,
      program,
    };
  }

  // content/<kind>/<slug>.mdx for insights buckets
  // -> pretty routes: /articles/<slug>, /news/<slug>, /media/<slug>, /blog/<slug>
  const insightMatch = baseRel.match(
    /^content\/(articles|news|media|blog)\/([^/]+)\.mdx$/i,
  );
  if (insightMatch) {
    const [, kind, leaf] = insightMatch;
    // Keep URL generation aligned with runtime routing (filename slug).
    const slug = leaf.toString().replace(/\.mdx$/i, "");
    /** @type {"article"|"news"|"media"|"blog"} */
    let type = kind === "articles" ? "article" : /** @type any */ (kind);
    const prettySegment = kind === "articles" ? "articles" : kind;
    return {
      type,
      url: `/${prettySegment}/${slug}`,
      section: null,
      country: null,
      program: null,
    };
  }

  // fallback (should rarely happen)
  return {
    type: "page",
    url: "/",
    section: null,
    country: null,
    program: null,
  };
}

async function main() {
  const repoRoot = process.cwd();
  const publicDir = path.join(repoRoot, "public");
  const outputFile = path.join(publicDir, "search-index.json");

  // IMPORTANT: Only scan under /content/** per project structure
  const patterns = [
    "content/citizenship/**/*.mdx",
    "content/residency/**/*.mdx",
    "content/corporate/**/*.mdx",
    "content/skilled/**/*.mdx",
    "content/articles/**/*.mdx",
    "content/news/**/*.mdx",
    "content/media/**/*.mdx",
    "content/blog/**/*.mdx",
  ];

  const files = await fg(patterns, {
    cwd: repoRoot,
    absolute: true,
    dot: false,
  });

  /** @type {Array<any>} */
  const docs = [];

  for (const abs of files) {
    const raw = await fs.readFile(abs, "utf8");
    const { data: fm, content } = matter(raw);

    // skip drafts in production
    if (
      (fm?.draft === true || fm?.draft === "true") &&
      process.env.NODE_ENV === "production"
    )
      continue;

    const meta = guessTypeAndUrl(abs, repoRoot, fm);

    // Frontmatter fields (with fallbacks)
    const title =
      (fm.title ?? "").toString().trim() || path.basename(abs, ".mdx");
    const subtitle =
      meta.type === "program"
        ? (fm.country ?? fm.countryName ?? meta.country ?? "").toString()
        : (fm.subtitle ?? fm.section ?? meta.section ?? "").toString();

    const tags = ensureArray(fm.tags)
      .map((t) => t.toString().trim())
      .filter(Boolean);
    const summary = (fm.summary ?? fm.description ?? "").toString().trim();
    const hero = (fm.hero ?? fm.heroImage ?? fm.image ?? "").toString();
    const date = (fm.date ?? "").toString();
    const updated = (fm.updated ?? fm.lastmod ?? "").toString();

    const text = stripToText(content);
    const snippet = summary || firstChars(text, 200);

    const countries = ensureArray(
      fm.countries && fm.countries.length
        ? fm.countries
        : meta.country
          ? [meta.country]
          : [],
    )
      .map((s) => s.toString().toLowerCase())
      .filter(Boolean);

    const programs = ensureArray(
      fm.programs && fm.programs.length
        ? fm.programs
        : meta.program
          ? [meta.program]
          : [],
    )
      .map((s) => s.toString().toLowerCase())
      .filter(Boolean);

    const id = `${meta.type}:${meta.url}`;

    docs.push({
      id,
      url: meta.url,
      type: meta.type, // "country" | "program" | "article" | "news" | "media" | "blog" | "page"
      title,
      subtitle: subtitle || undefined,
      tags: tags.length ? tags : undefined,
      snippet: snippet || undefined,
      hero: hero || undefined,
      date: date || undefined,
      updated: updated || undefined,
      countries,
      programs,
    });
  }

  // Stable ordering: updated || date desc
  docs.sort((a, b) => {
    const da = new Date(a.updated || a.date || 0).getTime();
    const db = new Date(b.updated || b.date || 0).getTime();
    return db - da;
  });

  await fs.mkdir(publicDir, { recursive: true });
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    count: docs.length,
    docs,
  };
  await fs.writeFile(outputFile, JSON.stringify(payload), "utf8");
  console.log(
    `✓ search-index.json written (${docs.length} docs) -> ${path.relative(repoRoot, outputFile)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
