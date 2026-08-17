import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadTypeScriptModule(file) {
  const source = fs.readFileSync(file, "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const model = loadTypeScriptModule("src/lib/xia-intelligence-model.ts");
const documents = loadTypeScriptModule("src/lib/document-readiness.ts");

function route(overrides) {
  return {
    id: "route",
    title: "Canada route",
    country: "Canada",
    countrySlug: "canada",
    track: "residency",
    href: "/residency/canada/route",
    summary: "Permanent residence route.",
    tags: [],
    investmentUsd: 0,
    investmentLabel: "Not provided",
    timelineMonths: 18,
    timelineLabel: "18 months",
    presence: "moderate",
    family: true,
    risk: "standard",
    source: "site-content",
    keywords: "canada permanent residence",
    ...overrides,
  };
}

const investorInput = {
  goal: "pr",
  track: "all",
  destination: "Canada",
  profile: "investor",
  budget: 250000,
  timeline: 24,
  family: true,
  presence: "any",
  priority: "stability",
  notes: "Prefer a passive investment and do not want to operate a business.",
};

test("route intelligence filters incompatible investor, entrepreneur and skilled profiles before ranking", () => {
  const results = model.scoreProgrammeRoutes([
    route({ id: "passive-200", title: "Canada Residency by Investment Fund", investmentUsd: 200000, investmentLabel: "USD 200,000", keywords: "canada permanent residence residency by investment fund investor" }),
    route({ id: "passive-500", title: "Canada Investor Bond Route", investmentUsd: 500000, investmentLabel: "USD 500,000", keywords: "canada permanent residence investor bond" }),
    route({ id: "entrepreneur", title: "Alberta Entrepreneur Farm Stream", investmentUsd: 150000, investmentLabel: "USD 150,000", keywords: "canada permanent residence entrepreneur active business farm job creation" }),
    route({ id: "skilled", title: "Canada Express Entry", track: "skilled", keywords: "canada permanent residence skilled professional points" }),
  ], investorInput);

  assert.deepEqual(results.map((item) => item.id), ["passive-200", "passive-500"]);
  assert.ok(results[0].fitScore > results[1].fitScore);
  assert.ok(results[1].fitScore < 98);
  assert.ok(results[1].warnings.some((warning) => warning.includes("below")));
  assert.ok(results.every((item) => item.confidenceScore > 0));
});

test("route intelligence does not recommend until minimum facts exist", () => {
  assert.deepEqual(model.scoreProgrammeRoutes([route({})], { ...investorInput, destination: "", goal: "not-sure", profile: "not-provided", budget: 0 }), []);
});

test("deep analysis does not score an empty profile", () => {
  const evidence = Object.fromEntries(Object.keys(model.evidenceLabels).map((key) => [key, false]));
  const empty = {
    targetCountry: "global", goal: "not-sure", field: "not-provided", role: "", age: 0,
    education: "unknown", yearsExperience: 0, languageTest: "not-provided", languageScore: 0,
    evidence, citationCount: 0, publicationCount: 0, patentCount: 0, resumeFileName: "",
    resumeParseStatus: "not-provided", profileSummary: "",
  };
  assert.equal(model.highSkillCompletion(empty), 0);
  assert.equal(model.isHighSkillInputSufficient(empty), false);
  assert.deepEqual(model.scoreHighSkillRoutes(empty), []);
});

test("document readiness remains Not started when no document status is supplied", () => {
  const result = documents.assessDocumentReadiness(documents.emptyDocumentReadinessInput);
  assert.equal(result.status, "not-started");
  assert.equal(result.percent, null);
  assert.equal(result.reviewed, 0);
});

test("document readiness scores only document categories the user reviewed", () => {
  const result = documents.assessDocumentReadiness({
    ...documents.emptyDocumentReadinessInput,
    identity: "available",
    employment: "partial",
  });
  assert.equal(result.status, "assessed");
  assert.equal(result.reviewed, 2);
  assert.equal(result.percent, 78);
});

test("XIA public surfaces use the canonical blue and no retired navy root", () => {
  const files = [
    "src/components/XiaTools/ToolShell.tsx",
    "src/components/XiaIntelligence/XiaIntelligenceClient.tsx",
    "src/components/DocumentReadiness/DocumentReadinessClient.tsx",
    "src/components/CostEstimator/CostEstimatorClient.tsx",
    "src/components/ProgramComparison/ProgramComparisonClient.tsx",
    "src/components/ProgramIndex/ProgramIndexClient.tsx",
    "src/components/DueDiligence/DueDiligenceClient.tsx",
    "src/components/ExpressReports/ExpressReportsClient.tsx",
    "src/app/(site)/reports/page.tsx",
  ];
  const source = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.ok(source.includes("bg-primary"));
  assert.ok(!source.includes("#071a3a"));
  assert.ok(!source.includes("group-hover/input-panel"));
});
