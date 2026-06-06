import { AnyDoc } from "./types";
import { getAllContentCached } from "./index";

export function getRelated(current: AnyDoc, limit = 6) {
  const all = getAllContentCached().filter((d) => d.url !== current.url);
  const tags = new Set((current as any).tags ?? []);
  const verts = new Set(
    current.kind === "program" ? [current.vertical] : (current.verticals ?? []),
  );
  const countries = new Set(
    current.kind === "program" ? [current.country] : (current.countries ?? []),
  );
  const programs = new Set(
    current.kind === "program" ? [current.program] : (current.programs ?? []),
  );

  const score = (d: AnyDoc) => {
    let s = 0;
    const dt = (d as any).tags ?? [];
    for (const t of dt) if (tags.has(t)) s += 2;
    const dv = d.kind === "program" ? [d.vertical] : (d.verticals ?? []);
    for (const v of dv) if (verts.has(v)) s += 1.5;
    const dc = d.kind === "program" ? [d.country] : (d.countries ?? []);
    for (const c of dc) if (countries.has(c)) s += 1.5;
    const dp = d.kind === "program" ? [d.program] : (d.programs ?? []);
    for (const p of dp) if (programs.has(p)) s += 2.5;
    return s;
  };

  return all
    .map((d) => [d, score(d)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([d]) => d);
}
