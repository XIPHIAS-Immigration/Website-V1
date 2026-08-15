import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("express report store exposes every fixed-price report without removing XIA", () => {
  const page = read("src/app/(site)/express-reports/page.tsx");
  const client = read("src/components/ExpressReports/ExpressReportsClient.tsx");
  const suite = read("src/components/XiaIntelligence/XiaSuiteGatewayClient.tsx");
  for (const type of [
    "premium_report",
    "route_report",
    "deep_analysis_report",
    "us_visa_report",
    "cost_report",
    "compare_report",
    "docs_report",
    "due_diligence_report",
  ]) {
    assert.match(page, new RegExp(`productType: [\"']${type}[\"']`));
    assert.match(client, new RegExp(`${type}:`));
  }
  assert.match(suite, /href: ["']\/express-reports["']/);
  assert.match(suite, /href: ["']\/route-intelligence["']/);
  assert.match(suite, /href: ["']\/deep-analysis["']/);
});

test("existing tools route purchases into the correct report products", () => {
  const cost = read("src/components/CostEstimator/CostEstimatorClient.tsx");
  const compare = read("src/components/ProgramComparison/ProgramComparisonClient.tsx");
  assert.match(cost, /productType: ["']cost_report["']/);
  assert.doesNotMatch(cost, /productType: ["']premium_report["']/);
  assert.match(compare, /report=compare_report/);
  assert.match(compare, /selected\.map\(\(item\) => item\.title\)/);
});

test("direct intake preserves report-specific data and due diligence remains gated by verified payment", () => {
  const client = read("src/components/ExpressReports/ExpressReportsClient.tsx");
  const catalog = read("src/lib/payments/product-catalog.ts");
  const fulfillment = read("src/lib/payments/fulfillment.ts");
  assert.match(client, /documentsAvailable: form\.documentsAvailable/);
  assert.match(client, /selectedProgrammes: form\.programmes/);
  assert.match(client, /objectives: form\.profileSummary/);
  assert.match(catalog, /due_diligence_report:[\s\S]*requiresIntake: true/);
  assert.match(fulfillment, /product\.requiresIntake/);
  assert.match(fulfillment, /due-diligence-intelligence\/paid/);
});
