import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const source = fs.readFileSync("src/app/api/integrations/crm/assessment-reports/route.ts", "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");

async function loadPersonalisationModule() {
  const moduleSource = fs.readFileSync("src/lib/reports/templates/crm-profile-personalisation.ts", "utf8");
  const transpiled = ts.transpileModule(moduleSource, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
}

const value = (input) => ({ value: input, status: input === undefined ? "unknown" : "provided" });

function clientCase(overrides = {}) {
  const base = {
    identity: {
      name: value("Example Applicant"),
      email: value("applicant@example.com"),
      age: value(31),
      nationality: value("Indian"),
      currentCountry: value("India"),
      maritalStatus: value("Married"),
    },
    objective: {
      primaryGoal: value("Skilled migration to Australia"),
      targetCountry: value("Australia"),
      selectedProgrammes: value(["Subclass 189", "Subclass 190"]),
      priority: value("Permanent residence"),
      timeline: value("12 months"),
    },
    career: {
      occupation: value("ICT Business Analyst"),
      anzscoCode: value("261111"),
      education: value("Master of Information Systems"),
      yearsExperience: value(8),
      languageTest: value("IELTS"),
      languageScore: value(8),
      languageDetails: value("Listening 8, Reading 8, Writing 7.5, Speaking 8"),
      skillsAssessment: value("Positive assessment recorded"),
      assessingBody: value("ACS"),
      professionalRecognition: value("No RPL pathway required"),
      claimedPointsTotal: value(90),
      employerOrBusiness: value("Example Technology Ltd"),
    },
    family: { included: value(true), dependants: value(1) },
    finances: {
      budgetUsd: value(18000),
      availableFundsUsd: value(26000),
      sourceOfFunds: value("Salary savings"),
    },
    immigration: {
      currentStatus: value("Resident in India"),
      history: value("Previous visitor travel only"),
      refusals: value("None"),
      medicalNotes: value("None"),
      characterNotes: value("None"),
    },
    advisor: { profileSummary: value("Strong skilled-migration profile"), customRisks: value([]), customNextActions: value([]) },
    documents: [
      { name: "Master degree certificate", category: "Education", status: "verified" },
      { name: "Employment references", category: "Employment", status: "uploaded" },
      { name: "IELTS test report", category: "English", status: "verified" },
      { name: "ACS skills assessment", category: "Skills assessment", status: "verified" },
    ],
  };
  return {
    ...base,
    ...overrides,
    identity: { ...base.identity, ...(overrides.identity || {}) },
    objective: { ...base.objective, ...(overrides.objective || {}) },
    career: { ...base.career, ...(overrides.career || {}) },
    family: { ...base.family, ...(overrides.family || {}) },
    finances: { ...base.finances, ...(overrides.finances || {}) },
    immigration: { ...base.immigration, ...(overrides.immigration || {}) },
    advisor: { ...base.advisor, ...(overrides.advisor || {}) },
  };
}

const strongPoints = {
  claimedPointsTotal: 90,
  agePoints: 30,
  englishPoints: 20,
  overseasExperiencePoints: 15,
  australianExperiencePoints: 0,
  professionalYearPoints: 0,
  qualificationPoints: 15,
  australianStudyPoints: 0,
  regionalStudyPoints: 0,
  stateNominationPoints: 5,
  regionalSponsorshipPoints: 0,
  partnerPoints: 5,
  communityLanguagePoints: 0,
};

test("CRM assessment reports require a signed, fresh, single-use request", () => {
  assert.match(source, /CRM_ASSESSMENT_REPORT_SECRET/);
  assert.match(source, /createHmac\("sha256"/);
  assert.match(source, /timingSafeEqual/);
  assert.match(source, /Math\.abs\([\s\S]*?> 300/);
  assert.match(source, /xiphiasCrmAssessmentNonces/);
});

test("CRM assessment email requires review, completeness and idempotency", () => {
  assert.match(source, /mode === "email" \? "advisor-reviewed" : "draft"/);
  assert.match(source, /assessment\.completeness < 60/);
  assert.match(source, /Idempotency-Key is required for email/);
  assert.match(source, /beginCrmAssessmentEmail/);
  assert.match(source, /completeCrmAssessmentEmail/);
  assert.match(source, /clientEmail\.status !== "sent"/);
  assert.match(source, /reviewedPdfSha256/);
  assert.match(source, /reviewed PDF failed its integrity check/i);
});

test("CRM assessment supports a separate internal administrator review delivery", () => {
  assert.match(source, /"internal-review"/);
  assert.match(source, /deliveryRecipient/);
  assert.match(source, /internalReviewEmailHtml/);
  assert.match(source, /Internal only:/);
  assert.match(source, /internalEmail/);
  assert.match(source, /mode === "email" && assessment\.completeness < 60/);
});

test("CRM assessment accepts structured verified case and points inputs", () => {
  assert.match(source, /pointsAssessment/);
  assert.match(source, /claimedPointsTotal/);
  assert.match(source, /professionalRecognition/);
  assert.match(source, /sourceOfFunds/);
  assert.match(source, /immigrationHistory/);
  assert.match(source, /optionalBoolean/);
});

test("CRM integration never invents favourable client scores or a paid order", () => {
  assert.doesNotMatch(source, /routeFitScore\s*:/);
  assert.doesNotMatch(source, /evidenceStrengthScore\s*:/);
  assert.doesNotMatch(source, /documentReadinessScore\s*:/);
  assert.match(source, /status: "initiated"/);
  assert.doesNotMatch(source, /status: "paid"/);
});

test("PDF and client email both use the shared modern report renderer", () => {
  assert.match(source, /generateReportPdf\(config\.reportKind, order\)/);
  assert.match(source, /attachments: \[\{ filename, content: pdf/);
});

test("CRM points assessments replace internal front matter while retaining the premium report", () => {
  const template = fs.readFileSync("src/lib/reports/templates/crm-points-assessment.ts", "utf8");
  const premium = fs.readFileSync("src/lib/reports/templates/premium-strategy.ts", "utf8");
  assert.match(source, /reportFormat/);
  assert.match(premium, /points-assessment/);
  assert.match(premium, /buildCrmPointsAssessmentFrontMatter/);
  assert.match(premium, /isCrmPointsAssessment/);
  assert.match(template, /SkillSelect points summary/);
  assert.match(template, /Subclass 189/);
  assert.match(template, /Subclass 190/);
  assert.match(template, /Points factor/);
  assert.doesNotMatch(template, /advisor-supplied|not recorded in CRM|versioned evidence|data source/i);
});

test("CRM profile facts personalise the full report, not only its opening pages", async () => {
  const { buildCrmProfilePersonalisation } = await loadPersonalisationModule();
  const shared = { dossier: null, route: "Subclass 189", countryLabel: "Australia", timelineMonths: 12 };
  const strong = buildCrmProfilePersonalisation({ clientCase: clientCase(), answers: strongPoints, ...shared });
  const developing = buildCrmProfilePersonalisation({
    clientCase: clientCase({
      career: {
        education: value("Diploma in Information Technology"),
        yearsExperience: value(2),
        languageScore: value(6),
        languageDetails: value("Listening 6, Reading 6, Writing 6, Speaking 6"),
        skillsAssessment: value(undefined),
        assessingBody: value(undefined),
        claimedPointsTotal: value(60),
        employerOrBusiness: value("Small Systems Co"),
      },
      family: { included: value(false), dependants: value(0) },
      finances: { budgetUsd: value(7000), availableFundsUsd: value(9000), sourceOfFunds: value("Savings") },
      immigration: { refusals: value("Prior visitor visa refusal") },
      documents: [],
    }),
    answers: {
      ...strongPoints,
      claimedPointsTotal: 60,
      englishPoints: 0,
      overseasExperiencePoints: 5,
      qualificationPoints: 10,
      stateNominationPoints: 0,
      partnerPoints: 0,
    },
    ...shared,
  });

  assert.notDeepEqual(strong, developing);
  assert.match(JSON.stringify(strong.eligibilityRows), /Master of Information Systems/);
  assert.match(JSON.stringify(developing.eligibilityRows), /Diploma in Information Technology/);
  assert.match(JSON.stringify(strong.milestoneRows), /8 years/);
  assert.match(JSON.stringify(developing.milestoneRows), /2 years/);
  assert.match(JSON.stringify(developing.riskRows), /below the 65-point threshold/);
  assert.match(JSON.stringify(developing.riskRows), /Prior visitor visa refusal/);
  assert.notDeepEqual(strong.financialSteps, developing.financialSteps);
  assert.notDeepEqual(strong.familyCards, developing.familyCards);
  assert.notDeepEqual(strong.scenarioCards, developing.scenarioCards);
  assert.notDeepEqual(strong.advisorQuestions, developing.advisorQuestions);
  assert.notEqual(strong.closingSummary, developing.closingSummary);
});

test("premium strategy consumes personalised data in every affected downstream section", () => {
  const premium = fs.readFileSync("src/lib/reports/templates/premium-strategy.ts", "utf8");
  for (const property of [
    "profileCards",
    "eligibilityRows",
    "assumptionRows",
    "evidenceRows",
    "riskRows",
    "financialCards",
    "familyCards",
    "scenarioCards",
    "triggerRows",
    "milestoneRows",
    "roadmapSteps",
    "advisorQuestions",
    "closingSummary",
  ]) {
    assert.ok(
      premium.includes(`crmPersonalisation.${property}`) || premium.includes(`crmPersonalisation?.${property}`),
      `premium report must consume crmPersonalisation.${property}`,
    );
  }
});
