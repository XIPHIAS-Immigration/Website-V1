// src/app/(site)/media/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Dynamically import media detail components to reduce initial bundle size.
import nextDynamic from "next/dynamic";
const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));
import { getInsightBySlug } from "@/lib/insights-content";
import {
  insightMetadata,
  missingInsightMetadata,
} from "@/lib/seo/insight-metadata";

export const revalidate = 3600;

// Next 15: params is a Promise
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params; // ✅ await
  const record = await getInsightBySlug("media", slug);
  if (!record) return missingInsightMetadata();

  return insightMetadata(record);
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
