import type { Metadata } from "next";
import React from "react";
import { awardsData } from "@/components/awards/awards.data";
import { HeroAwards } from "@/components/awards/HeroAwards"; // hero stays static for optimal LCP
// Dynamically import heavier components below the fold to reduce initial JS payload and improve performance【330944343751455†L23-L112】.
import nextDynamic from "next/dynamic";

// Dynamically import the client components. When the module exports named components (no default export),
// we must explicitly select the correct export in the promise to avoid passing the entire module to the
// client component. If we omit the selector, Next.js will attempt to use the default export and end up
// passing the module object itself, which triggers a runtime error (“Only plain objects can be passed…”)【709169303420970†screenshot】.
const AwardsGrid = nextDynamic(() =>
  import("@/components/awards/AwardsGrid").then((mod) => mod.AwardsGrid)
);

// Breadcrumb has a default export, so importing the module directly is fine. However, we still load it
// dynamically to keep the initial JS payload small.
const Breadcrumb = nextDynamic(() =>
  import("@/components/Common/Breadcrumb").then((mod) => mod.default)
);
export const metadata: Metadata = {
  title: "Awards & Recognition",
  description:
    "Independent accolades that recognize our quality, leadership, and client service.",
  alternates: { canonical: "/awards" },
  openGraph: {
    title: "Awards & Recognition",
    description:
      "Independent accolades that recognize our quality, leadership, and client service.",
    url: "https://www.xiphiasimmigration.com/awards",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/xiphias-immigration.png",
        width: 1200,
        height: 630,
        alt: "Awards & Recognition – XIPHIAS Immigration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awards & Recognition",
    description:
      "Independent accolades that recognize our quality, leadership, and client service.",
    images: ["/xiphias-immigration.png"],
  },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:py-12">
      <HeroAwards />
      {/* breadcrumb under the card */}
      <div>
        <Breadcrumb />
      </div>

      <section className="pt-5">
        <div className="mb-6 md:mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-4 sm:p-5 md:p-6 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/10">
            {/* soft background accents (clipped inside) */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
              <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
              <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(70%_70%_at_10%_10%,black,transparent_75%)]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
              </div>
            </div>

            {/* content: responsive flex with title + CTA */}
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <h2
                id="insights-top6-title"
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white break-words"
              >
                Most Awarded Immigration Company
              </h2>
            </div>
          </div>
        </div>
        <AwardsGrid items={awardsData} />
      </section>
    </main>
  );
}