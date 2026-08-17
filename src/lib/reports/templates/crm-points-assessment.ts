import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { bigStats, callout, card, esc, grid, page, pill, runningFooter, runningHeader, sectionHeader, steps, table, ticks } from "../components";

type FeeItem = { category: string; label: string; amount: number; currency: string; verifiedDate: string; source: string };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function number(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function point(value: unknown): number {
  return Math.round(number(value) ?? 0);
}

function yes(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function list(value: unknown, max = 8): string[] {
  return text(value).split(/\r?\n|\s*\|\s*/).map((item) => item.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean).slice(0, max);
}

function label(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function monthsLabel(value: unknown): string {
  const months = Math.max(0, Math.round(number(value) ?? 0));
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return `${years} year${years === 1 ? "" : "s"}${remainder ? ` ${remainder} month${remainder === 1 ? "" : "s"}` : ""} (${months} months)`;
}

function overseasBracket(value: unknown): string {
  const months = number(value) ?? 0;
  return months >= 96 ? "At least 8 years" : months >= 60 ? "5 to less than 8 years" : months >= 36 ? "3 to less than 5 years" : "Less than 3 years";
}

function australianBracket(value: unknown): string {
  const months = number(value) ?? 0;
  return months >= 96 ? "At least 8 years" : months >= 60 ? "5 to less than 8 years" : months >= 36 ? "3 to less than 5 years" : months >= 12 ? "1 to less than 3 years" : "Less than 1 year";
}

function feeItems(value: unknown): FeeItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      category: text(row.category), label: text(row.label), amount: Math.max(0, number(row.amount) ?? 0),
      currency: text(row.currency).toUpperCase(), verifiedDate: text(row.verifiedDate), source: text(row.source),
    };
  }).filter((row) => row.label && row.currency);
}

