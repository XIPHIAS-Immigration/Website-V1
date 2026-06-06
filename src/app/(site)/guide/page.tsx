// src/app/(site)/guide/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { headerMenu } from "@/components/Layout/Header/Navigation/menu.data";
import Breadcrumb from "@/components/Common/Breadcrumb";
import GuideCatalog from "@/components/guid/GuideCatalog";
import GuideSidebar, { SitemapGroup } from "@/components/guid/GuideSidebar";
import { getBrochureUrl } from "@/components/guid/brochures";
import { extraLinkGroups } from "@/components/guid/extraLinks";

// ---------- Types ----------
export type ProgramItem = {
  service: "Residency" | "Citizenship" | "Corporate" | "Skilled";
  country: string;
  countryHref: string;
  countryCode?: string;
  program: string;
  href: string;
  brochureUrl?: string | null;
};

// ---------- Build from menu.data.ts ----------
function extractPrograms(sectionLabel: ProgramItem["service"]): ProgramItem[] {
  const section = headerMenu.find((s) => s.label === sectionLabel);
  if (!section?.submenu) return [];
  const items: ProgramItem[] = [];
  for (const country of section.submenu) {
    for (const prog of country.submenu ?? []) {
      items.push({
        service: sectionLabel,
        country: country.label,
        countryHref: country.href,
        countryCode: (country as any).meta?.code,
        program: prog.label,
        href: prog.href,
        brochureUrl: getBrochureUrl(prog.href),
      });
    }
  }
  items.sort(
    (a, b) =>
      a.service.localeCompare(b.service) ||
      a.country.localeCompare(b.country) ||
      a.program.localeCompare(b.program)
  );
  return items;
}
function buildAll(): ProgramItem[] {
  const sections: ProgramItem["service"][] = ["Residency", "Citizenship", "Corporate", "Skilled"];
  return sections.flatMap(extractPrograms);
}

// ---------- Sitemap (auto from headerMenu) ----------
function buildSitemap(): SitemapGroup[] {
  const groups: SitemapGroup[] = [];
  const wanted = ["Residency", "Citizenship", "Corporate", "Skilled"];
  for (const label of wanted) {
    const section = headerMenu.find((s) => s.label === label);
    if (!section?.submenu) continue;
    groups.push({
      title: label,
      items: section.submenu.map((country) => ({
        label: country.label,
        href: country.href,
        children: (country.submenu ?? []).map((p) => ({
          label: p.label,
          href: p.href,
        })),
      })),
    });
  }
  return groups;
}

// ---------- SEO base ----------
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "XIPHIAS Immigration";
const FALLBACK_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.xiphiasimmigration.com";

// Dynamic metadata so canonical/OG URL match the current host
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || new URL(FALLBACK_SITE_URL).host;
  const proto = h.get("x-forwarded-proto") || "https";
  const url = `${proto}://${host}/guide`;

  const title = `Resource Guide | ${SITE_NAME}`;
  const description =
    "Explore Residency, Citizenship, Corporate, and Skilled Migration programs. Search, compare, download brochures, and check eligibility in one place";

  return {
    title,
    description,
    keywords: [
      "Residency by Investment",
      "Citizenship by Investment",
      "Golden Visa",
      "Skilled Immigration",
      "Corporate Incorporation",
      "Program brochures",
      "Eligibility check",
      "Investment migration",
    ],
    alternates: { canonical: url, languages: { en: url, "en-IN": url } },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: "/xiphias-immigration.png", width: 1200, height: 630, alt: `${SITE_NAME} – Resource Guide` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/xiphias-immigration.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

// ---------- JSON-LD (WebPage + ItemList + Breadcrumb + FAQ) ----------
function JsonLd({ items, absoluteBase }: { items: ProgramItem[]; absoluteBase: string }) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} – Program Resource Guide`,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${absoluteBase}${it.href}`,
      name: `${it.program} – ${it.country} (${it.service})`,
      additionalProperty: [
        { "@type": "PropertyValue", name: "service", value: it.service },
        { "@type": "PropertyValue", name: "country", value: it.country },
        it.brochureUrl
          ? { "@type": "PropertyValue", name: "brochureUrl", value: `${absoluteBase}${it.brochureUrl}` }
          : undefined,
      ].filter(Boolean),
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteBase },
      { "@type": "ListItem", position: 2, name: "Guide", item: `${absoluteBase}/guide` },
    ],
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Programs Resource Guide",
    url: `${absoluteBase}/guide`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absoluteBase },
    inLanguage: "en",
    about: [
      "Residency by Investment",
      "Citizenship by Investment",
      "Skilled Immigration",
      "Corporate Formation",
    ],
    primaryImageOfPage: `${absoluteBase}/xiphias-immigration.png`,
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where can I download program brochures?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each program row includes a Brochure button. Some programs share the same PDF; that is normal and does not affect SEO.",
        },
      },
      {
        "@type": "Question",
        name: "How do I check eligibility?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use the Eligibility button on any row or open the /eligibility hub for Residency and Corporate quick assessments.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}

// Optional: rebuild static HTML daily (safe for SEO; keeps performance fresh)
export const revalidate = 86400;

// ---------- Page ----------
export default async function GuidePage() {
  const items = buildAll();
  const sitemap = buildSitemap();

  // Build absolute base for JSON-LD without forcing full dynamic rendering
  const h = await headers();
  const host = h.get("x-forwarded-host") || new URL(FALLBACK_SITE_URL).host;
  const proto = h.get("x-forwarded-proto") || "https";
  const absoluteBase = `${proto}://${host}`;

  return (
    <main id="main" className="mx-auto w-full max-w-screen-2xl px-3 md:px-6 py-6">
      <div className="mt-3">
        <Breadcrumb />
      </div>

      {/* SEO intro (H1 + supporting paragraph) */}
      <header className="mt-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-black dark:text-white">
          Programs Resource Guide: Residency, Citizenship, Corporate & Skilled
        </h1>
        <p className="mt-2 max-w-3xl text-black dark:text-white">
          Browse every <strong>Residency by Investment</strong>, <strong>Citizenship by Investment</strong>,
          <strong> Corporate formation</strong>, and <strong>Skilled migration</strong> program we support. Use search and filters,
          compare routes, download brochures, and run an <strong>eligibility check</strong> before you apply.
        </p>
      </header>

      {/* 12-col grid, sticky sitemap on the left (desktop) */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {/* Sidebar / Sitemap */}
        <aside className="col-span-12 lg:col-span-4">
          <GuideSidebar
            eligibilityHref="/eligibility"
            residencyEligibilityHref="/residency/eligibility-check"
            corporateEligibilityHref="/corporate/eligibility-check"
            sitemap={sitemap}
            extraGroups={extraLinkGroups}
          />
        </aside>

        {/* Catalog */}
        <section id="catalog" className="col-span-12 lg:col-span-8">
          <GuideCatalog
            items={items}
            residencyEligibilityHref="/residency/eligibility-check"
            corporateEligibilityHref="/corporate/eligibility-check"
            eligibilityHref="/eligibility"
          />
        </section>
      </div>

      {/* JSON-LD blocks */}
      <JsonLd items={items} absoluteBase={absoluteBase} />
    </main>
  );
}