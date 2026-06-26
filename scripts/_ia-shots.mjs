import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3010";
const OUT = path.resolve("report-samples/ia");
fs.mkdirSync(OUT, { recursive: true });

const seedConsent = () => {
  try {
    localStorage.setItem(
      "xiphias_cookie_consent_v1",
      JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false }),
    );
  } catch (e) {}
};

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

// ---- Desktop ----
const d = await browser.newPage();
await d.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await d.evaluateOnNewDocument(seedConsent);

async function shoot(page, name, clip) {
  await page.screenshot({ path: path.join(OUT, name), ...(clip ? { clip } : {}) });
  console.log("shot:", name);
}

await d.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
await shoot(d, "desktop-home-header.png", { x: 0, y: 0, width: 1440, height: 120 });

// Open a top-level dropdown by hovering its label
async function openMenu(page, label) {
  const opened = await page.evaluate((lbl) => {
    const els = Array.from(document.querySelectorAll("header a, header button"));
    const el = els.find((e) => e.textContent && e.textContent.trim() === lbl);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const opts = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 };
    el.dispatchEvent(new MouseEvent("mouseenter", opts));
    el.dispatchEvent(new MouseEvent("mouseover", opts));
    el.dispatchEvent(new PointerEvent("pointerenter", opts));
    return true;
  }, label);
  await new Promise((r) => setTimeout(r, 600));
  return opened;
}

for (const label of ["Programs", "Countries", "Solutions"]) {
  await d.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));
  const ok = await openMenu(d, label);
  await new Promise((r) => setTimeout(r, 700));
  await shoot(d, `desktop-menu-${label.toLowerCase()}.png`, { x: 0, y: 0, width: 1440, height: 760 });
  console.log(`  ${label} hover dispatched: ${ok}`);
}

for (const [name, url] of [
  ["desktop-countries.png", "/countries"],
  ["desktop-country-portugal.png", "/countries/portugal"],
  ["desktop-for-investors.png", "/for-investors"],
]) {
  await d.goto(BASE + url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));
  await shoot(d, name);
}
await d.close();

// ---- Mobile ----
const m = await browser.newPage();
await m.emulate({
  viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 6) Mobile Safari/537.36",
});
await m.evaluateOnNewDocument(seedConsent);
await m.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1000));
await shoot(m, "mobile-home-header.png");
// open hamburger
await m.evaluate(() => {
  const b = Array.from(document.querySelectorAll("header button")).find((x) =>
    (x.getAttribute("aria-label") || "").toLowerCase().includes("menu"),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 800));
await shoot(m, "mobile-drawer.png");
await m.close();

await browser.close();
console.log("-> " + OUT);
