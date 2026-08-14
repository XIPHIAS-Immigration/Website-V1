const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");
const outputDir = path.join(root, "output", "pdf");
const scratchDir = path.join(root, "tmp", "candidate-report");
const basePdfPath = path.join(scratchDir, "mohammed-abdul-azim-base.pdf");
const customPdfPath = path.join(scratchDir, "mohammed-abdul-azim-custom.pdf");
const outputPdfPath = path.join(outputDir, "mohammed-abdul-azim-australia-skilled-migration-assessment.pdf");

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, parent, isMain);
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function patchedResolve(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@/")) {
    request = path.join(root, "src", request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

require.extensions[".ts"] = function transpileTypeScript(module, filename) {
  let source = fs.readFileSync(filename, "utf8")
    .replaceAll("Â·", " | ")
    .replaceAll("â€“", "-")
    .replaceAll("â€”", "-")
    .replaceAll("â†’", "->")
    .replaceAll("Ã—", "x");
  const compiled = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      resolveJsonModule: true,
    },
  }).outputText;
  module._compile(compiled, filename);
};

const { buildDeepAnalysisReport } = require(path.join(root, "src/lib/reports/templates/deep-analysis.ts"));
const {
  bigStats,
  callout,
  card,
  disclaimer,
  esc,
  grid,
  page,
  pill,
  runningFooter,
  runningHeader,
  sectionHeader,
  steps,
  table,
  ticks,
} = require(path.join(root, "src/lib/reports/components.ts"));
const { renderReportPdf } = require(path.join(root, "src/lib/reports/render.ts"));

const preparedAt = "2026-08-13T18:30:00+05:30";
const reference = "XIA-AUS-MAA-20260813";
const sources = [
  "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect",
  "https://immi.homeaffairs.gov.au/visas/working-in-australia/skillselect/expression-of-interest",
  "https://immi.homeaffairs.gov.au/visas/working-in-australia/skills-assessment",
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189/points-tested",
  "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-nominated-190",
  "https://immi.homeaffairs.gov.au/Visa-subsite/Pages/work/491-skilled-work-regional.aspx",
  "https://immi.homeaffairs.gov.au/supporting/Pages/Work/491-points-table.aspx",
  "https://www.acs.org.au/msa/information-for-applicants/occupations-anzsco-codes/information-technology.html",
  "https://www.acs.org.au/msa/infohub.html",
];

