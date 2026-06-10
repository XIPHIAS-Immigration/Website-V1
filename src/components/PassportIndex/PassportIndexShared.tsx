import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  FileCheck2,
  Globe2,
  Landmark,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { PassportRecord, PassportRegion } from "@/data/passport-index";

export type PassportStats = {
  snapshotLabel: string;
  sourceLabel: string;
  trackedPassports: number;
  trackedDestinations: number;
  topScore: number;
  lowestScore: number;
  mobilityGap: number;
};

type SectionId = "overview" | "ranking" | "compare" | "my-passport" | "improve" | "methodology";

type SectionLink = {
  id: SectionId;
  label: string;
  href: string;
  summary: string;
  icon: ComponentType<{ className?: string }>;
};

export const passportSectionLinks: SectionLink[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/passport-index",
    summary: "Visual snapshot and client journey.",
    icon: Globe2,
  },
  {
    id: "ranking",
    label: "Ranking",
    href: "/passport-index/ranking",
    summary: "Search the passport strength table.",
    icon: BarChart3,
  },
  {
    id: "compare",
    label: "Compare",
    href: "/passport-index/compare",
    summary: "Side-by-side mobility gap.",
    icon: Compass,
  },
  {
    id: "my-passport",
    label: "My Passport",
    href: "/passport-index/my-passport",
    summary: "Start from a client passport.",
    icon: MapPinned,
  },
  {
    id: "improve",
    label: "Improve",
    href: "/passport-index/improve",
    summary: "Turn ranking into route options.",
    icon: Route,
  },
  {
    id: "methodology",
    label: "Methodology",
    href: "/passport-index/methodology",
    summary: "Sources, scoring, and caution notes.",
    icon: FileCheck2,
  },
];

export function scoreWidth(score: number, topScore: number) {
  return `${Math.max(5, Math.round((score / topScore) * 100))}%`;
}

export function bandClass(band: PassportRecord["band"]) {
  if (band === "Elite access") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (band === "High access") return "border-blue-200 bg-blue-50 text-blue-800";
  if (band === "Strategic mobility") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-rose-200 bg-rose-50 text-rose-800";
}

export function regionClass(region: PassportRegion) {
  if (region === "Europe") return "bg-[#eaf2ff] text-[#1c57b4]";
  if (region === "Asia") return "bg-[#fff6d8] text-[#7a5c00]";
  if (region === "Middle East") return "bg-[#eef9f4] text-[#0f6b47]";
  if (region === "North America") return "bg-[#f0edff] text-[#4e3aa8]";
  return "bg-[#fff0f0] text-[#9a3412]";
}

export function passportProfileHref(record: PassportRecord) {
  return `/passport-index/passport/${record.code.toLowerCase()}`;
}

export function getRecordByCode(records: PassportRecord[], code: string) {
  return records.find((record) => record.code.toLowerCase() === code.toLowerCase());
}

