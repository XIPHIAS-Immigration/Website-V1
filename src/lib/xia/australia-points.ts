// src/lib/xia/australia-points.ts
// -----------------------------------------------------------------------------
// Australian General Skilled Migration points test (subclasses 189, 190, 491).
//
// Published in the Migration Regulations. Like the CRS this is arithmetic, and
// getting it right is worth more to a Bangalore applicant than any amount of
// programme copy: it converts "am I eligible?" into a number with a gap.
//
// The pass mark is 65 to lodge an expression of interest. The score that is
// actually invited depends on the occupation and the round, and is NOT part of
// the points test — never present 65 as "enough".
// -----------------------------------------------------------------------------

export const AU_POINTS_LAST_VERIFIED = "2026-09-13";
export const AU_POINTS_SOURCE_URL =
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-tested";

export const AU_PASS_MARK = 65;

export type AuEnglish = "competent" | "proficient" | "superior";
export type AuQualification =
  | "none"
  | "trade-or-diploma"
  | "bachelor"
  | "masters-or-bachelor-with-research"
  | "doctorate";
export type AuPartnerStatus =
  | "no-partner"
  | "partner-citizen-or-pr"
  | "partner-skilled"
  | "partner-competent-english"
  | "partner-none-of-these";

export type AuPointsInput = {
  age: number;
  english: AuEnglish;
  overseasSkilledYears: number;
  australianSkilledYears: number;
  qualification: AuQualification;
  /** Two-year study requirement met in Australia. */
  australianStudy?: boolean;
  specialistEducation?: boolean;
  regionalStudy?: boolean;
  professionalYear?: boolean;
  accreditedCommunityLanguage?: boolean;
  partner: AuPartnerStatus;
  nomination?: "none" | "state-190" | "state-or-family-491";
};

export type AuPointsBreakdown = {
  total: number;
  detail: Record<string, number>;
  passesFloor: boolean;
  knockouts: string[];
  notes: string[];
};

function agePoints(age: number) {
  if (age >= 18 && age <= 24) return 25;
  if (age >= 25 && age <= 32) return 30;
  if (age >= 33 && age <= 39) return 25;
  if (age >= 40 && age <= 44) return 15;
  return 0;
}

function englishPoints(level: AuEnglish) {
  return { competent: 0, proficient: 10, superior: 20 }[level];
}

function overseasExperiencePoints(years: number) {
  if (years >= 8) return 15;
  if (years >= 5) return 10;
  if (years >= 3) return 5;
  return 0;
}

function australianExperiencePoints(years: number) {
  if (years >= 8) return 20;
  if (years >= 5) return 15;
  if (years >= 3) return 10;
  if (years >= 1) return 5;
  return 0;
}

function qualificationPoints(level: AuQualification) {
  return {
    none: 0,
    "trade-or-diploma": 10,
    bachelor: 15,
    "masters-or-bachelor-with-research": 15,
    doctorate: 20,
  }[level];
}

function partnerPoints(status: AuPartnerStatus) {
  // A skilled partner is the most commonly missed ten points on a borderline file.
  return {
    "no-partner": 10,
    "partner-citizen-or-pr": 10,
    "partner-skilled": 10,
    "partner-competent-english": 5,
    "partner-none-of-these": 0,
  }[status];
}

export function calculateAustraliaPoints(input: AuPointsInput): AuPointsBreakdown {
  const detail: Record<string, number> = {};
  const notes: string[] = [];
  const knockouts: string[] = [];

  detail.age = agePoints(input.age);
  if (input.age >= 45) {
    knockouts.push("Applicants aged 45 or over at invitation are not eligible for the points-tested visas.");
  }

  detail.english = englishPoints(input.english);
  if (input.english === "competent") {
    notes.push("Competent English scores zero. Moving to Proficient is worth 10 points and Superior 20.");
  }

  detail.overseasExperience = overseasExperiencePoints(input.overseasSkilledYears);
  detail.australianExperience = australianExperiencePoints(input.australianSkilledYears);
  // Combined work experience is capped at 20 points.
  const workTotal = Math.min(detail.overseasExperience + detail.australianExperience, 20);
  if (workTotal < detail.overseasExperience + detail.australianExperience) {
    notes.push("Combined skilled-employment points are capped at 20.");
  }

  detail.qualification = qualificationPoints(input.qualification);
  if (input.qualification === "none") {
    knockouts.push("A positive skills assessment for the nominated occupation is mandatory.");
  }

  detail.australianStudy = input.australianStudy ? 5 : 0;
  detail.specialistEducation = input.specialistEducation ? 10 : 0;
  detail.regionalStudy = input.regionalStudy ? 5 : 0;
  detail.professionalYear = input.professionalYear ? 5 : 0;
  detail.communityLanguage = input.accreditedCommunityLanguage ? 5 : 0;
  detail.partner = partnerPoints(input.partner);

  detail.nomination =
    input.nomination === "state-190" ? 5 : input.nomination === "state-or-family-491" ? 15 : 0;

  const total =
    detail.age +
    detail.english +
    workTotal +
    detail.qualification +
    detail.australianStudy +
    detail.specialistEducation +
    detail.regionalStudy +
    detail.professionalYear +
    detail.communityLanguage +
    detail.partner +
    detail.nomination;

  notes.push(
    `${AU_PASS_MARK} is the minimum to submit an expression of interest, not the score that receives an invitation — that depends on the occupation and the round.`,
  );

  return { total, detail, passesFloor: total >= AU_PASS_MARK, knockouts, notes };
}
