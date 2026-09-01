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

test("all paid templates show supplied assessment fields without internal report-production wording", () => {
  const components = read("src/lib/reports/components.ts");
  assert.match(components, /clientDisplayValue\(basis\.cpa\)/);
  assert.match(components, /clientDisplayValue\(basis\.assessingBody\)/);
  assert.doesNotMatch(components, /CPA and assessing body/);
  assert.doesNotMatch(components, /versioned CRM assessment snapshot/);
  assert.doesNotMatch(components, /Adviser-entered points breakdown/);
  assert.doesNotMatch(components, /Assessment control/);
  assert.match(components, /clientLanguageSummary/);
  assert.match(components, /profile-card--wide/);
  assert.match(components, /clientStrategyParts/);
  assert.match(components, /Immediate priorities/);
  assert.match(components, /Provincial Nominee Program \(PNP\)/);
  assert.match(components, /To enter the pool\\s\*\$/);
  assert.match(components, /clientActionSentence/);
  assert.match(components, /Assesment/);
  assert.match(components, /the candidate's occupation/);
  const theme = read("src/lib/reports/theme.ts");
  assert.match(theme, /\.strategy-page\s*\{[^}]*justify-content:\s*flex-start/s);
  assert.doesNotMatch(theme, /\.strategy-page\s*\{[^}]*justify-content:\s*center/s);

  for (const name of ["premium-strategy", "route", "deep-analysis", "us-visa", "cost", "compare", "docs"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.match(source, /reportBasisPage/);
  }

  const deepAnalysis = read("src/lib/reports/templates/deep-analysis.ts");
  assert.doesNotMatch(deepAnalysis, /current model ranks|profile completeness|profile depth captured/i);
  assert.doesNotMatch(deepAnalysis, /CV intelligence|extraction status|profile text analysed|verification boundary/i);
  assert.doesNotMatch(deepAnalysis, /premium buyers|how your route ranking was built|automated report was generated/i);
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
  assert.match(premium, /crmPersonalisation \? "Advisor recommendation" : "Report conclusion"/);
  assert.match(premium, /Validate \$\{route\} before proceeding/);
});

test("automated templates do not masquerade as advisor-reviewed conclusions", () => {
  for (const name of ["route", "deep-analysis", "us-visa", "cost", "compare", "docs"]) {
    const source = read(`src/lib/reports/templates/${name}.ts`);
    assert.doesNotMatch(source, />Advisor summary</);
    assert.match(source, /has not been independently verified by an advisor/);
  }
  const route = read("src/lib/reports/templates/route.ts");
  const us = read("src/lib/reports/templates/us-visa.ts");
  const docs = read("src/lib/reports/templates/docs.ts");
  assert.doesNotMatch(route, /Proceed with confidence/);
  assert.doesNotMatch(us, /ready to advance/);
  assert.doesNotMatch(docs, /Assemble with confidence/);
});

test("due diligence ends with an explicit verification summary", () => {
  const source = read("src/lib/reports/templates/due-diligence.ts");
  assert.match(source, /Report summary/);
  assert.match(source, /independently queried identity, criminal, sanctions/);
  assert.match(source, /pages\.push\(\.\.\.buildCompanyProfilePages[\s\S]*closingHeading[\s\S]*pages\.push/);
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
