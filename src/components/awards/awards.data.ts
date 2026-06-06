// components/awards/awards.data.ts
export type Award = {
  id: string;
  tag: string;
  title: string;
  issuer: string;
  year: number;
  href?: string;
  image?: string; // optional badge image if you add one later
};

export const awardsData: Award[] = [
  // 2025
  {
    id: "most-trusted-global-mobility-brand-2025",
    tag: "Most Trusted • 2025",
    title: "India's Most Trusted Global Mobility Brand",
    issuer: "Forbes India",
    year: 2025,
  },
  {
    id: "visionary-leader-inspiring-business-world-2025",
    tag: "Visionary Leader • 2025",
    title: "The 10 Most Visionary Leader Inspiring the Business World",
    issuer: "Achiever Magazine",
    year: 2025,
  },
  {
    id: "best-leaders-to-watch-2025-varun-singh",
    tag: "Leaders to Watch • 2025",
    title:
      "One of the Best Leaders to Watch Out For in 2025 – Varun Singh, Managing Director, XIPHIAS",
    issuer: "The Cover Story",
    year: 2025,
  },

  // 2024 (new)
  {
    id: "most-trusted-immigration-consultancy-india-2024",
    tag: "Most Trusted • 2024",
    title: "Most Trusted Immigration Consultancy 2024 – India",
    issuer: "Corporate Vision",
    year: 2024,
  },
  {
    id: "top-influential-business-leaders-2024",
    tag: "Influential Leaders • 2024",
    title: "Top Influential business leaders to watch in 2024",
    issuer: "The Times of India",
    year: 2024,
  },
  {
    id: "top-visionary-business-leaders-2024",
    tag: "Visionary Leaders • 2024",
    title: "Top Visionary Business Leaders to Watch in 2024",
    issuer: "CEO Review Magazine",
    year: 2024,
  },
  {
    id: "ethical-leadership-investment-migration-2024",
    tag: "Leadership Profile • 2024",
    title:
      "Varun Singh: Exemplifying Ethical Leadership in Global Investment Migration",
    issuer: "CEO Review Magazine",
    year: 2024,
  },
  {
    id: "fastest-growing-immigration-companies-2024",
    tag: "Fastest Growing • 2024",
    title: "The Fastest Growing Immigration Companies in 2024",
    issuer: "The Business Fame",
    year: 2024,
  },

  // 2024 (existing)
  {
    id: "most-trusted-company-watch-2024",
    tag: "Most Trusted • 2024",
    title: "Most Trusted Immigration Company to Watch",
    issuer: "The Enterprise World",
    year: 2024,
  },
  {
    id: "brand-of-the-year-2024",
    tag: "Brand of the Year",
    title: "Brand of the Year",
    issuer: "Business Connect India",
    year: 2024,
  },

  // 2023
  {
    id: "most-trusted-consultant-india-2023",
    tag: "Most Trusted • 2023",
    title: "India's Most Trusted Immigration Consultant",
    issuer: "The CIO Look India",
    year: 2023,
  },

  // 2022–2021
  {
    id: "best-immigration-consultant-2022",
    tag: "Best Immigration Consultant",
    title: "Best Immigration Consultant",
    issuer: "The Times of India",
    year: 2022,
  },
  {
    id: "consultant-of-the-year-2021",
    tag: "Consultant of the Year",
    title: "Consultant of the Year",
    issuer: "The Global Hues",
    year: 2021,
  },

  // 2020 highlights
  {
    id: "transformational-business-leaders-2020",
    tag: "Industry Leadership",
    title: "The 10 Transformational Business Leaders to Look Out",
    issuer: "The Enterprise World",
    year: 2020,
  },
  {
    id: "renowned-brands-to-watch-2020",
    tag: "Brand Recognition",
    title: "The 10 Most Renowned Brands to Watch",
    issuer: "The Leaders Globe",
    year: 2020,
  },
  {
    id: "most-admired-business-consultants-2020",
    tag: "Most Admired",
    title: "The Most Admired Business Consultants",
    issuer: "Prime View Magazine",
    year: 2020,
  },
  {
    id: "outstanding-immigration-citizenship-provider-2019-20",
    tag: "Outstanding Service",
    title:
      "Most Outstanding Immigration & Citizenship Service Provider in India (2019–20)",
    issuer: "Corporate Vision Magazine",
    year: 2020,
  },

  // 2019
  {
    id: "most-admired-consultant-leaders-2019",
    tag: "Most Admired",
    title: "The 10 Most Admired Consultant Leaders to Watch",
    issuer: "Business APAC Magazine",
    year: 2019,
  },
  {
    id: "corporate-excellence-uk-2019",
    tag: "Corporate Excellence",
    title: "Corporate Excellence Award",
    issuer: "Corporate LiveWire • UK",
    year: 2019,
  },

  // 2018
  {
    id: "consultant-of-the-year-2018",
    tag: "Consultant of the Year",
    title: "Consultant of the Year",
    issuer: "Silicon India",
    year: 2018,
  },
  {
    id: "most-trusted-immigration-companies-2018",
    tag: "Most Trusted",
    title: "The 10 Most Trusted Immigration Consulting Companies",
    issuer: "Insights Success",
    year: 2018,
  },
  {
    id: "admire-companies-to-watch-2018",
    tag: "Admired Companies",
    title: "The 10 Most Admire Companies to Watch",
    issuer: "Prime View Magazine",
    year: 2018,
  },
  {
    id: "business-leadership-excellence-2018",
    tag: "Leadership Excellence",
    title: "Business & Leadership Excellence Award",
    issuer: "National Excellence Forum",
    year: 2018,
  },

  // 2017
  {
    id: "international-kohinoor-award-2017",
    tag: "Kohinoor Award",
    title: "International Kohinoor Award for Excellence (Mr. Varun Singh)",
    issuer: "Economics Growth Foundation",
    year: 2017,
  },
  {
    id: "most-promising-immigration-company-2017",
    tag: "Most Promising • 2017",
    title: "Most Promising Immigration Consultancy Company of the Year",
    issuer: "Excellence Summit 2017",
    year: 2017,
  },
  {
    id: "global-business-leadership-2017",
    tag: "Leadership",
    title: "Global Business Leadership Award",
    issuer: "World Leadership Congress",
    year: 2017,
  },
  {
    id: "nelson-mandela-sadbhavana-award-2017",
    tag: "Nelson Mandela Sadbhavana",
    title: "Nelson Mandela Sadbhavana Award",
    issuer: "AIBDA",
    year: 2017,
  },
  {
    id: "most-promising-performance-immigration-consulting-2017",
    tag: "Most Promising • 2017",
    title: "Most Promising Performance in the Field of Immigration Consulting",
    issuer: "World Peace and Diplomacy Organisation",
    year: 2017,
  },

  // 2016
  {
    id: "india-5000-best-msme-2016",
    tag: "India 5000",
    title: "INDIA 5000 Best MSME Award (Winner)",
    issuer: "India 5000",
    year: 2016,
  },
  {
    id: "best-immigration-service-provider-south-india-2016",
    tag: "Regional Excellence",
    title: "The Best Immigration Service Provider in South India",
    issuer: "National Excellence Awards",
    year: 2016,
  },
  {
    id: "apj-abdul-kalam-excellence-2016",
    tag: "Excellence Award",
    title: "Dr. A.P.J. Abdul Kalam Excellence Award",
    issuer: "International Achievers Conference",
    year: 2016,
  },
  {
    id: "asia-fastest-growing-immigration-2016",
    tag: "Fastest Growing",
    title: "Asia Fastest Growing Immigration Award",
    issuer: "AsiaOne",
    year: 2016,
  },
  {
    id: "kvqa-iso-9001-2015-dac-2016",
    tag: "ISO 9001:2015",
    title: "KVQA Certified ISO 9001:2015 (Dubai Accreditation Center – DAC)",
    issuer: "KVQA • DAC",
    year: 2016,
  },
  {
    id: "rising-star-of-india-2016",
    tag: "Rising Star of India • 2016",
    title: "Rising Star Of India – Corporate Immigration Service Provider",
    issuer: "WBR Corp",
    year: 2016,
  },

  // 2015
  {
    id: "best-entrepreneur-of-the-year-2015",
    tag: "Entrepreneurship",
    title: "The Best Entrepreneur of the Year",
    issuer: "Asia Pacific Awards",
    year: 2015,
  },
  {
    id: "fastest-growing-indian-company-2015",
    tag: "Fastest Growing",
    title: "Fastest Growing Indian Company Excellence Award",
    issuer: "International Achievers Conference",
    year: 2015,
  },
  {
    id: "leadership-excellence-harvard-square-2015",
    tag: "Leadership Excellence • 2015",
    title:
      "Member of Leadership Excellence – Member Leaders Excellence at Harvard Square",
    issuer: "Leaders Excellence at Harvard Square (Harvard)",
    year: 2015,
  },

  // 2014
  {
    id: "most-promising-immigration-consultant-2014",
    tag: "Most Promising • 2014",
    title: "Most Promising Immigration Consultant",
    issuer: "Silicon India",
    year: 2014,
  },
  {
    id: "top-5-immigration-consultant-2014",
    tag: "Top 5 • 2014",
    title: "TOP 5 IMMIGRATION CONSULTANT",
    issuer: "Silicon India",
    year: 2014,
  },
];
