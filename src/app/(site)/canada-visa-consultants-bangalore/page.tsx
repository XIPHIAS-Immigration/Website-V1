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
  Gauge,
  Globe2,
  MapPin,
  Route,
  SearchCheck,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import ContactForm from "@/components/ContactForm";
import { JsonLd } from "@/lib/seo";

const SITE_URL = "https://www.xiphiasimmigration.com";
const PAGE_PATH = "/canada-visa-consultants-bangalore";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HERO_IMAGE = "/images/skilled/canada/provincial-nominee-program.webp";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Canada Visa Consultants in Bangalore | Canada PR Experts",
  description:
    "Looking for Canada visa consultants in Bangalore? Explore Canada PR, Express Entry, PNP and skilled immigration options with XIPHIAS. Check your eligibility.",
  keywords: [
    "Canada visa consultants in Bangalore",
    "Canada immigration consultants Bangalore",
    "Canada PR consultants in Bangalore",
    "Canada visa in Bangalore",
    "Canada immigration Bangalore",
    "best Canada immigration consultants in Bangalore",
    "Canada consultancy in Bangalore",
    "Canada work permit consultants in Bangalore",
    "Express Entry consultants in Bangalore",
    "Canada PNP consultants in Bangalore",
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
    title: "Canada Visa Consultants in Bangalore | XIPHIAS Immigration",
    description:
      "Eligibility-led guidance for Canada PR, Express Entry, Provincial Nominee Programs and eligible work-permit pathways.",
    url: PAGE_URL,
    siteName: "XIPHIAS Immigration",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: HERO_IMAGE,
        width: 1920,
        height: 1080,
        alt: "Toronto skyline for Canada immigration applicants from Bangalore",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canada Visa Consultants in Bangalore | XIPHIAS Immigration",
    description: "Assess Canada PR, Express Entry, PNP and skilled immigration options from Bangalore.",
    images: [HERO_IMAGE],
  },
};

const assessmentFactors = [
  "Age and education",
  "Skilled work experience",
  "Occupation and NOC/TEER alignment",
  "English or French proficiency",
  "CRS score",
  "Provincial opportunities",
  "Spouse profile",
  "Canadian experience, if applicable",
];

const pathways = [
  {
    icon: Gauge,
    title: "Express Entry",
    copy: "Review federal economic immigration eligibility, CRS factors, language scores, education and skilled work experience.",
    href: "/skilled/canada/express-entry",
    cta: "Explore Express Entry",
  },
  {
    icon: MapPin,
    title: "Provincial Nominee Programs",
    copy: "Assess occupation demand, provincial criteria, connections, job-offer requirements and nomination opportunities.",
    href: "/skilled/canada/provincial-nominee-program",
    cta: "Explore Canada PNP",
  },
  {
    icon: BriefcaseBusiness,
    title: "Canada Work Permits",
    copy: "Understand employer requirements, work-authorisation pathways, supporting documents and possible long-term PR planning.",
    href: "/work-permits",
    cta: "Explore Work Permits",
  },
  {
    icon: Route,
    title: "Global Talent Stream",
    copy: "Explore eligible employer-led options for highly skilled technology and specialist occupations under the Global Talent Stream.",
    href: "/skilled/canada/global-talent-stream",
    cta: "Explore Global Talent Stream",
  },
];

const expressEntrySupport = [
  "Express Entry eligibility",
  "CRS score assessment",
  "Federal Skilled Worker assessment",
  "NOC/TEER guidance",
  "Educational Credential Assessment guidance",
  "Language-score planning",
  "Documentation preparation",
  "Invitation to Apply support",
];

const reasons = [
  {
    icon: SearchCheck,
    title: "Personalised Assessment",
    copy: "Your age, education, experience, language ability, occupation and objectives are reviewed before a pathway is discussed.",
  },
  {
    icon: Globe2,
    title: "Multiple Canada Pathways",
    copy: "Compare relevant Canada PR, Express Entry, PNP, skilled migration and eligible work-permit opportunities.",
  },
  {
    icon: FileCheck2,
    title: "Documentation Guidance",
    copy: "Receive structured guidance for the documents and evidence relevant to the pathway being considered.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent Process",
    copy: "Understand requirements, stages, costs, limitations and decision ownership before proceeding.",
  },
];

const professionals = [
  "Software professionals",
  "IT specialists",
  "Engineers",
  "Healthcare professionals",
  "Finance professionals",
  "Managers",
  "Technical specialists",
  "Skilled trades professionals",
];

