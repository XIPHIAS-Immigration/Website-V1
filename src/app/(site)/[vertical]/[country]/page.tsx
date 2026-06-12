// ✅ src/app/(site)/[vertical]/[country]/page.tsx
// Country index: lists programs in a country for the given vertical

import { getAllContentCached } from "@/lib/content";
import type { Vertical, ProgramDoc } from "@/lib/content/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";

import { JsonLd, breadcrumbLd } from "@/lib/seo"; // ✅ add

export const runtime = "nodejs";

const VERTICALS: Vertical[] = ["residency", "citizenship", "skilled", "corporate"];

// Build the list of (vertical,country) pairs from the filesystem only.
// This avoids any hidden assumptions in getAllContentCached during prerender on Vercel.
export async function generateStaticParams() {
  const root = path.join(process.cwd(), "content");
  const out: Array<{ vertical: string; country: string }> = [];

  for (const vertical of VERTICALS) {
    const vDir = path.join(root, vertical);

    let entries: Array<{ name: string; isDirectory: () => boolean }> = [];
    try {
      const dirents = await fs.readdir(vDir, { withFileTypes: true });
      entries = dirents.filter((e) => e.isDirectory());
    } catch {
      // vertical folder may not exist yet in content/ — skip gracefully
      continue;
    }

    for (const entry of entries) {
      const country = entry.name;
      try {
        const files = await fs.readdir(path.join(vDir, country));
        // Only include countries that actually have at least one .mdx program file
        if (files.some((f) => f.endsWith(".mdx"))) {
          out.push({ vertical, country });
        }
      } catch {
        // no files or unreadable; skip
        continue;
      }
    }
  }

  return out;
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: { vertical: Vertical; country: string };
}): Promise<Metadata> {
  const { vertical, country } = params;
  if (!VERTICALS.includes(vertical) || !country) return { title: "Not found" };

  const capVertical = vertical.charAt(0).toUpperCase() + vertical.slice(1);
  const capCountry = country.charAt(0).toUpperCase() + country.slice(1);

  const title = `${capCountry} – ${capVertical} Programs`;
  const description = `Discover ${vertical} programs available in ${capCountry}. Compare your options and find the right path.`;
  const canonicalPath = `/${vertical}/${country}`;
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

export default function CountryPage({
  params,
}: {
  params: { vertical: Vertical; country: string };
}) {
  const { vertical, country } = params;
  if (!VERTICALS.includes(vertical) || !country) return notFound();

  const docs = getAllContentCached();
  const programs = docs.filter(
    (d): d is ProgramDoc =>
      (d as any).kind === "program" &&
      (d as ProgramDoc).vertical === vertical &&
      (d as ProgramDoc).country === country
  );

  // ✅ Breadcrumb JSON-LD (absolute URLs + valid @id/item format)
  const breadcrumbJsonLd = breadcrumbLd([
    { name: "Home", url: "/" },
    { name: vertical.charAt(0).toUpperCase() + vertical.slice(1), url: `/${vertical}` },
    { name: country.charAt(0).toUpperCase() + country.slice(1), url: `/${vertical}/${country}` },
  ]);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      {/* ✅ JSON-LD */}
      <JsonLd data={breadcrumbJsonLd} />

      <h1 className="text-3xl font-semibold capitalize">
        {country} – {vertical}
      </h1>

      {programs.length === 0 ? (
        <p className="text-neutral-600">No programs available yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <Link
              key={p.url}
              href={`/${p.vertical}/${p.country}/${p.program}`}
              className="rounded-2xl border p-5 transition hover:bg-gray-50"
            >
              <div className="text-xl font-medium">{p.title}</div>
              {p.summary ? (
                <div className="text-sm opacity-70 mt-1">{p.summary}</div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
