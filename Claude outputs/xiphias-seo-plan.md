# XIPHIAS SEO plan — get found, sell reports

Goal, in your words: people arrive, register, buy a report, and some of them book
Varun. So every recommendation below is judged on **leads and report sales**, not
on traffic.

---

## 1. Things that are broken right now

These are self-inflicted and cost nothing to fix. Found in the audit today.

| What | Where | Why it matters |
|---|---|---|
| `/xia-intelligence` is excluded from the sitemap | `src/app/sitemap.ts` BLOCKLIST | It is now the main tool page. Google is being told to ignore your best asset. |
| `/registration` is blocked in robots.txt **and** the sitemap | `src/app/robots.ts`, `sitemap.ts` | This is the ₹4,999 conversion page. It cannot rank or be crawled. Someone blocked it on purpose — worth confirming that is still what you want. |
| `/immigration-consultants-in-india` and `/top-immigration-consultants-in-india` are deliberate orphans | `sitemap.ts` comment | They are in no sitemap and no menu. An unlinked page effectively does not rank. Two of your best-named pages are switched off. |
| The four new local pages are linked, but only from the footer and a long Resources list | header + footer | Fine as a start; they need links from related content pages to gain weight. |

**Fix these in week 1.** They are worth more than any new page.

---

## 2. The honest competitive picture

Who owns "immigration consultants in Bangalore" today: CanApprove, Visas Avenue,
Kansaz, ImmigrationXperts, GreenTree (who specifically target *Koramangala*),
The Visa Depot, Phoenix GRS.

These are established firms with years of domain age and backlinks. Straight
on-page work will not displace them quickly. Expect **6–12 months** of sustained
content plus link building for the head terms — and everyone in the market is
already fighting there.

So the plan does not start there. It starts where you can win in weeks.

---

## 3. Four fronts, ordered by how fast they produce leads

### Front 1 — The map pack (weeks 1–6) · highest ROI, mostly off-site

For "immigration consultants near me" and "in bangalore", the Google Maps block
sits **above** every organic result. It is won with Google Business Profile
quality, not content:

- Complete GBP: correct primary category (*Immigration & Naturalization Service*),
  secondary categories, hours, service list, service areas, 30+ real photos.
- **Reviews are the lever.** You have 4.8★. Volume and recency matter more than
  the score. Target a steady 8–12 new reviews a month, and reply to every one.
  Ask clients to mention the country and the service in the review text.
- Weekly GBP Posts (you already produce content for Instagram — repost it).
- NAP consistency: the exact Koramangala address string in `src/data/local-seo.ts`
  must match GBP, Justdial, Sulekha, IndiaMART, LinkedIn, Facebook character for
  character.
- A second GBP for the Gurugram office, if it has a staffed address.

Nothing on the website moves this. It needs a person doing it weekly.

### Front 2 — Own the "is this consultant legitimate?" cluster (weeks 1–8) · your moat

Nobody in the Indian market optimises for regulatory verification. Volume is
modest; **intent is the highest in the whole market** — these are people who have
been burned or are doing due diligence before paying someone ₹2–5 lakh.

| Keyword | Page |
|---|---|
| cicc registered immigration consultant india | `/rcic-registered-immigration-consultant-india` (exists) |
| iccrc registered consultant bangalore | same page, add the ICCRC→CICC rename explainer |
| rcic licensed consultant india | same |
| how to verify an immigration consultant is genuine | **new tool** (see §4.2) |
| immigration fraud india how to check agent | new guide |
| is my immigration consultant registered | new guide |

This is also the cluster that justifies your price against a ₹15,000 agent.

### Front 3 — Tools that rank and earn links (weeks 2–10)

You have already built the engines. They are sitting behind a chat with no
public page to rank. See §4.

### Front 4 — Long-tail guides that end in a report (weeks 4–16) · this is what sells

Each guide answers one specific question honestly, then the matching report is
the obvious next step. These rank in 6–12 weeks because almost nobody writes them
properly.

Starter set of 12, in priority order:

