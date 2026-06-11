import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

export type ContentAdminKind = "blog" | "articles" | "news";

export const CONTENT_ADMIN_KINDS: ContentAdminKind[] = ["blog", "articles", "news"];

type KindConfig = {
  label: string;
  contentDir: string;
  imageDir: string;
  urlBase: string;
};

const KIND_CONFIG: Record<ContentAdminKind, KindConfig> = {
  blog: {
    label: "Blog",
    contentDir: "blog",
    imageDir: "blogs",
    urlBase: "/blog",
  },
  articles: {
    label: "Articles",
    contentDir: "articles",
    imageDir: "articles",
    urlBase: "/articles",
  },
  news: {
    label: "News",
    contentDir: "news",
    imageDir: "news",
    urlBase: "/news",
  },
};

const CONTENT_ROOT = path.join(process.cwd(), "content");
const PUBLIC_IMAGES_ROOT = path.join(process.cwd(), "public", "images");
const DEFAULT_RUNTIME_ROOT = path.join(process.cwd(), ".xiphias-platform", "content-admin");
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/svg+xml", ".svg"],
]);
const IMAGE_CONTENT_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
]);

export type ContentAdminItem = {
  kind: ContentAdminKind;
  kindLabel: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  date: string;
  updated: string;
  hero: string;
  heroAlt: string;
  tags: string[];
  countries: string[];
  programs: string[];
  seoTitle: string;
  seoDescription: string;
  url: string;
  wordCount: number;
  visibility: "public" | "hidden";
  status: "ready" | "needs-review" | "hidden";
};

export type SaveContentAdminInput = {
  originalKind?: string;
  originalSlug?: string;
  kind?: string;
  title?: string;
  slug?: string;
  summary?: string;
  body?: string;
  author?: string;
  date?: string;
  updated?: string;
  hero?: string;
  heroAlt?: string;
  tags?: string[] | string;
  countries?: string[] | string;
  programs?: string[] | string;
  seoTitle?: string;
  seoDescription?: string;
  visibility?: string;
};

type UploadLike = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type PersistedContentEntry = {
  kind: ContentAdminKind;
  slug: string;
  source?: string;
  deleted?: boolean;
  updatedAt: string;
};

type PersistedContentStore = {
  version: 1;
  items: PersistedContentEntry[];
};

export type ContentAdminRuntimeSource = {
  kind: ContentAdminKind;
  slug: string;
  source: string;
  filePath: string;
};

export function isContentAdminKind(value: unknown): value is ContentAdminKind {
  return CONTENT_ADMIN_KINDS.includes(value as ContentAdminKind);
}

export function getContentAdminKindConfig(kind: ContentAdminKind) {
  return KIND_CONFIG[kind];
}

function assertInside(parent: string, child: string) {
  const relative = path.relative(parent, child);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid path");
  }
}

function contentDirForKind(kind: ContentAdminKind) {
  const dir = path.join(CONTENT_ROOT, KIND_CONFIG[kind].contentDir);
  assertInside(CONTENT_ROOT, dir);
  return dir;
}

function imageDirForKind(kind: ContentAdminKind) {
  const dir = path.join(PUBLIC_IMAGES_ROOT, KIND_CONFIG[kind].imageDir);
  assertInside(PUBLIC_IMAGES_ROOT, dir);
  return dir;
}

function runtimeRoot() {
  return path.resolve(process.env.CONTENT_ADMIN_DATA_DIR?.trim() || DEFAULT_RUNTIME_ROOT);
}

function runtimeContentFile() {
  return path.join(runtimeRoot(), "content.json");
}

function runtimeAssetsRoot() {
  return path.join(runtimeRoot(), "assets");
}

function runtimeImageDirForKind(kind: ContentAdminKind) {
  const root = runtimeAssetsRoot();
  const dir = path.join(root, KIND_CONFIG[kind].imageDir);
  assertInside(root, dir);
  return dir;
}

function runtimeContentPath(kind: ContentAdminKind, slug: string) {
  return path.join(runtimeRoot(), "content", KIND_CONFIG[kind].contentDir, `${slug}.mdx`);
}

function runtimeKey(kind: ContentAdminKind, slug: string) {
  return `${kind}:${slug}`;
}

