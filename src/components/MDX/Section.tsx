"use client";

import * as React from "react";
import clsx from "clsx";

type SectionProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

export default function Section({
  id,
  title,
  subtitle,
  children,
  className,
  padded = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "w-full",
        padded && "py-6 sm:py-8",
        "text-gray-900 dark:text-gray-100",
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="mb-4 sm:mb-6">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className="prose dark:prose-invert max-w-none">{children}</div>
    </section>
  );
}
