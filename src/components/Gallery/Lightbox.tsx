// src/components/Gallery/Lightbox.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/lib/gallery";
import { formatDateUS } from "@/lib/format";

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
       </svg>`,
    )
  );
}

export default function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const overlayRef = useRef<HTMLDivElement>(null);

  const canPrev = idx > 0;
  const canNext = idx < items.length - 1;
  const it = items[idx];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setIdx((current) => Math.max(0, current - 1));
      }
      if (e.key === "ArrowRight") {
        setIdx((current) => Math.min(items.length - 1, current + 1));
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    overlayRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [items.length, onClose]);

  if (!it) return null;

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 md:p-6"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
    >
      <figure className="relative flex w-full max-w-6xl flex-col items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute right-2 top-2 z-20 rounded-full bg-black/55 px-3 py-2 text-sm text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/70 md:right-4 md:top-4"
        >
          Close
        </button>

        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl">
          <button
            type="button"
            onClick={() => setIdx((current) => Math.max(0, current - 1))}
            disabled={!canPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-sm text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/70 disabled:opacity-30 md:left-4"
          >
            {"<"}
          </button>

          <Image
            src={it.src}
            alt={it.alt || "Gallery image"}
            width={it.w}
            height={it.h}
            sizes="(max-width: 768px) 100vw, 80vw"
            className="h-auto max-h-[72vh] w-auto max-w-full object-contain md:max-h-[78vh]"
            placeholder="blur"
            blurDataURL={it.blurDataURL || shimmer()}
            priority
          />

          <button
            type="button"
            onClick={() =>
              setIdx((current) => Math.min(items.length - 1, current + 1))
            }
            disabled={!canNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/55 px-3 py-2 text-sm text-white ring-1 ring-white/20 backdrop-blur hover:bg-black/70 disabled:opacity-30 md:right-4"
          >
            {">"}
          </button>
        </div>

        <figcaption className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 text-white/90 backdrop-blur">
          <div className="min-w-0">
            {it.caption && (
              <p className="truncate text-sm font-medium">{it.caption}</p>
            )}

            {(it.date || it.category) && (
              <p className="text-xs text-white/70">
                {it.date ? formatDateUS(it.date) : null}
                {it.date ? " - " : ""}
                {String(it.category).charAt(0).toUpperCase() +
                  String(it.category).slice(1)}
              </p>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs ring-1 ring-white/15">
              {idx + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={() => setIdx((current) => Math.max(0, current - 1))}
              disabled={!canPrev}
              aria-label="Previous image"
              className="rounded-full bg-white/10 px-3 py-2 text-sm ring-1 ring-white/20 backdrop-blur hover:bg-white/15 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() =>
                setIdx((current) => Math.min(items.length - 1, current + 1))
              }
              disabled={!canNext}
              aria-label="Next image"
              className="rounded-full bg-white/10 px-3 py-2 text-sm ring-1 ring-white/20 backdrop-blur hover:bg-white/15 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