async function readPersistedContentStore(): Promise<PersistedContentStore> {
  try {
    const raw = await fs.readFile(runtimeContentFile(), "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedContentStore>;
    const items = Array.isArray(parsed.items)
      ? parsed.items
          .filter((item): item is PersistedContentEntry => {
            if (!item || typeof item !== "object") return false;
            if (!isContentAdminKind((item as PersistedContentEntry).kind)) return false;
            return Boolean(coerceString((item as PersistedContentEntry).slug));
          })
          .map((item) => ({
            kind: item.kind,
            slug: slugifyContent(item.slug),
            source: typeof item.source === "string" ? item.source : undefined,
            deleted: item.deleted === true,
            updatedAt: coerceString(item.updatedAt) || new Date().toISOString(),
          }))
      : [];

    return { version: 1, items };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ENOENT") return { version: 1, items: [] };
    throw error;
  }
}

async function writePersistedContentStore(store: PersistedContentStore) {
  const filePath = runtimeContentFile();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
}

async function saveRuntimeContent(kind: ContentAdminKind, slug: string, source: string) {
  const store = await readPersistedContentStore();
  const key = runtimeKey(kind, slug);
  const nextEntry: PersistedContentEntry = {
    kind,
    slug,
    source,
    deleted: false,
    updatedAt: new Date().toISOString(),
  };

  const nextItems = store.items.filter((item) => runtimeKey(item.kind, item.slug) !== key);
  nextItems.push(nextEntry);
  await writePersistedContentStore({ version: 1, items: nextItems });
}

async function markRuntimeContentDeleted(kind: ContentAdminKind, slug: string) {
  const store = await readPersistedContentStore();
  const key = runtimeKey(kind, slug);
  const nextItems = store.items.filter((item) => runtimeKey(item.kind, item.slug) !== key);
  nextItems.push({
    kind,
    slug,
    deleted: true,
    updatedAt: new Date().toISOString(),
  });
  await writePersistedContentStore({ version: 1, items: nextItems });
}

async function bundledContentExists(kind: ContentAdminKind, slug: string) {
  const dir = contentDirForKind(kind);
  const filePath = path.join(dir, `${slug}.mdx`);
  assertInside(dir, filePath);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function slugifyContent(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "untitled";
}

function coerceString(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function coerceArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => coerceString(item)).filter(Boolean);
  }
  return coerceString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    const next = coerceString(value);
    if (next) return next;
  }
  return "";
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function previewFromBody(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function isHiddenFrontmatter(data: Record<string, unknown>) {
  return (
    data.draft === true ||
    data.hidden === true ||
    coerceString(data.visibility).toLowerCase() === "hidden" ||
    coerceString(data.status).toLowerCase() === "hidden"
  );
}

function normalizeDate(value: unknown) {
  const raw = coerceString(value);
  if (!raw) return "";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString().slice(0, 10);
}

function getUrl(kind: ContentAdminKind, slug: string) {
  return `${KIND_CONFIG[kind].urlBase}/${slug}`;
}

function itemFromFile(kind: ContentAdminKind, filePath: string, source: string): ContentAdminItem {
  const parsed = matter(source);
  const data = parsed.data as Record<string, unknown>;
  const slug = path.basename(filePath).replace(/(?:\.mdx)+$/i, "");
  const title = firstString(data.title, slug);
  const summary = firstString(data.summary, data.excerpt, data.description, previewFromBody(parsed.content));
  const hero = firstString(
    data.hero,
    data.heroImage,
    data.cover,
    data.coverImage,
    data.featuredImage,
    data.image,
    data.thumbnail,
  );

  const wordCount = countWords(parsed.content);
  const visibility = isHiddenFrontmatter(data) ? "hidden" : "public";

  return {
    kind,
    kindLabel: KIND_CONFIG[kind].label,
    slug,
    title,
    summary,
    body: parsed.content.trim(),
    author: firstString(data.author, "XIPHIAS Immigration"),
    date: normalizeDate(data.date),
    updated: normalizeDate(data.updated || data.lastmod),
    hero,
    heroAlt: firstString(data.heroAlt, data.imageAlt, title),
    tags: coerceArray(data.tags),
    countries: coerceArray(data.countries || data.country),
    programs: coerceArray(data.programs || data.program),
    seoTitle: firstString(data.seoTitle, data.metaTitle, title),
    seoDescription: firstString(data.seoDescription, data.metaDescription, summary),
    url: getUrl(kind, slug),
    wordCount,
    visibility,
    status: visibility === "hidden" ? "hidden" : title && summary && parsed.content.trim() ? "ready" : "needs-review",
  };
}

export async function listContentAdminItems() {
  const patterns = CONTENT_ADMIN_KINDS.map((kind) => `content/${KIND_CONFIG[kind].contentDir}/**/*.mdx`);
  const files = await fg(patterns, {
    cwd: process.cwd(),
    absolute: true,
    dot: false,
    onlyFiles: true,
  });

  const itemsByKey = new Map<string, ContentAdminItem>();

  for (const filePath of files) {
    const relFromContent = path.relative(CONTENT_ROOT, filePath);
    const kindDir = relFromContent.split(path.sep)[0];
    const kind = CONTENT_ADMIN_KINDS.find((entry) => KIND_CONFIG[entry].contentDir === kindDir);
    if (!kind) continue;

    const source = await fs.readFile(filePath, "utf8");
    const item = itemFromFile(kind, filePath, source);
    itemsByKey.set(runtimeKey(kind, item.slug), item);
  }

  const runtimeStore = await readPersistedContentStore();
  for (const entry of runtimeStore.items) {
    const key = runtimeKey(entry.kind, entry.slug);
    if (entry.deleted) {
      itemsByKey.delete(key);
      continue;
    }
    if (!entry.source) continue;
    itemsByKey.set(entry.kind + ":" + entry.slug, itemFromFile(entry.kind, runtimeContentPath(entry.kind, entry.slug), entry.source));
  }

  return Array.from(itemsByKey.values()).sort((left, right) => {
    const leftDate = Date.parse(left.updated || left.date || "");
    const rightDate = Date.parse(right.updated || right.date || "");
    return (Number.isFinite(rightDate) ? rightDate : 0) - (Number.isFinite(leftDate) ? leftDate : 0);
  });
}

async function getExistingSlugs(kind: ContentAdminKind, exceptSlug?: string) {
  const dir = contentDirForKind(kind);
  const files = await fg("**/*.mdx", {
    cwd: dir,
    absolute: false,
    dot: false,
    onlyFiles: true,
  });

  return new Set(
    files
      .map((file) => path.basename(file).replace(/(?:\.mdx)+$/i, ""))
      .filter((slug) => slug !== exceptSlug),
  );
}

async function getAllExistingSlugs(kind: ContentAdminKind, exceptSlug?: string) {
  const existing = await getExistingSlugs(kind, exceptSlug);
  const runtimeStore = await readPersistedContentStore();
  for (const entry of runtimeStore.items) {
    if (entry.kind !== kind || entry.deleted || entry.slug === exceptSlug) continue;
    existing.add(entry.slug);
  }
  return existing;
}

function ensureUniqueSlug(baseSlug: string, existing: Set<string>) {
  let slug = slugifyContent(baseSlug);
  let suffix = 2;
  while (existing.has(slug)) {
    slug = `${slugifyContent(baseSlug)}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function compactFrontmatter(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }),
  );
}

export async function saveContentAdminItem(input: SaveContentAdminInput) {
  const kind = isContentAdminKind(input.kind) ? input.kind : "blog";
  const title = coerceString(input.title);
  if (!title) throw new Error("Title is required");

  const sameFileSlug =
    input.originalKind === kind && input.originalSlug ? slugifyContent(input.originalSlug) : undefined;
  const existing = await getAllExistingSlugs(kind, sameFileSlug);
  const slug = ensureUniqueSlug(input.slug || title, existing);

  const today = new Date().toISOString().slice(0, 10);
  const body =
    coerceString(input.body) ||
    `## Overview\n\nWrite the full ${KIND_CONFIG[kind].label.toLowerCase()} content here.\n`;

  const summary = coerceString(input.summary) || previewFromBody(body);
  const visibility = coerceString(input.visibility).toLowerCase() === "hidden" ? "hidden" : "public";
  const frontmatter = compactFrontmatter({
    title,
    slug,
    date: normalizeDate(input.date) || today,
    updated: normalizeDate(input.updated) || today,
    summary,
    visibility,
    status: visibility === "hidden" ? "hidden" : "published",
    draft: visibility === "hidden" ? true : undefined,
    hero: coerceString(input.hero),
    heroAlt: coerceString(input.heroAlt) || title,
    tags: coerceArray(input.tags),
    countries: coerceArray(input.countries),
    programs: coerceArray(input.programs),
    author: coerceString(input.author) || "XIPHIAS Immigration",
    seoTitle: coerceString(input.seoTitle),
    seoDescription: coerceString(input.seoDescription),
  });

  const file = matter.stringify(`${body.trim()}\n`, frontmatter);
  await saveRuntimeContent(kind, slug, file);

  if (input.originalKind && input.originalSlug) {
    const originalKind = isContentAdminKind(input.originalKind) ? input.originalKind : null;
    const originalSlug = slugifyContent(input.originalSlug);
    if (originalKind && (originalKind !== kind || originalSlug !== slug)) {
      await markRuntimeContentDeleted(originalKind, originalSlug);
    }
  }

  return itemFromFile(kind, runtimeContentPath(kind, slug), file);
}

export async function deleteContentAdminItem(kindValue: unknown, slugValue: unknown) {
  const kind = isContentAdminKind(kindValue) ? kindValue : null;
  const slug = slugifyContent(coerceString(slugValue));
  if (!kind || !slug) throw new Error("Valid content type and slug are required.");

  const runtimeStore = await readPersistedContentStore();
  const runtimeExists = runtimeStore.items.some((item) => item.kind === kind && item.slug === slug && !item.deleted);
  const fileExists = await bundledContentExists(kind, slug);
  if (!runtimeExists && !fileExists) throw new Error("Content item was not found.");

  await markRuntimeContentDeleted(kind, slug);

  return { kind, slug };
}

export async function saveContentAdminImage(kindValue: unknown, file: UploadLike) {
  const kind = isContentAdminKind(kindValue) ? kindValue : "blog";
  const expectedExt = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!expectedExt) throw new Error("Only JPG, PNG, WEBP, and SVG images are supported");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be 8MB or smaller");

  const originalName = file.name.replace(/\.[^.]+$/, "");
  const baseName = slugifyContent(originalName || "content-image");
  const fileName = `${baseName}-${Date.now()}${expectedExt}`;
  const dir = runtimeImageDirForKind(kind);
  const filePath = path.join(dir, fileName);
  assertInside(dir, filePath);

  await fs.mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, bytes);

  return {
    url: `/images/${KIND_CONFIG[kind].imageDir}/${fileName}`,
    fileName,
  };
}

