import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Wallet, ArrowUpRight } from "lucide-react";

import { getCountryOverview, getCountrySlugs } from "@/lib/countries-content";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return getCountrySlugs().map((country) => ({ country }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}): Promise<Metadata> {
  const { country } = await params;
  const overview = getCountryOverview(country);
  if (!overview) return { title: "Country not found" };
  return {
    title: `${overview.name} — Residency, Citizenship & Migration Programmes`,
    description: `Every immigration pathway XIPHIAS offers in ${overview.name}: ${overview.groups
      .map((g) => g.label)
      .join(", ")}. Compare investment, timeline and routes in one place.`,
    alternates: { canonical: `/countries/${overview.slug}` },
  };
}

function Flag({ code }: { code: string }) {
  if (!code || code.length !== 2) return <span className="text-5xl">🌍</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt=""
      aria-hidden
      width={72}
      height={54}
      className="rounded-md object-cover shadow-sm ring-1 ring-black/10"
      style={{ width: 72, height: 54 }}
    />
  );
}

export default async function CountryOverviewPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country } = await params;
  const overview = getCountryOverview(country);
  if (!overview) notFound();

  return (
    <main className="bg-[#fdfbf7] pb-20 pt-28 dark:bg-darkmode">
      {/* Hero */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-[13px] text-[#8a94a6]">
          <Link href="/countries" className="hover:text-[#c2992f]">
            Countries
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#0a1f44] dark:text-white">{overview.name}</span>
        </nav>

        <div className="flex flex-col gap-6 rounded-3xl border border-[#0a1f44]/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#0b1322] sm:p-9 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Flag code={overview.code} />
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#c2992f]">
                {overview.region}
              </p>
              <h1 className="mt-1 text-[clamp(2rem,4.6vw,3rem)] font-black leading-tight text-[#0a1f44] dark:text-white">
                {overview.name}
              </h1>
              <p className="mt-1 text-[14px] text-[#4a5568] dark:text-white/65">
                {overview.programmeCount} programme{overview.programmeCount === 1 ? "" : "s"} across{" "}
                {overview.groups.length} pathway{overview.groups.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <Link
            href="/personal-booking"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c2992f] px-6 py-3.5 text-[14px] font-bold text-[#0a1f44] shadow-sm transition hover:bg-[#d8ad1f]"
          >
            Book a consultation
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Programme groups */}
      <section className="mx-auto mt-12 max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {overview.groups.map((group) => (
          <div key={group.track} className="mb-12">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-[18px] font-black tracking-tight text-[#0a1f44] dark:text-white">
                {group.label}
              </h2>
              <span className="h-px flex-1 bg-[#0a1f44]/10 dark:bg-white/10" />
              <Link
                href={`/${group.track}/${overview.slug}`}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#c2992f] hover:underline"
              >
                Overview <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col rounded-2xl border border-[#0a1f44]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c2992f]/50 hover:shadow-md dark:border-white/10 dark:bg-[#0b1322]"
                >
                  <h3 className="text-[16px] font-bold text-[#0a1f44] dark:text-white">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[#4a5568] dark:text-white/65">
                    {item.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] font-semibold text-[#0a1f44] dark:text-white/80">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="size-3.5 text-[#c2992f]" /> {item.investmentLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 text-[#c2992f]" /> {item.timelineLabel}
                    </span>
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
