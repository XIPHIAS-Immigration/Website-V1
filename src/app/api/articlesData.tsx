export interface Article {
  id: number;
  title: string;
  description: string;
  author: string;
  authorImg?: string;
  tags: string[];
  image: string;
  alt: string;
  link: string; // legacy or for sitemap
  slug: string; // ✅ used for dynamic routes
  date: string; // ✅ publish date
}

export const articlesData: Article[] = [
  {
    id: 1,
    title: "Understanding the Portugal Golden Visa Program",
    description:
      "Learn how Portugal’s Golden Visa program offers residency through real estate and investment options with EU travel benefits.",
    author: "XIPHIAS Immigration",
    tags: ["Golden Visa", "Residency", "Portugal"],
    image: "/images/hero/email-icon-522x292.jpg",
    alt: "Portugal Golden Visa residency and investment opportunities",
    link: "/blog/portugal-golden-visa",
    slug: "portugal-golden-visa",
    date: "August 5, 2025",
  },
  {
    id: 2,
    title: "Greece Golden Visa: Your Gateway to Europe",
    description:
      "Discover how Greece’s Golden Visa provides investors and families with permanent residency and Schengen access.",
    author: "XIPHIAS Immigration",
    tags: ["Golden Visa", "Greece", "Investment"],
    image: "/images/hero/email-icon-522x292.jpg",
    alt: "Luxury property in Greece for Golden Visa residency",
    link: "/blog/greece-golden-visa",
    slug: "greece-golden-visa",
    date: "August 10, 2025",
  },
  {
    id: 3,
    title: "Citizenship by Investment: Top Countries in 2025",
    description:
      "Explore leading countries offering fast-track citizenship through investment, including the Caribbean and Europe.",
    author: "XIPHIAS Immigration",
    tags: ["Citizenship", "Investment", "Global Mobility"],
    image: "/images/hero/email-icon-522x292.jpg",
    alt: "Global citizenship options through investment programs",
    link: "/blog/citizenship-by-investment",
    slug: "citizenship-by-investment",
    date: "August 14, 2025",
  },
  {
    id: 4,
    title: "USA L1 Visa: Intra-Company Transfer Explained",
    description:
      "A step-by-step guide to understanding the L1 visa for business expansion in the United States.",
    author: "XIPHIAS Immigration",
    tags: ["USA", "L1 Visa", "Business Expansion"],
    image: "/images/hero/email-icon-522x292.jpg",
    alt: "Business professionals in the US discussing L1 visa opportunities",
    link: "/blog/usa-l1-visa",
    slug: "usa-l1-visa",
    date: "August 17, 2025",
  },
  {
    id: 5,
    title: "Why Choose Residency by Investment in 2025?",
    description:
      "An in-depth look at how Residency by Investment programs provide global mobility, tax benefits, and security for families.",
    author: "XIPHIAS Immigration",
    tags: ["Residency", "Investment", "Immigration"],
    image: "/images/hero/email-icon-522x292.jpg",
    alt: "Family exploring global residency options through investment",
    link: "/blog/residency-by-investment",
    slug: "residency-by-investment",
    date: "August 20, 2025",
  },
];
