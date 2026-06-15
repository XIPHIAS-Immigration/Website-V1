// ✅ src/app/(site)/[vertical]/[country]/[program]/page.tsx
// Program page: renders MDX content

import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllContentCached } from "@/lib/content";
import { getRelated } from "@/lib/content/related";
import type { Vertical, ProgramDoc } from "@/lib/content/types";
import type { Metadata } from "next";
import { JsonLd, breadcrumbLd } from "@/lib/seo"; // ✅ use helper
import Link from "next/link";
import { notFound } from "next/navigation";

import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs"; // ensure Node.js runtime on Vercel

const VERTICALS3: Vertical[] = ["residency", "citizenship", "skilled", "corporate"];

/** Build params ONLY from folder names; ignore front-matter completely. */
export async function generateStaticParams() {
  const root = path.join(process.cwd(), "content");
  const out: Array<{ vertical: string; country: string; program: string }> = [];

  for (const vertical of VERTICALS3) {
    const vDir = path.join(root, vertical);

    // Skip missing vertical directories cleanly
    let countryDirs: string[] = [];
    try {
      const entries = await fs.readdir(vDir, { withFileTypes: true });
      countryDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    for (const country of countryDirs) {
      const cDir = path.join(vDir, country);
      let files: string[] = [];
      try {
        files = (await fs.readdir(cDir)).filter((f) => f.endsWith(".mdx"));
      } catch {
        continue;
      }

      for (const file of files) {
        const base = path.basename(file, ".mdx");
        if (!base || base.startsWith("_")) continue; // ignore partials like _country.mdx
        out.push({ vertical, country, program: base });
      }
    }
  }

  return out;
}

export const dynamicParams = true;

/**
 * Generate SEO metadata for MDX program pages.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ vertical: Vertical; country: string; program: string }>;
}): Promise<Metadata> {
  const { vertical, country, program } = await params;

  if (!VERTICALS3.includes(vertical)) {
    return { title: "Program not found" };
  }

  const doc = getAllContentCached().find(
    (d): d is ProgramDoc =>
      d.kind === "program" &&
      d.vertical === vertical &&
      d.country === country &&
      d.program === program
  );

  if (!doc) {
    return { title: "Program not found" };
  }

  const title = doc.title;
  const description = doc.summary || `Discover the ${doc.title} program in ${doc.country}.`;
  const keywords = doc.tags?.join(", ");
  const canonicalUrl = `https://www.xiphiasimmigration.com${doc.url}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: "XIPHIAS Immigration",
      locale: "en_US",
      images: [
        {
          url: doc.heroImage ?? "/xiphias-immigration.png",
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
      images: [doc.heroImage ?? "/xiphias-immigration.png"],
    },
  };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ vertical: Vertical; country: string; program: string }>;
}) {
  const { vertical, country, program } = await params;

  if (!VERTICALS3.includes(vertical) || !country || !program) return notFound();

  const doc = getAllContentCached().find(
    (d): d is ProgramDoc =>
      d.kind === "program" &&
      d.vertical === vertical &&
      d.country === country &&
      d.program === program
  );

  if (!doc) return notFound();

  const { content } = await compileMDX({
    source: doc.body,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
      },
    },
  });

  const related = getRelated(doc, 6);

  // ✅ Breadcrumb JSON-LD using helper (absolute URLs + valid @id format)
  const breadcrumbJsonLd = breadcrumbLd([
    { name: "Home", url: "/" },
    { name: doc.vertical.charAt(0).toUpperCase() + doc.vertical.slice(1), url: `/${doc.vertical}` },
    { name: doc.country.charAt(0).toUpperCase() + doc.country.slice(1), url: `/${doc.vertical}/${doc.country}` },
    { name: doc.title, url: doc.url },
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6 grid lg:grid-cols-[2fr_1fr] gap-8">
      <JsonLd data={breadcrumbJsonLd} />

      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">{doc.title}</h1>
          {doc.summary && <p className="opacity-80">{doc.summary}</p>}
        </header>

        <div className="prose max-w-none">{content}</div>

        {doc.brochure && (
          <a
            className="inline-block rounded-xl border px-4 py-2 hover:bg-gray-50"
            href={doc.brochure}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download brochure
          </a>
        )}

        {doc.faq?.length ? (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <ul className="mt-3 space-y-3">
              {doc.faq.map((f, i) => (
                <li key={i}>
                  <details>
                    <summary className="font-medium">{f.q}</summary>
                    <div className="opacity-80 mt-1">{f.a}</div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <aside className="space-y-4">
        <div className="rounded-2xl border p-4">
          <h3 className="font-semibold mb-3">Related</h3>
          <ul className="space-y-2">
            {related.map((it) => (
              <li key={it.url}>
                <Link className="hover:underline" href={it.url}>
                  {it.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
