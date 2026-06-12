// src/app/(site)/articles/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { getInsightBySlug } from "@/lib/insights-content";

const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));

const SITE_URL = "https://www.xiphiasimmigration.com";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { slug: string };
type PageProps = { params: Params | Promise<Params> };

const absUrl = (u: string) => (u.startsWith("http://") || u.startsWith("https://") ? u : `${SITE_URL}${u.startsWith("/") ? u : `/${u}`}`);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const record = await getInsightBySlug("articles", slug);

  if (!record) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = record.summary || `Article: ${record.title}`;

  const canonical = record.url ? absUrl(record.url) : `${SITE_URL}/articles/${slug}`;
  const hero = record.hero ? absUrl(record.hero) : undefined;

  return {
    title: record.title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: record.title,
      description,
      type: "article",
      url: canonical,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      images: hero
        ? [
            {
              url: hero,
              width: 1200,
              height: 630,
              alt: `${record.title} – XIPHIAS Immigration`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: hero ? "summary_large_image" : "summary",
      title: record.title,
      description,
      images: hero ? [hero] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  const record = await getInsightBySlug("articles", slug);

  if (!record) notFound();

  return (
    <>
      <InsightJsonLd record={record} />
      <InsightDetailView record={record} />
    </>
  );
}