const processSteps = [
  ["Profile Assessment", "Review age, education, experience, occupation and language."],
  ["Program Selection", "Compare Express Entry, PNP and relevant alternatives."],
  ["Required Assessments", "Complete language testing and ECA where required."],
  ["Immigration Profile", "Create and submit the relevant immigration profile."],
  ["Invitation or Nomination", "Eligible applicants may receive an invitation or provincial nomination."],
  ["PR Application", "Submit the required application and supporting documents."],
  ["Government Decision", "Canadian immigration authorities make the final decision."],
];

const selectionChecks = [
  ["Eligibility Assessment", "Does the consultant properly assess your complete profile?"],
  ["Multiple Pathways", "Are Express Entry, PNP and other relevant options explained?"],
  ["Transparent Fees", "Are professional, government and third-party costs clearly separated?"],
  ["No False Guarantees", "A consultant must never guarantee government approval."],
  ["Current Knowledge", "Advice should reflect current programme requirements and official guidance."],
];

const faqs = [
  {
    question: "Who are the best Canada immigration consultants in Bangalore?",
    answer:
      "The best Canada immigration consultants in Bangalore should provide eligibility-based advice, transparent communication, relevant programme expertise and clear documentation guidance without guaranteeing approval. XIPHIAS follows this assessment-led approach.",
  },
  {
    question: "How can I apply for Canada PR from Bangalore?",
    answer:
      "Depending on eligibility, applicants may evaluate Express Entry, Provincial Nominee Programs and other Canadian permanent-residence pathways. The correct route depends on the complete profile and current programme rules.",
  },
  {
    question: "Can I apply for Canada PR without a job offer?",
    answer:
      "Certain Canada PR pathways do not require a job offer. Eligibility depends on the programme and factors such as age, education, work experience, occupation and language results.",
  },
  {
    question: "Do Canada PR consultants guarantee approval?",
    answer:
      "No. Immigration, Refugees and Citizenship Canada and the relevant provincial authorities make final decisions. Professional Canada PR consultants in Bangalore should never guarantee approval.",
  },
];

const pageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "XIPHIAS Immigration - Canada Visa Consultants in Bangalore",
    url: PAGE_URL,
    image: `${SITE_URL}${HERO_IMAGE}`,
    telephone: "+91 9021335577",
    email: "immigration@xiphias.in",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1st Floor, JK Nirmala Arcade, Plot No. 780, 80 Feet Road, 4th Block, Koramangala",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      postalCode: "560034",
      addressCountry: "IN",
    },
    areaServed: ["Bengaluru", "Karnataka", "India"],
    serviceType: ["Canada immigration consulting", "Canada PR assessment", "Express Entry guidance", "Canada PNP guidance"],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Canada Visa Consultants in Bangalore", item: PAGE_URL },
    ],
  },
];

