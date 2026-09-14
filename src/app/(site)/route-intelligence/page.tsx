import { permanentRedirect } from "next/navigation";

type PageSearchParams = Record<string, string | string[] | undefined>;

/**
 * Folded into /xia-intelligence.
 *
 * This route rendered the identical component with a different heading, which is
 * duplicate content to a crawler and an identical page to a visitor. Any preset
 * it was given is carried across so existing links keep working.
 */
export default async function RouteIntelligenceRedirect({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const key of ["destination", "country", "goal"]) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key === "country" ? "destination" : key, first);
  }
  const suffix = query.toString();
  permanentRedirect(`/xia-intelligence${suffix ? `?${suffix}` : ""}`);
}
