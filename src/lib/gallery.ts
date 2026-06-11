// src/lib/gallery.ts
export type GalleryCategory =
  | "events"
  | "team"
  | "office"
  | "awards"
  | "csr"
  | "press"
  | "other";

export type GalleryItem = {
  id: string;
  src: string;          // "/images/gallery/..." (public) OR "https://cdn/..."
  alt?: string;
  w: number;            // intrinsic width (improves CLS, lightbox)
  h: number;            // intrinsic height
  category: GalleryCategory | string;
  caption?: string;
  date?: string;        // "YYYY-MM-DD"
  blurDataURL?: string; // optional LQIP; can be a tiny base64 or SVG data URL
};

type GallerySource = {
  file: string;
  w: number;
  h: number;
};

const GALLERY_FILES: GallerySource[] = [
  { file: "xiphias-immigration-gallery-01.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-02.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-03.jpeg", w: 1280, h: 853 },
  { file: "xiphias-immigration-gallery-04.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-05.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-06.jpeg", w: 961, h: 1280 },
  { file: "xiphias-immigration-gallery-07.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-08.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-09.jpeg", w: 1280, h: 853 },
  { file: "xiphias-immigration-gallery-10.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-11.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-12.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-13.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-14.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-15.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-16.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-17.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-18.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-19.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-20.jpeg", w: 853, h: 1280 },
  { file: "xiphias-immigration-gallery-21.jpeg", w: 960, h: 1280 },
  { file: "xiphias-immigration-gallery-22.jpeg", w: 853, h: 1280 },
  { file: "xiphias-immigration-gallery-23.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-24.jpeg", w: 1280, h: 853 },
  { file: "xiphias-immigration-gallery-25.jpeg", w: 1280, h: 960 },
  { file: "xiphias-immigration-gallery-26.jpg", w: 2048, h: 1365 },
  { file: "xiphias-immigration-gallery-27.jpg", w: 2048, h: 1371 },
  { file: "xiphias-immigration-gallery-28.jpg", w: 2048, h: 1371 },
  { file: "xiphias-immigration-gallery-29.jpg", w: 2048, h: 1365 },
  { file: "xiphias-immigration-gallery-30.jpg", w: 960, h: 720 },
  { file: "xiphias-immigration-gallery-31.jpg", w: 243, h: 174 },
  { file: "xiphias-immigration-gallery-32.webp", w: 385, h: 510 },
  { file: "xiphias-immigration-gallery-33.webp", w: 340, h: 510 },
  { file: "xiphias-immigration-gallery-34.jpg", w: 243, h: 203 },
  { file: "xiphias-immigration-gallery-35.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-36.jpg", w: 2048, h: 1365 },
  { file: "xiphias-immigration-gallery-37.jpg", w: 2048, h: 1365 },
  { file: "xiphias-immigration-gallery-38.jpg", w: 960, h: 643 },
  { file: "xiphias-immigration-gallery-39.jpg", w: 960, h: 643 },
  { file: "xiphias-immigration-gallery-40.jpg", w: 960, h: 643 },
  { file: "xiphias-immigration-gallery-41.jpg", w: 2048, h: 1371 },
  { file: "xiphias-immigration-gallery-42.jpg", w: 960, h: 638 },
  { file: "xiphias-immigration-gallery-43.jpg", w: 2048, h: 1206 },
  { file: "xiphias-immigration-gallery-44.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-45.webp", w: 340, h: 510 },
  { file: "xiphias-immigration-gallery-46.webp", w: 680, h: 453 },
  { file: "xiphias-immigration-gallery-47.webp", w: 680, h: 382 },
  { file: "xiphias-immigration-gallery-48.webp", w: 382, h: 510 },
  { file: "xiphias-immigration-gallery-49.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-50.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-51.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-52.jpeg", w: 243, h: 304 },
  { file: "xiphias-immigration-gallery-53.webp", w: 382, h: 510 },
  { file: "xiphias-immigration-gallery-54.webp", w: 315, h: 510 },
  { file: "xiphias-immigration-gallery-55.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-56.webp", w: 680, h: 453 },
  { file: "xiphias-immigration-gallery-57.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-58.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-59.webp", w: 510, h: 510 },
  { file: "xiphias-immigration-gallery-60.webp", w: 382, h: 510 },
  { file: "xiphias-immigration-gallery-61.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-62.webp", w: 382, h: 510 },
  { file: "xiphias-immigration-gallery-63.webp", w: 382, h: 510 },
  { file: "xiphias-immigration-gallery-64.webp", w: 680, h: 510 },
  { file: "xiphias-immigration-gallery-65.jpg", w: 243, h: 203 },
  { file: "xiphias-immigration-gallery-66.webp", w: 510, h: 510 },
  { file: "xiphias-immigration-gallery-67.jpeg", w: 2400, h: 3600 },
  { file: "xiphias-immigration-gallery-68.jpeg", w: 3943, h: 5400 },
  { file: "xiphias-immigration-gallery-69.jpeg", w: 6000, h: 4000 },
  { file: "xiphias-immigration-gallery-70.jpeg", w: 5785, h: 3857 },
  { file: "xiphias-immigration-gallery-71.jpeg", w: 1600, h: 1066 },
];

function toGalleryItem(
  source: GallerySource,
  index: number,
): GalleryItem {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");

  return {
    id: `gallery-event-${padded}`,
    src: `/images/gallery/${source.file}`,
    alt: `XIPHIAS Immigration event photo ${padded} from the company gallery`,
    w: source.w,
    h: source.h,
    category: "events",
    caption: `XIPHIAS Immigration gallery photo ${padded}`,
  };
}

const GALLERY: GalleryItem[] = GALLERY_FILES.map(toGalleryItem);

export async function getGallery(): Promise<GalleryItem[]> {
  // Swap for CMS fetch later (Sanity/Strapi/Contentful/etc.) if needed.
  // Accurate width/height keeps layout stable and Lighthouse-friendly.
  return GALLERY;
}
