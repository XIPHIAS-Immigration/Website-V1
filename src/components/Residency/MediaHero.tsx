"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type Action = {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
  download?: boolean;
};

// --- helpers to support YouTube links in videoSrc ---
const isYouTubeUrl = (url: string) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);

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
    // ignore parse errors and treat as non-YouTube
  }
  return null;
};

export default function MediaHero({
  title,
  subtitle,
  videoSrc,
  poster,
  imageSrc,
  actions = [],
  // NEW: playback controls
  controls = false,
  autoPlay = true,
  muted = true,
  loop = true,
  startAt = 0,
}: {
  title: string;
  subtitle?: string;
  videoSrc?: string; // local mp4 OR YouTube URL
  poster?: string;
  imageSrc?: string;
  actions?: Action[];
  controls?: boolean; // show native controls (HTML5) / player controls (YouTube)
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  startAt?: number; // seconds to start from (YouTube + HTML5)
}) {
  const shouldRenderImage = Boolean(imageSrc);
  const shouldRenderVideo = !shouldRenderImage && Boolean(videoSrc);
  const ytId = videoSrc && isYouTubeUrl(videoSrc) ? getYouTubeId(videoSrc) : null;

  // Build the YouTube URL with flags that mirror the HTML5 attrs
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
      start: startAt ? String(startAt) : "0",
      // Needed for looping a single video in YT
      playlist: loop ? ytId : "",
    });
    return `https://www.youtube.com/embed/${ytId}?${params.toString()}`;
  }, [ytId, controls, autoPlay, muted, loop, startAt]);

  return (
    <header className="relative mb-4 overflow-hidden rounded-3xl">
      {/* MEDIA: mobile 16:9; desktop 16:7 */}
      <div className="relative w-full aspect-video md:aspect-[16/7] rounded-2xl md:rounded-3xl overflow-hidden">
        {shouldRenderImage ? (
          <Image src={imageSrc!} alt={title} fill className="object-cover" />
        ) : shouldRenderVideo ? (
          ytId && youTubeSrc ? (
            // YouTube embed
            <iframe
              className="absolute inset-0 h-full w-full"
              src={youTubeSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              // tie to props
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              controls={controls}
              playsInline
              preload="metadata"
              poster={poster}
              // attempt startAt for HTML5 once metadata is loaded
              onLoadedMetadata={(e) => {
                try {
                  if (startAt && (e.target as HTMLVideoElement).currentTime < startAt) {
                    (e.target as HTMLVideoElement).currentTime = startAt;
                  }
                } catch {}
              }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )
        ) : (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slateGray" />
        )}
      </div>

      {/* DESKTOP overlay & CTAs (hidden on mobile) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/10 hidden md:block" />
      <div className="absolute inset-0 hidden md:flex items-end">
        <div className="p-6 md:p-10">
          <div className="max-w-3xl text-white">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
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
