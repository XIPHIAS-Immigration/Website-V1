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

function safeJsonStringify(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
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
      ? record.author === "XIPHIAS Immigration"
        ? { "@type": "Organization", "@id": `${base}/#organization` }
        : { "@type": "Person", name: record.author }
      : { "@type": "Organization", "@id": `${base}/#organization` },
    publisher: {
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: "XIPHIAS Immigration Private Limited",
      logo: {
        "@type": "ImageObject",
        url: `${base}/images/logo/xiphias-immigration.png`,
      },
    },
    keywords: Array.isArray(record.tags) && record.tags.length ? record.tags.join(", ") : undefined,
    articleSection: record.kind,
    about: [...(record.country || []), ...(record.program || [])].map((name) => ({
      "@type": "Thing",
      name,
    })),
    isAccessibleForFree: true,
    isPartOf: { "@id": `${base}/#website` },
    inLanguage: "en-IN",
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

  const sectionName =
    record.kind === "articles"
      ? "Articles"
      : record.kind.charAt(0).toUpperCase() + record.kind.slice(1);
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: base,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: sectionName,
        item: `${base}/${record.kind}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: record.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonStringify(breadcrumbs) }}
      />
    </>
  );
}
