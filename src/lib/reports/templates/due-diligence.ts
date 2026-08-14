import "server-only";

import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { analysePaidDueDiligence, paidInputFromAnswers } from "@/lib/due-diligence-paid";
import { loadCountryHero, loadCoverBg, loadLogo } from "../assets";
import {
  callout,
  card,
  coverPage,
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
  type PillTone,
} from "../components";
import { buildCompanyProfilePages } from "../company-profile";
import { buildClientCase, caseCoverProfileLine } from "../client-case";
import { renderReportPdf } from "../render";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

function shown(value: unknown) {
  return text(value) || "Not provided";
}

function dateLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function severityTone(severity: "information" | "attention" | "high" | "hold"): PillTone {
  if (severity === "hold") return "bad";
  if (severity === "high" || severity === "attention") return "warn";
  return "muted";
}

function paragraphs(value: string) {
  return value
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((item) => `<p style="margin:0 0 3mm;line-height:1.6;">${esc(item)}</p>`)
    .join("");
}

function chunks<T>(items: T[], size: number) {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) output.push(items.slice(index, index + size));
  return output;
}

export async function buildDueDiligenceReport(order: JiopayOrder): Promise<Buffer> {
  const input = paidInputFromAnswers(order.answers);
  const analysis = analysePaidDueDiligence(input);
  const clientCase = buildClientCase(order);
  const country = text(order.country) || "Destination not provided";
  const programme = text(order.program) || "Programme not provided";
  const track = titleCase(text(order.track) || "Immigration");
  const logo = await loadLogo();
  const coverBg = await loadCoverBg();
  const countryHero = await loadCountryHero(country);
  const header = runningHeader("Immigration Due Diligence", { country, route: programme });
  let pageNo = 1;
  const footer = (label: string) => runningFooter(`${label} - ${order.merchantTxnNo}`, `Page ${pageNo++}`);

  const pages: string[] = [];
  pages.push(
    coverPage({
      logoDataUri: logo,
      coverBgDataUri: coverBg,
      heroImageDataUri: countryHero,
      eyebrow: "XIA Intelligence - Paid Due Diligence",
      title: "Immigration Due Diligence Report",
      subtitle: "A structured review of declared identity, history, evidence, funds and counterparties.",
      chips: [track, country, programme, "Client-supplied information"],
      fitScore: analysis.completeness,
      fitLabel: analysis.overallLabel,
      scoreTag: "Answer depth",
      countryLabel: country,
      preparedFor: order.customer.name,
      profileLine: caseCoverProfileLine(clientCase),
      dateLabel: dateLabel(),
      refLabel: order.merchantTxnNo,
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Executive assessment"),
      body:
        sectionHeader({
          eyebrow: "Executive assessment",
          title: analysis.overallLabel,
          desc: `${analysis.findings.length} preparation or risk finding${analysis.findings.length === 1 ? "" : "s"} generated from the paid intake. The ${analysis.completeness}% figure measures answer depth, not eligibility or clearance.`,
        }) +
        grid(3, [
          card({ k: "Answer depth", v: `${analysis.completeness}%`, note: "Completeness of core paid-intake fields" }),
          card({ k: "Findings", v: String(analysis.findings.length), note: "Includes missing evidence and declared concerns" }),
          card({ k: "Review status", v: "Draft - unverified", note: "No database or issuing-source clearance is implied" }),
        ]) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "What was purchased",
          text: `This INR ${order.amountInr.toLocaleString("en-IN")} product provides a deeper immigration-specific due-diligence intake, explainable risk mapping, evidence inventory and personalised action report. It does not include third-party KYC, sanctions, police, court, bank, employer, institution or document-authenticity fees.`,
        }) +
        `<div class="spacer-16"></div>` +
        sectionHeader({ eyebrow: "Case objective", title: "What the applicant wants reviewed" }) +
        (text(input.objectives)
          ? `<div class="card"><div class="card__v" style="font-size:12pt;">${paragraphs(input.objectives)}</div></div>`
          : callout({ k: "Not provided", text: "No detailed objective was entered in the paid intake." })) +
        `<div class="spacer-16"></div>` +
        disclaimer("This report is a structured preliminary due-diligence assessment, not legal advice, visa eligibility advice or a government, sanctions, criminal-record or document-authenticity clearance."),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Declared identity profile"),
      body:
        sectionHeader({
          eyebrow: "Identity profile",
          title: "Declared facts requiring reconciliation",
          desc: "These values were supplied by the purchaser. They have not been independently verified against original records.",
        }) +
        table({ head: ["Field", "Declared value"], rows: analysis.declaredFacts.map(([label, value]) => [esc(label), esc(value)]) }) +
        `<div class="spacer-16"></div>` +
        grid(2, [
          card({ k: "Family members", v: shown(input.familyMembers), note: "Applicants and related persons should be recorded separately before formal screening." }),
          card({ k: "Aliases and other names", v: shown(input.aliases), note: "Include spelling, transliteration, maiden and former names." }),
        ]) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "Identity control",
          text: "Reliable screening requires a valid passport plus name, alias, date-of-birth and nationality reconciliation. A name-only check creates avoidable false positives and missed matches.",
        }),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Immigration and character history"),
      body:
        sectionHeader({
          eyebrow: "Chronology and disclosure",
          title: "Immigration, travel and character history",
          desc: "A complete chronology helps prevent contradictions between previous applications and the next filing.",
        }) +
        table({
          head: ["Area", "Client declaration"],
          rows: [
            ["Countries lived in", shown(input.countriesLivedIn)],
            ["Travel history", shown(input.travelHistory)],
            ["Visa and status history", shown(input.visaHistory)],
            ["Refusals or cancellations", shown(input.refusalDetails)],
            ["Overstays, removals or status issues", shown(input.overstayDetails)],
            ["Legal, criminal or regulatory matters", shown(input.legalDetails)],
            ["PEP or public-office context", shown(input.pepDetails)],
          ].map((row) => row.map(esc)),
        }) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "Disclosure principle",
          text: "A previous refusal or legal event does not automatically determine an immigration outcome. Inconsistent or incomplete disclosure can create a separate and more serious credibility problem.",
        }),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Evidence inventory"),
      body:
        sectionHeader({
          eyebrow: "Evidence inventory",
          title: "What is available, partial or missing",
          desc: `Statuses are client declarations. No file was authenticated or issuer contacted as part of this INR ${order.amountInr.toLocaleString("en-IN")} report.`,
        }) +
        table({
          head: ["Evidence group", "Declared status", "Purpose"],
          rows: analysis.evidenceRows.map((row) => row.map(esc)),
        }) +
        `<div class="spacer-16"></div>` +
        disclaimer("A declared status describes the applicant's present evidence position. It is not a document-authenticity result or confirmation from an issuing authority."),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Evidence detail and assessment basis"),
      body:
        sectionHeader({
          eyebrow: "Evidence detail",
          title: "Chronology, assessment and document basis",
          desc: "These case-specific declarations should be reconciled against original evidence before any filing or reliance.",
        }) +
        grid(2, [
          card({ k: "Employment timeline", v: shown(input.employmentTimeline), note: "Compare dates, duties, salary and employer identity." }),
          card({ k: "Education timeline", v: shown(input.educationTimeline), note: "Compare awards, attendance and assessment outcomes." }),
          card({ k: "Gaps or overlaps", v: shown(input.timelineGaps), note: "Resolve month-by-month chronology inconsistencies." }),
          card({ k: "Document inconsistencies", v: shown(input.documentInconsistencies), note: "Never submit unresolved conflicting or altered evidence." }),
        ]) +
        `<div class="spacer-16"></div>` +
        grid(2, [
          card({ k: "CPA / profile assessment", v: shown(input.cpaAssessment), note: "Client-supplied assessment position; not recalculated in this report." }),
          card({ k: "Assessing body", v: shown(input.assessingBody), note: "Case-specific authority supplied in the paid intake." }),
        ]) +
        `<div class="spacer-16"></div>` +
        disclaimer("CPA and assessing-body values are reproduced from the paid intake. They are not recalculated, inferred from country logic or treated as formal assessment outcomes."),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Funds and wealth"),
      body:
        sectionHeader({
          eyebrow: "Financial due diligence",
          title: "Source of wealth and source of funds",
          desc: "Source of wealth explains how the applicant accumulated assets. Source of funds explains the specific capital used for the proposed immigration objective.",
        }) +
        table({
          head: ["Financial field", "Client declaration"],
          rows: [
            ["Source of wealth", shown(input.sourceOfWealth)],
            ["Source of funds", shown(input.sourceOfFunds)],
            ["Available funds", shown(input.availableFunds)],
            ["Annual income", shown(input.annualIncome)],
            ["Funds held for", shown(input.fundsHeldPeriod)],
            ["Large or unusual deposits", shown(input.largeDeposits)],
            ["Third-party funds", shown(input.thirdPartyDetails)],
            ["Financial evidence", shown(input.financialEvidence)],
          ].map((row) => row.map(esc)),
        }) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "Money-trail requirement",
          text: "Formal enhanced due diligence should trace each material amount from a lawful generating event, through every account or transfer, to the final payment or maintained-funds position.",
        }),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Counterparty review"),
      body:
        sectionHeader({
          eyebrow: "Third-party exposure",
          title: "Employer, sponsor, agent, developer, fund or business",
          desc: "Counterparty checks help protect both immigration credibility and financial safety.",
        }) +
        grid(2, [
          card({ k: "Counterparty type", v: shown(input.counterpartyType) }),
          card({ k: "Legal or trading name", v: shown(input.counterpartyName) }),
          card({ k: "Country", v: shown(input.counterpartyCountry) }),
          card({ k: "Checks completed", v: shown(input.counterpartyChecks) }),
        ]) +
        `<div class="spacer-16"></div>` +
        table({
          head: ["Review area", "Client declaration"],
          rows: [
            ["Payment instructions", shown(input.paymentInstructions)],
            ["Adverse concerns", shown(input.adverseConcerns)],
          ].map((row) => row.map(esc)),
        }) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "Independent checks still required",
          text: "A full counterparty review normally confirms registration, licences, beneficial ownership, authority, key people, litigation, enforcement, sanctions, adverse media and payment instructions through reliable sources.",
        }),
    }),
  );

  const findingGroups = chunks(analysis.findings, 5);
  if (!findingGroups.length) findingGroups.push([]);
  findingGroups.forEach((group, groupIndex) => {
    pages.push(
      page({
        header,
        footer: footer(`Findings ${groupIndex + 1}`),
        body:
          sectionHeader({
            eyebrow: `Explainable findings ${groupIndex + 1} of ${findingGroups.length}`,
            title: group.length ? "Risk, evidence and preparation findings" : "No rule-based issue declared",
            desc: group.length
              ? "Each finding records the observed client input and the action required before reliance or filing."
              : "Independent document, identity and provider verification remains necessary even when no issue was declared.",
          }) +
          (group.length
            ? table({
                head: ["Area", "Finding", "Action"],
                rows: group.map((finding) => [
                  `${pill(finding.severity.toUpperCase(), severityTone(finding.severity))}<br/>${esc(finding.area)}`,
                  `<strong>${esc(finding.title)}</strong><br/>${esc(finding.observation)}`,
                  esc(finding.action),
                ]),
              })
            : callout({
                k: "Verification required",
                text: "No adverse issue was identified by the rule-based review of the completed answers. This is not a clearance because records and databases were not independently checked.",
              })),
      }),
    );
  });

  pages.push(
    page({
      header,
      footer: footer("Action plan and limitations"),
      body:
        sectionHeader({
          eyebrow: "Prioritised remediation",
          title: "What to do next",
          desc: "Resolve filing holds first, then high-review evidence gaps, before paying third parties or submitting an immigration application.",
        }) +
        steps(analysis.nextActions.map((action, index) => ({ title: `Priority ${index + 1}`, body: action }))),
    }),
  );

  pages.push(
    page({
      header,
      footer: footer("Questions and verification boundary"),
      body:
        sectionHeader({ eyebrow: "Questions for professional review", title: "Client questions and unresolved context" }) +
        (text(input.reviewerQuestions)
          ? `<div class="card"><div class="card__v" style="font-size:11pt;">${paragraphs(input.reviewerQuestions)}</div></div>`
          : callout({ k: "Not provided", text: "No specific reviewer questions were entered." })) +
        `<div class="spacer-16"></div>` +
        callout({
          k: "Verification boundary",
          text: `This INR ${order.amountInr.toLocaleString("en-IN")} report analyses the applicant's paid intake, highlights contradictions and missing evidence, and provides a prioritised preparation plan. It is not a third-party screening or document-authenticity clearance.`,
        }) +
        `<div class="spacer-16"></div>` +
        disclaimer("No passport, biometric, document-authenticity, police, court, sanctions, PEP, enforcement, adverse-media, employer, institution, bank, registry, assessing-authority or government system was queried for this report. All facts remain client-supplied until separately verified."),
    }),
  );

  pages.push(...buildCompanyProfilePages({ header, footer }));

  return renderReportPdf({
    title: `XIPHIAS Immigration Due Diligence Report - ${order.customer.name}`,
    bodyHtml: pages.join(""),
    embedBrandFonts: true,
  });
}