const order = {
  merchantTxnNo: reference,
  amountInr: 799,
  productType: "deep_analysis",
  productName: "Australia Skilled Migration Deep Analysis",
  customer: { name: "Mohammed Abdul Azim", email: "" },
  track: "skilled",
  country: "australia",
  program: "Australia Skilled Independent Visa (subclass 189)",
  status: "paid",
  createdAt: preparedAt,
  updatedAt: preparedAt,
  events: [{ type: "manual_report_requested", at: preparedAt }],
  answers: {
    manuallyPrepared: true,
    dataSource: "Candidate assessment workbook supplied 13 August 2026",
    preparedAt,
    reviewStatus: "draft",
    currentLocation: "Bengaluru, India",
    currentCountry: "India",
    age: 25,
    ageSource: "DOB 13 July 2001 in the points-assessment section of the supplied workbook",
    goal: "permanent-residency",
    track: "skilled",
    destination: "Australia",
    targetCountries: ["Australia"],
    selectedProgrammes: [
      "Australia Skilled Independent Visa (subclass 189)",
      "Australia Skilled Nominated Visa (subclass 190)",
      "Australia Skilled Work Regional Visa (subclass 491)",
    ],
    fallbackProgrammes: ["Employer-sponsored pathway, subject to a qualifying role and sponsor"],
    priority: "Establish a defensible ACS occupation and points position before submitting an EOI",
    notes: "Permanent residence through Australia skilled migration, with subclass 189, 190 and 491 assessed in parallel.",
    role: "Senior Tech Engineer",
    occupation: "Senior Tech Engineer - Unified Communications and IT Infrastructure",
    field: "technology",
    education: "master",
    qualification: "Bachelor of Computer Applications (Computer Science) and MBA (Information Technology Management)",
    yearsExperience: 4,
    experience: 4,
    languageTest: "not-provided",
    skillsAssessment: "Not completed. Potential ACS assessment against ICT Support Engineer (ANZSCO 263212) requires formal duty and qualification review.",
    cpa: "Good - subject to formal assessment and employment evidence",
    assessingBody: "Australian Computer Society (ACS)",
    employer: "HP Inc",
    employerOrBusiness: "HP Inc",
    proposedEndeavour: "Continue in enterprise unified communications, infrastructure support and service-reliability roles in Australia.",
    profileSummary: "Mohammed Abdul Azim is a Bengaluru-based Senior Tech Engineer at HP Inc with 4+ years of stated ICT experience across unified communications, enterprise support and infrastructure. The supplied assessment records responsibility for 500+ UC endpoints, 99.5% uptime, 1,000+ escalations resolved, 85% repeat-incident prevention and training of 30+ engineers. Technologies include Polycom, Microsoft Teams, Zoom, Cisco, VoIP, SIP, H.323, Azure, AWS, VMware, Citrix and Active Directory. These claims require documentary verification and exact duty mapping before they can support an ACS or visa claim.",
    resumeParseStatus: "needs-review",
    advancedDegree: true,
    leadership: true,
    criticalRole: true,
    businessImpact: true,
    evidenceNotes: "Achievement metrics are stated in the supplied workbook; underlying employer records, references and supporting exhibits were not supplied for this report.",
    citationCount: 0,
    publicationCount: 0,
    patentCount: 0,
    maritalStatus: "Not provided",
    familyDetails: "Partner and dependant details were not supplied; partner points and family-document requirements remain open.",
    refusals: "Not provided",
    documents: [
      { name: "Candidate Australia assessment workbook", status: "available", notes: "Source supplied for this report" },
      { name: "Current passport bio-data page", status: "missing" },
      { name: "BCA degree certificate and complete transcripts", status: "missing" },
      { name: "MBA degree certificate and complete transcripts", status: "missing" },
      { name: "Detailed employment references with dates, hours and duties", status: "missing" },
      { name: "Employment contracts, payslips and tax/payment evidence", status: "missing" },
      { name: "English test result", status: "missing" },
      { name: "ACS skills assessment outcome", status: "missing" },
      { name: "Partner and dependant documents", status: "missing" },
    ],
    executiveSummary: "The workbook records a promising profile for further Australia General Skilled Migration assessment, but the case is not yet EOI-ready. The decisive gates are the ACS outcome, claimable employment, English result, partner status and evidence for every claimed point.",
    advisorRecommendation: "Assess subclasses 189, 190 and 491 in parallel after confirming the ACS occupation, claimable employment and English result. Use the workbook point ranges exactly as recorded until the supporting evidence and final outcome are available.",
    customRisks: [
      "Overseas-employment points remain subject to ACS and evidence.",
      "English, partner status and supporting documents remain open.",
      "ICT Support Engineer 263212 remains a proposed occupation pending ACS.",
    ],
    nextActions: [
      "Prepare the ACS duty-and-evidence mapping.",
      "Collect education and complete employment records.",
      "Complete English testing, then verify all three route scores.",
    ],
    advisorNotes: "Workbook values are preserved exactly; starred ranges remain subject to the workbook's stated verification conditions.",
    factualSources: ["Official Home Affairs and ACS references are listed on the audit-trail page."],
    routeFitScore: 90,
  },
};

