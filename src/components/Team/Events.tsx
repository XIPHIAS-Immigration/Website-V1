// ==============================================
// components/team/Events.tsx
// ==============================================
import React from "react";
import Link from "next/link";
import { EventItem } from "@/components/Team/team";
import { formatDate } from "@/components/Team/formatDate";
import { ArrowRight, ArrowUpRight } from "@/components/Team/Icons";

export function Events({ items }: { items: EventItem[] }) {
  return (
    <section aria-labelledby="events-title" className="mt-16">
      <header className="md:flex items-end justify-between">
        <div>
          <h2 id="events-title" className="text-2xl md:text-3xl font-semibold tracking-tight">Events & Social</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">We share openly—talks, meetups, and behind-the-scenes.</p>
        </div>
        <Link href="https://www.linkedin.com/company/example/posts/" prefetch={false} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm ring-1 ring-blue-200 backdrop-blur hover:bg-blue-50 dark:bg-white/5 dark:ring-blue-800">Follow on LinkedIn <ArrowRight /></Link>
      </header>
      <ul className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((e) => (
          <li key={e.id} className="rounded-2xl bg-white/80 p-6 ring-1 ring-blue-100 backdrop-blur dark:bg-white/5 dark:ring-blue-900">
            <time dateTime={e.date} className="text-xs text-zinc-500">{formatDate(e.date)}</time>
            <h3 className="mt-2 text-lg font-medium leading-tight">{e.title}</h3>
            {e.summary && <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{e.summary}</p>}
            {e.link && <Link href={e.link} prefetch={false} className="mt-3 inline-flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">View details <ArrowUpRight /></Link>}
          </li>
        ))}
      </ul>
    </section>
  );
}
