import * as React from "react";
import Link from "next/link";

import type { CountryMeta as ResidencyCountry } from "@/lib/residency-content";
import type { CountryMeta as CitizenshipCountry } from "@/lib/citizenship-content";
import type { CountryMeta as SkilledCountry } from "@/lib/skilled-content";
import type { CountryMeta as CorporateCountry } from "@/lib/corporate-content";

type AnyCountry =
  | ResidencyCountry
  | CitizenshipCountry
  | SkilledCountry
  | CorporateCountry;

type Props = { related: AnyCountry[]; title?: string; subtitle?: string };

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

export default function RelatedCountriesSection({
  related,
  title = "Explore other countries",
  subtitle = "You may also like these destinations",
}: Props) {
  if (!related?.length) return null;

  return (
    <section className="mt-12">
      <header className="mb-5">
        <div className="inline-flex items-center rounded-md bg-slate-600/10 px-2 py-1 text-xs font-semibold">
          Related
        </div>
        <h2 className="mt-2 text-xl font-semibold">{title}</h2>
        <p className="text-sm opacity-70">{subtitle}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((c) => {
          const href = `${baseFromCategory(c.category)}/${c.countrySlug}`;
          const img = (c as any).heroImage as string | undefined;

          return (
            <li key={c.countrySlug}>
              <Link
                href={href}
                className="group block overflow-hidden rounded-2xl ring-1 ring-neutral-200/80 dark:ring-neutral-800/80 bg-white/80 dark:bg-neutral-900/40 hover:-translate-y-0.5 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label={`View ${c.country}`}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={c.title || c.country}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-100 dark:from-neutral-800 dark:to-neutral-700 grid place-items-center">
                      <span className="text-xs opacity-70">{c.country}</span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-base font-semibold leading-6">
                    {c.title || c.country}
                  </h3>
                  {c.summary ? (
                    <p className="mt-1 text-sm opacity-70 line-clamp-2">
                      {c.summary}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}