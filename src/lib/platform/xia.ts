import "server-only";

import { scoreAssessment } from "@/lib/eligibility/scoring";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { Programs } from "@/lib/eligibility/programCatalog";
import { TOPMATE_BOOKING_URL } from "@/lib/topmate";
import type { XiaRecommendation, XiaRequest } from "./types";
import { listCountryOfferings, retrieveContent } from "./content-rag";
import { getImmigrationKnowledgeContext, type ImmigrationKnowledgeContext } from "./immigration-knowledge";

type CatalogProgram = {
  name: string;
  country?: string;
  pathway?: string;
  processingTime?: string;
  minInvestmentUSD?: string;
  notes?: string;
  track?: Track;
};

const TOPMATE = TOPMATE_BOOKING_URL;

function flattenPrograms(): CatalogProgram[] {
  return (Object.entries(Programs) as [Track, ReadonlyArray<CatalogProgram>][])
    .flatMap(([trackName, programs]) => programs.map((program) => ({ ...program, track: trackName })));
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function classifyIntent(message: string) {
  const q = normalize(message);
  const compact = q.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = compact ? compact.split(" ").length : 0;

  if (!compact) return "greeting";
  if (/^(hi|hello|hey|heya|hiya|good morning|good afternoon|good evening|namaste|gm|yo)$/.test(compact)) {
    return "greeting";
  }
  if (wordCount <= 3 && /\b(hi|hello|hey|namaste)\b/.test(compact)) return "greeting";
  if (/^(thanks|thank you|ok thanks|cool thanks|great thanks)$/.test(compact)) return "thanks";
  if (/\b(what can you do|help me|how can you help|start|begin)\b/.test(q)) return "assistant_help";
  if (/^(visa|visas|program|programs|programme|programmes|product|products|service|services|route|routes|pathway|pathways)$/.test(compact)) return "assistant_help";
  if (/\b(show|list|browse|what|which|all|available|options)\b/.test(q) && /\b(visa|visas|program|programs|programme|programmes|product|products|service|services|route|routes|pathway|pathways)\b/.test(q)) {
    return "assistant_help";
  }
  if (/\b(human|advisor|agent|person|staff|call me|talk to someone)\b/.test(q)) return "human_handoff";

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
  const ignored = new Set(["xiphias", "immigration", "options", "please", "shortlist", "suitable", "strongest", "matches", "only", "with", "one", "practical", "next", "step", "answer", "concise", "return"]);
  const usefulTokens = tokens.filter((token) => !ignored.has(token));
  const tokenScore = usefulTokens.reduce((sum, token) => sum + (haystack.includes(token) ? 8 : 0), 0);
  const countryScore = request.country && normalize(program.country).includes(normalize(request.country)) ? 30 : 0;
  const familyScore = query.includes("family") && haystack.includes("family") ? 12 : 0;
  const fastScore = /\bfast|quick|urgent|speed\b/.test(query) && /\bweek|month|fast\b/.test(haystack) ? 10 : 0;
  const trackScore = program.track && query.includes(program.track) ? 30 : 0;
  const europeScore = query.includes("europe") && /\b(portugal|greece|malta|italy|ireland|uk|eu|europe)\b/.test(haystack) ? 18 : 0;
  const gccScore = /\buae|gcc|dubai\b/.test(query) && /\buae|emirates|dubai\b/.test(haystack) ? 18 : 0;
  const northAmericaScore = /\bcanada|usa|united states|north america\b/.test(query) && /\bcanada|usa|united states\b/.test(haystack) ? 18 : 0;
  return tokenScore + countryScore + familyScore + fastScore + trackScore + europeScore + gccScore + northAmericaScore;
}

function isShortlistRequest(message: string) {
  const q = normalize(message);
  return /\b(shortlist|recommend|compare|find my route|goal:|budget:|applicant type:|destination preference:)\b/.test(q);
}

function inferTrackFromMessage(message: string): Track | undefined {
  const q = normalize(message);
  if (/\bcitizenship|second passport|passport\b/.test(q)) return "citizenship";
  if (/\bcorporate|company|business|hire staff|move staff|transfer\b/.test(q)) return "corporate";
  if (/\bskilled|work abroad|worker|employment|job\b/.test(q)) return "skilled";
  if (/\bresidency|live abroad|residence|golden visa\b/.test(q)) return "residency";
  return undefined;
}

function hrefForCatalogProgram(program: CatalogProgram) {
  const track = program.track;
  const country = normalize(program.country)
    .replace(/\(.*?\)/g, "")
    .split(/[,/]/)[0]
    .trim()
    .replace(/\s+/g, "-");

  if (!track) return "/eligibility";
  if (!country || country === "various" || country === "caribbean") return `/${track}`;
  if (country.includes("united-arab-emirates")) return `/${track}/uae`;
  return `/${track}/${country}`;
}

function uniqueSources(sources: XiaRecommendation["sources"]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = `${source.label}::${source.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toKnowledgePayload(context: ImmigrationKnowledgeContext): XiaRecommendation["knowledge"] {
  return {
    coverageSummary: context.coverageSummary,
    totalDocs: context.snapshot.totalDocs,
    programPages: context.snapshot.programPages,
    countryPages: context.snapshot.countryPages,
    insightPages: context.snapshot.insightPages,
    requestedCountry: context.requestedCountry?.label,
    exactCountryDocs: context.exactCountryDocs,
    exactProgramPages: context.exactProgramPages,
    availableVerticals: context.availableVerticals,
    gaps: context.gaps,
  };
}

function knowledgeCriteria(context: ImmigrationKnowledgeContext) {
  return [
    `Knowledge library checked: ${context.snapshot.programPages} programme pages, ${context.snapshot.countryPages} country pages, ${context.snapshot.insightPages} supporting content pages.`,
    context.coverageSummary,
    ...context.gaps.map((gap) => `Gap: ${gap}`),
  ];
}

export function getXiaRecommendation(request: XiaRequest): XiaRecommendation {
  const message = request.message ?? "";
  const intent = classifyIntent(message);
  const track: Track | undefined = request.track && isTrack(request.track) ? request.track : undefined;
  const knowledgeContext = getImmigrationKnowledgeContext({
    query: message,
    country: request.country,
    track,
    limit: 5,
  });
  const knowledge = toKnowledgePayload(knowledgeContext);

  if (intent === "greeting" || intent === "thanks" || intent === "assistant_help" || intent === "human_handoff") {
    const handoff = intent === "human_handoff";
    const thanks = intent === "thanks";
    const broadHelp = intent === "assistant_help";
    return {
      intent,
      summary: thanks
        ? "You are welcome. If you share your goal or destination, I can narrow the next step."
        : handoff
          ? "Yes. I can help you reach an advisor and keep the context of what you need."
          : broadHelp
          ? "Tell me your destination, visa type, budget, or goal. I can route you to the right programme family and open the relevant XIPHIAS page."
          : "Hi, I am XIA. I can help you explore immigration routes, compare countries, check document steps, or connect you with an advisor.",
      criteria: [
        "Greeting or conversation intent detected before retrieval.",
        "No program search was run for this message.",
        "Ask for a country, goal, budget, timeline, or document question to start advisory matching.",
        ...knowledgeCriteria(knowledgeContext).slice(0, 1),
      ],
      confidence: 100,
      handoffRequired: handoff,
      knowledge,
      recommendedPrograms: broadHelp
        ? [
            {
              name: "Residency programmes",
              country: "Live, invest, or set up abroad",
              reason: "Golden visa, business residence, remote worker, and long-stay routes.",
              score: 100,
              href: "/residency",
            },
            {
              name: "Citizenship and passport routes",
              country: "Second passport planning",
              reason: "Citizenship by investment, descent, donation, and passport mobility routes.",
              score: 96,
              href: "/citizenship",
            },
            {
              name: "Skilled migration",
              country: "Work and settle overseas",
              reason: "Points-based, employer, and professional migration pathways.",
              score: 92,
              href: "/skilled",
            },
            {
              name: "Corporate immigration",
              country: "Companies and teams",
              reason: "Staff transfers, company setup, founder visas, and business mobility.",
              score: 90,
              href: "/corporate",
            },
          ]
        : [],
      actions: handoff
        ? [
            { label: "Book advisor call", href: TOPMATE, type: "primary" },
            { label: "Check eligibility first", href: "/eligibility", type: "secondary" },
          ]
        : [
            { label: "Find my route", href: "/eligibility", type: "primary" },
            { label: "Browse programs", href: "/residency", type: "secondary" },
          ],
      sources: [],
      evidence: [],
    };
  }

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
      summary: "We support multiple immigration pathways. I grouped them by route type so you can choose what fits your goal first.",
      criteria: [
        "Grouped from approved country/program pages on the website.",
        "Only countries with current site pages are listed here.",
        "Exact eligibility still depends on your profile and route.",
        ...knowledgeCriteria(knowledgeContext),
      ],
      confidence: 100,
      handoffRequired: false,
      knowledge,
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
              name: "Book document review",
              country: "Step 2",
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
              name: "Document checklist",
              country: "Preparation",
              reason: "Prepare identity, civil, financial, and source-of-funds documents before advisor review.",
              score: 78,
              href: "/eligibility",
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
        ...knowledgeCriteria(knowledgeContext).slice(0, 2),
      ],
      confidence: workflowCards[0]?.score ?? 85,
      handoffRequired: intent !== "consultation",
      knowledge,
      recommendedPrograms: workflowCards,
      actions: [
        { label: "Run eligibility check", href: "/eligibility", type: "primary" },
        { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" },
      ],
      sources: [
        { label: "Eligibility check", href: "/eligibility" },
        { label: "Topmate booking", href: TOPMATE },
      ],
      evidence: [],
    };
  }

  if (isShortlistRequest(message)) {
    const inferredTrack = track ?? inferTrackFromMessage(message);
    const catalogPrograms = flattenPrograms()
      .filter((program) => !inferredTrack || program.track === inferredTrack)
      .map((program) => ({ program, score: scoreProgram(program, { ...request, track: inferredTrack }) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ program, score }) => ({
        name: program.name,
        country: program.country,
        reason: [
          program.pathway,
          program.processingTime ? `Typical timing: ${program.processingTime}.` : "",
          program.notes,
        ].filter(Boolean).join(" "),
        score: Math.min(96, Math.max(68, score + 58)),
        href: hrefForCatalogProgram(program),
      }));

    return {
      intent: "program_advisory",
      summary: "I matched your goal against curated XIPHIAS route rules and kept only the strongest starting points.",
      criteria: [
        "Goal, region, budget, and family profile were considered.",
        "Curated program rules are used before broad content search.",
        "Advisor review is still needed before filing or investment steps.",
        ...knowledgeCriteria(knowledgeContext),
      ],
      confidence: catalogPrograms[0]?.score ?? 70,
      handoffRequired: true,
      knowledge,
      recommendedPrograms: catalogPrograms.length
        ? catalogPrograms
        : [
            {
              name: "Structured eligibility check",
              country: "Profile review",
              reason: "Share your goal, budget, destination preference, and family profile to create a better shortlist.",
              score: 68,
              href: "/eligibility",
            },
          ],
      actions: [
        { label: "Run eligibility check", href: "/eligibility", type: "primary" },
        { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" },
      ],
      sources: uniqueSources([
        ...knowledgeContext.topDocs.slice(0, 3).map((doc) => ({ label: doc.title, href: doc.href })),
        { label: "Eligibility check", href: "/eligibility" },
        { label: "Residency programs", href: "/residency" },
        { label: "Citizenship programs", href: "/citizenship" },
        { label: "Skilled migration", href: "/skilled" },
      ]),
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
      href: hrefForCatalogProgram(program),
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
      ? "I matched your request against XIPHIAS program content and route-fit rules."
      : "I can narrow this down with your goal, country preference, budget, and family profile.";

  const criteria = [
    "Approved website content is searched as small retrieval chunks.",
    "Exact country page/program matches are ranked first.",
    "Selected track is applied after country match.",
    "If no dedicated country content exists, unrelated countries are not recommended.",
    ...knowledgeCriteria(knowledgeContext),
  ];

  const actions = [
    { label: "Run eligibility check", href: "/eligibility", type: "primary" as const },
    { label: "Book consultation on Topmate", href: TOPMATE, type: "secondary" as const },
  ];

  if (intent === "partnership") {
    actions.unshift({ label: "Partner with us", href: "/partner-with-us", type: "primary" as const });
  }

  return {
    intent,
    summary,
    criteria,
    confidence: fallbackPrograms[0]?.score ?? 50,
    handoffRequired:
      Boolean(countryMissing) ||
      fallbackPrograms[0]?.score < 65,
    knowledge,
    recommendedPrograms: fallbackPrograms,
    actions,
    sources: uniqueSources([
      ...content.chunks.slice(0, 5).map((chunk) => ({ label: chunk.title, href: chunk.href })),
      ...knowledgeContext.topDocs.slice(0, 3).map((doc) => ({ label: doc.title, href: doc.href })),
      { label: "Eligibility scoring", href: "/eligibility" },
      { label: "Personal consultation", href: TOPMATE },
    ]),
    evidence: content.chunks.slice(0, 3).map((chunk) => ({
      title: chunk.title,
      href: chunk.href,
      excerpt: chunk.excerpt,
    })),
  };
}
