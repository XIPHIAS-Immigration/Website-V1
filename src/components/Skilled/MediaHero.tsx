"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type ActionVariant = "primary" | "ghost";

type Action = {
  href: string;
  label: string;
  variant?: ActionVariant;
  download?: boolean;
};

type SkilledHeroProps = {
  title: string;
  subtitle?: string;
  videoSrc?: string;
  poster?: string;
  imageSrc?: string;
  actions?: Action[];
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  startAt?: number;
};

const isYouTubeUrl = (url: string) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

const getYouTubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);

    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;

      const parts = u.pathname.split("/");
      const embedIdx = parts.findIndex((p) => p === "embed");
      if (embedIdx !== -1 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    }
  } catch {
    // ignore invalid URLs
  }
  return null;
};

export default function SkilledHero({
  title,
  subtitle,
  videoSrc,
  poster,
  imageSrc,
  actions = [
    {
      label: "Download Brochure",
      href: "/brochures/skilled/australia.pdf",
      variant: "ghost",
      download: true,
    },
    {
      label: "Check Eligibility",
      href: "#eligibility",
      variant: "primary",
    },
  ],
  controls = false,
  autoPlay = true,
  muted = true,
  loop = true,
  startAt = 0,
}: SkilledHeroProps) {
  const ytId = videoSrc && isYouTubeUrl(videoSrc) ? getYouTubeId(videoSrc) : null;
  const safeStartAt = Math.max(0, startAt || 0);

  const youTubeSrc = useMemo(() => {
    if (!ytId) return null;

    const params = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      controls: controls ? "1" : "0",
      autoplay: autoPlay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      start: safeStartAt ? String(safeStartAt) : "0",
      playlist: loop ? ytId : "",
    });

    return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
  }, [ytId, controls, autoPlay, muted, loop, safeStartAt]);

  const imageAlt = title ? `${title} hero image` : "Skilled visa hero image";

  return (
    <header className="relative mb-4 overflow-hidden rounded-3xl">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:aspect-[16/7] md:rounded-3xl">
        {videoSrc ? (
          ytId && youTubeSrc ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={youTubeSrc}
              title={title || "Skilled program video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              controls={controls}
              playsInline
              preload="metadata"
              poster={poster}
              onLoadedMetadata={(e) => {
                try {
                  const el = e.target as HTMLVideoElement;
                  if (safeStartAt && el.currentTime < safeStartAt) {
                    el.currentTime = safeStartAt;
                  }
                } catch {
                  // ignore
                }
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )
        ) : imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1024px, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slateGray" />
        )}
      </div>

      {/* Desktop-only overlay & CTAs */}
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/65 via-black/35 to-black/10 md:block" />
      <div className="absolute inset-0 hidden items-end md:flex">
        <div className="p-6 md:p-10">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-white/90">{subtitle}</p>}
            {!!actions.length && (
              <div className="mt-6 flex flex-wrap items-end gap-3 sm:gap-4">
                {actions.map((a) => {
                  const base =
                    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
                  const styles =
                    a.variant === "ghost"
                      ? "bg-white/20 text-white backdrop-blur ring-1 ring-inset ring-white/30 hover:bg-white/30"
                      : "bg-gradient-to-r from-blue-500 via-purple-600 to-fuchsia-600 text-white shadow-lg";
                  return (
                    <Link
                      key={a.label}
                      href={a.href}
                      prefetch={false}
                      download={a.download}
                      className={`${base} ${styles}`}
                    >
                      {a.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}