import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicReportProductBySlug, REPORT_PRODUCT_COPY } from "@/lib/payments/report-store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return REPORT_PRODUCT_COPY.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getPublicReportProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.shortTitle} | XIPHIAS Immigration Reports`,
    description: product.description,
    alternates: { canonical: `/reports/${product.slug}` },
  };
}

export default async function ReportProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getPublicReportProductBySlug(slug);
  if (!product) notFound();

  redirect(`/express-reports?report=${product.productType}`);
}
