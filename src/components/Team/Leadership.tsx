// ==============================================
// components/team/Leadership.tsx
// ==============================================
import React from "react";
import { Person } from "@/components/Team/team";
import { Avatar } from "@/components/Team/Avatar";
import { SocialLink } from "./_Social";

export function Leadership({ people }: { people: Person[] }) {
  return (
    <section aria-labelledby="leadership-title" className="mt-12">
      <header className="text-center">
        <h2 id="leadership-title" className="text-2xl md:text-3xl font-semibold tracking-tight">Leadership</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Operators with skin in the game.</p>
      </header>
      <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((p) => (
          <li key={p.id} className="group relative overflow-hidden rounded-2xl bg-white/80 ring-1 ring-blue-100 p-6 backdrop-blur dark:bg-white/5 dark:ring-blue-900 transition hover:shadow-sm">
            <div className="flex items-start gap-4">
              <Avatar src={p.headshot} alt={p.name} />
              <div>
                <h3 className="text-lg font-medium leading-tight">{p.name}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">{p.role}</p>
                {p.location && <p className="mt-1 text-xs text-zinc-500">{p.location}</p>}
              </div>
            </div>
            {p.bio && <p className="mt-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{p.bio}</p>}
            {p.socials?.length ? (
              <ul className="mt-4 flex flex-wrap gap-3 text-xs">
                {p.socials.map((s, i) => (<li key={i}><SocialLink s={s} /></li>))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}