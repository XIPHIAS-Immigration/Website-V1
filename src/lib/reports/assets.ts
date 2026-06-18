import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

// Image loading for reports: reads files under the repo's public/ folder and returns
// base64 data URIs so headless Chromium can embed them without network access. All
// loaders fall back gracefully (return null) when an asset is missing.

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

// Extensions tried for any base image name, in priority order.
const EXTS = [".jpg", ".jpeg", ".avif", ".webp", ".png"];

// Per-image processing options.
//  - maxPx: long-edge cap for downscaling large sources.
//  - quality: JPEG quality.
//  - minPx: if set and the source's long edge is smaller, the image is ENLARGED up to
//    this size (used only for the small cover portrait so a full-bleed page is less soft).
type ImgOpts = { maxPx?: number; quality?: number; minPx?: number };

// Reports embed images full-bleed on A4 (≈2300px tall at ~200dpi) and in tall side
// panels, so images must carry enough resolution or the PDF renderer upscales them and
// they look blurry. Photos are sized to ≤2560px long-edge at JPEG q82 with a light sharpen
// (crisp but still email-friendly); logos stay small transparent PNGs. Falls back to a raw
// embed if sharp can't process the file.
async function readDataUri(absPath: string, opts: ImgOpts = {}): Promise<string | null> {
  const { maxPx = 2560, quality = 82, minPx } = opts;
  const ext = path.extname(absPath).toLowerCase();
  try {
    if (ext === ".svg") {
      const buf = await fs.readFile(absPath);
      return `data:image/svg+xml;base64,${buf.toString("base64")}`;
    }
    if (ext === ".png") {
      // Keep transparency (logos) — resize + recompress only.
      const out = await sharp(absPath)
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer();
      return `data:image/png;base64,${out.toString("base64")}`;
    }
    // Decide the long-edge target: downscale big sources to maxPx; only enlarge (up to
    // minPx) when explicitly allowed and the source is smaller than the display needs it.
    const meta = await sharp(absPath).metadata();
    const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
    let targetLong = longEdge > 0 ? Math.min(maxPx, longEdge) : maxPx;
    if (minPx && longEdge > 0 && longEdge < minPx) targetLong = minPx;
    const out = await sharp(absPath)
      .rotate()
      .resize({ width: targetLong, height: targetLong, fit: "inside", withoutEnlargement: false })
      .sharpen({ sigma: 0.6 })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    try {
      const buf = await fs.readFile(absPath);
      const mime = MIME[ext] ?? "application/octet-stream";
      return `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      return null;
    }
  }
}

async function firstExisting(relPaths: string[], opts?: ImgOpts): Promise<string | null> {
  for (const rel of relPaths) {
    const uri = await readDataUri(path.join(process.cwd(), rel), opts);
    if (uri) return uri;
  }
  return null;
}

export function countrySlug(country?: string): string {
  return (country ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Map free-text / canonical country slugs to the actual report-assets folder names.
const SLUG_ALIASES: Record<string, string> = {
  "united-states": "usa",
  "united-states-of-america": "usa",
  us: "usa",
  "u-s": "usa",
  "u-s-a": "usa",
  america: "usa",
  "united-kingdom": "uk",
  "u-k": "uk",
  britain: "uk",
  "great-britain": "uk",
  england: "uk",
  "united-arab-emirates": "uae",
  dubai: "uae",
  "abu-dhabi": "uae",
  "saint-kitts-and-nevis": "saintkitts",
  "st-kitts-and-nevis": "saintkitts",
  "saint-kitts-nevis": "saintkitts",
  "st-kitts-nevis": "saintkitts",
  "saint-kitts": "saintkitts",
  "st-kitts": "saintkitts",
  "st-lucia": "saint-lucia",
  "antigua-and-barbuda": "antigua-barbuda",
  antigua: "antigua-barbuda",
  "sao-tome-and-principe": "saotome",
  "sao-tome": "saotome",
  "sao-tome-principe": "saotome",
};

// Candidate folder slugs to try for a country, most specific first.
function slugCandidates(country?: string): string[] {
  const base = countrySlug(country);
  if (!base) return [];
  const aliased = SLUG_ALIASES[base];
  return [...new Set(aliased ? [aliased, base] : [base])];
}

// Build candidate relative paths from a directory + base names, across all extensions.
function expand(dir: string, names: string[]): string[] {
  const paths: string[] = [];
  for (const name of names) for (const ext of EXTS) paths.push(`${dir}/${name}${ext}`);
  return paths;
}

export async function loadLogo(): Promise<string | null> {
  return firstExisting([
    "public/images/logo/xiphias-immigration-white.png",
    "public/images/logo/xiphias-immigration.png",
    "public/xiphias-immigration.png",
  ]);
}

// Consistent premium cover portrait used as the full-bleed background on every report's
// first page (matches the flagship strategy report). Drop a custom image at
// public/images/report-assets/_cover/cover.{jpg,avif,webp,png} to override globally.
export async function loadCoverBg(): Promise<string | null> {
  // The cover portrait is shown full-bleed on A4. If the supplied file is small (the
  // current _cover/cover.jpeg is only 800px), enlarge it toward 1800px so the page reads
  // sharper; high-res sources are still capped at maxPx. A higher-resolution portrait
  // dropped at report-assets/_cover/ will always look best.
  return firstExisting(
    [
      ...expand("public/images/report-assets/_cover", ["cover", "portrait", "hero"]),
      "public/images/avtar/varun-singh-md-xiphias.jpg",
      "public/images/articles/xiphias-immigration.jpg",
    ],
    { maxPx: 2400, quality: 84, minPx: 1800 },
  );
}

// Country-specific image for the cover card and inner hero band. Resolves the
// report-assets/{country}/ photo the user supplied (any of jpg/avif/webp/png), with
// graceful fallback to existing skilled/residency imagery and a generic brand image.
export async function loadCountryHero(country?: string): Promise<string | null> {
  const list: string[] = [];
  for (const slug of slugCandidates(country)) {
    list.push(...expand(`public/images/report-assets/${slug}`, ["cover", "img1", "hero", "city", "landmark"]));
    list.push(...expand(`public/images/skilled/${slug}`, [slug]));
    list.push(...expand(`public/images/residency/${slug}`, [slug]));
  }
  list.push("public/images/articles/xiphias-immigration.jpg");
  return firstExisting(list);
}

// List image files in a directory (relative to repo root), sorted, or [] if missing.
async function listDir(relDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(path.join(process.cwd(), relDir));
    return entries
      .filter((e) => EXTS.includes(path.extname(e).toLowerCase()))
      .sort()
      .map((e) => `${relDir}/${e}`);
  } catch {
    return [];
  }
}

function coverRank(p: string): number {
  const f = p.toLowerCase();
  if (/\/cover\.[a-z0-9]+$/.test(f)) return 0;
  if (/\/hero\.[a-z0-9]+$/.test(f)) return 1;
  return 2;
}

/**
 * An ordered, de-duplicated set of DISTINCT country image data URIs so report pages
 * never repeat the same photo:
 *   [0]   = the dedicated `report-assets/{country}` image (intended for the page-2 hero),
 *   [1..] = other photos of that country/programme from the residency / citizenship /
 *           skilled / corporate libraries (each of which holds several images per country).
 * Falls back to a generic brand image if nothing matches. Capped to keep PDF size sane.
 */
export async function loadCountryImages(country?: string): Promise<string[]> {
  const reportAssets: string[] = [];
  const track: string[] = [];
  for (const slug of slugCandidates(country)) {
    reportAssets.push(...(await listDir(`public/images/report-assets/${slug}`)));
    for (const base of ["residency", "citizenship", "skilled", "corporate"]) {
      track.push(...(await listDir(`public/images/${base}/${slug}`)));
    }
  }
  reportAssets.sort((a, b) => coverRank(a) - coverRank(b));

  const ordered = [...new Set([...reportAssets, ...track])].slice(0, 8);
  const uris: string[] = [];
  for (const rel of ordered) {
    const uri = await readDataUri(path.join(process.cwd(), rel));
    if (uri) uris.push(uri);
  }
  if (uris.length) return uris;
  const fallback = await readDataUri(path.join(process.cwd(), "public/images/articles/xiphias-immigration.jpg"));
  return fallback ? [fallback] : [];
}
