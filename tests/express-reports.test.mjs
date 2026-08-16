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
    assert.ok(client.includes(`"${type}"`), `${type} missing from the direct intake`);
  }
  assert.match(suite, /href: ["']\/reports["']/);
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

test("direct intake is one information page and preserves report-specific data", () => {
  const client = read("src/components/ExpressReports/ExpressReportsClient.tsx");
  const catalog = read("src/lib/payments/product-catalog.ts");
  const fulfillment = read("src/lib/payments/fulfillment.ts");
  assert.match(client, /documentsAvailable: form\.documentsAvailable/);
  assert.match(client, /selectedProgrammes: form\.programmes/);
  assert.match(client, /objectives: form\.profileSummary/);
  assert.match(client, /REPORT_DRAFT_KEY/);
  assert.doesNotMatch(client, /intakeSteps/);
  assert.doesNotMatch(client, /Review before payment/);
  assert.match(client, /Next: pay/);
  assert.match(client, /paidIntakeCompleted: selectedType === ["']due_diligence_report["']/);
  assert.match(client, /visaHistory: form\.visaHistory/);
  assert.match(client, /sourceOfFunds: form\.sourceOfFunds/);
  assert.doesNotMatch(client, /age: Number\(form\.age\) \|\| 0/);
  assert.doesNotMatch(catalog, /due_diligence_report:[\s\S]*requiresIntake: true/);
  assert.match(fulfillment, /product\.requiresIntake/);
});

test("direct storefront and registration use catalogue-priced JioPay journeys", () => {
  const store = read("src/lib/payments/report-store.ts");
  const reportsPage = read("src/app/(site)/reports/page.tsx");
  const productPage = read("src/app/(site)/reports/[slug]/page.tsx");
  const registration = read("src/components/Registration/RegistrationCheckout.tsx");
  const provisioning = read("src/app/api/platform/registration/provision/route.ts");
  const paymentReturn = read("src/app/api/payments/jiopay/return/route.ts");
  const fulfillment = read("src/lib/payments/fulfillment.ts");
  const statusRoute = read("src/app/api/payments/jiopay/order-status/route.ts");
  const deepAnalysis = read("src/app/api/platform/reports/deep-analysis/route.ts");

  assert.equal((store.match(/productType: ["']/g) || []).length, 8);
  assert.match(reportsPage, /getPublicReportProducts/);
  assert.match(reportsPage, /express-reports\?report=/);
  assert.doesNotMatch(reportsPage, /See report details/);
  assert.match(productPage, /redirect\(`\/express-reports\?report=/);
  assert.match(registration, /productType: ["']registration["']/);
  assert.match(registration, /deepAnalysisIncluded: true/);
  assert.match(registration, /deferDetailedReport: true/);
  assert.match(provisioning, /answers\.deferDetailedReport === true/);
  assert.match(paymentReturn, /isReportProduct\(initialOrder\?\.productType\)/);
  assert.match(fulfillment, /JIOPAY_AUTO_PROVISION === ["']false["']/);
  assert.match(statusRoute, /verifyOrderStatusGrant/);
  assert.match(statusRoute, /failureEvents\.length < 3/);
  assert.match(deepAnalysis, /registrationPaymentRef/);
  assert.match(deepAnalysis, /generateReportPdf\("deep_analysis"/);
  assert.match(provisioning, /Deep Analysis intake/);
});
