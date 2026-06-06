import "server-only";

import { scoreAssessment } from "@/lib/eligibility/scoring";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { Programs } from "@/lib/eligibility/programCatalog";
import type { XiaRecommendation, XiaRequest } from "./types";
import { listCountryOfferings, retrieveContent } from "./content-rag";

type CatalogProgram = {
  name: string;
  country?: string;
  pathway?: string;
  processingTime?: string;
  minInvestmentUSD?: string;
  notes?: string;
};

const TOPMATE = "/booking";

function flattenPrograms(): CatalogProgram[] {
  return Object.values(Programs).flat() as CatalogProgram[];
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function classifyIntent(message: string) {
  const q = normalize(message);
  if (/\b(country|countries|destination|destinations|where|offer|available)\b/.test(q) && /\b(which|what|all|list|show|offer|available)\b/.test(q)) {
    return "country_overview";
  }
  if (/\b(document|upload|passport|proof|fund|pcc|medical|checklist)\b/.test(q)) return "document_readiness";
  if (/\b(risk|due diligence|pep|sanction|background|source of funds)\b/.test(q)) return "risk_review";
  if (/\b(passport|visa free|mobility|index|travel)\b/.test(q)) return "passport_mobility";
  if (/\b(partner|referral|b2b|channel|agent)\b/.test(q)) return "partnership";
  if (/\b(book|consult|appointment|call|topmate)\b/.test(q)) return "consultation";
  return "program_advisory";
}

function scoreProgram(program: CatalogProgram, request: XiaRequest) {
  const haystack = normalize([
    program.name,
    program.country,
    program.pathway,
    program.processingTime,
    program.minInvestmentUSD,
    program.notes,
  ].join(" "));
  const query = normalize([request.message, request.country, ...(request.goals ?? [])].join(" "));
  const tokens = query.split(/\W+/).filter((token) => token.length > 2);
  const tokenScore = tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 8 : 0), 0);
  const countryScore = request.country && normalize(program.country).includes(normalize(request.country)) ? 30 : 0;
  const familyScore = query.includes("family") && haystack.includes("family") ? 12 : 0;
  const fastScore = /\bfast|quick|urgent|speed\b/.test(query) && /\bweek|month|fast\b/.test(haystack) ? 10 : 0;
  return tokenScore + countryScore + familyScore + fastScore;
}

