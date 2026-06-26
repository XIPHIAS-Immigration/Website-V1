// Identify the LCP element on a page and why it paints late.
import puppeteer from "puppeteer";

const URL = process.argv[2] || "http://localhost:3010/xia-intelligence";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) Mobile Safari/537.36",
});
const client = await page.target().createCDPSession();
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await page.evaluateOnNewDocument(() => {
  window.__lcp = null;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lcp = { time: e.startTime, size: e.size, el: e.element };
  }).observe({ type: "largest-contentful-paint", buffered: true });
});
await page.goto(URL, { waitUntil: "load", timeout: 90000 });
await new Promise((r) => setTimeout(r, 4500));

const info = await page.evaluate(() => {
  const lcp = window.__lcp;
  if (!lcp || !lcp.el) return { none: true };
  const el = lcp.el;
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  // Walk ancestors for opacity/transform animation sources
  const chain = [];
  let n = el;
  for (let i = 0; i < 8 && n; i++) {
    const s = getComputedStyle(n);
    chain.push({
      tag: n.tagName + (n.className && typeof n.className === "string" ? "." + n.className.split(" ").slice(0, 3).join(".") : ""),
      opacity: s.opacity,
      transform: s.transform === "none" ? "none" : "set",
      transition: s.transitionProperty,
    });
    n = n.parentElement;
  }
  return {
    time: Math.round(lcp.time),
    size: Math.round(lcp.size),
    tag: el.tagName,
    cls: typeof el.className === "string" ? el.className : "",
    text: (el.textContent || "").trim().slice(0, 90),
    rect: { w: Math.round(rect.width), h: Math.round(rect.height), top: Math.round(rect.top) },
    opacity: cs.opacity,
    chain,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
