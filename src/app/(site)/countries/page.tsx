import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe2, MapPin } from "lucide-react";

import { getCountriesByRegion, TRACK_LABEL } from "@/lib/countries-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Countries We Serve — Residency, Citizenship & Migration",
  description:
    "Browse every country XIPHIAS Immigration supports. Explore residency, citizenship, skilled and corporate programmes for each destination in one place.",
  alternates: { canonical: "/countries" },
};

function Flag({ code, size = 28 }: { code: string; size?: number }) {
  if (!code || code.length !== 2) return <span className="text-xl">🌍</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={Math.round((size * 3) / 4)}
      className="shrink-0 rounded-[3px] object-cover ring-1 ring-black/10"
      style={{ width: size, height: Math.round((size * 3) / 4) }}
    />
  );
}

const TRACK_PILL: Record<string, string> = {
  citizenship: "Citizenship",
  residency: "Residency",
  skilled: "Skilled",
  corporate: "Corporate",
};

export default function CountriesIndexPage() {
  const regions = getCountriesByRegion();
  const total = regions.reduce((sum, r) => sum + r.countries.length, 0);

  return (
    <main className="bg-[#fdfbf7] pb-20 pt-28 dark:bg-darkmode">
      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0a1f44]/15 bg-white px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a1f44] dark:border-white/15 dark:bg-white/5 dark:text-white">
            <Globe2 className="size-3.5 text-[#c2992f]" /> {total} destinations
          </span>
          <h1 className="mt-5 text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.05] tracking-tight text-[#0a1f44] dark:text-white">
            Find your country
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-[#4a5568] dark:text-white/65">
            Pick a destination to see every residency, citizenship, skilled and corporate pathway we
            run there — or{" "}
            <Link href="/xiphias-program-index" className="font-semibold text-[#c2992f] underline-offset-2 hover:underline">
              browse by programme
            </Link>{" "}
            instead.
          </p>
        </div>
      </section>

      {/* Regions */}
      <section className="mx-auto mt-12 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {regions.map(({ region, countries }) => (
          <div key={region} className="mb-12">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="size-4 text-[#c2992f]" />
              <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-[#0a1f44] dark:text-white">
                {region}
              </h2>
              <span className="h-px flex-1 bg-[#0a1f44]/10 dark:bg-white/10" />
              <span className="text-[12px] font-semibold text-[#8a94a6]">{countries.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map((c) => (
                <Link
                  key={c.slug}
                  href={`/countries/${c.slug}`}
                  className="group flex flex-col rounded-2xl border border-[#0a1f44]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c2992f]/50 hover:shadow-md dark:border-white/10 dark:bg-[#0b1322]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Flag code={c.code} size={32} />
                      <div>
                        <h3 className="text-[17px] font-bold text-[#0a1f44] dark:text-white">{c.name}</h3>
                        <p className="text-[12px] text-[#8a94a6]">
                          {c.programmeCount} programme{c.programmeCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-[#c2992f] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {c.tracks.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#0a1f44]/5 px-2.5 py-1 text-[11px] font-semibold text-[#0a1f44] dark:bg-white/10 dark:text-white/80"
                        title={TRACK_LABEL[t]}
                      >
                        {TRACK_PILL[t]}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
