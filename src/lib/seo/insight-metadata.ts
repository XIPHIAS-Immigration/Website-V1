import type { Metadata } from "next";

import type { InsightMeta } from "@/types/insights";

const SITE_NAME = "XIPHIAS Immigration";
const DEFAULT_IMAGE = "/xiphias-immigration.png";

export function insightMetadata(record: InsightMeta): Metadata {
  const description =
    record.summary ||
    `Read ${record.title} from XIPHIAS Immigration's global mobility experts.`;
  const canonical = record.url;
  const image = record.hero || DEFAULT_IMAGE;
  const author = record.author || SITE_NAME;
  const openGraph: Metadata["openGraph"] =
    record.kind === "media"
      ? {
          title: record.title,
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
          title: record.title,
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
    title: { absolute: `${record.title} | ${SITE_NAME}` },
    description,
    keywords: record.tags?.length ? record.tags : undefined,
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
      title: record.title,
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
