import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModel() {
  const source = fs.readFileSync("src/lib/xia-intelligence-model.ts", "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "require", "module", javascript)(module.exports, require, module);
  return module.exports;
}

const model = loadModel();
const countries = ["usa", "canada", "uk", "australia", "global"];
const goals = ["permanent-residency", "temporary-work", "talent-visa", "founder", "not-sure"];
const fields = ["technology", "science", "business", "healthcare", "academia", "arts", "sports", "other"];
const evidenceKeys = Object.keys(model.evidenceLabels);

function input(overrides = {}) {
  return {
    targetCountry: "canada",
    goal: "permanent-residency",
    field: "technology",
    role: "Senior technology professional",
    age: 32,
    education: "master",
    yearsExperience: 8,
    languageTest: "ielts",
    languageScore: 7,
    evidence: Object.fromEntries(evidenceKeys.map((key) => [key, false])),
    citationCount: 0,
    publicationCount: 0,
    patentCount: 0,
    resumeFileName: "cv.pdf",
    resumeParseStatus: "parsed",
    profileSummary: "Eight years of professional experience with measurable impact.",
    ...overrides,
  };
}

test("every selectable country, goal, and field combination returns active compatible routes", () => {
  for (const targetCountry of countries) {
    for (const goal of goals) {
      for (const field of fields) {
        const routes = model.scoreHighSkillRoutes(input({ targetCountry, goal, field }));
        assert.ok(routes.length > 0, `${targetCountry}/${goal}/${field} returned no route`);
        assert.ok(routes.every((route) => route.status === "active"));
        if (targetCountry !== "global") assert.ok(routes.every((route) => route.countryKey === targetCountry));
        if (goal !== "not-sure") assert.ok(routes.every((route) => route.goals.includes(goal)));
      }
    }
  }
});

test("temporary-work purchases do not receive permanent-only routes", () => {
  for (const targetCountry of ["usa", "canada", "uk", "australia"]) {
    const routes = model.scoreHighSkillRoutes(input({ targetCountry, goal: "temporary-work" }));
    assert.ok(routes.every((route) => !route.permanent));
  }
});

test("points-sensitive routes respond to age", () => {
  const younger = model.scoreHighSkillRoutes(input({ targetCountry: "australia", age: 32 })).find((route) => route.id === "australia-189");
  const older = model.scoreHighSkillRoutes(input({ targetCountry: "australia", age: 50 })).find((route) => route.id === "australia-189");
  assert.ok(younger && older);
  assert.ok(younger.fitScore > older.fitScore);
  assert.ok(older.gaps.some((gap) => gap.includes("no older than 44")));
});

test("sponsor evidence materially improves sponsor-led route readiness", () => {
  const withoutSponsor = model.scoreHighSkillRoutes(input({ targetCountry: "canada", goal: "temporary-work" })).find((route) => route.id === "canada-gts");
  const evidence = { ...input().evidence, jobOffer: true, employerSponsor: true };
  const withSponsor = model.scoreHighSkillRoutes(input({ targetCountry: "canada", goal: "temporary-work", evidence })).find((route) => route.id === "canada-gts");
  assert.ok(withoutSponsor && withSponsor);
  assert.ok(withSponsor.fitScore > withoutSponsor.fitScore);
  assert.ok(!withSponsor.gaps.some((gap) => gap.includes("requires qualifying sponsor")));
});

test("paused Canada Start-Up Visa is not in the paid recommendation catalogue", () => {
  assert.ok(!model.highSkillRoutes.some((route) => /start[- ]?up visa/i.test(route.title)));
});

test("Hong Kong QMAS is a first-class current route", () => {
  const routes = model.scoreHighSkillRoutes(input({
    targetCountry: "hong-kong",
    goal: "talent-visa",
    field: "business",
    role: "Finance operations specialist",
    profileSummary: "Seven years in finance, international trade and multinational enterprises.",
  }));
  assert.equal(routes.length, 1);
  assert.equal(routes[0].id, "hong-kong-qmas-gpt");
  assert.equal(routes[0].country, "Hong Kong");
  assert.match(routes[0].officialUrl, /immd\.gov\.hk/);
  assert.equal(routes[0].requiresSponsor, false);
});
