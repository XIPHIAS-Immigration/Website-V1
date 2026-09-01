import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadQmasModule() {
  const source = fs.readFileSync("src/lib/reports/qmas-assessment.ts", "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const { buildQmasAssessment } = loadQmasModule();

test("QMAS preserves the current criteria score separately from a legacy worksheet", () => {
  const assessment = buildQmasAssessment({
    age: 31,
    education: "MBA + B.Com",
    yearsExperience: 7,
    languageDetails: "English and Hindi",
    profileSummary: "Finance professional with Goldman Sachs and more than two years in the Netherlands.",
    pointsAssessment: "Current QMAS criteria 6 / 12",
    claimedPointsTotal: 85,
  });
  assert.equal(assessment.criteriaMet, 6);
  assert.equal(assessment.threshold, 6);
  assert.equal(assessment.legacyScore, 85);
  assert.equal(assessment.outlook, "Strong potential");
  assert.equal(assessment.assurance, "Positive");
  assert.equal(assessment.scoreBasis, "recorded");
});

test("QMAS never treats a former numerical worksheet as the current 12-criterion score", () => {
  const assessment = buildQmasAssessment({ claimedPointsTotal: 85 });
  assert.equal(assessment.criteriaMet, 0);
  assert.equal(assessment.legacyScore, 85);
  assert.equal(assessment.outlook, "Insufficient evidence");
});

test("QMAS can derive a transparent evidence-aligned position without inventing a percentage", () => {
  const assessment = buildQmasAssessment({
    age: 31,
    education: "MBA",
    yearsExperience: 7,
    languageDetails: "English and Hindi",
    profileSummary: "Finance work at Goldman Sachs with international exposure in the Netherlands.",
  });
  assert.equal(assessment.criteriaMet, 6);
  assert.equal(assessment.scoreBasis, "evidence-aligned");
  assert.equal(assessment.outlook, "Strong potential");
  assert.ok(!("probability" in assessment));
});
