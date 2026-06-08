import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, GraduationCap, Home, Landmark, Route, ShieldCheck } from "lucide-react";
import {
  PassportIndexShell,
  PassportSourceNote,
  RouteCard,
} from "@/components/PassportIndex/PassportIndexShared";
import LazyPassportWorldMap from "@/components/PassportIndex/LazyPassportWorldMap";
import { passportRecords } from "@/data/passport-index";

const SITE_URL = "https://www.xiphiasimmigration.com";

export const metadata: Metadata = {
  title: "Improve Passport Mobility - XIPHIAS Passport Index",
  description:
    "Explore the main ways XIPHIAS helps clients improve global mobility through residence, citizenship, skilled, and corporate routes.",
  alternates: { canonical: "/passport-index/improve" },
  openGraph: {
    title: "Improve Passport Mobility - XIPHIAS Passport Index",
    description: "Turn passport ranking into a practical mobility route map.",
    url: `${SITE_URL}/passport-index/improve`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: ["/xiphias-immigration.png"],
  },
};

export const revalidate = 86400;

const steps = [
  "Confirm current passport, family members, citizenships, and residence history.",
  "Define the main goal: travel access, EU lifestyle, education, business, tax residence, or Plan B.",
  "Shortlist routes by budget, timeline, stay requirement, due diligence, and document readiness.",
  "Move the selected route into XIPHIAS Hub for milestones, document vault, risk review, and advisor follow-up.",
];

export default function ImprovePassportMobilityPage() {
  return (
    <PassportIndexShell
      active="improve"
      eyebrow="Improve mobility"
      title="Move from passport ranking to an actionable route."
      description="The best route is rarely just the highest rank. XIPHIAS compares the client's goal, funds, family, documents, and risk profile before recommending the next move."
    >
      <section className="mx-auto grid max-w-screen-2xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1fr_460px]">
        <div>
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1c57b4]">Route families</p>
            <h2 className="mt-2 text-3xl font-black text-[#071a3a] dark:text-white">Choose the path before choosing the country.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <RouteCard
              icon={Home}
              title="Residence by investment"
              description="For families seeking second residence, Schengen access, lifestyle, or long-term citizenship planning."
              href="/residency"
              cta="View residency"
            />
            <RouteCard
              icon={Landmark}
              title="Citizenship by investment"
              description="For clients focused on travel freedom, timeline, and family inclusion through eligible CBI programs."
              href="/citizenship"
              cta="View citizenship"
            />
            <RouteCard
              icon={GraduationCap}
              title="Skilled migration"
              description="For applicants using education, professional background, job routes, or points-based systems."
              href="/skilled"
              cta="View skilled routes"
            />
            <RouteCard
              icon={BriefcaseBusiness}
              title="Corporate mobility"
              description="For founders, investors, executives, and companies expanding through transfer or setup routes."
              href="/corporate"
              cta="View corporate routes"
            />
          </div>
        </div>

        <aside className="grid gap-5">
          <LazyPassportWorldMap records={passportRecords} />
          <div className="rounded-lg border border-[#e1b923]/45 bg-[#071a3a] p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-md bg-[#e1b923] text-[#071a3a]">
                <Route className="size-5" />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#f6d86d]">Advisor flow</p>
                <h2 className="text-xl font-black">Stepwise route plan</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-md border border-white/15 bg-white/10 p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e1b923] text-sm font-black text-[#071a3a]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-white/82">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 pb-10 md:px-6">
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 size-6 shrink-0 text-[#1c57b4]" />
              <div>
                <h2 className="text-2xl font-black text-[#071a3a] dark:text-white">What makes this different from a normal index</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  A public ranking tells you access. XIPHIAS adds eligibility, due diligence, document readiness, timeline, and implementation tracking.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {["Source of funds", "Family inclusion", "Physical presence"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                  <CheckCircle2 className="size-4 text-[#0f6b47]" />
                  <span className="text-sm font-black text-[#071a3a] dark:text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/x-hub/x-passport"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1c57b4] px-5 py-3 text-sm font-black text-white transition hover:bg-[#15458f]"
          >
            Open X-Passport engine <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <PassportSourceNote />
    </PassportIndexShell>
  );
}