1. Canada PR for software engineers from India — 2026 reality
2. CRS 450–470: what your actual chances are this year
3. How much Canada PR really costs from India (every fee, itemised)
4. Documents required for Canada PR from India
5. Canada PR processing time from India in 2026
6. Australia 189 vs 190 — which one should you file
7. Australia PR points for mechanical / civil engineers from India
8. Express Entry category-based draws: who they actually help
9. Portugal Golden Visa from India after the 2023 rule change
10. Caribbean citizenship by investment — full cost from India
11. EB-2 NIW from India: what evidence actually clears
12. Moving to Canada with a spouse: what changes in your score

Each ends with: *the report that answers this for your case* → `/get-report/...`.

---

## 4. Tools to build

### 4.1 CRS / Express Entry calculator — **build first**
`/tools/crs-calculator`
The engine already exists (`src/lib/xia/crs.ts`, verified 2026-09-13). "CRS
calculator" and "Canada PR points calculator" are the highest-volume tool terms
in this market, and calculators attract links naturally. Ours can beat the others
on one thing: it says *what to change* to gain points, and links the report.

### 4.2 Consultant licence checker — **your strongest original idea**
`/verify-immigration-consultant`
A page that explains how to check any consultant against the CICC, MARA and ICCRC
registers, with direct links, what a valid licence number looks like, and the red
flags. Include XIPHIAS's own entries so people can verify *you* on the same page.

Nobody in India has this. It earns links from forums, Reddit and news, and it is
the single most on-brand page you could own.

### 4.3 Australia points calculator
`/tools/australia-points-calculator` — engine exists (`australia-points.ts`).

### 4.4 Canada PR cost calculator
`/cost-estimator` exists but has no SEO treatment: no targeted title, no content
above the tool, no FAQ schema. One afternoon of work.

### 4.5 Passport Power
Still blocked on the access matrix (45,173 country pairs unsourced). Genuinely
high-traffic once real, but it is a data-sourcing project, not a web project.
**Do not start it until fronts 1–4 are running.**

---

## 5. The RCIC claim — read this before publishing it

You said: *we are the only ones in Bangalore with an ICCRC/RCIC person.*

What is verifiable today, from the CICC public register (checked 13 Sep 2026):
licence **R516194** is held by **Lijun Wang**, RCIC–L2, entitled to practise, and
is listed against XIPHIAS Immigration Pvt Ltd (India) and XIPHIAS Immigration DMCC.

What is **not** verifiable: that no other Bangalore firm has an RCIC connection.
Publishing "the only RCIC-registered consultant in Bangalore" carries two real
risks:

- **CICC advertising rules** (Code of Professional Conduct SOR/2022-128) restrict
  how a licence may be used in marketing, and a false or unverifiable superlative
  is exactly what they act on.
- **ASCI / Consumer Protection Act (India)** — unsubstantiated superlatives are
  actionable, and competitors do complain.

Safe phrasing that is still strong, and that I would put on the page:

> "Your Canadian file is handled under a live CICC licence — R516194 — which you
> can check on the College's public register in ten seconds. Most consultancies in
> India cannot show you one."

That is true, checkable, and does more work than "only in Bangalore" because it
invites the reader to verify it. If you want the superlative, someone has to
search the CICC register by city first and keep dated evidence.

---

## 6. Sequence

**Weeks 1–2 — unblock and set up**
- Fix the four technical issues in §1
- Google Search Console + Bing verified, sitemap submitted
- GBP audit and cleanup; review request process started
- Internal linking pass: every programme page links to its local landing page

**Weeks 3–6 — own the moat**
- Build the licence checker (§4.2) and the CRS calculator (§4.1)
- Rewrite `/rcic-registered-immigration-consultant-india` around the safe claim
- First 4 long-tail guides published
- 8–12 GBP reviews

**Weeks 7–12 — scale content**
- Remaining 8 guides
- Australia calculator, cost estimator SEO pass
- Begin link outreach: Indian startup/tech communities, expat forums, university
  placement cells, and the licence-checker page as the hook

**Month 4+ — head terms**
- Only now do the Bangalore head terms become realistic, with the authority the
  above has built

---

## 7. What decides success, honestly

SEO gets people to the door. What we built this week — the greeter, the chat,
the five questions, the report checkout with no form — is what converts them.
If 100 people land on a guide and 3 buy a ₹499 report, the guide pays for itself
in a month. If the chat leaks them, no amount of ranking helps.

So: measure report sales per page, not sessions.