export async function listContentAdminRuntimeSources(): Promise<ContentAdminRuntimeSource[]> {
  const store = await readPersistedContentStore();
  return store.items
    .filter((entry) => !entry.deleted && Boolean(entry.source))
    .map((entry) => ({
      kind: entry.kind,
      slug: entry.slug,
      source: entry.source || "",
      filePath: runtimeContentPath(entry.kind, entry.slug),
    }));
}

export async function listDeletedContentAdminKeys() {
  const store = await readPersistedContentStore();
  return store.items.filter((entry) => entry.deleted).map((entry) => runtimeKey(entry.kind, entry.slug));
}

function kindFromImageBucket(value: unknown): ContentAdminKind | null {
  const bucket = coerceString(value).toLowerCase();
  const match = CONTENT_ADMIN_KINDS.find((kind) => KIND_CONFIG[kind].imageDir === bucket || kind === bucket);
  return match || null;
}

async function readPublicImage(bucketValue: unknown, fileNameValue: unknown) {
  const bucket = coerceString(bucketValue).toLowerCase();
  const fileName = coerceString(fileNameValue);
  if (!bucket || !fileName || bucket.includes("/") || bucket.includes("\\") || fileName.includes("/") || fileName.includes("\\")) {
    return null;
  }

  const ext = path.extname(fileName).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPES.get(ext);
  if (!contentType) return null;

  const filePath = path.join(PUBLIC_IMAGES_ROOT, bucket, fileName);
  assertInside(PUBLIC_IMAGES_ROOT, filePath);

  try {
    const bytes = await fs.readFile(filePath);
    return { bytes, contentType, fileName };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ENOENT") return null;
    throw error;
  }
}

export async function readContentAdminImage(bucketValue: unknown, fileNameValue: unknown) {
  const kind = kindFromImageBucket(bucketValue);
  const fileName = coerceString(fileNameValue);
  if (!fileName || fileName.includes("/") || fileName.includes("\\")) return null;

  const ext = path.extname(fileName).toLowerCase();
  const contentType = IMAGE_CONTENT_TYPES.get(ext);
  if (!contentType) return null;

  if (!kind) return readPublicImage(bucketValue, fileNameValue);

  const dir = runtimeImageDirForKind(kind);
  const filePath = path.join(dir, fileName);
  assertInside(dir, filePath);

  try {
    const bytes = await fs.readFile(filePath);
    return { bytes, contentType, fileName };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "ENOENT") return readPublicImage(bucketValue, fileNameValue);
    throw error;
  }
}
