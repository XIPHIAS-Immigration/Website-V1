// src/components/Residency/ResidencyPreview.tsx
import CountryCarousel from "./CountryCarousel";
import { getResidencyCountries } from "@/lib/residency-content";

// tiny helper (same as in CitizenshipPreview)
function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ResidencyPreview() {
  const raw = getResidencyCountries();

  const countries = (raw ?? []).map((c: any) => ({
    ...c,
    category: c?.category ?? "residency",
    title: c?.title ?? c?.country ?? "Residency country",
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
        layout="featureList"            // same 60/40 layout
        variant="standard"
        title="Residency by Investment"
        description="Discover trusted residency pathways across popular countries."
        ctaText="View all countries"
        ctaHref="/residency"
        showSearch
        showRegionFilter={false}        // off per your direction
        rightInitialDesktop={7}         // 7 rows on desktop (right column)
        rightInitialMobile={2}          // 2 rows on mobile (left has 3 -> ~5 total visible)
        seoItemListJsonLd               // optional structured data
      />
    </section>
  );
}
