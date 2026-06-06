import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PartnerWithUsForm from "@/components/PartnerWithUs/PartnerWithUsForm";
import { BOOKING_PAID_ROUTE } from "@/components/PersonalBooking/booking-flow";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Globe2,
  Handshake,
  Landmark,
  LineChart,
  ShieldCheck,
  UserRoundSearch,
  Users2,
} from "lucide-react";

const CANONICAL = "/partner-with-us";
const ABSOLUTE_URL = "https://www.xiphiasimmigration.com/partner-with-us";

const partnerTypes = [
  {
    icon: Landmark,
    title: "Private advisory and wealth firms",
    description:
      "We support advisors working with global investors by providing clear, structured solutions for residency and investment migration.",
  },
  {
    icon: Building2,
    title: "Corporations and global mobility teams",
    description:
      "We help businesses manage employee relocation, international hiring, and expansion into new countries without delays or confusion.",
  },
  {
    icon: Users2,
    title: "Strategic and referral partners",
    description:
      "We act as your backend support to deliver high-quality migration solutions while you stay in control of your client relationships.",
  },
];

const valueCards = [
  {
    icon: LineChart,
    title: "17+ years of industry experience",
    description:
      "Proven expertise across investment migration, corporate mobility, and skilled visa solutions.",
  },
  {
    icon: BadgeCheck,
    title: "6,000+ successful relocations",
    description:
      "A strong track record of delivering consistent results for clients worldwide.",
  },
  {
    icon: Globe2,
    title: "25+ global jurisdictions",
    description:
      "Coverage across leading residency, citizenship, and business migration destinations.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-first approach",
    description:
      "Every case is handled with strict adherence to regulations, accuracy, and reliability.",
  },
];

const privateConsultationFeatures = [
  {
    title: "IMC-led advisory",
    description:
      "Every case is guided by a certified IMC professional, ensuring informed decisions and the right migration pathway.",
  },
  {
    title: "Strategy before execution",
    description:
      "We define the right pathway before any commitment is made, so the engagement begins with clarity rather than assumption.",
  },
  {
    title: "Structured engagement process",
    description:
      "Qualified opportunities move from initial discussion into a private, strategy-led consultation with clear next steps and practical direction.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Qualification and strategic fit",
    description:
      "We assess your business model and client requirements to define the right partnership approach, whether referral, white-label, or co-advisory.",
  },
  {
    number: "02",
    title: "Case evaluation and pathway mapping",
    description:
      "Each case is carefully reviewed and matched with the most suitable migration option before it moves any further.",
  },
  {
    number: "03",
    title: "Seamless and confidential execution",
    description:
      "We manage the process with discretion and clarity, allowing you to focus on your clients and business growth.",
  },
];

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Partner With Us | XIPHIAS Immigration",
  description:
    "Strategic global mobility partnerships for private advisory firms, corporate mobility teams, and referral partners backed by 17+ years, 25+ jurisdictions, and compliance-first execution.",
  keywords: [
    "partner with XIPHIAS Immigration",
    "global mobility partner",
    "immigration backend partner",
    "corporate mobility partnership",
    "investment migration partner",
    "referral partner immigration",
    "private advisory immigration support",
  ],
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    title: "Partner With Us | XIPHIAS Immigration",
    description:
      "Trusted B2B global mobility support for private advisory firms, corporations, and referral partners seeking structured, compliance-first immigration execution.",
    url: ABSOLUTE_URL,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Partner with XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner With Us | XIPHIAS Immigration",
    description:
      "Trusted experts in global mobility and migration for partner firms, corporates, and referral networks.",
    images: ["/xiphias-immigration.png"],
  },
  robots: { index: true, follow: true },
};

