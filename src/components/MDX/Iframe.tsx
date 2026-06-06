"use client";

import { useMemo, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<"iframe">;

function normalizeIframeSrc(src?: string) {
  if (!src) return src;
  return src.replace(
    /^https?:\/\/www\.youtube\.com\/embed\//i,
    "https://www.youtube-nocookie.com/embed/",
  );
}

function parseYouTubeId(src?: string) {
  if (!src) return null;
  const m = src.match(
    /^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{6,})/i,
  );
  return m?.[1] ?? null;
}

function withAutoplay(src: string) {
  try {
    const u = new URL(src);
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("modestbranding", "1");
    return u.toString();
  } catch {
    return src;
  }
}

export default function Iframe(props: Props) {
  const src = normalizeIframeSrc(props.src);
  const videoId = useMemo(() => parseYouTubeId(src), [src]);
  const [loaded, setLoaded] = useState(false);

  if (!src) return null;

  if (!videoId) {
    return (
      <iframe
        {...props}
        src={src}
        loading={props.loading ?? "lazy"}
        referrerPolicy={props.referrerPolicy ?? "strict-origin-when-cross-origin"}
      />
    );
  }

  const title = props.title || "Embedded video";
  const embedSrc = withAutoplay(src);
  const poster = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative my-4 aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-black/10 dark:ring-white/15">
      {loaded ? (
        <iframe
          {...props}
          src={embedSrc}
          title={title}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 flex h-full w-full items-center justify-center"
          aria-label={title ? `Play video: ${title}` : "Play video"}
          title={title ? `Play video: ${title}` : "Play video"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
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
  );
}
