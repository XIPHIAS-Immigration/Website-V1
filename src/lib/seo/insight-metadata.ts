import type { Metadata } from "next";

import type { InsightMeta } from "@/types/insights";

const SITE_NAME = "XIPHIAS Immigration";
const DEFAULT_IMAGE = "/xiphias-immigration.png";
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 158;

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const candidate = normalized.slice(0, maxLength + 1);
  const boundary = candidate.lastIndexOf(" ");
  const end = boundary >= Math.floor(maxLength * 0.7) ? boundary : maxLength;
  return candidate.slice(0, end).replace(/[,:;.!?\s]+$/, "").trim();
}

function metadataTitleFor(record: InsightMeta) {
  if (record.seoTitle) {
    return compactText(record.seoTitle, MAX_TITLE_LENGTH);
  }

  const base = record.title;
  if (/xiphias/i.test(base)) return compactText(base, MAX_TITLE_LENGTH);

  const branded = `${base} | ${SITE_NAME}`;
  return branded.length <= MAX_TITLE_LENGTH
    ? branded
    : compactText(base, MAX_TITLE_LENGTH);
}

export function insightMetadata(record: InsightMeta): Metadata {
  const description = compactText(
    record.seoDescription ||
      record.summary ||
      `Read ${record.title} from XIPHIAS Immigration's global mobility experts.`,
    MAX_DESCRIPTION_LENGTH,
  );
  const canonical = record.canonical || record.url;
  const image = record.hero || DEFAULT_IMAGE;
  const author = record.author || SITE_NAME;
  const pageTitle = record.seoTitle || record.title;
  const metadataTitle = metadataTitleFor(record);
  const keywords = Array.from(
    new Set([record.primaryKeyword, ...(record.tags || [])].filter(Boolean)),
  ) as string[];
  const openGraph: Metadata["openGraph"] =
    record.kind === "media"
      ? {
          title: pageTitle,
          description,
          type: "video.other",
          url: canonical,
          siteName: SITE_NAME,
          locale: "en_IN",
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: record.heroAlt || record.title,
            },
          ],
        }
      : {
          title: pageTitle,
          description,
          type: "article",
          url: canonical,
          siteName: SITE_NAME,
          locale: "en_IN",
          publishedTime: record.date,
          modifiedTime: record.updated || record.date,
          authors: [author],
          tags: record.tags,
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: record.heroAlt || record.title,
            },
          ],
        };

  return {
    title: { absolute: metadataTitle },
    description,
    keywords: keywords.length ? keywords : undefined,
    authors: [{ name: author }],
    alternates: { canonical },
    robots: record.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
    },
  };
}

export function missingInsightMetadata(): Metadata {
  return {
    title: { absolute: `Content not found | ${SITE_NAME}` },
    robots: { index: false, follow: false },
  };
}
