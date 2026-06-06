// src/app/(site)/media/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Dynamically import media detail components to reduce initial bundle size.
import nextDynamic from "next/dynamic";
const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));
import { getInsightBySlug } from "@/lib/insights-content";

export const revalidate = 86400;

// Next 15: params is a Promise
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; // ✅ await
  const record = await getInsightBySlug("media", slug);
  if (!record) return { title: "Not Found" };

  const description = record.summary || `Media: ${record.title}`;
  return {
    title: record.title,
    description,
    alternates: { canonical: record.url },
    openGraph: {
      title: record.title,
      description,
      type: "video.other",
      url: record.url,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      images: record.hero
        ? [
            {
              url: record.hero,
              width: 1200,
              height: 630,
              alt: `${record.title} – XIPHIAS Immigration`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: record.hero ? "summary_large_image" : "summary",
      title: record.title,
      description,
      images: record.hero ? [record.hero] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params; // ✅ await
  const record = await getInsightBySlug("media", slug);
  if (!record) return notFound(); // ✅ proper 404

  return (
    <>
      <InsightJsonLd record={record} />
      <InsightDetailView record={record} />
    </>
  );
}