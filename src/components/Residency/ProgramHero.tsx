"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

/* ---------------------------
   Tiny utilities (inline)
---------------------------- */

const BLUR_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225' preserveAspectRatio='none'>
      <defs>
        <linearGradient id='g'>
          <stop stop-color='#f3f4f6' offset='20%'/>
          <stop stop-color='#e5e7eb' offset='50%'/>
          <stop stop-color='#f3f4f6' offset='70%'/>
        </linearGradient>
      </defs>
      <rect width='400' height='225' fill='#f3f4f6'/>
      <rect id='r' width='400' height='225' fill='url(#g)'/>
      <animate xlink:href='#r' attributeName='x' from='-400' to='400' dur='1.2s' repeatCount='indefinite' />
    </svg>`,
  );

function isHttp(p?: string) {
  return !!p && /^https?:\/\//i.test(p);
}
function isRootAbs(p?: string) {
  return !!p && p.startsWith("/");
}
function isDataUri(p?: string) {
  return !!p && p.startsWith("data:");
}

/** Accepts http(s), root-absolute & data:; coerces other relatives to root-absolute. */
function normalizeAssetPath(p?: string, fallback?: string) {
  if (!p) return fallback ?? "";
  if (isHttp(p) || isRootAbs(p) || isDataUri(p)) return p;
  return `/${p.replace(/^\/+/, "")}`;
}

function getCountryPoster(countrySlug: string) {
  return `/images/countries/${countrySlug}-hero-poster.jpg`;
}

/** Local fallback cycler for image sources */
function useSrcFallback(srcs: (string | undefined)[]) {
  const candidates = useMemo(
    () => srcs.filter(Boolean).map((s) => normalizeAssetPath(s!)),
    [srcs],
  );
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] ?? "";

  const onError = () => {
    setIdx((i) => (i < candidates.length - 1 ? i + 1 : i));
  };

  return { src, onError };
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`animate-pulse bg-black/5 ${className}`} />
  );
}

/* ---------------------------
   Props
---------------------------- */

type ProgramHeroProps = {
  title: string;
  country: string;
  tagline?: string;

  /** Prefer image; if video is present, the video (with controls) is shown */
  heroImage?: string;

  /** Optional short .mp4/.webm; native controls are visible */
  heroVideo?: string;

  /** Poster used for video and as an image candidate */
  heroPoster?: string;

  /** Derives /images/countries/<slug>-hero-poster.jpg */
  countrySlug?: string;

  /** Optional explicit alt text for the hero media (image/video) */
  heroAlt?: string;

  /** Mark as LCP if this is the top-most hero */
  priority?: boolean;

  /** CTA buttons/links slot */
  actions?: React.ReactNode;

  /** Attempt autoplay (respects reduced-motion) */
  videoAutoplay?: boolean;

  className?: string;
};

/* ---------------------------
   Component
---------------------------- */

export default function ProgramHero({
  title,
  country,
  tagline,
  heroImage,
  heroVideo,
  heroPoster,
  countrySlug,
  heroAlt,
  priority = true,
  actions,
  videoAutoplay = false,
  className,
}: ProgramHeroProps) {
  const derivedPoster = countrySlug ? getCountryPoster(countrySlug) : undefined;

  const finalDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill=\"#f8fafc\"/></svg>",
  )}`;

  const { src: imgSrc, onError: onImageError } = useSrcFallback([
    heroImage,
    heroPoster,
    derivedPoster,
    "/xiphias-immigration.png",
    finalDataUri,
  ]);

  const [imgLoaded, setImgLoaded] = useState(false);

  // Respect reduced motion for autoplay
  const [allowMotion, setAllowMotion] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setAllowMotion(!mq.matches);
    apply();
    const handler = (e: MediaQueryListEvent) => setAllowMotion(!e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const shouldAutoplay = !!heroVideo && videoAutoplay && allowMotion;

  // Centralised accessible text for image & video
  const imageAlt =
    heroAlt ||
    (tagline
      ? `${title} – ${tagline}`
      : `${title} – ${country} program hero image`);

  const videoLabel = heroAlt || `${title} program video`;

  return (
    <header
      className={[
        "relative isolate overflow-hidden mb-6",
        "rounded-3xl shadow-md",
        "bg-gradient-to-br from-blue-500/10 via-white to-indigo-500/10",
        className ?? "",
      ].join(" ")}
    >
      {/* Decorative background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative z-10 p-6 md:p-10">
        <div className="mx-auto grid max-w-7xl items-center gap-6 lg:grid-cols-2">
          {/* Text */}
          <div className="order-2 lg:order-1">
            {/* Country chip */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs text-gray-600 backdrop-blur"
              aria-label={`Country: ${country}`}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500"
                aria-hidden
              />
              {country}
            </div>

            <h1 className="mt-2 text-balance font-semibold leading-tight text-gray-900 [font-size:clamp(1.875rem,2.5vw,2.5rem)]">
              {title}
            </h1>

            {tagline && (
              <p className="mt-3 text-pretty text-base leading-relaxed text-gray-600">
                {tagline}
              </p>
            )}

            {actions && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </div>

          {/* Media */}
          <div className="order-1 lg:order-2">
            <div
              className="relative aspect-video w-full overflow-hidden rounded-2xl"
              aria-busy={!imgLoaded && !heroVideo}
            >
              {heroVideo ? (
                <video
                  className="h-full w-full object-cover"
                  poster={normalizeAssetPath(
                    heroPoster || derivedPoster || "/xiphias-immigration.png",
                  )}
                  controls
                  playsInline
                  muted={shouldAutoplay}
                  autoPlay={shouldAutoplay}
                  loop={shouldAutoplay}
                  preload="metadata"
                  aria-label={videoLabel}
                >
                  <source src={normalizeAssetPath(heroVideo)} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {!imgLoaded && <Skeleton className="absolute inset-0" />}
                  <OptimizedHeroImage
                    src={imgSrc}
                    alt={imageAlt}
                    onError={onImageError}
                    onLoad={() => setImgLoaded(true)}
                    priority={priority}
                  />
                </>
              )}

              {/* Subtle scrim to improve legibility when text overlaps on small screens */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/60 to-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------
   Image wrapper (Next/Image)
---------------------------- */

function OptimizedHeroImage({
  src,
  alt,
  onError,
  onLoad,
  priority,
}: {
  src: string;
  alt: string;
  onError?: () => void;
  onLoad?: () => void;
  priority?: boolean;
}) {
  const isRemoteLike = isHttp(src) || isDataUri(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover will-change-transform transition-opacity duration-300"
      sizes="(min-width: 1024px) 48vw, 100vw"
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      placeholder="blur"
      blurDataURL={BLUR_SVG}
      onError={onError}
      onLoad={onLoad}
      // Prevent domain-config/loader issues for remote or data: URLs
      unoptimized={isRemoteLike}
    />
  );
}
