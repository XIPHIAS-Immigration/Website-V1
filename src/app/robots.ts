// src/app/robots.ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  const host = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Internal or system
          "/api/",
          "/content-admin",
          "/crm",
          "/x-hub",
          "/search",
          "/thank-you",
          "/*/thank-you",
          "/login",
          "/profile",
          "/admin",
          "/dashboard",
          "/payment",
          "/registration",
          "/report-advisor-workflow",
          "/australia-assesment-report",
          "/canada-assesent-report",

          // Draft/preview routes
          "/preview",
          "/draft",
          "/private",

          // Infrastructure paths
          "/cdn-cgi/",
          "/*%7C*",

        ],
      },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
