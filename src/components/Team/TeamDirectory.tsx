// ==============================================
// components/team/TeamDirectory.tsx – search + tag filter
// ==============================================
"use client";
import React, { useMemo, useState } from "react";
import { Person } from "@/components/Team/team";
import { Avatar } from "@/components/Team/Avatar";
import { SocialIcon } from "./_Social";
import { SearchIcon } from "@/components/Team/Icons";

export function TeamDirectory({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string | "all">("all");

  const allTags = useMemo(() => {
    const t = new Set<string>();
    people.forEach((p) => p.tags?.forEach((x) => t.add(x)));
    return Array.from(t).sort();
  }, [people]);

  const filtered = useMemo(() => {
    const hay = (p: Person) => `${p.name} ${p.role} ${(p.tags || []).join(" ")}`.toLowerCase();
    return people.filter((p) => {
      const byText = hay(p).includes(q.toLowerCase());
      const byTag = tag === "all" ? true : p.tags?.includes(tag);
      return byText && byTag;
    });
  }, [people, q, tag]);

  return (
    <section aria-labelledby="team-title" className="mt-12">
      <header className="md:flex items-end justify-between md:space-x-6">
        <div>
          <h2 id="team-title" className="text-2xl md:text-3xl font-semibold tracking-tight">Team</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">Search by name, role, or tag. Lightweight and fast.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <label className="flex items-center gap-2 rounded-xl ring-1 ring-blue-200 bg-white/70 px-3 py-2 text-sm backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <SearchIcon className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search team…" className="bg-transparent outline-none placeholder:text-zinc-400" aria-label="Search team" />
          </label>
          <select value={tag} onChange={(e) => setTag(e.target.value as any)} aria-label="Filter by tag" className="rounded-xl ring-1 ring-blue-200 bg-white/70 px-3 py-2 text-sm backdrop-blur dark:bg-white/5 dark:ring-blue-800">
            <option value="all">All disciplines</option>
            {allTags.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </header>

      <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((p) => (
          <li key={p.id} className="rounded-2xl bg-white/80 ring-1 ring-blue-100 p-4 backdrop-blur dark:bg-white/5 dark:ring-blue-900 transition hover:shadow-sm">
            <Avatar src={p.headshot} alt={p.name} size="lg" />
            <h3 className="mt-3 text-sm font-medium leading-tight">{p.name}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">{p.role}</p>
            {p.tags?.length ? (
              <ul className="mt-2 flex flex-wrap gap-1">
                {p.tags.map((t) => (<li key={t} className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] ring-1 ring-blue-100 dark:bg-white/5 dark:ring-blue-900">{t}</li>))}
              </ul>
            ) : null}
            {p.socials?.length ? (
              <ul className="mt-3 flex gap-2">
                {p.socials.map((s, i) => (<li key={i}><SocialIcon s={s} /></li>))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
