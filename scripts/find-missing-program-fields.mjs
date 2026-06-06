import fg from "fast-glob";
import matter from "gray-matter";

const files = await fg(["content/**/**/*.mdx"], { dot: false });
const bad = [];
for (const f of files) {
  const { data } = matter.read(f);
  if (data?.kind === "program") {
    const v = String(data.vertical || "");
    const c = String(data.country || "");
    const p = String(data.program || "");
    if (!v || !c || !p) bad.push({ file: f, vertical: v, country: c, program: p, title: data.title });
  }
}
console.log("Bad program files:", bad.length);
console.log(bad);
process.exit(bad.length ? 1 : 0);
