import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModel() {
  const source = fs.readFileSync("src/lib/due-diligence.ts", "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const model = loadModel();

function completeInput(overrides = {}) {
  return {
    ...model.defaultDueDiligenceInput,
    track: "skilled",
    destination: "Australia",
    programme: "Subclass 189",
    applicants: "individual",
    jurisdictions: "one",
    identityEvidence: "complete",
    identityConsistent: "yes",
    immigrationHistory: "complete",
    priorVisaIssue: "no",
    legalIssue: "no",
    pepExposure: "no",
    employmentEvidence: "complete",
    educationEvidence: "complete",
    familyEvidence: "not-applicable",
    fundsRequired: false,
    fundsEvidence: "not-applicable",
    thirdPartyFunds: "not-provided",
    counterpartyStatus: "not-applicable",
    documentConcern: "no",
    ...overrides,
  };
}

test("missing information remains explicit and never becomes a clearance", () => {
  const result = model.assessImmigrationDueDiligence(model.defaultDueDiligenceInput);
  assert.notEqual(result.overall, "ready-for-review");
  assert.ok(result.findings.some((finding) => finding.code === "identity-evidence-missing"));
  assert.ok(result.findings.some((finding) => finding.code === "immigration-history-missing"));
  assert.ok(result.verificationBoundary.some((item) => item.includes("sanctions")));
});

test("a well-prepared self-declared profile is ready only for professional verification", () => {
  const result = model.assessImmigrationDueDiligence(completeInput());
  assert.equal(result.overall, "ready-for-review");
  assert.equal(result.scope, "essential");
  assert.equal(result.findings.length, 0);
  assert.ok(result.readiness >= 90);
  assert.ok(result.dimensions.find((dimension) => dimension.key === "pep-sanctions")?.basis.includes("No sanctions"));
});

test("declared legal and document-integrity issues create a filing hold", () => {
  const result = model.assessImmigrationDueDiligence(completeInput({
    legalIssue: "yes",
    documentConcern: "yes",
  }));
  assert.equal(result.overall, "hold");
  assert.ok(result.findings.some((finding) => finding.code === "legal-issue-declared" && finding.severity === "hold"));
  assert.ok(result.findings.some((finding) => finding.code === "document-integrity-concern" && finding.severity === "hold"));
});

test("complex unsupported investment funds trigger private-client enhanced review", () => {
  const result = model.assessImmigrationDueDiligence(completeInput({
    track: "citizenship",
    programme: "Citizenship by investment",
    jurisdictions: "four-plus",
    fundsRequired: true,
    fundingSource: "mixed",
    fundsEvidence: "missing",
    thirdPartyFunds: "yes",
    counterpartyStatus: "not-checked",
  }));
  assert.equal(result.scope, "private-client");
  assert.equal(result.overall, "hold");
  assert.ok(result.findings.some((finding) => finding.code === "funds-evidence-missing"));
  assert.ok(result.findings.some((finding) => finding.code === "third-party-funding"));
  assert.ok(result.findings.some((finding) => finding.code === "counterparty-not-checked"));
});

test("corporate cases receive institutional scope", () => {
  const result = model.assessImmigrationDueDiligence(completeInput({ track: "corporate" }));
  assert.equal(result.scope, "institutional");
});
