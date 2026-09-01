import type { ClientCase, ClientDocument } from "../client-case";
import type { Dossier } from "../programme";
import type { CrmProfilePersonalisation, PersonalisedRow, PersonalisedStatusRow } from "./crm-profile-personalisation";

type Answers = Record<string, unknown>;

const text = (value: unknown) => typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
const fact = <T>(value: { value?: T } | undefined): T | undefined => value?.value;
const number = (value: unknown) => {
  if (value === "" || value == null) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const money = (value: number | undefined, currency = "USD") => value === undefined
  ? "Confirm against the current quotation"
  : currency + " " + new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

type AnswerFee = { category: string; label: string; amount: number; currency: string; appliesTo: string; verifiedDate: string; source: string };

function answerFees(value: unknown): AnswerFee[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const label = text(row.label);
    const amount = number(row.amount);
    const currency = text(row.currency).toUpperCase();
    if (!label || amount === undefined || amount < 0 || !currency) return [];
    return [{ category: text(row.category), label, amount, currency, appliesTo: text(row.appliesTo ?? row.when), verifiedDate: text(row.verifiedDate), source: text(row.source) }];
  });
}

function documentStatus(documents: ClientDocument[], label: string) {
  const token = label.split(/\s+/)[0].replace(/[^\w]/g, "");
  const pattern = new RegExp(token || "document", "i");
  const matches = documents.filter((item) => pattern.test(item.name));
  if (!matches.length) return "To collect";
  if (matches.some((item) => item.status === "verified")) return "Verified";
  if (matches.some((item) => ["uploaded", "available"].includes(item.status))) return "Available for review";
  return "Action required";
}

function statusTone(status: string): PersonalisedStatusRow["tone"] {
  return /verified|available|recorded/i.test(status) ? "good" : "warn";
}

function routeFamily(routeText: string) {
  const value = routeText.toLowerCase();
  if (/(invest|golden visa|residency by|citizenship by)/.test(value)) return "investment";
  if (/(entrepreneur|corporate|business|start-?up)/.test(value)) return "corporate";
  if (/(employer|work permit|sponsor|lmia)/.test(value)) return "employer";
  if (/(family|spouse|parent)/.test(value)) return "family";
  if (/(study|student)/.test(value)) return "study";
  return "skilled";
}

