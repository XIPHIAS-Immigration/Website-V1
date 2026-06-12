// src/app/(site)/news/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Dynamically import news detail components to reduce initial bundle size.
import nextDynamic from "next/dynamic";
const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));
import { getInsightBySlug } from "@/lib/insights-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// In Next 15, params is a Promise
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await getInsightBySlug("news", slug);
  if (!record) return { title: "Not Found" };

  const description = record.summary || `News: ${record.title}`;
  return {
    title: record.title,
    description,
    alternates: { canonical: record.url },
    openGraph: {
      title: record.title,
      description,
      type: "article",
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
  const { slug } = await params;
  const record = await getInsightBySlug("news", slug);
  if (!record) return notFound();

  return (
    <>
      <InsightJsonLd record={record} />
      <InsightDetailView record={record} />
    </>
  );
}
