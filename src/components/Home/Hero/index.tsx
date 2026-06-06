"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

// Lazy-load ContactForm on the client only
function ContactFormSkeleton() {
  return (
    <div className="min-h-[420px] w-full animate-pulse rounded-xl bg-white/10 ring-1 ring-white/20" />
  );
}

const ContactForm = dynamic(() => import("@/components/ContactForm/index"), {
  ssr: false,
  loading: () => <ContactFormSkeleton />,
});

export default function Hero() {
  return (
    <section
      id="main-banner"
      aria-labelledby="home-hero-title"
      className="relative isolate z-0 overflow-hidden bg-transparent mt-[-1px] min-h-[100svh] flex items-stretch"
    >
      {/* Full-bleed background image + tint (sits behind content only) */}
      <div className="pointer-events-none absolute -inset-0 -z-10">
        <Image
          src="/images/hero/top-immigration-counsultent.webp"
          alt="Immigration consultants helping clients with global visas"
          fill
          priority
          fetchPriority="high"
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-blue-700/85 md:bg-blue-700/80" />
      </div>

      <div className="container mx-auto w-full px-4 lg:max-w-screen-2xl flex items-center">
        {/* ===================== TOP GRID ===================== */}
        <div className="grid w-full grid-cols-12 items-center gap-y-10 gap-x-6 lg:gap-x-12 py-16 md:py-20 lg:py-24">
          {/* LEFT: Text + CTAs */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-6">
            {/* Eyebrow */}
            <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
              <Image
                src="/images/icons/icon-bag.svg"
                alt=""
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="h-9 w-9"
              />
              <p className="mb-0 text-[15px] text-white/90">
                Residency & Citizenship <span className="font-semibold text-white">Made Easy</span>
              </p>
            </div>

            {/* Title */}
            <h1
              id="home-hero-title"
              className="mx-auto max-w-[18ch] text-center font-semibold leading-tight text-white lg:text-left"
              style={{ fontSize: "clamp(2rem, 6vw, 4.75rem)" }}
            >
              Secure Your <span className="font-bold text-white">Future</span> with Global{" "}
              <span className="font-bold text-white">Investment Visas</span>!
            </h1>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-6 lg:justify-start">
              <Link
                href="/eligibility"
                className="inline-flex items-center justify-center rounded-lg border border-secondary bg-secondary px-5 py-2.5 text-base font-medium text-black transition hover:bg-transparent hover:text-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Check your Eligibility
              </Link>

              <Link
                href="/images/residency/xiphias-corporate-mobility.pdf"
                className="inline-flex items-center justify-center rounded-lg border border-secondary bg-transparent px-5 py-2.5 text-base font-medium text-white transition hover:bg-secondary hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Download Guide
              </Link>
            </div>

            {/* Store badges */}
            <div className="mt-10 flex items-center justify-center gap-8 lg:justify-start">
              <Link
                href="/contact"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get the app on Google Play"
                className="transition hover:scale-[1.03]"
              >
                <Image
                  src="/images/hero/playstore.png"
                  alt="Get it on Google Play"
                  width={200}
                  height={60}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 160px, 200px"
                />
              </Link>

              <Link
                href="/contact" /* TODO: real link */
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download on the App Store"
                className="transition hover:scale-[1.03]"
              >
                <Image
                  src="/images/hero/applestore.png"
                  alt="Download on the App Store"
                  width={200}
                  height={60}
                  loading="lazy"
                  decoding="async"
                  sizes="(max-width: 640px) 160px, 200px"
                />
              </Link>
            </div>

            {/* MOBILE: Contact Form ALWAYS OPEN (no button) */}
            <div className="mt-8 lg:hidden">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
                <ContactForm />
              </div>
            </div>
          </div>

          {/* RIGHT: Desktop form (sticky) */}
          <aside className="relative col-span-12 hidden lg:col-span-5 xl:col-span-6 lg:block">
            <div className="lg:sticky lg:top-24">
              <div className="ml-auto w-full max-w-md rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.20)]">
                <ContactForm />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Subtle glow */}
      <div className="pointer-events-none absolute -right-16 -top-56 -z-10 h-64 w-64 rounded-full bg-secondary/30 blur-[120px] md:h-80 md:w-80" />
    </section>
  );
}
