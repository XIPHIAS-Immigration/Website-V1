import HeroSub from "@/components/SharedComponent/HeroSub";
import NotFound from "@/components/NotFound";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 – Page Not Found | XIPHIAS Immigration",
  description:
    "Sorry, the page you are looking for does not exist. Return to the XIPHIAS Immigration homepage and explore our global residency and citizenship solutions.",
  robots: {
    index: false, // ✅ prevent 404s from being indexed
    follow: true,
  },
  alternates: {
    canonical: "https://www.xiphiasimmigration.com/404",
  },
  openGraph: {
    title: "404 – Page Not Found | XIPHIAS Immigration",
    description:
      "Oops! The page you’re looking for isn’t here. Head back to XIPHIAS Immigration homepage to explore our residency and citizenship solutions.",
    url: "https://www.xiphiasimmigration.com/404",
    siteName: "XIPHIAS Immigration",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "404 – Page Not Found | XIPHIAS Immigration",
    description:
      "Oops! The page you’re looking for isn’t here. Head back to XIPHIAS Immigration homepage to explore our global residency and citizenship solutions.",
  },
};

const ErrorPage = () => {
  return (
    <main
      id="not-found"
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
    >
      {/* ✅ Reuse your Hero section for brand consistency */}
      <HeroSub title="404" />

      <NotFound />

      {/* ✅ Next.js Link instead of <a>, with proper accessibility */}
      <Link
        href="/"
        aria-label="Go back to XIPHIAS Immigration homepage"
        className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-white font-medium shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Back to Home
      </Link>
    </main>
  );
};

export default ErrorPage;
