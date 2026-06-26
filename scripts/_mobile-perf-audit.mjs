// Mobile + 4x-CPU performance audit harness.
//
// Usage:
//   node scripts/_mobile-perf-audit.mjs [baseUrl] [cpuRate]
//   BASE=http://localhost:3010 CPU=4 node scripts/_mobile-perf-audit.mjs
//
// Emulates a mid-range phone (390x844, DPR 2.625, touch, mobile UA) with CPU
// throttling, loads each route, and reports FCP/LCP, Total Blocking Time (from
// long tasks), CLS, JS heap, horizontal-overflow (layout bug), and post-load
// idle long-task time (catches always-on render loops like the WebGL globe).
// Full-page screenshots are written to report-samples/mobile/.

import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] || process.env.BASE || "http://localhost:3010";
const CPU = Number(process.argv[3] || process.env.CPU || 4);
const OUT = path.resolve("report-samples/mobile");
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["passport-index", "/passport-index"],
  ["xia-intelligence", "/xia-intelligence"],
  ["residency", "/residency"],
  ["residency-portugal", "/residency/portugal"],
  ["cost-estimator", "/cost-estimator"],
  ["program-index", "/xiphias-program-index"],
];

const INSTRUMENT = `
  window.__perf = { lcp: 0, lcpEl: '', cls: 0, longtasks: [], longtasksAfterLoad: [] };
  window.__loaded = false;
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__perf.lcp = e.startTime;
        const el = e.element;
        window.__perf.lcpEl = el
          ? (el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').slice(0, 2).join('.') : '')).slice(0, 80)
          : '';
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        window.__perf.longtasks.push(e.duration);
        if (window.__loaded) window.__perf.longtasksAfterLoad.push(e.duration);
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch (e) {}
`;

const tbt = (tasks) => tasks.reduce((s, d) => s + Math.max(0, d - 50), 0);
const r1 = (n) => Math.round(n);

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const results = [];

  for (const [name, route] of ROUTES) {
    const page = await browser.newPage();
    await page.emulate({
      viewport: { width: 390, height: 844, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true },
      userAgent:
        "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    });
    const client = await page.target().createCDPSession();
    await client.send("Emulation.setCPUThrottlingRate", { rate: CPU });
    // Pre-seed cookie consent so we measure real page content, not the
    // consent modal (which would otherwise be the LCP for first-time visitors).
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem(
          "xiphias_cookie_consent_v1",
          JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false }),
        );
      } catch (e) {}
    });
    await page.evaluateOnNewDocument(INSTRUMENT);

    const url = BASE + route;
    let nav = {};
    try {
      const t0 = Date.now();
      await page.goto(url, { waitUntil: "load", timeout: 90000 });
      nav.loadMs = Date.now() - t0;
      await page.evaluate(() => (window.__loaded = true));
      // Sit idle to capture continuous render-loop work (globe etc).
      await new Promise((res) => setTimeout(res, 4000));

      const metrics = await page.evaluate(() => {
        const paint = performance.getEntriesByType("paint");
        const fcp = paint.find((p) => p.name === "first-contentful-paint");
        const nav = performance.getEntriesByType("navigation")[0] || {};
        return {
          fcp: fcp ? fcp.startTime : 0,
          ttfb: nav.responseStart || 0,
          dcl: nav.domContentLoadedEventEnd || 0,
          lcp: window.__perf.lcp,
          lcpEl: window.__perf.lcpEl,
          cls: window.__perf.cls,
          longtasks: window.__perf.longtasks.slice(),
          longtasksAfterLoad: window.__perf.longtasksAfterLoad.slice(),
          scrollW: document.documentElement.scrollWidth,
          innerW: window.innerWidth,
          canvases: document.querySelectorAll("canvas").length,
          heapMB: performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0,
        };
      });

      // Scroll through the page to trigger lazy sections + measure scroll jank.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 250));
        }
        window.scrollTo(0, 0);
      });
      const afterScroll = await page.evaluate(() => ({
        longtasks: window.__perf.longtasks.slice(),
        cls: window.__perf.cls,
      }));

      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true }).catch(() => {});

      results.push({
        name,
        route,
        ok: true,
        loadMs: nav.loadMs,
        fcp: r1(metrics.fcp),
        lcp: r1(metrics.lcp),
        ttfb: r1(metrics.ttfb),
        cls: Number(afterScroll.cls.toFixed(3)),
        tbt: r1(tbt(metrics.longtasks)),
        idleBlockMs: r1(metrics.longtasksAfterLoad.reduce((s, d) => s + d, 0)),
        idleTaskCount: metrics.longtasksAfterLoad.length,
        scrollTbt: r1(tbt(afterScroll.longtasks) - tbt(metrics.longtasks)),
        overflowPx: Math.max(0, metrics.scrollW - metrics.innerW),
        canvases: metrics.canvases,
        heapMB: r1(metrics.heapMB),
        lcpEl: metrics.lcpEl,
      });
    } catch (e) {
      results.push({ name, route, ok: false, error: String(e).slice(0, 160) });
    }
    await page.close();
  }

  await browser.close();

  console.log(`\n=== Mobile perf audit @ ${CPU}x CPU — ${BASE} ===`);
  console.log(
    [
      "route".padEnd(20),
      "load".padStart(6),
      "fcp".padStart(6),
      "lcp".padStart(7),
      "tbt".padStart(6),
      "idle".padStart(7),
      "idleN".padStart(6),
      "scrl".padStart(6),
      "cls".padStart(6),
      "ovfl".padStart(5),
      "cnv".padStart(4),
      "heap".padStart(5),
    ].join(" "),
  );
  for (const r of results) {
    if (!r.ok) {
      console.log(`${r.name.padEnd(20)} FAILED: ${r.error}`);
      continue;
    }
    console.log(
      [
        r.name.padEnd(20),
        `${r.loadMs}`.padStart(6),
        `${r.fcp}`.padStart(6),
        `${r.lcp}`.padStart(7),
        `${r.tbt}`.padStart(6),
        `${r.idleBlockMs}`.padStart(7),
        `${r.idleTaskCount}`.padStart(6),
        `${r.scrollTbt}`.padStart(6),
        `${r.cls}`.padStart(6),
        `${r.overflowPx}`.padStart(5),
        `${r.canvases}`.padStart(4),
        `${r.heapMB}`.padStart(5),
      ].join(" "),
    );
  }
  console.log(
    "\nlegend: all ms. tbt=total blocking time (load). idle=blocking ms in 4s AFTER load (render loops). idleN=#long tasks idle. scrl=blocking ms during scroll. ovfl=horizontal overflow px (>0 = mobile layout bug). cnv=#canvas. heap=JS heap MB.",
  );
  console.log("\nLCP element per route:");
  for (const r of results) if (r.ok) console.log(`  ${r.name.padEnd(20)} ${r.lcp}ms  ${r.lcpEl || "(none)"}`);
  fs.writeFileSync(path.join(OUT, "_results.json"), JSON.stringify(results, null, 2));
  console.log(`\nScreenshots + _results.json -> ${OUT}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
