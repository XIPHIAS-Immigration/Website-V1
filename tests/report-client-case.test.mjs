import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadClientCase() {
  let source = fs.readFileSync("src/lib/reports/client-case.ts", "utf8");
  source = source.replace(/^import type .*$/gm, "");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const model = loadClientCase();

function order(answers = {}) {
  return {
    merchantTxnNo: "CASE-001",
    amountInr: 499,
    productType: "deep_analysis_report",
    productName: "Deep Analysis",
    customer: { name: "Test Client", email: "client@example.com" },
    status: "paid",
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
    events: [],
    answers,
  };
}

test("missing case facts remain unknown and do not receive favourable defaults", () => {
  const clientCase = model.buildClientCase(order());
  assert.equal(clientCase.identity.age.status, "unknown");
  assert.equal(clientCase.career.yearsExperience.status, "unknown");
  assert.equal(clientCase.finances.budgetUsd.status, "unknown");
  assert.equal(clientCase.advisor.routeFitScore.status, "unknown");
  assert.equal(clientCase.advisor.routeFitScore.value, undefined);
});

test("advisor-reviewed cases preserve provenance and selected programmes", () => {
  const clientCase = model.buildClientCase(order({
    reviewStatus: "advisor-reviewed",
    dataSource: "Advisor report desk",
    nationality: "Indian",
    age: 36,
    selectedProgrammes: "Australia subclass 189; Australia subclass 190",
  }));
  assert.equal(clientCase.identity.age.status, "advisor-confirmed");
  assert.equal(clientCase.identity.age.source, "Advisor report desk");
  assert.deepEqual(clientCase.objective.selectedProgrammes.value, ["Australia subclass 189", "Australia subclass 190"]);
});

test("CPA and assessing body are populated from case-specific assessment fields", () => {
  const clientCase = model.buildClientCase(order({
    cpa: "Good - subject to formal assessment and employment evidence",
    assessingAuthority: "Australian Computer Society (ACS)",
  }));
  assert.equal(clientCase.career.cpa.value, "Good - subject to formal assessment and employment evidence");
  assert.equal(clientCase.career.assessingBody.value, "Australian Computer Society (ACS)");

  const basis = model.reportBasis(clientCase);
  assert.equal(basis.cpa, "Good - subject to formal assessment and employment evidence");
  assert.equal(basis.assessingBody, "Australian Computer Society (ACS)");
});

test("ANZSCO aliases are preserved and displayed on the cover without inference", () => {
  const clientCase = model.buildClientCase(order({
    targetCountries: "Australia",
    selectedProgrammes: "Skilled Independent visa (subclass 189)",
    occupation: "ICT Support Engineer",
    occupationCode: "263212",
  }));
  assert.equal(clientCase.career.anzscoCode.value, "263212");
  assert.equal(model.caseCoverProfileLine(clientCase), "Occupation: ICT Support Engineer | ANZSCO 263212");

  const missing = model.buildClientCase(order({
    targetCountries: "Australia",
    occupation: "ICT Support Engineer",
  }));
  assert.equal(model.caseCoverProfileLine(missing), "Occupation: ICT Support Engineer | ANZSCO: Not provided");
});

test("document readiness is calculated from actual statuses", () => {
  const empty = model.verifiedDocumentReadiness([]);
  assert.equal(empty.score, undefined);

  const readiness = model.verifiedDocumentReadiness([
    { name: "Passport", status: "verified" },
    { name: "Degree", status: "uploaded" },
    { name: "Police clearance", status: "missing" },
    { name: "Language result", status: "expired" },
  ]);
  assert.equal(readiness.verified, 1);
  assert.equal(readiness.available, 2);
  assert.equal(readiness.problems, 1);
  assert.ok(readiness.score >= 20 && readiness.score < 50);
});

test("personalisation assessment reports critical limitations", () => {
  const assessment = model.assessPersonalisation(model.buildClientCase(order({ targetCountries: "Canada" })));
  assert.ok(assessment.completeness < 30);
  assert.ok(assessment.limitations.some((item) => item.includes("Nationality")));
  assert.ok(assessment.limitations.some((item) => item.includes("document inventory")));
  assert.ok(assessment.limitations.some((item) => item.includes("draft")));
});
