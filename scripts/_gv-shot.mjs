import puppeteer from "puppeteer";
const b = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
await p.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("xiphias_cookie_consent_v1", JSON.stringify({ version: 1, updatedAt: 1, necessary: true, analytics: false, marketing: false, experience: false }));
    localStorage.setItem("xiphias_quick_enquiry_dismissed_until", "9999999999999");
  } catch (e) {}
});
await p.goto("http://localhost:3010/golden-visa", { waitUntil: "networkidle2", timeout: 60000 });
await new Promise((r) => setTimeout(r, 1200));
await p.screenshot({ path: "report-samples/ia/golden-visa.png" });
await b.close();
console.log("ok");
