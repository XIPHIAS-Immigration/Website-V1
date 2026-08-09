// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx"],
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ["pdf-parse", "mammoth"],
  outputFileTracingIncludes: { "*": ["./content/**/*"] },
  // Keep production builds within this Windows server's available memory.
  // Unbounded minification workers can stall after consuming close to 1 GB.
  experimental: {
    cpus: 2,
    // The separate webpack process crashes natively on Windows Node 24/25.
    // Keep it enabled on Linux CI/deployments, where it lowers build memory.
    webpackBuildWorker: process.platform !== "win32",
  },

  images: {
    // WebP only: ~2-3x faster to decode than AVIF on low-power / CPU-throttled
    // devices (AVIF is smaller but its decode cost hurts perceived load there).
    formats: ["image/webp"],
    qualities: [75, 80],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "www.xiphiasimmigration.com" },
      { protocol: "https", hostname: "xiphiasimmigration.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "dl.dropboxusercontent.com" },
    ],
  },

  async headers() {
    const noIndexHeaders = [
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ];

    return [
      { source: "/content-admin/:path*", headers: noIndexHeaders },
      { source: "/crm/:path*", headers: noIndexHeaders },
      { source: "/x-hub/:path*", headers: noIndexHeaders },
      { source: "/api/:path*", headers: noIndexHeaders },
      { source: "/payment/:path*", headers: noIndexHeaders },
      { source: "/registration", headers: noIndexHeaders },
      { source: "/:path*/thank-you", headers: noIndexHeaders },
    ];
  },

  async redirects() {
    return [
      // ✅ Force non-www → www (ANCHOR to avoid loop)
      {
        source: "/:path*",
        has: [{ type: "host", value: "^xiphiasimmigration\\.com$" }],
        destination: "https://www.xiphiasimmigration.com/:path*",
        permanent: true,
      },

      // Cleanup
      { source: "/:path*/_country", destination: "/:path*", permanent: true },
      { source: "/:path*/_country/", destination: "/:path*", permanent: true },

      // Old paths
      { source: "/RealEstate/:path*", destination: "/residency", permanent: true },
      { source: "/realestate/:path*", destination: "/residency", permanent: true },

      // Blogs plural → blog
      { source: "/blogs/:path*", destination: "/blog/:path*", permanent: true },
      { source: "/blogs", destination: "/blog", permanent: true },

      // Insights consolidation
      { source: "/insights/blog/:slug*", destination: "/blog/:slug*", permanent: true },
      { source: "/insights/news/:slug*", destination: "/news/:slug*", permanent: true },
      { source: "/insights/articles/:slug*", destination: "/articles/:slug*", permanent: true },
      { source: "/insights/media/:slug*", destination: "/media/:slug*", permanent: true },
      { source: "/insights/blog", destination: "/blog", permanent: true },
      { source: "/insights/news", destination: "/news", permanent: true },
      { source: "/insights/articles", destination: "/articles", permanent: true },
      { source: "/insights/media", destination: "/media", permanent: true },

      // Newsroom
      { source: "/newsroom", destination: "/news", permanent: true },
      { source: "/event", destination: "/events", permanent: true },

      // Legacy misc html pages
      { source: "/Contact-us.html", destination: "/contact", permanent: true },
      { source: "/contact-us.html", destination: "/contact", permanent: true },
      { source: "/blog.html", destination: "/blog", permanent: true },
      { source: "/leadership.html", destination: "/about", permanent: true },
      { source: "/immigration-consultants-in-india.html", destination: "/", permanent: true },
      { source: "/immigration-consultants-in-bangalore.html", destination: "/about/locations", permanent: true },
      { source: "/visa-consultants-in-india.html", destination: "/", permanent: true },
      { source: "/branch-office.html", destination: "/contact", permanent: true },
      { source: "/apply-online.html", destination: "/eligibility", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/disclaimer", destination: "/terms", permanent: true },
      { source: "/media.html", destination: "/media", permanent: true },
      { source: "/why-xiphias.html", destination: "/about", permanent: true },
      { source: "/gallery.html", destination: "/gallery", permanent: true },
      { source: "/partner-with-us.html", destination: "/partner-with-us", permanent: true },
      { source: "/reviews.html", destination: "/reviews", permanent: true },

      // Citizenship legacy
      {
        source: "/antigua-and-barbuda-citizenship-by-investment-immigration.html",
        destination: "/citizenship/antigua-barbuda",
        permanent: true,
      },
      {
        source: "/dominica-citizenship-by-investment-immigration.html",
        destination: "/citizenship/dominica",
        permanent: true,
      },
      {
        source: "/grenada-citizenship-by-investment-immigration.html",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/saint-kitts-citizenship-by-investment-program.html",
        destination: "/citizenship/saintkitts",
        permanent: true,
      },
      {
        source: "/saint-kitts-and-nevis-citizenship-by-investment-immigration.html",
        destination: "/citizenship/saintkitts",
        permanent: true,
      },
      {
        source: "/saint-lucia-citizenship-by-investment.html",
        destination: "/citizenship/saint-lucia",
        permanent: true,
      },
      {
        source: "/turkey-citizenship-by-investment-program.html",
        destination: "/citizenship/turkey",
        permanent: true,
      },
      { source: "/turkey-business-investor-visa.html", destination: "/citizenship/turkey", permanent: true },

      // Residency legacy
      { source: "/malta-citizenship-by-investment.html", destination: "/residency/malta", permanent: true },
      { source: "/blog/malta-residence-permit-residency-citizenship", destination: "/residency/malta", permanent: true },
      { source: "/greece-golden-visa-investment-immigration.html", destination: "/residency/greece", permanent: true },
      { source: "/greece-golden-visa.html", destination: "/residency/greece", permanent: true },
      { source: "/portugal-golden-visa-investment-immigration.html", destination: "/residency/portugal", permanent: true },
      { source: "/spain-golden-visa-investment-immigration.html", destination: "/residency", permanent: true },
      { source: "/spain-investor-visa.html", destination: "/residency", permanent: true },
      { source: "/canada-immigration-visa.html", destination: "/skilled/canada/provincial-nominee-program", permanent: true },
      { source: "/usa-business-investor-visa.html", destination: "/residency/usa", permanent: true },
      { source: "/usa-investor-visa-eb5.html", destination: "/residency/usa", permanent: true },
      { source: "/usa-immigration.html", destination: "/residency/usa", permanent: true },
      { source: "/us-employment-based-resident-visa.html", destination: "/skilled/usa", permanent: true },
      { source: "/us-employment-based-visa.html", destination: "/corporate/usa/l1-corporate-transfer-visa", permanent: true },
      { source: "/canada/start-up-visa", destination: "/residency/canada/canada-start-up-visa", permanent: true },

      // Canada legacy (both with/without .html + php)
      { source: "/investment-immigration-visa-canada.html", destination: "/skilled/canada", permanent: true },
      { source: "/canada-express-entry.html", destination: "/skilled/canada", permanent: true },
      { source: "/canada-family-immigration.html", destination: "/skilled/canada", permanent: true },
      { source: "/canada-immigration-consultants-in-bangalore.html", destination: "/skilled/canada", permanent: true },

      { source: "/canada-express-entry", destination: "/skilled/canada", permanent: true },
      { source: "/canada-family-immigration", destination: "/skilled/canada", permanent: true },
      { source: "/canada-investor-immigration", destination: "/skilled/canada", permanent: true },
      { source: "/canada-permanent-residency", destination: "/skilled/canada", permanent: true },
      { source: "/canada-skilled-migration", destination: "/skilled/canada", permanent: true },
      { source: "/canada-skilled-immigration-consultants.html", destination: "/skilled/canada", permanent: true },
      { source: "/canada-immigration.php", destination: "/skilled/canada", permanent: true },
      { source: "/canada-family-sponsorship-class-visa.html", destination: "/skilled/canada", permanent: true },

      // Skilled misc legacy
      { source: "/europe-visa-work-permit.html", destination: "/skilled", permanent: true },
      { source: "/germany-skilled-visa.html", destination: "/skilled/germany", permanent: true },
      { source: "/uk-startup-investor-innovator-visa.html", destination: "/skilled/united-kingdom", permanent: true },
      { source: "/australia-business-investment-visa.html", destination: "/skilled/australia", permanent: true },
      { source: "/Australia-Global-Talent-Visa.html", destination: "/skilled/australia/global-talent-visa-858", permanent: true },
      { source: "/canada-skilled-immigration.html", destination: "/skilled/canada", permanent: true },
      { source: "/skilled-migration-visa-consultant.html", destination: "/skilled", permanent: true },

      // Corporate legacy
      { source: "/usa-corporate-immigration-services.html", destination: "/corporate", permanent: true },
      { source: "/corporate-immigration-consultants.html", destination: "/corporate", permanent: true },
      { source: "/corporate-immigration-consultants-in-bangalore.html", destination: "/corporate", permanent: true },
      { source: "/uae-immigration-consultants.html", destination: "/corporate", permanent: true },
      { source: "/dubai-business-investor-visa.html", destination: "/corporate", permanent: true },
      { source: "/immigration-visa-consultants-in-dubai.html", destination: "/contact", permanent: true },
      { source: "/canada-corporate-immigration-services.html", destination: "/corporate", permanent: true },
      { source: "/corporate-immigration-visa-services.html", destination: "/corporate", permanent: true },

      // General business-investment legacy
      { source: "/business-investment-immigration-visa.html", destination: "/residency", permanent: true },
      { source: "/new-zealand-business-investor-visa.html", destination: "/residency", permanent: true },
      { source: "/europe-business-investor-visa-consultants-in-india.html", destination: "/residency", permanent: true },

      // St Kitts subpaths showing as 404 in your report
      { source: "/citizenship/st-kitts-nevis/sisc", destination: "/citizenship/saintkitts/sustainable-island-state-contribution", permanent: true },
      { source: "/citizenship/st-kitts-nevis/pbo", destination: "/citizenship/saintkitts/approved-public-benefit-project", permanent: true },
      { source: "/citizenship/st-kitts-nevis/real-estate", destination: "/citizenship/saintkitts/real-estate", permanent: true },

      // Guard
      { source: "/careers/undefined", destination: "/careers", permanent: false },
      // ---- Added from Top internally-linked pages report ----
      { source: "/termsnconditions.html", destination: "/terms", permanent: true },
      { source: "/cookie-policy.html", destination: "/cookies", permanent: true },

      { source: "/uk-innovator-visa.html", destination: "/corporate/united-kingdom", permanent: true },
      { source: "/uk-training-and-hr-services.html", destination: "/corporate/united-kingdom", permanent: true },

      { source: "/OINP-entrepreneur-stream.html", destination: "/residency/canada/ontario-entrepreneur", permanent: true },
      { source: "/Canada-SINP-Investment.html", destination: "/residency/canada/saskatchewan-entrepreneur", permanent: true },

      { source: "/Refugee-Sponsorships.html", destination: "/skilled/canada", permanent: true },
      { source: "/temporary-resident-visa-canada.html", destination: "/skilled/canada", permanent: true },

      { source: "/skilled-business-investment-visa-australia.html", destination: "/skilled/australia", permanent: true },
      { source: "/Australia-business-Innovation-and-Investment-Visa.html", destination: "/skilled/australia", permanent: true },
      { source: "/australia-business-talent-visa.html", destination: "/skilled/australia", permanent: true },

      { source: "/australia-skilled-187-visa.html", destination: "/skilled/australia/regional-sponsored-migration-187", permanent: true },

      { source: "/payment.html", destination: "/eligibility", permanent: true },

      // This one is HUGE in your internal links report (1,660 links)
      { source: "/XIPHIAS/Account/Login", destination: "/contact", permanent: true },

      // Legacy brochure and media aliases
      { source: "/brochures/residency/canada.pdf", destination: "/images/residency/xiphias-corporate-mobility.pdf", permanent: true },
      { source: "/images/citizenship/antigua/xiphias-immigration.pdf", destination: "/images/citizenship/antigua/antigua_barbuda_cbi.pdf", permanent: true },
      { source: "/images/citizenship/saotome/sao_tome_príncipe.pdf", destination: "/images/citizenship/saotome/sao_tome.pdf", permanent: true },
      { source: "/images/personal/video/sample.mp4", destination: "/images/personal/video/sample-1234.mp4", permanent: true },

      // Asset aliases from historical content and crawler reports
      { source: "/images/blogs/seconday-citizenship.webp", destination: "/images/blogs/second-citizenship.webp", permanent: true },
      { source: "/images/articles/us-visa-waiver-program.webp", destination: "/images/articles/US-visa-waiver-program.webp", permanent: true },
      { source: "/images/blogs/european-golden-visa-guide.png", destination: "/images/blogs/european-golden-visa-guide.webp", permanent: true },
      { source: "/images/blogs/goldenvisa.webp", destination: "/images/blogs/goldenvisa.png", permanent: true },
      { source: "/images/blogs/abroad-jobs-indian-graduates-2024.webp", destination: "/images/blogs/jobs-foreign-countries.webp", permanent: true },
      { source: "/images/blogs/best-country-to-work-abroad-2024.webp", destination: "/images/blogs/jobs-foreign-countries.webp", permanent: true },
      { source: "/images/blogs/Most-Powerful-Passports-in-2023.png", destination: "/images/blogs/powerful-passport.webp", permanent: true },
      { source: "/images/blogs/Digital-Nomad-Visa-1024x576.png", destination: "/images/blogs/digital-nomad-visa.webp", permanent: true },
      { source: "/images/blogs/real-estate-investments-2022.jpg", destination: "/images/blogs/real-estate-investments.webp", permanent: true },

      // Relative MDX image fallbacks that were rendered under /blog/*
      { source: "/blog/dubai-investment.jpg", destination: "/images/blogs/dubai-investment.webp", permanent: true },
      { source: "/blog/european-golden-visa-guide.png", destination: "/images/blogs/european-golden-visa-guide.webp", permanent: true },
      { source: "/blog/dubai-golden-visa-real-estate.webp", destination: "/images/blogs/dubai-golden-visa-real-estate.webp", permanent: true },
      { source: "/blog/goldenvisa.webp", destination: "/images/blogs/goldenvisa.png", permanent: true },
      { source: "/blog/investment-migration-startups.webp", destination: "/images/blogs/investment-migration-startups.webp", permanent: true },
      { source: "/blog/abroad-jobs-indian-graduates-2024.webp", destination: "/images/blogs/jobs-foreign-countries.webp", permanent: true },
      { source: "/blog/best-country-to-work-abroad-2024.webp", destination: "/images/blogs/jobs-foreign-countries.webp", permanent: true },
      { source: "/blog/Most-Powerful-Passports-in-2023.png", destination: "/images/blogs/powerful-passport.webp", permanent: true },
      { source: "/blog/Digital-Nomad-Visa-1024x576.png", destination: "/images/blogs/digital-nomad-visa.webp", permanent: true },
      { source: "/blog/real-estate-investments-2022.jpg", destination: "/images/blogs/real-estate-investments.webp", permanent: true },

      // Consolidate accidental duplicate articles onto one canonical URL.
      {
        source: "/blog/real-estate-investments-residency-citizenship-2022",
        destination: "/articles/eb1-visa-rules-relaxed-indian-techies-self-sponsor-green-card-2024",
        permanent: true,
      },
      {
        source: "/blog/eb5-visa-for-indians-2026",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/usa-l1-visa-2025-process-requirements",
        destination: "/blog/usa-l1-visa-2025-process-requirements-duration",
        permanent: true,
      },
      {
        source: "/articles/end-of-eb5-visa-gold-card-impact-indian-investors-2025",
        destination: "/residency/usa",
        permanent: true,
      },
      {
        source: "/articles/end-of-eb5-visa-us-gold-card-impact-2025",
        destination: "/residency/usa",
        permanent: true,
      },

      // Retire stale or overlapping immigration posts in favour of current
      // cornerstone pages. Their source files are hidden from the sitemap.
      {
        source: "/blog/canada-immigration-guide",
        destination: "/skilled/canada",
        permanent: true,
      },
      {
        source: "/blog/canada-provincial-nominee-program",
        destination: "/skilled/canada/provincial-nominee-program",
        permanent: true,
      },
      {
        source: "/blog/canada-provincial-nominee-program-pnp",
        destination: "/skilled/canada/provincial-nominee-program",
        permanent: true,
      },
      {
        source: "/blog/canada-investment-immigration-guide",
        destination: "/residency/canada",
        permanent: true,
      },
      {
        source: "/blog/current-news-of-canada-immigration-process-in-2022",
        destination: "/blog/canada-immigration-changes-july-2026",
        permanent: true,
      },
      {
        source: "/blog/canada-immigration-levels-plan-2023-2025",
        destination: "/news/canada-immigration-plan-2026-2028",
        permanent: true,
      },
      {
        source: "/blog/express-entry-draws-2022-all-program-july",
        destination: "/blog/express-entry-latest-draw-crs-scores",
        permanent: true,
      },
      {
        source: "/blog/express-entry-pnp-545-crs-753-may-2022",
        destination: "/blog/express-entry-latest-draw-crs-scores",
        permanent: true,
      },
      {
        source: "/blog/express-entry-pnp-919-crs-785-apr-2022",
        destination: "/blog/express-entry-latest-draw-crs-scores",
        permanent: true,
      },
      {
        source: "/blog/express-entry-pnp-draw-787-crs-782-apr-2022",
        destination: "/blog/express-entry-latest-draw-crs-scores",
        permanent: true,
      },
      {
        source: "/blog/top-pathways-to-immigrate-to-canada-in-2022",
        destination: "/skilled/canada",
        permanent: true,
      },
      {
        source: "/blog/canada-immigration-plans-2021-2023",
        destination: "/news/canada-immigration-plan-2026-2028",
        permanent: true,
      },
      {
        source: "/blog/canada-immigration-budget-2022",
        destination: "/news/canada-immigration-plan-2026-2028",
        permanent: true,
      },
      {
        source: "/blog/choose-canadian-immigration-consultant-2022",
        destination: "/blog/how-to-choose-best-immigration-company",
        permanent: true,
      },
      {
        source: "/blog/canada-immigration-during-covid-19",
        destination: "/skilled/canada",
        permanent: true,
      },
      {
        source: "/blog/canada-pr-from-india-2023",
        destination: "/skilled/canada",
        permanent: true,
      },
      {
        source: "/blog/canada-startup-visa-guide-2025",
        destination: "/blog/canada-start-up-visa-2026-guide",
        permanent: true,
      },
      {
        source: "/articles/canada-startup-visa-2025-guide",
        destination: "/blog/canada-start-up-visa-2026-guide",
        permanent: true,
      },
      {
        source: "/blog/us-eb-5-permanent-residency-program",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/eb5-immigrant-investor-2022",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/eb5-direct-investment-benefits",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/us-eb5-direct-investment-benefits",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/what-makes-the-us-eb-5-visa-so-great",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/us-eb-5-visa-get-us-green-card-citizenship-and-more",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/impending-changes-to-the-proposed-eb-5-visa-regulations",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/understanding-the-dynamics-of-eb-5",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/eb5-invest-run-business-relocate-usa",
        destination: "/blog/eb-5-visa-for-indians-2026",
        permanent: true,
      },
      {
        source: "/blog/right-investment-migration-programme-guide",
        destination: "/blog/choose-right-investment-migration-program",
        permanent: true,
      },
      {
        source: "/blog/citizenship-by-investment-guide",
        destination: "/citizenship",
        permanent: true,
      },
      {
        source: "/blog/us-immigration-raids-impact-indians-visa-applicants",
        destination: "/articles/impact-of-us-immigration-raids-on-indians-2025",
        permanent: true,
      },
      {
        source: "/blog/grenada-cbi-benefits-india",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/blog/grenada-citizenship-investment-2025",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/blog/grenada-citizenship-investment-india",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/blog/grenada-cbi-real-estate-vs-donation",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/articles/grenada-citizenship-by-investment-2024",
        destination: "/citizenship/grenada",
        permanent: true,
      },
      {
        source: "/blog/german-citizenship-by-investment-and-germany-business-visa",
        destination: "/skilled/germany",
        permanent: true,
      },
      {
        source: "/blog/australia-pr-skilled-migration-2021",
        destination: "/articles/australia-pr-process-complete-guide",
        permanent: true,
      },
      {
        source: "/blog/australia-migration-opportunities-2022",
        destination: "/articles/australia-pr-process-complete-guide",
        permanent: true,
      },
      {
        source: "/blog/points-based-immigration-canada-australia-uk-2022",
        destination: "/skilled",
        permanent: true,
      },
      {
        source: "/blog/australia-skilled-migration",
        destination: "/articles/australia-pr-process-complete-guide",
        permanent: true,
      },
      {
        source: "/blog/australia-global-talent-visa-2022-changes",
        destination: "/skilled/australia/global-talent-visa-858",
        permanent: true,
      },
      {
        source: "/blog/australia-business-visa-categories",
        destination: "/skilled/australia",
        permanent: true,
      },

    ];
  },

  async rewrites() {
    return [];
  },
};

export default nextConfig;