export function PassportSectionNav({ active }: { active: SectionId }) {
  return (
    <nav aria-label="Passport index sections" className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#080b12]">
      <div className="mx-auto flex max-w-screen-2xl gap-2 overflow-x-auto px-4 py-3 md:px-6">
        {passportSectionLinks.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border px-4 py-2 text-sm font-black transition",
                isActive
                  ? "border-[#1c57b4] bg-[#1c57b4] text-white shadow-sm"
                  : "border-slate-200 bg-white text-[#071a3a] hover:border-[#1c57b4] hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900",
              ].join(" ")}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PassportIndexShell({
  active,
  eyebrow,
  title,
  description,
  children,
}: {
  active: SectionId;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="bg-[#f6f8fc] text-[#102033] dark:bg-[#080b12] dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0a111f]">
        <div className="mx-auto max-w-screen-2xl px-4 py-9 md:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b923]/40 bg-[#fff8df] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#7a5c00] dark:bg-[#2c2408] dark:text-[#f6d86d]">
            <Sparkles className="size-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight text-[#071a3a] md:text-5xl dark:text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </section>
      <PassportSectionNav active={active} />
      {children}
    </main>
  );
}

export function PassportBookVisual({ featured }: { featured?: PassportRecord }) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px]">
      <div className="absolute left-[12%] top-[14%] h-[70%] w-[56%] rotate-[-8deg] rounded-lg border border-[#e1b923]/70 bg-[#071a3a] shadow-2xl shadow-black/35 transition duration-500 motion-safe:group-hover:rotate-[-6deg]">
        <div className="absolute inset-4 rounded-md border border-[#e1b923]/45" />
        <div className="absolute inset-x-10 top-12 h-px bg-[#e1b923]/45" />
        <div className="absolute left-1/2 top-[32%] flex size-20 -translate-x-1/2 items-center justify-center rounded-full border border-[#e1b923]/70 bg-[#0d3470]">
          <Image
            src="/images/logo/xiphias-immigration-white.png"
            alt="XIPHIAS Immigration"
            width={96}
            height={44}
            className="h-auto w-20 object-contain"
          />
        </div>
        <div className="absolute inset-x-10 bottom-16 text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#f6d86d]">XIPHIAS</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e1b923]">Global Mobility</p>
        </div>
        <div className="absolute inset-y-0 left-8 w-px bg-white/10" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute -left-24 top-0 h-full w-24 rotate-12 bg-white/12 motion-safe:animate-shine" />
        </div>
      </div>

      <div className="absolute right-[6%] top-[24%] h-[58%] w-[46%] rotate-[7deg] rounded-lg border border-slate-200 bg-white p-4 shadow-2xl shadow-black/25 transition duration-500 motion-safe:group-hover:rotate-[5deg]">
        <div className="h-full rounded-md border border-slate-200 bg-[#f8fafc] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1c57b4]">Mobility profile</span>
            <span className="rounded-full bg-[#fff6d8] px-2 py-1 text-[10px] font-black text-[#7a5c00]">
              {featured?.code ?? "XP"}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-[72px_1fr] gap-4">
            <div className="aspect-[3/4] rounded-md border border-[#1c57b4]/25 bg-[#dbeafe] p-2">
              <div className="mx-auto mt-2 size-8 rounded-full bg-[#1c57b4]/30" />
              <div className="mx-auto mt-3 h-14 w-12 rounded-t-full bg-[#1c57b4]/25" />
            </div>
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-slate-200" />
              <div className="h-2 w-4/5 rounded-full bg-slate-200" />
              <div className="h-2 w-3/5 rounded-full bg-slate-200" />
              <div className="mt-4 rounded-md bg-[#071a3a] px-3 py-2 text-center text-sm font-black text-[#f6d86d]">
                {featured?.score ?? 192}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <span className="h-8 rounded border border-slate-200 bg-white" />
            <span className="h-8 rounded border border-slate-200 bg-white" />
            <span className="h-8 rounded border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span className="inline-flex min-w-14 items-center justify-center rounded-full bg-[#1c57b4] px-3 py-1 text-sm font-black text-white">
      {score}
    </span>
  );
}

export function PassportSourceNote() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 pb-12 md:px-6">
      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-xl font-black text-[#071a3a] dark:text-white">Data position</h2>
          <p className="mt-2">
            This is a XIPHIAS advisory presentation layer. It uses a neutral public mobility snapshot and adds route-planning context for residence, citizenship, family, and risk strategy.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-black text-[#071a3a] dark:text-white">Important caution</h2>
          <p className="mt-2">
            Passport ranking is not legal advice. Visa rules, sanctions, source-of-funds checks, and program rules can change, so an advisor must verify the latest details before decisions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-[#1c57b4] dark:border-slate-700">
              XIPHIAS advisory layer
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-black text-[#1c57b4] dark:border-slate-700">
              Staff verification required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RouteCard({
  icon,
  title,
  description,
  href,
  cta = "Open",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  cta?: string;
}) {
  const Icon = icon;

  return (
    <Link
      href={href}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1c57b4] hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="flex size-11 items-center justify-center rounded-md bg-[#eaf2ff] text-[#1c57b4] transition group-hover:bg-[#1c57b4] group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-black text-[#071a3a] dark:text-white">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#1c57b4]">
        {cta}
        <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function PassportMiniCard({ record, stats }: { record: PassportRecord; stats: PassportStats }) {
  return (
    <Link
      href={passportProfileHref(record)}
      className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#1c57b4] hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1c57b4]">{record.rank}</p>
          <h3 className="mt-1 text-lg font-black text-[#071a3a] dark:text-white">{record.country}</h3>
          <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${regionClass(record.region)}`}>
            {record.region}
          </span>
        </div>
        <ScorePill score={record.score} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-[#e1b923]" style={{ width: scoreWidth(record.score, stats.topScore) }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{record.xiphiasLens}</p>
    </Link>
  );
}

export const indexValueCards = [
  {
    icon: Landmark,
    title: "Rank",
    description: "Shows current travel access strength.",
  },
  {
    icon: ShieldCheck,
    title: "Risk",
    description: "Adds program, compliance, and document review.",
  },
  {
    icon: BookOpen,
    title: "Route",
    description: "Connects ranking to residence or citizenship actions.",
  },
];
