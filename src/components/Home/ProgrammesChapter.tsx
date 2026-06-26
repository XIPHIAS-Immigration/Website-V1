import Link from "next/link";
import { ArrowRight, Landmark, BadgeCheck, Gem, GraduationCap, Briefcase, FileBadge } from "lucide-react";

import { Reveal, Stagger, StaggerItem, SplitText } from "@/components/motion";
import { getProgrammeExplorerData } from "@/lib/programme-explorer";

type Pathway = {
  title: string;
  blurb: string;
  href: string;
  count: string;
  Icon: typeof Landmark;
  accent: string;
};

/**
 * "Browse by Programme" — the pathway-first entry point on the home page
 * (replaces the four vertical chapters). Cards link to the existing hubs.
 */
export default function ProgrammesChapter() {
  const items = getProgrammeExplorerData().items.filter((i) => i.source === "site-content");
  const n = (t: string) => items.filter((i) => i.track === t).length;

  const pathways: Pathway[] = [
    {
      title: "Residency by Investment",
      blurb: "Golden visas and investor residence across Europe, the Gulf and Asia.",
      href: "/residency",
      count: `${n("residency")} programmes`,
      Icon: Landmark,
      accent: "#0e7c66",
    },
    {
      title: "Citizenship by Investment",
      blurb: "Donation or real-estate routes to a powerful second passport.",
      href: "/citizenship",
      count: `${n("citizenship")} programmes`,
      Icon: BadgeCheck,
      accent: "#b8860b",
    },
    {
      title: "Golden Visa",
      blurb: "The headline residence-by-investment programmes, compared.",
      href: "/golden-visa",
      count: "8 destinations",
      Icon: Gem,
      accent: "#c2992f",
    },
    {
      title: "Skilled Migration",
      blurb: "Points-based PR and work visas mapped to your profile.",
      href: "/skilled",
      count: `${n("skilled")} programmes`,
      Icon: GraduationCap,
      accent: "#2563eb",
    },
    {
      title: "Corporate & Business",
      blurb: "Intra-company transfers, market entry and global mobility.",
      href: "/corporate",
      count: `${n("corporate")} programmes`,
      Icon: Briefcase,
      accent: "#7c3aed",
    },
    {
      title: "Work Permits",
      blurb: "Employer-sponsored and skilled work routes, advised end to end.",
      href: "/work-permits",
      count: "8 countries",
      Icon: FileBadge,
      accent: "#0a1f44",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary dark:border-white/15 dark:bg-white/5 dark:text-white">
              Find by programme
            </span>
            <h2 className="mt-5 text-[clamp(2rem,4.6vw,3.25rem)] font-black leading-[1.05] tracking-tight text-midnight_text">
              <SplitText text="Choose your pathway" accentIndices={[2]} accentClassName="text-primary" />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-light_grey dark:text-white/65">
              Know the route you want? Jump straight in. Every programme is advisor-reviewed and mapped
              to real eligibility.
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" amount={0.12}>
          {pathways.map(({ title, blurb, href, count, Icon, accent }) => (
            <StaggerItem key={title} className="h-full">
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#0b1322]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex size-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accent}14`, color: accent }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-light_grey dark:text-white/45">
                    {count}
                  </span>
                </div>
                <h3 className="mt-4 text-[18px] font-black text-midnight_text dark:text-white">{title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-light_grey dark:text-white/65">{blurb}</p>
                <span
                  className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-bold"
                  style={{ color: accent }}
                >
                  Explore
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1}>
          <div className="mt-8 text-center">
            <Link
              href="/xiphias-program-index"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-6 py-3 text-[14px] font-bold text-primary transition hover:bg-primary hover:text-white dark:border-white/20 dark:text-white"
            >
              Compare every programme
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
