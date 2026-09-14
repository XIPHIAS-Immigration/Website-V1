import type { Metadata } from "next";
import { notFound } from "next/navigation";

import GuideArticle from "@/components/Guides/GuideArticle";
import { getGuide } from "@/data/guides";

const SLUG = "crs-score-450-470-chances";
const guide = getGuide(SLUG);

export const revalidate = 86400;

export const metadata: Metadata = {
  title: guide?.title,
  description: guide?.description,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    title: guide?.title,
    description: guide?.description,
    url: `https://www.xiphiasimmigration.com/${SLUG}`,
    siteName: "XIPHIAS Immigration",
    type: "article",
    images: ["https://www.xiphiasimmigration.com/xiphias-immigration.png"],
  },
};

export default function Page() {
  if (!guide) notFound();
  return <GuideArticle guide={guide} />;
}
