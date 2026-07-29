import type { Metadata } from "next";

type ListingMetadataOptions = {
  path: string;
  title: string;
  description: string;
  page?: number;
};

export function listingMetadata({
  path,
  title,
  description,
  page = 1,
}: ListingMetadataOptions): Metadata {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const canonical = safePage > 1 ? `${path}?page=${safePage}` : path;
  const pageTitle = safePage > 1 ? `${title} - Page ${safePage}` : title;

  return {
    title: { absolute: `${pageTitle} | XIPHIAS Immigration` },
    description,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: "XIPHIAS Immigration",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/xiphias-immigration.png",
          width: 1200,
          height: 630,
          alt: `${title} - XIPHIAS Immigration`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: ["/xiphias-immigration.png"],
    },
  };
}

export function pageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw || "1");
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
}
