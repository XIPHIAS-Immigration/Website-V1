# Shipped overnight — 13 September 2026

Everything below is committed to `E:\Website-V1` and byte-verified on disk.

**Run `npm run typecheck` first thing.** Sixteen files changed or added since the
last clean check and nothing has been compiled — I have no shell on that machine.

---

## New pages

| Route | What it is |
|---|---|
| `/tools/crs-calculator` | Express Entry CRS calculator on the existing engine. Four-block breakdown, stated assumptions, and each possible change ranked by points gained. ~900 words of ranking content + FAQ schema. |
| `/tools/australia-points-calculator` | SkillSelect points test, same shape. Leads on "65 is a floor, not a target" and the skills-assessment step that precedes points. |
| `/verify-immigration-consultant` | The moat page. CICC, OMARA and the UK IAA registers, licence number formats, what "Entitled to Practise" means, six red flags, then our own three credentials rendered from `credentials.ts` so readers can verify us on the same page. HowTo + FAQPage schema. |
| `/canada-pr-for-software-engineers-from-india` | Guide. Leads on the removed job-offer points and the over-represented-profile problem. → route report |
| `/crs-score-450-470-chances` | Guide. The band where people wait years without being told why. → route report |
| `/canada-pr-cost-from-india` | Guide. Proof of funds is the biggest number and is not a fee. → cost report |
| `/documents-required-for-canada-pr-from-india` | Guide. The three documents that cause refusals when wrong rather than missing. → docs report |

## Pages rewritten

- **`/registration`** — carried a page-level `robots: { index: false }`, which
  overrides robots.txt entirely. Your ₹4,999 page was hard-blocked from Google.
  Removed, retitled for real queries, Service + Offer + FAQ schema, and a section
  on what an assessment catches that a calculator cannot.
- **`/cost-estimator`** — had a 4-line file and no SEO treatment at all. Now
  targets "Canada PR cost from India", with the four forgotten costs, how to read
  a consultant's quote, and FAQ schema.
- **`/rcic-registered-immigration-consultant-india`** — retitled for Bangalore and
  the ICCRC spelling people actually search, plus a new section answering
  "ICCRC or CICC?" — the rename is both a live query and a live confusion.

## Technical fixes

- `/xia-intelligence` and `/registration` removed from the sitemap blocklist
- `/registration` unblocked in `robots.ts`
- The two "intentional orphan" India pages restored to the sitemap
- Guides and local pages now have their own footer rows on every page
- Everything new linked from the header Resources menu

## New infrastructure

- `src/data/guides.ts` — guide content as data. Add a slug here plus a 25-line
  page file and you have a new guide with schema, contents, report hand-off and
  cross-links for free.
- `src/components/Guides/GuideArticle.tsx` — the shared renderer. Server
  component, so none of it ships as JavaScript.
- `src/components/Tools/CrsCalculator.tsx`, `AustraliaPointsCalculator.tsx`

---

## Still open

**Needs your decision**
- `/eligibility` — redirect into XIA, or keep as a landing page?
- The 68KB `XiaIntelligenceClient` still serves `/express-reports` and `/eligibility`
- Two dead files to delete by hand: `src/components/Home/HeroGate.tsx`,
  `src/components/Xia/XiaConcierge.tsx` (they compile, they render nowhere)

**Yours, off-site** — Search Console verification, sitemap submission, and the
GBP work. Nothing in the codebase moves the map pack.

**Untested** — the money path. Chat → report page → JioPay → PDF → email has
never run end to end, and the AI-written report pages have never rendered once.
Before the presentation, walk it in dev at least as far as the JioPay page.

**Parked** — Passport Power (45,173 unsourced country pairs), guides 5–12.
