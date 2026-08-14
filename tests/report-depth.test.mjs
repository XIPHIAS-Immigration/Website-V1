import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypescriptModule(path) {
  const source = fs.readFileSync(path, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", "process", javascript)(module.exports, require, module, process);
  return module.exports;
}

const previousTestPricing = process.env.REPORTS_TEST_PRICING;
delete process.env.REPORTS_TEST_PRICING;
const { PRODUCT_CATALOG } = loadTypescriptModule("src/lib/payments/product-catalog.ts");
if (previousTestPricing == null) delete process.env.REPORTS_TEST_PRICING;
else process.env.REPORTS_TEST_PRICING = previousTestPricing;
const { REPORT_DEPTH, allocateReportImages } = loadTypescriptModule("src/lib/reports/templates/report-depth.ts");

const PRODUCTS = {
  premium_strategy: "premium_report",
  us_visa: "us_visa_report",
  deep_analysis: "deep_analysis_report",
  route: "route_report",
  cost: "cost_report",
  compare: "compare_report",
  docs: "docs_report",
  due_diligence: "due_diligence_report",
};

const EXPECTED_PRICES = {
  premium_report: 1000,
  us_visa_report: 1000,
  deep_analysis_report: 499,
  route_report: 499,
  cost_report: 499,
  compare_report: 499,
  docs_report: 499,
  due_diligence_report: 499,
  registration: 1000,
};

test("fixed product prices match the approved catalogue", () => {
  for (const [productType, expectedPrice] of Object.entries(EXPECTED_PRICES)) {
    assert.equal(PRODUCT_CATALOG[productType].priceInr, expectedPrice, `${productType} price drifted`);
  }
});

test("paid due diligence waits for the expanded intake", () => {
  assert.equal(PRODUCT_CATALOG.due_diligence_report.reportKind, "due_diligence");
  assert.equal(PRODUCT_CATALOG.due_diligence_report.requiresIntake, true);
});

test("report depth prices match the payment catalogue", () => {
  for (const [kind, productType] of Object.entries(PRODUCTS)) {
    assert.equal(REPORT_DEPTH[kind].priceInr, PRODUCT_CATALOG[productType].priceInr, `${kind} price drifted`);
  }
});

test("lower-priced tiers never receive a larger page target", () => {
  const contracts = Object.values(REPORT_DEPTH).sort((a, b) => b.priceInr - a.priceInr);
  for (let i = 1; i < contracts.length; i += 1) {
    const higher = contracts[i - 1];
    const lower = contracts[i];
    if (higher.priceInr === lower.priceInr) continue;
    assert.ok(higher.targetPages[0] >= lower.targetPages[0]);
    assert.ok(higher.targetPages[1] >= lower.targetPages[1]);
  }
});

test("entry tiers do not inherit premium programme dossiers", () => {
  for (const kind of ["cost", "compare", "docs"]) {
    assert.deepEqual(REPORT_DEPTH[kind].primaryDossierSections, []);
    assert.equal(REPORT_DEPTH[kind].maxNarrativeSections, 0);
  }
});

test("report kinds receive stable, distinct country image rotations", () => {
  const images = Array.from({ length: 9 }, (_, index) => `country-image-${index}`);
  const kinds = Object.keys(PRODUCTS);
  const firstImages = kinds.map((kind) => allocateReportImages(images, kind, "ORDER-1001")[0]);
  assert.equal(new Set(firstImages).size, kinds.length);
  assert.deepEqual(
    allocateReportImages(images, "route", "ORDER-1001"),
    allocateReportImages(images, "route", "ORDER-1001"),
  );
});
