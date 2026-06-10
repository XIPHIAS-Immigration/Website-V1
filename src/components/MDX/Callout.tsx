"use client";

import * as React from "react";
import clsx from "clsx";

type CalloutProps = {
  title?: string;
  tone?: "info" | "success" | "warning";
  children: React.ReactNode;
};

export default function Callout({ title, tone = "info", children }: CalloutProps) {
  return (
    <aside
      className={clsx(
        "my-6 rounded-xl border p-4 text-sm leading-7",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-950",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-950",
        tone === "info" && "border-blue-200 bg-blue-50 text-blue-950",
      )}
    >
      {title ? <p className="mb-2 text-sm font-black">{title}</p> : null}
      <div className="space-y-2">{children}</div>
    </aside>
  );
}
