// src/components/Citizenship/CitizenshipPreview.tsx
import CountryCarousel from "@/components/Residency/CountryCarousel";
import { getCitizenshipCountries } from "@/lib/citizenship-content";

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function CitizenshipPreview() {
  const raw = await getCitizenshipCountries();

  const countries = (raw ?? []).map((c: any) => ({
    ...c,
    category: c?.category ?? "citizenship",
    title: c?.title ?? c?.country ?? "Citizenship country",
    country: c?.country ?? c?.title ?? "Unknown",
    countrySlug:
      c?.countrySlug ??
      c?.slug ??
      (c?.country ? slugify(c.country) : "unknown"),
    // heroImage optional; component has a safe fallback
  }));

  return (
    <section className="container mx-auto lg:max-w-screen-2xl">
      <CountryCarousel
        countries={countries as any}
        layout="featureList"            // keep the 60/40 two-column layout
        variant="standard"
        title="Citizenship by Investment"
        description="Explore citizenship by investment and naturalization routes."
        ctaText="View all countries"
        ctaHref="/citizenship"
        showSearch
        showRegionFilter={false}        // off as requested
        rightInitialDesktop={7}         // 7 rows on desktop
        rightInitialMobile={2}          // 2 rows on mobile (left has 3 => ~5 total visible)
        seoItemListJsonLd
      />
    </section>
  );
}
