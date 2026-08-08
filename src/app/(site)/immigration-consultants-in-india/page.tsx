import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileCheck2,
  Globe2,
  Landmark,
  LockKeyhole,
  MessageSquareQuote,
  PlayCircle,
  Route,
  SearchCheck,
  Sparkles,
  Star,
  UserRoundCheck,
} from "lucide-react";

import ContactForm from "@/components/ContactForm";
import { JsonLd } from "@/lib/seo";

const SITE_URL = "https://www.xiphiasimmigration.com";
const PAGE_PATH = "/immigration-consultants-in-india";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Top Immigration Consultants in India | XIPHIAS",
  description:
    "Compare trusted immigration consultants in India for PR, skilled migration, residency, citizenship, Golden Visa and corporate immigration advice.",
  keywords: [
    "immigration consultants in India",
    "top immigration consultants in India",
    "best immigration consultants in India",
    "PR consultants in India",
    "overseas immigration consultants",
    "residency by investment consultants",
    "citizenship by investment consultants",
  ],
  alternates: { canonical: PAGE_PATH },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Top Immigration Consultants in India | XIPHIAS",
    description:
      "Eligibility-led immigration advice for PR, skilled migration, residency, citizenship, Golden Visa and corporate mobility.",
    url: PAGE_URL,
    siteName: "XIPHIAS Immigration",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/hero/top-immigration-counsultent.webp",
        width: 1800,
        height: 900,
        alt: "Family preparing for an international immigration journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Immigration Consultants in India | XIPHIAS",
    description:
      "Eligibility-led immigration advice for PR, skilled migration, residency, citizenship, Golden Visa and corporate mobility.",
    images: ["/images/hero/top-immigration-counsultent.webp"],
  },
};

const trustQuestions = [
  "How long has the company been operating?",
  "Which immigration pathways does it genuinely handle?",
  "Does it assess eligibility before recommending a program?",
  "Does it explain risks, alternatives, stages and fees clearly?",
  "Does it work with regulated professionals where required?",
  "Can it support investor, corporate and skilled migration cases?",
  "Does it protect confidential personal and financial information?",
];

const strengths = [
  {
    icon: BadgeCheck,
    title: "17+ Years of Experience",
    copy: "Immigration advisory since 2009 with a regulation-first approach to case assessment.",
  },
  {
    icon: Globe2,
    title: "50+ Countries",
    copy: "Pathway planning across multiple jurisdictions, matched to the client's objectives.",
  },
  {
    icon: Route,
    title: "100+ Immigration Programs",
    copy: "Skilled migration, PR, corporate mobility, residency, Golden Visa and citizenship routes.",
  },
  {
    icon: SearchCheck,
    title: "Transparent Advice",
    copy: "Eligibility, documentation, risks, expected stages and relevant fees explained before proceeding.",
  },
  {
    icon: FileCheck2,
    title: "End-to-End Support",
    copy: "From assessment and program selection to documentation, forms, submission and next steps.",
  },
  {
    icon: LockKeyhole,
    title: "Confidential Case Management",
    copy: "Controlled access, secure document handling and confidentiality-focused case processes.",
  },
];

const services = [
  {
    icon: UserRoundCheck,
    title: "PR and Skilled Migration",
    copy: "Profile-led permanent residence and skilled migration planning for professionals and families.",
    suitable: "Skilled professionals, managers, engineers, healthcare and technical specialists",
    href: "/skilled",
    cta: "Explore Skilled Migration",
  },
  {
    icon: Landmark,
    title: "Residency by Investment",
    copy: "Golden Visa and residency planning around mobility, family, investment and business priorities.",
    suitable: "HNIs, investors, founders, business owners and internationally mobile families",
    href: "/residency",
    cta: "Explore Residency Programs",
  },
  {
    icon: Globe2,
    title: "Citizenship by Investment",
    copy: "Due-diligence-led advice for investment, ancestry and residency-to-naturalisation routes.",
    suitable: "Families and investors evaluating mobility, security and long-term global options",
    href: "/citizenship",
    cta: "Check Citizenship Options",
  },
  {
    icon: BriefcaseBusiness,
    title: "Corporate Immigration",
    copy: "Structured work permit, employee relocation and corporate mobility support for organisations.",
    suitable: "HR teams, multinational companies, startups, SMEs and project-based organisations",
    href: "/corporate",
    cta: "Explore Corporate Immigration",
  },
];

const processSteps = [
  "Understand Your Goal",
  "Assess Eligibility",
  "Compare Suitable Options",
  "Build Your Strategy",
  "Prepare Documentation",
  "Application Support",
  "Decision and Next Steps",
];

