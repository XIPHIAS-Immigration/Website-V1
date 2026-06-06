// src/app/(site)/gallery/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import GalleryGrid from "@/components/Gallery/GalleryGrid";
import { getGallery } from "@/lib/gallery";
import Breadcrumb from "@/components/Common/Breadcrumb";

export const revalidate = 600; // cache at the edge for 10 mins

type HeadersLike = { get(name: string): string | null };

function getOriginFromHeaders(h: HeadersLike): string {
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

function getSiteOrigin(h: HeadersLike): string {
  // Prefer env for stable, correct canonical URLs in production
  const envSite =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (envSite) {
    // normalize
    const site = envSite.startsWith("http") ? envSite : `https://${envSite}`;
    return site.replace(/\/$/, "");
  }

  // fallback (dev / local / unknown host)
  return getOriginFromHeaders(h).replace(/\/$/, "");
}

// ---- Dynamic metadata (OG/Twitter), built from images ----
export async function generateMetadata(): Promise<Metadata> {
  const items = await getGallery();

  const h = await headers();
  const origin = getSiteOrigin(h);

  const ogImages = items.slice(0, 6).map((it) => {
    const url = it.src.startsWith("http") ? it.src : `${origin}${it.src}`;
    return { url, width: it.w || 1200, height: it.h || 630, alt: it.alt || "Gallery image" };
  });

  const title = "Gallery | XIPHIAS Immigration";
  const description =
    "Event highlights, team moments, office culture and CSR activities. Fast, mobile-first gallery.";

  return {
    title,
    description,
    alternates: { canonical: `${origin}/gallery` }, // ✅ absolute
    openGraph: {
      type: "website",
      url: `${origin}/gallery`,
      title,
      description: "Event highlights, team moments, office culture and CSR activities.",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: "Event highlights, team moments, office culture and CSR activities.",
      images: ogImages.length ? [ogImages[0].url] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function GalleryPage() {
  const items = await getGallery();

  const h = await headers();
  const origin = getSiteOrigin(h);

  // JSON-LD (CollectionPage + ImageGallery + Breadcrumbs)
  const imagesForLD = items.slice(0, 12).map((it) => ({
    "@type": "ImageObject",
    contentUrl: it.src.startsWith("http") ? it.src : `${origin}${it.src}`,
    caption: it.caption || it.alt || "Gallery image",
    representativeOfPage: false,
    width: it.w,
    height: it.h,
  }));

  const collectionLD = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Gallery",
    url: `${origin}/gallery`,
    description: "Photos from events, team, office and CSR at XIPHIAS Immigration.",
    hasPart: {
      "@type": "ImageGallery",
      name: "Gallery Images",
      image: imagesForLD,
    },
  };

  const breadcrumbLD = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Gallery", item: `${origin}/gallery` },
    ],
  };

  return (
    <section className="mx-auto max-w-screen-2xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header matches your Hero/slider styling */}
      <div
        className={[
          "relative overflow-hidden rounded-3xl p-5 lg:p-6 mb-5 md:mb-8 mt-3",
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
          "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
          "text-black dark:text-white",
        ].join(" ")}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            Gallery
          </span>
          <p className="text-[12px] text-slate-700 dark:text-slate-200">
            Events • Team • Office • CSR — mobile-first & fast
          </p>
        </div>
      </div>

      <GalleryGrid items={items} />

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD needs raw string
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLD) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD needs raw string
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLD) }}
      />
    </section>
  );
}