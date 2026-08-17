// Shared premium report design system — "Editorial Luxury" (Direction A, client-approved).
//
// Every paid PDF report renders HTML built from src/lib/reports/components.ts using this
// theme, then is converted to an A4 PDF by src/lib/reports/render.ts. The visual language:
// warm ivory paper, deep navy ink, a single gold accent, an editorial serif for display
// headings and a clean sans for body. Pages are built to FILL top-to-bottom (bottom-anchored
// bands, image panels, distributed content) so no page reads as half-empty.
//
// No external fonts/CSS are loaded (offline-safe inside headless Chromium): system stacks only.

export const BRAND = {
  navy: "#0a1c44",
  navySoft: "#123f7a",
  ink: "#1a1a1a",
  gold: "#e1b923",
  goldSoft: "#f0d043",
  paper: "#ffffff",
  cream: "#f5f7fa",
  mist: "#eef5ff",
  line: "#e1e1e1",
  slate: "#505050",
  slateSoft: "#8b94a3",
  good: "#1f9d6b",
  warn: "#b07d12",
  bad: "#c8472f",
} as const;

const DISPLAY = `"Sora", "Segoe UI", "Inter", Arial, sans-serif`;
const SANS = `"Inter", "Lato", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

/** Full stylesheet shared by all report templates. */
export const REPORT_CSS = `
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  body { font-family: ${SANS}; color: ${BRAND.ink}; font-size: 12.25px; line-height: 1.58; }

  @page { size: A4; margin: 0; }

  .page {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    height: 297mm;
    padding: 16mm 16mm 27mm;
    background: ${BRAND.paper};
    page-break-after: always;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  .page--dark { background: ${BRAND.navy}; color: #fff; }
  /* Utility: push an element (e.g. a closing band) to the bottom of the page. */
  .anchor-bottom { margin-top: auto; }
  /* Utility: distribute children to evenly fill the available vertical space. */
  .fillcol { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
  .spacer-8 { height: 8px; } .spacer-16 { height: 15px; } .spacer-24 { height: 22px; } .spacer-32 { height: 28px; }

  /* Running header / footer */
  .runhead {
    flex: 0 0 auto;
    display: flex; align-items: flex-end; justify-content: space-between;
    border-bottom: .55mm solid ${BRAND.gold};
    padding-bottom: 7px; margin-bottom: 17px;
  }
  .runhead__brand { font-weight: 800; letter-spacing: 0; text-transform: uppercase; font-size: 10px; color: ${BRAND.navy}; }
  .runhead__brand b { color: ${BRAND.gold}; }
  .runhead__meta { font-size: 9px; color: ${BRAND.slate}; text-align: right; line-height: 1.5; }
  .runfoot {
    position: absolute; left: 17mm; right: 17mm; bottom: 9mm;
    display: flex; align-items: center; justify-content: space-between;
    border-top: .3mm solid ${BRAND.line}; padding-top: 7px; background: ${BRAND.paper};
    font-size: 8px; color: ${BRAND.slateSoft}; letter-spacing: 0;
  }

  .eyebrow { font-size: 8.5pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.navySoft}; }
  .eyebrow--ink { color: ${BRAND.navySoft}; }
  h1, h2, h3, h4 { font-family: ${DISPLAY}; color: ${BRAND.navy}; margin: 0; font-weight: 700; }
  .page--dark h1, .page--dark h2, .page--dark h3, .page--dark h4 { color: #fff; }
  .h-display { font-size: 40px; line-height: 1.06; letter-spacing: 0; }
  .h-section { font-size: 28px; line-height: 1.08; margin: 9px 0 0; }
  .h-sub { font-size: 15.5px; line-height: 1.2; color: ${BRAND.navy}; }
  .page--dark .h-sub { color: #fff; }
  .lead { font-size: 12.25px; color: ${BRAND.slate}; line-height: 1.62; max-width: 165mm; }
  .page--dark .lead { color: #dfe6f2; }
  .muted { color: ${BRAND.slate}; }

  /* ===== Cover — editorial, full-bleed country attraction image (no portrait) ===== */
  .page.cover { padding: 0; color: #fff; background: ${BRAND.navy}; display: block; }
  .cover-bg { position: absolute; inset: 0; }
  .cover-bg > img { width: 100%; height: 100%; object-fit: cover; object-position: center 32%; display: block; }
  .cover-bg::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,28,68,.72) 0%, rgba(10,28,68,.42) 38%, rgba(10,28,68,.9) 76%, rgba(10,28,68,.98) 100%); }
  .cover-bg--solid, .cover-bg--solid::after { background: ${BRAND.navy}; }
  .cover-frame { position: absolute; inset: 9mm; border: .28mm solid rgba(255,255,255,.5); pointer-events: none; z-index: 2; }
  .cover-pad { position: absolute; inset: 9mm; padding: 13mm 14mm; display: flex; flex-direction: column; z-index: 2; }
  .cover-logo { height: 14mm; width: auto; object-fit: contain; object-position: left top; }
  .cover-ey { margin-top: auto; font-size: 9.5pt; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.goldSoft}; font-weight: 700; }
  .cover-rule { width: 24mm; height: .8mm; background: ${BRAND.gold}; margin: 6mm 0; }
  .cover h1 { font-family: ${DISPLAY}; color: #fff; font-size: 38pt; line-height: 1.04; margin: 0; max-width: 150mm; font-weight: 700; }
  .cover-sub { margin-top: 6mm; font-size: 12pt; color: #dfe6f2; max-width: 125mm; line-height: 1.55; }
  .cover-profile { margin-top: 4mm; width: fit-content; max-width: 150mm; border-left: .8mm solid ${BRAND.gold}; background: rgba(10,31,68,.5); padding: 2.6mm 4mm; color: #fff; font-size: 10pt; font-weight: 700; line-height: 1.4; }
  .cover-meta { margin-top: 9mm; display: flex; gap: 8mm; align-items: flex-end; }
  .cover-prep .k { font-size: 8pt; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.goldSoft}; }
  .cover-prep .v { font-family: ${DISPLAY}; font-size: 15pt; margin-top: 1.5mm; color: #fff; font-weight: 700; }
  .cover-seal { margin-left: auto; width: 30mm; height: 30mm; border-radius: 50%; border: .9mm solid ${BRAND.gold}; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(10,31,68,.42); }
  .cover-seal b { font-family: ${DISPLAY}; font-size: 24pt; line-height: 1; color: ${BRAND.goldSoft}; }
  .cover-seal span { font-size: 6.5pt; letter-spacing: 0; text-transform: uppercase; color: #cdd6e6; margin-top: 1mm; }
  .cover-chips { display: flex; flex-wrap: wrap; gap: 3mm; margin-top: 9mm; }
  .cover-chips span { border: .25mm solid rgba(216,182,90,.55); color: ${BRAND.goldSoft}; font-size: 8.5pt; font-weight: 700; padding: 2.2mm 4mm; border-radius: 99mm; }
  .cover-conf { position: absolute; top: 13mm; right: 14mm; text-align: right; font-size: 7.5pt; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.goldSoft}; line-height: 1.7; font-weight: 700; z-index: 3; }
  .cover-conf b { color: #fff; display: block; font-weight: 800; }

  /* Section heading block */
  .sec { margin-bottom: 14px; }
  .sec__rule { width: 18mm; height: .7mm; background: ${BRAND.gold}; border-radius: 2px; margin: 4.5mm 0 5.5mm; }
  .sec__desc { margin-top: 0; max-width: 165mm; }

  /* Cards / grids */
  .grid { display: grid; gap: 5mm; }
  .grid-2 { grid-template-columns: 1fr 1fr; }
  .grid-3 { grid-template-columns: 1fr 1fr 1fr; }
  .card {
    border: .22mm solid ${BRAND.line}; border-radius: 2mm; padding: 5mm 5.5mm;
    background: #fff;
  }
  .card--dark { background: rgba(255,255,255,.04); border-color: rgba(216,182,90,.4); }
  .card__k { font-size: 8pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.navySoft}; }
  .page--dark .card__k { color: ${BRAND.goldSoft}; }
  .card__v { font-family: ${DISPLAY}; font-size: 14pt; color: ${BRAND.navy}; margin-top: 2.5mm; line-height: 1.16; font-weight: 700; }
  .page--dark .card__v { color: #fff; }
  .card__note { font-size: 9.5pt; color: ${BRAND.slate}; margin-top: 2.5mm; line-height: 1.5; }

  /* Score bars */
  .score { margin: 0; }
  .score + .score { margin-top: 6mm; }
  .score__top { display: flex; align-items: baseline; justify-content: space-between; }
  .score__label { font-weight: 700; font-size: 11.5pt; color: ${BRAND.ink}; }
  .page--dark .score__label { color: #fff; }
  .score__val { font-family: ${DISPLAY}; font-weight: 800; color: ${BRAND.navy}; font-size: 13pt; }
  .page--dark .score__val { color: ${BRAND.goldSoft}; }
  .score__track { height: 2.4mm; border-radius: 999px; background: ${BRAND.line}; margin-top: 2.4mm; overflow: hidden; }
  .score__fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, ${BRAND.goldSoft}, ${BRAND.gold}); }
  .score__tag { font-size: 8.5pt; color: ${BRAND.slate}; margin-top: 1.6mm; }
  .page--dark .score__tag { color: #aab8cf; }

  /* Pills / status */
  .pill { display: inline-block; border-radius: 999px; padding: 3px 10px; font-size: 10.5px; font-weight: 800; }
  .pill--good { background: #e7f4ec; color: ${BRAND.good}; }
  .pill--warn { background: #fff7d6; color: #6d5600; border: .2mm solid rgba(225,185,35,.55); }
  .pill--bad { background: #f7e3dd; color: ${BRAND.bad}; }
  .pill--muted { background: ${BRAND.mist}; color: ${BRAND.slate}; }

  /* Tables */
  table.tbl { width: 100%; border-collapse: collapse; font-size: 10.25pt; background: #fff; border: .22mm solid ${BRAND.line}; border-radius: 2mm; overflow: hidden; }
  table.tbl th { text-align: left; background: ${BRAND.navy}; color: #fff; padding: 3.6mm 5mm; font-size: 8.5pt; letter-spacing: 0; text-transform: uppercase; font-weight: 700; }
  table.tbl td { padding: 3.4mm 5mm; border-bottom: .3mm solid ${BRAND.line}; vertical-align: top; }
  table.tbl tr:last-child td { border-bottom: none; }
  table.tbl tr:nth-child(even) td { background: ${BRAND.cream}; }
  table.tbl .num { font-weight: 800; color: ${BRAND.navy}; white-space: nowrap; }
  .compact-table table.tbl { font-size: 9.25pt; }
  .compact-table table.tbl th { padding: 2.7mm 3.4mm; font-size: 7.8pt; }
  .compact-table table.tbl td { padding: 2.35mm 3.4mm; line-height: 1.35; }

  /* Lists */
  ul.ticks { list-style: none; padding: 0; margin: 0; }
  ul.ticks li { position: relative; padding-left: 8mm; margin: 3mm 0; color: ${BRAND.ink}; line-height: 1.5; font-size: 11pt; }
  ul.ticks li::before { content: "\\2713"; position: absolute; left: 0; top: 0; color: ${BRAND.gold}; font-weight: 900; }
  .page--dark ul.ticks li { color: #e6ecf6; }
  ul.ticks.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1mm 10mm; }

  /* Callout / quote band */
  .callout { border-left: .8mm solid ${BRAND.gold}; background: #fffaf0; border-radius: 0 2mm 2mm 0; padding: 6mm 7mm; }
  .page--dark .callout { background: rgba(255,255,255,.05); }
  .callout__k { font-size: 8pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: #6d5600; }
  .page--dark .callout__k { color: ${BRAND.goldSoft}; }
  .callout p { margin: 2.5mm 0 0; font-size: 11pt; color: ${BRAND.ink}; line-height: 1.55; }
  .page--dark .callout p { color: #e6ecf6; }

  /* Timeline (steps) — numbered circles on a connecting line */
  .steps { position: relative; display: flex; flex-direction: column; }
  .step { position: relative; display: flex; gap: 6mm; align-items: flex-start; padding-bottom: 7mm; }
  .step:last-child { padding-bottom: 0; }
  .step__n { position: relative; flex: 0 0 auto; width: 9mm; height: 9mm; border-radius: 50%; background: ${BRAND.navy}; color: ${BRAND.goldSoft}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: ${DISPLAY}; font-size: 11pt; z-index: 2; }
  .step:not(:last-child) .step__n::after { content: ""; position: absolute; left: 50%; top: 9mm; height: 100%; width: .4mm; background: ${BRAND.line}; transform: translateX(-50%); }
  .step__b h4 { font-size: 12pt; color: ${BRAND.navy}; }
  .step__b p { margin: 1mm 0 0; font-size: 10.5pt; color: ${BRAND.slate}; line-height: 1.5; }

  /* Inner editorial image strip (wide, landscape; subject-anchored) */
  .heroband { position: relative; width: 100%; height: 46mm; border-radius: 2mm; overflow: hidden; }
  .heroband img { width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; }
  .heroband__overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 6mm 7mm; background: linear-gradient(90deg, rgba(10,28,68,.95), rgba(10,28,68,.72) 48%, rgba(10,28,68,.32) 100%); }
  .heroband__eyebrow { display: inline-flex; align-self: flex-start; font-size: 8pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: #fff; background: rgba(10,28,68,.78); border-left: .7mm solid ${BRAND.gold}; padding: 1.5mm 2.5mm; border-radius: 1mm; }
  .heroband__title { display: inline-block; align-self: flex-start; font-family: ${DISPLAY}; color: #fff; font-size: 14pt; line-height: 1.12; margin-top: 1.8mm; font-weight: 700; max-width: 112mm; text-shadow: 0 2px 10px rgba(0,0,0,.35); background: rgba(10,28,68,.68); padding: 2mm 3mm; border-radius: 1mm; }

  /* Two-column editorial layout: content + compact, natural-ratio media card. */
  .split { display: grid; grid-template-columns: 1fr 68mm; gap: 10mm; flex: 1; align-items: start; }
  .split--wide { grid-template-columns: 1fr 58mm; }
  .split__main { display: flex; flex-direction: column; min-width: 0; }
  .split__aside { margin: 0; align-self: start; display: block; border: .22mm solid ${BRAND.line}; border-radius: 2mm; overflow: hidden; background: #fff; box-shadow: 0 10px 28px rgba(10,28,68,.08); }
  .split__aside .split__fit { width: 100%; height: auto; object-fit: contain; object-position: center center; display: block; background: ${BRAND.cream}; }
  .split__aside .aside-cap { display: block; padding: 5mm 5.5mm; background: ${BRAND.navy}; border-top: .7mm solid ${BRAND.gold}; }
  .split__aside .aside-cap__k { font-size: 8pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.goldSoft}; }
  .split__aside .aside-cap__v { font-family: ${DISPLAY}; color: #fff; font-size: 13pt; line-height: 1.15; margin-top: 1.5mm; font-weight: 700; }

  /* Feature intro: compact natural-ratio image + opening insight, then full-width analysis. */
  .feature-page { display: flex; flex-direction: column; min-height: 0; }
  .feature-top { display: grid; grid-template-columns: 1.12fr .88fr; gap: 9mm; align-items: start; }
  .feature-top--reverse { grid-template-columns: .88fr 1.12fr; }
  .feature-intro .sec { margin-bottom: 0; }
  .feature-media { margin: 0; border: .22mm solid ${BRAND.line}; border-radius: 2mm; overflow: hidden; background: #fff; box-shadow: 0 10px 28px rgba(10,28,68,.08); }
  .feature-media img { width: 100%; height: auto; display: block; object-fit: contain; }
  .feature-media figcaption { padding: 4mm 5mm; background: ${BRAND.navy}; border-top: .7mm solid ${BRAND.gold}; }
  .feature-media figcaption span { display: block; color: ${BRAND.goldSoft}; font-size: 7.8pt; font-weight: 800; text-transform: uppercase; }
  .feature-media figcaption strong { display: block; margin-top: 1.2mm; color: #fff; font-family: ${DISPLAY}; font-size: 11.5pt; line-height: 1.18; }
  .feature-body { margin-top: 7mm; }
  .feature-body > :first-child { margin-top: 0; }

  /* Programme snapshot: dense full-width page with controlled media sizing */
  .snapshot-page { display: flex; flex-direction: column; min-height: 0; }
  .snapshot-top { display: grid; grid-template-columns: 1.18fr .82fr; gap: 8mm; align-items: start; }
  .snapshot-facts .grid { gap: 4mm; }
  .snapshot-media { margin: 0; border-radius: 2mm; overflow: hidden; background: ${BRAND.navy}; box-shadow: 0 10px 28px rgba(10,28,68,.08); }
  .snapshot-media img { width: 100%; height: auto; object-fit: contain; object-position: center center; display: block; background: ${BRAND.cream}; }
  .snapshot-media figcaption { display: block; padding: 5mm 5.5mm; background: ${BRAND.navy}; border-top: .7mm solid ${BRAND.gold}; }
  .snapshot-media figcaption span { display: block; font-size: 8pt; font-weight: 800; text-transform: uppercase; color: ${BRAND.goldSoft}; }
  .snapshot-media figcaption strong { display: block; font-family: ${DISPLAY}; color: #fff; font-size: 13pt; line-height: 1.16; margin-top: 1.5mm; }
  .snapshot-benefits { margin-top: 7mm; border-left: .8mm solid ${BRAND.gold}; background: #fffaf0; border-radius: 0 2mm 2mm 0; padding: 5mm 6mm; }
  .snapshot-benefits .h-sub { margin-top: 1mm; }
  .snapshot-benefits ul.ticks { margin-top: 3mm; }
  .snapshot-tags { margin-top: 5mm; }

  /* Full-bleed image chapter divider (a whole page) */
  .page.bleed { padding: 0; display: block; }
  .divider { position: relative; width: 210mm; height: 297mm; overflow: hidden; background: ${BRAND.navy}; }
  .divider img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center center; opacity: 1; z-index: 0; }
  .divider::after { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(10,28,68,.82) 0%, rgba(10,28,68,.68) 42%, rgba(10,28,68,.48) 74%, rgba(10,28,68,.62) 100%); z-index: 1; }
  .divider__inner { position: absolute; left: 18mm; right: 18mm; top: 50%; transform: translateY(-50%); z-index: 2; text-align: center; }
  .divider__num { font-family: ${DISPLAY}; font-size: 60pt; line-height: .9; color: rgba(225,185,35,.55); }
  .divider__eyebrow { display: inline-block; font-size: 10pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: #fff; background: rgba(10,28,68,.78); border-bottom: .7mm solid ${BRAND.gold}; padding: 1.7mm 3.2mm; border-radius: 1mm; margin-top: 6mm; }
  .divider__title { font-family: ${DISPLAY}; color: #fff; font-size: 33pt; line-height: 1.06; margin: 5mm auto 0; max-width: 150mm; font-weight: 700; text-shadow: 0 3px 16px rgba(0,0,0,.48); }
  .divider__desc { color: #f5f8ff; font-size: 12pt; line-height: 1.6; margin: 6mm auto 0; max-width: 135mm; text-shadow: 0 2px 10px rgba(0,0,0,.48); }

  /* Big stat strip */
  .statline { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 0; border: .22mm solid ${BRAND.line}; border-radius: 2mm; overflow: hidden; background: #fff; }
  .statline > div { padding: 5.5mm 5.5mm; border-right: .3mm solid ${BRAND.line}; }
  .statline > div:last-child { border-right: none; }
  .statline__k { font-size: 8pt; font-weight: 800; letter-spacing: 0; text-transform: uppercase; color: ${BRAND.slate}; }
  .statline__v { font-family: ${DISPLAY}; font-size: 20pt; color: ${BRAND.navy}; margin-top: 2mm; line-height: 1.05; font-weight: 700; }
  .statline__n { font-size: 8.5pt; color: ${BRAND.slateSoft}; margin-top: 1.5mm; }

  .disclaimer { margin-top: 7mm; font-size: 8pt; color: ${BRAND.slateSoft}; line-height: 1.55; }
  .page--dark .disclaimer { color: #9fb0c9; }

  /* FAQ */
  .faq { border-bottom: .3mm solid ${BRAND.line}; padding: 3.5mm 0; }
  .faq:first-of-type { border-top: .3mm solid ${BRAND.line}; }
  .faq__q { font-weight: 800; color: ${BRAND.navy}; font-size: 11.5pt; }
  .faq__a { color: ${BRAND.slate}; font-size: 10.5pt; line-height: 1.5; margin-top: 1.5mm; }

  /* Rendered programme prose (markdown -> HTML narrative) */
  .prose { font-size: 11pt; line-height: 1.62; color: ${BRAND.ink}; }
  .prose h3 { font-family: ${DISPLAY}; font-size: 15pt; color: ${BRAND.navy}; margin: 5mm 0 2mm; font-weight: 700; }
  .prose h4 { font-family: ${DISPLAY}; font-size: 12.5pt; color: ${BRAND.navy}; margin: 4mm 0 1.5mm; font-weight: 700; }
  .prose p { margin: 0 0 3mm; }
  .prose ul, .prose ol { margin: 0 0 3mm; padding-left: 6mm; }
  .prose li { margin: 1.5mm 0; line-height: 1.5; }
  .prose strong { color: ${BRAND.navy}; }
  .prose blockquote { border-left: 1mm solid ${BRAND.gold}; margin: 3mm 0; padding: 1mm 0 1mm 5mm; color: ${BRAND.slate}; font-style: italic; background: #fffaf0; }
  .prose table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 3mm 0; }
  .prose th { background: ${BRAND.navy}; color: #fff; text-align: left; padding: 2.5mm 3.5mm; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0; }
  .prose td { padding: 2.4mm 3.5mm; border-bottom: .3mm solid ${BRAND.line}; }
  .prose tr:nth-child(even) td { background: ${BRAND.cream}; }
`;
