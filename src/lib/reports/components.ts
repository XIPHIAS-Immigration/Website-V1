// Pure HTML builders for the premium report design system (see theme.ts).
// These return HTML strings only — no filesystem or rendering side effects.
//
// NOTE on escaping: helpers that take plain text (card, sectionHeader, ticks, callout,
// steps, scoreBar, pill, cover) escape their inputs. `table` does NOT escape cell
// contents, because cells often embed pre-built HTML (e.g. pills) — callers must escape
// any raw text they place into table cells using esc().

export function esc(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function clampScore(n: unknown, fallback = 0): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function page(opts: { dark?: boolean; header?: string; body: string; footer?: string }): string {
  return `<section class="page${opts.dark ? " page--dark" : ""}">${opts.header ?? ""}${opts.body}${opts.footer ?? ""}</section>`;
}

export function runningHeader(title: string, meta: { country?: string; route?: string } = {}): string {
  const right = [meta.country, meta.route].filter(Boolean).join(" · ");
  return `<div class="runhead">
    <div class="runhead__brand">XIPHIAS <b>Immigration</b></div>
    <div class="runhead__meta">${esc(title)}${right ? `<br/>${esc(right)}` : ""}</div>
  </div>`;
}

export function runningFooter(left: string, right: string): string {
  return `<div class="runfoot"><span>${esc(left)}</span><span>${esc(right)}</span></div>`;
}

export function reportBasisBanner(opts: {
  reviewStatus: "draft" | "advisor-reviewed" | "verified";
  completeness: number;
  confirmedFacts: number;
  limitations?: string[];
  executiveSummary?: string;
  recommendation?: string;
  advisorNotes?: string;
  cpa?: string;
  assessingBody?: string;
  anzscoCode?: string;
  occupation?: string;
  education?: string;
  yearsExperience?: number;
  languageTest?: string;
  languageScore?: number;
  languageDetails?: string;
  skillsAssessment?: string;
  professionalRecognition?: string;
  pointsAssessment?: string;
  claimedPointsTotal?: number;
  employerOrBusiness?: string;
  familyIncluded?: boolean;
  dependants?: number;
  budgetUsd?: number;
  availableFundsUsd?: number;
  sourceOfFunds?: string;
  currentImmigrationStatus?: string;
  immigrationHistory?: string;
  refusals?: string;
  medicalNotes?: string;
  characterNotes?: string;
  sources?: string[];
  customRisks?: string[];
  nextActions?: string[];
  gates?: { label: string; status: "confirmed" | "review" | "missing"; detail: string }[];
}): string {
  const label = opts.reviewStatus === "verified"
    ? "Verified"
    : opts.reviewStatus === "advisor-reviewed"
      ? "Reviewed"
      : "Draft";
  const tone = opts.reviewStatus === "verified" ? "good" : opts.reviewStatus === "advisor-reviewed" ? "warn" : "muted";
  return `<div style="margin-bottom:12px;">${pill(label, tone)}</div>`;
}

function clientDisplayValue(value?: string): string | undefined {
  const clean = value?.replace(/\s+/g, " ").trim();
  if (!clean || /^(?:not[- ]?provided|not supplied|none supplied|advisor to define)$/i.test(clean)) return undefined;
  return clean;
}

function clientEducationLabel(value?: string): string | undefined {
  const clean = clientDisplayValue(value);
  if (!clean) return undefined;
  if (/^bachelor$/i.test(clean)) return "Bachelor's degree";
  if (/^master$/i.test(clean)) return "Master's degree";
  if (/^phd$/i.test(clean)) return "Doctorate (PhD)";
  if (/^unknown$/i.test(clean)) return undefined;
  return clean;
}

function clientLanguageSummary(value?: string): string | undefined {
  const clean = clientDisplayValue(value);
  if (!clean) return undefined;
  const dimensions = ["speaking", "reading", "writing", "listening"];
  const line = (language: "English" | "French") => {
    const segment = clean.match(new RegExp(`${language}\\s*-\\s*([^.]*)`, "i"))?.[1];
    if (!segment) return undefined;
    const scores = dimensions.map((dimension) => {
      const score = segment.match(new RegExp(`${dimension}\\s*:\\s*(?:Level\\s*)?([^,.;]+)`, "i"))?.[1]?.trim();
      return score ? `${dimension[0].toUpperCase()}${dimension.slice(1)} ${score}` : undefined;
    }).filter(Boolean);
    return scores.length ? `${language}: ${scores.join(" / ")}` : undefined;
  };
  const lines = [line("English"), line("French")].filter(Boolean);
  return lines.length ? lines.join("\n") : clean;
}

function clientStrategyParts(value?: string): { intro?: string; actions: string[] } {
  const clean = clientDisplayValue(value)
    ?.replace(/\bWe have to be in\b/gi, "The recommended objective is to enter")
    .replace(/\bto work with client'?s timeline\b/gi, "to align with the intended timeline")
    .replace(/\bTo be in the pool\b/gi, "To enter the pool")
    .replace(/\bapprox\.?\b/gi, "approximately")
    .replace(/\bassesing\b/gi, "assessing")
    .replace(/\bresponsibilties\b/gi, "responsibilities")
    .replace(/\bClient can be prepare for\b/gi, "Prepare for");
  if (!clean) return { actions: [] };
  const matches = [...clean.matchAll(/(?:^|\s)(\d+)[.)]\s+/g)];
  if (!matches.length) return { intro: clean, actions: [] };
  const firstIndex = matches[0].index ?? 0;
  const introText = clean.slice(0, firstIndex)
    .replace(/[\s:-]+$/, "")
    .replace(/\bExpress Entry\s*\/\s*PNP\b/gi, "Express Entry or Provincial Nominee Program (PNP)")
    .replace(/\bby end of\b/gi, "by the end of")
    .replace(/[.,;:]?\s*To enter the pool\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const intro = introText ? `${introText.replace(/[.!?]+$/, "")}.` : undefined;
  const actions = matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : clean.length;
    return clean.slice(start, end).trim().replace(/[.;]+$/, "");
  }).filter(Boolean);
  return { intro, actions };
}

