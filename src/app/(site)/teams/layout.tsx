import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leadership and Team | XIPHIAS Immigration",
  description:
    "Meet the XIPHIAS Immigration leadership, advisors, and global mobility team supporting clients across residency, citizenship, and skilled migration.",
  alternates: { canonical: "/teams" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Leadership and Team - XIPHIAS Immigration",
    description:
      "Meet the leadership, advisors, and specialists behind XIPHIAS Immigration.",
    type: "website",
    url: "/teams",
    siteName: "XIPHIAS Immigration",
    locale: "en_IN",
    images: ["/xiphias-immigration.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leadership and Team - XIPHIAS Immigration",
    description:
      "Meet the leadership, advisors, and specialists behind XIPHIAS Immigration.",
    images: ["/xiphias-immigration.png"],
  },
};

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
