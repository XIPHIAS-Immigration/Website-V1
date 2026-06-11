import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPinned, ShieldCheck } from "lucide-react";
import {
  bandClass,
  getRecordByCode,
  PassportBookVisual,
  PassportIndexShell,
  PassportMiniCard,
  PassportSourceNote,
  scoreWidth,
} from "@/components/PassportIndex/PassportIndexShared";
import PassportCountryShowcase from "@/components/PassportIndex/PassportCountryShowcase";
import { passportIndexStats, passportRecords } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

type PageProps = {
  params: Promise<{ code: string }>;
};

export function generateStaticParams() {
  return passportRecords.map((record) => ({ code: record.code.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const record = getRecordByCode(passportRecords, code);

  if (!record) {
    return {
      title: "Passport Profile - XIPHIAS Passport Power",
      alternates: { canonical: "/passport-index/ranking" },
    };
  }

  return {
    title: `${record.country} Passport Profile - XIPHIAS Passport Power`,
    description: `View the ${record.country} passport score, rank, mobility band, and XIPHIAS advisory context.`,
    alternates: { canonical: `/passport-index/passport/${record.code.toLowerCase()}` },
    openGraph: {
      title: `${record.country} Passport Profile - XIPHIAS Passport Power`,
      description: `Passport mobility score, rank, and XIPHIAS planning context for ${record.country}.`,
      url: `${SITE_URL}/passport-index/passport/${record.code.toLowerCase()}`,
      siteName: "XIPHIAS Immigration",
      type: "website",
      images: ["/xiphias-immigration.png"],
    },
  };
}

export const revalidate = 86400;

export default async function PassportProfilePage({ params }: PageProps) {
  const { code } = await params;
  const record = getRecordByCode(passportRecords, code);

  if (!record) notFound();

  const strongerOptions = passportRecords
    .filter((item) => item.score > record.score && item.code !== record.code)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${record.country} Passport Profile`,
    url: `${SITE_URL}/passport-index/passport/${record.code.toLowerCase()}`,
    description: `XIPHIAS passport mobility profile for ${record.country}.`,
    publisher: {
      "@type": "Organization",
      name: "XIPHIAS Immigration",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PassportIndexShell
        active="ranking"
        eyebrow="Passport profile"
        title={`${record.country} passport mobility profile`}
        description="A country-level profile for rank, score, mobility band, route links, and the XIPHIAS advisory interpretation."
      >
        <section className="mx-auto grid max-w-screen-2xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1fr_460px]">
          <div className="grid gap-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">{record.code}</p>
                  <h2 className="mt-2 text-4xl font-black text-[#071a3a] dark:text-white">{record.country}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{record.xiphiasLens}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-sm font-black ${bandClass(record.band)}`}>
                  {record.band}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Global rank</p>
                  <p className="mt-1 text-3xl font-black text-[#071a3a] dark:text-white">{record.rank}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Visa-free score</p>
                  <p className="mt-1 text-3xl font-black text-[#1c57b4]">{record.score}</p>
                </div>
                <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                  <p className="text-sm text-slate-500">Movement</p>
                  <p className="mt-1 text-lg font-black text-[#071a3a] dark:text-white">{record.movement}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>Score against current top score</span>
                  <span>{record.score} / {passportIndexStats.topScore}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-[#e1b923]" style={{ width: scoreWidth(record.score, passportIndexStats.topScore) }} />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex gap-3">
                <MapPinned className="mt-1 size-6 shrink-0 text-[#1c57b4]" />
                <div>
                  <h2 className="text-2xl font-black text-[#071a3a] dark:text-white">XIPHIAS interpretation</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{record.advisoryNote}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Travel access", "Family objective", "Compliance fit"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                    <CheckCircle2 className="size-4 shrink-0 text-[#0f6b47]" />
                    <span className="text-sm font-black text-[#071a3a] dark:text-white">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Higher access examples</p>
                <h2 className="mt-2 text-2xl font-black text-[#071a3a] dark:text-white">Compare possible target benchmarks</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {strongerOptions.map((item) => (
                  <PassportMiniCard key={item.code} record={item} stats={passportIndexStats} />
                ))}
              </div>
            </section>
          </div>

          <aside className="grid gap-5">
            <div className="group">
              <PassportBookVisual featured={record} />
            </div>
            <div className="rounded-lg border border-[#e1b923]/45 bg-[#071a3a] p-5 text-white shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck className="mt-1 size-6 shrink-0 text-[#f6d86d]" />
                <div>
                  <h2 className="text-xl font-black">Next XIPHIAS action</h2>
                  <p className="mt-2 text-sm leading-6 text-white/78">
                    Review the available route links below, then move serious interest to eligibility or advisor review.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {record.pathways.map((pathway) => (
                  <Link
                    key={pathway.href}
                    href={pathway.href}
                    className="inline-flex items-center justify-between rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    {pathway.label}
                    <ArrowRight className="size-4" />
                  </Link>
                ))}
                <Link
                  href="/personal-booking"
                  className="inline-flex items-center justify-between rounded-md bg-[#e1b923] px-4 py-3 text-sm font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
                >
                  Speak to advisor
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
        </section>

        <PassportCountryShowcase record={record} />

        <PassportSourceNote />
      </PassportIndexShell>
    </>
  );
}
