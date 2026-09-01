import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import {
  getProgramFrontmatter,
  getSkilledPrograms,
  type ProgramMeta,
  type Step,
} from "@/lib/skilled-content";
import { loadCoverBg, loadCountryImages, loadLogo } from "../assets";
import {
  callout,
  card,
  clampScore,
  coverPage,
  disclaimer,
  esc,
  grid,
  heroBand,
  page,
  pill,
  runningFooter,
  runningHeader,
  reportBasisPage,
  scoreBar,
  sectionHeader,
  splitPage,
  steps,
  table,
  ticks,
  type PillTone,
} from "../components";
import { renderReportPdf } from "../render";
import { buildCompanyProfilePages } from "../company-profile";
import { allocateReportImages, cleanReportPunctuation } from "./report-depth";
import { assessPersonalisation, buildClientCase, caseCoverProfileLine, reportBasis, verifiedDocumentReadiness, type ClientDocument } from "../client-case";

/* ------------------------------------------------------------------ *
 * Defensive coercion helpers (mirrors templates/route.ts)
 * ------------------------------------------------------------------ */
function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function documentCategory(value: string): string | undefined {
  const text = value.toLowerCase();
  if (/passport/.test(text)) return "passport";
  if (/police|clearance|pcc/.test(text)) return "police-clearance";
  if (/degree|qualification|transcript|diploma/.test(text)) return "qualification";
  if (/(employment|work).*(reference|experience)|reference.*(employment|work|experience)/.test(text)) return "employment-reference";
  if (/employment contract|job offer|offer letter/.test(text)) return "employment-contract";
  if (/ielts|pte|oet|toefl|language test|english test/.test(text)) return "language";
  if (/marriage|name change/.test(text)) return "marriage-name";
  if (/birth certificate/.test(text)) return "birth";
  if (/bank|fund|financial|income|salary|tax/.test(text)) return "financial";
  if (/medical|health examination/.test(text)) return "medical";
  return undefined;
}
function toBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const s = str(value).toLowerCase();
  return s === "true" || s === "yes" || s === "1";
}
function toInt(value: unknown, fallback: number): number {
  const n = Number(str(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}
// True acronyms that must stay fully uppercased rather than title-cased.
const ACRONYMS = new Set(["pr", "niw", "eb-1a", "eb1a", "o-1a", "o1a", "h-1b", "h1b", "uk", "uae", "usa", "ielts", "pte", "toefl", "ecas", "eca", "pcc"]);
function titleCase(value: string): string {
  return value.replace(/[A-Za-z][A-Za-z-]*/g, (word) => {
    const lower = word.toLowerCase();
    if (ACRONYMS.has(lower)) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

// Coded enum values (e.g. the eligibility "goal" field) mapped to human labels.
const GOAL_LABELS: Record<string, string> = {
  pr: "Permanent residency",
  "work-visa": "Work visa",
  citizenship: "Citizenship",
  investment: "Investment",
  "business-setup": "Business setup",
  "family-migration": "Family migration",
  "not-sure": "Open / advisor-led",
};
/** Render a coded enum value (goal/track style) as a proper human label. */
function codedLabel(value: unknown): string {
  const raw = str(value);
  if (!raw) return "";
  const key = raw.toLowerCase();
  if (GOAL_LABELS[key]) return GOAL_LABELS[key];
  return titleCase(raw.replace(/[-_]+/g, " "));
}
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function dateLabel(): string {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

/* ------------------------------------------------------------------ *
 * Document model
 * ------------------------------------------------------------------ */
type DocGroup =
  | "Identity"
  | "Civil"
  | "Academic & Professional"
  | "Financial & Funds"
  | "Programme-specific"
  | "Health & Character";

type DocItem = {
  name: string;
  group: DocGroup;
  required: boolean;
  notes: string;
};

// The skilled ProgramMeta type does not declare documentChecklist, but the MDX
// frontmatter carries it (it survives normalization via spread). Read it through
// a narrow structural view rather than an `any`-cast.
type ChecklistGroup = { group?: unknown; documents?: unknown; notes?: unknown };
type ProgramWithChecklist = ProgramMeta & { documentChecklist?: unknown };

const GROUP_ORDER: DocGroup[] = [
  "Identity",
  "Civil",
  "Academic & Professional",
  "Financial & Funds",
  "Programme-specific",
  "Health & Character",
];

/** Map a free-text MDX group label onto one of our canonical categories. */
function classifyGroup(label: string): DocGroup {
  const l = label.toLowerCase();
  if (/(identity|passport|id\b|biometric)/.test(l)) return "Identity";
  if (/(civil|birth|marriage|family|relationship|dependant|dependent)/.test(l)) return "Civil";
  if (/(education|credential|academic|qualif|degree|employ|work|professional|experience|skill|language|english)/.test(l))
    return "Academic & Professional";
  if (/(fund|finance|financial|bank|salary|income|tax|settlement|proof of funds|net worth)/.test(l))
    return "Financial & Funds";
  if (/(health|medical|police|character|clearance|pcc|security)/.test(l)) return "Health & Character";
  return "Programme-specific";
}

/** A strong, indicative generic checklist used when no programme match is found. */
function genericChecklist(): DocItem[] {
  return [
    { name: "Valid passport (all pages, 6+ months validity)", group: "Identity", required: true, notes: "Primary applicant and each dependant." },
    { name: "National identity / residence card", group: "Identity", required: false, notes: "Where issued in your country of residence." },
    { name: "Recent passport-style photographs", group: "Identity", required: true, notes: "Meet biometric specification for the destination." },
    { name: "Birth certificate", group: "Civil", required: true, notes: "Long-form, for applicant and dependants." },
    { name: "Marriage / partnership certificate", group: "Civil", required: false, notes: "If applying with a spouse or partner." },
    { name: "Children's documents", group: "Civil", required: false, notes: "Birth certificates and consent letters where relevant." },
    { name: "Degree certificates and transcripts", group: "Academic & Professional", required: true, notes: "Plus credential assessment if required." },
    { name: "Employment reference letters", group: "Academic & Professional", required: true, notes: "On letterhead, with role, dates and duties." },
    { name: "CV / résumé", group: "Academic & Professional", required: true, notes: "Consistent with reference letters and timeline." },
    { name: "Language test results", group: "Academic & Professional", required: false, notes: "IELTS / PTE / TOEFL where the route requires it." },
    { name: "Proof of funds / bank statements", group: "Financial & Funds", required: true, notes: "Typically 3-6 months, showing maintained balances." },
    { name: "Source-of-funds evidence", group: "Financial & Funds", required: true, notes: "Trace the origin of savings and investment capital." },
    { name: "Tax returns", group: "Financial & Funds", required: false, notes: "Most recent assessment years where applicable." },
    { name: "Police clearance certificate", group: "Health & Character", required: true, notes: "From each country of long-term residence." },
    { name: "Medical examination report", group: "Health & Character", required: false, notes: "From an approved panel physician when requested." },
  ];
}

/** Build the document list from programme MDX content, with rich fallbacks. */
function buildDocList(program?: ProgramWithChecklist): { items: DocItem[]; indicative: boolean } {
  const items: DocItem[] = [];
  const seen = new Set<string>();
  const push = (item: DocItem) => {
    const key = item.name.toLowerCase();
    if (item.name && !seen.has(key)) {
      seen.add(key);
      items.push(item);
    }
  };

  // 1) Authored documentChecklist groups (the richest source).
  const raw = program?.documentChecklist;
  if (Array.isArray(raw)) {
    for (const g of raw as ChecklistGroup[]) {
      const label = str(g?.group) || "Programme-specific";
      const group = classifyGroup(label);
      const docs = Array.isArray(g?.documents) ? (g.documents as unknown[]) : [];
      const groupNote = str(g?.notes);
      for (const d of docs) {
        const name = str(d);
        if (name) {
          push({
            name,
            group,
            required: group !== "Health & Character",
            notes: groupNote || `Filed under ${label}.`,
          });
        }
      }
    }
  }

  // 2) Programme requirements that read like document obligations.
  for (const req of program?.requirements ?? []) {
    const name = str(req);
    if (!name) continue;
    if (/(provide|proof|certificate|document|evidence|assessment|results|statement|letter|valid)/i.test(name)) {
      push({
        name: name.replace(/\.$/, ""),
        group: classifyGroup(name),
        required: true,
        notes: "Drawn from the programme's eligibility requirements.",
      });
    }
  }

  // 3) Proof-of-funds rows become explicit financial evidence lines.
  for (const pf of program?.proofOfFunds ?? []) {
    const label = str(pf?.label) || "Proof of funds";
    const amount = typeof pf?.amount === "number" ? pf.amount : undefined;
    const cur = str(pf?.currency);
    push({
      name: label,
      group: "Financial & Funds",
      required: true,
      notes: amount ? `Evidence at least ${cur ? `${cur} ` : ""}${amount.toLocaleString("en-US")}.` : "Maintain documented balances.",
    });
  }

  // 4) Language tests, if the route names them.
  const tests = program?.language?.tests ?? [];
  if (tests.length) {
    push({
      name: `Approved language test result (${tests.slice(0, 3).join(" / ")})`,
      group: "Academic & Professional",
      required: true,
      notes: program?.language?.minLevel ? `Meet minimum: ${program.language.minLevel}.` : "Meet the route's minimum band score.",
    });
  }

  // If the programme yielded too little, layer in the indicative generic list.
  const indicative = items.length < 6;
  if (indicative) {
    for (const item of genericChecklist()) push(item);
  }

  return { items, indicative };
}

/* ------------------------------------------------------------------ *
 * Programme resolution
 * ------------------------------------------------------------------ */
type Resolved = {
  program?: ProgramWithChecklist;
  countryLabel: string;
  programLabel: string;
};

function resolveProgramme(order: JiopayOrder): Resolved {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const countryInput = str(order.country ?? a.country ?? a.destination);
  const programInput = str(order.program ?? a.program ?? a.route ?? order.productName);
  const cSlug = slugify(countryInput);
  const pSlug = slugify(programInput);

  let program: ProgramWithChecklist | undefined;

  // Exact slug match first.
  if (cSlug && pSlug) {
    try {
      program = getProgramFrontmatter(cSlug, pSlug) as ProgramWithChecklist;
    } catch {
      program = undefined;
    }
  }

  // Fuzzy match across the skilled catalogue by country + title/slug tokens.
  if (!program) {
    let pool: ProgramMeta[] = [];
    try {
      pool = getSkilledPrograms(cSlug || undefined);
    } catch {
      pool = [];
    }
    if (!pool.length && cSlug) {
      try {
        pool = getSkilledPrograms();
      } catch {
        pool = [];
      }
    }
    const wantP = pSlug.replace(/-/g, " ");
    const requestedIds = wantP.match(/\b(?:subclass\s*)?\d{3}\b|\b(?:eb|o|h)\s*\d+[a-z]?\b/g)?.map((item) => item.replace(/\s+/g, "")) ?? [];
    const identifierMatch = requestedIds.length
      ? pool.find((p) => {
          const candidate = `${p.title} ${p.programSlug}`.toLowerCase().replace(/[^a-z0-9]+/g, " ");
          const candidateIds = new Set(candidate.match(/\b(?:subclass\s*)?\d{3}\b|\b(?:eb|o|h)\s*\d+[a-z]?\b/g)?.map((item) => item.replace(/\s+/g, "")) ?? []);
          return requestedIds.some((value) => candidateIds.has(value));
        })
      : undefined;
    const match =
      pool.find((p) => p.programSlug === pSlug) ??
      identifierMatch ??
      pool.find((p) => programInput && p.title.toLowerCase().includes(wantP)) ??
      pool.find((p) => cSlug && p.countrySlug === cSlug);
    if (match) program = match as ProgramWithChecklist;
  }

  return {
    program,
    countryLabel: program?.country || (countryInput ? titleCase(countryInput) : "Your destination"),
    programLabel: program?.title || (programInput ? titleCase(programInput) : "Your selected programme"),
  };
}

/* ------------------------------------------------------------------ *
 * Readiness scoring (computed from the resolved checklist)
 * ------------------------------------------------------------------ */
function groupTone(group: DocGroup): PillTone {
  switch (group) {
    case "Identity":
    case "Civil":
      return "good";
    case "Financial & Funds":
    case "Programme-specific":
      return "warn";
    default:
      return "muted";
  }
}

export async function buildDocsReport(order: JiopayOrder): Promise<Buffer> {
  const a = (order.answers ?? {}) as Record<string, unknown>;
  const clientCase = buildClientCase(order);
  const personalisation = assessPersonalisation(clientCase);
  const { program, countryLabel, programLabel } = resolveProgramme(order);
  const { items, indicative } = buildDocList(program);
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const imgs = allocateReportImages(await loadCountryImages(order.country), "docs", order.merchantTxnNo);

  const family = toBool(a.family ?? a.familyMembers);
  const timelineMonths = toInt(a.timeline ?? a.timelineMonths ?? program?.timelineMonths, program?.timelineMonths ?? 9);
  const goalLabel = codedLabel(a.goal ?? a.objective ?? order.track);

  // Coverage metrics.
  const total = items.length;
  const required = items.filter((d) => d.required).length;
  const groupsPresent = new Set(items.map((d) => d.group));
  const coveredGroups = GROUP_ORDER.filter((g) => groupsPresent.has(g));
  const fundsCount = items.filter((d) => d.group === "Financial & Funds").length;
  const programmeSpecific = items.filter((d) => d.group === "Programme-specific").length;

  const readiness = verifiedDocumentReadiness(clientCase.documents);
  // Checklist coverage measures report quality, not the client's readiness.
  const breadthScore = clampScore((coveredGroups.length / GROUP_ORDER.length) * 100);
  const checklistDepth = clampScore(Math.min(100, 35 + total * 4));
  const fundsScore = clientCase.documents.length
    ? clampScore((clientCase.documents.filter((item) => item.status === "verified" && /(fund|bank|tax|income|salary|financial)/i.test(item.name)).length / Math.max(1, fundsCount)) * 100)
    : undefined;
  const matchScore = indicative ? 52 : 84;
  const overall = clientCase.advisor.documentReadinessScore.value ?? readiness.score;
  const readinessLabel =
    overall === undefined ? "Not assessed" : overall >= 78 ? "Well prepared" : overall >= 60 ? "On track" : overall >= 45 ? "Building" : "Early stage";

  const reportTitle = "Document Readiness Report";
  const ref = order.merchantTxnNo;
  const foot = (label: string) => runningFooter("XIPHIAS Immigration Private Limited · Document Readiness", label);
  const head = runningHeader(reportTitle, { country: countryLabel, route: program?.title });
  const basisPage = reportBasisPage({ header: head, footer: foot("Candidate profile"), basis: reportBasis(clientCase, personalisation) });

  /* 1 — Cover */
  const cover = coverPage({
    logoDataUri: logo,
    coverBgDataUri: coverBg,
    cardImageDataUri: imgs[1] ?? imgs[0],
    heroImageDataUri: imgs[0],
    eyebrow: "Document Readiness",
    title: "Document Readiness Report",
    preparedFor: order.customer.name,
    profileLine: caseCoverProfileLine(clientCase),
    subtitle:
      "A personalised document checklist and readiness assessment for your selected destination and programme — grouped by category, prioritised by impact, and built for verifiable evidence.",
    chips: [
      `Destination: ${countryLabel}`,
      `Programme: ${programLabel}`,
      ...(goalLabel ? [`Goal: ${goalLabel}`] : []),
      family ? "Dependants included" : "Primary applicant only",
      indicative ? "Indicative checklist" : "Programme-matched",
    ],
    fitScore: overall,
    fitLabel: `${readinessLabel} · ${clientCase.documents.length ? `${clientCase.documents.length} client records` : "inventory required"}`,
    countryLabel,
    dateLabel: dateLabel(),
  });

  /* 2 — Brief / what this is built on */
  const briefCards = grid(3, [
    card({ k: "Destination", v: countryLabel }),
    card({ k: "Programme", v: programLabel }),
    card({ k: "Checklist source", v: indicative ? "Indicative generic" : "Matched programme" }),
    card({ k: "Documents listed", v: `${total} items` }),
    card({ k: "Mandatory items", v: `${required} required` }),
    card({ k: "Target window", v: `${timelineMonths} months` }),
  ]);
  const briefPage = page({
    header: head,
    body:
      heroBand(imgs[0], {
        eyebrow: `Document readiness · ${countryLabel}`,
        title: programLabel,
      }) +
      sectionHeader({
        eyebrow: "Assessment brief",
        title: "What this readiness report covers",
        desc: indicative
          ? "We could not match an exact programme, so this report uses a strong, indicative immigration document checklist grouped by category. Confirm the final list against your route with a XIPHIAS advisor."
          : `Your checklist is built from approved XIPHIAS programme content for ${programLabel} (${countryLabel}), grouped by category and prioritised so you collect the highest-impact evidence first.`,
      }) +
      briefCards +
      `<div class="spacer-16"></div>` +
      callout({
        k: "How to use this report",
        text: "Work top-down through each category. Treat the status column as your live tracker — mark items as you gather them — and close the priority gaps on the dedicated page before booking biometrics or filing.",
      }),
    footer: foot("02"),
  });

  /* 3 — Readiness overview + scorecard */
  const overviewPage = splitPage({
    header: head,
    footer: foot("03"),
    imageDataUri: imgs[3 % imgs.length] ?? imgs[0],
    capEyebrow: countryLabel,
    capTitle: "Readiness scorecard",
    content:
      sectionHeader({
        eyebrow: "Readiness overview",
        title: "Your document-readiness scorecard",
        desc: clientCase.documents.length ? "Readiness is calculated from the status of the client's actual document inventory. Checklist breadth is shown separately." : "No client document inventory was supplied, so personal readiness is intentionally unscored. The checklist below shows possible requirements.",
      }) +
      (overall !== undefined ? scoreBar({ label: "Overall document readiness", value: overall, tag: readinessLabel }) : callout({ k: "Readiness not assessed", text: "Add the client's document inventory and statuses to calculate a truthful score." })) +
      scoreBar({ label: "Checklist category coverage", value: breadthScore, tag: `${coveredGroups.length} of ${GROUP_ORDER.length} categories in scope` }) +
      scoreBar({ label: "Checklist depth", value: checklistDepth, tag: `${total} possible documents identified` }) +
      scoreBar({ label: "Programme match", value: matchScore, tag: indicative ? "Indicative — confirm route" : "Matched to your programme" }) +
      (fundsScore !== undefined ? scoreBar({ label: "Verified funds evidence", value: fundsScore, tag: `${fundsCount} possible financial items` }) : "") +
      `<div class="spacer-16"></div>` +
      grid(3, [
        card({ k: "Categories in scope", v: `${coveredGroups.length} / ${GROUP_ORDER.length}`, note: coveredGroups.join(" · ") }),
        card({ k: "Required documents", v: `${required}`, note: "Mandatory for a complete submission." }),
        card({ k: "Programme-specific", v: `${programmeSpecific}`, note: "Route-unique evidence to prepare early." }),
      ]),
  });

  /* 4 (+5) — Grouped checklist table(s) */
  const ordered = [...items].sort((x, y) => {
    const gi = GROUP_ORDER.indexOf(x.group) - GROUP_ORDER.indexOf(y.group);
    if (gi !== 0) return gi;
    return Number(y.required) - Number(x.required);
  });
  const inventoryStatus = (d: DocItem): ClientDocument | undefined => {
    const exact = clientCase.documents.find((item) => item.name.toLowerCase() === d.name.toLowerCase());
    if (exact) return exact;
    const category = documentCategory(d.name);
    return category ? clientCase.documents.find((item) => documentCategory(item.name) === category) : undefined;
  };
  const toRow = (d: DocItem): string[] => [
    `<strong>${esc(d.name)}</strong>`,
    pill(d.group, groupTone(d.group)),
    d.required ? pill("Required", "bad") : pill("If applicable", "muted"),
    (() => {
      const found = inventoryStatus(d);
      if (!found) return pill("Not assessed", "muted");
      if (found.status === "verified") return pill("Verified", "good");
      if (found.status === "expired" || found.status === "rejected") return pill(titleCase(found.status), "bad");
      if (found.status === "available" || found.status === "uploaded") return pill(titleCase(found.status), "warn");
      return pill(titleCase(found.status), "muted");
    })(),
  ];
  const headCols = ["Document", "Group", "Required?", "Status"];

  // Paginate the table: ~10 rows fit comfortably on the first checklist page once the
  // multi-line Document/Notes columns are accounted for.
  const FIRST = 7;
  const firstRows = ordered.slice(0, FIRST).map(toRow);
  const restRows = ordered.slice(FIRST).map(toRow);

  const checklistPage = page({
    header: head,
    body:
      sectionHeader({
        eyebrow: "Document checklist",
        title: "Your grouped document checklist",
        desc: "Every document you should prepare, grouped by category. Use the status column as a live tracker as you collect each item.",
      }) +
      table({ head: headCols, rows: firstRows }) +
      (restRows.length ? "" : `<div class="spacer-16"></div>` + callout({
        k: "Tracking tip",
        text: "Save a dated copy of every certified document in a single folder named by category. Consistent naming prevents the duplication and version errors that slow most applications.",
      })),
    footer: foot("04"),
  });

  const checklistPage2 = restRows.length
    ? page({
        header: head,
        body:
          sectionHeader({
            eyebrow: "Document checklist (continued)",
            title: "Checklist — continued",
            desc: "Remaining documents to prepare for a complete, consistent submission.",
          }) +
          table({ head: headCols, rows: restRows }) +
          `<div class="spacer-16"></div>` +
          callout({
            k: "Tracking tip",
            text: "Save a dated copy of every certified document in a single folder named by category. Consistent naming prevents the duplication and version errors that slow most applications.",
          }),
        footer: foot("05"),
      })
    : "";

  /* 6 — Highest-priority gaps */
  const priorityDocs = ordered.filter((d) => {
    const status = inventoryStatus(d)?.status;
    return d.required && status !== "verified" && (d.group === "Financial & Funds" || d.group === "Programme-specific");
  }).slice(0, 2);
  const fallbackPriority = ordered.filter((d) => d.required).slice(0, 2);
  const gaps = (priorityDocs.length ? priorityDocs : fallbackPriority).map((d, i) =>
    card({
      k: `Priority ${i + 1} · ${d.group}`,
      v: d.name,
      note: `${d.notes} These items take the longest to source, so start them first.`,
    }),
  );
  const gapsPage = splitPage({
    header: head,
    footer: foot(restRows.length ? "06" : "05"),
    imageDataUri: imgs[4 % imgs.length] ?? imgs[0],
    capEyebrow: "Close these first",
    capTitle: "Priority gaps",
    content:
      sectionHeader({
        eyebrow: "Close these first",
        title: "Your highest-priority gaps",
        desc: "The documents that most often gate a submission — long lead times, third-party issuers, or programme-unique proof. Start these immediately.",
      }) +
      (gaps.length ? `<div class="grid">${gaps.join("")}</div>` : callout({ k: "No critical gaps flagged", text: "Your core documents look straightforward. Confirm specifics with your advisor." })) +
      `<div class="spacer-16"></div>` +
      sectionHeader({ title: "Common pitfalls to avoid" }) +
      ticks([
        "Name, date-of-birth and spelling mismatches across passport, certificates and references.",
        "Expired credential assessments or language results (most have a validity window).",
        "Bank statements that show large unexplained deposits without a source-of-funds trail.",
        ...(program?.disqualifiers?.slice(0, 1).map((d) => str(d).replace(/\.$/, "")) ?? []),
      ].filter(Boolean)),
  });

  /* 7 — Collection action plan / timeline */
  const processSteps: Step[] = program?.processSteps ?? [];
  const planSteps = processSteps.length
    ? processSteps.slice(0, 6).map((s) => ({ title: str(s.title) || "Step", body: str(s.description) || "Confirm details with your advisor." }))
    : [
        { title: "Gather identity & civil records", body: "Passport, national ID, birth and marriage certificates for the applicant and any dependants." },
        { title: "Order long-lead documents", body: "Police clearances, credential assessments and language tests — request these first as they take weeks." },
        { title: "Assemble professional evidence", body: "Reference letters, payslips and tax records that are internally consistent with your CV and timeline." },
        { title: "Build the funds file", body: "Bank statements plus a clean source-of-funds trail for any savings or investment capital." },
        { title: "Certify & translate", body: "Have copies certified and obtain certified translations where the destination requires them." },
        { title: "Advisor verification", body: "A XIPHIAS advisor reviews the complete pack against current rules before you file." },
      ];
  const planPage = page({
    header: head,
    body:
      heroBand(imgs[2] ?? imgs[1] ?? imgs[0], {
        eyebrow: "Collection roadmap",
        title: `Your path to ${countryLabel}`,
      }) +
      sectionHeader({
        eyebrow: "Collection plan",
        title: "Your document collection roadmap",
        desc: `A focused sequence to assemble a complete, verifiable pack within your ${timelineMonths}-month window.`,
      }) +
      steps(planSteps) +
      `<div class="spacer-24"></div>` +
      sectionHeader({ title: "Suggested cadence" }) +
      grid(3, [
        card({ k: "Weeks 1-3", v: "Order long-lead items", note: "Police clearances, ECAs, language tests — issuers control the timing." }),
        card({ k: "Weeks 3-8", v: "Assemble core pack", note: "Identity, civil, professional and funds evidence." }),
        card({ k: "Weeks 8-10", v: "Certify & verify", note: "Certified copies, translations, then advisor review before filing." }),
      ]),
    footer: foot(restRows.length ? "07" : "06"),
  });

  /* 8 — Tips for verifiable evidence */
  const evidencePage = splitPage({
    header: head,
    footer: foot(restRows.length ? "08" : "07"),
    imageDataUri: imgs[5 % imgs.length] ?? imgs[0],
    capEyebrow: "Evidence quality",
    capTitle: "Verifiable evidence",
    content:
      sectionHeader({
        eyebrow: "Evidence quality",
        title: "Making your evidence verifiable",
        desc: "Approvals turn on how credible and consistent your evidence is — not just whether a document exists. Apply these standards to every item.",
      }) +
      grid(2, [
        card({ k: "Consistency", v: "One identity, everywhere", note: "Names, dates and addresses must match exactly across every document." }),
        card({ k: "Traceability", v: "Show the paper trail", note: "Funds, employment and qualifications should each trace to an independent, verifiable source." }),
        card({ k: "Certification", v: "Certified & current", note: "Use certified copies and certified translations; watch validity windows on tests and assessments." }),
        card({ k: "Completeness", v: "No silent gaps", note: "Explain any employment or residence gaps proactively with a short cover note." }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({ k: "File-control standard", text: "Keep certified originals safe, use official issuers, attach certified translations, and retain only the current dated version of each file." }),
  });

  const summaryHeading = overall === undefined
    ? "Record document statuses before assessing readiness"
    : overall >= 80
      ? "Validate the document pack"
      : overall >= 50
        ? "Close the priority document gaps"
        : "Build the document pack before filing";

  /* 9 — Report close (dark) */
  const summaryPage = page({
    dark: true,
    body:
      `<div class="eyebrow">Report summary</div>` +
      `<h2 class="h-section" style="color:#fff;margin-top:8px;">${esc(summaryHeading)}</h2>` +
      `<p class="lead" style="margin-top:10px;max-width:150mm;">${esc(
        `You have ${total} documents mapped across ${coveredGroups.length} categories for ${programLabel} in ${countryLabel}. Close the priority gaps first, hold your evidence to the verifiability standards, then book an advisor review before filing.`,
      )}</p>` +
      `<div class="spacer-24"></div>` +
      grid(3, [
        card({ dark: true, k: "Readiness", v: overall !== undefined ? `${overall} / 100` : "Not assessed" }),
        card({ dark: true, k: "Documents", v: `${total} mapped` }),
        card({ dark: true, k: "Next service", v: "Document verification" }),
      ]) +
      `<div class="spacer-24"></div>` +
      `<div class="callout"><div class="callout__k">Talk to the advisory desk</div><p>XIPHIAS Immigration Advisory Desk · immigration@xiphias.in · www.xiphiasimmigration.com</p></div>` +
      disclaimer(
        "This automated document-readiness report was generated from your submitted inputs and XIPHIAS programme content. It has not been independently verified by an advisor. It is not legal advice and does not guarantee any government or visa-office decision. Document requirements, fees and timelines change; the final checklist must be confirmed by a XIPHIAS advisor against current rules before you file or pay any government or third-party fees.",
      ),
    footer: runningFooter(`Reference ${ref}`, "Private client advisory report"),
  });

  const bodyHtml = cleanReportPunctuation([
    cover,
    basisPage,
    briefPage,
    checklistPage,
    checklistPage2,
    gapsPage,
    planPage,
    evidencePage,
    ...buildCompanyProfilePages({ header: head, footer: foot }),
    summaryPage,
  ].join(""));

  return renderReportPdf({ title: `XIPHIAS ${reportTitle}`, bodyHtml });
}