function customPages() {
  const title = "Australia Skilled Migration Assessment";
  const head = runningHeader(title, { country: "Australia", route: "Subclass 189 | 190 | 491" });
  const foot = (label) => runningFooter("XIPHIAS Immigration Private Limited | Candidate Assessment", label);

  const profilePage = page({
    header: head,
    footer: foot("Candidate-specific assessment"),
    body:
      sectionHeader({
        eyebrow: "Preliminary candidate assessment",
        title: "Mohammed Abdul Azim: decision summary",
        desc: "A candidate-specific reading of the supplied Australia assessment workbook, preserving its approved conclusions and structuring the evidence still required.",
      }) +
      bigStats([
        { k: "Age", v: "25", n: "DOB 13 July 2001" },
        { k: "Stated experience", v: "4+ years", n: "ACS-recognised period pending" },
        { k: "Current status", v: "Promising", n: "Not EOI-ready" },
      ]) +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Current role", v: "Senior Tech Engineer", note: "HP Inc | Bengaluru" }),
        card({ k: "Proposed occupation lens", v: "ICT Support Engineer", note: "ANZSCO 263212 | ACS outcome required" }),
        card({ k: "Education", v: "BCA + MBA", note: "Recognition and ICT-content review remain necessary" }),
        card({ k: "Core domain", v: "Unified Communications", note: "IT infrastructure and enterprise support" }),
        card({ k: "CPA", v: "Good", note: "Subject to formal assessment and employment evidence" }),
        card({ k: "Assessing body", v: "Australian Computer Society (ACS)", note: "For the proposed ICT Support Engineer occupation lens" }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Preliminary conclusion",
        text: "Proceed to evidence preparation and ACS occupation validation. Do not submit an EOI or rely on a final points score until English, partner status, claimable employment and the skills assessment are confirmed.",
      }),
  });

  const pointsRows = [
    ["Age", "25 years", "30", "Supported by DOB in workbook"],
    ["English", "Not provided", "0 / 10 / 20", "Competent / Proficient / Superior"],
    ["Overseas skilled employment", "4+ years stated", "10-15*", "Exact ACS-recognised period to be confirmed"],
    ["Education", "BCA + MBA", "15 provisional", "Requires recognised bachelor-level or higher qualification"],
    ["Australian study", "None stated", "0", "No claim identified"],
    ["Specialist education", "None stated", "0", "No eligible Australian research degree identified"],
    ["Professional Year", "Not provided", "0", "No claim identified"],
    ["Credentialled language", "Not provided", "0", "No NAATI claim identified"],
    ["Partner", "Not provided", "0 / 5 / 10", "Depends on relationship and partner evidence"],
    ["Subclass 190 nomination", "If nominated", "+5", "State criteria must be met"],
    ["Subclass 491 nomination/sponsorship", "If nominated or sponsored", "+15", "Regional obligations apply"],
  ].map((row) => row.map(esc));
  const corePointsRows = pointsRows.slice(0, 7);
  const additionalPointsRows = pointsRows.slice(7);

  const pointsPage = page({
    header: head,
    footer: foot("Workbook points assessment"),
    body:
      sectionHeader({
        eyebrow: "Points assessment",
        title: "Indicative points position",
        desc: "This table preserves the points position supplied in the candidate workbook. Starred and pending entries remain subject to ACS, English, partner and qualification verification.",
      }) +
      table({ head: ["Factor", "Recorded position", "Points", "Control"], rows: corePointsRows }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Workbook assessment basis",
        text: "The supplied assessment records 10-15 provisional overseas-employment points. The exact claimable period remains subject to ACS assessment and supporting employment evidence.",
      }),
  });

  const additionalPointsPage = page({
    header: head,
    footer: foot("Workbook points assessment continued"),
    body:
      sectionHeader({
        eyebrow: "Points assessment continued",
        title: "Additional factors and nomination points",
        desc: "These entries continue the workbook points position without changing any recorded value. Partner and nomination points remain conditional on the corresponding evidence and criteria.",
      }) +
      table({ head: ["Factor", "Recorded position", "Points", "Control"], rows: additionalPointsRows }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Workbook controls",
        text: "Partner points are not provided. Subclass 190 adds 5 points if nominated, while subclass 491 adds 15 points if nominated or sponsored, exactly as recorded in the workbook.",
      }),
  });

  const scenarioRows = [
    ["Base points", "Age + education + provisional overseas employment", "55-60*"],
    ["Superior English", "Base + 20 English points", "75-80*"],
    ["Subclass 190 total", "Base + English + 5 nomination points", "80-85*"],
    ["Subclass 491 total", "Base + English + 15 nomination/sponsorship points", "90-95*"],
  ].map((row) => row.map(esc));

  const scenarioPage = page({
    header: head,
    footer: foot("Points scenarios"),
    body:
      sectionHeader({
        eyebrow: "Scenario modelling",
        title: "How English and nomination change the score",
        desc: "Partner points of 0, 5 or 10 are not included below because relationship and partner evidence were not supplied. They must be assessed separately.",
      }) +
      table({ head: ["Scenario", "Adjustment", "Indicative total"], rows: scenarioRows }) +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Minimum threshold", v: "65 points", note: "Eligibility threshold, not an invitation guarantee" }),
        card({ k: "Most controllable lever", v: "English result", note: "Potential 0, 10 or 20 points" }),
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Decision rule",
        text: "Do not lodge the EOI until each point claim has a corresponding document and the final score is recalculated from the ACS outcome, English result and partner position.",
      }),
  });

  const occupationPage = page({
    header: head,
    footer: foot("ACS and occupation strategy"),
    body:
      sectionHeader({
        eyebrow: "Occupation control",
        title: "ACS assessment: ICT Support Engineer 263212",
        desc: "The proposed occupation is plausible, not confirmed. ACS describes this occupation around support strategies, systems and infrastructure problem-solving, technical direction and process improvement.",
      }) +
      grid(2, [
        card({ k: "Potential alignment", v: "Enterprise support", note: "UC endpoints, escalations, infrastructure and service reliability" }),
        card({ k: "Qualification lens", v: "BCA + MBA", note: "Course content and relevance must be evidenced" }),
        card({ k: "Duty evidence", v: "Not supplied", note: "References must show exact duties, dates, hours and remuneration" }),
        card({ k: "Claimable experience", v: "Pending", note: "ACS outcome and skilled-date treatment control the points" }),
      ]) +
      `<div class="spacer-16"></div>` +
      `<h3 class="h-sub">Build the occupation-mapping pack</h3>` +
      ticks([
        "Map each actual duty to the ACS description without copying occupational wording into employer letters.",
        "Separate hands-on troubleshooting from administration, coordination and people-management duties.",
        "Document the 500+ endpoints, 99.5% uptime, escalation volume and repeat-incident reduction with employer-verifiable records.",
        "Compare 263212 with adjacent ACS occupations before nomination; choose the occupation supported by the evidence, not the preferred visa result.",
      ]) +
      disclaimer("ACS, not XIPHIAS, determines the skills-assessment outcome. A plausible duty match is not a suitable skills assessment."),
  });

  const routeRows = [
    ["Subclass 189", pill("Benchmark", "warn"), "Permanent residence without state nomination", "Needs competitive documented score, eligible occupation, suitable assessment and invitation"],
    ["Subclass 190", pill("Priority to investigate", "good"), "Permanent residence with 5 nomination points", "State occupation, residency, work and selection settings vary"],
    ["Subclass 491", pill("Regional option", "warn"), "15 nomination/sponsorship points; provisional regional pathway", "Requires willingness to live/work regionally and later satisfy subclass 191 requirements"],
  ];
  const routePage = page({
    header: head,
    footer: foot("Route strategy"),
    body:
      sectionHeader({
        eyebrow: "Route portfolio",
        title: "How to sequence subclasses 189, 190 and 491",
        desc: "The three routes share core gates but differ in nomination, location flexibility, invitation dynamics and settlement structure.",
      }) +
      table({ head: ["Route", "Posture", "Potential value", "Main control"], rows: routeRows }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Recommended posture",
        text: "Keep 189 as the independence benchmark, actively assess 190 after occupation and state-list checks, and use 491 only where regional living and work obligations fit the candidate's genuine plan.",
      }) +
      `<div class="spacer-16"></div>` +
      disclaimer("An EOI is not a visa application and does not guarantee an invitation. A nomination or invitation does not guarantee visa grant."),
  });

  const evidencePage = page({
    header: head,
    footer: foot("Evidence plan"),
    body:
      sectionHeader({
        eyebrow: "Readiness plan",
        title: "Evidence required before EOI",
        desc: "The supplied workbook is an assessment input, not evidence of the claims it records. Assemble primary documents before any point is relied upon.",
      }) +
      table({
        head: ["Priority", "Evidence set", "Purpose"],
        rows: [
          ["1", "Passport, birth details and civil-status evidence", "Identity, age, family and partner points"],
          ["2", "BCA and MBA certificates, transcripts and course detail", "Qualification level, ICT content and ACS relevance"],
          ["3", "Employer references, contracts, payslips and tax/payment records", "Dates, hours, remuneration, duties and skilled-employment claim"],
          ["4", "English test result", "Minimum English gate and 0/10/20-point scenario"],
          ["5", "ACS outcome letter", "Nominated occupation and suitable skills-assessment gate"],
          ["6", "Achievement exhibits and technical records", "Corroborate scope, leadership and measurable impact"],
          ["7", "State/territory criteria evidence", "Subclass 190 or 491 nomination strategy"],
        ].map((row) => row.map(esc)),
      }) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Employment reference standard",
        text: "References should show the exact employment period, each position, full-time or part-time status, main duties, salary and authorised signatory details, supported by payment evidence.",
      }),
  });

  const actionPage = page({
    header: head,
    footer: foot("Execution plan"),
    body:
      sectionHeader({
        eyebrow: "Next 90 days",
        title: "From preliminary profile to EOI-ready file",
        desc: "The sequence protects against spending on a route before its occupation, evidence and points gates are established.",
      }) +
      steps([
        { title: "Weeks 1-2: fact and document audit", body: "Confirm nationality, passport, exact employment dates, weekly hours, partner status, immigration history and all education records." },
        { title: "Weeks 2-4: occupation mapping", body: "Compare actual duties with ACS occupations and prepare employer-reference drafts supported by contracts and payment records." },
        { title: "Weeks 3-8: English preparation and test", body: "Target the strongest realistic English result; do not assume 10 or 20 points until the result is available." },
        { title: "Weeks 4-10: ACS application", body: "Submit the correct pathway with complete qualifications and employment evidence; respond accurately to any request." },
        { title: "Weeks 10-12: final route decision", body: "Recalculate points, review current occupation and state settings, then decide whether to submit 189, 190 and/or 491 EOIs." },
      ]) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Immediate next appointment",
        text: "Run an advisor document review focused on ACS occupation selection, employment evidence and the English target. This is the highest-value next step for this profile.",
      }),
  });

  const sourcePage = page({
    header: head,
    footer: foot("Sources and limitations"),
    body:
      sectionHeader({
        eyebrow: "Audit trail",
        title: "Sources, assessment basis and limitations",
        desc: "Official sources were checked on 13 August 2026. Programme rules, invitation settings, fees and state criteria can change after the report date.",
      }) +
      `<h3 class="h-sub">Official sources</h3>` +
      ticks(sources) +
      `<div class="spacer-16"></div>` +
      callout({
        k: "Workbook values preserved",
        text: "The candidate facts, points ranges, programme conclusions and preliminary PROMISING status are reproduced from the supplied workbook without changing its approved assessment values.",
      }) +
      `<div class="spacer-16"></div>` +
      disclaimer("This is a preliminary advisory assessment, not legal advice or a guarantee of skills assessment, nomination, invitation or visa grant. Government and assessing authorities retain all decisions."),
  });

  return [profilePage, pointsPage, additionalPointsPage, scenarioPage, occupationPage, routePage, evidencePage, actionPage, sourcePage].join("");
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(scratchDir, { recursive: true });

  const basePdf = await buildDeepAnalysisReport(order);
  fs.writeFileSync(basePdfPath, basePdf);

  const customPdf = await renderReportPdf({
    title: "Mohammed Abdul Azim | Australia Skilled Migration Assessment",
    bodyHtml: customPages(),
    embedBrandFonts: true,
  });
  fs.writeFileSync(customPdfPath, customPdf);

  console.log(JSON.stringify({ basePdfPath, customPdfPath, outputPdfPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
