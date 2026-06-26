import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";

import { Reveal, SplitText, Stagger, StaggerItem } from "@/components/motion";
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
    <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-20">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-secondary">
              <Globe2 className="size-3.5" /> Find by country
            </span>
            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.25rem)] font-black leading-[1.05] tracking-tight text-white">
              <SplitText
                text="Or start with a destination"
                accentIndices={[4]}
                accentClassName="text-secondary"
              />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/65">
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
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-white transition duration-200 hover:-translate-y-1 hover:border-secondary/50 hover:bg-white/[0.09]"
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
                      className="rounded-[3px] object-cover ring-1 ring-white/15"
                      style={{ width: 32, height: 24 }}
                    />
                  ) : null}
                  <h3 className="min-w-0 truncate text-[15px] font-black text-white">
                    {country.name}
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {country.tracks.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-semibold text-white/80"
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
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-[14px] font-bold text-ink shadow-sm transition hover:bg-[#f0cb3b]"
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
