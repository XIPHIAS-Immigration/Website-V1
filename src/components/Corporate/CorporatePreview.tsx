// src/components/Corporate/CorporatePreview.tsx
import CountryCarousel from "@/components/Residency/CountryCarousel";
import { getCorporateCountries } from "@/lib/corporate-content";

// tiny helper (same as other previews)
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function CorporatePreview() {
  const raw = await getCorporateCountries();

  const countries = (raw ?? []).map((c: any) => ({
    ...c,
    category: c?.category ?? "corporate",
    title: c?.title ?? c?.country ?? "Corporate country",
    country: c?.country ?? c?.title ?? "Unknown",
    countrySlug:
      c?.countrySlug ??
      c?.slug ??
      (c?.country ? slugify(c.country) : "unknown"),
    // heroImage optional; CountryCarousel has a safe fallback
  }));

  return (
    <section className="mx-auto max-w-screen-2xl px-4">
      <CountryCarousel
        countries={countries as any}
        layout="featureList"             // same 60/40 two-column layout
        variant="standard"
        title="Corporate Global Mobility"
        description="Work permits, company setup & sponsored employment routes."
        ctaText="View all countries"
        ctaHref="/corporate"
        showSearch
        showRegionFilter={false}         // off as requested
        rightInitialDesktop={7}          // 7 rows on desktop (right column)
        rightInitialMobile={2}           // 2 rows on mobile (left has 3 => ~5 total)
        seoItemListJsonLd
      />
    </section>
  );
}