const audiences = [
  ["Skilled Professionals", "Career-led work, visa and permanent residence pathways."],
  ["Families", "Immigration planning shaped around dependants and long-term settlement."],
  ["HNIs and Investors", "Residency and citizenship options aligned with mobility priorities."],
  ["Entrepreneurs and Founders", "Routes connected with investment, innovation and expansion."],
  ["Companies and HR Teams", "Organised employee relocation and corporate immigration support."],
];

const faqs = [
  {
    question: "Which are the top immigration consultants in India?",
    answer:
      "There is no official government ranking of immigration consultants in India. Compare relevant experience, transparent advice, service specialisation, documented company history, professional credentials where required and the quality of the initial assessment. XIPHIAS Immigration has operated since 2009 across skilled migration, residency, citizenship and corporate mobility.",
  },
  {
    question: "How do I choose the best immigration consultants in India?",
    answer:
      "Verify experience, program expertise, fee transparency, documentation processes, physical presence and whether the consultant avoids guaranteed-approval claims. A good consultation should clarify both suitable options and material risks.",
  },
  {
    question: "Can an immigration consultant guarantee my visa?",
    answer:
      "No. Immigration authorities make final application decisions. XIPHIAS does not guarantee immigration outcomes; recommendations depend on individual eligibility and the rules in force for the relevant program.",
  },
  {
    question: "What does an immigration consultation cover?",
    answer:
      "A structured consultation reviews your objectives, profile, dependants, timeline, budget and risk factors before discussing relevant routes, documentation, government stages and professional fees.",
  },
];

const pageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "Top Immigration Consultants in India for PR, Residency, Citizenship and Golden Visa",
      description:
        "Eligibility-led immigration advisory for skilled migration, PR, residency, citizenship, Golden Visa and corporate mobility.",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#service`,
      name: "Immigration consulting services in India",
      serviceType: "Immigration consulting and global mobility advisory",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      audience: [
        { "@type": "Audience", audienceType: "Skilled professionals and families" },
        { "@type": "Audience", audienceType: "Investors and entrepreneurs" },
        { "@type": "Audience", audienceType: "Companies and HR teams" },
      ],
      url: PAGE_URL,
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function ImmigrationConsultantsIndiaLandingPage() {
  return (
    <>
      <JsonLd id="immigration-consultants-india-jsonld" data={pageJsonLd} />

      <section className="relative isolate flex min-h-[760px] overflow-hidden bg-primary text-white">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt="Indian family preparing to travel abroad"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[44%_center] lg:object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[#082f77]/70" aria-hidden="true" />

        <div className="mx-auto flex w-full max-w-screen-2xl flex-col justify-center px-5 py-16 sm:px-8 lg:items-end lg:px-12 lg:py-20">
          <div className="max-w-3xl lg:w-[58%]">
            <p className="type-caption inline-flex items-center gap-2 uppercase text-[#f0c83f]">
              <Sparkles className="size-4" aria-hidden="true" />
              Immigration advisory since 2009
            </p>
            <h1 className="type-page-title mt-4 max-w-3xl text-white">
              Top Immigration Consultants in India for Residency, Citizenship and Golden Visa
            </h1>
            <div className="mt-5 max-w-2xl space-y-3 text-white/85">
              <p className="type-body font-bold">
                Trusted immigration advisory for individuals, families, investors, entrepreneurs
                and businesses seeking opportunities across 50+ countries.
              </p>
              <p className="type-small">
                Choosing among the top immigration consultants in India is not simply about finding
                someone who can prepare forms. You need an immigration consultant who can first
                determine whether a pathway genuinely suits your profile and then guide you through
                eligibility, documentation, compliance and submission.
              </p>
              <p className="type-small">
                XIPHIAS Immigration has provided immigration advisory services since 2009. Our work
                spans skilled migration, permanent residence, corporate mobility, residency by
                investment and citizenship by investment.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#consultation"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#f0c83f] px-5 py-3 text-sm font-bold text-[#123f8c] transition hover:bg-white focus-visible:ring-white"
              >
                Book a Free Consultation <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#services"
                className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:ring-white"
              >
                Explore Immigration Services <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <dl className="mt-9 grid max-w-2xl grid-cols-3 border-y border-white/25 py-4">
              {[
                ["17+", "Years of experience"],
                ["50+", "Countries"],
                ["100+", "Programs"],
              ].map(([value, label]) => (
                <div key={label} className="px-3 first:pl-0 last:pr-0 sm:px-5">
                  <dt className="text-2xl font-bold text-[#f0c83f] sm:text-3xl">{value}</dt>
                  <dd className="type-caption mt-1 text-white/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-12">
          <div>
            <p className="type-caption uppercase text-primary">Choose with clarity</p>
            <h2 className="type-section-title mt-3 text-slate-950">
              Looking for the Best Immigration Consultants in India? Start With the Right Questions
            </h2>
            <p className="type-body mt-5 text-slate-600">
              The important question behind the search is simple: who can you trust with a decision
              that may affect your career, family, investment or business?
            </p>
            <div className="mt-7 border-l-4 border-[#f0c83f] bg-primary px-5 py-5 text-white">
              <p className="type-card-title">Advice should come before a sales decision.</p>
              <p className="type-small mt-2 text-white/75">
                A professional immigration company should first understand your eligibility,
                objectives, budget and risk profile, then explain suitable options and trade-offs.
              </p>
            </div>
          </div>

          <ul className="grid content-start gap-x-8 gap-y-3 sm:grid-cols-2">
            {trustQuestions.map((question) => (
              <li key={question} className="flex gap-3 border-b border-slate-200 py-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="type-small font-bold text-slate-800">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="type-caption uppercase text-primary">Established immigration advisory</p>
            <h2 className="type-section-title mt-3 text-slate-950">
              Why XIPHIAS Is Among the Established Immigration Consultants in India
            </h2>
            <p className="type-body mt-4 text-slate-600">
              Experience matters, but useful advice also requires the ability to distinguish between
              skilled migration, investor mobility, citizenship planning and corporate immigration.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6">
                <Icon className="size-7 text-primary" aria-hidden="true" />
                <h3 className="type-card-title mt-5 text-slate-950">{title}</h3>
                <p className="type-small mt-2 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-32 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="type-caption uppercase text-primary">Immigration services</p>
              <h2 className="type-section-title mt-3 text-slate-950">
                One Objective Can Have Several Possible Pathways
              </h2>
            </div>
            <p className="type-body max-w-2xl text-slate-600 lg:justify-self-end">
              A structured consultation compares your profile, destination preferences, program
              requirements, documentation and application strategy before a route is recommended.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {services.map(({ icon: Icon, title, copy, suitable, href, cta }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="type-card-title text-slate-950">{title}</h3>
                    <p className="type-small mt-2 text-slate-600">{copy}</p>
                  </div>
                </div>
                <p className="type-small mt-5 border-t border-slate-200 pt-4 text-slate-600">
                  <strong className="text-slate-900">Suitable for:</strong> {suitable}
                </p>
                <Link href={href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  {cta} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-white sm:px-8">
            <div>
              <p className="type-card-title">Profile to pathway, with each decision explained.</p>
              <p className="type-small mt-1 text-white/70">
                Profile - Eligibility - Destination - Program - Documentation - Application Strategy
              </p>
            </div>
            <a href="#consultation" className="inline-flex items-center gap-2 text-sm font-bold text-[#f0c83f] hover:text-white">
              Check Your Immigration Options <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="type-caption uppercase text-primary">Independent review platforms</p>
              <h2 className="type-section-title mt-3 text-slate-950">
                How to Choose the Best Immigration Consultants in India
              </h2>
            </div>
            <p className="type-body max-w-3xl text-slate-600 lg:justify-self-end">
              Immigration rules are not static. Governments change occupation lists, investment
              thresholds, quotas, documentation requirements, processing systems and eligibility
              criteria. Established immigration consultants in India can add value by helping clients
              interpret current requirements and prepare appropriately, not merely complete paperwork.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <a
              href="https://g.page/r/CTH8DQwm1lYnEAE"
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-primary hover:shadow-sm"
              aria-label="Read XIPHIAS Immigration reviews on Google"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="type-card-title text-slate-950">Google Reviews</span>
                <span className="type-caption rounded-full bg-primary/10 px-3 py-1 text-primary">Verified listing</span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <strong className="text-4xl font-bold leading-none text-slate-950">4.7</strong>
                <span className="type-small text-slate-500">out of 5</span>
              </div>
              <div className="mt-3 flex gap-1 text-[#f0b91f]" aria-label="4.7 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-5 fill-current ${index === 4 ? "opacity-70" : ""}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="type-small mt-4 font-bold text-slate-700">1,347 Google reviews</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:underline">
                Read Google reviews <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>

            <a
              href="https://www.trustpilot.com/review/www.xiphiasimmigration.com"
              target="_blank"
              rel="noreferrer"
              className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-[#00b67a] hover:shadow-sm"
              aria-label="Read XIPHIAS Immigration reviews on Trustpilot"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="type-card-title text-slate-950">Trustpilot</span>
                <span className="type-caption rounded-full bg-[#00b67a]/10 px-3 py-1 text-[#007a52]">Claimed profile</span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <strong className="text-4xl font-bold leading-none text-slate-950">4.3</strong>
                <span className="type-small text-slate-500">out of 5</span>
              </div>
              <div className="mt-3 flex gap-1 text-[#00b67a]" aria-label="4.3 out of 5 stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`size-5 fill-current ${index === 4 ? "opacity-30" : ""}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="type-small mt-4 font-bold text-slate-700">12 Trustpilot reviews</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#007a52] group-hover:underline">
                Read Trustpilot reviews <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>

            <Link
              href="/reviews"
              className="group rounded-lg border border-slate-200 bg-primary p-6 text-white transition hover:bg-[#174b9b] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="type-card-title">Client Stories</span>
                <MessageSquareQuote className="size-6 text-[#f0c83f]" aria-hidden="true" />
              </div>
              <p className="type-body mt-6 font-bold">Testimonials, videos and client experiences</p>
              <p className="type-small mt-3 text-white/70">
                Explore detailed feedback and video experiences from people who have worked with the
                XIPHIAS team.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f0c83f] group-hover:text-white">
                <PlayCircle className="size-4" aria-hidden="true" /> View client reviews
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <p className="type-caption mt-5 text-slate-500">
            Ratings checked on 8 August 2026. Review scores and counts may change as Google and
            Trustpilot update their platforms.
          </p>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="type-caption uppercase text-[#f0c83f]">How the advisory works</p>
            <h2 className="type-section-title mt-3">Our Immigration Advisory Process</h2>
            <p className="type-body mt-4 text-white/75">
              Immigration rules, occupation lists, investment thresholds and documentation requirements
              change. The process keeps recommendations anchored to your profile and current program rules.
            </p>
          </div>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-7">
            {processSteps.map((step, index) => (
              <li key={step} className="min-h-36 bg-primary p-5">
                <span className="type-caption text-[#f0c83f]">0{index + 1}</span>
                <p className="type-small mt-5 font-bold text-white">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="type-caption uppercase text-primary">Who we work with</p>
            <h2 className="type-section-title mt-3 text-slate-950">
              Advice Shaped Around the Applicant, Family or Organisation
            </h2>
            <p className="type-body mt-5 text-slate-600">
              Overseas immigration advice is not one-size-fits-all. The relevant evidence, risk and
              program criteria change with the person or organisation making the application.
            </p>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {audiences.map(([title, copy]) => (
              <div key={title} className="grid gap-2 py-5 sm:grid-cols-[0.42fr_0.58fr] sm:gap-6">
                <h3 className="type-card-title text-slate-950">{title}</h3>
                <p className="type-small text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="type-caption uppercase text-primary">Frequently asked questions</p>
          <h2 className="type-section-title mt-3 text-slate-950">
            Immigration Consultants in India: What to Know Before You Choose
          </h2>
          <div className="mt-8 divide-y divide-slate-300 border-y border-slate-300">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group py-5" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left">
                  <span className="type-card-title text-slate-950">{faq.question}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-primary transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="type-body mt-4 max-w-4xl pr-12 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="consultation" className="scroll-mt-32 bg-primary py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-12">
          <div>
            <p className="type-caption uppercase text-[#f0c83f]">Your next step</p>
            <h2 className="type-section-title mt-3">
              Your Immigration Decision Starts With the Right Advice
            </h2>
            <p className="type-body mt-5 max-w-2xl text-white/75">
              Start with clarity, not promises. Share your objective and an advisor can help you
              understand which pathways may deserve a closer review.
            </p>

            <div className="mt-8 grid gap-5 border-y border-white/20 py-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <Image
                src="/images/avtar/varun-singh.png"
                alt="XIPHIAS senior immigration advisor"
                width={112}
                height={112}
                className="size-28 rounded-lg bg-white object-cover object-top"
              />
              <div>
                <p className="type-card-title">Talk to a Senior Immigration Advisor</p>
                <p className="type-small mt-2 text-white/70">
                  Confidential, profile-led guidance for skilled, family, investor and corporate cases.
                </p>
                <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  {["No guaranteed-outcome claims", "Eligibility-led recommendations", "Clear stages and next actions", "Confidential case handling"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-white/80">
                      <Check className="size-4 shrink-0 text-[#f0c83f]" aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ContactForm
            idPrefix="immigration-consultants-india"
            heading="Book a FREE immigration consultation"
            subheading="Tell us what you want to achieve. An advisor will respond within 24 hours."
            defaults={{ message: "I would like to discuss my immigration options in a free consultation." }}
            className="!max-w-none !rounded-lg !shadow-none"
          />
        </div>
        <p className="type-caption mx-auto mt-8 max-w-screen-2xl px-5 text-white/55 sm:px-8 lg:px-12">
          No obligation. Your information is handled confidentially. Immigration outcomes depend on
          individual eligibility and applicable program rules.
        </p>
      </section>
    </>
  );
}