export function getXiaRecommendation(request: XiaRequest): XiaRecommendation {
  const message = request.message ?? "";
  const intent = classifyIntent(message);
  const track: Track | undefined = request.track && isTrack(request.track) ? request.track : undefined;

  if (intent === "country_overview") {
    const groups = listCountryOfferings().filter((group) => group.countries.length > 0);
    const recommendedPrograms = groups.map((group) => ({
      name: group.label,
      country: `${group.countries.length} countries`,
      reason: `Countries: ${group.countries.join(", ")}`,
      score: 100,
      href: group.href,
    }));

    return {
      intent,
      summary: "Hi. We support immigration pathways across these country groups. Pick a category to view the full program pages.",
      criteria: [
        "Grouped from approved country/program pages on the website.",
        "Only countries with current site pages are listed here.",
        "Exact eligibility still depends on your profile and route.",
      ],
      confidence: 100,
      handoffRequired: false,
      recommendedPrograms,
      actions: [
        { label: "Run eligibility check", href: "/eligibility", type: "primary" },
        { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" },
      ],
      sources: groups.map((group) => ({ label: group.label, href: group.href })),
      evidence: [],
    };
  }

  if (intent === "document_readiness" || intent === "risk_review" || intent === "consultation") {
    const workflowCards =
      intent === "document_readiness"
        ? [
            {
              name: "Check eligibility",
              country: "Step 1",
              reason: "Start with the structured eligibility check so the document list matches the route.",
              score: 92,
              href: "/eligibility",
            },
            {
              name: "Open X-Hub",
              country: "Step 2",
              reason: "Use the portal to track documents, milestones, messages, and next actions.",
              score: 88,
              href: "/x-hub",
            },
            {
              name: "Book document review",
              country: "Advisor review",
              reason: "Have an advisor verify gaps before filing or investment steps.",
              score: 86,
              href: TOPMATE,
            },
          ]
        : intent === "risk_review"
        ? [
            {
              name: "Due diligence review",
              country: "Risk check",
              reason: "Review source of funds, background, PEP/sanctions exposure, and mismatch flags.",
              score: 90,
              href: TOPMATE,
            },
            {
              name: "Run eligibility check",
              country: "Profile fit",
              reason: "Confirm the pathway before spending time on risk and document preparation.",
              score: 84,
              href: "/eligibility",
            },
            {
              name: "Open X-Hub",
              country: "Case tracking",
              reason: "Track staff review, document status, and next action once a case is opened.",
              score: 78,
              href: "/x-hub",
            },
          ]
        : [
            {
              name: "Book consultation",
              country: "Topmate",
              reason: "Use the existing booking flow for paid advisor consultation.",
              score: 95,
              href: TOPMATE,
            },
            {
              name: "Check eligibility first",
              country: "Optional",
              reason: "Complete a quick assessment if you want the call to be more focused.",
              score: 82,
              href: "/eligibility",
            },
          ];

    return {
      intent,
      summary:
        intent === "document_readiness"
          ? "Here is the cleanest document-preparation path."
          : intent === "risk_review"
          ? "Risk review should be handled with advisor verification."
          : "You can book directly through the current Topmate flow.",
      criteria: [
        "This is a workflow response, not a content search.",
        "Sensitive eligibility and risk decisions require advisor verification.",
        "The booking/payment flow stays on Topmate.",
      ],
      confidence: workflowCards[0]?.score ?? 85,
      handoffRequired: intent !== "consultation",
      recommendedPrograms: workflowCards,
      actions: [
        { label: "Run eligibility check", href: "/eligibility", type: "primary" },
        { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" },
      ],
      sources: [
        { label: "Eligibility check", href: "/eligibility" },
        { label: "X-Hub", href: "/x-hub" },
        { label: "Topmate booking", href: TOPMATE },
      ],
      evidence: [],
    };
  }

  const content = retrieveContent({
    query: message,
    country: request.country,
    track,
    limit: 6,
  });

  const scoredAssessment =
    track && request.answers
      ? scoreAssessment(track, request.answers)
      : null;

  const countryMissing =
    content.hasCountryIntent && content.exactCountryMatchCount === 0 && content.countryLabel;

  const contentPrograms = (countryMissing ? [] : content.chunks)
    .map((chunk) => ({
      name: chunk.title,
      country: chunk.country,
      reason: `${chunk.excerpt} Criteria: ${chunk.reasons.join(" ")}`,
      score: chunk.score,
      href: chunk.href,
    }));

  const catalog =
    contentPrograms.length > 0 || (content.hasCountryIntent && content.exactCountryMatchCount === 0)
      ? []
      : flattenPrograms()
          .map((program) => ({ program, score: scoreProgram(program, request) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);

  const catalogPrograms = catalog
    .filter((item) => item.score > 0)
    .map(({ program, score }) => ({
      name: program.name,
      country: program.country,
      reason: `${program.pathway || program.notes || "Matches the stated goal and XIPHIAS program catalog."} Criteria: catalog keyword/track match.`,
      score: Math.min(100, score + 40),
    }));

  const recommendedPrograms = [...contentPrograms, ...catalogPrograms].slice(0, 6);

  const fallbackPrograms =
    recommendedPrograms.length > 0
      ? recommendedPrograms
      : [
          {
            name: countryMissing
              ? `No dedicated ${content.countryLabel} program page found`
              : "Eligibility check",
            country: content.countryLabel ?? request.country,
            reason: countryMissing
              ? `The current website content index has no dedicated country/program page for ${content.countryLabel}. Use staff review or add approved content before recommendations are shown.`
              : "Start with structured eligibility answers so an advisor can shortlist the right route.",
            score: 55,
          },
        ];

  const summary =
    countryMissing
      ? `I checked the current site content and did not find a dedicated ${content.countryLabel} program/country page. I will not substitute unrelated countries.`
      : scoredAssessment
      ? `${scoredAssessment.tier}: ${scoredAssessment.summary}`
      : content.chunks.length
      ? "XIA Lite retrieved approved website content first, then applied deterministic routing and staff handoff rules."
      : "XIA Lite uses approved site content first, then rules and eligibility scoring for triage before staff review.";

  const criteria = [
    "Approved website content is searched as small retrieval chunks.",
    "Exact country page/program matches are ranked first.",
    "Selected track is applied after country match.",
    "If no dedicated country content exists, unrelated countries are not recommended.",
  ];

  const actions = [
    { label: "Run eligibility check", href: "/eligibility", type: "primary" as const },
    { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" as const },
  ];

  if (intent === "partnership") {
    actions.unshift({ label: "Open partner portal", href: "/x-hub/partners", type: "primary" as const });
  }

  return {
    intent,
    summary,
    criteria,
    confidence: fallbackPrograms[0]?.score ?? 50,
    handoffRequired:
      Boolean(countryMissing) ||
      fallbackPrograms[0]?.score < 65,
    recommendedPrograms: fallbackPrograms,
    actions,
    sources: [
      ...content.chunks.slice(0, 5).map((chunk) => ({ label: chunk.title, href: chunk.href })),
      { label: "Eligibility scoring", href: "/eligibility" },
      { label: "Personal consultation", href: TOPMATE },
    ],
    evidence: content.chunks.slice(0, 3).map((chunk) => ({
      title: chunk.title,
      href: chunk.href,
      excerpt: chunk.excerpt,
    })),
  };
}