function clientActionSentence(value: string): string {
  const clean = value
    .replace(/\bAssesment\b/gi, "Assessment")
    .replace(/\bassesing\b/gi, "assessing")
    .replace(/\bresponsibilties\b/gi, "responsibilities")
    .replace(/\bclient'?s occupation\b/gi, "the candidate's occupation")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;]+$/, "");
  return clean ? `${clean}.` : "";
}

function pointFrom(text: string, label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.match(new RegExp(`(?:^|\\s)${escaped}\\s*:?\\s*(-?\\d+(?:\\.\\d+)?)`, "i"))?.[1];
}

function canadaPointsTables(value?: string, header?: string, footer?: string): string {
  const clean = clientDisplayValue(value);
  if (!clean) return "";
  const marker = clean.search(/Core Human Capital Maximum/i);
  if (marker < 0 || !/Selection Factor Points/i.test(clean)) return "";
  const fsw = clean.slice(0, marker);
  const crs = clean.slice(marker);
  const rows = (segment: string, fields: Array<[string, string]>) => fields
    .map(([label, key]) => [label, pointFrom(segment, key)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== undefined)
    .map(([label, points]) => [esc(label), esc(points)]);
  const fswRows = rows(fsw, [
    ["Age", "Age"],
    ["Education", "Education Level"],
    ["Work experience", "Experience"],
    ["First official language", "First language"],
    ["Second official language", "Second language"],
    ["Arranged employment", "Employment job offer"],
    ["Adaptability", "Adaptability"],
    ["FSW total", "Total"],
  ]);
  const crsRows = rows(crs, [
    ["Age", "Age"],
    ["Education", "Education"],
    ["First official language", "First language"],
    ["Second official language", "Second language"],
    ["Education and language", "Education and language"],
    ["Education and Canadian work", "Education and Canadian work"],
    ["Foreign work and language", "Foreign work and language"],
    ["Foreign work and Canadian work", "Foreign work and Canadian work"],
    ["CRS total", "Total"],
  ]);
  if (!fswRows.length && !crsRows.length) return "";
  const fswPage = fswRows.length ? page({
    header,
    footer,
    body:
      sectionHeader({ eyebrow: "Points assessment", title: "Federal Skilled Worker selection factors" }) +
      table({ head: ["Factor", "Points"], rows: fswRows }),
  }) : "";
  const crsPage = crsRows.length ? page({
    header,
    footer,
    body:
      sectionHeader({ eyebrow: "Points assessment", title: "Express Entry ranking score" }) +
      table({ head: ["CRS factor", "Points"], rows: crsRows }),
  }) : "";
  return fswPage + crsPage;
}

export function reportBasisPage(opts: {
  header?: string;
  footer?: string;
  basis: Parameters<typeof reportBasisBanner>[0];
}): string {
  const basis = opts.basis;

  type RecordedDetail = { label: string; value?: string; wide?: boolean };
  const money = (value?: number) => value === undefined ? undefined : `USD ${value.toLocaleString("en-US")}`;
  const languageTest = clientDisplayValue(basis.languageTest);
  const languageDetails = clientLanguageSummary(basis.languageDetails);
  const language = [languageTest, basis.languageScore !== undefined ? String(basis.languageScore) : undefined, languageDetails].filter(Boolean).join(" | ") || undefined;
  const details: RecordedDetail[] = [
    { label: "Occupation", value: clientDisplayValue(basis.occupation) },
    { label: "Occupation code", value: clientDisplayValue(basis.anzscoCode) },
    { label: "Education", value: clientEducationLabel(basis.education) },
    { label: "Work experience", value: basis.yearsExperience === undefined ? undefined : `${basis.yearsExperience} years` },
    { label: "Assessing body", value: clientDisplayValue(basis.assessingBody) },
    { label: "Skills-assessment status", value: clientDisplayValue(basis.skillsAssessment) },
    { label: "Language", value: language, wide: true },
    { label: "Professional assessment", value: clientDisplayValue(basis.cpa) },
    { label: "Professional recognition", value: clientDisplayValue(basis.professionalRecognition) },
    { label: "Points", value: basis.claimedPointsTotal === undefined ? undefined : String(basis.claimedPointsTotal) },
    { label: "Employer or business", value: clientDisplayValue(basis.employerOrBusiness) },
    { label: "Family included", value: basis.familyIncluded === undefined ? undefined : basis.familyIncluded ? "Yes" : "No" },
    { label: "Dependants", value: basis.dependants === undefined ? undefined : String(basis.dependants) },
    { label: "Confirmed budget", value: money(basis.budgetUsd) },
    { label: "Available funds", value: money(basis.availableFundsUsd) },
    { label: "Source of funds", value: clientDisplayValue(basis.sourceOfFunds) },
    { label: "Current immigration status", value: clientDisplayValue(basis.currentImmigrationStatus) },
    { label: "Immigration and visa history", value: clientDisplayValue(basis.immigrationHistory) },
    { label: "Visa refusals / cancellations", value: clientDisplayValue(basis.refusals) },
    { label: "Medical declarations", value: clientDisplayValue(basis.medicalNotes) },
    { label: "Character / police declarations", value: clientDisplayValue(basis.characterNotes) },
  ].filter((entry) => Boolean(entry.value));

  const expanded: RecordedDetail[] = [];
  for (const detail of details) {
    const value = detail.value ?? "";
    if (value.length <= 1200) {
      expanded.push(detail);
      continue;
    }
    for (let start = 0, part = 1; start < value.length; start += 1200, part += 1) {
      expanded.push({ label: `${detail.label}${part > 1 ? " (continued)" : ""}`, value: value.slice(start, start + 1200), wide: true });
    }
  }

  const groups: RecordedDetail[][] = [];
  let current: RecordedDetail[] = [];
  let chars = 0;
  for (const detail of expanded) {
    const nextChars = detail.value?.length ?? 0;
    if (current.length && (current.length >= 8 || chars + nextChars > 1600)) {
      groups.push(current);
      current = [];
      chars = 0;
    }
    current.push(detail);
    chars += nextChars;
  }
  if (current.length) groups.push(current);

  const profileCard = (detail: RecordedDetail) => {
    const value = detail.value ?? "";
    const lines = value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
    const valueHtml = lines.length > 1
      ? lines.map((item) => `<span class="profile-card__line">${esc(item)}</span>`).join("")
      : esc(value);
    const wide = detail.wide || value.length > 150;
    return `<div class="card profile-card${wide ? " profile-card--wide" : ""}">
      <div class="card__k">${esc(detail.label)}</div>
      <div class="card__v profile-card__v">${valueHtml}</div>
    </div>`;
  };

  const recordedPages = groups.map((group, index) => page({
    header: opts.header,
    footer: opts.footer,
    body:
      sectionHeader({
        eyebrow: "Candidate profile",
        title: index === 0 ? "Profile and assessment summary" : "Profile summary (continued)",
      }) +
      `<div class="grid grid-2 profile-grid">${group.map(profileCard).join("")}</div>`,
  })).join("");

  const pointsPage = canadaPointsTables(basis.pointsAssessment, opts.header, opts.footer);
  const strategy = clientStrategyParts(basis.recommendation);
  const priorityActions = ((basis.nextActions ?? []).filter(Boolean).length
    ? (basis.nextActions ?? []).filter(Boolean).slice(0, 5)
    : strategy.actions.slice(0, 5)).map(clientActionSentence).filter(Boolean);
  const recommendations = [
    basis.executiveSummary ? callout({ k: "Assessment summary", text: basis.executiveSummary }) : "",
    strategy.intro ? callout({ k: "Recommended strategy", text: strategy.intro }) : "",
    priorityActions.length
      ? `<div class="strategy-actions"><h3 class="h-sub">Immediate priorities</h3>${steps(priorityActions.map((body, index) => ({ title: `Priority ${index + 1}`, body })))}</div>`
      : "",
    (basis.customRisks ?? []).length ? card({ k: "Key considerations", v: (basis.customRisks ?? []).slice(0, 4).join("; ") }) : "",
  ].filter(Boolean);
  const recommendationPage = recommendations.length ? page({
    header: opts.header,
    footer: opts.footer,
    body: sectionHeader({ eyebrow: "Strategy", title: "Recommended pathway and next steps" }) + `<div class="strategy-page">${recommendations.join('<div class="spacer-16"></div>')}</div>`,
  }) : "";

  return recordedPages + pointsPage + recommendationPage;
}

export function coverPage(opts: {
  logoDataUri?: string | null;
  coverBgDataUri?: string | null;
  cardImageDataUri?: string | null;
  /** Premium landmark hero image for the cover (preferred). Falls back to the country
   *  card image, then the legacy full-bleed background. Never a person portrait. */
  heroImageDataUri?: string | null;
  eyebrow: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  fitScore?: number;
  fitLabel?: string;
  /** Short label under the cover score medallion (e.g. "route-fit", "readiness"). */
  scoreTag?: string;
  countryLabel?: string;
  profileLine?: string;
  preparedFor?: string;
  dateLabel?: string;
  /** Optional confidential reference shown top-right; defaults to the date. */
  refLabel?: string;
}): string {
  // Editorial-luxury cover: full-bleed COUNTRY attraction image (never a portrait),
  // gold inset frame, logo top, and the title block anchored to the bottom over a dark gradient.
  const bg = opts.heroImageDataUri ?? opts.cardImageDataUri ?? opts.coverBgDataUri ?? null;
  const bgEl = bg ? `<div class="cover-bg"><img src="${bg}" alt="" /></div>` : `<div class="cover-bg cover-bg--solid"></div>`;
  const logo = opts.logoDataUri
    ? `<img class="cover-logo" src="${opts.logoDataUri}" alt="XIPHIAS Immigration" />`
    : `<div class="cover-ey" style="margin-top:0;">XIPHIAS Immigration</div>`;

  const seal =
    typeof opts.fitScore === "number"
      ? `<div class="cover-seal"><b>${clampScore(opts.fitScore)}</b><span>${esc(opts.scoreTag ?? "Route fit")}</span></div>`
      : "";

  const chips = (opts.chips ?? []).filter(Boolean).map((c) => `<span>${esc(c)}</span>`).join("");
  const conf = opts.refLabel ?? opts.dateLabel ?? "";

  return `<section class="page cover">
    ${bgEl}
    <div class="cover-frame"></div>
    ${conf ? `<div class="cover-conf"><b>Private &amp; Confidential</b><span>${esc(conf)}</span></div>` : ""}
    <div class="cover-pad">
      ${logo}
      <div class="cover-ey">${esc(opts.eyebrow)}</div>
      <div class="cover-rule"></div>
      <h1>${esc(opts.title)}</h1>
      ${opts.subtitle ? `<div class="cover-sub">${esc(opts.subtitle)}</div>` : ""}
      ${opts.profileLine ? `<div class="cover-profile">${esc(opts.profileLine)}</div>` : ""}
      <div class="cover-meta">
        ${opts.preparedFor ? `<div class="cover-prep"><div class="k">Prepared exclusively for</div><div class="v">${esc(opts.preparedFor)}</div></div>` : ""}
        ${seal}
      </div>
      ${chips ? `<div class="cover-chips">${chips}</div>` : ""}
    </div>
  </section>`;
}

export function sectionHeader(opts: { eyebrow?: string; title: string; desc?: string }): string {
  return `<div class="sec">
    ${opts.eyebrow ? `<div class="eyebrow eyebrow--ink">${esc(opts.eyebrow)}</div>` : ""}
    <h2 class="h-section">${esc(opts.title)}</h2>
    <div class="sec__rule"></div>
    ${opts.desc ? `<p class="lead sec__desc">${esc(opts.desc)}</p>` : ""}
  </div>`;
}

export function card(opts: { k: string; v: string; note?: string; dark?: boolean }): string {
  return `<div class="card${opts.dark ? " card--dark" : ""}">
    <div class="card__k">${esc(opts.k)}</div>
    <div class="card__v">${esc(opts.v)}</div>
    ${opts.note ? `<div class="card__note">${esc(opts.note)}</div>` : ""}
  </div>`;
}

export function grid(cols: 2 | 3, cards: string[]): string {
  return `<div class="grid grid-${cols}">${cards.join("")}</div>`;
}

export function scoreBar(opts: { label: string; value: number; tag?: string }): string {
  const v = clampScore(opts.value);
  return `<div class="score">
    <div class="score__top"><span class="score__label">${esc(opts.label)}</span><span class="score__val">${v}/100</span></div>
    <div class="score__track"><div class="score__fill" style="width:${v}%"></div></div>
    ${opts.tag ? `<div class="score__tag">${esc(opts.tag)}</div>` : ""}
  </div>`;
}

export type PillTone = "good" | "warn" | "bad" | "muted";
export function pill(text: string, tone: PillTone = "muted"): string {
  return `<span class="pill pill--${tone}">${esc(text)}</span>`;
}

export function table(opts: { head: string[]; rows: string[][] }): string {
  const head = opts.head.map((h) => `<th>${esc(h)}</th>`).join("");
  const rows = opts.rows
    .map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  return `<table class="tbl"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

export function ticks(items: string[], cols = false): string {
  return `<ul class="ticks${cols ? " cols" : ""}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

export function callout(opts: { k: string; text: string }): string {
  return `<div class="callout"><div class="callout__k">${esc(opts.k)}</div><p>${esc(opts.text)}</p></div>`;
}

export function steps(items: { title: string; body: string }[]): string {
  return `<div class="steps">${items
    .map(
      (s, i) =>
        `<div class="step"><div class="step__n">${i + 1}</div><div class="step__b"><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p></div></div>`,
    )
    .join("")}</div>`;
}

export function disclaimer(text: string): string {
  return `<p class="disclaimer">${esc(text)}</p>`;
}

// Full-width country hero image with a navy gradient + optional caption. Used near the
// top of an inner page to add editorial, premium imagery. Renders nothing if no image.
export function heroBand(dataUri: string | null | undefined, opts: { eyebrow?: string; title?: string } = {}): string {
  if (!dataUri) return "";
  return `<div class="heroband">
    <img src="${dataUri}" alt="" />
    <div class="heroband__overlay">
      ${opts.eyebrow ? `<div class="heroband__eyebrow">${esc(opts.eyebrow)}</div>` : ""}
      ${opts.title ? `<div class="heroband__title">${esc(opts.title)}</div>` : ""}
    </div>
  </div>`;
}

// Editorial two-column page: content on the left, natural-ratio media card on the right.
// Falls back to a full-width content page if no image.
export function splitPage(opts: {
  header?: string;
  footer?: string;
  content: string;
  imageDataUri?: string | null;
  capEyebrow?: string;
  capTitle?: string;
  wide?: boolean;
}): string {
  if (!opts.imageDataUri) return page({ header: opts.header, body: opts.content, footer: opts.footer });
  const cap =
    opts.capEyebrow || opts.capTitle
      ? `<div class="aside-cap">${opts.capEyebrow ? `<div class="aside-cap__k">${esc(opts.capEyebrow)}</div>` : ""}${opts.capTitle ? `<div class="aside-cap__v">${esc(opts.capTitle)}</div>` : ""}</div>`
      : "";
  const body = `<div class="split${opts.wide ? " split--wide" : ""}"><div class="split__main">${opts.content}</div><div class="split__aside"><img class="split__fit" src="${opts.imageDataUri}" alt="" />${cap}</div></div>`;
  return page({ header: opts.header, body, footer: opts.footer });
}

// Feature-led editorial page: opening analysis and a natural-ratio image share the top
// row, while the detailed modules continue at full width underneath. Captions are optional.
export function featurePage(opts: {
  header?: string;
  footer?: string;
  eyebrow?: string;
  title: string;
  desc?: string;
  content: string;
  imageDataUri?: string | null;
  imageAlt?: string;
  capEyebrow?: string;
  capTitle?: string;
  imageSide?: "left" | "right";
}): string {
  if (!opts.imageDataUri) {
    return page({
      header: opts.header,
      body: sectionHeader({ eyebrow: opts.eyebrow, title: opts.title, desc: opts.desc }) + opts.content,
      footer: opts.footer,
    });
  }
  const caption =
    opts.capEyebrow || opts.capTitle
      ? `<figcaption>${opts.capEyebrow ? `<span>${esc(opts.capEyebrow)}</span>` : ""}${opts.capTitle ? `<strong>${esc(opts.capTitle)}</strong>` : ""}</figcaption>`
      : "";
  const media = `<figure class="feature-media"><img src="${opts.imageDataUri}" alt="${esc(opts.imageAlt ?? "")}" />${caption}</figure>`;
  const intro = `<div class="feature-intro">${sectionHeader({ eyebrow: opts.eyebrow, title: opts.title, desc: opts.desc })}</div>`;
  const top = opts.imageSide === "left" ? `${media}${intro}` : `${intro}${media}`;
  return page({
    header: opts.header,
    body: `<div class="feature-page"><div class="feature-top${opts.imageSide === "left" ? " feature-top--reverse" : ""}">${top}</div><div class="feature-body">${opts.content}</div></div>`,
    footer: opts.footer,
  });
}

// Full-bleed image chapter divider page (large number + eyebrow + serif title over a photo).
export function imageDividerPage(opts: {
  imageDataUri?: string | null;
  num?: string;
  eyebrow: string;
  title: string;
  desc?: string;
}): string {
  const img = opts.imageDataUri ? `<img src="${opts.imageDataUri}" alt="" />` : "";
  return `<section class="page bleed"><div class="divider">${img}<div class="divider__inner">${opts.num ? `<div class="divider__num">${esc(opts.num)}</div>` : ""}<div class="divider__eyebrow">${esc(opts.eyebrow)}</div><h2 class="divider__title">${esc(opts.title)}</h2>${opts.desc ? `<p class="divider__desc">${esc(opts.desc)}</p>` : ""}</div></div></section>`;
}

// A horizontal strip of big headline stats.
export function bigStats(items: { k: string; v: string; n?: string }[]): string {
  if (!items.length) return "";
  return `<div class="statline">${items
    .map((i) => `<div><div class="statline__k">${esc(i.k)}</div><div class="statline__v">${esc(i.v)}</div>${i.n ? `<div class="statline__n">${esc(i.n)}</div>` : ""}</div>`)
    .join("")}</div>`;
}
