# Passport Power & XIA Rebuild — audit + plan (REV 2)

Repo: `E:\Website-V1` · Next.js 16 / React 19 / Tailwind / Lato · Reviewed 13 Sep 2026
Rev 2 adds: consultation page rebuild, credential-claim compliance check, local-SEO strategy.

## Verdict

| Area | State | Why |
|---|---|---|
| Consultation page | Assets unused | 38 awards + a full credentials component sit in the repo as dead code; the booking page shows a name and a photo |
| Passport Power | Hollow | Claims 199 passports, ships 15 hand-written rows, no destination data |
| AI tools | Not AI | Keyword matching + fixed point values; confidence measures how full the form is |
| X-Hub login | Live works | Production configured; local repo has no `.env.local` |

---

## 1. Consultation page — fastest money on the table

- **CRITICAL — four finished components are dead code.** `/personal-booking` renders only `ConsultationBookingClient` (3-step scheduler). `PersonalBooking/Expert`, `/Awards`, `/ProblemSolution`, `/Hero` are fully built and imported by nothing. `Details/index.tsx` imports Expert + ProblemSolution — and nothing imports Details.
- **CRITICAL — Varun gets a 390px sidebar.** On a ₹25,000 page his whole presence is a name, portrait and role line inside the scheduler's left rail. No awards, credentials, track record or media. That is the conversion problem, not the calendar UI.
- **ASSET — 38 awards already exist with images.** `src/components/awards/awards.data.ts`: International Kohinoor Award, India 5000 Best MSME, Dr. A.P.J. Abdul Kalam Excellence Award, Brand of the Year, Consultant of the Year, Best Immigration Service Provider South India, and more. They render on `/awards` only.
- **GAP — regulatory credentials never reach the page.** `RCIC R516194` and `MARA 1680615` are in the footer. The booking page says only "Fellow IMC · Cert IMC".
- **GAP — no agenda, deliverable or proof.** Page never says what happens in the 60 minutes, what the client gets, or what it is not. 4.8/5 + 10,000 reviews not pulled through. No FAQ, no `Person`/`FAQPage` schema — only a thin `Service` block.

## 2. Before publishing the certification claim

**(a) ICCRC no longer exists.** ICCRC was continued as the **College of Immigration and Citizenship Consultants (CICC)** on **23 November 2021** by ministerial order under the College Act. Every "ICCRC" on the site is five years out of date. Correct terms: CICC (regulator), RCIC (professional), *licensed* not "registered member", *service agreement* not "retainer agreement".

**(b) CICC licenses people, not companies.** R516194 belongs to an individual licensee. The public register has a *Company* field per record, so the association is checkable in 30 seconds. Phrase it as "our Canadian practice is led by an RCIC, licence R516194".

**(c) "Only in Bangalore" must be proven.** The register search is a JS form — must be run manually at <https://register.college-ic.ca/Public-Register-EN/RCIC_Search.aspx> with Country=India, City=Bengaluru (then Bangalore). CICC Code of Professional Conduct SOR/2022-128 s.44(2)(a) prohibits false/misleading marketing representations; s.43 prohibits false statements about other licensees. If the register shows one Bengaluru licensee → publish "the only" with a dated screenshot. If several → publish "one of the few".

**(d) Free upside.** s.44(1) requires any written ad carrying the licence to show the licensee's registered name up front *and* include the CICC public-register URL. The compliant version of the page links the regulator's own database — exactly the trust signal a comparing client wants.

MARA check: <https://portal.mara.gov.au/search-the-register-of-migration-agents/> (MARN field).

**Do not use:** the zero-rejection / 100% success claim (appears only in a paid-placement outlet), and awards sourced only to paid-placement magazines (Bharat Gaurav, Nelson Mandela Sadbhavana, Bangkok "7th International Summit") unless a second source exists. Use the 38 in the repo with issuer + year where held.

## 3. Passport Power findings

- **CRITICAL — dataset is 15 countries.** `src/data/passport-index.ts`; `passportIndexStats` hardcodes 199/227.
- **CRITICAL — no destination lists.** One `score` per record, no list of where the passport goes. So Compare can't name gained countries, My Passport can't show what a second passport adds, `PassportWorldMap.tsx` (18 KB) has nothing to colour by.
- **DATA BUG** — India `55` at rank 80 while others are counts of 140–192.
- **KNOCK-ON** — `program-metrics.ts` join mostly misses, so `passportPower` (16% of the Program Index composite) falls back to `NEUTRAL_PASSPORT = 55` almost everywhere.
- **DESIGN** — six page loads, only animation is `Counter` + a CSS `shine`; hero's branded background sits inside `<div className="hidden">` and never renders.

