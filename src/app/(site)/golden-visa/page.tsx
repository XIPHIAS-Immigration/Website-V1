import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gem } from "lucide-react";
import nextDynamic from "next/dynamic";

import {
  getResidencyCountries,
  getResidencyPrograms,
  ProgramMeta,
  CountryMeta,
} from "@/lib/residency-content";

const ResidencyLanding = nextDynamic(() => import("@/components/Residency/ResidencyLanding"));
const InsightsPreview = nextDynamic(() => import("@/components/Insights/InsightsPreview"));

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Golden Visa Programs – Residency by Investment",
  description:
    "The headline Golden Visa routes — Portugal, Greece, the UAE, Malta and more. Compare investment, timeline and benefits, then book a consultation.",
  alternates: { canonical: "/golden-visa" },
  openGraph: {
    title: "Golden Visa Programs – Residency by Investment",
    description:
      "The headline Golden Visa routes — Portugal, Greece, the UAE, Malta and more. Compare investment, timeline and benefits.",
    url: "https://www.xiphiasimmigration.com/golden-visa",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

// The headline residence-by-investment ("Golden Visa") destinations.
const GOLDEN_VISA_SLUGS = new Set([
  "portugal",
  "greece",
  "uae",
  "malta",
  "cyprus",
  "hungary",
  "latvia",
  "mauritius",
]);

function pickTopPrograms(all: ProgramMeta[], n = 10): ProgramMeta[] {
  const ranked = [...all].sort((a, b) => {
    const tA = a.timelineMonths ?? 999;
    const tB = b.timelineMonths ?? 999;
    if (tA !== tB) return tA - tB;
    const iA = a.minInvestment ?? Number.MAX_SAFE_INTEGER;
    const iB = b.minInvestment ?? Number.MAX_SAFE_INTEGER;
    if (iA !== iB) return iA - iB;
    return (a.title + a.country).localeCompare(b.title + b.country);
  });
  return ranked.slice(0, n);
}

export default function GoldenVisaPage() {
  const countries: CountryMeta[] = getResidencyCountries().filter((c) =>
    GOLDEN_VISA_SLUGS.has(c.countrySlug),
  );
  const programs = getResidencyPrograms().filter((p) => GOLDEN_VISA_SLUGS.has(p.countrySlug));
  const top = pickTopPrograms(programs, 10);

  return (
    <>
      <main className="max-w-screen-2xl mx-auto px-4 py-10">
        {/* Golden Visa hero band */}
        <header className="overflow-hidden rounded-3xl border border-[#c2992f]/30 bg-gradient-to-br from-[#0a1f44] to-[#0a2a6b] p-8 text-white shadow-lg sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c2992f]/40 bg-[#c2992f]/15 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#e0c879]">
            <Gem className="size-3.5" /> Residency by Investment
          </span>
          <h1 className="mt-5 max-w-3xl text-[clamp(2rem,4.8vw,3.25rem)] font-black leading-[1.05] tracking-tight">
            Golden Visa Programmes
          </h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-white/75">
            The headline residence-by-investment routes — Portugal, Greece, the UAE, Malta and more —
            compared by investment, timeline and the lifestyle, schooling and mobility they unlock.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/personal-booking"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c2992f] px-6 py-3 text-[14px] font-bold text-[#0a1f44] transition hover:bg-[#d8ad1f]"
            >
              Book a consultation <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/residency"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-white/20"
            >
              See all residency routes
            </Link>
          </div>
        </header>

        <div className="mt-8">
          <ResidencyLanding
            countries={countries}
            topPrograms={top}
            topHeading="Top Golden Visa Programmes"
          />
        </div>
      </main>
      <InsightsPreview limit={6} />
    </>
  );
}
