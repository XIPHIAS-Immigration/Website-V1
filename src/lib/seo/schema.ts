// src/lib/seo/schema.ts
// -----------------------------------------------------------------------------
// One place that builds JSON-LD, so every page emits the same organisation,
// the same person and the same NAP. Duplicated-but-slightly-different schema is
// worse than none: search engines reconcile conflicting entities by ignoring
// them.
//
// Everything here is derived from src/data/credentials.ts and
// src/data/local-seo.ts. Nothing is hard-coded twice.
// -----------------------------------------------------------------------------

import { credentials, firmFacts } from "@/data/credentials";
import { headOffice, napOffices, openingHours } from "@/data/local-seo";

export const SITE_URL = "https://www.xiphiasimmigration.com";
export const ORG_ID = `${SITE_URL}#organization`;
export const PERSON_ID = `${SITE_URL}#varun-singh`;

type Json = Record<string, unknown>;

const ADVISOR_SAME_AS = [
  "https://www.linkedin.com/in/varunxiphias/",
  "https://www.imidaily.com/varun-singh/",
];

function postalAddress(office: (typeof napOffices)[number]): Json {
  return {
    "@type": "PostalAddress",
    streetAddress: office.streetAddress,
    addressLocality: office.locality,
    addressRegion: office.region,
    postalCode: office.postalCode,
    addressCountry: office.countryCode,
  };
}

export function organizationSchema(): Json {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "XIPHIAS Immigration Private Limited",
    alternateName: "XIPHIAS Immigration",
    url: SITE_URL,
    logo: `${SITE_URL}/xiphias-immigration.png`,
    foundingDate: String(firmFacts.foundedYear),
    identifier: firmFacts.cin,
    email: headOffice.email,
    telephone: headOffice.phones?.[0],
    address: postalAddress(headOffice),
    sameAs: ADVISOR_SAME_AS,
    areaServed: napOffices.map((office) => ({ "@type": "Country", name: office.country })),
  };
}

/**
 * LocalBusiness for offices with a verified street address only. An address we
 * cannot verify stays out of structured data — a wrong one is worse than none.
 */
export function localBusinessSchemas(): Json[] {
  return napOffices
    .filter((office) => office.emitLocalBusiness)
    .map((office) => ({
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}#office-${office.id}`,
      name: office.name,
      parentOrganization: { "@id": ORG_ID },
      url: SITE_URL,
      image: `${SITE_URL}/xiphias-immigration.png`,
      address: postalAddress(office),
      telephone: office.phones?.[0],
      email: office.email,
      hasMap: office.mapsQuery
        ? `https://www.google.com/maps/search/?api=1&query=${office.mapsQuery}`
        : undefined,
      priceRange: "₹₹₹",
      currenciesAccepted: "INR",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: openingHours.days,
          opens: openingHours.opens,
          closes: openingHours.closes,
        },
      ],
      knowsAbout: [
        "Residency by investment",
        "Citizenship by investment",
        "Skilled migration",
        "Corporate mobility",
        "Canada Express Entry",
        "Australian skilled migration",
      ],
    }));
}

export function personSchema(): Json {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Varun Singh",
    jobTitle: "Managing Director",
    image: `${SITE_URL}/images/avtar/varun-singh-md-xiphias.jpg`,
    worksFor: { "@id": ORG_ID },
    sameAs: ADVISOR_SAME_AS,
    hasCredential: credentials.map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional licence",
      name: `${credential.authorityShort} ${credential.reference}`,
      recognizedBy: { "@type": "Organization", name: credential.authority },
      url: credential.verifyUrl,
    })),
  };
}

export function faqSchema(id: string, items: ReadonlyArray<{ q: string; a: string }>): Json {
  return {
    "@type": "FAQPage",
    "@id": id,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/** Serialise a @graph safely for dangerouslySetInnerHTML. */
export function jsonLdScript(graph: Json[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );
}
