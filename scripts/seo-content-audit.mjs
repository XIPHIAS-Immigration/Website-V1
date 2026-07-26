import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const ROOT = process.cwd();
const NOW = new Date();
const OUTPUT_DIR = path.join(ROOT, "reports");
const KINDS = ["blog", "articles", "news", "media"];
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "best", "by", "for", "from", "guide",
  "how", "in", "is", "of", "on", "the", "to", "visa", "what", "why", "with",
  "xiphias", "immigration", "2023", "2024", "2025", "2026",
]);

function text(value) {
  return value == null ? "" : String(value).trim();
}

function list(value) {
  if (Array.isArray(value)) return value;
  return text(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHidden(data) {
  const visibility = text(data.visibility).toLowerCase();
  const status = text(data.status).toLowerCase();
  return data.draft === true || data.hidden === true || visibility === "draft" ||
    visibility === "hidden" || status === "draft" || status === "hidden";
}

function plainBody(source) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>#|~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicKey(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .sort()
    .slice(0, 8)
    .join(" ");
}

function ageMonths(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((NOW.getTime() - date.getTime()) / 2_629_800_000));
}

function sourceUrls(value) {
  return list(value)
    .map((item) => (item && typeof item === "object" ? text(item.url) : text(item)))
    .filter(Boolean);
}

function groupBy(items, keyFor) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFor(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

const files = await fg(KINDS.map((kind) => `content/${kind}/**/*.mdx`), {
  cwd: ROOT,
  absolute: true,
  onlyFiles: true,
});

const pages = files.map((file) => {
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = parsed.data || {};
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const [, kind, ...rest] = rel.split("/");
  const slug = path.basename(rest.at(-1) || "", ".mdx");
  const route = `/${kind}/${slug}`;
  const body = plainBody(parsed.content);
  const words = body ? body.split(/\s+/).length : 0;
  const title = text(data.title) || slug;
  const summary = text(data.seoDescription || data.metaDescription || data.summary || data.description);
  const seoTitle = text(data.seoTitle || data.metaTitle || title);
  const updated = text(data.lastReviewed || data.updated || data.lastmod || data.date);
  const monthsOld = ageMonths(updated);
  const officialSources = sourceUrls(data.officialSources);
  const primaryKeyword = text(data.primaryKeyword || data.targetKeyword);
  const issues = [];

  if (!summary) issues.push("missing description");
  if (seoTitle.length > 60) issues.push("title over 60 characters");
  if (summary.length > 160) issues.push("description over 160 characters");
  if (words < 600 && kind !== "news" && kind !== "media") issues.push("thin content");
  if (monthsOld == null) issues.push("missing review date");
  else if (monthsOld > 18) issues.push("stale content");
  if (!text(data.author)) issues.push("missing author");
  if (!text(data.reviewedBy || data.reviewer)) issues.push("missing reviewer");
  if (!officialSources.length && kind !== "media") issues.push("missing official sources");
  if (!primaryKeyword) issues.push("missing primary query");
  if (!list(data.tags).length) issues.push("missing tags");

  return {
    kind,
    slug,
    route,
    file: rel,
    title,
    seoTitle,
    descriptionLength: summary.length,
    wordCount: words,
    updated: updated || null,
    monthsOld,
    primaryKeyword: primaryKeyword || null,
    topicKey: topicKey(primaryKeyword || title),
    officialSourceCount: officialSources.length,
    hidden: isHidden(data),
    noindex: data.noindex === true || text(data.noindex).toLowerCase() === "true",
    bodyHash: crypto.createHash("sha1").update(body.toLowerCase()).digest("hex"),
    issues,
    riskScore: issues.length,
  };
});

const published = pages.filter((page) => !page.hidden);
const byHash = groupBy(published, (page) => page.bodyHash);
const exactDuplicates = [...byHash.values()]
  .filter((group) => group.length > 1 && group[0].wordCount > 50)
  .map((group) => group.map(({ route, file }) => ({ route, file })));

const byTopic = groupBy(
  published.filter((page) => page.topicKey.split(" ").length >= 3),
  (page) => page.topicKey,
);
const topicCollisions = [...byTopic.entries()]
  .filter(([, group]) => group.length > 1)
  .map(([key, group]) => ({
    key,
    pages: group.map(({ route, title, primaryKeyword }) => ({ route, title, primaryKeyword })),
  }));

const summary = {
  generatedAt: NOW.toISOString(),
  totalFiles: pages.length,
  publishedPages: published.length,
  hiddenPages: pages.length - published.length,
  thinPublishedPages: published.filter((page) => page.issues.includes("thin content")).length,
  stalePublishedPages: published.filter((page) => page.issues.includes("stale content")).length,
  missingOfficialSources: published.filter((page) => page.issues.includes("missing official sources")).length,
  missingPrimaryQuery: published.filter((page) => page.issues.includes("missing primary query")).length,
  exactDuplicateGroups: exactDuplicates.length,
  topicCollisionGroups: topicCollisions.length,
};

const report = {
  summary,
  exactDuplicates,
  topicCollisions,
  pages: published.sort((a, b) => b.riskScore - a.riskScore || a.route.localeCompare(b.route)),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_DIR, "seo-content-audit.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

const topRisks = report.pages.slice(0, 100);
const markdown = [
  "# SEO Content Audit",
  "",
  `Generated: ${summary.generatedAt}`,
  "",
  "## Summary",
  "",
  ...Object.entries(summary)
    .filter(([key]) => key !== "generatedAt")
    .map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Highest-risk pages",
  "",
  "| Route | Words | Age (months) | Issues |",
  "| --- | ---: | ---: | --- |",
  ...topRisks.map((page) =>
    `| ${page.route} | ${page.wordCount} | ${page.monthsOld ?? "n/a"} | ${page.issues.join(", ")} |`),
  "",
  "The JSON report contains the complete page inventory, duplicate groups and topic collisions.",
  "",
].join("\n");

fs.writeFileSync(path.join(OUTPUT_DIR, "seo-content-audit.md"), markdown);
console.log(JSON.stringify(summary, null, 2));
