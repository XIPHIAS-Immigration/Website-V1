import Link from "next/link";
import { ArrowRight, Building2, Globe2, Landmark, UsersRound } from "lucide-react";

const SERVICES = [
  {
    title: "Canada immigration",
    description:
      "Express Entry, Provincial Nominee Programs, work permits and permanent residence planning for skilled professionals and families.",
    href: "/skilled/canada",
    linkLabel: "Explore Canada immigration",
    icon: Globe2,
  },
  {
    title: "US EB-5 immigration",
    description:
      "Strategy and documentation support for investors considering the EB-5 route to lawful permanent residence in the United States.",
    href: "/residency/usa",
    linkLabel: "Explore the US EB-5 route",
    icon: Landmark,
  },
  {
    title: "Investment migration",
    description:
      "Compare residency by investment, Golden Visa and citizenship by investment programmes with clear eligibility and cost guidance.",
    href: "/residency",
    linkLabel: "Compare investment migration routes",
    icon: UsersRound,
  },
  {
    title: "Corporate immigration",
    description:
      "Work permits, intra-company transfers and global mobility support for employers, founders and internationally mobile teams.",
    href: "/corporate",
    linkLabel: "View corporate immigration services",
    icon: Building2,
  },
] as const;

export default function ImmigrationConsultantsOverview() {
  return (
    <section
      aria-labelledby="immigration-consultants-overview"
      className="border-y border-zinc-200 bg-white py-14 text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white sm:py-16"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="type-caption uppercase text-primary dark:text-secondary">
              Immigration advisory since 2009
            </p>
            <h2
              id="immigration-consultants-overview"
              className="type-section-title mt-3 max-w-2xl"
            >
              Immigration consultants in India for global opportunities
            </h2>
            <div className="type-body mt-5 max-w-2xl space-y-4 text-zinc-700 dark:text-zinc-300">
              <p>
                XIPHIAS Immigration helps individuals, families, investors and
                businesses evaluate immigration pathways across more than 50
                countries. Our work covers skilled immigration, permanent
                residence, residency and citizenship by investment, corporate
                mobility and work permits.
              </p>
              <p>
                A consultation begins with eligibility, objectives, budget and
                risk. The team then explains suitable programmes, documentation,
                expected government stages and professional fees. Immigration
                authorities make every final decision, so we provide
                evidence-led guidance without promising approvals.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-bold text-primary hover:underline dark:text-secondary"
              >
                Why clients choose XIPHIAS
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about/locations"
                className="inline-flex items-center gap-2 font-bold text-primary hover:underline dark:text-secondary"
              >
                Find an immigration office
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-white/10 dark:border-white/10">
            {SERVICES.map(({ title, description, href, linkLabel, icon: Icon }) => (
              <div key={href} className="grid gap-3 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-4">
                <span className="inline-flex size-10 items-center justify-center text-primary dark:text-secondary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="type-card-title">{title}</h3>
                  <p className="type-small mt-1 text-zinc-600 dark:text-zinc-300">
                    {description}
                  </p>
                </div>
                <Link
                  href={href}
                  aria-label={linkLabel}
                  className="inline-flex size-10 items-center justify-center text-primary transition hover:translate-x-1 dark:text-secondary"
                >
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