export default function CanadaVisaConsultantsBangalorePage() {
  return (
    <>
      <JsonLd id="canada-visa-consultants-bangalore-jsonld" data={pageJsonLd} />

      <section className="relative isolate min-h-[660px] overflow-hidden bg-primary text-white">
        <Image
          src={HERO_IMAGE}
          alt="Toronto skyline representing Canada immigration pathways from Bangalore"
          fill
          priority
          fetchPriority="high"
          className="-z-20 object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/45" />

        <div className="mx-auto flex min-h-[660px] max-w-screen-2xl items-center px-5 pb-16 pt-36 sm:px-8 lg:px-12">
          <div className="max-w-4xl">
            <p className="type-caption font-bold uppercase text-[#f0c83f]">Canada immigration guidance from Bengaluru</p>
            <h1 className="type-page-title mt-4 max-w-3xl">Canada Visa Consultants in Bangalore</h1>
            <p className="type-body mt-6 max-w-3xl text-white/85">
              XIPHIAS Immigration helps skilled professionals, families and businesses explore suitable
              pathways for Canada PR, Express Entry, Provincial Nominee Programs, skilled migration and
              eligible Canada work permits.
            </p>
            <p className="type-body mt-4 max-w-3xl text-white/75">
              Our Canada immigration consultants in Bangalore assess your age, education, experience,
              occupation, language ability and immigration goals before discussing a suitable pathway.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#consultation" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#f0c83f] px-5 py-3 text-sm font-bold text-primary transition hover:bg-white">
                Check Canada PR Eligibility <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a href="#consultation" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                Book a Consultation <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <dl className="mt-10 grid max-w-3xl grid-cols-3 border-y border-white/25 py-5">
              {[["4.7/5", "Google rating"], ["17+", "Years advising"], ["6", "Global offices"]].map(([value, label]) => (
                <div key={label} className="px-3 first:pl-0 sm:px-6">
                  <dt className="text-2xl font-bold text-[#f0c83f] sm:text-3xl">{value}</dt>
                  <dd className="type-caption mt-1 text-white/70">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12">
          <div>
            <p className="type-caption uppercase text-primary">Start with the complete profile</p>
            <h2 className="type-section-title mt-3 text-slate-950">Canada Immigration Consultants in Bangalore</h2>
            <p className="type-body mt-5 text-slate-600">
              Canada offers multiple pathways for skilled professionals and families. Choosing the right one
              depends on your individual facts, not on a standard sales package.
            </p>
            <p className="type-body mt-4 text-slate-600">
              Instead of treating Canada immigration as one process, XIPHIAS evaluates relevant pathways
              against your profile and objectives.
            </p>
            <Link href="/skilled/canada" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Explore Canada Immigration <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {assessmentFactors.map((factor) => (
              <li key={factor} className="flex items-center gap-3 border-b border-slate-200 py-4">
                <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="type-small font-bold text-slate-800">{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="type-caption uppercase text-primary">Canada pathway comparison</p>
              <h2 className="type-section-title mt-3 text-slate-950">Canada PR Consultants in Bangalore</h2>
            </div>
            <p className="type-body max-w-3xl text-slate-600 lg:justify-self-end">
              XIPHIAS Canada PR consultants in Bangalore help applicants understand which economic
              immigration and work-authorisation pathways deserve consideration before beginning.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {pathways.map(({ icon: Icon, title, copy, href, cta }) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="type-card-title text-slate-950">{title}</h3>
                    <p className="type-small mt-2 text-slate-600">{copy}</p>
                  </div>
                </div>
                <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  {cta} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-primary px-6 py-5 text-white sm:px-8">
            <div>
              <p className="type-card-title">Canada PR support, from profile review to application guidance.</p>
              <p className="type-small mt-1 text-white/70">Profile Assessment - CRS Review - Program Selection - Documentation - Application Guidance</p>
            </div>
            <a href="#consultation" className="inline-flex items-center gap-2 text-sm font-bold text-[#f0c83f] hover:text-white">
              Check My Canada PR Options <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12">
          <div className="overflow-hidden rounded-lg">
            <Image
              src="/images/skilled/canada/canada-express-entry.webp"
              alt="Canadian cityscape for Express Entry applicants from Bangalore"
              width={1920}
              height={1080}
              className="aspect-[16/10] w-full object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>
          <div>
            <p className="type-caption uppercase text-primary">Federal economic immigration</p>
            <h2 className="type-section-title mt-3 text-slate-950">Express Entry Consultants in Bangalore</h2>
            <p className="type-body mt-5 text-slate-600">
              Express Entry manages applications for major Canadian federal economic immigration programmes.
              Applicants receive a Comprehensive Ranking System score based on factors such as age, education,
              language proficiency and work experience.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {expressEntrySupport.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm font-bold text-slate-800">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
            <a href="#consultation" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Check Express Entry Eligibility <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="type-caption uppercase text-[#f0c83f]">Why XIPHIAS</p>
            <h2 className="type-section-title mt-3">Why Choose XIPHIAS for Canada Immigration in Bangalore?</h2>
            <p className="type-body mt-5 text-white/75">
              When comparing the best Canada immigration consultants in Bangalore, consider expertise,
              transparency and the quality of the eligibility assessment, not promises.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="min-h-64 bg-primary p-6">
                <Icon className="size-7 text-[#f0c83f]" aria-hidden="true" />
                <h3 className="type-card-title mt-6 text-white">{title}</h3>
                <p className="type-small mt-3 text-white/70">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#consultation" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#f0c83f] px-5 py-3 text-sm font-bold text-primary hover:bg-white">
              Book a Canada Consultation <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <Link href="/about" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
              About XIPHIAS <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/35 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
              Contact XIPHIAS <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="type-caption uppercase text-primary">Bengaluru talent</p>
            <h2 className="type-section-title mt-3 text-slate-950">Canada Immigration for Bangalore Professionals</h2>
            <p className="type-body mt-5 text-slate-600">
              Bangalore&apos;s technology and professional workforce makes Canada a frequent destination for
              skilled-migration enquiries. Occupation alone does not guarantee eligibility; the complete
              profile must be assessed.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              <Link href="/skilled/canada/global-talent-stream" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Explore Canada Global Talent Stream <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/skilled" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Explore Skilled Migration <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {professionals.map((professional) => (
              <li key={professional} className="flex min-h-16 items-center gap-3 border-b border-slate-200 px-1 py-3">
                <UserRoundCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="type-small font-bold text-slate-800">{professional}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <p className="type-caption uppercase text-primary">Application roadmap</p>
            <h2 className="type-section-title mt-3 text-slate-950">Canada Immigration Process from Bangalore</h2>
            <p className="type-body mt-5 text-slate-600">The exact sequence varies by programme and case, but a structured Canada immigration review generally follows these stages.</p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-7">
            {processSteps.map(([title, copy], index) => (
              <li key={title} className="min-h-56 bg-white p-5">
                <span className="type-caption font-bold text-primary">0{index + 1}</span>
                <h3 className="type-small mt-5 font-bold text-slate-950">{title}</h3>
                <p className="type-caption mt-2 text-slate-600">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12">
          <div>
            <p className="type-caption uppercase text-primary">Choose carefully</p>
            <h2 className="type-section-title mt-3 text-slate-950">How to Choose the Best Canada Immigration Consultants in Bangalore</h2>
            <p className="type-body mt-5 text-slate-600">
              The top Canada immigration consultants in Bangalore should help you understand whether a
              pathway is suitable, not simply sell an application.
            </p>
            <div className="mt-7 border-l-4 border-[#f0c83f] bg-primary px-5 py-5 text-white">
              <p className="type-card-title">Clear advice should come before commitment.</p>
              <p className="type-small mt-2 text-white/70">Requirements change. Verify current programme criteria before making an immigration or payment decision.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {selectionChecks.map(([title, copy]) => (
              <div key={title} className="grid gap-2 py-5 sm:grid-cols-[0.38fr_0.62fr] sm:gap-6">
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
          <h2 className="type-section-title mt-3 text-slate-950">Canada Immigration and PR Questions from Bangalore</h2>
          <div className="mt-8 divide-y divide-slate-300 border-y border-slate-300">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group py-5" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left">
                  <span className="type-card-title text-slate-950">{faq.question}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 text-primary transition group-open:rotate-45" aria-hidden="true">+</span>
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
            <p className="type-caption uppercase text-[#f0c83f]">Start with eligibility</p>
            <h2 className="type-section-title mt-3">Start Your Canada Immigration Journey from Bangalore</h2>
            <p className="type-body mt-5 max-w-2xl text-white/75">
              Whether you are comparing Canada PR consultants in Bangalore, Express Entry consultants,
              Canada PNP consultants or Canada work permit consultants, begin with the complete profile.
            </p>

            <div className="mt-8 border-y border-white/20 py-6">
              <div className="flex gap-4">
                <MapPin className="mt-1 size-6 shrink-0 text-[#f0c83f]" aria-hidden="true" />
                <div>
                  <h3 className="type-card-title">XIPHIAS Bengaluru HQ</h3>
                  <p className="type-small mt-2 max-w-xl text-white/70">1st Floor, JK Nirmala Arcade, Plot No. 780, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034</p>
                  <p className="type-small mt-3 font-bold text-white">+91 9021335577 &nbsp; | &nbsp; immigration@xiphias.in</p>
                </div>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Eligibility-led guidance", "No guaranteed outcome claims", "Clear stages and limitations", "Confidential case handling"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/80"><BadgeCheck className="size-4 shrink-0 text-[#f0c83f]" aria-hidden="true" /> {item}</li>
              ))}
            </ul>
          </div>

          <ContactForm
            idPrefix="canada-visa-consultants-bangalore"
            heading="Check your Canada PR eligibility"
            subheading="Share your profile. A XIPHIAS advisor will respond within 24 hours."
            defaults={{ message: "I would like to assess my Canada PR, Express Entry or PNP options from Bangalore." }}
            className="!max-w-none !rounded-lg !shadow-none"
          />
        </div>
        <p className="type-caption mx-auto mt-8 max-w-screen-2xl px-5 text-white/55 sm:px-8 lg:px-12">
          No obligation. Your information is handled confidentially. Eligibility and outcomes depend on individual facts and current Canadian immigration rules.
        </p>
      </section>
    </>
  );
}
