import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LocalLandingPage from "@/components/LocalSeo/LocalLandingPage";
import { getLocalLanding } from "@/data/local-seo";
import {
  SITE_URL,
  breadcrumbSchema,
  faqSchema,
  jsonLdScript,
  localBusinessSchemas,
  organizationSchema,
  personSchema,
} from "@/lib/seo/schema";

const SLUG = "immigration-lawyer-or-consultant-bangalore";
const landing = getLocalLanding(SLUG);

export const revalidate = 86400;

export const metadata: Metadata = {
  title: landing?.title,
  description: landing?.description,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: landing?.title,
    description: landing?.description,
    url: `${SITE_URL}/${SLUG}`,
    siteName: "XIPHIAS Immigration",
    type: "website",
    images: [`${SITE_URL}/xiphias-immigration.png`],
  },
};

export default function Page() {
  if (!landing) notFound();

  const graph = [
    organizationSchema(),
    ...localBusinessSchemas(),
    personSchema(),
    faqSchema(`${SITE_URL}/${SLUG}#faq`, landing.faq),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: landing.h1, path: `/${SLUG}` },
    ]),
  ];

  return (
    <>
      <LocalLandingPage landing={landing} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(graph) }} />
    </>
  );
}
