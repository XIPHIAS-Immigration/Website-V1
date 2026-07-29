// src/app/(site)/news/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// Dynamically import news detail components to reduce initial bundle size.
import nextDynamic from "next/dynamic";
const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));
import { getInsightBySlug } from "@/lib/insights-content";
import {
  insightMetadata,
  missingInsightMetadata,
} from "@/lib/seo/insight-metadata";

export const runtime = "nodejs";
export const revalidate = 3600;

// In Next 15, params is a Promise
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = await getInsightBySlug("news", slug);
  if (!record) return missingInsightMetadata();

  return insightMetadata(record);
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
