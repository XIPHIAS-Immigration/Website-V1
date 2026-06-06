// src/components/PersonalBooking/Sections/index.tsx
"use client";

import { useEffect, useState } from "react";
import Expert from "@/components/PersonalBooking/Expert";
import TestimonialCarouselPro from "@/components/Common/TestimonialCarouselPro";
import AdvisorConsultationCard from "@/components/Citizenship/AdvisorConsultationCard";
import ProblemSolutionCompare from "@/components/PersonalBooking/ProblemSolution";
import { Awards } from "@/components/awards";
import { formatDateUS } from "@/lib/format";

import {
  User,
  AlertTriangle,
  FileText,
  Award,
  MessageCircle,
  DollarSign,
} from "lucide-react";

type ArticleMeta = {
  title: string;
  url: string;
  date?: string;
  summary?: string;
  hero?: string;
  tags?: string[];
};

const navItems = [
  { label: "About", href: "#about", icon: User },
  { label: "ProblemSolutionCompare", href: "#problem", icon: AlertTriangle },
  { label: "Insights", href: "#articles", icon: FileText },
  { label: "Awards & Media", href: "#awards", icon: Award },
  { label: "Client Stories", href: "#testimonials", icon: MessageCircle },
  { label: "Reserve Your Consultation", href: "#consultation", icon: DollarSign },
] as const;

const SECTION_IDS = navItems.map((n) => n.href.slice(1));

function ArticleCard({ a }: { a: ArticleMeta }) {
  return (
    <a
      href={a.url}
      className="group block rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg transition"
      aria-label={a.title}
    >
      {a.hero ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.hero} alt={a.title} className="w-full h-40 object-cover" />
      ) : null}
      <div className="p-4">
        <h3 className="font-semibold leading-snug group-hover:underline">
          {a.title}
        </h3>
        {a.summary ? (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {a.summary}
          </p>
        ) : null}
        <div className="mt-2 text-xs text-gray-500">
          {a.date ? formatDateUS(a.date) : null}
        </div>
      </div>
    </a>
  );
}

export default function Sections({ articles }: { articles: ArticleMeta[] }) {
  const [active, setActive] = useState<string>(SECTION_IDS[0]);
  const [sectionEls, setSectionEls] = useState<Record<string, HTMLElement>>({});

  // Cache section elements once, after DOM is ready
  useEffect(() => {
    if (typeof document === "undefined") return;
    const map: Record<string, HTMLElement> = {};
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) map[id] = el as HTMLElement;
    });
    setSectionEls(map);
  }, []);

  // 1) Initialize from hash; 2) hashchange listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyHash = () => {
      const id = window.location.hash.slice(1);
      if (SECTION_IDS.includes(id)) setActive(id);
    };

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // IntersectionObserver keeps underline in sync while scrolling
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const ratios = new Map<string, number>(); // id -> last ratio

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (!SECTION_IDS.includes(id)) return;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestId = active;
        let bestRatio = -1;
        SECTION_IDS.forEach((id) => {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        });

        if (bestId && bestId !== active) setActive(bestId);
      },
      {
        root: null,
        rootMargin: "-45% 0px -45% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    Object.values(sectionEls).forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionEls, active]);

  // Optimistic highlight on click (so underline moves instantly)
  const handleNavClick = (href: string) => {
    const id = href.slice(1);
    if (SECTION_IDS.includes(id)) setActive(id);
  };

  return (
    <div className="w-full transition-colors duration-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {/* Sticky Top Nav (Desktop) */}
      <section className="sticky top-0 z-40 hidden sm:block bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700">
        <div className="mx-auto max-w-screen-2xl px-4 py-5">
          <nav className="relative flex justify-between text-sm sm:text-base font-medium tracking-wide gap-6 sm:gap-10">
            {navItems.map((item) => {
              const isActive = active === item.href.replace("#", "");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`relative p-5 transition-all duration-300 ${
                    isActive
                      ? "text-black dark:text-white font-semibold"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white p-1"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute left-0 right-0 -bottom-[20px] h-[3px] bg-black dark:bg-white rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Floating Bottom Nav (Mobile) */}
      <nav
        role="tablist"
        aria-label="Section navigation"
        className="
          sm:hidden fixed left-1/2 -translate-x-1/2 z-50
          bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl
          border border-neutral-200/70 dark:border-neutral-700/70
          rounded-2xl shadow-lg w-[92%] max-w-md
        "
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 py-2 gap-1">
          {navItems.map((item) => {
            const isActive = active === item.href.replace("#", "");
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                className={`
                  snap-center shrink-0 grow-0 basis-[84px]
                  flex flex-col items-center justify-center
                  h-16 rounded-xl transition-all
                  ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                  }
                `}
              >
                <div
                  className={`
                    grid place-items-center h-9 w-9 rounded-xl
                    ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-200/60 dark:ring-indigo-800/60"
                        : ""
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <span className="mt-1 text-[10.5px] leading-none line-clamp-1 text-center">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
        <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </nav>

      {/* Sections (no animations) */}
      <section id="about" className="scroll-mt-28">
        <Expert />
      </section>

      {/* Problem & Solution — unchanged */}
      <section id="problem" className="mt-10 scroll-mt-28">
        <ProblemSolutionCompare />
      </section>

      <section id="articles" className="scroll-mt-28">
        <div className="container mx-auto lg:max-w-screen-2xl px-4 py-8">
          {/* Header (card-style, keeps your structure & CTA) */}
          <div className="mb-6 md:mb-8">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--c-border)] bg-[var(--c-card)] p-4 sm:p-5 md:p-6 shadow-sm ring-1 ring-black/[0.03] dark:ring-white/10">
              {/* soft background accents (clipped inside) */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -left-24 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
                <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
                <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(70%_70%_at_10%_10%,black,transparent_75%)]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
                </div>
              </div>

              {/* content: responsive flex with title + CTA */}
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <h2
                  id="insights-top6-title"
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white break-words"
                >
                  Latest Articles
                </h2>

                <div className="shrink-0">
                  <a href="/articles" className="text-blue-600 hover:underline">
                    View all
                  </a>
                </div>
              </div>
            </div>
          </div>

          {articles?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <ArticleCard key={a.url} a={a} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No articles yet.</p>
          )}
        </div>
      </section>

      <section id="awards">
        <Awards variant="preview" />
      </section>

      <section id="testimonials" className="scroll-mt-28">
        <TestimonialCarouselPro className="mt-2" />
      </section>

      <section id="consultation" className="scroll-mt-28">
        <section className="scroll-mt-28 py-6 px-4">
          <AdvisorConsultationCard bookingHref="/booking?plan=paid" />
        </section>
      </section>
    </div>
  );
}
