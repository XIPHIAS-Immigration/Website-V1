import { getCitizenshipCountries } from "@/lib/citizenship-content";
import { getResidencyCountries } from "@/lib/residency-content";
import { getSkilledCountries } from "@/lib/skilled-content";
import { getCorporateCountries } from "@/lib/corporate-content";
import VerticalChapterClient, { type ChapterCountry } from "./VerticalChapterClient";

type Vertical = "citizenship" | "residency" | "skilled" | "corporate";

type RawCountry = {
  country?: string;
  title?: string;
  countrySlug?: string;
  summary?: string;
  tagline?: string;
  heroImage?: string;
};

const GETTERS: Record<Vertical, () => Promise<RawCountry[]> | RawCountry[]> = {
  citizenship: getCitizenshipCountries,
  residency: getResidencyCountries,
  skilled: getSkilledCountries,
  corporate: getCorporateCountries,
};

type Props = {
  vertical: Vertical;
  eyebrow: string;
  title: string;
  blurb: string;
  accent: string;
  hubLabel: string;
  fallbackImage: string;
  flip?: boolean;
  /** Max destinations to feature in the chapter. */
  limit?: number;
};

/**
 * Server wrapper: pulls real countries for the vertical (correct slugs, images
 * and summaries) and feeds them to the pinned, horizontal chapter animator.
 */
export default async function VerticalChapter({
  vertical,
  eyebrow,
  title,
  blurb,
  accent,
  hubLabel,
  fallbackImage,
  flip,
  limit = 6,
}: Props) {
  const raw = (await GETTERS[vertical]()) ?? [];

  const countries: ChapterCountry[] = raw
    .filter((c) => c.countrySlug)
    .slice(0, limit)
    .map((c) => ({
      name: c.country ?? c.title ?? "Destination",
      slug: c.countrySlug as string,
      summary: c.summary ?? c.tagline ?? `${eyebrow} programmes and routes.`,
      image: c.heroImage || fallbackImage,
      href: `/${vertical}/${c.countrySlug}`,
    }));

  if (!countries.length) return null;

  return (
    <VerticalChapterClient
      eyebrow={eyebrow}
      title={title}
      blurb={blurb}
      accent={accent}
      hubHref={`/${vertical}`}
      hubLabel={hubLabel}
      countries={countries}
      flip={flip}
    />
  );
}