export function buildCrmDynamicPersonalisation(args: {
  clientCase: ClientCase;
  answers: Answers;
  dossier: Dossier | null;
  route: string;
  countryLabel: string;
  timelineMonths: number;
}): CrmProfilePersonalisation {
  const { clientCase, answers: a, dossier, route, countryLabel, timelineMonths } = args;
  const name = fact(clientCase.identity.name) || "The applicant";
  const age = fact(clientCase.identity.age);
  const nationality = fact(clientCase.identity.nationality);
  const residence = fact(clientCase.identity.currentCountry);
  const occupation = fact(clientCase.career.occupation);
  const occupationCode = fact(clientCase.career.anzscoCode) || text(a.occupationCode);
  const education = fact(clientCase.career.education) || text(a.educationDetails);
  const years = fact(clientCase.career.yearsExperience);
  const language = [fact(clientCase.career.languageTest), fact(clientCase.career.languageDetails) || text(a.crmLanguageProfile)].filter(Boolean).join(" · ");
  const assessingBody = fact(clientCase.career.assessingBody);
  const assessment = [text(a.skillsAssessmentResult), fact(clientCase.career.skillsAssessment)].filter(Boolean).join(" · ");
  const points = number(a.claimedPointsTotal);
  const objective = fact(clientCase.objective.goal);
  const alternatives = fact(clientCase.objective.fallbackProgrammes) ?? [];
  const familyIncluded = fact(clientCase.family.included);
  const dependants = fact(clientCase.family.dependants) ?? 0;
  const familyDetails = fact(clientCase.family.details) || text(a.familyDetails);
  const availableFunds = fact(clientCase.finances.availableFundsUsd);
  const sourceOfFunds = fact(clientCase.finances.sourceOfFunds);
  const documents = clientCase.documents ?? [];
  const family = routeFamily(countryLabel + " " + route + " " + (objective || ""));
  const pointsBased = /(points|australia|express entry|\b189\b|\b190\b|\b491\b|pnp|fsw|cec)/i.test(countryLabel + " " + route);
  const codeLabel = /australia|189|190|491/i.test(countryLabel + " " + route) ? "ANZSCO"
    : /canada|express entry|pnp|fsw|cec/i.test(countryLabel + " " + route) ? "NOC / TEER" : "Occupation code";

  const profileCards: PersonalisedRow[] = [
    { label: "Selected route", value: route, note: countryLabel + " · " + (dossier?.vertical ?? family) },
  ];
  if (occupation || occupationCode) profileCards.push({ label: "Occupation", value: [occupation, occupationCode ? codeLabel + " " + occupationCode : ""].filter(Boolean).join(" · "), note: assessingBody ? "Assessing authority: " + assessingBody : "Matched to the selected programme." });
  if (education) profileCards.push({ label: "Qualification", value: education, note: text(a.educationDetails) || "Qualification basis recorded in the assessment." });
  if (years !== undefined || text(a.occupationDetails)) profileCards.push({ label: "Experience", value: years === undefined ? text(a.occupationDetails) : years + " years", note: "Experience basis recorded in the assessment." });
  if (language) profileCards.push({ label: "Language evidence", value: language, note: "Language result recorded in the assessment." });
  const recordedOutcome = points === undefined ? text(a.eligibilityAssessment) || text(a.recordedPointsAssessment) || assessment : points + " points";
  if (recordedOutcome) profileCards.push({ label: pointsBased ? "Recorded points" : "Assessment outcome", value: recordedOutcome, note: text(a.recordedPointsAssessment) || "Recorded route assessment." });

  const strengths: string[] = [];
  if (occupation) strengths.push(occupation + (occupationCode ? " (" + codeLabel + " " + occupationCode + ")" : "") + " is the nominated occupational profile.");
  if (education) strengths.push(education + " is the recorded qualification basis.");
  if (years !== undefined) strengths.push(years + " years of experience are recorded for route assessment.");
  if (language) strengths.push(language + " is the recorded language evidence.");
  if (assessment) strengths.push(assessment + " is the recorded professional-assessment position.");
  if (points !== undefined) strengths.push("The current assessment records " + points + " points.");
  if (!strengths.length) strengths.push("The selected programme dossier provides the assessment framework.");

  const profileFor = (requirement: string) => {
    const value = requirement.toLowerCase();
    if (/occupation|profession|employment|experience|job/.test(value)) return [occupation, years === undefined ? "" : years + " years"].filter(Boolean).join(" · ");
    if (/education|qualification|degree|academic/.test(value)) return education || "";
    if (/language|english|french|ielts|pte|celpip/.test(value)) return language;
    if (/fund|invest|asset|net worth/.test(value)) return availableFunds === undefined && !sourceOfFunds ? "" : [availableFunds === undefined ? "" : money(availableFunds), sourceOfFunds].filter(Boolean).join(" · ");
    if (/family|spouse|dependant/.test(value)) return familyDetails || dependants + " dependant(s)";
    if (/assessment|authority|licen|recognition/.test(value)) return [assessingBody, assessment].filter(Boolean).join(" · ");
    return text(a.eligibilityAssessment);
  };
  const defaultRequirements = ["Identity and programme eligibility"];
  if (["skilled", "employer"].includes(family)) defaultRequirements.push("Occupation and professional eligibility", "Qualification", "Relevant experience", "Language requirement");
  if (["investment", "corporate"].includes(family)) defaultRequirements.push("Investment capacity and source of funds", "Business or management profile");
  defaultRequirements.push("Supporting documents");
  const requirements = (dossier?.requirements?.length ? dossier.requirements : defaultRequirements).slice(0, 8);
  const eligibilityRows: PersonalisedStatusRow[] = requirements.map((requirement) => {
    const profile = profileFor(requirement);
    const status = profile ? "Recorded - review current rule" : "Action required";
    return { requirement, profile: profile || "Complete the applicable assessment information", evidence: "Provide evidence that this requirement is met.", status, tone: statusTone(status) };
  });

  const assumptionRows: string[][] = [
    ["Destination and route", countryLabel + " · " + route, "Confirm the exact stream and current intake conditions"],
  ];
  if (objective) assumptionRows.push(["Client objective", objective, "Confirm that the route supports the intended outcome"]);
  if (occupation || occupationCode) assumptionRows.push(["Occupation / activity", [occupation, occupationCode].filter(Boolean).join(" · "), "Match duties, activity and code to the programme"]);
  if (education) assumptionRows.push(["Qualification", education, "Confirm recognition and documentary evidence"]);
  if (years !== undefined || text(a.occupationDetails)) assumptionRows.push(["Experience", years === undefined ? text(a.occupationDetails) : years + " years", "Confirm qualifying dates and evidence"]);
  if (language) assumptionRows.push(["Language", language, "Confirm test acceptance and validity where required"]);
  if (assessingBody || assessment) assumptionRows.push(["Assessment authority", [assessingBody, assessment].filter(Boolean).join(" · "), "Confirm the authority and result where required"]);
  assumptionRows.push(["Family scope", familyIncluded ? "Family included · " + dependants + " dependant(s)" : "Primary applicant", "Confirm all family details"]);

  const checklist = (dossier?.documentChecklist ?? []).flatMap((group) => group.documents ?? []).slice(0, 9);
  const evidenceLabels = checklist.length ? checklist : ["Identity and civil records", "Qualification evidence", "Employment or business evidence", "Language evidence", "Programme-specific forms"];
  const evidenceRows = evidenceLabels.map((label) => [label, "Prepare evidence for " + label, "Client and issuing authority", documentStatus(documents, label)]);

  const riskRows: string[][] = [];
  if (!occupation && ["skilled", "employer"].includes(family)) riskRows.push(["Occupation is incomplete", "Complete the occupation and applicable code", "Before final report approval"]);
  if (!education && family === "skilled") riskRows.push(["Qualification information is incomplete", "Complete the qualification and recognition basis", "Before final report approval"]);
  if (!language && pointsBased) riskRows.push(["Language evidence is incomplete", "Record the accepted test and component results", "Before points sign-off"]);
  if (!assessingBody && ["skilled", "employer"].includes(family)) riskRows.push(["Assessing authority is not recorded", "Confirm the applicable authority", "Before application planning"]);
  if (!documents.length) riskRows.push(["Supporting documents are not yet inventoried", "Upload and classify route evidence", "Before final report delivery"]);
  for (const item of fact(clientCase.advisor.customRisks) ?? []) riskRows.push([item, "Apply the recorded mitigation", "Before final report delivery"]);
  for (const item of (dossier?.riskNotes ?? []).slice(0, 3)) riskRows.push([item, "Confirm the current rule and evidence response", "Before application"]);
  if (!riskRows.length) riskRows.push(["Programme rules and intake conditions may change", "Reconfirm requirements before filing", "Before application"]);

  const dossierFees = [...(dossier?.governmentFees ?? []), ...(dossier?.prices ?? [])];
  const suppliedFees = answerFees(a.feeItems);
  const financialCards: PersonalisedRow[] = [];
  if (dossier?.minInvestment !== undefined) financialCards.push({ label: "Programme investment / threshold", value: money(dossier.minInvestment, dossier.currency || "USD"), note: "Confirm the dated amount before payment." });
  if (availableFunds !== undefined || sourceOfFunds) financialCards.push({ label: "Available funds", value: availableFunds === undefined ? sourceOfFunds || "" : money(availableFunds), note: sourceOfFunds || "Funds recorded in the assessment." });
  financialCards.push(...suppliedFees.slice(0, 4).map((fee) => ({
    label: fee.label,
    value: money(fee.amount, fee.currency),
    note: [fee.appliesTo, fee.verifiedDate ? "Checked " + fee.verifiedDate : "", fee.source].filter(Boolean).join(" - ") || "Reconfirm before payment.",
  })));
  const suppliedLabels = new Set(suppliedFees.map((fee) => fee.label.toLowerCase()));
  const usableDossierFees = !suppliedFees.length || dossier?.feeCoverage?.status === "verified" ? dossierFees : [];
  financialCards.push(...usableDossierFees.filter((fee) => !suppliedLabels.has((fee.label || "").toLowerCase())).slice(0, Math.max(0, 4 - suppliedFees.length)).map((fee) => ({
    label: fee.label || "Programme cost",
    value: money(fee.amount, fee.currency || dossier?.currency || "USD"),
    note: [fee.status === "verified" ? "Verified" : fee.status === "website_estimate" ? "Website estimate - recheck" : "", fee.checkedAt ? "checked " + fee.checkedAt : "", fee.sourceLabel, fee.when, fee.notes].filter(Boolean).join(" - ") || "Confirm the current amount.",
  })));
  if (!financialCards.length) financialCards.push({ label: "Programme cost schedule", value: "No source-backed amount loaded", note: dossier?.feeCoverage?.note || "Confirm the current authority schedule before client delivery or payment." });
  const financialSteps = [
    { title: "Confirm current programme charges", body: "Recheck government, assessing-authority and third-party charges. XIPHIAS professional fees appear only when a client quotation supplies them." },
    { title: "Separate fees from required funds", body: "Do not describe proof of funds or investment capital as a professional fee." },
    { title: "Plan the payment sequence", body: "Match payments and funds to the " + timelineMonths + "-month working timeline." },
    { title: "Retain source evidence", body: sourceOfFunds ? "Maintain evidence for: " + sourceOfFunds + "." : "Record and evidence the source of funds where applicable." },
  ];

  const familyCards: PersonalisedRow[] = [
    { label: "Application scope", value: familyIncluded ? "Family included" : "Primary applicant", note: dependants + " dependant(s) recorded." },
  ];
  if (familyDetails) familyCards.push({ label: "Family details", value: familyDetails, note: "Civil-status scope recorded in the assessment." });
  if (nationality) familyCards.push({ label: "Nationality", value: nationality, note: "Used for programme and documentary planning." });
  if (residence) familyCards.push({ label: "Current residence", value: residence, note: "Used for police, identity and filing logistics." });
  const familyActions = ["Confirm accompanying and non-accompanying family members.", "Prepare passports and civil-status records.", "Check dependant ages and relationship rules.", "Plan medical, police, biometric and relocation requirements."];

  const scenarioCards: PersonalisedRow[] = [
    { label: "Primary route", value: route, note: countryLabel + " · selected assessment route" },
    ...alternatives.slice(0, 2).map((item) => ({ label: "Approved alternative", value: item, note: "Assess independently against its own rules." })),
  ];
  while (scenarioCards.length < 3) scenarioCards.push({ label: "Fallback control", value: "Reassess if a material fact changes", note: "Do not substitute a route without a fresh assessment." });
  const triggerRows = [
    ["Country or programme changes", "Rebuild the report using the new programme dossier", "Assessment team"],
    ["Occupation, education or experience changes", "Reassess eligibility and evidence", "Client + assessment team"],
    ["Language or professional result changes", "Update the outcome and any score", "Client + assessment team"],
    ["Family composition changes", "Recalculate documents, costs and eligibility", "Client + assessment team"],
    ["Funds or business position changes", "Rebuild the financial plan", "Client + assessment team"],
    ["Programme rules or fees change", "Generate a new version", "Assessment team"],
  ];

  const process = (dossier?.processSteps ?? []).slice(0, 6);
  const milestoneRows = process.length ? process.map((step, index) => ["Stage " + (index + 1), step.title || "Programme stage", step.description || "Complete the current requirement."]) : [
    ["Stage 1", "Confirm profile", "Lock the selected route and client facts."],
    ["Stage 2", "Collect evidence", "Complete the programme-specific checklist."],
    ["Stage 3", "Authority assessment", "Complete language, professional or nomination requirements."],
    ["Stage 4", "Application preparation", "Prepare, verify and approve the filing package."],
    ["Stage 5", "Submission and follow-up", "Submit correctly and track requests and deadlines."],
  ];
  const roadmapSteps = milestoneRows.slice(0, 5).map((row) => ({ title: row[1], body: row[2] }));
  const advisorQuestions = [
    "Does the recorded profile meet every mandatory requirement for " + route + "?",
    occupation ? "Does " + occupation + (occupationCode ? " (" + codeLabel + " " + occupationCode + ")" : "") + " match the route and supporting duties?" : "Is an occupation classification required?",
    assessingBody ? "What evidence and validity conditions apply to " + assessingBody + "?" : "Is a professional assessment required?",
    "Which fees, government charges and required funds apply to this client?",
    "Which missing document creates the greatest risk?",
    alternatives.length ? "When should " + alternatives[0] + " be reconsidered?" : "What fallback should be assessed if the primary route changes?",
  ];
  const closingSummary = name + "'s report is built for " + route + " in " + countryLabel + (occupation ? ", using the recorded " + occupation + " profile" : "") + ". Its requirements, evidence plan, costs and next steps are selected from that programme and the CRM assessment.";

  return { profileCards, strengths: strengths.slice(0, 7), eligibilityRows, assumptionRows, evidenceRows, riskRows: riskRows.slice(0, 8), financialCards, financialSteps, familyCards, familyActions, scenarioCards: scenarioCards.slice(0, 3), triggerRows, milestoneRows, roadmapSteps, advisorQuestions, closingSummary };
}
