import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, RefreshCw, Scale, ShieldCheck } from "lucide-react";
import { PassportIndexShell, PassportSourceNote, RouteCard } from "@/components/PassportIndex/PassportIndexShared";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "Passport Index Methodology - XIPHIAS",
  description:
    "Understand the XIPHIAS passport index presentation layer, source notes, advisory limitations, and how passport scores are used in mobility planning.",
  alternates: { canonical: "/passport-index/methodology" },
  openGraph: {
    title: "Passport Index Methodology - XIPHIAS",
    description: "Source notes, ranking limits, and XIPHIAS advisory interpretation for passport mobility.",
    url: `${SITE_URL}/passport-index/methodology`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

const principles = [
  {
    title: "Public mobility score",
    body: "The score is used as a travel-access signal based on public passport index information.",
  },
  {
    title: "XIPHIAS advisory lens",
    body: "The route suggestion considers family goals, investment appetite, physical presence, risk, and implementation fit.",
  },
  {
    title: "Human verification",
    body: "No passport ranking should be treated as legal, tax, or investment advice without staff review.",
  },
  {
    title: "Update discipline",
    body: "The launch version is a curated static snapshot. A licensed feed or admin-managed update workflow can replace it later.",
  },
];

export default function PassportMethodologyPage() {
  return (
    <PassportIndexShell
      active="methodology"
      eyebrow="Methodology"
      title="A transparent passport index layer for advisory conversations."
      description="This section explains what the XIPHIAS Passport Index displays, how it should be interpreted, and why advisor review remains mandatory."
    >
      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item, index) => (
            <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#eaf2ff] text-sm font-black text-[#1c57b4]">
                {index + 1}
              </span>
              <h2 className="mt-4 text-lg font-black text-[#071a3a] dark:text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-screen-2xl gap-5 px-4 pb-10 md:px-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-3">
            <FileCheck2 className="mt-1 size-6 shrink-0 text-[#1c57b4]" />
            <div>
              <h2 className="text-2xl font-black text-[#071a3a] dark:text-white">How XIPHIAS should use the page</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                The page is built for client education and presentation. It helps visitors browse mobility strength, compare passports, and enter the correct XIPHIAS workflow. It does not replace eligibility, legal, tax, due-diligence, or document review.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <Scale className="size-5 text-[#1c57b4]" />
              <h3 className="mt-3 font-black text-[#071a3a] dark:text-white">Ranking</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Useful for travel access comparison.</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <ShieldCheck className="size-5 text-[#0f6b47]" />
              <h3 className="mt-3 font-black text-[#071a3a] dark:text-white">Risk</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Requires source-of-funds and compliance review.</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <RefreshCw className="size-5 text-[#8a6500]" />
              <h3 className="mt-3 font-black text-[#071a3a] dark:text-white">Updates</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Should be refreshed through staff-approved content updates.</p>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <RouteCard
            icon={Scale}
            title="Ranking table"
            description="Search country ranks and open individual passport profiles."
            href="/passport-index/ranking"
            cta="Open ranking"
          />
          <RouteCard
            icon={ShieldCheck}
            title="Advisor workflow"
            description="Move a serious inquiry into eligibility, documents, and XIPHIAS Hub."
            href="/x-hub/x-passport"
            cta="Open X-Hub"
          />
        </aside>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pb-10 md:px-6">
        <div className="rounded-lg border border-[#e1b923]/45 bg-[#071a3a] p-5 text-white shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#f6d86d]">Presentation note</p>
          <h2 className="mt-2 text-2xl font-black">Future production upgrade</h2>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-white/80">
            For production, this can be connected to an admin-managed passport dataset, licensed index source, scheduled review task, and content approval workflow. That keeps the public page fast while maintaining accuracy.
          </p>
          <Link
            href="/passport-index"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#e1b923] px-4 py-3 text-sm font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
          >
            Back to overview <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
