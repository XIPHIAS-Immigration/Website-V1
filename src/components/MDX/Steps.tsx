"use client";

import * as React from "react";
import clsx from "clsx";

export function Steps({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ol
      className={clsx(
        "relative border-s border-gray-200 dark:border-gray-700 space-y-6",
        className,
      )}
    >
      {children}
    </ol>
  );
}

type StepProps = {
  title: string;
  children?: React.ReactNode;
  number?: number;
};

export function Step({ title, children, number }: StepProps) {
  return (
    <li className="ms-6">
      <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-semibold">
        {typeof number === "number" ? number : "•"}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {children}
        </div>
      )}
    </li>
  );
}
