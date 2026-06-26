// Throwaway audit: dumps the price each catalog program currently RESOLVES TO
// via the same parseMoney() logic the tools use (programme-explorer.ts).
import fs from "node:fs";

const src = fs.readFileSync("src/lib/eligibility/programCatalog.ts", "utf8");
// Extract the `export const Programs = { ... }` object literal via brace matching.
const start = src.indexOf("{", src.indexOf("export const Programs"));
let depth = 0, end = -1;
for (let i = start; i < src.length; i++) {
  if (src[i] === "{") depth++;
  else if (src[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
}
const literal = src.slice(start, end + 1);
const Programs = new Function("return (" + literal + ")")();

// Extract CANONICAL_MIN_USD override map too.
let CANON = {};
const cstart = src.indexOf("{", src.indexOf("export const CANONICAL_MIN_USD"));
if (cstart > 0) {
  let d = 0, cend = -1;
  for (let i = cstart; i < src.length; i++) {
    if (src[i] === "{") d++;
    else if (src[i] === "}") { d--; if (d === 0) { cend = i; break; } }
  }
  CANON = new Function("return (" + src.slice(cstart, cend + 1) + ")")();
}

// --- replicate programme-explorer.ts parseMoney + defaults verbatim ---
const DEFAULT_INVESTMENT = { residency: 250000, citizenship: 200000, corporate: 50000, skilled: 0 };
function parseMoney(text, track) {
  const source = String(text).toLowerCase();
  if (track === "skilled" || /\bn\/a\b|not applicable|no investment|points based/.test(source)) return 0;
  const values = [];
  for (const m of source.matchAll(/(?:usd|\$|us\$)\s*([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)?/g)) {
    const base = Number(m[1]); const u = m[2] ?? "";
    values.push(u.startsWith("m") ? base * 1e6 : u === "k" ? base * 1e3 : base);
  }
  for (const m of source.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)\s*(?:usd|dollars|\+)?/g)) {
    const base = Number(m[1]); const u = m[2] ?? "";
    if (base >= 10 || u !== "k") values.push(u.startsWith("m") ? base * 1e6 : base * 1e3);
  }
  for (const m of source.matchAll(/aed\s*([0-9]+(?:\.[0-9]+)?)\s*(m|million|k)?/g)) {
    const base = Number(m[1]); const u = m[2] ?? "";
    const aed = u.startsWith("m") ? base * 1e6 : u === "k" ? base * 1e3 : base;
    values.push(Math.round(aed * 0.272));
  }
  for (const m of source.matchAll(/([0-9]{1,3}(?:,[0-9]{3})+)/g)) {
    const n = Number(m[1].replace(/,/g, "")); if (n >= 10000) values.push(n);
  }
  const realistic = values.filter((v) => v >= 10000 && v <= 10_000_000);
  return realistic.length ? Math.min(...realistic) : DEFAULT_INVESTMENT[track];
}

const fmt = (n) => (n === 0 ? "$0" : "$" + n.toLocaleString());
const newVal = (slug, track, oldResolved) => {
  if (Object.prototype.hasOwnProperty.call(CANON, slug)) {
    return CANON[slug] === null ? "NO FIXED" : fmt(CANON[slug]);
  }
  return fmt(oldResolved);
};

let rows = [];
for (const [track, items] of Object.entries(Programs)) {
  for (const item of items) {
    const raw = Object.values(item).join(" ");
    const resolved = parseMoney(raw, track);
    rows.push({ track, slug: item.slug, name: item.name, old: fmt(resolved), neu: newVal(item.slug, track, resolved) });
  }
}
console.log("TRACK".padEnd(12), "OLD".padStart(12), "→", "NEW".padStart(12), " NAME");
let changed = 0;
for (const r of rows) {
  const diff = r.old !== r.neu;
  if (diff) changed++;
  console.log(r.track.padEnd(12), r.old.padStart(12), diff ? "→" : " ", r.neu.padStart(12), (diff ? " ✅ " : "    ") + r.name);
}
console.log("\nTotal programs:", rows.length, "| corrected by override:", changed);