export default function PartnerWithUsPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Immigration partnership and global mobility advisory",
    name: "Partner With Us",
    provider: {
      "@type": "Organization",
      name: "XIPHIAS Immigration",
      url: "https://www.xiphiasimmigration.com",
    },
    areaServed: "Worldwide",
    url: ABSOLUTE_URL,
    description:
      "Structured global mobility support for private advisory firms, corporate mobility teams, and strategic referral partners, with strategy-led consultation for qualified opportunities.",
  };

  return (
    <main className="container mx-auto max-w-screen-2xl px-4 py-6 text-black sm:px-6 lg:px-8 dark:text-white">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Partner With Us", url: CANONICAL },
        ])}
      />
      <JsonLd data={serviceJsonLd} />

      <Hero />

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <Handshake className="h-3.5 w-3.5" />
              Who we partner with
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Built for firms that need reliable mobility execution</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              We work with selected firms and professional networks that need reliable support for handling global mobility and migration matters with accuracy, consistency, and clear strategic direction.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {partnerTypes.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/50"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/40">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 text-white shadow-[0_20px_60px_rgba(2,6,23,0.24)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15">
              <BadgeCheck className="h-3.5 w-3.5" />
              The XIPHIAS advantage
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Why partners choose XIPHIAS</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {valueCards.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200 ring-1 ring-white/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/30 dark:text-amber-100 dark:ring-amber-900/40">
              <UserRoundSearch className="h-3.5 w-3.5" />
              Private consultation
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Clarity. Direction. Execution.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Qualified opportunities move into a private, strategy-led consultation for investors and professionals seeking clarity, direction, and expert guidance. This is where we align the right migration pathway before formal execution begins.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {privateConsultationFeatures.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/50"
                >
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">What you get</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                {[
                  "A strategy tailored to the client profile",
                  "The most suitable visa or residency options",
                  "Guidance to move the case forward",
                  "Clear timelines and transparent costs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/personal-booking"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700"
              >
                View Personal Booking
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 font-semibold text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
              >
                Contact
              </Link>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-100 dark:ring-emerald-900/40">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Operating model
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">How our partnership works</h2>
            <div className="mt-6 space-y-4">
              {processSteps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-slate-950/50 md:grid-cols-[76px_minmax(0,1fr)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-blue-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-blue-200 dark:ring-white/10">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <PartnerWithUsForm className="lg:sticky lg:top-24 lg:self-start" />
      </section>
    </main>
  );
}

function Hero() {
  return (
    <>
      <section
        aria-labelledby="partner-with-us-title"
        className="relative overflow-hidden rounded-[32px] border border-blue-100/80 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8 lg:p-10 dark:border-blue-900/40 dark:from-blue-950/30 dark:via-slate-950 dark:to-indigo-950/20"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
          <div className="absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
          <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(65%_65%_at_50%_40%,black,transparent_80%)]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
        </div>

        <div className="relative grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_360px]">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:text-slate-100 dark:ring-blue-900/50">
              <Handshake className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300" />
              Trusted experts in global relocation
            </span>
            <h1
              id="partner-with-us-title"
              className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Your partner in global mobility and migration
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
              At XIPHIAS, we do not just process applications. We build structured, end-to-end global mobility solutions for businesses, partner firms, and professional networks operating across international markets. From the first eligibility assessment to final execution, we function as your dedicated backend partner with precision, regulatory compliance, and a clear strategic roadmap.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
              Whether you are supporting high-net-worth individuals, skilled professionals, or corporate expansion plans, our systems are designed to scale without compromising accuracy or timelines.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2.5 text-xs sm:text-sm">
              {[
                "17+ years industry experience",
                "25+ jurisdictions",
                "6,000+ relocations",
                "Compliance-first delivery",
              ].map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 font-medium text-slate-700 ring-1 ring-blue-100 backdrop-blur dark:bg-white/5 dark:text-slate-100 dark:ring-white/10"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-300" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#partner-form"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700"
              >
                Discuss a partnership
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/personal-booking"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 font-semibold text-blue-700 ring-1 ring-blue-300 transition hover:bg-blue-50 dark:bg-white/5 dark:text-blue-200 dark:ring-blue-800/60 dark:hover:bg-blue-950/20"
              >
                View Personal Booking
              </Link>
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Private consultation
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/50">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Clarity. Direction. Execution.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  A one-on-one session to understand the requirement and guide the case towards the right migration path clearly and practically.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  {[
                    "Tailored strategy",
                    "Right pathway options",
                    "Transparent next steps",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href="/contact"
                prefetch={false}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm ring-1 ring-blue-700/20 transition hover:bg-blue-700"
              >
                Book Strategy Consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <div className="mt-3">
        <Breadcrumb />
      </div>
    </>
  );
}
