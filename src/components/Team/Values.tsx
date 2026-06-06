// ==============================================
// components/team/Values.tsx
// ==============================================
import React from "react";

export function Values(){
  const items = [
    { t: "Lightweight by default", d: "We choose simple designs that scale gracefully before adding complexity." },
    { t: "Accessibility-first", d: "Keyboard-friendly, semantic HTML, and colour contrast as a habit." },
    { t: "Measure outcomes", d: "Ship, learn, and iterate with transparent metrics." },
  ];
  return (
    <section aria-labelledby="values-title" className="mt-16">
      <header className="text-center">
        <h2 id="values-title" className="text-2xl md:text-3xl font-semibold tracking-tight">How We Work</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Lightweight processes, high ownership, and customer truth.</p>
      </header>
      <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((x, i) => (
          <li key={i} className="rounded-2xl bg-white/80 p-6 ring-1 ring-blue-100 backdrop-blur dark:bg-white/5 dark:ring-blue-900">
            <h3 className="text-lg font-medium">{x.t}</h3>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{x.d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}