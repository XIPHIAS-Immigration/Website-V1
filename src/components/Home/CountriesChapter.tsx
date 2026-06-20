import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";

import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getAllCountries } from "@/lib/countries-content";

const TRACK_PILL: Record<string, string> = {
  citizenship: "Citizenship",
  residency: "Residency",
  skilled: "Skilled",
  corporate: "Corporate",
};

/**
 * "Browse by Country" — the destination-first entry point on the home page.
 * Features the best-covered countries; full list lives at /countries.
 */
export default function CountriesChapter() {
  const all = getAllCountries();
  const featured = [...all].sort((a, b) => b.programmeCount - a.programmeCount).slice(0, 12);

  return (
    <section className="relative overflow-hidden bg-[#fbf9f4] py-16 dark:bg-[#0a0f1a] sm:py-20">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c2992f]/30 bg-[#c2992f]/10 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8a6a14] dark:text-[#e0c879]">
              <Globe2 className="size-3.5" /> Find by country
            </span>
            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.25rem)] font-black leading-[1.05] tracking-tight text-midnight_text dark:text-white">
              Or start with a destination
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-light_grey dark:text-white/65">
              Have a country in mind? See every residency, citizenship, skilled and corporate route we
              run there, side by side.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" amount={0.1}>
          {featured.map((country) => (
            <StaggerItem key={country.slug} className="h-full">
              <Link
                href={`/countries/${country.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#0b1322]"
              >
                <div className="flex items-center gap-3">
                  {country.code ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                      alt=""
                      aria-hidden
                      width={32}
                      height={24}
                      className="rounded-[3px] object-cover ring-1 ring-black/10"
                      style={{ width: 32, height: 24 }}
                    />
                  ) : null}
                  <h3 className="min-w-0 truncate text-[15px] font-black text-midnight_text dark:text-white">
                    {country.name}
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {country.tracks.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-primary/5 px-2 py-0.5 text-[10.5px] font-semibold text-primary dark:bg-white/10 dark:text-white/80"
                    >
                      {TRACK_PILL[t]}
                    </span>
                  ))}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-8 text-center">
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#0a2a6b]"
            >
              View all {all.length} countries
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
