import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3010";
const OUT = path.resolve("report-samples/ia");
fs.mkdirSync(OUT, { recursive: true });
const seed = () => {
  try {
    localStorage.setItem("xiphias_cookie_consent_v1", JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false }));
    localStorage.setItem("xiphias_quick_enquiry_dismissed_until", "9999999999999");
  } catch (e) {}
};

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

const d = await browser.newPage();
await d.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await d.evaluateOnNewDocument(seed);
await d.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1000));
await d.screenshot({ path: path.join(OUT, "desktop-header-bar.png"), clip: { x: 0, y: 0, width: 1440, height: 110 } });
// open Tools
await d.evaluate(() => {
  const el = Array.from(document.querySelectorAll("header a, header button")).find((e) => e.textContent && e.textContent.trim() === "Tools");
  if (el) { const r = el.getBoundingClientRect(); const o = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 }; el.dispatchEvent(new MouseEvent("mouseenter", o)); el.dispatchEvent(new MouseEvent("mouseover", o)); el.dispatchEvent(new PointerEvent("pointerenter", o)); }
});
await new Promise((r) => setTimeout(r, 800));
await d.screenshot({ path: path.join(OUT, "desktop-menu-tools.png"), clip: { x: 0, y: 0, width: 1440, height: 620 } });
await d.close();

const m = await browser.newPage();
await m.emulate({ viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) Mobile Safari/537.36" });
await m.evaluateOnNewDocument(seed);
await m.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 900));
await m.evaluate(() => {
  const b = Array.from(document.querySelectorAll("header button")).find((x) => (x.getAttribute("aria-label") || "").toLowerCase().includes("menu"));
  b?.click();
});
await new Promise((r) => setTimeout(r, 700));
await m.screenshot({ path: path.join(OUT, "mobile-drawer-tools.png") });
await m.close();

await browser.close();
console.log("done -> " + OUT);
