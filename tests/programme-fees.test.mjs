import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalogue = fs.readFileSync("src/lib/reports/programme-fees.ts", "utf8");
const resolver = fs.readFileSync("src/lib/reports/programme.ts", "utf8");
const dossier = fs.readFileSync("src/lib/reports/dossier-sections.ts", "utf8");
const personalisation = fs.readFileSync("src/lib/reports/templates/crm-dynamic-personalisation.ts", "utf8");

test("verified programme catalogue contains the current 189 and 190 base charges", () => {
  assert.match(catalogue, /skilled-independent-189[\s\S]*amount: 6135/);
  assert.match(catalogue, /skilled-nominated-190[\s\S]*amount: 6140/);
  assert.match(catalogue, /sourceUrl: HOME_AFFAIRS_189/);
  assert.match(catalogue, /sourceUrl: HOME_AFFAIRS_190/);
});

test("programme resolver applies fee control to every resolved dossier", () => {
  assert.match(resolver, /attachProgrammeFeeSchedule\(attachBody\(best\.meta\)\)/);
  assert.match(resolver, /attachProgrammeFeeSchedule\(attachBody\(meta\)\)/);
  assert.match(catalogue, /status: "pending"/);
  assert.match(catalogue, /status: "website_estimate"/);
});

test("reports distinguish verified fees, estimates and missing schedules", () => {
  assert.match(dossier, /XIPHIAS professional fees are not inferred/);
  assert.match(dossier, /Website estimate - recheck/);
  assert.match(catalogue, /No source-backed programme fee schedule is loaded yet/);
  assert.doesNotMatch(dossier, /sourceLabel \|\| "Official schedule"/);
});

test("CRM-supplied authority fees are included without inventing professional charges", () => {
  assert.match(personalisation, /answerFees\(a\.feeItems\)/);
  assert.match(personalisation, /XIPHIAS professional fees appear only when a client quotation supplies them/);
});
