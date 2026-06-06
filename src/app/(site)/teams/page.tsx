// ==============================================
// app/team/page.tsx – main page
// ==============================================
"use client";
import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ORG, LEADERSHIP, ADVISORS, TEAM, EVENTS } from "@/components/Team/team";
import { Hero } from "@/components/Team/Hero";
import { Leadership } from "@/components/Team/Leadership";
import { Advisors } from "@/components/Team/Advisors";
import { TeamDirectory } from "@/components/Team/TeamDirectory";
import { Values } from "@/components/Team/Values";
import { Events } from "@/components/Team/Events";
import { CTA } from "@/components/Team/CTA";
import { JsonLd } from "@/components/Team/JsonLd";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORG.name,
  legalName: ORG.legalName,
  url: ORG.url,
  logo: ORG.logo,
  slogan: ORG.slogan,
  contactPoint: [{ "@type": "ContactPoint", email: ORG.contactEmail, contactType: "customer support" }],
  sameAs: ORG.sameAs,
  employee: LEADERSHIP.map((p) => ({ "@type": "Person", name: p.name, jobTitle: p.role, image: p.headshot, email: p.email })),
} as const;

export default function TeamPage(){
  return (
    <>
      <Head>
        <title>Leadership & Team – {ORG.name}</title>
        <meta name="description" content="Meet the leadership and team powering customer-obsessed execution. Lightweight UX, transparent delivery, and measurable outcomes." />
        <meta name="robots" content="index,follow" />
        <meta property="og:title" content={`Leadership & Team – ${ORG.name}`} />
        <meta property="og:description" content="Meet the people behind the work." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${ORG.url}/team`} />
        <meta property="og:image" content={`${ORG.url}${ORG.logo}`} />
      </Head>
      <JsonLd data={orgJsonLd} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Hero
          title="Meet the People Behind the Work"
          subtitle="Transparent leadership. Senior hands-on execution. A culture that ships."
          primaryHref="/contact"
          primaryText="Talk to Leadership"
          secondaryHref="/about"
          secondaryText="About the Company"
          badge="Leadership & Team"
          align="center"
        />

        <Leadership people={LEADERSHIP} />
        <Advisors people={ADVISORS} />
        <TeamDirectory people={TEAM} />
        <Values />
        <Events items={EVENTS} />
        <CTA />

        {/* Breadcrumb – swap with your Breadcrumb component if desired */}
        <nav aria-label="Breadcrumb" className="mt-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li><Link href="/" className="text-blue-700 dark:text-blue-300">Home</Link></li>
            <li>/</li>
            <li aria-current="page" className="text-zinc-500">Team</li>
          </ol>
        </nav>
      </main>
    </>
  );
}