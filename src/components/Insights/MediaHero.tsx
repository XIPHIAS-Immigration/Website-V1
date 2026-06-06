// src/components/Insights/MediaHero.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

type Action = {
  href: string;
  label: string;
  variant?: "primary" | "ghost";
  download?: boolean;
};

function formatTime(secs: number) {
  if (!Number.isFinite(secs)) return "0:00";
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function MobileCTABar({ actions }: { actions: Action[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // Prefer Brochure / Appointment / Consultation; fallback to first two
  const preferred = actions.filter((a) =>
    /broch|appoint|consult/i.test(a.label),
  );
  const mobileActions = (preferred.length ? preferred : actions).slice(0, 2);
  if (mobileActions.length === 0) return null;

  return createPortal(
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-[60]"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom),12px)" }}
    >
      <div className="mx-auto max-w-screen-sm px-3">
      <div className="flex w-full items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-[0_10px_30px_rgba(0,0,0,0.15)] p-2">
          {mobileActions.map((a) => {
            const base =
              "inline-flex flex-1 basis-1/2 items-center justify-center rounded-xl px-4 h-12 text-sm font-semibold";
            const styles =
              a.variant === "ghost"
                ? "bg-white dark:bg-black text-black dark:text-white ring-1 ring-black/10 dark:ring-white/15"
                : "bg-black text-white hover:brightness-110";
            return (
              <Link
                key={`m-${a.label}`}
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
      </div>
    </div>,
    document.body,
  );
}

export default function MediaHero({
  title,
  subtitle,
  videoSrc,
  poster,
  imageSrc,
  actions = [],
}: {
  title: string;
  subtitle?: string;
  videoSrc?: string;
  poster?: string;
  imageSrc?: string;
  actions?: Action[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasImage = !!imageSrc;
  const hasVideo = !hasImage && !!videoSrc;
  const [isPlaying, setIsPlaying] = useState<boolean>(hasVideo); // auto-start if video exists
  const [isMuted, setIsMuted] = useState<boolean>(true); // browsers block autoplay w/ sound
  const [duration, setDuration] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [isFs, setIsFs] = useState<boolean>(false);

  // Show controls on pointer movement (desktop); always show on touch
  useEffect(() => {
    if (!hasVideo) return;
    const el = containerRef.current;
    if (!el) return;

    let hideTimer: any;
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const show = () => {
      setShowControls(true);
      if (!isTouch) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => setShowControls(false), 1800);
      }
    };

    const onMove = () => show();
    const onLeave = () => !isTouch && setShowControls(false);

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    show(); // initial

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      clearTimeout(hideTimer);
    };
  }, [hasVideo]);

  // Wire media events
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => setDuration(vid.duration || 0);
    const onTime = () => setCurrent(vid.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    vid.addEventListener("loadedmetadata", onLoaded);
    vid.addEventListener("timeupdate", onTime);
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);

    // Try to autoplay muted
    if (hasVideo) {
      vid.muted = isMuted;
      vid.loop = true;
      vid.playsInline = true;
      vid.autoplay = true;
      vid.play().catch(() => {
        // If autoplay fails, just pause and show controls
        setIsPlaying(false);
        setShowControls(true);
      });
    }

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
      vid.removeEventListener("timeupdate", onTime);
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
    };
  }, [hasVideo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fullscreen change
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcuts when container is focused
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasVideo) return;
    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
        e.preventDefault();
        toggleFs();
        break;
      case "arrowleft":
        e.preventDefault();
        seekBy(-5);
        break;
      case "arrowright":
        e.preventDefault();
        seekBy(5);
        break;
    }
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) vid.play().catch(() => null);
    else vid.pause();
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  const seekBy = (delta: number) => {
    const vid = videoRef.current;
    if (!vid || !Number.isFinite(vid.duration)) return;
    const next = Math.min(
      Math.max(0, (vid.currentTime || 0) + delta),
      vid.duration,
    );
    vid.currentTime = next;
    setCurrent(next);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    const vid = videoRef.current;
    if (!vid || !Number.isFinite(duration)) return;
    const next = (val / 1000) * duration;
    vid.currentTime = next;
    setCurrent(next);
  };

  const progress = useMemo(
    () =>
      duration > 0
        ? Math.min(1000, Math.round((current / duration) * 1000))
        : 0,
    [current, duration],
  );

  return (
    <header className="relative">
      {/* Media (container width, not full-bleed) */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="
          group relative w-full aspect-video md:aspect-[16/7] overflow-hidden rounded-2xl md:rounded-3xl
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60
        "
      >
        {hasImage ? (
          <Image
            src={imageSrc!}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        ) : hasVideo ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              poster={poster}
              // Clicking the video toggles play/pause
              onClick={togglePlay}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>

            {/* Controls overlay */}
            <div
              className={[
                "pointer-events-none absolute inset-0 flex flex-col justify-end",
                showControls || !isPlaying ? "opacity-100" : "opacity-0",
                "transition-opacity duration-200",
              ].join(" ")}
            >
              {/* Gradient for legibility */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

              {/* Big center play button when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  aria-label="Play video"
                  className="pointer-events-auto mx-auto mb-20 flex items-center justify-center h-16 w-16 rounded-full bg-white/95 text-black shadow-lg hover:scale-105 transition"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              )}

              {/* Control bar */}
              <div className="pointer-events-auto relative z-10 px-3 pb-3 md:px-5 md:pb-4">
                {/* Progress */}
                <input
                  type="range"
                  aria-label="Seek"
                  min={0}
                  max={1000}
                  value={progress}
                  onChange={onSeek}
                  className="
                    w-full accent-sky-500
                    [--track:theme(colors.white/60)] [--track-dark:theme(colors.neutral.500/50)]
                    [&::-webkit-slider-runnable-track]:h-1.5
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-black/20
                  "
                />

                <div className="mt-2 flex items-center gap-2 text-white/90">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 ring-1 ring-inset ring-white/25"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Mute/Unmute */}
                  <button
                    onClick={toggleMute}
                    className="inline-flex h-9 px-2 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 ring-1 ring-inset ring-white/25"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M16.5 12a4.5 4.5 0 0 0-4.5-4.5v-3a7.5 7.5 0 0 1 7.5 7.5h-3zM3 9v6h4l5 5V4L7 9H3z" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3z" />
                        <path d="M16.5 12a4.5 4.5 0 0 0-4.5-4.5v3a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5v3a4.5 4.5 0 0 0 4.5-4.5z" />
                      </svg>
                    )}
                  </button>

                  {/* Time */}
                  <span className="ml-1 tabular-nums text-[12px] text-white/80">
                    {formatTime(current)} / {formatTime(duration)}
                  </span>

                  <div className="flex-1" />

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFs}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 ring-1 ring-inset ring-white/25"
                    aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFs ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M14 10V4h6v2h-4v4h-2zm-4 4v6H4v-2h4v-4h2zm8 4h-4v2h6v-6h-2v4zM6 6h4V4H4v6h2V6z" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M14 4h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm12 6v-2h4v-4h2v6h-6zM4 10V4h6v2H6v4H4z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_30%_0%,theme(colors.sky.400/.35),transparent),linear-gradient(to_bottom_right,theme(colors.slate.50),theme(colors.slate.100))] dark:bg-[radial-gradient(80%_60%_at_30%_0%,theme(colors.sky.900/.5),transparent),linear-gradient(to_bottom_right,theme(colors.neutral.900),theme(colors.neutral.950))]" />
        )}
      </div>

      {/* desktop title overlay for readability */}
      <div className="pointer-events-none absolute inset-0 hidden md:block rounded-2xl md:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/10 rounded-2xl md:rounded-3xl" />
        <div className="absolute inset-0 flex items-end">
          <div className="p-6 md:p-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-white/90">{subtitle}</p>}
              {!!actions.length && (
                <div className="mt-6 flex flex-wrap items-end gap-3 sm:gap-4">
                  {actions.map((a) => {
                    const base =
                      "pointer-events-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80";
                    const styles =
                      a.variant === "ghost"
                        ? "bg-white/15 text-white backdrop-blur ring-1 ring-inset ring-white/25 hover:bg-white/25"
                        : "bg-white text-black shadow-lg hover:brightness-[1.02]";
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
      </div>

      {/* mobile CTA bar — removed per request */}
      {/* <MobileCTABar actions={actions} /> */}
    </header>
  );

  function toggleFs() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => null);
    } else {
      document.exitFullscreen?.().catch(() => null);
    }
  }
}
