// src/lib/seo/site.ts
export function getSiteUrl() {
  let base =
    (process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "").trim();

  if (!base && process.env.VERCEL_URL) {
    base = `https://${process.env.VERCEL_URL}`.trim();
  }

  // Fallback
  if (!base) {
    base = "https://www.xiphiasimmigration.com";
  }

  // Ensure protocol (covers: "example.com", "www.example.com")
  if (base && !/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  return base.replace(/\/+$/, "");
}