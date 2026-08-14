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
  sources?: string[];
  customRisks?: string[];
  nextActions?: string[];
  gates?: { label: string; status: "confirmed" | "review" | "missing"; detail: string }[];
}): string {
  const label = opts.reviewStatus === "verified"
    ? "Verified case file"
    : opts.reviewStatus === "advisor-reviewed"
      ? "Advisor-reviewed case file"
      : "Draft case file";
  const tone = opts.reviewStatus === "verified" ? "good" : opts.reviewStatus === "advisor-reviewed" ? "warn" : "muted";
  const limitations = (opts.limitations ?? []).slice(0, 2);
  const gates = (opts.gates ?? []).filter((gate) => gate.status !== "confirmed").slice(0, 3);
  return `<div class="callout" style="margin-bottom:12px;">
    <div class="callout__k">${pill(label, tone)} &nbsp; Personalisation basis</div>
    <p>${esc(`${opts.completeness}% of the core case profile is captured; ${opts.confirmedFacts} core facts are advisor-confirmed or verified.`)}</p>
    ${limitations.length ? `<p><strong>Open limitations:</strong> ${esc(limitations.join(" · "))}</p>` : ""}
    ${gates.length ? `<p><strong>Open gates:</strong> ${esc(gates.map((gate) => `${gate.label} (${gate.status})`).join(" · "))}</p>` : ""}
  </div>`;
}

export function reportBasisPage(opts: {
  header?: string;
  footer?: string;
  basis: Parameters<typeof reportBasisBanner>[0];
}): string {
  const basis = opts.basis;
  const gates = basis.gates ?? [];
  const tone = (status: "confirmed" | "review" | "missing"): PillTone => status === "confirmed" ? "good" : status === "review" ? "warn" : "bad";
  const rows = gates.map((gate) => [esc(gate.label), pill(gate.status === "confirmed" ? "Confirmed" : gate.status === "review" ? "Review" : "Missing", tone(gate.status)), esc(gate.detail.length > 150 ? `${gate.detail.slice(0, 147)}...` : gate.detail)]);
  const professionalAssessmentPage = page({
    header: opts.header,
    footer: opts.footer,
    body:
      sectionHeader({
        eyebrow: "Professional assessment",
        title: "CPA and assessing body",
        desc: "These case-specific fields are populated from the submitted assessment data and must be reviewed whenever the proposed occupation, programme or professional pathway changes.",
      }) +
      grid(2, [
        card({
          k: "CPA",
          v: basis.cpa || "Not provided",
          note: basis.cpa ? "Recorded candidate assessment position" : "Add the candidate assessment result to the case data.",
        }),
        card({
          k: "Assessing body",
          v: basis.assessingBody || "Not provided",
          note: basis.assessingBody ? "Recorded authority for the proposed professional pathway" : "Add the relevant assessing authority to the case data.",
        }),
      ]) +
      `<div class="spacer-24"></div>` +
      callout({
        k: "Assessment control",
        text: "The CPA and assessing body shown here are report inputs, not a substitute for a formal assessment outcome. Confirm that both remain aligned with the candidate's actual occupation, qualifications, evidence and selected immigration route before filing.",
      }),
  });
  const verificationPage = page({
    header: opts.header,
    footer: opts.footer,
    body:
      sectionHeader({
        eyebrow: "Case basis & verification",
        title: "What this report knows, and what remains open",
        desc: `${basis.completeness}% of the core case profile is captured. Conclusions are limited to the facts and evidence statuses recorded below.`,
      }) +
      (rows.length ? table({ head: ["Eligibility gate", "Status", "Recorded basis"], rows }) : callout({ k: "No gates recorded", text: "Complete the client case before relying on this report." })),
  });
  const advisorPage = page({
    header: opts.header,
    footer: opts.footer,
    body:
      sectionHeader({
        eyebrow: "Advisor-authored content",
        title: "Client-specific risks, actions and sources",
        desc: "These entries come from the advisor report desk and are stored with this report version. They supplement, rather than replace, current programme rules.",
      }) +
      (basis.executiveSummary ? callout({ k: "Client-specific executive summary", text: basis.executiveSummary }) : "") +
      `<div class="spacer-16"></div>` +
      (basis.recommendation ? callout({ k: "Advisor recommendation", text: basis.recommendation }) : "") +
      `<div class="spacer-16"></div>` +
      grid(2, [
        card({ k: "Client-specific risks", v: (basis.customRisks ?? []).length ? (basis.customRisks ?? []).slice(0, 4).join("; ") : "None supplied", note: "Only risks recorded for this client are shown." }),
        card({ k: "Client-specific next actions", v: (basis.nextActions ?? []).length ? (basis.nextActions ?? []).slice(0, 4).join("; ") : "Advisor to define", note: "Actions should be tied to evidence or an open gate." }),
        card({ k: "Advisor notes", v: basis.advisorNotes || "None supplied" }),
        card({ k: "Factual sources", v: (basis.sources ?? []).length ? `${(basis.sources ?? []).length} source reference${(basis.sources ?? []).length === 1 ? "" : "s"} recorded` : "No sources recorded", note: (basis.sources ?? []).slice(0, 2).join(" · ") }),
      ]) +
      `<div class="spacer-24"></div>` +
      callout({ k: "Version control", text: "If any client fact, family detail, programme rule, cost, document status or immigration history changes, create a new report version and repeat advisor review." }),
  });
  return professionalAssessmentPage + verificationPage + advisorPage;
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
  const bgEl = bg ? `<div class="cover-bg"><img src="${bg}" alt="" /></div>` : `<div class="cover-bg"></div>`;
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
