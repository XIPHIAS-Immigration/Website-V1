"use client";

import * as React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { Star, BadgeCheck, Quote } from "lucide-react";

import { TESTIMONIALS_PRO, type Testimonial } from "@/app/api/testimonials";

/* =============================================================================
   TestimonialCarouselMarquee
   - Uniform cards (all equal)
   - No read-more, no pause/play, no arrows/dots
   - Auto + slow marquee-style movement (right → left)
   - Reusable: uses imported data by default; can accept items prop
   - NEW: Initials-only by default (no images needed). Toggle with showInitialsOnly.
   ============================================================================= */

export type TestimonialCarouselProps = {
  items?: Testimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
  /** If true (default), ignore item.image and render initials instead */
  showInitialsOnly?: boolean;
};

export default function TestimonialCarouselMarquee({
  items,
  title = "What our clients say",
  subtitle = "Real feedback from people who trusted us.",
  className = "",
  showInitialsOnly = true,
}: TestimonialCarouselProps) {
  const data = (items?.length ? items : TESTIMONIALS_PRO) as Testimonial[];

  return (
    <section
      role="region"
      className={[
        "mx-auto max-w-screen-2xl px-4 py-5",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20",
        className,
      ].join(" ")}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 text-[12px]">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
            <span className="font-semibold">Testimonials</span>
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h2>
          <p className="mt-1 text-sm md:text-[15px] text-neutral-700 dark:text-neutral-300">
            {subtitle}
          </p>
        </div>

        {/* Marquee-style slider: slow, continuous, right → left */}
        <Swiper
          modules={[A11y, Autoplay, FreeMode]}
          a11y={{ enabled: true }}
          freeMode={{ enabled: true, momentum: false }}
          allowTouchMove={false}
          loop
          speed={9000} // slow, smooth
          autoplay={{
            delay: 0, // continuous
            disableOnInteraction: false,
            pauseOnMouseEnter: false, // keep moving
          }}
          slidesPerView={1}
          spaceBetween={18}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 18 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
            1280: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="!pb-2"
        >
          {data.map((t, idx) => (
            <SwiperSlide key={`${t.name}-${idx}`} className="!h-auto">
              <Card item={t} showInitialsOnly={showInitialsOnly} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

/* ================================= Card ================================ */

function Card({
  item: t,
  showInitialsOnly,
}: {
  item: Testimonial;
  showInitialsOnly: boolean;
}) {
  const stars = Math.max(0, Math.min(5, t.rating ?? 0));
  return (
    <article
      className={[
        "h-full flex flex-col justify-between",
        "rounded-2xl ring-1 ring-blue-100/80 bg-white/90 p-6 md:p-7 shadow-sm",
        "dark:ring-blue-900/40 dark:bg-white/[0.03]",
      ].join(" ")}
    >
      {/* Top meta */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Quote className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Review
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          aria-label={`${stars} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-neutral-300 dark:text-neutral-700"
              }
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">
        “{t.text}”
      </p>

      {/* Person */}
      <div className="mt-5 flex items-center gap-3">
        <Avatar src={showInitialsOnly ? undefined : t.image} alt={t.name} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[15px] font-semibold text-neutral-900 dark:text-neutral-50">
              {t.name}
            </h3>
            {t.verified && (
              <span
                title="Verified reviewer"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-800/60"
              >
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
          <p className="truncate text-sm text-neutral-600 dark:text-neutral-300">
            {t.role}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =============================== Avatar =============================== */

function Avatar({
  src,
  alt,
  size = 48,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  const [error, setError] = React.useState(false);
  const letters = initials(alt);

  const label =
    alt && alt.trim().length > 0 ? `${alt}'s avatar` : "Client avatar";

  // Always fallback if no src OR error
  if (!src || error) {
    return (
      <div
        role="img"
        aria-label={label}
        className="flex items-center justify-center rounded-full ring-1 ring-blue-200 dark:ring-blue-900/40 bg-blue-100/70 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
        style={{ width: size, height: size }}
      >
        <span className="text-sm font-semibold">{letters}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={label}
      width={size}
      height={size}
      onError={() => setError(true)}
      className="rounded-full object-cover ring-1 ring-blue-100/80 dark:ring-blue-900/40"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}