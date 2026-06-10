"use client";

import Link from "next/link";
import * as React from "react";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
};

export default function ButtonLink({ href, children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className="my-4 inline-flex rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-black text-white no-underline shadow-sm transition hover:bg-blue-800"
    >
      {children}
    </Link>
  );
}
