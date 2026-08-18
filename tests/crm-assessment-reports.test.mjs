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

async function loadAustraliaPointsModule() {
  const moduleSource = fs.readFileSync("src/lib/reports/australia-points.ts", "utf8");
  const transpiled = ts.transpileModule(moduleSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
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
  assert.match(source, /structuredReportCompleteness/);
  assert.match(source, /completeness < 60/);
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
  assert.match(source, /mode === "email" && completeness < 60/);
});

test("CRM assessment accepts structured verified case and points inputs", () => {
  assert.match(source, /pointsAssessment/);
  assert.match(source, /claimedPointsTotal/);
  assert.match(source, /professionalRecognition/);
  assert.match(source, /sourceOfFunds/);
  assert.match(source, /immigrationHistory/);
  assert.match(source, /optionalBoolean/);
});

test("CRM report desk can use the recorded assessment without forcing Australia or a manual fee table", () => {
  assert.match(source, /calculationMode === "source_assessment"/);
  assert.match(source, /recordedPointsAssessment/);
  assert.match(source, /eligibilityAssessment/);
  assert.doesNotMatch(source, /if \(!Array\.isArray\(answers\.feeItems\)[\s\S]*?Add at least one fee/);
});

test("CRM dynamic reports use programme-aware personalisation and imagery", () => {
  const premium = fs.readFileSync("src/lib/reports/templates/premium-strategy.ts", "utf8");
  const dynamic = fs.readFileSync("src/lib/reports/templates/crm-dynamic-personalisation.ts", "utf8");
  const assets = fs.readFileSync("src/lib/reports/assets.ts", "utf8");
  assert.match(premium, /reportFormat\) === "crm-dynamic"/);
  assert.match(premium, /buildCrmDynamicPersonalisation/);
  assert.match(dynamic, /routeFamily/);
  assert.match(dynamic, /dossier\?\.requirements/);
  assert.match(dynamic, /dossier\?\.processSteps/);
  assert.match(premium, /profileCards\.slice\(0, 4\)/);
  assert.match(premium, /profileContinuationPage/);
  assert.match(premium, /personalisedEligibilityRows\.slice\(0, 4\)/);
  assert.match(premium, /selfCheckContinuationPage/);
  assert.match(premium, /crmOccupationCodeLabel/);
  assert.match(premium, /NOC \/ TEER/);
  assert.match(premium, /profileLine: isCrmReport/);
  assert.doesNotMatch(dynamic, /Not applicable or incomplete|Complete in the assessment profile|Complete in client profile/);
  assert.match(assets, /loadProgrammeImages/);
  assert.match(assets, /programme\.programSlug/);
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
  assert.match(template, /Points allocation/);
  assert.match(template, /Subclass 189/);
  assert.match(template, /Subclass 190/);
  assert.match(template, /Subclass 491/);
  assert.match(template, /Fees and required funds/);
  assert.match(template, /5 to less than 8 years/);
  assert.match(template, /Recorded fact/);
  assert.match(template, /To confirm/);
  assert.doesNotMatch(template, /advisor-supplied|not recorded in CRM|versioned evidence|data source/i);
});

test("verified Australia calculator applies official boundary brackets and the employment cap", async () => {
  const calculator = await loadAustraliaPointsModule();
  assert.equal(calculator.australiaAgePoints(24), 25);
  assert.equal(calculator.australiaAgePoints(25), 30);
  assert.equal(calculator.australiaAgePoints(32), 30);
  assert.equal(calculator.australiaAgePoints(33), 25);
  assert.equal(calculator.australiaAgePoints(40), 15);
  assert.equal(calculator.australiaAgePoints(45), 0);
  assert.equal(calculator.australiaOverseasExperiencePoints(35), 0);
  assert.equal(calculator.australiaOverseasExperiencePoints(36), 5);
  assert.equal(calculator.australiaOverseasExperiencePoints(60), 10);
  assert.equal(calculator.australiaOverseasExperiencePoints(96), 15);
  assert.equal(calculator.australiaLocalExperiencePoints(11), 0);
  assert.equal(calculator.australiaLocalExperiencePoints(12), 5);
  assert.equal(calculator.australiaLocalExperiencePoints(96), 20);

  const result = calculator.calculateAustraliaPoints({
    visaSubclass: "190", dateOfBirth: "1996-08-18", pointsTestDate: "2026-08-17",
    languageTest: "IELTS", languageListening: 7, languageReading: 7, languageWriting: 7, languageSpeaking: 7,
    overseasExperienceMonths: 66, australianExperienceMonths: 0,
    qualificationLevel: "bachelor_or_higher", partnerCategory: "single_or_aus_partner",
  });
  assert.equal(result.ok, true);
  assert.equal(result.values.agePoints, 30);
  assert.equal(result.values.overseasExperiencePoints, 10);
  assert.equal(result.values.basePointsTotal, 75);
  assert.equal(result.values.subclass190Points, 80);

  const capped = calculator.calculateAustraliaPoints({
    visaSubclass: "189", dateOfBirth: "1996-08-18", pointsTestDate: "2026-08-17",
    languageTest: "IELTS", languageListening: 8, languageReading: 8, languageWriting: 8, languageSpeaking: 8,
    overseasExperienceMonths: 96, australianExperienceMonths: 96,
    qualificationLevel: "doctorate", partnerCategory: "no_partner_points",
  });
  assert.equal(capped.ok, true);
  assert.equal(capped.values.employmentPointsCapAdjustment, -15);
  assert.equal(capped.values.basePointsTotal, 90);
});

test("CRM assessment report keeps detailed client-useful sections and excludes methodology filler", () => {
  const premium = fs.readFileSync("src/lib/reports/templates/premium-strategy.ts", "utf8");
  const company = fs.readFileSync("src/lib/reports/company-profile.ts", "utf8");
  assert.match(premium, /isCrmPointsAssessment[\s\S]*?\? \[[\s\S]*?basisPage[\s\S]*?dossierPages[\s\S]*?financialControlPage[\s\S]*?companyPages[\s\S]*?closer/);
  assert.doesNotMatch(premium.match(/isCrmPointsAssessment[\s\S]*?: \[/)?.[0] || "", /methodologyPage/);
  assert.match(premium, /crmOccupation/);
  assert.match(premium, /ANZSCO/);
  assert.match(premium, /prices: \[\]/);
  assert.match(premium, /governmentFees: \[\]/);
  assert.match(premium, /Selected occupation for this assessment/);
  assert.match(company, /Client testimonials/);
  assert.match(company, /Awards and independent recognition/);
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
