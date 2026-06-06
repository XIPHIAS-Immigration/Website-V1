import { title } from "process";

export const footerlabels: { label: string; href: string }[] = [
  { label: "Terms", href: "#" },
  { label: "Disclosures", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Latest News", href: "#" },
];

export const cardData: {
  title: string;
  short: string;
  icon: string;
  background: string;
  width: number;
  height: number;
  padding: string;
  link: string;
}[] = [
  {
    title: "Golden Visa",
    short: "Get residency through global investment.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-warning bg-opacity-20",
    width: 28,
    height: 28,
    padding: "px-3 py-3",
    link: "/golden-visa",
  },
  {
    title: "Real Estate Funds",
    short: "Invest in properties for long-term returns.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-light_grey",
    width: 28,
    height: 28,
    padding: "px-3 py-3",
    link: "/real-estate-funds",
  },
  {
    title: "Citizenship Programs",
    short: "Obtain a second passport via investment.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-warning bg-opacity-20",
    width: 26,
    height: 26,
    padding: "px-3 py-3",
    link: "/citizenship-programs",
  },
  {
    title: "Offshore Banking",
    short: "Secure assets with trusted global banks.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-light_grey",
    width: 28,
    height: 28,
    padding: "px-3 py-3",
    link: "/offshore-banking",
  },
  {
    title: "Residency Planning",
    short: "Tailored solutions for global relocation.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-warning bg-opacity-20",
    width: 28,
    height: 28,
    padding: "px-3 py-3",
    link: "/residency-planning",
  },
  {
    title: "Tax Optimization",
    short: "Reduce taxes with legal global strategies.",
    icon: "/images/icons/icon-litecoin.svg",
    background: "bg-light_grey",
    width: 28,
    height: 28,
    padding: "px-3 py-3",
    link: "/tax-optimization",
  },
];

export const portfolioData: { image: string; title: string }[] = [
  {
    image: "/images/portfolio/icon-wallet.svg",
    title: "Manage your portfolio",
  },
  {
    image: "/images/portfolio/icon-vault.svg",
    title: "Vault protection",
  },
  {
    image: "/images/portfolio/icon-mobileapp.svg",
    title: "Mobile apps",
  },
];

export const upgradeData: { title: string }[] = [
  { title: "100% Secure" },
  { title: "A Fraction of the Cost" },
  { title: "More Durable" },
  { title: "Easier to Use" },
];

export const perksData: {
  icon: string;
  title: string;
  text: string;
  space: string;
}[] = [
  {
    icon: "/images/perks/icon-support.svg",
    title: "24/7 Support",
    text: "Need help? Get your requests solved quickly via support team.",
    space: "lg:mt-8",
  },
  {
    icon: "/images/perks/icon-community.svg",
    title: "Community",
    text: "Join the conversations on our worldwide OKEx communities",
    space: "lg:mt-14",
  },
  {
    icon: "/images/perks/icon-academy.svg",
    title: "Academy",
    text: "Learn blockchain and<br /> XIPHIAS for free.",
    space: "lg:mt-4",
  },
];

export const timelineData: {
  icon: string;
  title: string;
  text: string;
  position: string;
}[] = [
  {
    icon: "/images/timeline/icon-planning.svg",
    title: "Planning",
    text: "Map the project's scope and architecture",
    position: "md:top-0 md:left-0",
  },
  {
    icon: "/images/timeline/icon-refinement.svg",
    title: "Refinement",
    text: "Refine and improve your solution",
    position: "md:top-0 md:right-0",
  },
  {
    icon: "/images/timeline/icon-prototype.svg",
    title: "Prototype",
    text: "Build a working prototype to test your product",
    position: "md:bottom-0 md:left-0",
  },
  {
    icon: "/images/timeline/icon-support.svg",
    title: "Support",
    text: "Deploy the product and ensure full support by us",
    position: "md:bottom-0 md:right-0",
  },
];

export const XIPHIASData: { name: string; price: number }[] = [
  { name: "Bitcoin BTC/USD", price: 67646.84 },
  { name: "Ethereum ETH/USD", price: 2515.93 },
  { name: "Bitcoin Cash BTC/USD", price: 366.96 },
  { name: "Litecoin LTC/USD", price: 61504.54 },
];
