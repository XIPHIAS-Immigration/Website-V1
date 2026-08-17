import "server-only";

import { callout, card, esc, grid, page, sectionHeader, table } from "./components";

type CompanyProfilePagesOptions = {
  header?: string;
  footer: (label: string) => string;
};

const AWARDS = [
  ["2025", "India's Most Trusted Global Mobility Brand", "Forbes India"],
  ["2024", "Most Trusted Immigration Consultancy - India", "Corporate Vision"],
  ["2024", "Brand of the Year", "Business Connect India"],
  ["2022", "Best Immigration Consultant", "The Times of India"],
];

const OFFICES = [
  ["Bengaluru HQ", "Koramangala, Bengaluru 560034, India", "+91 9021335577"],
  ["Gurugram", "DLF Phase 5, Gurugram 122002, India", "+91 96675 20211"],
  ["Dubai", "Platinum Tower, Jumeirah Lakes Towers, UAE", "+971 52 727 5101"],
  ["Doha", "Al Jazeera Tower, West Bay, Qatar", "+974 4476 0562"],
  ["Melbourne", "227 Collins Street, Melbourne VIC 3000, Australia", "+61 451 239 239"],
  ["Waterloo", "3-133 Weber Street North, Waterloo ON N2J 3G9, Canada", "+1 438 379 9101"],
];

/**
 * Shared company appendix included in every paid report.
 * Keep claims aligned with the public About, Awards, Reviews, Media and Locations pages.
 */
export function buildCompanyProfilePages(opts: CompanyProfilePagesOptions): string[] {
  const companyPage = page({
    header: opts.header,
    footer: opts.footer("About XIPHIAS"),
    body:
      sectionHeader({
        eyebrow: "Your advisory partner",
        title: "About XIPHIAS Immigration",
        desc: "XIPHIAS supports individuals, families, investors and businesses across skilled migration, residency, citizenship and corporate mobility. Government authorities retain every final decision.",
      }) +
      grid(3, [
        card({ k: "Established", v: "2009" }),
        card({ k: "Current footprint", v: "6 offices" }),
        card({ k: "Advisory coverage", v: "4 tracks" }),
      ]) +
      `<div class="spacer-16"></div>` +
      sectionHeader({
        eyebrow: "Selected recognition",
        title: "Awards and independent recognition",
      }) +
      table({
        head: ["Year", "Recognition", "Issuer"],
        rows: AWARDS.map((row) => row.map(esc)),
      }) +
      `<div class="spacer-8"></div>` +
      callout({
        k: "Verification note",
        text: "Selected from the XIPHIAS Awards and Recognition page. Recognition does not guarantee an immigration outcome.",
      }) +
      `<div class="spacer-8"></div>` +
      sectionHeader({
        eyebrow: "Media",
        title: "Public insights and media presence",
        desc: "XIPHIAS publishes immigration insights, interviews, webinars and media appearances at www.xiphiasimmigration.com/media. Company materials list press mentions including The Times of India, Economic Times, Forbes, CNBC TV18, Business Standard, NDTV, Mint and Gulf News. No endorsement is implied.",
      }),
  });

  const testimonialPage = page({
    header: opts.header,
    footer: opts.footer("Client testimonials"),
    body:
      sectionHeader({
        eyebrow: "Client experience",
        title: "What clients say about XIPHIAS",
        desc: "Selected excerpts from client reviews published on the XIPHIAS reviews page. Individual experiences differ and no testimonial guarantees an immigration outcome.",
      }) +
      grid(2, [
        card({
          k: "Steffi Sabu · Canada PR client · 2025",
          v: "Having the right team beside you makes all the difference.",
          note: "The review describes continued guidance through nomination, invitation, dependant addition and confirmation of permanent residence.",
        }),
        card({
          k: "Ajith Paul · Canada PR client · 2024",
          v: "Professional, knowledgeable, and always available to address my concerns.",
          note: "The review highlights personalised attention before and after the Invitation to Apply stage.",
        }),
        card({
          k: "Priyank Ritwik · Australia PR client · 2019",
          v: "Professional, prompt and patient with every question.",
          note: "The review credits the processing team for consistent guidance throughout the Australia PR process.",
        }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Read the source reviews",
        text: "The complete client-written reviews and any company responses are available at www.xiphiasimmigration.com/reviews.",
      }),
  });

  const trustPage = page({
    header: opts.header,
    footer: opts.footer("Trust, media and offices"),
    body:
      sectionHeader({
        eyebrow: "Client trust",
        title: "Testimonials and review platforms",
        desc: "Public profiles provide an additional view of client experience. Scores and counts change as platforms update their records.",
      }) +
      grid(2, [
        card({ k: "Google Reviews", v: "4.7 / 5", note: "1,347 reviews displayed on the XIPHIAS website; checked 8 August 2026." }),
        card({ k: "Trustpilot", v: "4.3 / 5", note: "12 reviews displayed on the XIPHIAS website; checked 8 August 2026." }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Recurring feedback themes",
        text: "Public client stories commonly highlight clear document guidance, proactive follow-up, responsive communication and plain-language explanations. Read the originals at www.xiphiasimmigration.com/reviews.",
      }) +
      `<div class="spacer-8"></div>` +
      sectionHeader({
        eyebrow: "Global access",
        title: "Office locations",
      }) +
      table({
        head: ["Office", "Location", "Telephone"],
        rows: OFFICES.map((row) => row.map(esc)),
      }),
  });

  return [companyPage, testimonialPage, trustPage];
}
