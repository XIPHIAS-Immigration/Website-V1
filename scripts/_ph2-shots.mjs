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
    // Suppress engagement popups for clean screenshots
    localStorage.setItem("xiphias_quick_enquiry_dismissed_until", "9999999999999");
    sessionStorage.setItem("xiphias_quick_enquiry_shown_session", "1");
  } catch (e) {}
};

async function scrollToText(page, text) {
  return page.evaluate((t) => {
    const els = Array.from(document.querySelectorAll("h2, h1"));
    const el = els.find((e) => e.textContent && e.textContent.toLowerCase().includes(t.toLowerCase()));
    if (el) { el.scrollIntoView({ block: "start" }); return true; }
    return false;
  }, text);
}

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });

for (const [tag, vp, ua] of [
  ["desktop", { width: 1440, height: 900, deviceScaleFactor: 1 }, null],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, "Mozilla/5.0 (Linux; Android 12; Pixel 6) Mobile Safari/537.36"],
]) {
  const page = await browser.newPage();
  if (ua) await page.emulate({ viewport: vp, userAgent: ua });
  else await page.setViewport(vp);
  await page.evaluateOnNewDocument(seedConsent);

  await page.goto(BASE + "/", { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT, `${tag}-home-hero.png`) });

  for (const [name, text] of [["programmes", "Choose your pathway"], ["countries", "start with a destination"]]) {
    const found = await scrollToText(page, text);
    await new Promise((r) => setTimeout(r, 1800));
    await page.screenshot({ path: path.join(OUT, `${tag}-home-${name}.png`) });
    console.log(`${tag} ${name}: found=${found}`);
  }
  await page.close();
}

// Confirm flag images render on country pages
const d = await browser.newPage();
await d.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await d.evaluateOnNewDocument(seedConsent);
for (const [name, url] of [["countries-index", "/countries"], ["country-portugal", "/countries/portugal"]]) {
  await d.goto(BASE + url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1000));
  await d.screenshot({ path: path.join(OUT, `flags-${name}.png`) });
}
await d.close();

await browser.close();
console.log("-> " + OUT);
