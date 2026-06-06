"use client";

import * as React from "react";

/**
 * MDX <Video /> block
 * - Supports either:
 *    1) <Video url="https://www.youtube.com/embed/..." title="..."/>  (iframe embed)
 *    2) <Video src="/videos/clip.mp4" poster="/poster.jpg" />        (HTML5 <video>)
 * - Pure black/white UI, responsive with CSS aspect-ratio.
 */

type Props = {
  /** Use `url` for YouTube/Vimeo/etc. embed URLs (already in /embed form). */
  url?: string;
  /** Use `src` for self-hosted files (mp4/webm/ogg). */
  src?: string;
  title?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  /** CSS aspect ratio; defaults to 16 / 9 */
  aspect?: "16/9" | "4/3" | "1/1" | "21/9";
  className?: string;
};

const aspectToCSS: Record<NonNullable<Props["aspect"]>, string> = {
  "16/9": "16 / 9",
  "4/3": "4 / 3",
  "1/1": "1 / 1",
  "21/9": "21 / 9",
};

export default function Video({
  url,
  src,
  title,
  poster,
  controls = true,
  autoPlay = false,
  loop = false,
  muted = false,
  aspect = "16/9",
  className,
}: Props) {
  const style: React.CSSProperties = {
    aspectRatio: aspectToCSS[aspect] || "16 / 9",
  };
  const [embedLoaded, setEmbedLoaded] = React.useState(false);

  // If neither url nor src is provided, render nothing (avoids crashes)
  if (!url && !src) return null;

  // Self-hosted video branch
  if (src) {
    // Best-effort MIME type
    const lower = src.toLowerCase();
    const type = lower.endsWith(".webm")
      ? "video/webm"
      : lower.endsWith(".ogg") || lower.endsWith(".ogv")
        ? "video/ogg"
        : "video/mp4";

    return (
      <figure className={["my-6", className].filter(Boolean).join(" ")}>
        <div
          className="relative w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black"
          style={style}
        >
          <video
            className="absolute inset-0 h-full w-full"
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            preload="metadata"
          >
            <source src={src} type={type} />
            {title ? <track kind="captions" label={title} /> : null}
            Your browser does not support the video tag.
          </video>
        </div>
        {title && (
          <figcaption className="mt-2 text-sm text-black/80 dark:text-white/80">
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  // Embed branch (YouTube/Vimeo/etc.)
  const embedUrl = url!;
  const ytMatch = embedUrl.match(
    /^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/i,
  );
  const ytId = ytMatch?.[1] ?? null;
  const posterImage = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";

  const autoplayUrl = (() => {
    try {
      const u = new URL(embedUrl);
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("rel", "0");
      u.searchParams.set("modestbranding", "1");
      return u.toString();
    } catch {
      return embedUrl;
    }
  })();

  return (
    <figure className={["my-6", className].filter(Boolean).join(" ")}>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black"
        style={style}
      >
        {embedLoaded || !ytId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={ytId ? autoplayUrl : embedUrl}
            title={title || "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEmbedLoaded(true)}
            className="group absolute inset-0 flex h-full w-full items-center justify-center"
            aria-label={title ? `Play video: ${title}` : "Play video"}
            title={title ? `Play video: ${title}` : "Play video"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <span className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Play video
            </span>
          </button>
        )}
      </div>
      {title && (
        <figcaption className="mt-2 text-sm text-black/80 dark:text-white/80">
          {title}
        </figcaption>
      )}
    </figure>
  );
}
