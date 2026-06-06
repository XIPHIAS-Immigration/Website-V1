// src/components/Gallery/GalleryGrid.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { GalleryItem } from "@/lib/gallery";
import { formatDateUS } from "@/lib/format";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

function shimmer() {
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='32' height='20'>
         <defs><linearGradient id='g'>
          <stop stop-color='#f3f4f6' offset='20%'/><stop stop-color='#e5e7eb' offset='50%'/><stop stop-color='#f3f4f6' offset='80%'/></linearGradient></defs>
         <rect width='100%' height='100%' fill='#f3f4f6'/>
         <rect width='100%' height='100%' fill='url(#g)'>
           <animate attributeName='x' from='-100%' to='100%' dur='1.2s' repeatCount='indefinite'/>
         </rect>
       </svg>`
    )
  );
}

type Filter = "all" | string;

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(24);
  const [lightbox, setLightbox] = useState<{ list: GalleryItem[]; index: number } | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(["all"]);
    items.forEach((i) => set.add(String(i.category)));
    return Array.from(set);
  }, [items]);

  const allForFilter = useMemo(
    () => (filter === "all" ? items : items.filter((i) => String(i.category) === filter)),
    [items, filter]
  );

  const rendered = useMemo(() => allForFilter.slice(0, visible), [allForFilter, visible]);
  const totalForFilter = allForFilter.length;

  useEffect(() => setVisible(24), [filter]);

  return (
    <>
      {/* Filter pills (mobile sticky) */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 bg-white/80 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/50 md:-mx-6 md:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={[
                "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                filter === c
                  ? "bg-blue-600 text-white ring-blue-700"
                  : "bg-white/80 text-slate-700 ring-blue-200 hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:ring-blue-800/60",
              ].join(" ")}
              aria-pressed={filter === c}
            >
              {c === "all" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
          <span className="ml-auto shrink-0 self-center text-[11px] text-slate-500 dark:text-slate-400">
            {totalForFilter} photos
          </span>
        </div>
      </div>

      {/* Masonry via CSS columns (no heavy libs) */}
      <ul role="list" className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 [column-gap:0.75rem]">
        {rendered.map((it, i) => (
          <li key={it.id} className="mb-3 break-inside-avoid">
            <figure className="group overflow-hidden rounded-xl border border-blue-100/70 bg-white/85 ring-1 ring-black/5 transition hover:scale-[1.005] dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
              <button
                type="button"
                onClick={() => setLightbox({ list: allForFilter, index: allForFilter.findIndex((x) => x.id === it.id) })}
                className="relative block w-full"
                aria-label={`Open ${it.alt || "photo"} in lightbox`}
              >
                <div className="relative w-full" style={{ aspectRatio: `${it.w}/${it.h}` }}>
                  <Image
                    src={it.src}
                    alt={it.alt || "Gallery image"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    placeholder="blur"
                    blurDataURL={it.blurDataURL || shimmer()}
                    loading={i < 2 ? "eager" : "lazy"}
                    priority={i < 1}
                  />
                </div>
              </button>

              {(it.caption || it.date || it.category) && (
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    {it.caption && (
                      <p className="truncate text-[12px] font-medium text-slate-800 dark:text-slate-100">
                        {it.caption}
                      </p>
                    )}

                    {/* ✅ Deterministic date format: US style, UTC */}
                    {it.date && (
                      <time className="block text-[11px] text-slate-500 dark:text-slate-400">
                        {formatDateUS(it.date)}
                      </time>
                    )}
                  </div>

                  <span className="inline-flex items-center rounded-full bg-white/80 px-2 py-[3px] text-[10px] ring-1 ring-blue-200 dark:bg-white/5 dark:ring-blue-800/60">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {String(it.category).charAt(0).toUpperCase() + String(it.category).slice(1)}
                    </span>
                  </span>
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>

      {/* Load more */}
      {totalForFilter > rendered.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + 24)}
            className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium ring-1 ring-blue-200 hover:bg-white dark:bg-white/5 dark:text-white dark:ring-blue-800/60"
          >
            Load more
          </button>
        </div>
      )}

      {/* Lightbox (lazy-loaded via dynamic import) */}
      {lightbox && (
        <Lightbox
          items={lightbox.list}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
