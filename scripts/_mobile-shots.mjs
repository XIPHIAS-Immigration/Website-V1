// Clean above-the-fold mobile viewport screenshots (no full-page stitching).
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3010";
const OUT = path.resolve("report-samples/mobile/shots");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["passport-index", "/passport-index"],
  ["xia-intelligence", "/xia-intelligence"],
  ["residency", "/residency"],
  ["residency-portugal", "/residency/portugal"],
  ["cost-estimator", "/cost-estimator"],
  ["program-index", "/xiphias-program-index"],
  ["citizenship", "/citizenship"],
  ["contact", "/contact"],
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
for (const [name, route] of ROUTES) {
  const page = await browser.newPage();
  await page.emulate({
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent:
      "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  });
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem(
        "xiphias_cookie_consent_v1",
        JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false }),
      );
    } catch (e) {}
  });
  try {
    await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    // Above the fold
    await page.screenshot({ path: path.join(OUT, `${name}-1-top.png`) });
    // One viewport down
    await page.evaluate(() => window.scrollTo(0, window.innerHeight));
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT, `${name}-2.png`) });
    // Two viewports down
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: path.join(OUT, `${name}-3.png`) });
    console.log(`ok: ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${String(e).slice(0, 120)}`);
  }
  await page.close();
}
await browser.close();
console.log(`-> ${OUT}`);