## 4. AI tool findings

All three "intelligence" tools run `src/lib/xia-intelligence-model.ts` (924 lines, additive keyword scoring).

- **CORE — confidence measures the form.** `confidenceScore` built from fields filled. Fill everything → 95% confidence regardless of match quality.
- **CORE — no eligibility rules.** No CRS / Australian points / UK PBS / NZ SMC. No age bands, funds thresholds, language minimums, knock-outs. `profileCompatibility()` decides "investor" by substring-matching *golden visa* / *property*.
- **UX** — `if (destination && !isExactDestination(item)) return false` is a hard exclusion, no fallback. `lastVerified` never shown.
- **FEATURE** — `/api/xia-intelligence/parse-resume` returns raw text; nothing reads it.
- **PRODUCT** — Cost Estimator: 4 of 5 line items permanently `pending-verification` at 0.
- **NAV** — `/document-readiness`, `/programme-explorer`, `/eligibility`, `/due-diligence-intelligence`, `/express-reports` all work, none in `menu.data.ts`.

## 5. Where the X-Hub password lives

```
/x-hub/sign-in → SignInForm → NextAuth Credentials → src/lib/platform/auth.ts → parsePortalUsers()
```

1. **Env vars** — `XIPHIAS_PORTAL_USERS` (JSON array of `{email,name,role,passwordSha256}`) OR `XIPHIAS_ADMIN_EMAIL` + `XIPHIAS_ADMIN_PASSWORD` (plain text) / `XIPHIAS_ADMIN_PASSWORD_SHA256`.
2. **JSON file** — provisioned clients get `passwordSha256` in `.xiphias-platform/platform-store.json` (or `XIPHIAS_PLATFORM_STORE_PATH`).

Production works (no "not configured" warning live). Local cannot sign in: no `.env.local`, placeholders in `.env.production`, no `platform-store.json`.

Fix regardless: drop plain-text path · bcrypt/argon2 migrated on next sign-in · rate limit + lockout via `lib/security/public-lead-security.ts` · email password reset.

## 6. SEO — win Bangalore, ignore the head terms

Already present: `/top-immigration-consultants-in-india` (31 KB), `/canada-visa-consultants-bangalore` (28 KB), `/immigration-consultants-in-india` → 301. Plus `reports/seo-content-audit.md` and `docs/seo-marketing-recovery-playbook.md`. **Read the audit before touching anything** — this is an extension, not a restart.

| Cluster | Target intent | Why we win | Effort |
|---|---|---|---|
| **Local authority** | immigration consultants in bangalore · verified/certified immigration consultant bangalore · canada immigration consultant in bangalore · RCIC registered consultant india · koramangala immigration office | A licence number on a public regulator's register can't be copied or bought. With six real offices, 4.8 rating and 38 awards, defensible by facts not backlinks. | 2 weeks |
| **Passport long-tail** | indian passport visa free countries 2026 · portugal passport vs indian passport · [country] passport ranking | 199 country pages + pairwise comparisons = thousands of low-competition pages from one dataset. Only place volume is cheap. | Falls out of Phase 4 |
| **Tool pages** | canada CRS calculator · immigration cost calculator india · document checklist for [programme] | Tools render as bare client components with almost no indexable text. Content above the app turns 8 dead URLs into 8 ranking pages. | Bundled into Phase 3 |

Technical underneath: `LocalBusiness` schema × 6 offices with real NAP/hours/geo · `Organization` with `sameAs` to LinkedIn, IMI, CICC register · `Person` for Varun with `hasCredential` · `FAQPage` on money pages · internal-link pass from the 100+ MDX articles into the money pages · Google Business Profile NAP alignment · review schema from the real rating, not hard-coded.

---

## Build order (revised)

**Phase 0 — unblock (½ day).** `.env.local` with local admin (SHA-256), `NEXTAUTH_URL=http://localhost:4000`, real `NEXTAUTH_SECRET`, plus the HF block below with a placeholder. Run the CICC + MARA register checks. Read `reports/seo-content-audit.md`.

**Phase 1 — rebuild the consultation page (3 days).** Authority hero with three verifiable credential chips linking the official registers · track-record band · awards wall from `awards.data.ts` · revive `ProblemSolution` · "what the 60 minutes contains" incl. the honest not-legal-advice line · keep the existing scheduler · FAQ + `Person`/`Service`/`FAQPage` schema · sitewide ICCRC→CICC sweep.

**Phase 2 — local SEO cluster (2 weeks).** New money pages `/immigration-consultants-in-bangalore`, `/verified-immigration-consultants-bangalore`, `/rcic-registered-immigration-consultant-india`, `/australia-immigration-consultants-in-bangalore`, Koramangala office page · strengthen the two existing local pages and fix keyword overlap · schema · internal links · GBP alignment.

