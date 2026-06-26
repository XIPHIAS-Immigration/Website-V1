import puppeteer from "puppeteer";

const BASE = process.argv[2] || "http://localhost:3010";
const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
const p = await b.newPage();
await p.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
});
await p.evaluateOnNewDocument(() => {
  try { localStorage.setItem("xiphias_cookie_consent_v1", JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false })); } catch {}
});
await p.goto(BASE + "/", { waitUntil: "load" });
// scroll through to mount every DeferOnView section
await p.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
});
await new Promise((r) => setTimeout(r, 600));
const rows = await p.evaluate(() => {
  const main = document.querySelector("main") || document.body;
  return Array.from(main.children).map((c) => ({
    tag: c.tagName,
    cls: (typeof c.className === "string" ? c.className : "").slice(0, 50),
    h: Math.round(c.getBoundingClientRect().height),
  }));
});
console.log(JSON.stringify(rows, null, 2));
await b.close();
