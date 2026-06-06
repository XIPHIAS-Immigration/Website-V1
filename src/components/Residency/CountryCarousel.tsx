"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";

// ---- Accept ALL verticals + the old "items" prop ----
import type { CountryMeta as ResidencyCountry } from "@/lib/residency-content";
import type { CountryMeta as CitizenshipCountry } from "@/lib/citizenship-content";
import type { CountryMeta as SkilledCountry } from "@/lib/skilled-content";
import type { CountryMeta as CorporateCountry } from "@/lib/corporate-content";

type AnyCountry =
  | ResidencyCountry
  | CitizenshipCountry
  | SkilledCountry
  | CorporateCountry;

type OldItem = {
  country: string;
  countrySlug: string;
  heroImage?: string;
  summary?: string;
  introPoints?: string[];
  region?: string;
};

// ---- helpers ----
function baseFromCategory(cat?: AnyCountry["category"]) {
  switch (cat) {
    case "citizenship":
      return "/citizenship";
    case "skilled":
      return "/skilled";
    case "corporate":
      return "/corporate";
    case "residency":
    default:
      return "/residency";
  }
}
function nounFromCategory(cat?: AnyCountry["category"]) {
  switch (cat) {
    case "citizenship":
      return "Citizenship";
    case "skilled":
      return "Skilled";
    case "corporate":
      return "Residency";
    case "residency":
    default:
      return "Residency";
  }
}
function truncateWords(text = "", maxWords = 15) {
  const words = (text || "").trim().split(/\s+/);
  return words.length <= maxWords
    ? (text || "").trim()
    : words.slice(0, maxWords).join(" ") + "…";
}
function normalizeImageSrc(src?: string, fallback = "/xiphias-immigration.png") {
  const val = (src && src.trim()) || fallback;
  if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
  return `/${val.replace(/^\/+/, "")}`;
}
function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

/* ==============================
   Global theme vars (black/white)
   ============================== */
const ThemeVars = () => (
  <style jsx global>{`
    :root {
      --c-bg: #ffffff;
      --c-text: #0a0a0a;
      --c-card: #ffffff;
      --c-border: rgba(10, 10, 10, 0.14);
      --c-primary: #0f172a;
      --c-secondary: #2563eb;
      --c-invert: #ffffff;
      --c-input-bg: #ffffff;
    }
    .dark {
      --c-bg: #000000;
      --c-text: #ffffff;
      --c-card: #0b0b0b;
      --c-border: rgba(255, 255, 255, 0.22);
      --c-primary: #ffffff;
      --c-secondary: #60a5fa;
      --c-invert: #000000;
      --c-input-bg: #0b0b0b;
    }
  `}</style>
);

/* =========================================================
   FeatureList — separated so hooks are at the top (no errors)
   Layout: Left 60% (hero + 2 small) | Right 40% (7 rows)
   ========================================================= */
