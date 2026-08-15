import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { bigStats, callout, card, esc, grid, page, runningFooter, runningHeader, sectionHeader, steps, table, ticks } from "../components";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function points(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function list(value: unknown): string[] {
  return text(value).split(/\r?\n|\s*\|\s*/).map((item) => item.replace(/^\s*\d+[.)]\s*/, "").trim()).filter(Boolean);
}

export function buildCrmPointsAssessmentFrontMatter(order: JiopayOrder): string {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const total = points(a.claimedPointsTotal);
  const nomination = points(a.stateNominationPoints);
  const basePoints = Math.max(0, total - nomination);
  const occupation = text(a.occupation) || "Skilled occupation";
  const occupationCode = text(a.anzscoCode ?? a.occupationCode);
  const assessingBody = text(a.assessingBody);
  const language = [text(a.languageTest), text(a.languageDetails)].filter(Boolean).join(" — ");
  const education = text(a.education);
  const programme = text(a.selectedProgrammes) || "Subclass 189 and Subclass 190";
  const summary = text(a.executiveSummary) || `${order.customer.name}'s profile has been assessed for Australian skilled migration based on the recorded points calculation.`;
  const nextActions = list(a.nextActions).slice(0, 5);

  const scoreRows: Array<[string, number]> = [
    ["Age", points(a.agePoints)],
    ["English language", points(a.englishPoints)],
    ["Overseas skilled employment", points(a.overseasExperiencePoints)],
    ["Australian skilled employment", points(a.australianExperiencePoints)],
    ["Professional year", points(a.professionalYearPoints)],
    ["Qualification", points(a.qualificationPoints)],
    ["Australian study", points(a.australianStudyPoints)],
    ["Regional study", points(a.regionalStudyPoints)],
    ["State nomination", nomination],
    ["Regional sponsorship", points(a.regionalSponsorshipPoints)],
    ["Partner skills", points(a.partnerPoints)],
    ["Community language", points(a.communityLanguagePoints)],
  ];

  const strengths = scoreRows.filter(([, score]) => score > 0).sort((left, right) => right[1] - left[1]).slice(0, 5)
    .map(([label, score]) => `${label}: ${score} points`);
  const routePosition = total >= 65 ? "Points threshold met" : "Additional points required";
  const title = "Australia Skilled Migration Assessment";
  const head = runningHeader(title, { country: "Australia", route: "Subclasses 189 & 190" });
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited", label);

  const assessmentPage = page({
    header: head,
    footer: foot("Points assessment"),
    body:
      sectionHeader({ eyebrow: "Assessment result", title: "SkillSelect points summary", desc: `Points calculation for ${order.customer.name}.` }) +
      bigStats([
        { k: "Total points", v: String(total), n: routePosition },
        { k: "Subclass 189", v: String(basePoints), n: "Score excluding state nomination" },
        { k: "Subclass 190", v: String(total), n: nomination ? `Includes ${nomination} nomination points` : "No nomination points included" },
      ]) +
      `<div class="spacer-16"></div>` +
      table({
        head: ["Points factor", "Score"],
        rows: [...scoreRows.map(([label, score]) => [esc(label), `<strong>${score}</strong>`]), ["<strong>Total</strong>", `<strong>${total}</strong>`]],
      }),
  });

  const pathwayPage = page({
    header: head,
    footer: foot("Profile and pathway"),
    body:
      sectionHeader({ eyebrow: "Professional profile", title: "Assessment overview", desc: summary }) +
      grid(2, [
        card({ k: "Nominated occupation", v: occupation }),
        card({ k: "ANZSCO code", v: occupationCode || "—" }),
        card({ k: "Assessing authority", v: assessingBody || "—" }),
        card({ k: "English", v: language || "—" }),
        card({ k: "Qualification", v: education || "—" }),
        card({ k: "Selected pathways", v: programme }),
      ]) +
      `<div class="spacer-16"></div>` +
      sectionHeader({ eyebrow: "Profile strengths", title: "Points contribution" }) +
      ticks(strengths.length ? strengths : ["Points calculation recorded"], true) +
      `<div class="spacer-16"></div>` +
      callout({ k: "Assessment position", text: total >= 65
        ? `The recorded score of ${total} points is above the 65-point eligibility threshold for the points-tested skilled migration framework. Invitation prospects depend on the selected occupation, invitation rounds and nomination availability.`
        : `The recorded score is ${total} points. Additional eligible points may be required before proceeding with a points-tested pathway.` }),
  });

  const actionPage = page({
    header: head,
    footer: foot("Recommended next steps"),
    body:
      sectionHeader({ eyebrow: "Action plan", title: "Recommended next steps", desc: "A focused pathway from assessment to Expression of Interest." }) +
      steps((nextActions.length ? nextActions : [
        "Complete the relevant skills assessment.",
        "Compile English, qualification and employment evidence.",
        "Prepare the SkillSelect Expression of Interest.",
        "Review subclass 190 state nomination options.",
      ]).map((item, index) => ({ title: `Step ${index + 1}`, body: item }))) +
      `<div class="spacer-24"></div>` +
      callout({ k: "Important", text: "Points, occupation lists, invitation settings and state nomination requirements may change. The applicable criteria should be confirmed before an Expression of Interest or visa application is submitted." }),
  });

  return assessmentPage + pathwayPage + actionPage;
}
