// src/app/(site)/articles/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { getInsightBySlug } from "@/lib/insights-content";
import {
  insightMetadata,
  missingInsightMetadata,
} from "@/lib/seo/insight-metadata";

const InsightDetailView = nextDynamic(() => import("@/components/Insights/InsightDetailView"));
const InsightJsonLd = nextDynamic(() => import("@/components/SEO/InsightJsonLd"));

export const runtime = "nodejs";
export const revalidate = 3600;

type Params = { slug: string };
type PageProps = { params: Params | Promise<Params> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const record = await getInsightBySlug("articles", slug);

  return record ? insightMetadata(record) : missingInsightMetadata();
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