function money(item: FeeItem): string {
  if (item.amount <= 0) return "To confirm";
  return `${item.currency} ${item.amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function buildCrmPointsAssessmentFrontMatter(order: JiopayOrder): string {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const manual = text(a.calculationMode) === "manual_adviser";
  const total = point(a.claimedPointsTotal);
  const subclass = text(a.visaSubclass) || "Selected programme";
  const occupation = text(a.occupation) || "Occupation not entered";
  const occupationCode = text(a.anzscoCode ?? a.occupationCode);
  const programme = text(a.selectedProgrammes) || (subclass.match(/^\d+$/) ? `Subclass ${subclass}` : "Programme not entered");
  const assessmentResult = text(a.skillsAssessmentResult || a.skillsAssessment).toLowerCase();
  const mandatoryGatesComplete = manual || (point(a.agePoints) > 0 && ["competent", "proficient", "superior"].includes(text(a.englishProficiencyLevel))
    && assessmentResult.includes("positive") && Boolean(occupationCode));
  const resultLabel = total < 65 ? "Below points threshold" : mandatoryGatesComplete ? "Points threshold and recorded gates met" : "Points threshold met; requirements incomplete";
  const title = "Australia Skilled Migration Assessment";
  const head = runningHeader(title, { country: "Australia", route: programme });
  const foot = (section: string) => runningFooter("XIPHIAS Immigration Private Limited", section);

  const profilePage = page({
    header: head,
    footer: foot("Assessment summary"),
    body:
      sectionHeader({ eyebrow: "Client assessment", title: occupationCode ? `${occupation} (${occupationCode})` : occupation, desc: text(a.executiveSummary) || text(a.profileSummary) || `Assessment prepared for ${order.customer.name}.` }) +
      bigStats([
        { k: `Subclass ${subclass}`, v: String(total), n: resultLabel },
        { k: "Assessing authority", v: text(a.assessingBody) || "Not entered", n: text(a.skillsAssessmentResult || a.skillsAssessment) || "Status not entered" },
        { k: "Calculation", v: manual ? "Manual" : "Verified engine", n: manual ? "Manager review required" : text(a.ruleSetVersion) },
      ]) +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Applicant", v: order.customer.name }),
        card({ k: "Selected pathway", v: programme }),
        card({ k: "Qualification", v: text(a.education) || label(text(a.qualificationLevel)) || "Not entered" }),
        card({ k: "English", v: [text(a.languageTest), text(a.englishProficiencyLevel) && label(text(a.englishProficiencyLevel))].filter(Boolean).join(" - ") || "Not entered" }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Assessment position", text: total >= 65
        ? mandatoryGatesComplete
          ? `The recorded profile reaches ${total} points for the selected pathway. An invitation is not guaranteed and current occupation, invitation and nomination settings still apply.`
          : `The calculation reaches ${total} points, but one or more mandatory requirements are not recorded as complete. Do not lodge an Expression of Interest until those requirements are confirmed.`
        : `The recorded profile totals ${total} points. It does not currently reach the 65-point minimum for the selected points-tested pathway.` }),
  });

  const systemRows: string[][] = [
    ["Age", number(a.age) === undefined ? "Not entered" : `${number(a.age)} years on ${text(a.pointsTestDate)}`, "Official age bracket", String(point(a.agePoints))],
    ["English", [text(a.languageTest), [a.languageListening, a.languageReading, a.languageWriting, a.languageSpeaking].map(number).filter((value) => value !== undefined).join(" / "), label(text(a.englishProficiencyLevel))].filter(Boolean).join(" - "), "Lowest component determines level", String(point(a.englishPoints))],
    ["Overseas skilled employment", monthsLabel(a.overseasExperienceMonths), overseasBracket(a.overseasExperienceMonths), String(point(a.overseasExperiencePoints))],
    ["Australian skilled employment", monthsLabel(a.australianExperienceMonths), australianBracket(a.australianExperienceMonths), String(point(a.australianExperiencePoints))],
    ["Employment points cap", "Overseas and Australian employment combined", "Maximum 20 points", String(point(a.employmentPointsCapAdjustment))],
    ["Qualification", text(a.education) || label(text(a.qualificationLevel)), label(text(a.qualificationLevel)), String(point(a.qualificationPoints))],
    ["Specialist education", yes(a.specialistEducation) ? "Yes" : "No", "10 points when applicable", String(point(a.specialistEducationPoints))],
    ["Professional year", yes(a.professionalYearCompleted) ? "Completed" : "Not claimed", "5 points when applicable", String(point(a.professionalYearPoints))],
    ["Australian study", yes(a.australianStudyCompleted) ? "Completed" : "Not claimed", "5 points when applicable", String(point(a.australianStudyPoints))],
    ["Regional study", yes(a.regionalStudyCompleted) ? "Completed" : "Not claimed", "5 points when applicable", String(point(a.regionalStudyPoints))],
    ["Partner", label(text(a.partnerCategory)) || "Not entered", "Applicable partner category", String(point(a.partnerPoints))],
    ["Community language", yes(a.communityLanguageCredential) ? "Credential recorded" : "Not claimed", "5 points when applicable", String(point(a.communityLanguagePoints))],
    [subclass === "491" ? "Regional nomination / sponsorship" : "State nomination", `Subclass ${subclass}`, subclass === "491" ? "15 points" : subclass === "190" ? "5 points" : "No nomination points", String(point(a.stateNominationPoints) + point(a.regionalSponsorshipPoints))],
  ];
  const manualRows: string[][] = [
    ["Age", "Adviser-entered", "Manual assessment", String(point(a.agePoints))],
    ["English", text(a.languageDetails) || "Adviser-entered", "Manual assessment", String(point(a.englishPoints))],
    ["Overseas experience", text(a.yearsExperience) ? `${text(a.yearsExperience)} years recorded` : "Adviser-entered", "Manual assessment", String(point(a.overseasExperiencePoints))],
    ["Australian experience", "Adviser-entered", "Manual assessment", String(point(a.australianExperiencePoints))],
    ["Qualification", text(a.education) || "Adviser-entered", "Manual assessment", String(point(a.qualificationPoints))],
    ["Other points factors", "Professional year, study, nomination, partner and community language", "Manual assessment", String(point(a.professionalYearPoints) + point(a.australianStudyPoints) + point(a.regionalStudyPoints) + point(a.stateNominationPoints) + point(a.regionalSponsorshipPoints) + point(a.partnerPoints) + point(a.communityLanguagePoints))],
  ];
  const pointsPage = page({
    header: head,
    footer: foot("Points allocation"),
    body:
      sectionHeader({ eyebrow: manual ? "Manual adviser assessment" : "Verified points engine", title: "Points allocation", desc: manual ? text(a.manualAssessmentReason) : "Each score is calculated from the recorded fact and the applicable bracket. The server calculates the total; it is not typed independently." }) +
      `<div class="compact-table">${table({ head: ["Factor", "Recorded fact", "Applied rule", "Points"], rows: [...(manual ? manualRows : systemRows), ["<strong>Total</strong>", "", "", `<strong>${total}</strong>`]] })}</div>` +
      `<div class="spacer-12"></div>` +
      callout({ k: "Important", text: "The 65-point threshold is a minimum requirement, not an invitation guarantee. Occupation eligibility, skills assessment, English, invitation rounds and state or regional criteria remain separate requirements." }),
  });

  const scenarioPage = page({
    header: head,
    footer: foot("Pathway comparison"),
    body:
      sectionHeader({ eyebrow: "Pathway comparison", title: "189, 190 and 491 points position", desc: manual ? "Only the selected manual total is authoritative for this report version." : "The same verified base profile is shown with the statutory nomination additions for comparison." }) +
      grid(3, [
        card({ k: "Subclass 189", v: number(a.subclass189Points) === undefined ? "Not calculated" : `${point(a.subclass189Points)} points`, note: "No state or regional nomination points." }),
        card({ k: "Subclass 190", v: number(a.subclass190Points) === undefined ? "Not calculated" : `${point(a.subclass190Points)} points`, note: "Includes 5 state-nomination points when nomination is obtained." }),
        card({ k: "Subclass 491", v: number(a.subclass491Points) === undefined ? "Not calculated" : `${point(a.subclass491Points)} points`, note: "Includes 15 regional nomination or eligible-family sponsorship points when obtained." }),
      ]) +
      `<div class="spacer-20"></div>` +
      sectionHeader({ title: "Recorded pathway requirements" }) +
      table({ head: ["Requirement", "Recorded position"], rows: [
        ["Nominated occupation", esc([occupation, occupationCode].filter(Boolean).join(" - "))],
        ["Skills assessment", esc([text(a.assessingBody), text(a.skillsAssessmentResult || a.skillsAssessment)].filter(Boolean).join(" - ") || "Not entered")],
        ["English", esc([text(a.languageTest), label(text(a.englishProficiencyLevel))].filter(Boolean).join(" - ") || "Not entered")],
        ["Selected programme", esc(programme)],
      ] }),
  });

  const fees = feeItems(a.feeItems);
  const costs = fees.filter((item) => item.category !== "proof_of_funds");
  const funds = fees.filter((item) => item.category === "proof_of_funds");
  const feesPage = page({
    header: head,
    footer: foot("Fees and required funds"),
    body:
      sectionHeader({ eyebrow: "Financial plan", title: "Fees and required funds", desc: "Amounts are separated by category so professional charges, government fees, third-party costs and required funds are not confused." }) +
      (costs.length ? table({ head: ["Category", "Item", "Amount", "Verified / source"], rows: costs.map((item) => [esc(label(item.category)), esc(item.label), esc(money(item)), esc([item.verifiedDate, item.source].filter(Boolean).join(" - "))]) }) : callout({ k: "Fees", text: "No fee lines were entered for this report version." })) +
      (funds.length ? `<div class="spacer-18"></div>` + sectionHeader({ title: "Proof of funds / available-funds requirement" }) + table({ head: ["Requirement", "Amount", "Verified / source"], rows: funds.map((item) => [esc(item.label), esc(money(item)), esc([item.verifiedDate, item.source].filter(Boolean).join(" - "))]) }) : "") +
      `<div class="spacer-16"></div>` +
      callout({ k: "Fee control", text: "Government and third-party fees can change. Reconfirm every amount before payment. Proof of funds is a financial requirement and is not a fee paid to XIPHIAS or the government." }),
  });

  const documents = Array.isArray(a.documentInventory) ? a.documentInventory.slice(0, 18) : [];
  const evidencePage = page({
    header: head,
    footer: foot("Evidence and documents"),
    body:
      sectionHeader({ eyebrow: "Evidence plan", title: "Documents and evidence required", desc: text(a.evidenceNotes) || "Prepare evidence that directly supports every fact and points claim in this assessment." }) +
      (documents.length ? table({ head: ["Document", "Category", "Status"], rows: documents.map((item) => {
        const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
        return [esc(text(row.name) || "Document"), esc(text(row.category) || "General"), pill(text(row.status) || "Recorded", /verified|approved/i.test(text(row.status)) ? "good" : "warn")];
      }) }) : ticks([
        "Passport and identity records",
        "Qualification awards and transcripts",
        "Detailed employment references and corroborating salary or tax evidence",
        "English test report with all component scores",
        "Skills-assessment application and outcome",
        "Partner, nomination and other documents supporting claimed points",
      ])) +
      (text(a.professionalRecognition) ? `<div class="spacer-16"></div>` + callout({ k: "Professional recognition / RPL", text: text(a.professionalRecognition) }) : ""),
  });

  const risks = list(a.customRisks, 8);
  const actions = list(a.nextActions, 8);
  const actionPage = page({
    header: head,
    footer: foot("Recommendation and action plan"),
    body:
      sectionHeader({ eyebrow: "Recommendation", title: "Decision and next actions", desc: text(a.advisorRecommendation) || "Complete the outstanding evidence and reconfirm the calculation before progressing." }) +
      (risks.length ? `<h3 class="h-sub">Client-specific risks</h3>` + ticks(risks) + `<div class="spacer-16"></div>` : "") +
      steps((actions.length ? actions : [
        "Confirm the nominated occupation and assessing-authority pathway.",
        "Complete the skills-assessment evidence pack.",
        "Reconcile employment dates and English evidence with the claimed points.",
        "Recheck current invitation and nomination settings before EOI submission.",
      ]).map((item, index) => ({ title: `Action ${index + 1}`, body: item }))) +
      (text(a.factualSources) ? `<div class="spacer-18"></div>` + callout({ k: "Rules and fee sources checked", text: text(a.factualSources) }) : "") +
      `<div class="spacer-16"></div>` +
      callout({ k: "Client decision", text: "This assessment supports planning only. It does not guarantee an invitation, nomination or visa decision. Reconfirm current rules, fees and evidence before lodging or paying a government or third-party charge." }),
  });

  return profilePage + pointsPage + scenarioPage + feesPage + evidencePage + actionPage;
}
