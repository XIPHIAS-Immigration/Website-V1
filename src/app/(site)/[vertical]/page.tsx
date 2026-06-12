// ✅ src/app/(site)/[vertical]/page.tsx
// Vertical index: lists countries for a given vertical

import { getAllContentCached } from "@/lib/content";
import type { Metadata } from "next";
import type { Vertical, ProgramDoc } from "@/lib/content/types";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd, breadcrumbLd } from "@/lib/seo"; // ✅ add

export const runtime = "nodejs"; // ensure Node.js runtime on Vercel (fs OK)

const VERTICALS: Vertical[] = ["residency", "citizenship", "skilled", "corporate"];

export function generateStaticParams() {
  return VERTICALS.map((v) => ({ vertical: v }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: { vertical: Vertical };
}): Promise<Metadata> {
  const { vertical } = params;
  if (!VERTICALS.includes(vertical)) {
    return { title: "Not found" };
  }

  const capVertical = vertical.charAt(0).toUpperCase() + vertical.slice(1);
  const title = `${capVertical} Programs by Country`;
  const description = `Browse ${vertical} programs, grouped by country.`;
  const canonicalPath = `/${vertical}`;
  const canonicalUrl = `https://www.xiphiasimmigration.com${canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/xiphias-immigration.png",
          width: 1200,
          height: 630,
          alt: `${title} – XIPHIAS Immigration`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/xiphias-immigration.png"],
    },
  };
}

export default function VerticalPage({
  params,
}: {
  params: { vertical: Vertical };
}) {
  const { vertical } = params;

  // Extra guard (helps keep logs clean on Vercel)
  if (!VERTICALS.includes(vertical)) return notFound();

  const docs = getAllContentCached();

  // Narrow AnyDoc -> ProgramDoc
  const programs = docs.filter(
    (d): d is ProgramDoc => d.kind === "program" && d.vertical === vertical
  );

  // Aggregate counts by country
  const byCountry = new Map<string, number>();
  for (const p of programs) {
    if (!p.country) continue; // safety
    byCountry.set(p.country, (byCountry.get(p.country) ?? 0) + 1);
  }

  const countries = [...byCountry.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const capVertical = vertical.charAt(0).toUpperCase() + vertical.slice(1);

  // ✅ Breadcrumb JSON-LD (absolute URLs + valid schema format)
  const breadcrumbJsonLd = breadcrumbLd([
    { name: "Home", url: "/" },
    { name: capVertical, url: `/${vertical}` },
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      {/* ✅ JSON-LD */}
      <JsonLd data={breadcrumbJsonLd} />

      <h1 className="text-3xl font-semibold capitalize">{vertical}</h1>

      {countries.length === 0 ? (
        <p className="text-neutral-600">No programs available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map(([country, count]) => (
            <Link
              key={country}
              href={`/${vertical}/${country}`}
              className="rounded-2xl border p-5 transition hover:bg-gray-50"
            >
              <div className="text-xl font-medium capitalize">{country}</div>
              <div className="text-sm opacity-70">{count} programs</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
