// src/components/Home/Hero/slider.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Item = {
  kind?: "news" | "articles" | "media" | "blog" | string;
  title?: string;
  url?: string;
  link?: string;
  slug?: string;
  hero?: string;
  image?: string;
  cover?: string;
  thumbnail?: string;
  date?: string;
  updated?: string;
};

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='160'><rect width='100%' height='100%' fill='#eef2f7'/></svg>`,
  );

/* ─ helpers ─ */

function getKind(item: Item): "News" | "Article" | "Media" | "Blog" {
  const raw = (item?.kind || (item as any)?.type || "").toString().toLowerCase();
  if (raw.startsWith("news")) return "News";
  if (raw.startsWith("article")) return "Article";
  if (raw.startsWith("media")) return "Media";
  if (raw.startsWith("blog")) return "Blog";
  return "Article";
}
const getImg = (i: Item) => i?.hero || i?.image || i?.cover || i?.thumbnail || FALLBACK_IMG;

const INTERNAL_HOSTS = new Set([
  "xiphiasimmigration.com",
  "www.xiphiasimmigration.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
]);

function normalizeHref(raw?: string, item?: Item) {
  let out = raw || "#";
  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "https://www.xiphiasimmigration.com";
    const u = new URL(out, base);
    if (INTERNAL_HOSTS.has(u.hostname)) out = u.pathname + u.search + u.hash;
  } catch {}
  out = out.replace(/^\/insights\/(news|articles|media|blog)\//, "/$1/");
  if ((!out || out === "#") && item?.kind && item?.slug) {
    const k = String(item.kind).toLowerCase();
    if (["news", "articles", "media", "blog"].includes(k)) out = `/${k}/${item.slug}`;
  }
  return out || "#";
}
const getUrl = (i: Item) => normalizeHref(i?.url || i?.link, i);

function getDate(i: Item) {
  const raw = i?.updated || i?.date;
  if (!raw) return "";
  const d = new Date(raw);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildHighlights(src: Item[], minSlides = 10) {
  const buckets = {
    News: src.filter((s) => getKind(s) === "News"),
    Article: src.filter((s) => getKind(s) === "Article"),
    Media: src.filter((s) => getKind(s) === "Media"),
    Blog: src.filter((s) => getKind(s) === "Blog"),
  };
  const items = [...buckets.News, ...buckets.Article, ...buckets.Media, ...buckets.Blog];
  const topKind = (buckets.News.length
    ? "News"
    : buckets.Article.length
    ? "Article"
    : buckets.Media.length
    ? "Media"
    : "Blog") as "News" | "Article" | "Media" | "Blog";

  if (items.length && items.length < minSlides) {
    const clone = [...items];
    while (clone.length < minSlides) clone.push(items[clone.length % items.length]);
    return { items: clone, topKind };
  }
  return { items, topKind };
}

/* ─ component ─ */

export default function HighlightsRail() {
  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/highlights?limit=20", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.ok) {
          const json = await res.json();
          if (alive) setRaw(Array.isArray(json?.items) ? json.items : []);
        } else if (alive) setRaw([]);
      } catch {
        if (alive) setRaw([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const { items } = useMemo(() => buildHighlights(raw ?? [], 10), [raw]);
  const loopItems = useMemo(() => (items.length ? [...items, ...items] : []), [items]);

  // animation speed scales with count (and is clamped)
  const durationSec = Math.max(22, Math.min(70, Math.max(items.length, 10) * 3.5));
  const trackStyle = { ["--duration" as any]: `${durationSec}s` } as React.CSSProperties;

  const Tile = ({ item }: { item: Item }) => {
    const href = getUrl(item);
    const kind = getKind(item);

    const imgAlt = item?.title
      ? `${kind}: ${item.title}`
      : `${kind} highlight from XIPHIAS Immigration`;

    return (
      <Link
        href={href}
        prefetch={false}
        className="group flex w-[270px] sm:w-[310px] md:w-[340px] lg:w-[360px] xl:w-[380px]
                   items-center gap-3 border border-neutral-200 dark:border-neutral-800 rounded-xl
                   bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm hover:shadow
                   transition"
      >
        <span className="relative h-[64px] w-[96px] shrink-0 overflow-hidden">
          <Image
            src={getImg(item)}
            alt={imgAlt}
            fill
            sizes="160px"
            className="object-cover"
            loading="lazy"
            decoding="async"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] leading-none">
            <span className="inline-flex items-center gap-1">
              <i className="h-[8px] w-[2px] bg-neutral-900 dark:bg-neutral-100 block" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{kind}</span>
            </span>
            <time className="text-neutral-500 dark:text-neutral-400">{getDate(item)}</time>
          </div>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-semibold leading-5 text-neutral-900 dark:text-neutral-100">
            {item?.title}
          </h3>
        </div>

        <span className="ml-1 text-[13px] font-bold text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
          →
        </span>
      </Link>
    );
  };

  const Skeleton = () => (
    <div className="flex w-[270px] sm:w-[310px] md:w-[340px] lg:w-[360px] xl:w-[380px] items-center gap-3 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 shadow-sm">
      <div className="h-[64px] w-[96px] animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-[85%] animate-pulse bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );

  return (
    <section className="mt-2 sm:mt-4">
      {/* BOXED panel (no curves/gradient) */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/80 shadow-md px-3 py-2">
        {/* simple header (no pills, no buttons) */}
        <div className="mb-2 flex items-center gap-2">
          <span className="h-3 w-[3px] bg-neutral-900 dark:bg-neutral-100" />
          <h2 className="text-xs font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">
            Highlights
          </h2>
        </div>

        {/* horizontal loop with edge fade (subtle) */}
        <div
          className="relative -mx-1 px-1"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
            maskImage:
              "linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent)",
          }}
        >
          <div className="overflow-hidden">
            <ul role="list" className="marquee-track flex gap-3" style={trackStyle}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <li key={`sk-${i}`}>
                      <Skeleton />
                    </li>
                  ))
                : loopItems.map((it, idx) => (
                    <li key={`hl-${idx}`}>
                      <Tile item={it} />
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes x-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          width: max-content;
          animation: x-scroll var(--duration, 40s) linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
