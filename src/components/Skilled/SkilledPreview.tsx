// src/components/Skilled/SkilledPreview.tsx
import CountryCarousel from "@/components/Residency/CountryCarousel";
import { getSkilledCountries } from "@/lib/skilled-content";

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function toDisplayString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const [k, val] = Object.entries(v as Record<string, unknown>)[0] ?? [];
    if (k !== undefined) return `${k}${val !== undefined ? `: ${String(val)}` : ""}`;
  }
  return v == null ? "" : String(v);
}
const coerceStringArray = (a: unknown) =>
  Array.isArray(a) ? a.map(toDisplayString) : [];

export default async function SkilledPreview() {
  const raw = await getSkilledCountries();

  const countries = (raw ?? []).map((c: any) => ({
    ...c,
    category: c?.category ?? "skilled",
    title: c?.title ?? c?.country ?? "Skilled country",
    country: c?.country ?? c?.title ?? "Unknown",
    countrySlug:
      c?.countrySlug ??
      c?.slug ??
      (c?.country ? slugify(c.country) : "unknown"),
    introPoints: coerceStringArray(c?.introPoints),
    keyPoints: coerceStringArray(c?.keyPoints),
    tags: coerceStringArray(c?.tags),
    // heroImage optional; CountryCarousel has safe fallback
  }));

  return (
    <section className="mx-auto max-w-screen-2xl px-4">
      <CountryCarousel
        countries={countries as any}
        layout="featureList"              // same 60/40 two-column layout
        variant="standard"
        title="Skilled Migration for Professionals"
        description="Explore points-based PR, work permits and talent visas."
        ctaText="View all countries"
        ctaHref="/skilled"
        showSearch
        showRegionFilter={false}         // off as requested
        rightInitialDesktop={7}          // 7 rows on desktop (right column)
        rightInitialMobile={2}           // 2 rows on mobile (left has 3 => ~5 total)
        seoItemListJsonLd
      />
    </section>
  );
}
