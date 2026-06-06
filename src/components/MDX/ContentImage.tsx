"use client";

import Image from "next/image";
import * as React from "react";

type ContentImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  priority?: boolean;
  rounded?: boolean;
};

export default function ContentImage({
  src,
  alt,
  width = 1200,
  height = 675,
  caption,
  priority,
  rounded = true,
}: ContentImageProps) {
  return (
    <figure className="my-6">
      <div className={rounded ? "overflow-hidden rounded-xl" : undefined}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 900px, 100vw"
          className="w-full h-auto object-cover"
          priority={priority}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