function FeatureList({
  list,
  derivedBase,
  title,
  description,
  ctaText,
  viewAllHref,
  rightInitialDesktop = 7,
  rightInitialMobile = 2,
  showSearch = true,
  showRegionFilter = false,
  seoItemListJsonLd = false,
}: {
  list: (AnyCountry | OldItem)[];
  derivedBase: string;
  title: string;
  description: string;
  ctaText: string;
  viewAllHref: string;
  rightInitialDesktop?: number;
  rightInitialMobile?: number;
  showSearch?: boolean;
  showRegionFilter?: boolean;
  seoItemListJsonLd?: boolean;
}) {
  const [first, second, third, ...restAll] = list;

  // hero unify
  const isNew = first && "category" in (first as any);
  const country = (first as any)?.country || (first as any)?.title || "Country";
  const countrySlug = (first as any)?.countrySlug || "country";
  const heroImage =
    (first as any)?.heroImage || `/images/countries/${countrySlug}-hero-poster.jpg`;
  const summary = (first as any)?.summary;
  const introPoints = ((first as any)?.introPoints || []).slice(0, 3) as string[];
  const base = isNew ? baseFromCategory((first as any).category) : derivedBase;
  const href = `${base}/${countrySlug}`;
  const ctaNoun = isNew ? nounFromCategory((first as any).category) : "Residency";

  // RIGHT: query + region + responsive counts
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const clearQuery = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [rightVisible, setRightVisible] = useState<number>(rightInitialDesktop);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () =>
      setRightVisible(mq.matches ? rightInitialDesktop : rightInitialMobile);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [rightInitialDesktop, rightInitialMobile]);

  const allRegions = useMemo(
    () =>
      ["All"].concat(
        uniq(
          restAll
            .map((r: any) => (r?.region || "").trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        ),
      ),
    [restAll],
  );
  const [region, setRegion] = useState<string>(allRegions[0] || "All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restAll.filter((raw: any) => {
      const name = (raw?.country || raw?.title || "").toLowerCase();
      const slug = (raw?.countrySlug || "").toLowerCase();
      const reg = (raw?.region || "All").toLowerCase();
      const passRegion = !showRegionFilter || region === "All" || reg === region.toLowerCase();
      const passText = !q || name.includes(q) || slug.includes(q);
      return passRegion && passText;
    });
  }, [restAll, query, region, showRegionFilter]);

  // exact rows rendered on right (no inner scroll)
  const rightItems = filtered.slice(0, Math.max(0, rightVisible));

  // small-card on left column
  function SmallCard({ raw }: { raw: any }) {
    const isN = "category" in (raw as any);
    const ctry = raw?.country || raw?.title || "Country";
    const slug = raw?.countrySlug || "country";
    const img = raw?.heroImage || `/images/countries/${slug}-hero-poster.jpg`;
    const sum = raw?.summary;
    const base2 = isN ? baseFromCategory(raw.category) : derivedBase;
    const href2 = `${base2}/${slug}`;
    const noun = isN ? nounFromCategory(raw.category) : "Residency";

    return (
      <article className="flex rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)]">
        <Link href={href2} className="relative block w-1/3 min-h-[120px] overflow-hidden rounded-l-2xl">
          <Image
            src={normalizeImageSrc(img, `/images/${slug}.jpg`)}
            alt={`${ctry} image`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 40vw, 33vw"
            loading="lazy"
            unoptimized
          />
        </Link>
        <div className="flex-1 p-4">
          <h3 className="text-base font-semibold leading-tight">
            <Link href={href2} className="hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--c-secondary)] rounded">
              {ctry}
            </Link>
          </h3>
          <p className="mt-1 text-sm leading-6 line-clamp-2">
            {truncateWords(sum || `${noun} pathways in ${ctry}.`, 22)}
          </p>
          <div className="pt-3 mt-2 border-t border-[var(--c-border)]">
            <Link href={href2} className="inline-flex items-center text-sm font-bold tracking-wide">
              <span>Explore</span><span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // right-side row
  function HRow({ raw, i }: { raw: any; i: number }) {
    const isN = "category" in (raw as any);
    const ctry = raw?.country || raw?.title || "Country";
    const slug = raw?.countrySlug || "country";
    const img = raw?.heroImage || `/images/countries/${slug}-hero-poster.jpg`;
    const sum = raw?.summary;
    const base2 = isN ? baseFromCategory(raw.category) : derivedBase;
    const href2 = `${base2}/${slug}`;
    const noun = isN ? nounFromCategory(raw.category) : "Residency";
    return (
      <li key={`${slug}-${i}`}>
        <Link
          href={href2}
          className="group flex items-center gap-3 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-3 hover:ring-2 hover:ring-[var(--c-secondary)] transition"
        >
          <div className="relative w-20 h-14 rounded-md overflow-hidden flex-none">
            <Image
              src={normalizeImageSrc(img, `/images/${slug}.jpg`)}
              alt={`${ctry} image`}
              fill
              className="object-cover"
              sizes="80px"
              loading="lazy"
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold truncate">{ctry}</h3>
              <span className="text-base opacity-0 group-hover:opacity-100 transition">→</span>
            </div>
            <p className="mt-0.5 text-xs leading-5 line-clamp-2">
              {truncateWords(sum || `${noun} pathways in ${ctry}.`, 18)}
            </p>
          </div>
        </Link>
      </li>
    );
  }

  // SEO
  const jsonLd =
    seoItemListJsonLd &&
    (() => {
      const visibleLinks = rightItems.map((r: any) => {
        const base2 = "category" in r ? baseFromCategory(r.category) : derivedBase;
        return { name: r.country || r.title || "Country", url: `${base2}/${r.countrySlug || "country"}` };
      });
      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: [{ name: country, url: href }, ...visibleLinks].map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: it.url,
        })),
      };
    })();

  return (
    <div className="py-8 lg:max-w-screen-2xl bg-[var(--c-bg)] text-[var(--c-text)]">
      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-4 sm:p-5 md:p-6 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/10">
        {/* soft background accents (clipped inside) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(70%_70%_at_10%_10%,black,transparent_75%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
          </div>
        </div>

        {/* content */}
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--c-primary)] break-words">
              {title}
            </h2>
            <p className="mt-2 text-base md:text-lg leading-relaxed text-black/80 dark:text-white/80 break-words">
              {description}
            </p>
          </div>

          {/* Desktop header CTA (right-aligned) */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-secondary)] transition"
            >
              {ctaText} ({list.length}) <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Left 60% | Right 40% */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* LEFT (hero + 2 small) */}
        <div className="md:col-span-3">
          <article className="mb-6 rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] overflow-hidden">
            <Link href={href} aria-label={`${country} ${ctaNoun}`}>
              <div className="relative h-64 sm:h-72 lg:h-[420px]">
                <Image
                  src={normalizeImageSrc(heroImage, `/images/${countrySlug}.jpg`)}
                  alt={`${country} image`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 66vw"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>
            </Link>

            <div className="px-5 py-4">
              <h2 className="text-xl font-semibold leading-tight">
                <Link href={href} className="hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--c-secondary)] rounded">
                  {country}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-7">
                {truncateWords(summary || `${ctaNoun} pathways in ${country}.`, 36)}
              </p>

              {!!introPoints.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {introPoints.map((t, i) => (
                    <span key={i} className="rounded-full border border-[var(--c-border)] px-3 py-1 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Mobile CTA */}
              <div className="md:hidden mt-4">
                <Link
                  href={viewAllHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)]"
                >
                  {ctaText} ({list.length}) <span>→</span>
                </Link>
              </div>

              <div className="pt-4 mt-3 border-t border-[var(--c-border)]">
                <Link href={href} className="inline-flex items-center text-base font-bold tracking-wide">
                  <span>Explore {country} {ctaNoun}</span>
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </article>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {second && <SmallCard raw={second} />}
            {third && <SmallCard raw={third} />}
          </div>
        </div>

        {/* RIGHT (search + rows) */}
        <aside className="md:col-span-2">
          <div
            role="search"
            aria-label="Country filters"
            className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-3 mb-4"
          >
            <div className="grid grid-cols-1 gap-3">
              {showSearch && (
                <div>
                  <label className="sr-only" htmlFor="country-search">Search countries</label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                      <Search className="h-4 w-4 opacity-70" aria-hidden />
                    </span>

                    <input
                      ref={searchRef}
                      id="country-search"
                      aria-describedby="country-search-hint"
                      placeholder="Search countries by name…"
                      className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] pl-9 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--c-secondary)]"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape" && query) clearQuery();
                      }}
                      inputMode="search"
                    />

                    {query && (
                      <button
                        type="button"
                        onClick={clearQuery}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--c-border)] hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)] transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <p id="country-search-hint" className="text-[11px] tracking-wide opacity-75">
                      Tip: type a few letters (e.g., “gre” for Grenada).
                    </p>
                    <div aria-hidden className="hidden sm:flex items-center gap-1 text-[11px] opacity-80">
                      <span className="rounded-md border border-[var(--c-border)] px-1.5 py-[2px]">Ctrl</span>
                      <span>+</span>
                      <span className="rounded-md border border-[var(--c-border)] px-1.5 py-[2px]">K</span>
                      <span className="ml-1">to focus</span>
                    </div>
                  </div>
                </div>
              )}

              {showRegionFilter && allRegions.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="country-region">Filter by region</label>
                  <select
                    id="country-region"
                    className="w-full rounded-xl border border-[var(--c-border)] bg-[var(--c-input-bg)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--c-secondary)]"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {allRegions.map((r) => (
                      <option key={r} value={r}>
                        {r === "All" ? "All regions" : r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {rightItems.length === 0 ? (
            <div className="rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-6 text-sm">
              No countries match your search.
            </div>
          ) : (
            <ul className="space-y-3">
              {rightItems.map((raw, i) => (
                <HRow key={`${(raw as any)?.countrySlug || "country"}-${i}`} raw={raw} i={i} />
              ))}
            </ul>
          )}

          {/* Mobile view-all at bottom */}
          <div className="mt-4 md:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] px-4 py-2.5 text-sm font-semibold hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)]"
            >
              {ctaText} ({list.length}) <span>→</span>
            </Link>
          </div>
        </aside>
      </div>

      {seoItemListJsonLd && jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </div>
  );
}

/* ===========================
   Main exported component
   =========================== */
export default function CountryCarousel({
  countries,
  items,
  title = "Residency by Country",
  description = "Discover trusted residency pathways across popular countries.",
  ctaText = "View all countries",
  ctaHref,
  variant = "standard",
  layout = "carousel",
  showSearch = true,
  showRegionFilter = false,
  rightInitialDesktop = 7,
  rightInitialMobile = 2,
  seoItemListJsonLd = false,
}: {
  countries?: (AnyCountry | null | undefined)[];
  items?: OldItem[];
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: "compact" | "standard" | "plush";
  layout?: "carousel" | "featureList";
  showSearch?: boolean;
  showRegionFilter?: boolean;
  rightInitialDesktop?: number;
  rightInitialMobile?: number;
  seoItemListJsonLd?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const list =
    ((countries && countries.filter(Boolean)) ||
      (items && items.filter(Boolean)) ||
      []) as (AnyCountry | OldItem)[];

  if (!list.length) {
    return (
      <>
        <ThemeVars />
      </>
    );
  }

  const derivedBase =
    "category" in (list[0] as any)
      ? baseFromCategory((list[0] as any).category)
      : "/residency";
  const viewAllHref = ctaHref || derivedBase;

  // preset sizes per variant (image height only) for carousel
  const imgHeight =
    variant === "compact"
      ? "h-40 sm:h-44"
      : variant === "plush"
        ? "h-56 sm:h-60"
        : "h-48 sm:h-52";

  const scrollOne = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("div[data-card]") as HTMLElement | null;
    if (!card) return;
    const unit = card.getBoundingClientRect().width + 24; // 24px gap
    rail.scrollBy({ left: dir * unit, behavior: "smooth" });
  };

  // Render feature list or carousel
  if (layout === "featureList") {
    return (
      <>
        <ThemeVars />
        <FeatureList
          list={list}
          derivedBase={derivedBase}
          title={title}
          description={description}
          ctaText={ctaText}
          viewAllHref={viewAllHref}
          rightInitialDesktop={rightInitialDesktop}
          rightInitialMobile={rightInitialMobile}
          showSearch={showSearch}
          showRegionFilter={showRegionFilter}
          seoItemListJsonLd={seoItemListJsonLd}
        />
      </>
    );
  }

  // ====== Carousel (unchanged) ======
  return (
    <section className="py-8 container lg:max-w-screen-2xl bg-[var(--c-bg)] text-[var(--c-text)]">
      <ThemeVars />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight">{title}</h2>
          <p className="text-base md:text-lg mb-6 leading-relaxed">{description}</p>
          <Link
            href={ctaHref || derivedBase}
            className="inline-block px-6 py-2.5 rounded-xl border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)] transition text-sm md:text-base font-semibold shadow-sm"
          >
            {ctaText}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => scrollOne(-1)}
            aria-label="Scroll countries left"
            className="w-12 h-12 flex items-center justify-center rounded-full shadow-md border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)] transition"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => scrollOne(1)}
            aria-label="Scroll countries right"
            className="w-12 h-12 flex items-center justify-center rounded-full shadow-md border border-[var(--c-border)] bg-[var(--c-card)] hover:bg-[var(--c-primary)] hover:text-[var(--c-invert)] transition"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex flex-nowrap items-stretch gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 pe-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((raw, idx) => {
          const isNew = "category" in (raw as any);
          const country = (raw as any).country || (raw as any).title || "Country";
          const countrySlug = (raw as any).countrySlug || "country";
          const heroImage =
            (raw as any).heroImage || `/images/countries/${countrySlug}-hero-poster.jpg`;
          const summary = (raw as any).summary;
          const introPoints = (raw as any).introPoints || [];
          const base = isNew ? baseFromCategory((raw as any).category) : derivedBase;
          const href = `${base}/${countrySlug}`;
          const chips = (introPoints as string[]).slice(0, 2);
          const ctaNoun = isNew ? nounFromCategory((raw as any).category) : "Residency";

          return (
            <div key={`${countrySlug}-${idx}`} data-card className="flex-none snap-start basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <article className="h-full flex flex-col rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] shadow-sm">
                <Link href={href} aria-label={`${country} ${ctaNoun}`}>
                  <div className={`relative ${imgHeight} rounded-t-2xl overflow-hidden`}>
                    <Image
                      src={normalizeImageSrc(heroImage, `/images/${countrySlug}.jpg`)}
                      alt={`${country} image`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      loading={idx === 0 ? "eager" : "lazy"}
                      unoptimized
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col px-4 py-3">
                  <h3 className="text-base sm:text-lg font-semibold leading-tight">
                    <Link href={href} className="hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--c-secondary)] rounded">
                      {country}
                    </Link>
                  </h3>

                  <p className="mt-1 text-sm leading-6 line-clamp-2 min-h-[44px]">
                    {truncateWords(summary || `${ctaNoun} pathways in ${country}.`, 20)}
                  </p>

                  <div className="mt-2 min-h-[28px]">
                    {!!chips.length && (
                      <div className="flex flex-wrap gap-2">
                        {chips.map((t, i) => (
                          <span key={i} className="rounded-full border border-[var(--c-border)] px-3 py-1 text-xs font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-auto w-full border-t border-[var(--c-border)]">
                    <Link href={href} className="group w-full flex items-center text-base font-bold tracking-wide">
                      <span>Explore {country} {ctaNoun}</span>
                      <span className="ml-2 inline-block transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
        <div className="flex-none w-1" />
      </div>
    </section>
  );
}