**Phase 3 — AI tools (1.5 weeks).**
*3a, no cost:* declarative eligibility rules per route (hard requirements, scored preferences, knock-outs with reasons) · real calculators (CRS, SkillSelect, UK PBS, NZ SMC) · confidence = completeness × freshness × rule coverage · never an empty shortlist · show `lastVerified` · five orphaned tools into the nav behind one XIA hub.
*3b, the model:* HF router, server-side only. CV→structured JSON, plain-English explanation, grounded chat, free-text intake. Model explains and extracts, never decides eligibility; schema-validated output. Hard monthly spend cap + per-IP rate limit in code.

**Phase 4 — passport dataset (runs in parallel from day one).** `passports.json` (199), `destinations.json` (227), `access.json` matrix (`visa-free / eta / visa-on-arrival / e-visa / visa-required / banned` + days + `source` + `lastVerified`) · `scripts/build-passport-index.mjs` · Tier 1 = ~60 passports sourced cell by cell, Tier 2 = regional baseline flagged `unverified` and shown as "advisor review" · staff correction screen in X-Hub · **XIPHIAS Mobility Score**: visa-free ×1.0, eTA ×0.9, VOA ×0.7, e-visa ×0.4 normalised to 100, plus regional reach / top-25-economy reach / family-mobility reach sub-indices.

**Phase 5 — rebuild Passport Power (2 weeks).** Compare is the centrepiece (the delta engine Henley has and we don't) · Overview, Ranking, My Passport, Improve, Methodology in one shell with no page reloads · **199 country profile pages + static `/compare/[a]-vs-[b]`** (the SEO long-tail) · anime.js v4 in one `PassportMotion` module, IntersectionObserver-gated, off under `prefers-reduced-motion`, readable at rest; GSAP/Framer untouched elsewhere.

**Phase 6 — harden X-Hub auth (3 days).**

---

## AI key + budget

$15/month is generous here — roughly 70,000 assessments or 8,000 chat sessions at the cheapest routed model.

Add to `.env.local`:

```
# XIA — Hugging Face Inference Providers (OpenAI-compatible router)
XIA_CONVERSATION_MODEL_PROVIDER=openai-compatible
XIA_CONVERSATION_MODEL_ENDPOINT=https://router.huggingface.co/v1/chat/completions
XIA_CONVERSATION_MODEL=openai/gpt-oss-120b:cheapest
XIA_CONVERSATION_MODEL_API_KEY=hf_PASTE_YOUR_TOKEN_HERE

# Spend guardrails (enforcement code added in Phase 3b)
XIA_MODEL_MONTHLY_USD_CAP=15
XIA_MODEL_RATE_LIMIT_PER_IP=20
```

Token: <https://huggingface.co/settings/tokens> → Create new token → **Fine-grained** → tick *Make calls to Inference Providers*. Then Billing → automatic recharge on, spend limit $15. Free account includes only $0.10/mo credit. **Skip PRO** ($9/mo buys $2 of credit). Key is server-side only, never in git.

| Workload | Tokens per run | Per run | 1,000/mo | 10,000/mo |
|---|---|---|---|---|
| Assessment explained | 3,000 in / 600 out | $0.0002 | $0.21 | $2.13 |
| CV parsed to JSON | 4,000 in / 400 out | $0.0002 | $0.17 | $1.68 |
| Chat session (~20 turns) | 30,000 in / 4,000 out | $0.0018 | $1.79 | $17.90 |

Priced on `gpt-oss-120b` at DeepInfra via the HF router ($0.037 in / $0.17 out per 1M, Sept 2026, no HF markup). `:cheapest` re-routes automatically. CV extraction routes separately to Llama 3.1 8B ($0.05 output).

On traffic: the model doesn't bring visitors by itself — it earns them by making the tool pages worth linking to and staying on, which is why Phase 3 adds indexable content to those 8 tool URLs at the same time.

Sources: <https://huggingface.co/docs/inference-providers/pricing> · <https://college-ic.ca/about-the-college/who-we-are> · <https://laws-lois.justice.gc.ca/eng/regulations/SOR-2022-128/FullText.html>

---

## Starting order

1. Phase 0 today — `.env.local`, local X-Hub sign-in, read the SEO audit.
2. Run the CICC + MARA register checks; report whether "only in Bangalore" is publishable as written.
3. Phase 1 — rebuild `/personal-booking` end to end, show the page before moving on.

Phase 4 data seeding runs in the background from day one. After Phase 0 the tracks are independent.
