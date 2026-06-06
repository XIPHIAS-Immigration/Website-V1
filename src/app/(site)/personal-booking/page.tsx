// src/app/personalbooking/page.tsx
import Hero from "@/components/PersonalBooking/Hero";
// Use dynamic imports for below-the-fold components to reduce the initial bundle size
import nextDynamic from "next/dynamic";
const Details = nextDynamic(() => import("@/components/PersonalBooking/Details"));
const FAQSection = nextDynamic(() => import("@/components/Common/FAQSection"));
import { getAllInsights } from "@/lib/insights-content";
import type { Metadata } from "next";

export const revalidate = 86400; // 1 day

export const metadata: Metadata = {
  title: "Book a Private Consultation",
  description:
    "Book a personal consultation with XIPHIAS Immigration. With 17+ years of expertise, we guide investors, entrepreneurs, and families globally",
  keywords: [
    "XIPHIAS Immigration",
    "Golden Visa Consultation",
    "Residency by Investment",
    "Citizenship by Investment",
    "Investment Migration",
    "Permanent Residency",
    "Global Mobility",
    "Immigration Consultants",
  ],
  openGraph: {
    title: "Book a Private Consultation | XIPHIAS Immigration",
    description:
      "Trusted advisors with 17+ years of excellence and a 92% success rate in global investment migration programs. Book your private consultation today.",
    url: "https://www.xiphiasimmigration.com/personal-booking",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    images: [
      {
        url: "https://www.xiphiasimmigration.com/images/og-personal-booking.jpg",
        width: 1200,
        height: 630,
        alt: "Book a Consultation with XIPHIAS Immigration",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Private Consultation | XIPHIAS Immigration",
    description:
      "Book your personal consultation with XIPHIAS Immigration. Trusted by 10K+ clients across 25+ global programs.",
    images: [
      "https://www.xiphiasimmigration.com/images/og-personal-booking.jpg",
    ],
  },
  alternates: {
    canonical: "https://www.xiphiasimmigration.com/personal-booking",
  },
  robots: { index: true, follow: true },
};

export default async function personalbookingPage() {
  // ✅ FIX: kind must be "articles" (plural). Or omit `kind` to get from all kinds.
  const { items } = await getAllInsights({ kind: "articles", pageSize: 6 });

  // Use canonical URL computed by the loader, and show `updated` if present
  const articles = items.map((i) => ({
    title: i.title,
    url: i.url, // already /articles/{slug}
    date: i.updated ?? i.date,
    summary: i.summary,
    hero: i.hero,
    tags: i.tags,
  }));

  return (
    <main className="bg-light_bg dark:bg-dark_bg text-light_text dark:text-dark_text">
      <Hero />
      <Details articles={articles} />
      <FAQSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            // your existing structured data …
          }),
        }}
      />
    </main>
  );
}
