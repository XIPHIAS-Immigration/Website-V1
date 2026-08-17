export const AUSTRALIA_RULE_SET = "AU-GSM-2026-08-17";

export type AustraliaPointsInput = Record<string, unknown>;

export type AustraliaPointsResult = {
  ok: boolean;
  errors: string[];
  values?: Record<string, string | number | boolean>;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function date(value: unknown): Date | undefined {
  const raw = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  const parsed = new Date(`${raw}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function ageOn(dob: Date, testDate: Date): number {
  let age = testDate.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday = testDate.getUTCMonth() < dob.getUTCMonth()
    || (testDate.getUTCMonth() === dob.getUTCMonth() && testDate.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export function australiaAgePoints(age: number): number {
  if (age >= 18 && age < 25) return 25;
  if (age >= 25 && age < 33) return 30;
  if (age >= 33 && age < 40) return 25;
  if (age >= 40 && age < 45) return 15;
  return 0;
}

export function australiaOverseasExperiencePoints(months: number): number {
  if (months >= 96) return 15;
  if (months >= 60) return 10;
  if (months >= 36) return 5;
  return 0;
}

export function australiaLocalExperiencePoints(months: number): number {
  if (months >= 96) return 20;
  if (months >= 60) return 15;
  if (months >= 36) return 10;
  if (months >= 12) return 5;
  return 0;
}

export function calculateAustraliaPoints(input: AustraliaPointsInput): AustraliaPointsResult {
  const errors: string[] = [];
  const subclass = text(input.visaSubclass);
  if (!["189", "190", "491"].includes(subclass)) errors.push("Visa subclass must be 189, 190 or 491.");

  const dob = date(input.dateOfBirth);
  const testDate = date(input.pointsTestDate);
  if (!dob) errors.push("A valid date of birth is required.");
  if (!testDate) errors.push("A valid points calculation date is required.");
  if (dob && testDate && dob > testDate) errors.push("Date of birth cannot be after the points calculation date.");

  if (text(input.languageTest).toUpperCase() !== "IELTS")
    errors.push("The verified automatic calculator currently supports IELTS only.");
  const components = [input.languageListening, input.languageReading, input.languageWriting, input.languageSpeaking].map(number);
  if (components.some((value) => value === undefined)) errors.push("All four IELTS component scores are required.");
  if (components.some((value) => value !== undefined && (value < 0 || value > 9))) errors.push("IELTS scores must be between 0 and 9.");

  const overseasMonths = number(input.overseasExperienceMonths);
  const australianMonths = number(input.australianExperienceMonths);
  if (overseasMonths === undefined || !Number.isInteger(overseasMonths) || overseasMonths < 0 || overseasMonths > 120)
    errors.push("Eligible overseas experience must be an integer from 0 to 120 months.");
  if (australianMonths === undefined || !Number.isInteger(australianMonths) || australianMonths < 0 || australianMonths > 120)
    errors.push("Eligible Australian experience must be an integer from 0 to 120 months.");

  const qualification = text(input.qualificationLevel).toLowerCase();
  const qualificationPoints: Record<string, number> = {
    doctorate: 20,
    bachelor_or_higher: 15,
    diploma_or_trade: 10,
    recognised_award: 10,
    none: 0,
  };
  if (!(qualification in qualificationPoints)) errors.push("A recognised qualification category is required.");

  const partner = text(input.partnerCategory).toLowerCase();
  const partnerPoints: Record<string, number> = {
    single_or_aus_partner: 10,
    skilled_partner: 10,
    competent_english_partner: 5,
    no_partner_points: 0,
  };
  if (!(partner in partnerPoints)) errors.push("A partner-points category is required.");
  if (errors.length || !dob || !testDate || overseasMonths === undefined || australianMonths === undefined)
    return { ok: false, errors };

  const age = ageOn(dob, testDate);
  const minimumIelts = Math.min(...(components as number[]));
  const englishProficiencyLevel = minimumIelts >= 8 ? "superior" : minimumIelts >= 7 ? "proficient" : minimumIelts >= 6 ? "competent" : "below_competent";
  const englishPoints = minimumIelts >= 8 ? 20 : minimumIelts >= 7 ? 10 : 0;
  const overseasExperiencePoints = australiaOverseasExperiencePoints(overseasMonths);
  const australianExperiencePoints = australiaLocalExperiencePoints(australianMonths);
  const rawEmployment = overseasExperiencePoints + australianExperiencePoints;
  const employmentPointsCapAdjustment = Math.min(0, 20 - rawEmployment);
  const professionalYearPoints = bool(input.professionalYearCompleted) ? 5 : 0;
  const australianStudyPoints = bool(input.australianStudyCompleted) ? 5 : 0;
  const regionalStudyPoints = bool(input.regionalStudyCompleted) ? 5 : 0;
  const communityLanguagePoints = bool(input.communityLanguageCredential) ? 5 : 0;
  const specialistEducationPoints = bool(input.specialistEducation) ? 10 : 0;
  const basePointsTotal = australiaAgePoints(age) + englishPoints + Math.min(20, rawEmployment)
    + qualificationPoints[qualification] + professionalYearPoints + australianStudyPoints
    + regionalStudyPoints + communityLanguagePoints + specialistEducationPoints + partnerPoints[partner];
  const subclass189Points = basePointsTotal;
  const subclass190Points = basePointsTotal + 5;
  const subclass491Points = basePointsTotal + 15;
  const claimedPointsTotal = subclass === "190" ? subclass190Points : subclass === "491" ? subclass491Points : subclass189Points;

  return {
    ok: true,
    errors: [],
    values: {
      calculationMode: "australia_verified",
      ruleSetVersion: AUSTRALIA_RULE_SET,
      age,
      agePoints: australiaAgePoints(age),
      englishProficiencyLevel,
      englishPoints,
      overseasExperiencePoints,
      australianExperiencePoints,
      employmentPointsCapAdjustment,
      qualificationPoints: qualificationPoints[qualification],
      specialistEducationPoints,
      professionalYearPoints,
      australianStudyPoints,
      regionalStudyPoints,
      stateNominationPoints: subclass === "190" ? 5 : 0,
      regionalSponsorshipPoints: subclass === "491" ? 15 : 0,
      partnerPoints: partnerPoints[partner],
      communityLanguagePoints,
      basePointsTotal,
      subclass189Points,
      subclass190Points,
      subclass491Points,
      claimedPointsTotal,
      yearsExperience: Math.floor((overseasMonths + australianMonths) / 12),
    },
  };
}
