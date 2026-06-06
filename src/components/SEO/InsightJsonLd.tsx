// src/components/SEO/InsightJsonLd.tsx
import type { InsightRecord } from "@/types/insights";
import { getSiteUrl } from "@/lib/seo/site";

function toAbsoluteUrl(input?: string) {
  if (!input) return undefined;
  const s = String(input).trim();
  if (!s) return undefined;
  if (/^https?:\/\//i.test(s)) return s;

  const base = getSiteUrl();
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
}

/**
 * Outputs JSON-LD for Article / NewsArticle / BlogPosting / VideoObject depending on kind.
 * Uses absolute URLs to avoid schema warnings.
 */
export default function InsightJsonLd({ record }: { record: InsightRecord }) {
  const base = getSiteUrl();

  const type =
    record.kind === "news"
      ? "NewsArticle"
      : record.kind === "blog"
        ? "BlogPosting"
        : record.kind === "media"
          ? "VideoObject"
          : "Article";

  const pageUrl = toAbsoluteUrl(record.url) ?? `${base}${record.url.startsWith("/") ? "" : "/"}${record.url}`;
  const heroUrl = toAbsoluteUrl(record.hero);
  const posterUrl = toAbsoluteUrl((record as any).heroPoster);
  const videoUrl = toAbsoluteUrl((record as any).heroVideo);

  const data: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${pageUrl}#${type.toLowerCase()}`,
    headline: record.title,
    name: record.title,
    description: record.summary || undefined,
    datePublished: record.date || undefined,
    dateModified: record.updated || record.date || undefined,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: record.author
      ? { "@type": "Person", name: record.author }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "XIPHIAS Immigration Private Limited",
      logo: {
        "@type": "ImageObject",
        url: `${base}/images/logo/xiphias-immigration.png`,
      },
    },
    keywords: Array.isArray(record.tags) && record.tags.length ? record.tags.join(", ") : undefined,
    inLanguage: "en",
  };

  // Images (Article/News/Blog)
  if (heroUrl) {
    data.image = [heroUrl];
  }

  // VideoObject enrichments (prevents common schema warnings)
  if (type === "VideoObject") {
    if (posterUrl || heroUrl) data.thumbnailUrl = [posterUrl || heroUrl];
    if (videoUrl) data.contentUrl = videoUrl;
    data.uploadDate = record.date || record.updated || undefined;

    // Optional: if you ever store an embed URL in frontmatter later, you can map it here:
    // const embedUrl = toAbsoluteUrl((record as any).embedUrl);
    // if (embedUrl) data.embedUrl = embedUrl;

    // For videos, schema.org prefers thumbnailUrl over image
    delete data.image;
  }

  // Remove undefined keys (clean output)
  for (const k of Object.keys(data)) {
    if (data[k] === undefined) delete data[k];
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}