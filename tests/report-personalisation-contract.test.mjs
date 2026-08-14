import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("all eight paid templates are routed through the modern report router", () => {
  const router = read("src/lib/payments/report-router.ts");
  for (const kind of ["premium_strategy", "route", "deep_analysis", "us_visa", "cost", "compare", "docs", "due_diligence"]) {
    assert.match(router, new RegExp(`case ["']${kind}["']`));
  }
  const api = read("src/app/api/platform/admin/reports/route.ts");
  assert.match(api, /generateReportPdf\(config\.reportKind, order\)/);
  assert.doesNotMatch(api, /generatePremiumReportPdf/);
});

test("due-diligence report uses the paid intake and preserves its verification boundary", () => {
  const source = read("src/lib/reports/templates/due-diligence.ts");
  assert.match(source, /paidInputFromAnswers/);
  assert.match(source, /analysePaidDueDiligence/);
  assert.match(source, /No passport, biometric, document-authenticity/);
  assert.match(source, /buildCompanyProfilePages/);
  assert.match(source, /input\.cpaAssessment/);
  assert.match(source, /input\.assessingBody/);
});

test("templates with readiness claims use the shared verified case model", () => {
  for (const name of ["premium-strategy", "route", "deep-analysis", "us-visa", "cost", "compare", "docs"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.match(source, /buildClientCase/);
  }
});

test("all paid templates inherit dynamic CPA and assessing-body content", () => {
  const components = read("src/lib/reports/components.ts");
  assert.match(components, /CPA and assessing body/);
  assert.match(components, /basis\.cpa/);
  assert.match(components, /basis\.assessingBody/);

  for (const name of ["premium-strategy", "route", "deep-analysis", "us-visa", "cost", "compare", "docs"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.match(source, /reportBasisPage/);
  }
});

test("all eight paid templates place supplied occupation and ANZSCO context on the cover", () => {
  const components = read("src/lib/reports/components.ts");
  assert.match(components, /opts\.profileLine/);
  assert.match(components, /cover-profile/);

  for (const name of ["premium-strategy", "route", "deep-analysis", "us-visa", "cost", "compare", "docs", "due-diligence"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.match(source, /caseCoverProfileLine\(clientCase\)/);
  }
});

test("all eight paid templates include the shared company credibility appendix", () => {
  const appendix = read("src/lib/reports/company-profile.ts");
  for (const heading of ["About XIPHIAS Immigration", "Awards and independent recognition", "Testimonials and review platforms", "Public insights and media presence", "Office locations"]) {
    assert.match(appendix, new RegExp(heading));
  }
  for (const name of ["premium-strategy", "route", "deep-analysis", "us-visa", "cost", "compare", "docs", "due-diligence"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.match(source, /buildCompanyProfilePages/);
  }
});

test("old favourable premium and US defaults are removed", () => {
  const premium = read("src/lib/reports/templates/premium-strategy.ts");
  assert.doesNotMatch(premium, /\?\? 82/);
  assert.doesNotMatch(premium, /evidenceStrength\) \?\? 68/);
  assert.doesNotMatch(premium, /documentReadiness\) \?\? 56/);

  const us = read("src/lib/reports/templates/us-visa.ts");
  assert.doesNotMatch(us, /age, 30/);
  assert.doesNotMatch(us, /experience, 5/);
});

test("draft premium reports cannot present a final route recommendation", () => {
  const premium = read("src/lib/reports/templates/premium-strategy.ts");
  assert.match(premium, /Draft Sample · Unverified/);
  assert.match(premium, /Complete verification before choosing a route/);
  assert.match(premium, /isDraft \? "Draft conclusion" : "Final recommendation"/);
});

test("document report does not derive client readiness from checklist breadth", () => {
  const docs = read("src/lib/reports/templates/docs.ts");
  assert.match(docs, /verifiedDocumentReadiness\(clientCase\.documents\)/);
  assert.doesNotMatch(docs, /breadthScore \* 0\.3/);
  assert.match(docs, /Readiness not assessed/);
});

test("comparison includes benefits, residency outcome and family detail", () => {
  const compare = read("src/lib/reports/templates/compare.ts");
  assert.match(compare, /\["Benefits"/);
  assert.match(compare, /\["Residency outcome"/);
  assert.match(compare, /\["Family details"/);
});

test("advisor-selected programmes remain authoritative across route-led reports", () => {
  const compare = read("src/lib/reports/templates/compare.ts");
  assert.match(compare, /push\(a\.selectedProgrammes\)/);
  assert.match(compare, /subclassNumbers/);

  const premium = read("src/lib/reports/templates/premium-strategy.ts");
  assert.match(premium, /clientCase\.objective\.selectedProgrammes\.value/);
  assert.match(premium, /resolveProgramme\(\{ country, program: selected/);
  assert.match(premium, /if \(dossiers\.length === 0\)/);

  const route = read("src/lib/reports/templates/route.ts");
  assert.match(route, /clientCase\.objective\.selectedProgrammes\.value/);
  assert.match(route, /referenceMatches\(`\$\{route\.id\} \$\{route\.title\}`/);
});

test("document inventory supports semantic matching without treating checklist breadth as evidence", () => {
  const docs = read("src/lib/reports/templates/docs.ts");
  assert.match(docs, /function documentCategory/);
  assert.match(docs, /documentCategory\(item\.name\) === category/);
  assert.match(docs, /verifiedDocumentReadiness\(clientCase\.documents\)/);
});
