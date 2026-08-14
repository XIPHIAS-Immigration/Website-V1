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
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const { analysePaidDueDiligence, defaultPaidDueDiligenceInput } = loadTypescriptModule("src/lib/due-diligence-paid.ts");

function completeInput(overrides = {}) {
  return {
    ...defaultPaidDueDiligenceInput,
    fullLegalName: "Sample Applicant",
    dateOfBirth: "1990-01-01",
    nationality: "India",
    residenceCountry: "India",
    countriesLivedIn: "India",
    visaHistory: "No prior visas or refusals declared",
    employmentTimeline: "2015-present - Sample Company",
    educationTimeline: "2010-2014 - Sample University",
    passportEvidence: "complete",
    addressEvidence: "complete",
    policeEvidence: "complete",
    employmentEvidenceDetail: "complete",
    educationEvidenceDetail: "complete",
    familyEvidenceDetail: "not-applicable",
    financialEvidence: "not-applicable",
    counterpartyChecks: "not-applicable",
    objectives: "Review an immigration evidence pack before filing.",
    accuracyConfirmed: true,
    consentConfirmed: true,
    ...overrides,
  };
}

test("paid intake remains unverified even when declared evidence is complete", () => {
  const result = analysePaidDueDiligence(completeInput());
  assert.equal(result.completeness, 100);
  assert.equal(result.overall, "prepared");
  assert.match(result.overallLabel, /independent verification/i);
});

test("declared overstay and document inconsistency create filing holds", () => {
  const result = analysePaidDueDiligence(completeInput({
    overstayDetails: "Overstay in Country X during 2022",
    documentInconsistencies: "Employment dates differ between CV and reference",
  }));
  assert.equal(result.overall, "hold");
  assert.ok(result.findings.some((finding) => finding.code === "status-issue-declared" && finding.severity === "hold"));
  assert.ok(result.findings.some((finding) => finding.code === "document-inconsistency" && finding.severity === "hold"));
});

test("third-party funds and unexplained deposits trigger enhanced review", () => {
  const result = analysePaidDueDiligence(completeInput({
    sourceOfWealth: "Business income",
    sourceOfFunds: "Savings and family gift",
    financialEvidence: "partial",
    largeDeposits: "INR 2,000,000 deposit from a property transaction",
    thirdPartyDetails: "Parent will provide part of the funds",
  }));
  assert.equal(result.overall, "high");
  assert.ok(result.findings.some((finding) => finding.code === "third-party-funds"));
  assert.ok(result.findings.some((finding) => finding.code === "large-deposits"));
});

test("missing paid identity fields cannot produce a prepared outcome", () => {
  const result = analysePaidDueDiligence(defaultPaidDueDiligenceInput);
  assert.equal(result.overall, "hold");
  assert.ok(result.findings.some((finding) => finding.code === "identity-core-incomplete"));
});
