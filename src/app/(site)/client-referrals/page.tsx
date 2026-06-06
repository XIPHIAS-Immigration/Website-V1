// src/app/(site)/client-referrals/page.tsx

import type { Metadata } from "next";
import ReferralForm from "@/components/Referral/ReferralForm";
import Breadcrumb from "@/components/Common/Breadcrumb";

const CANONICAL = "/client-referrals";
const ABSOLUTE_URL =
    "https://www.xiphiasimmigration.com/client-referrals";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Client Referral Program | XIPHIAS Immigration",
    description:
        "Refer friends, family, or colleagues to XIPHIAS Immigration and help them access trusted residency and citizenship advisory.",
    keywords: [
        "XIPHIAS Immigration referral",
        "client referrals",
        "refer a friend",
        "immigration consultant referral program",
    ],
    alternates: {
        canonical: CANONICAL,
    },
    openGraph: {
        title: "Client Referral Program | XIPHIAS Immigration",
        description:
            "Introduce friends and family to trusted immigration experts at XIPHIAS. Earn rewards when your referral becomes a client.",
        url: ABSOLUTE_URL,
        siteName: "XIPHIAS Immigration",
        type: "website",
        images: [
            {
                url: "/xiphias-immigration.png",
                width: 1200,
                height: 630,
                alt: "Client referral program at XIPHIAS Immigration",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Client Referral Program | XIPHIAS Immigration",
        description:
            "Share the benefits of trusted immigration advisory with your network and earn referral rewards.",
        images: ["/xiphias-immigration.png"],
    },
    robots: { index: true, follow: true },
};

export default function ClientReferralsPage() {
    return (
        <main
            id="main"
            className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6 text-black dark:text-white"
        >
            <ReferralHero />

            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
                <ProgramExplainer />
                <ReferralForm
                    id="referral-form"
                    onSuccessRedirect="/client-referrals/thank-you"
                />
            </section>
        </main>
    );
}

/* ----------------------------- HERO SECTION ----------------------------- */

function ReferralHero() {
    const heroId = "hero-referral-title";

    return (
        <>
            <section
                aria-labelledby={heroId}
                className={[
                    "relative overflow-hidden rounded-3xl p-6 md:p-8 lg:p-10",
                    "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
                    "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
                    "text-black dark:text-white",
                ].join(" ")}
            >
                {/* decorative background, same logic as your HeroPremium */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
                    <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
                    <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
                    </div>
                </div>

                <div className="relative text-left md:max-w-3xl">
                    {/* Badge */}
                    <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                        <Dot className="mr-1.5" />
                        Client Referral Program
                    </span>

                    {/* Title */}
                    <h1
                        id={heroId}
                        className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight"
                    >
                        Refer a friend. Reward their move – and yours.
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-3 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 md:text-base">
                        Many of our new clients come through recommendations from existing
                        clients. Use this dedicated referral page to introduce friends,
                        family, or colleagues who are serious about relocating, investing,
                        or studying abroad.
                    </p>

                    {/* Feature chips */}
                    <ul className="mt-5 flex flex-wrap gap-2.5 text-xs">
                        <li className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                            <Check />
                            <span>Dedicated referral & relationship desk</span>
                        </li>
                        <li className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                            <Check />
                            <span>Discreet and consent-based outreach</span>
                        </li>
                        <li className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
                            <Check />
                            <span>Earn rewards on successful sign-ups</span>
                        </li>
                    </ul>

                    {/* CTA */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <a
                            href="#referral-form"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm ring-1 ring-blue-700/20 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:bg-blue-800 transition"
                            aria-label="Refer a client now"
                        >
                            Refer a client now
                            <ArrowRight />
                        </a>

                        <span className="ml-0 md:ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                            No spam · We only contact people you refer about immigration
                            options
                        </span>
                    </div>
                </div>
            </section>

            <div className="mt-3">
                <Breadcrumb />
            </div>
        </>
    );
}

/* ------------------------- PROGRAM EXPLAINER BLOCK ------------------------- */

function ProgramExplainer() {
    return (
        <section aria-labelledby="referral-how-it-works" className="space-y-6">
            <div>
                <h2
                    id="referral-how-it-works"
                    className="text-lg sm:text-xl font-semibold"
                >
                    How the referral program works
                </h2>
                <ol className="mt-3 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
                    <li>
                        <strong className="font-semibold">1. Submit the form</strong>
                        <br />
                        Share your details and your friend’s details with basic context
                        about their plans.
                    </li>
                    <li>
                        <strong className="font-semibold">
                            2. Our team reaches out discreetly
                        </strong>
                        <br />
                        A referrals specialist contacts them, mentions your name, and
                        schedules a consultation if they are interested.
                    </li>
                    <li>
                        <strong className="font-semibold">
                            3. You earn rewards on successful cases
                        </strong>
                        <br />
                        Once they sign up and progress with us, your referral rewards are
                        processed as per the current program terms.
                    </li>
                </ol>
            </div>

            <div>
                <h3 className="text-sm font-semibold">Who is a good fit to refer?</h3>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5">
                    <li>
                        Professionals exploring PR or work routes (Canada, Australia, etc.)
                    </li>
                    <li>
                        Investors evaluating Golden Visa / residency-by-investment options
                    </li>
                    <li>
                        Families planning relocation for better education and lifestyle
                    </li>
                    <li>
                        Entrepreneurs and HNIs seeking global mobility or second citizenship
                    </li>
                </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 dark:bg-blue-950/20 dark:border-blue-900/60 px-4 py-3 text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">Compliance & confidentiality</p>
                <p>
                    All referrals are handled in line with our privacy policy and
                    anti-fraud standards. We will never sell or misuse the information you
                    share. Your referral is always free to decline further contact.
                </p>
            </div>
        </section>
    );
}

/* --------------------------- tiny inline icons --------------------------- */

function Check() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-3.5 w-3.5 fill-blue-600 dark:fill-blue-400"
        >
            <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-4-4A1 1 0 0 1 5.457 8.543l3.293 3.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
        </svg>
    );
}
function ArrowRight() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
            <path
                fill="currentColor"
                d="M5 12.75h11.19l-3.72 3.72a.75.75 0 1 0 1.06 1.06l5.25-5.25a.75.75 0 0 0 0-1.06L13.53 5.97a.75.75 0 1 0-1.06 1.06l3.72 3.72H5a.75.75 0 0 0 0 1.5z"
            />
        </svg>
    );
}
function Dot({ className = "" }: { className?: string }) {
    return (
        <span
            className={`inline-block h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${className}`}
        />
    );
}
