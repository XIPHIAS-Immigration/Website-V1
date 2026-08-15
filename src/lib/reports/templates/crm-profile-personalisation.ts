import type { ClientCase, ClientDocument } from "../client-case";
import type { Dossier } from "../programme";

type Answers = Record<string, unknown>;

export type PersonalisedRow = {
  label: string;
  value: string;
  note?: string;
};

export type PersonalisedStatusRow = {
  requirement: string;
  profile: string;
  evidence: string;
  status: string;
  tone: "good" | "warn" | "muted";
};

export type CrmProfilePersonalisation = {
  profileCards: PersonalisedRow[];
  strengths: string[];
  eligibilityRows: PersonalisedStatusRow[];
  assumptionRows: string[][];
  evidenceRows: string[][];
  riskRows: string[][];
  financialCards: PersonalisedRow[];
  financialSteps: Array<{ title: string; body: string }>;
  familyCards: PersonalisedRow[];
  familyActions: string[];
  scenarioCards: PersonalisedRow[];
  triggerRows: string[][];
  milestoneRows: string[][];
  roadmapSteps: Array<{ title: string; body: string }>;
  advisorQuestions: string[];
  closingSummary: string;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function number(value: unknown): number | undefined {
  if (value === "" || value == null) return undefined;
  const parsed = Number(text(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function fact<T>(value: { value?: T } | undefined): T | undefined {
  return value?.value;
}

function pointsLabel(value: number | undefined): string {
  return value === undefined ? "Not recorded" : `${value} point${value === 1 ? "" : "s"}`;
}

function noneLike(value: string): boolean {
  return /^(?:no|none|nil|n\/a|not applicable|no declaration recorded|none confirmed by client)[.!\s]*$/i.test(value.trim());
}

function money(value: number | undefined): string {
  return value === undefined ? "Not recorded" : `USD ${Math.round(value).toLocaleString("en-US")}`;
}

function documentStatus(documents: ClientDocument[], pattern: RegExp): string {
  const matches = documents.filter((document) => pattern.test(document.name));
  if (!matches.length) return "To collect";
  if (matches.some((document) => document.status === "verified")) return "Verified document recorded";
  if (matches.some((document) => ["uploaded", "available"].includes(document.status))) return "Available for review";
  if (matches.some((document) => ["expired", "rejected"].includes(document.status))) return "Replace or correct";
  return "Collection in progress";
}

function evidenceTone(status: string): PersonalisedStatusRow["tone"] {
  if (/verified|recorded|available/i.test(status)) return "good";
  if (/not recorded|to collect|confirm|replace|complete/i.test(status)) return "warn";
  return "muted";
}

function addRisk(rows: string[][], risk: string, control: string, gate: string): void {
  if (!rows.some((row) => row[0] === risk)) rows.push([risk, control, gate]);
}

export function buildCrmProfilePersonalisation(args: {
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
  const currentCountry = fact(clientCase.identity.currentCountry);
  const maritalStatus = fact(clientCase.identity.maritalStatus);
  const occupation = fact(clientCase.career.occupation);
  const occupationCode = fact(clientCase.career.anzscoCode) || text(a.occupationCode);
  const education = fact(clientCase.career.education);
  const yearsExperience = fact(clientCase.career.yearsExperience);
  const languageTest = fact(clientCase.career.languageTest);
  const languageScore = fact(clientCase.career.languageScore);
  const languageDetails = fact(clientCase.career.languageDetails);
  const skillsAssessment = fact(clientCase.career.skillsAssessment);
  const assessingBody = fact(clientCase.career.assessingBody);
  const professionalRecognition = fact(clientCase.career.professionalRecognition);
  const employer = fact(clientCase.career.employerOrBusiness);
  const familyIncluded = fact(clientCase.family.included);
  const dependants = fact(clientCase.family.dependants);
  const budget = fact(clientCase.finances.budgetUsd);
  const availableFunds = fact(clientCase.finances.availableFundsUsd);
  const sourceOfFunds = fact(clientCase.finances.sourceOfFunds);
  const currentStatus = fact(clientCase.immigration.currentStatus);
  const history = fact(clientCase.immigration.history);
  const refusals = fact(clientCase.immigration.refusals);
  const medical = fact(clientCase.immigration.medicalNotes);
  const character = fact(clientCase.immigration.characterNotes);
  const total = number(a.claimedPointsTotal) ?? fact(clientCase.career.claimedPointsTotal);
  const point = (key: string): number | undefined => number(a[key]);
  const agePoints = point("agePoints");
  const englishPoints = point("englishPoints");
  const overseasPoints = point("overseasExperiencePoints");
  const australianPoints = point("australianExperiencePoints");
  const professionalYearPoints = point("professionalYearPoints");
  const qualificationPoints = point("qualificationPoints");
  const australianStudyPoints = point("australianStudyPoints");
  const regionalStudyPoints = point("regionalStudyPoints");
  const stateNominationPoints = point("stateNominationPoints");
  const regionalSponsorshipPoints = point("regionalSponsorshipPoints");
  const partnerPoints = point("partnerPoints");
  const communityLanguagePoints = point("communityLanguagePoints");
  const basePoints = total === undefined
    ? undefined
    : Math.max(0, total - (stateNominationPoints ?? 0) - (regionalSponsorshipPoints ?? 0));
  const selectedProgrammes = fact(clientCase.objective.selectedProgrammes) ?? [];
  const selectedText = selectedProgrammes.join(" | ") || route;
  const documents = clientCase.documents ?? [];

  const profileCards: PersonalisedRow[] = [
    { label: "Occupation", value: [occupation, occupationCode].filter(Boolean).join(" · ") || "Not recorded", note: assessingBody ? `Assessment pathway: ${assessingBody}` : "Confirm the relevant assessing authority." },
    { label: "Qualification", value: education || "Not recorded", note: `Points recorded: ${pointsLabel(qualificationPoints)}` },
    { label: "Skilled employment", value: yearsExperience === undefined ? "Not recorded" : `${yearsExperience} years`, note: `${employer ? `${employer} · ` : ""}Overseas ${pointsLabel(overseasPoints)} · Australian ${pointsLabel(australianPoints)}` },
    { label: "English", value: [languageTest, languageScore === undefined ? "" : String(languageScore), languageDetails].filter(Boolean).join(" · ") || "Not recorded", note: `Points recorded: ${pointsLabel(englishPoints)}` },
    { label: "Skills assessment", value: skillsAssessment || "Not recorded", note: professionalRecognition || (assessingBody ? `Relevant authority: ${assessingBody}` : "Record the assessment pathway and status.") },
    { label: "Points position", value: total === undefined ? "Not recorded" : `${total} total points`, note: basePoints === undefined ? selectedText : `Base score ${basePoints}; selected pathways: ${selectedText}` },
  ];

  const strengths: string[] = [];
  if (age !== undefined) strengths.push(`Age ${age}: ${pointsLabel(agePoints)} recorded.`);
  if (education) strengths.push(`${education}: ${pointsLabel(qualificationPoints)} recorded for qualification.`);
  if (yearsExperience !== undefined) strengths.push(`${yearsExperience} years of skilled employment: ${pointsLabel(overseasPoints)} overseas and ${pointsLabel(australianPoints)} Australian.`);
  if (languageTest || languageDetails) strengths.push(`${[languageTest, languageDetails].filter(Boolean).join(" — ")}: ${pointsLabel(englishPoints)} recorded.`);
  if (stateNominationPoints && stateNominationPoints > 0) strengths.push(`State nomination contributes ${stateNominationPoints} points to the nominated pathway.`);
  if (regionalSponsorshipPoints && regionalSponsorshipPoints > 0) strengths.push(`Regional nomination or sponsorship contributes ${regionalSponsorshipPoints} points.`);
  if (professionalYearPoints && professionalYearPoints > 0) strengths.push(`Australian professional year contributes ${professionalYearPoints} points.`);
  if (australianStudyPoints && australianStudyPoints > 0) strengths.push(`Australian study contributes ${australianStudyPoints} points.`);
  if (regionalStudyPoints && regionalStudyPoints > 0) strengths.push(`Regional Australian study contributes ${regionalStudyPoints} points.`);
  if (partnerPoints && partnerPoints > 0) strengths.push(`Partner profile contributes ${partnerPoints} points.`);
  if (communityLanguagePoints && communityLanguagePoints > 0) strengths.push(`Community-language credential contributes ${communityLanguagePoints} points.`);
  if (!strengths.length) strengths.push("The selected programme dossier defines the requirements; profile evidence must now be completed against each criterion.");

  const eligibilityRows: PersonalisedStatusRow[] = [];
  const addEligibility = (requirement: string, profile: string, evidence: string, status: string) => eligibilityRows.push({ requirement, profile, evidence, status, tone: evidenceTone(status) });
  addEligibility("Nominated occupation", [occupation, occupationCode].filter(Boolean).join(" · ") || "Not recorded", "Occupation duties, CV and role evidence aligned to the nominated code", occupation && occupationCode ? "Recorded" : "Complete profile");
  addEligibility("Skills assessment", [assessingBody, skillsAssessment].filter(Boolean).join(" · ") || "Not recorded", "Authority-specific application, qualification and employment evidence", documentStatus(documents, /skill|assessment|acs|cpa|vetassess|engineer/i));
  addEligibility("Qualification", `${education || "Not recorded"} · ${pointsLabel(qualificationPoints)}`, "Award certificate, transcripts and completion evidence", documentStatus(documents, /degree|qualification|education|academic|transcript|certificate|mark/i));
  addEligibility("Skilled employment", `${yearsExperience === undefined ? "Not recorded" : `${yearsExperience} years`}${employer ? ` · ${employer}` : ""} · overseas ${pointsLabel(overseasPoints)} · Australian ${pointsLabel(australianPoints)}`, "Detailed references, contracts, payslips, tax and bank evidence for claimed periods", documentStatus(documents, /employment|experience|reference|payslip|salary|tax|contract/i));
  addEligibility("English", `${[languageTest, languageScore === undefined ? "" : String(languageScore), languageDetails].filter(Boolean).join(" · ") || "Not recorded"} · ${pointsLabel(englishPoints)}`, "Accepted test report with component scores and validity date", documentStatus(documents, /ielts|pte|oet|toefl|english|language/i));
  if (stateNominationPoints !== undefined || regionalSponsorshipPoints !== undefined) addEligibility("Nomination pathway", `State ${pointsLabel(stateNominationPoints)} · regional ${pointsLabel(regionalSponsorshipPoints)}`, "Current state or regional criteria, commitment evidence and nomination outcome", stateNominationPoints || regionalSponsorshipPoints ? "Pathway selected" : "Not relied upon");
  if (partnerPoints !== undefined || familyIncluded || (dependants ?? 0) > 0) addEligibility("Partner and family", `${maritalStatus || "Status not recorded"} · ${dependants ?? 0} dependant(s) · ${pointsLabel(partnerPoints)}`, "Identity, relationship, partner skills/English and dependant civil records as applicable", documentStatus(documents, /marriage|spouse|partner|birth|dependant|family/i));

  const assumptionRows: string[][] = [
    ["Age and age points", age === undefined ? "Not recorded" : `${age} years · ${pointsLabel(agePoints)}`, "Recalculate if age changes before invitation"],
    ["Nominated occupation", [occupation, occupationCode].filter(Boolean).join(" · ") || "Not recorded", "Confirm duties align with the nominated occupation"],
    ["Qualification", `${education || "Not recorded"} · ${pointsLabel(qualificationPoints)}`, "Confirm comparability and assessing-body requirements"],
    ["Skilled employment", `${yearsExperience === undefined ? "Not recorded" : `${yearsExperience} years`}${employer ? ` · ${employer}` : ""} · ${pointsLabel(overseasPoints)} overseas`, "Confirm exact eligible dates and supporting evidence"],
    ["English", `${[languageTest, languageDetails].filter(Boolean).join(" · ") || "Not recorded"} · ${pointsLabel(englishPoints)}`, "Confirm an accepted test, component scores and validity"],
    ["Skills assessment", [assessingBody, skillsAssessment].filter(Boolean).join(" · ") || "Not recorded", "Confirm the applicable pathway and outcome"],
    ["Points total", total === undefined ? "Not recorded" : `${total} points`, "Recalculate whenever any points factor changes"],
    ["Family scope", `${maritalStatus || "Status not recorded"} · ${familyIncluded ? "family included" : "primary applicant"} · ${dependants ?? 0} dependant(s)`, "Confirm partner claims and accompanying family members"],
  ];

  const evidenceRows = eligibilityRows.map((row) => [row.requirement, row.evidence, "Client + issuing authority", row.status]);
  if (professionalRecognition) evidenceRows.push(["Professional recognition / RPL", professionalRecognition, "Client + assessing authority", documentStatus(documents, /rpl|recognition|washington|professional/i)]);
  if (history || currentStatus) evidenceRows.push(["Immigration history", [currentStatus, history].filter(Boolean).join(" · "), "Client + government records", documentStatus(documents, /visa|immigration|permit|status/i)]);

  const riskRows: string[][] = [];
  if (total !== undefined && total < 65) addRisk(riskRows, `Recorded total is ${total}, below the 65-point threshold`, "Identify legitimate additional points or reassess the pathway", "Before EOI preparation");
  if (!occupation || !occupationCode) addRisk(riskRows, "Occupation or occupation code is incomplete", "Confirm the nominated occupation and align duties before assessment", "Before skills assessment");
  if (!assessingBody || !skillsAssessment) addRisk(riskRows, "Skills-assessment pathway is incomplete", "Confirm the authority, pathway and required evidence", "Before EOI preparation");
  if (qualificationPoints && !education) addRisk(riskRows, `${qualificationPoints} qualification points are recorded without a qualification description`, "Record the award and verify it against the assessing-body criteria", "Before points sign-off");
  if (overseasPoints && yearsExperience === undefined) addRisk(riskRows, `${overseasPoints} overseas-employment points are recorded without the experience period`, "Record exact dates and reconcile them to employment evidence", "Before points sign-off");
  if (englishPoints && !languageDetails) addRisk(riskRows, `${englishPoints} English points are recorded without component-level results`, "Record the accepted test, component scores and validity date", "Before points sign-off");
  if (/\bCLB\b/i.test([languageTest, languageDetails].filter(Boolean).join(" ")) && /australia/i.test(countryLabel)) addRisk(riskRows, "The profile uses CLB terminology for an Australian pathway", "Record the underlying accepted English test and component scores used for Australian points", "Before points sign-off");
  if (documents.length === 0) addRisk(riskRows, "No assessment document inventory is attached to the report snapshot", "Upload and classify qualification, employment, English and identity evidence", "Before report approval");
  if (refusals && !noneLike(refusals)) addRisk(riskRows, `Immigration history requires review: ${refusals}`, "Obtain decision records and prepare a complete disclosure and response", "Before filing strategy approval");
  if (medical && !noneLike(medical)) addRisk(riskRows, `Medical declaration requires review: ${medical}`, "Confirm the applicable health evidence and disclosure requirements", "Before filing");
  if (character && !noneLike(character)) addRisk(riskRows, `Character declaration requires review: ${character}`, "Confirm police-clearance and disclosure requirements", "Before filing");
  for (const customRisk of fact(clientCase.advisor.customRisks) ?? []) addRisk(riskRows, customRisk, "Apply the adviser-recorded mitigation and retain supporting evidence", "Before report approval");
  if (!riskRows.length) addRisk(riskRows, "Points and occupation settings may change before invitation", "Recheck the current invitation and nomination settings before submission", "Before EOI submission");

  const financialCards: PersonalisedRow[] = [
    { label: "Recorded planning budget", value: money(budget), note: budget === undefined ? "Complete only when the client has confirmed an amount." : `Plan against the ${timelineMonths}-month strategy window.` },
    { label: "Available funds", value: money(availableFunds), note: availableFunds === undefined ? "Record only confirmed accessible funds." : "Keep application funds separate from contingency reserves." },
    { label: "Source of funds", value: sourceOfFunds || "Not recorded", note: "Use a consistent bank, income, tax or asset trail where funds evidence is required." },
    { label: "Programme cost basis", value: dossier?.minInvestment ? `${dossier.currency || "USD"} ${dossier.minInvestment.toLocaleString("en-US")}` : "Obtain current quotation", note: "Include assessing-body, English-test, government, medical, police and professional costs." },
  ];
  const financialSteps = [
    { title: "Confirm the cost schedule", body: `Price the ${assessingBody || "skills-assessment"} stage, English evidence, nomination and visa application separately.` },
    { title: "Match funds to the timeline", body: budget === undefined ? "Record the client's confirmed budget before committing to paid stages." : `Sequence the recorded ${money(budget)} budget across the ${timelineMonths}-month plan.` },
    { title: "Evidence the source", body: sourceOfFunds ? `Build the evidence trail for the recorded source: ${sourceOfFunds}.` : "Record the source of funds if the selected pathway or family plan requires financial evidence." },
    { title: "Protect contingency", body: "Keep relocation, repeat-test, re-assessment and timing contingencies outside committed fees." },
  ];

  const familyCards: PersonalisedRow[] = [
    { label: "Marital status", value: maritalStatus || "Not recorded", note: partnerPoints === undefined ? "No partner-points value recorded." : `${pointsLabel(partnerPoints)} recorded for partner factors.` },
    { label: "Application scope", value: familyIncluded ? "Family included" : "Primary applicant", note: `${dependants ?? 0} dependant(s) recorded.` },
    { label: "Current location", value: [currentCountry, nationality].filter(Boolean).join(" · ") || "Not recorded", note: "Use location and nationality to plan civil, police and identity records." },
    { label: "Current immigration status", value: currentStatus || "Not recorded", note: history || "Record material visa history before filing." },
  ];
  const familyActions = [
    familyIncluded || (dependants ?? 0) > 0 ? `Prepare identity and civil-status records for ${dependants ?? 0} dependant(s).` : "Confirm whether any partner or dependant will be added before filing.",
    partnerPoints && partnerPoints > 0 ? `Support the ${partnerPoints}-point partner claim with the required skills or English evidence.` : "Do not include partner points unless the corresponding evidence and criteria are satisfied.",
    maritalStatus ? `Keep all forms consistent with the recorded marital status: ${maritalStatus}.` : "Record and verify marital status.",
    "Confirm passport validity, names, birth records and relationship evidence for every included applicant.",
    "Plan medicals, police clearances, biometrics, schooling and work rights for the actual family composition.",
  ];

  const scenarioCards: PersonalisedRow[] = [];
  if (basePoints !== undefined && selectedText.match(/189/i)) scenarioCards.push({ label: "Subclass 189", value: `${basePoints} points`, note: "Base points without state or regional nomination points." });
  if (basePoints !== undefined && selectedText.match(/190/i)) scenarioCards.push({ label: "Subclass 190", value: `${basePoints + (stateNominationPoints ?? 0)} points`, note: `${pointsLabel(stateNominationPoints)} from state nomination recorded.` });
  if (basePoints !== undefined && selectedText.match(/491/i)) scenarioCards.push({ label: "Subclass 491", value: `${basePoints + (regionalSponsorshipPoints ?? 0)} points`, note: `${pointsLabel(regionalSponsorshipPoints)} from regional nomination or sponsorship recorded.` });
  if (!scenarioCards.length) scenarioCards.push({ label: "Primary scenario", value: route, note: total === undefined ? "Complete the route score." : `${total} points recorded.` });
  for (const fallback of (fact(clientCase.objective.fallbackProgrammes) ?? []).slice(0, 2)) scenarioCards.push({ label: "Recorded fallback", value: fallback, note: "Reassess this route using its own current criteria." });
  while (scenarioCards.length < 3) scenarioCards.push({ label: scenarioCards.length === 1 ? "Alternative scenario" : "Second fallback", value: "Reassess after profile change", note: "Use only after recalculating points, evidence, timing and family impact." });

  const triggerRows: string[][] = [
    ["English result or validity changes", `Recalculate the current ${pointsLabel(englishPoints)} English contribution`, "Client + adviser"],
    ["Eligible employment period changes", `Recalculate overseas ${pointsLabel(overseasPoints)} and Australian ${pointsLabel(australianPoints)}`, "Client + assessing authority"],
    ["Qualification assessment changes", `Reconfirm the current ${pointsLabel(qualificationPoints)} qualification contribution`, "Assessing authority"],
    ["State or regional nomination changes", `Remove or replace the recorded ${pointsLabel((stateNominationPoints ?? 0) + (regionalSponsorshipPoints ?? 0))}`, "Adviser"],
    ["Partner or family circumstances change", `Recalculate partner ${pointsLabel(partnerPoints)} and update family evidence`, "Client + adviser"],
    ["Australian study, regional study or professional year changes", `Recalculate the recorded ${pointsLabel((australianStudyPoints ?? 0) + (regionalStudyPoints ?? 0) + (professionalYearPoints ?? 0))}`, "Client + adviser"],
  ];

  const qualificationTask = education ? `Verify ${education} documents and comparability for ${assessingBody || route}.` : "Record the qualification and obtain award and transcript evidence.";
  const employmentTask = yearsExperience === undefined ? "Record exact skilled-employment dates and duties." : `Evidence the claimed ${yearsExperience} years${employer ? ` with ${employer}` : ""} using detailed references and corroborating records.`;
  const englishTask = languageTest || languageDetails ? `Validate ${[languageTest, languageDetails].filter(Boolean).join(" — ")} and its points effect.` : "Obtain or record an accepted English test with component scores.";
  const assessmentTask = `Complete the ${assessingBody || "relevant assessing authority"} pathway for ${[occupation, occupationCode].filter(Boolean).join(" · ") || "the nominated occupation"}.`;
  const milestoneRows: string[][] = [
    ["Weeks 1-2", "Profile lock", `Confirm occupation, ${total === undefined ? "points total" : `${total}-point total`}, selected pathways and family scope.`],
    ["Weeks 1-4", "Qualification", qualificationTask],
    ["Weeks 1-6", "Employment", employmentTask],
    ["Weeks 1-8", "English", englishTask],
    ["Months 2-4", "Skills assessment", assessmentTask],
    ["Months 4+", "EOI and nomination", `Recalculate the final points and progress ${selectedText} only after the evidence set is consistent.`],
  ];
  const roadmapSteps = [
    { title: "Lock the points calculation", body: `Reconcile every factor contributing to the recorded ${total === undefined ? "points total" : `${total} points`} with dated evidence.` },
    { title: "Complete qualification evidence", body: qualificationTask },
    { title: "Complete employment evidence", body: employmentTask },
    { title: "Close English and skills-assessment requirements", body: `${englishTask} ${assessmentTask}` },
    { title: "Prepare the selected pathway", body: `Use the confirmed evidence and final points calculation for ${selectedText}; reassess immediately if any material fact changes.` },
  ];

  const advisorQuestions = [
    `Does ${occupation || "the nominated occupation"}${occupationCode ? ` (${occupationCode})` : ""} align with the documented duties and ${assessingBody || "assessing-authority"} pathway?`,
    `How will ${education || "the recorded qualification"} be assessed, and what evidence is required to retain ${pointsLabel(qualificationPoints)}?`,
    `Which periods from the recorded ${yearsExperience === undefined ? "employment history" : `${yearsExperience} years of experience`} qualify for ${pointsLabel(overseasPoints)} overseas-employment points?`,
    `Does the recorded English evidence support ${pointsLabel(englishPoints)}, and when does it expire?`,
    `What is the confirmed score for each selected pathway after nomination and partner factors are separated?`,
    familyIncluded || (dependants ?? 0) > 0 ? `How will ${dependants ?? 0} dependant(s) affect documents, cost and timing?` : "Could a partner or dependant be added later, and what would change?",
  ];

  const profileCore = [
    occupation ? `${occupation}${occupationCode ? ` (${occupationCode})` : ""}` : "the nominated occupation",
    education || "the recorded qualification",
    yearsExperience === undefined ? "the recorded employment history" : `${yearsExperience} years of experience`,
    total === undefined ? "the final points calculation" : `${total} points`,
  ];
  const closingSummary = `${name}'s ${route} strategy is built around ${profileCore.join(", ")}. Progress the application only through the profile-specific qualification, employment, English, skills-assessment${familyIncluded || (dependants ?? 0) > 0 ? ", family" : ""} and nomination actions set out in this report.`;

  return {
    profileCards,
    strengths: strengths.slice(0, 7),
    eligibilityRows: eligibilityRows.slice(0, 8),
    assumptionRows,
    evidenceRows: evidenceRows.slice(0, 9),
    riskRows: riskRows.slice(0, 8),
    financialCards,
    financialSteps,
    familyCards,
    familyActions,
    scenarioCards: scenarioCards.slice(0, 3),
    triggerRows,
    milestoneRows,
    roadmapSteps,
    advisorQuestions,
    closingSummary,
  };
}
