import type { ExtraLinkGroup } from "./GuideSidebar";

export const extraLinkGroups: ExtraLinkGroup[] = [
  {
    title: "Popular",
    links: [
      { label: "Residency by Investment", href: "/residency" },
      { label: "Citizenship by Investment", href: "/citizenship" },
      { label: "Corporate Incorporation", href: "/corporate" },
      { label: "Skilled Migration", href: "/skilled" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Insights", href: "/insights" },
      { label: "Eligibility", href: "/eligibility" },
      { label: "News", href: "/news" },
      { label: "Articles", href: "/articles" },
      { label: "Media", href: "/media" },
      { label: "Contact", href: "/contact", },
      { label: "About", href: "/about", },
    ],
  },
  {
    title: "Downloads",
    links: [
      { label: "Master Guide PDF", href: "/images/residency/xiphias-corporate-mobility.pdf", badge: "PDF" },
    ],
  },
];
