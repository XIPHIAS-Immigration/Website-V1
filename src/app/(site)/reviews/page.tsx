import type { Metadata } from "next";
import type { Testimonial } from "@/components/Citizenship/TestimonialCarousel";
import ReviewsPageShell from "@/components/Reviews/ReviewsPageShell";
import { JsonLd, breadcrumbLd } from "@/lib/seo";
import {
  featuredReviews,
  formatReviewDate,
  getDisplayAuthorName,
  getRepliesForTopLevelReview,
  topLevelReviews,
} from "@/lib/reviews/legacyReviews";

const CANONICAL = "/reviews";
const ABSOLUTE_URL = "https://www.xiphiasimmigration.com/reviews";
const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

function getPageHref(page: number) {
  return page > 1 ? `${CANONICAL}?page=${page}` : CANONICAL;
}

export const revalidate = 86400;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await Promise.resolve(searchParams ?? {});
  const requestedPage = Math.max(1, Number(first(sp.page) ?? "1"));
  const totalPages = Math.max(1, Math.ceil(topLevelReviews.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const title =
    page > 1
      ? `XIPHIAS Immigration Reviews | Page ${page}`
      : "XIPHIAS Immigration Reviews | Client Reviews and Feedback";
  const description =
    page > 1
      ? `Browse page ${page} of XIPHIAS Immigration client reviews and public feedback across residency, citizenship, skilled migration, and corporate mobility services.`
      : "Explore client reviews and public feedback about XIPHIAS Immigration across residency, citizenship, skilled migration, and corporate mobility services.";
  const canonical = getPageHref(page);

  return {
    title,
    description,
    keywords: [
      "XIPHIAS Immigration reviews",
      "XIPHIAS client reviews",
      "immigration consultant reviews",
      "residency by investment reviews",
      "citizenship by investment reviews",
      "skilled migration reviews",
      "corporate mobility reviews",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical === CANONICAL ? ABSOLUTE_URL : `${ABSOLUTE_URL}?page=${page}`,
      siteName: "XIPHIAS Immigration",
      type: "website",
      images: [
        {
          url: "/xiphias-immigration.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/xiphias-immigration.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const sp = await Promise.resolve(searchParams ?? {});
  const requestedPage = Math.max(1, Number(first(sp.page) ?? "1"));
  const totalPages = Math.max(1, Math.ceil(topLevelReviews.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageReviews = topLevelReviews.slice(startIndex, startIndex + PAGE_SIZE);
  const pageUrl = currentPage > 1 ? `${ABSOLUTE_URL}?page=${currentPage}` : ABSOLUTE_URL;

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "XIPHIAS Immigration Reviews",
    description:
      "Client reviews and public feedback about XIPHIAS Immigration across residency, citizenship, skilled migration, and corporate mobility services.",
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: pageReviews.length,
      itemListElement: pageReviews.map((review, index) => ({
        "@type": "ListItem",
        position: startIndex + index + 1,
        item: {
          "@type": "Review",
          reviewBody: review.message,
          datePublished: review.createdAt,
          author: {
            "@type": "Person",
            name: getDisplayAuthorName(review),
          },
          itemReviewed: {
            "@type": "Organization",
            name: "XIPHIAS Immigration",
            url: "https://www.xiphiasimmigration.com",
          },
        },
      })),
    },
  };

  const featuredItems: Testimonial[] = featuredReviews.map((review) => ({
    quote: review.message,
    author: getDisplayAuthorName(review),
    role: `Client review - ${formatReviewDate(review.createdAt, { month: "short", year: "numeric" })}`,
  }));

  const reviewThreads = pageReviews.map((review) => ({
    review,
    replies: getRepliesForTopLevelReview(review.postId),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Reviews", url: CANONICAL },
        ])}
      />
      <JsonLd data={collectionJsonLd} />
      <ReviewsPageShell
        featuredItems={featuredItems}
        reviewThreads={reviewThreads}
        currentPage={currentPage}
        totalPages={totalPages}
        totalReviews={topLevelReviews.length}
      />
    </>
  );
}