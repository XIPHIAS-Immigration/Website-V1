// src/data/guides.ts
// -----------------------------------------------------------------------------
// Long-tail guides, each written to answer one specific question honestly and
// end at the report that answers it for the reader's own case.
//
// RULES, because the alternative is the same filler every competitor publishes:
//   * Every figure is either published by a government, or it is not stated.
//   * Where the honest answer is "it depends", the guide says what it depends on
//     rather than hedging. Hedging is what makes these pages worthless.
//   * Nothing promises an outcome. The reports sell because the free page was
//     useful, not because it was frightening.
//
// Slugs sit at the root rather than under /blog, because these are reference
// pages people link to, not posts that age out of a feed.
// -----------------------------------------------------------------------------

import type { ReportProductType } from "@/lib/xia/report-for";

export type GuideSection = {
  heading: string;
  body: string[];
  /** Optional pull-out: the one thing worth taking away from this section. */
  callout?: string;
  /** Optional simple table, rendered as rows of label + value. */
  table?: { caption: string; rows: Array<[string, string]> };
};

export type Guide = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  eyebrow: string;
  standfirst: string;
  /** Queries this page is built to answer. Used for internal anchors, not stuffing. */
  intents: string[];
  updated: string;
  readingMinutes: number;
  sections: GuideSection[];
  faq: Array<{ q: string; a: string }>;
  /** Which paid report answers this question for the reader's own case. */
  report: ReportProductType;
  reportPitch: string;
  /** Tools worth linking from this page. */
  tools: Array<{ label: string; href: string }>;
  related: string[];
};

const UPDATED = "2026-09-13";

export const guides: Guide[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    slug: "canada-pr-for-software-engineers-from-india",
    h1: "Canada PR for software engineers from India",
    title: "Canada PR for Software Engineers from India (2026) | Honest Guide",
    description:
      "What Canada PR actually takes for an Indian software engineer in 2026 — the CRS score you need, why the job-offer points are gone, which provinces still want developers, and where the timeline really goes.",
    eyebrow: "Canada · Express Entry",
    standfirst:
      "Software engineers are the largest single group in the Express Entry pool. That is the whole problem, and it is also solvable.",
    intents: [
      "canada pr for software engineers from india",
      "canada pr for it professionals india",
      "express entry software engineer crs score",
      "canada pr for developers 2026",
    ],
    updated: UPDATED,
    readingMinutes: 9,
    sections: [
      {
        heading: "The uncomfortable arithmetic",
        body: [
          "Indian software engineers are the most over-represented profile in the Express Entry pool. That is not a reason to give up — it is a reason to stop competing on the axis everybody else is competing on. A profile that looks exactly like ten thousand others gets ranked against ten thousand others.",
          "General draws have been settling in a band that a bachelor's degree, three years of experience and IELTS 7 does not reach. The people getting through are not smarter; they have usually done one of three specific things: pushed language to the top band, secured a provincial nomination, or qualified for a category-based draw.",
        ],
        callout:
          "If your plan is “good degree, good job, decent English, wait”, the honest answer is that the queue will not reach you.",
      },
      {
        heading: "The job-offer change nobody told you about",
        body: [
          "IRCC removed the CRS points for an arranged employment offer in 2025. For years, a valid job offer was worth 50 points, and 200 for senior managerial roles. It is now worth zero towards your rank.",
          "This matters specifically to software engineers because the offer-letter route was the standard advice given by agents across India. If someone scored you above 500 on the strength of an offer, that number was wrong. A job offer still matters — for a work permit, for a provincial nomination, for actually having income on arrival — but not for your position in the queue.",
        ],
      },
      {
        heading: "What actually moves your score",
        body: [
          "Language is the cheapest and fastest lever, and it pays twice: once in core points, and again through skill transferability. Moving from CLB 7 to CLB 9 across all four abilities is frequently worth more than fifty points and costs a retest, not a year of your life.",
          "A provincial nomination is worth 600 points and effectively ends the competition. Ontario's Human Capital Priorities stream and British Columbia's tech pathway have both targeted technology occupations, and the thresholds there are set against a far smaller pool than the federal one.",
          "If you have a spouse, their language test and credential assessment are worth up to forty points and are the single most commonly unclaimed thing in the entire system. Two IELTS bookings is a cheap forty points.",
        ],
        table: {
          caption: "Where the points sit for a typical 30-year-old developer",
          rows: [
            ["Age 30 (single applicant)", "105 of a possible 110"],
            ["Bachelor's degree", "120"],
            ["CLB 9 English, all four abilities", "Up to 136 core, plus transferability"],
            ["Three years' foreign skilled work", "50"],
            ["Spouse with CLB 9 and a degree", "Up to 40"],
            ["Provincial nomination", "600"],
          ],
        },
      },
      {
        heading: "Category-based draws, and whether you qualify",
        body: [
          "IRCC now runs draws targeting specific categories rather than the whole pool. Cut-offs in a category draw are set against everyone in that category, not everyone in the pool — which is why they routinely clear far below the general rounds.",
          "The categories have shifted year to year and have leaned towards healthcare, trades, education, agriculture and French-language ability. Software engineering has appeared in STEM-focused rounds in some years and not others, so this is the one part of your plan that should be checked against the current year's announced categories rather than a blog post.",
          "The French category is the one most Indian applicants dismiss and the one most worth a second look. CLB 7 in French is achievable in twelve to eighteen months of serious study, and it has cleared candidates at scores far below anything a general draw has touched.",
        ],
      },
      {
        heading: "Where the timeline actually goes",
        body: [
          "The application itself, once you have an invitation, is processed within a published service standard measured in months. That is not where your time goes.",
          "Your time goes into the Educational Credential Assessment, the language test and its retakes, gathering employment references that describe your duties in the terms the NOC code expects, and then sitting in the pool waiting for a draw that reaches you. For a profile that starts short on points, the realistic horizon from decision to landing is eighteen months to three years — and most of that is before you ever submit anything.",
        ],
        callout:
          "The fastest thing you can do today is book the language test. Everything else waits on a score you do not have yet.",
      },
    ],
    faq: [
      {
        q: "What CRS score does a software engineer need for Canada PR?",
        a: "There is no fixed number — the cut-off moves with every draw and differs by draw type. What is reliable is the direction: general draws have been clearing in the high 400s to low 500s, and a single 30-year-old with a bachelor's, three years' experience and IELTS 7 typically lands in the low 400s. That gap is closed with language, a nomination, or a category draw, not by waiting.",
      },
      {
        q: "Is a job offer still useful for Canada PR?",
        a: "For your CRS score, no — IRCC removed those points in 2025. For everything else, yes: an offer supports a work permit, strengthens most provincial nominee applications, and means you land with income. Just do not let anyone score your profile as though the points still exist.",
      },
      {
        q: "Which province is best for IT professionals?",
        a: "Ontario and British Columbia have both run streams aimed at technology occupations, and Alberta and Saskatchewan have targeted specific skills shortages. The right answer depends on your occupation code and whether you have a connection to the province, because several streams weight that heavily. It is worth checking the current stream criteria rather than a ranking, since these open and close through the year.",
      },
      {
        q: "Can I apply for Canada PR without a consultant?",
        a: "Yes, entirely, and it costs nothing extra to do so. You need a licensed representative only if you want someone to advise or represent you for a fee. What you are buying, if you buy it, is someone catching the things that get applications refused — a NOC code that does not match your actual duties, an employment reference missing the required detail, funds that are not documented the way IRCC expects.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Your actual CRS score, the provincial streams your occupation currently qualifies for, and the filing order — priced at the cost of a language test booking.",
    tools: [
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "Check every route, not just Express Entry", href: "/xia-intelligence" },
      { label: "What it costs from India", href: "/cost-estimator" },
    ],
    related: ["crs-score-450-470-chances", "express-entry-category-based-draws", "canada-pr-processing-time-from-india"],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    slug: "crs-score-450-470-chances",
    h1: "CRS 450 to 470: what your chances actually are",
    title: "CRS Score 450–470: Real Chances of an ITA in 2026 | Honest Answer",
    description:
      "A CRS score in the 450s and 460s sits in the hardest band in Express Entry. Here is what it realistically gets you in 2026, which draws can still reach you, and the fastest ways out of the band.",
    eyebrow: "Canada · Express Entry",
    standfirst:
      "High enough to feel close. Not high enough for a general draw. This is the band where people wait for years without ever being told why.",
    intents: [
      "crs 450 chances",
      "crs score 460 chances of ita",
      "is 470 a good crs score",
      "crs cut off 2026",
    ],
    updated: UPDATED,
    readingMinutes: 7,
    sections: [
      {
        heading: "Why this band is the hardest place to be",
        body: [
          "Below 420, most people accept they need a different plan. Above 490, general draws come round eventually. Between 450 and 470 you are close enough to keep waiting, and that is exactly the trap — the pool refreshes constantly with new profiles, and a score that does not improve gets relatively weaker every month it sits there.",
          "Your rank is not fixed. The score is. Everybody entering the pool behind you with a stronger profile pushes you down, and profiles expire and are resubmitted at higher scores as people improve their language. Standing still is moving backwards.",
        ],
        callout:
          "A score that does not change is a score that is quietly falling in the rankings every single week.",
      },
      {
        heading: "What can still reach you at this level",
        body: [
          "Category-based draws. These are scored against everyone in that category rather than the whole pool, and have repeatedly cleared well below general rounds. If your occupation is in a current category, your score may already be enough.",
          "Provincial nominations. Six hundred points ends the conversation. Several provinces actively fish in exactly this band, because a 460 candidate with a job in a shortage occupation is precisely who they want.",
          "French. CLB 7 across four abilities adds up to fifty points directly and has driven some of the lowest cut-offs in the whole system. It is the single largest available gain for most people in this band, and the only one that is entirely within your control.",
        ],
      },
      {
        heading: "The fastest ways out, ranked by effort",
        body: [
          "One: retake the language test. Most people in this band are at CLB 8 or 9 in three abilities and are being held down by one. Fixing a single weak ability can move the total more than any other single action, and it takes weeks.",
          "Two: get your spouse tested and assessed. Up to forty points sitting untouched because nobody booked a second IELTS.",
          "Three: check whether a second credential or a completed master's is realistic. Worth real points, but measured in years, so it is a decision rather than a fix.",
          "Four: target a province rather than the federal pool. This changes what you are competing in, not just where you sit.",
        ],
      },
      {
        heading: "What nobody should tell you",
        body: [
          "Nobody can tell you the cut-off for a draw that has not happened. Anyone quoting you a future number is guessing, and anyone charging you on the strength of that guess is selling.",
          "What can be said honestly: a 465 is a strong position in a category draw, a weak position in a general draw, and a decisive position with a nomination attached. Which of those three you are in depends on your occupation and your province strategy, not on your score alone.",
        ],
      },
    ],
    faq: [
      {
        q: "Is 450 a good CRS score?",
        a: "It is a mid-range score. It has historically been enough for category-based draws and for several provincial nominee streams, and short of most general draws. Whether it is good depends entirely on whether your occupation is in a current category — for some occupations 450 is comfortable, for others it is years of waiting.",
      },
      {
        q: "How long will I wait at 460?",
        a: "Honestly, nobody knows, and the wait is not the right thing to plan around. What is knowable is which specific actions raise your score and which draws you currently qualify for. A plan built on those is a plan; a plan built on waiting is a hope.",
      },
      {
        q: "Will the CRS cut-off come down?",
        a: "Cut-offs move with the number of invitations issued and the composition of the pool, both of which shift with annual immigration targets. They have risen and fallen in past years. It is not something to build a timeline on.",
      },
      {
        q: "Should I submit an EOI at 455 or wait until my score is higher?",
        a: "Submit. A profile in the pool costs nothing, and you can update it the moment your score improves. Sitting outside the pool while you study for a retake gains you nothing and loses you any category draw that lands in the meantime.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Your exact score, which current draws your profile reaches, and the specific changes ranked by how many points each one is worth to you.",
    tools: [
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "See which programmes you clear", href: "/xia-intelligence" },
      { label: "Compare Canada with Australia", href: "/tools/australia-points-calculator" },
    ],
    related: [
      "canada-pr-for-software-engineers-from-india",
      "documents-required-for-canada-pr-from-india",
      "canada-pr-cost-from-india",
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    slug: "canada-pr-cost-from-india",
    h1: "What Canada PR really costs from India",
    title: "Canada PR Cost from India 2026 | Every Fee, Itemised Honestly",
    description:
      "The complete cost of Canada PR from India — government fees, IELTS, ECA, medicals, biometrics, settlement funds and professional fees, separated so you can compare any quote against it.",
    eyebrow: "Canada · Costs",
    standfirst:
      "Most quotes leave out the largest number in the whole budget. It is not a fee, and you cannot avoid it.",
    intents: [
      "canada pr cost from india",
      "canada pr fees for indian",
      "how much money needed for canada pr",
      "canada immigration consultant fees india",
    ],
    updated: UPDATED,
    readingMinutes: 8,
    sections: [
      {
        heading: "Three different kinds of money",
        body: [
          "Government fees are fixed, published, and identical whoever you use. Third-party costs — the language test, the credential assessment, medicals, police clearances — are also fixed, set by the provider rather than the government. Professional fees are unregulated in India and vary by an order of magnitude between firms.",
          "Any quote that merges these into one number is impossible to compare with another quote. Ask for them separated. A firm that will not separate them has told you something useful.",
        ],
        callout:
          "Government fees are public. If a consultant will not itemise them separately from their own fee, that is the answer to your question.",
      },
      {
        heading: "The one that is not a fee at all",
        body: [
          "Proof of settlement funds is the largest figure in most people's budget, and it is not a payment. It is money you must hold in your own name, documented, unborrowed, to show you can support yourself on arrival. Roughly CAD 14,700 for a single applicant and CAD 18,300 for two, rising with each additional family member, and reviewed annually.",
          "It is waived if you are applying under the Canadian Experience Class, or if you already hold a valid job offer and authorisation to work in Canada. For everyone else it is unavoidable, and it is the reason a budget that looked manageable suddenly is not.",
          "Nobody can lend it to you for a fortnight. The documentation requirements exist specifically to catch that.",
        ],
      },
      {
        heading: "What you will actually spend, and when",
        body: [
          "Before you can even enter the pool: the language test, and the Educational Credential Assessment. These come first, they are non-refundable, and they are the ones people underestimate because most applicants sit the language test more than once.",
          "After an invitation: the PR application fee, the Right of Permanent Residence Fee, biometrics, the panel-physician medical, and police clearance certificates for every country you have lived in for six months or more since turning eighteen. Multiply all of these by every family member included.",
          "Then the part no quote covers: flights, initial accommodation, a car, health cover during the provincial waiting period, and a job search that takes longer than planned. That is what the settlement funds figure exists to cover, and why it is not negotiable.",
        ],
      },
      {
        heading: "How to judge a professional fee",
        body: [
          "There is no correct number, because there is no regulator setting one in India. What you can judge is what you get: who the licensed representative on your file is, what happens if the application is refused, and whether the fee covers a single application or the whole strategy including a provincial route if the federal one stalls.",
          "The refund clause is the part worth reading properly. Government application fees are generally not refundable once processing starts. Whether a professional fee is depends entirely on the agreement you signed — and that is a decision made before you pay, not after a refusal.",
        ],
      },
    ],
    faq: [
      {
        q: "How much money do I need in my bank for Canada PR?",
        a: "Around CAD 14,700 for a single applicant and CAD 18,300 for two, rising with family size. The figure is updated annually and must be unencumbered, in your own name, and documented — not borrowed, and not appearing suddenly the week before you file. It is waived for Canadian Experience Class applicants and for those with a valid arranged job offer.",
      },
      {
        q: "Are consultant fees for Canada PR regulated in India?",
        a: "No. India has no licensing body for immigration consultants, so professional fees are set entirely by the firm. This is exactly why the government portion should be itemised separately — it is the only part of the bill you can verify independently.",
      },
      {
        q: "Do I get my money back if my PR is refused?",
        a: "The Right of Permanent Residence Fee is refunded if you are not approved. The application processing fee generally is not, once processing has begun. Professional fees depend on your service agreement, which is why the refund clause matters more than the headline number.",
      },
      {
        q: "Is it cheaper to apply on my own?",
        a: "Yes, in direct cost — you save the professional fee entirely, and the government charges the same either way. Whether it is cheaper overall depends on whether you would have made a mistake that cost you a refusal or a year. Plenty of people file successfully alone; the ones who struggle are usually those whose work history is complicated or whose occupation code is arguable.",
      },
    ],
    report: "cost_report",
    reportPitch:
      "Every line itemised for your family size and your route, with the settlement-funds figure current at the date of issue — so you can hold any quote up against it.",
    tools: [
      { label: "Estimate your total cost", href: "/cost-estimator" },
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "Verify any consultant's licence", href: "/verify-immigration-consultant" },
    ],
    related: [
      "documents-required-for-canada-pr-from-india",
      "canada-pr-for-software-engineers-from-india",
      "crs-score-450-470-chances",
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    slug: "documents-required-for-canada-pr-from-india",
    h1: "Documents required for Canada PR from India",
    title: "Documents Required for Canada PR from India (2026) | Full Checklist",
    description:
      "The complete document list for Canada PR from India, in the order you need them — and the three documents that cause most refusals when they are wrong rather than missing.",
    eyebrow: "Canada · Documents",
    standfirst:
      "Missing documents delay an application. Wrong documents refuse one. The difference is worth understanding before you start.",
    intents: [
      "documents required for canada pr from india",
      "canada pr document checklist",
      "employment reference letter canada pr format",
      "canada pr proof of funds documents",
    ],
    updated: UPDATED,
    readingMinutes: 8,
    sections: [
      {
        heading: "The order matters more than the list",
        body: [
          "Almost every checklist online gives you the same items in no particular sequence. That is not how it works in practice. Two documents gate everything else: the language test result and the Educational Credential Assessment. Until both exist you cannot calculate a real score, and until you have a real score you do not know which route you are preparing for.",
          "Everything after the invitation is on a sixty-day clock. Police clearances from some countries take longer than sixty days to issue. So the documents you gather before you are invited are not preparation — they are the difference between meeting the deadline and losing the invitation.",
        ],
        callout:
          "Start the police clearance certificates before the invitation arrives, not after. That single decision saves more applications than any other.",
      },
      {
        heading: "Before you enter the pool",
        body: [
          "A valid passport. An IELTS General Training or CELPIP result, less than two years old at the time of invitation. An Educational Credential Assessment from a designated organisation — WES, IQAS, ICES, CES or ICAS — for every foreign credential you intend to claim points for.",
          "Employment reference letters for each role you are claiming. This is the document that causes the most trouble, and it is covered separately below.",
        ],
      },
      {
        heading: "The three documents that actually cause refusals",
        body: [
          "The employment reference letter. It must be on company letterhead, signed, and must state your job title, dates, hours per week, salary, and — critically — your actual duties described in terms that match the NOC code you have claimed. A letter confirming you worked somewhere is not a reference letter. If your duties as written do not match the code you claimed, the experience does not count, and the score that got you invited collapses.",
          "Proof of funds. Six months of bank statements showing the balance was genuinely yours and did not arrive as a lump sum immediately before filing. A letter from the bank on letterhead with contact details, account numbers, and outstanding debts. Money that appears suddenly is treated as borrowed, and borrowed money does not qualify.",
          "Police clearance certificates. One for every country you have lived in for six months or more since turning eighteen, including your home country. These expire, several take months to obtain, and they are the single most common reason a sixty-day deadline is missed.",
        ],
      },
      {
        heading: "After the invitation — the sixty-day list",
        body: [
          "The complete application forms, passports for every family member, the panel-physician medical for everyone, police clearances, proof of funds documentation, birth and marriage certificates, and digital photographs to specification.",
          "If anyone in the family has held a visa refusal from any country, that must be declared. Refusals are not automatically fatal; undisclosed refusals frequently are, and misrepresentation findings carry a five-year ban.",
        ],
      },
      {
        heading: "Translation and certification",
        body: [
          "Any document not in English or French needs a certified translation plus an affidavit from the translator. Indian documents in regional languages routinely need this and are routinely forgotten until the deadline.",
          "Scan everything in colour, legibly, within the file size limits, and name the files clearly. A rejected upload late in a sixty-day window is a needlessly expensive way to lose an invitation.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the most important document for Canada PR?",
        a: "The employment reference letter, because it is the one most often wrong rather than missing. It must describe your actual duties in terms that match the NOC code you claimed. If they do not match, that experience does not count — and the score that earned your invitation was built on it.",
      },
      {
        q: "How long are police clearance certificates valid?",
        a: "Validity varies by issuing country, and IRCC generally expects a certificate issued recently relative to your application. The practical problem is issuing time rather than validity: several countries take months, and you only have sixty days after an invitation. Start them early.",
      },
      {
        q: "Can I use my spouse's bank account for proof of funds?",
        a: "Joint accounts are generally acceptable where your spouse is accompanying you. Funds held solely in the name of someone not migrating with you are not. The test is whether the money is genuinely available to you on arrival, and the documentation requirements are designed to establish exactly that.",
      },
      {
        q: "What happens if a document is missing after I am invited?",
        a: "An incomplete application is normally returned without processing, and you lose the invitation and go back to the pool. You do not usually get an extension. This is the reason the pre-invitation preparation matters so much more than it appears to.",
      },
    ],
    report: "docs_report",
    reportPitch:
      "Your personal checklist in filing order, with the reference-letter wording your specific NOC code requires and a realistic date for every item.",
    tools: [
      { label: "Check which programmes you qualify for", href: "/xia-intelligence" },
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "What it all costs", href: "/cost-estimator" },
    ],
    related: [
      "canada-pr-cost-from-india",
      "canada-pr-for-software-engineers-from-india",
      "crs-score-450-470-chances",
    ],
  },

  /* ------------------------------------------------------------------ 5 */
  {
    slug: "canada-pr-processing-time-from-india",
    h1: "How long Canada PR actually takes from India",
    title: "Canada PR Processing Time from India (2026) | Where the Time Goes",
    description:
      "The six-month service standard is real, and it is not your timeline. What actually takes the time on a Canada PR application from India, step by step, with the parts you control marked.",
    eyebrow: "Canada · Timeline",
    standfirst:
      "Almost everyone quotes the processing standard. Almost nobody counts the eleven months before it starts.",
    intents: [
      "canada pr processing time from india",
      "how long does canada pr take from india",
      "express entry timeline india",
      "canada pr 2026 processing time",
    ],
    updated: UPDATED,
    readingMinutes: 8,
    sections: [
      {
        heading: "The number everyone quotes, and what it actually covers",
        body: [
          "IRCC publishes a service standard of six months for Express Entry permanent residence applications. That clock starts the day you submit a complete application, which is only possible after you have received an Invitation to Apply. It does not include anything you do before that.",
          "This is the single biggest source of disappointment in the Indian market. Somebody is told “six to eight months” in a first consultation, takes that as the answer to “when do I land in Canada”, and is then sitting in the pool a year later wondering what went wrong. Nothing went wrong. The six months was never the question they were asking.",
        ],
        callout:
          "The service standard measures IRCC's work, not yours. Your work comes first, and it is usually longer.",
      },
      {
        heading: "Where the time really goes, in order",
        body: [
          "Educational Credential Assessment. You order it, your university sends transcripts directly to the assessing body, and the assessing body issues a report. The Indian university step is the variable one — some institutions turn documents around in days, others take months, and there is nothing an immigration consultant can do to accelerate a registrar's office.",
          "Language testing. Booking to result is short. Getting the score you actually need is not, because most people book once, land a band below what their profile requires, and then need a retake with real preparation in between. Budget for two attempts and be pleasantly surprised if you only need one.",
          "Employment references. Every role you claim needs a letter on company letterhead stating your title, dates, hours, salary and — the part that gets missed — duties described so they map to the NOC code you are claiming. Getting a former employer in another city to reissue a letter with the right wording is frequently the slowest single step in the whole file.",
          "Then the pool. This is the wait nobody can put a number on, because it depends entirely on your score against draws that have not happened yet.",
        ],
        table: {
          caption: "A realistic sequence, with the controllable parts marked",
          rows: [
            ["Educational Credential Assessment", "Weeks to months — partly outside your control"],
            ["Language test, including one retake", "6–12 weeks — fully within your control"],
            ["Employment reference letters", "Weeks — depends on former employers"],
            ["Profile in the Express Entry pool", "Unbounded — depends on your score"],
            ["After the Invitation to Apply", "IRCC service standard, currently six months [VERIFY current standard at time of publishing]"],
            ["Post-approval landing steps", "Weeks — medicals, PR confirmation, travel"],
          ],
        },
      },
      {
        heading: "Provincial nomination changes the shape, not always the length",
        body: [
          "A provincial nomination adds 600 points and effectively guarantees an invitation at the next draw. What it also adds is a second application, to the province, with its own intake windows, its own document list and its own processing time before the federal clock even starts.",
          "So a nomination usually shortens the unbounded part — the pool wait — and lengthens the documented part. For a profile stuck in the low 400s that is an overwhelmingly good trade, because an unbounded wait is not a timeline at all. For a profile already clearing general draws, it can be slower than going direct.",
        ],
      },
      {
        heading: "What genuinely speeds it up",
        body: [
          "Start the ECA and the language test on the same day you decide, before anything else and before engaging anyone. They are the two longest-lead items and they are the two that gate everything downstream.",
          "Collect employment references while you are still on good terms with each employer, not when you need them. A reference from a manager who left the company two years ago is a considerably harder document to obtain.",
          "Fix the score before you enter the pool rather than after. Sitting at a score that cannot clear a draw is not progress; it is just waiting somewhere visible.",
        ],
        callout:
          "The only two levers that reliably move the total are language preparation and a nomination. Everything else is paperwork discipline.",
      },
      {
        heading: "What nobody can tell you honestly",
        body: [
          "Any consultant who gives you a confident total — “you will land in fourteen months” — is guessing at the pool wait, which depends on draw cut-offs that have not been published yet and on how many people join the pool behind you.",
          "What can be said honestly is a range for each controllable step, the current published service standard, and an estimate of the pool wait at your score based on where recent draws have landed. That is a forecast with its assumptions visible, which is a different thing from a promise.",
        ],
      },
    ],
    faq: [
      {
        q: "How long does Canada PR take from India in total?",
        a: "For a profile that already clears draws, roughly a year from decision to landing, most of it spent on the ECA, language testing and references before you ever submit. For a profile that starts short on points, eighteen months to three years, because the pool wait is unbounded until your score reaches the cut-off. Anyone quoting a single confident number is guessing at the part that cannot be known in advance.",
      },
      {
        q: "Is the six-month processing standard reliable?",
        a: "It is a target IRCC publishes and reports against, not a guarantee, and it applies only after an Invitation to Apply. Files with complexity — multiple countries of residence, security or medical follow-ups, dependants abroad — routinely run past it.",
      },
      {
        q: "Does applying through a consultant make it faster?",
        a: "Not to IRCC, no. There is no priority queue, and a licensed representative gets the same service standard as a self-filer. Where a good representative saves time is upstream: catching a NOC mismatch or a deficient reference letter before submission rather than after a refusal, which is where months are genuinely lost.",
      },
      {
        q: "What is the fastest route to Canada from India?",
        a: "For most profiles, a study permit or a work permit reaches Canada sooner than permanent residence does — but they are temporary status, with their own conditions and no guarantee of transition. If the goal is specifically permanent residence, the fastest realistic path is usually the highest language score you can reach plus a provincial stream your occupation is actually on.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Your timeline, step by step, with the pool wait estimated at your actual score — and the two things in your file that are currently costing you the most time.",
    tools: [
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "Check every route, not just Express Entry", href: "/xia-intelligence" },
      { label: "What it costs from India", href: "/cost-estimator" },
    ],
    related: ["canada-pr-for-software-engineers-from-india", "documents-required-for-canada-pr-from-india", "canada-pr-cost-from-india"],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    slug: "australia-189-vs-190",
    h1: "Australia 189 vs 190: which one should you actually file",
    title: "Australia 189 vs 190 (2026) | Which Visa to File, and Why",
    description:
      "Subclass 189 and 190 are both permanent from day one. The difference is five points, one state commitment and two completely different queues. How to tell which one your profile belongs in.",
    eyebrow: "Australia · Skilled migration",
    standfirst:
      "Most people compare these on points. The real difference is which queue you are standing in.",
    intents: [
      "australia 189 vs 190",
      "subclass 189 or 190 which is better",
      "skilled independent vs state nominated visa",
      "190 visa state commitment",
    ],
    updated: UPDATED,
    readingMinutes: 8,
    sections: [
      {
        heading: "What actually separates them",
        body: [
          "Subclass 189, Skilled Independent, is a points-tested permanent visa with no sponsor. Once granted you may live and work anywhere in Australia, and you answer to nobody about where you settle.",
          "Subclass 190, Skilled Nominated, is the same points-tested permanent visa with a state or territory government nomination attached. The nomination is worth five points, and in exchange you indicate an intention to live and work in that state — commonly framed as around two years.",
          "Both are permanent residence from the day of grant. Both give the same work rights, the same Medicare access, and the same pathway to citizenship. Neither is a “lesser” visa, which is the most common misconception in this comparison.",
        ],
        callout:
          "They are the same visa product with different sponsors. The choice is about queues and occupation lists, not about quality of outcome.",
      },
      {
        heading: "The five points are not the point",
        body: [
          "Five points matters less than which pool you are ranked in. A 189 invitation is decided against every applicant in Australia's national skilled pool. A 190 invitation is decided against the far smaller group of people a single state is interested in this year.",
          "That is why a profile sitting well below the national cut-off can be invited comfortably by a state that wants its occupation — and why an otherwise strong profile in an oversubscribed occupation can wait indefinitely on 189 while a state nomination clears it in months.",
          "It also cuts the other way. States nominate against their own labour-market priorities, which change annually and sometimes mid-year. An occupation a state wanted last year may not appear on its list at all this year.",
        ],
      },
      {
        heading: "The occupation lists are the real gate",
        body: [
          "Subclass 189 draws from the Medium and Long-term Strategic Skills List. If your occupation is not on it, 189 is simply not available to you regardless of your score.",
          "Subclass 190 draws from the broader list, but the operative list is the nominating state's own — each state publishes which occupations it will nominate, often with extra conditions such as minimum experience, a job offer in the state, current residence in the state, or a local qualification.",
          "So the sequence is: get the skills assessment for your occupation first, then see which lists that occupation actually appears on, and only then compare points. Doing it in the other order is how people spend money assessing an occupation that no state wants.",
        ],
        table: {
          caption: "The comparison that actually matters",
          rows: [
            ["Points from the visa itself", "189: none · 190: five"],
            ["Ranked against", "189: the national pool · 190: that state's shortlist"],
            ["Occupation list", "189: MLTSSL · 190: the nominating state's own list"],
            ["Where you may live", "189: anywhere · 190: indicated intention to settle in the state"],
            ["Extra application step", "189: none · 190: a separate state nomination application"],
            ["Status on grant", "Both: permanent residence"],
            ["Minimum points to be invited", "Both: 65 to enter, but invitations clear far higher [VERIFY current round scores]"],
          ],
        },
      },
      {
        heading: "How binding is the state commitment, really",
        body: [
          "This is the question everyone asks quietly and few advisers answer plainly. The 190 visa itself carries no legally enforceable condition tying you to the nominating state — unlike the regional visas, which do.",
          "What does exist is a commitment you make to the state in the nomination application, and states do follow up. Some ask for periodic updates during the first two years. Leaving early will not have your permanent residence cancelled, but it can affect future dealings with that state, including nominating a relative later.",
          "The honest framing is this: treat it as a genuine commitment you intend to keep. If you already know you want Sydney and you are applying to a state you have no interest in living in, you are starting a permanent move with a statement you do not mean.",
        ],
      },
      {
        heading: "So which should you file",
        body: [
          "File 189 if your occupation is on the MLTSSL and your points clear where recent national rounds have landed. It is simpler, has no second application, and leaves you free.",
          "File 190 if your occupation is on a state's list and your national score is short, or if your occupation is not on the MLTSSL at all. The five points help; the smaller queue helps far more.",
          "And you are not usually choosing. You can hold an Expression of Interest for both simultaneously, and most well-run files do exactly that — taking whichever invitation arrives first, rather than betting on one.",
        ],
        callout:
          "In most cases the answer is “both”. Lodge one EOI covering both subclasses and let the queues decide.",
      },
    ],
    faq: [
      {
        q: "Is 190 easier to get than 189?",
        a: "Frequently yes, because you are ranked against a state's shortlist rather than the national pool, and you get five extra points. But it is only available if your occupation is on that state's current list and you meet its additional conditions, which can include a job offer or existing residence in the state.",
      },
      {
        q: "Can I apply for both 189 and 190 at the same time?",
        a: "Yes. A single Expression of Interest in SkillSelect can indicate both subclasses, and you can be nominated by a state while remaining in the national pool. Most applicants should do this rather than choosing one.",
      },
      {
        q: "Can I move states after getting a 190 visa?",
        a: "The visa itself does not legally confine you, unlike the regional subclasses. You did, however, make a commitment to the nominating state, and states may follow up during the first two years. Treat it as a commitment you mean to honour rather than a formality.",
      },
      {
        q: "How many points do I need for Australia PR in 2026?",
        a: "Sixty-five points is the minimum to submit an Expression of Interest, and it is nowhere near enough to be invited. Actual invitation scores are set per round and per occupation, so the meaningful figure is where rounds have recently cleared for your specific occupation rather than any headline minimum.",
      },
    ],
    report: "compare_report",
    reportPitch:
      "Your occupation checked against the MLTSSL and every current state list, your points modelled for both subclasses, and which queue your profile actually belongs in.",
    tools: [
      { label: "Calculate your Australia points", href: "/tools/australia-points-calculator" },
      { label: "Check every route, not just Australia", href: "/xia-intelligence" },
      { label: "What it costs from India", href: "/cost-estimator" },
    ],
    related: ["australia-pr-points-for-engineers-from-india", "canada-pr-cost-from-india", "canada-pr-for-software-engineers-from-india"],
  },

  /* ------------------------------------------------------------------ 7 */
  {
    slug: "express-entry-category-based-draws",
    h1: "Express Entry category-based draws: who they actually help",
    title: "Express Entry Category-Based Draws (2026) | Who Qualifies, Who Doesn't",
    description:
      "Category draws clear at scores general rounds never touch — but only for people inside the category. How the categories are chosen, how to tell whether you are in one, and the one most Indian applicants dismiss.",
    eyebrow: "Canada · Express Entry",
    standfirst:
      "A category draw is not a lower standard. It is a smaller room.",
    intents: [
      "express entry category based draws",
      "category based draw india eligibility",
      "stem category draw express entry",
      "french category draw canada pr",
    ],
    updated: UPDATED,
    readingMinutes: 8,
    sections: [
      {
        heading: "What changed, and why it matters to a 440",
        body: [
          "Until 2023 an Express Entry draw ranked everyone in the pool against everyone else. Since then IRCC has also run rounds targeting specific categories — announced by the Minister each year against Canada's stated labour-market and demographic priorities.",
          "The mechanical consequence is the only thing you need to understand: in a category round, the cut-off is set against everyone in that category, not everyone in the pool. Because a category contains a fraction of the people, the score that clears it is routinely far below what a general round demands.",
          "This is why a profile sitting at a score that will never clear a general draw is not necessarily stuck. It is stuck in one room. There may be another room.",
        ],
        callout:
          "Category draws have cleared candidates well below general-round cut-offs. Same pool, same points, different denominator.",
      },
      {
        heading: "How the categories are chosen — and why last year's list is worthless",
        body: [
          "The categories are set by the Minister annually, after consultation, and published for that year. They have covered areas such as healthcare, science and technology occupations, skilled trades, transport, agriculture and food, and French-language ability — but the composition has shifted year to year, and occupations have moved in and out.",
          "This is the single most common way people are misled on this topic. A guide written eighteen months ago naming the categories is not describing the system you are applying into, and an agent quoting a STEM draw from a previous year may be quoting something that no longer exists in that form.",
          "Check the current year's announced categories and the current eligible occupation list before you make any decision based on this. That is the one part of this page that must be verified live. [VERIFY current year categories and eligible occupations before publishing]",
        ],
      },
      {
        heading: "How to tell whether you are actually in a category",
        body: [
          "Occupation categories are defined by NOC code, and eligibility usually requires a minimum period of continuous work experience in an eligible occupation within a recent window — commonly six months in the past three years.",
          "The trap here is that your job title is irrelevant. What matters is whether your actual duties match the NOC code you are claiming, as described in your employment reference letters. Someone whose business card says “Data Engineer” may or may not sit in an eligible code depending on what those letters say they did.",
          "So the test is not “is my field on the list”. It is “can I evidence six months of duties matching a listed NOC code, in letters an officer will accept”. Those are very different questions, and only the second one gets you invited.",
        ],
        table: {
          caption: "What determines category eligibility",
          rows: [
            ["Your job title", "Irrelevant"],
            ["Your employer's industry", "Irrelevant"],
            ["NOC code your duties actually match", "Decisive"],
            ["Evidence of that in reference letters", "Decisive"],
            ["Minimum recent experience in the code", "Required — commonly six months in three years [VERIFY]"],
            ["Meeting the underlying programme criteria", "Still required — a category does not waive them"],
          ],
        },
      },
      {
        heading: "The French category, which most Indian applicants dismiss",
        body: [
          "French-language proficiency has been a standing category, and it has repeatedly cleared candidates at scores far below anything a general round has touched — because the number of French-capable people in the pool is small.",
          "The reflex response is that learning French is unrealistic. For a great many profiles that is wrong. The threshold is a measured language level, not fluency, and reaching it in twelve to eighteen months of serious, structured study is an ordinary outcome for someone who has already learned English to a high band.",
          "Compare that against the alternative. If your score is 440 and general rounds are clearing in the 500s, your realistic options are a provincial nomination, a substantial jump in English that you may already have maxed out, or a language you can actually acquire. Eighteen months of French is frequently the shortest of those three paths, and almost nobody in the Indian market suggests it.",
        ],
        callout:
          "If you have already maxed your English band, French is often the cheapest remaining fifty-plus points you can buy with time rather than luck.",
      },
      {
        heading: "What a category draw does not do",
        body: [
          "It does not waive the underlying programme requirements. You still need to be eligible for Express Entry in the first place — the skills assessment, the language minimum, the funds, the work experience.",
          "It does not lower the bar for the application itself. The same documents are scrutinised, and a weak NOC match is more likely to be questioned in a category round, not less, because the category eligibility rests on it.",
          "And it does not repeat on a schedule you can plan around. Rounds are announced as they happen. A category being drawn frequently this quarter is not a commitment that it will be drawn next quarter.",
        ],
      },
    ],
    faq: [
      {
        q: "What are the Express Entry categories this year?",
        a: "They are set annually by the Minister and change between years, so the only reliable source is IRCC's current announcement rather than any guide. Past categories have included healthcare, STEM occupations, trades, transport, agriculture and French-language proficiency — but occupations have moved in and out of those groups.",
      },
      {
        q: "Does a category draw have a lower CRS cut-off?",
        a: "In practice usually yes, sometimes substantially, because the cut-off is calculated against only the candidates in that category rather than the whole pool. It is not a lower standard — it is a smaller group of people being ranked.",
      },
      {
        q: "How do I know if my occupation qualifies for a category?",
        a: "By NOC code and by what your employment reference letters evidence, not by job title. You typically need a minimum period of recent continuous experience in an eligible code, described in your letters in terms that match that code's duties. A title that sounds right with letters that do not match is the most common failure here.",
      },
      {
        q: "Is learning French really worth it for Canada PR?",
        a: "For a candidate whose English is already at the top band and whose score still falls short of general rounds, it is often the most reliable remaining lever. The requirement is a measured proficiency level rather than fluency, and the French category has repeatedly cleared scores far below general rounds because so few candidates hold it.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Whether your actual duties place you in a current category, what your reference letters would need to say, and what your score looks like inside that category rather than the whole pool.",
    tools: [
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "Check every route, not just Express Entry", href: "/xia-intelligence" },
      { label: "What it costs from India", href: "/cost-estimator" },
    ],
    related: ["canada-pr-for-software-engineers-from-india", "crs-score-450-470-chances", "canada-pr-for-nurses-from-india"],
  },

  /* ------------------------------------------------------------------ 8 */
  {
    slug: "canada-pr-for-nurses-from-india",
    h1: "Canada PR for nurses from India",
    title: "Canada PR for Nurses from India (2026) | Licensing Before Immigration",
    description:
      "Nursing is one of the strongest immigration profiles India produces — and the licensing runs on a separate track from the visa. What order to do things in, and where Indian-trained nurses lose years.",
    eyebrow: "Canada · Healthcare",
    standfirst:
      "Your immigration file and your licence file are two different projects. Running them in the wrong order costs years.",
    intents: [
      "canada pr for nurses from india",
      "indian nurse canada immigration process",
      "nclex for indian nurses canada",
      "healthcare category draw nurses",
    ],
    updated: UPDATED,
    readingMinutes: 9,
    sections: [
      {
        heading: "Why nursing is a strong profile, and where that stops helping",
        body: [
          "Canada has a documented shortage of registered nurses, healthcare has featured in category-based Express Entry draws, and several provinces run dedicated healthcare streams. On the immigration side, a nurse's profile is about as favourable as Indian applicants get.",
          "None of that lets you work as a nurse on arrival. Immigration status and professional licensure are granted by different authorities, on different timelines, against different criteria. Permanent residence permits you to live and work in Canada; it says nothing about whether a provincial regulator will let you practise nursing.",
          "This is the single most expensive misunderstanding in this category. People land as permanent residents, having never started the licensing process, and spend the first two years in unrelated work while doing what they could have done from India.",
        ],
        callout:
          "PR grants you the right to work. It does not grant you the right to work as a nurse. Those are separate applications to separate bodies.",
      },
      {
        heading: "The licensing track, which should start first",
        body: [
          "Nursing is regulated province by province, and each province has its own regulatory college. Most route internationally educated applicants through a central credential assessment service, which collects your education and registration history from India and produces a report the provincial regulator then interprets.",
          "That report can result in full recognition, a requirement for further assessment or bridging education, or registration in a different category than the one you hold in India. Which outcome you get depends on your specific programme and the province you apply to — two nurses from the same Indian college can receive different determinations from different provinces.",
          "Then there is the licensing examination, and in most Canadian provinces that is the NCLEX-RN. It can be sat from outside Canada, which matters enormously: the exam is the longest-lead item in the whole plan and it is the one you can complete while still in India.",
        ],
      },
      {
        heading: "The immigration track, running in parallel",
        body: [
          "On the federal side, registered nurses sit in a NOC code that has appeared in healthcare category draws, which are drawn against a much smaller group than the general pool. As always, eligibility rests on your reference letters evidencing duties matching the code, not on your job title.",
          "Several provinces also run healthcare-specific nominee streams, some with direct employer connections, and a nomination is worth 600 CRS points. For a nurse, the provincial route is frequently stronger than the federal one because the province has an operational reason to want you.",
          "The two tracks feed each other. A regulator's determination, or an offer from a health authority, strengthens a provincial application. Conversely, some employers will not begin recruitment conversations until you have started licensing.",
        ],
        table: {
          caption: "What to start when",
          rows: [
            ["Credential assessment for nursing", "First — longest lead, gates everything else"],
            ["NCLEX-RN preparation and booking", "Early — sittable from outside Canada"],
            ["Educational Credential Assessment (immigration)", "Early — separate from the nursing assessment"],
            ["IELTS or CELBAN", "Early — check which the regulator accepts [VERIFY per province]"],
            ["Express Entry profile", "Once language and ECA are in hand"],
            ["Provincial healthcare stream", "When the regulator's determination or an employer connection exists"],
          ],
        },
      },
      {
        heading: "Where Indian-trained nurses actually lose time",
        body: [
          "Choosing the province after landing rather than before. Requirements differ materially between provinces, and a determination is not portable in the way people assume. Deciding where you intend to practise early changes what you should be doing now.",
          "Taking the wrong English test. Immigration and nursing regulators do not always accept the same examination, and some regulators require a specific test or a specific band profile. Sitting the wrong one means sitting another.",
          "Reference letters written for a hospital HR file rather than for an immigration officer. Indian hospital letters routinely state designation and dates and nothing else. For both the NOC match and the credential assessment you need duties, hours and scope described in detail, and getting a former employer to reissue those letters years later is painful.",
          "And leaving the NCLEX until after landing, which converts an exam you could have passed while earning in India into an exam you are sitting while unemployed in Canada.",
        ],
        callout:
          "Decide the province before you start. Almost every other decision in this file depends on it, and almost nobody does it first.",
      },
      {
        heading: "What this looks like if it goes well",
        body: [
          "A nurse who starts the credential assessment and the NCLEX in India, takes the language test the regulator accepts, obtains employment references written properly the first time, and targets a province whose healthcare stream matches their profile, is running both tracks at once rather than in sequence.",
          "That is the difference between arriving licensed or licensable, and arriving as a permanent resident who cannot yet work in their profession. Both are the same visa. They are not the same life.",
        ],
      },
    ],
    faq: [
      {
        q: "Can Indian nurses work in Canada right after getting PR?",
        a: "You can work in Canada, but not as a registered nurse until a provincial regulator has licensed you. Licensure is a separate process involving a credential assessment, usually the NCLEX-RN examination, and a language test the regulator accepts. Starting it after landing is the most common and most costly mistake in this category.",
      },
      {
        q: "Can I take the NCLEX-RN from India?",
        a: "The examination can be sat outside Canada, which is why it should be started early rather than after arrival. Confirm the current testing arrangements and your eligibility to register for it with the provincial regulator you are applying to.",
      },
      {
        q: "Which Canadian province is best for Indian nurses?",
        a: "There is no universal answer — provinces differ in how they assess internationally educated nurses, in their nominee streams, and in demand by specialty. The decision should be made before you begin, because the credential assessment and much of what follows is province-specific and does not transfer cleanly.",
      },
      {
        q: "Do nurses get a lower CRS cut-off?",
        a: "Not lower, but potentially ranked in a smaller group. Healthcare has featured in category-based draws, which are decided against candidates in that category rather than the whole pool, so cut-offs there have cleared well below general rounds. Eligibility depends on your NOC code being evidenced by your reference letters.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Your province chosen on the evidence, both tracks sequenced in the right order, and the specific wording your employment references need before you request them.",
    tools: [
      { label: "Calculate your CRS score", href: "/tools/crs-calculator" },
      { label: "Check every route, not just Express Entry", href: "/xia-intelligence" },
      { label: "Documents you will need", href: "/documents-required-for-canada-pr-from-india" },
    ],
    related: ["express-entry-category-based-draws", "canada-pr-processing-time-from-india", "documents-required-for-canada-pr-from-india"],
  },

  /* ------------------------------------------------------------------ 9 */
  {
    slug: "australia-pr-points-for-engineers-from-india",
    h1: "Australia PR points for engineers from India",
    title: "Australia PR Points for Engineers from India (2026) | Real Numbers",
    description:
      "Where an Indian engineer's points actually come from, why Engineers Australia is the step that decides everything, and the four levers that move a 65 to a competitive score.",
    eyebrow: "Australia · Skilled migration",
    standfirst:
      "Sixty-five points gets you into the queue. It has never got anyone an invitation.",
    intents: [
      "australia pr points for engineers from india",
      "engineers australia skills assessment points",
      "mechanical engineer australia pr points",
      "civil engineer pr australia india",
    ],
    updated: UPDATED,
    readingMinutes: 9,
    sections: [
      {
        heading: "The assessment decides everything, and it comes first",
        body: [
          "For most engineering occupations the assessing authority is Engineers Australia, and its determination governs which occupation code you may claim. That code then determines which visa subclasses are open to you and which states will nominate you. Nothing else in the file matters until this is settled.",
          "Indian engineering degrees are assessed against the accreditation accords Australia recognises. A degree from an accredited programme follows one pathway; a degree outside that follows a competency-demonstration pathway requiring written career episodes evidencing your engineering competencies. The second is slower and considerably more work, and it is where most Indian applicants actually sit.",
          "Start it first. It is the longest-lead item, it cannot be parallelised away, and a decision on your occupation code changes every subsequent choice.",
        ],
        callout:
          "Assess first, plan second. Choosing a target state before you know your assessed occupation is planning around a guess.",
      },
      {
        heading: "Where the points actually come from",
        body: [
          "The points test rewards age, English, qualifications and experience, and almost every Indian engineer's score is decided by the same three or four rows. Age is the one you cannot influence and the one that quietly runs out — the top band ends before most people expect it to.",
          "English is where the largest recoverable gap usually sits. The difference between the competent band and the superior band is substantial, and it is a retest rather than a life change. A great many engineers file at the middle band having never seriously prepared for the top one.",
          "Overseas skilled employment accrues in bands by years, and only counts post-assessment-relevant experience described properly in your references. Experience you cannot evidence in the terms the occupation code expects does not exist as far as the points test is concerned.",
        ],
        table: {
          caption: "The rows that decide an Indian engineer's score",
          rows: [
            ["Age", "Highest band in the mid-to-late twenties, falling thereafter [VERIFY current bands]"],
            ["English — superior vs competent", "The single largest recoverable gap for most applicants"],
            ["Bachelor's degree recognised by the assessor", "Standard qualification points"],
            ["Doctorate", "Higher band than a bachelor's"],
            ["Overseas skilled employment", "Banded by years — evidence-dependent"],
            ["Australian study or work", "Additional points, if applicable"],
            ["Partner with skills and English", "Commonly unclaimed — worth having assessed"],
            ["State nomination (190)", "Five points, and a far smaller queue"],
          ],
        },
      },
      {
        heading: "The four levers, ranked by how fast they move",
        body: [
          "One: English to the superior band. Fastest, cheapest, largest. If you have not sat the test having genuinely prepared for the top band, you do not yet know your score.",
          "Two: your partner's points. A partner's skills assessment and English test is worth claiming and is skipped constantly, usually because nobody mentioned it. Two test bookings is a cheap addition to a borderline file.",
          "Three: state nomination. Five points on paper, but the real value is being ranked against a state's shortlist rather than the national pool. For an oversubscribed engineering discipline this is frequently the difference between an invitation and an indefinite wait.",
          "Four: a professional year or further Australian study. Slow and expensive, and only sensible for someone already in Australia on another visa.",
        ],
      },
      {
        heading: "Discipline matters more than the word ‘engineer’",
        body: [
          "Australia does not have a shortage of engineers in general. It has shortages in particular disciplines, and the state nomination lists reflect that with some precision — civil, structural and certain mechanical and electrical specialisations have historically been treated very differently from generalist software-adjacent engineering roles.",
          "Which means two Indian engineers with identical points can have completely different prospects. The one whose assessed occupation appears on three state lists has options; the one whose occupation appears on none has a points problem that no amount of extra points will solve.",
          "Check the occupation against the current national and state lists before you spend anything. That check costs nothing and it is the one that determines whether this is worth pursuing at all. [VERIFY current MLTSSL and state nomination lists]",
        ],
        callout:
          "An occupation that no state currently nominates is not a points problem. More points will not fix it.",
      },
    ],
    faq: [
      {
        q: "How many points do I need as an engineer for Australia PR?",
        a: "Sixty-five is the minimum to lodge an Expression of Interest and is nowhere near an invitation. Actual invitation scores are set per round and vary sharply by occupation — some engineering disciplines clear well below others. The meaningful number is where recent rounds have cleared for your assessed occupation, not any headline minimum.",
      },
      {
        q: "Is Engineers Australia assessment difficult for Indian degrees?",
        a: "It depends on whether your programme is covered by the accreditation accords Australia recognises. Where it is not, the competency-demonstration pathway requires written career episodes evidencing specific engineering competencies, which is substantial work and the most common point of delay.",
      },
      {
        q: "Does work experience in India count for Australian points?",
        a: "Yes, overseas skilled employment accrues points in bands by years — provided the experience is in your assessed occupation and your reference letters describe duties in terms matching it. Experience you cannot evidence properly does not count.",
      },
      {
        q: "Should I apply for 189 or 190 as an engineer?",
        a: "Usually both, through a single Expression of Interest. Which one invites you first depends on whether your discipline is oversubscribed nationally and whether any state currently wants it. For a common discipline, the state route is frequently the faster one.",
      },
    ],
    report: "route_report",
    reportPitch:
      "Your points modelled row by row, your assessed occupation checked against every current state list, and which of the four levers is worth your money first.",
    tools: [
      { label: "Calculate your Australia points", href: "/tools/australia-points-calculator" },
      { label: "189 or 190 — which to file", href: "/australia-189-vs-190" },
      { label: "Check every route, not just Australia", href: "/xia-intelligence" },
    ],
    related: ["australia-189-vs-190", "canada-pr-for-software-engineers-from-india", "canada-pr-cost-from-india"],
  },

  /* ----------------------------------------------------------------- 10 */
  {
    slug: "portugal-golden-visa-from-india",
    h1: "Portugal Golden Visa from India, after the rules changed",
    title: "Portugal Golden Visa from India (2026) | What Survived the 2023 Reform",
    description:
      "Portugal removed the property route in 2023. What remains, what it costs, how little time you actually have to spend there, and the questions to ask before wiring money to a fund.",
    eyebrow: "Portugal · Residency by investment",
    standfirst:
      "The route everybody knows about no longer exists. The routes that remain are narrower, and better diligence matters far more.",
    intents: [
      "portugal golden visa from india",
      "portugal golden visa 2026 rules",
      "portugal golden visa investment fund option",
      "portugal residency by investment india",
    ],
    updated: UPDATED,
    readingMinutes: 9,
    sections: [
      {
        heading: "What changed, and why old advice is dangerous here",
        body: [
          "Portugal's 2023 housing legislation removed residential real-estate acquisition as a qualifying investment for the residence-by-investment programme, along with the pure capital-transfer option. That was the route the overwhelming majority of applicants used and the one every older article describes.",
          "The programme itself was not abolished. Qualifying routes continue — centred on investment funds, scientific research, cultural production, job creation and business capitalisation — each with its own threshold and conditions.",
          "The practical consequence for an Indian applicant is that any guide, agent or brochure describing a property purchase pathway is describing something that no longer exists. Treat that as a competence test for whoever you are speaking to.",
        ],
        callout:
          "If somebody offers you Portuguese residency through buying an apartment, they have not read the law since 2023. Stop there.",
      },
      {
        heading: "The routes that remain",
        body: [
          "The investment-fund route is now the main path in practice: a subscription into a qualifying Portuguese fund, held for a minimum period, with the fund itself subject to regulatory conditions including limits on real-estate exposure.",
          "Alongside it sit research funding, support for artistic or cultural output, direct job creation, and capitalising a Portuguese company while creating a set number of positions. These are genuinely used, but they suit a much narrower set of circumstances.",
          "Thresholds and conditions have been revised more than once, and are the part of this page most likely to be out of date by the time you read it. [VERIFY current qualifying routes, minimum amounts and holding periods against SEF/AIMA before relying on any figure]",
        ],
        table: {
          caption: "What to establish before committing to any route",
          rows: [
            ["Qualifying investment routes currently open", "[VERIFY — changed repeatedly since 2023]"],
            ["Minimum investment amount per route", "[VERIFY]"],
            ["Minimum holding period", "[VERIFY]"],
            ["Physical presence required", "Very low by design — an average of about seven days a year"],
            ["Residency renewal cycle", "[VERIFY current card validity]"],
            ["Years before citizenship eligibility", "Five, subject to language and other conditions [VERIFY counting start date]"],
            ["Family included", "Spouse, dependent children, dependent parents"],
          ],
        },
      },
      {
        heading: "Why Indians still choose it, despite the reform",
        body: [
          "The physical-presence requirement remains among the lightest in Europe — an average of roughly a week a year over the residence period. For a business owner in India who does not intend to relocate, that is the entire proposition.",
          "It carries Schengen mobility, and family members are included under the same application rather than being separate cases. And it leads to a citizenship pathway on a timescale that is short by European standards, subject to meeting the language and other statutory conditions at that point.",
          "What it is not is a fast passport, and it is not passive. There is a real investment at risk, in a real fund, with real prospects of underperforming.",
        ],
      },
      {
        heading: "The diligence that actually matters now",
        body: [
          "The property route failed safely in one sense: you owned an identifiable apartment. A fund subscription does not work that way. Your capital is in an instrument whose value depends on management you have not met, in a market you cannot observe from India.",
          "So the questions changed. Who manages the fund and what is their track record outside this programme? What does it actually hold? What are the fees, and what happens if you want out before the holding period ends? What has it returned to investors who are not immigration clients?",
          "And separately: who is advising you, and are they paid by you or by the fund? An adviser earning a commission from the fund they are recommending has an interest that is not identical to yours. Ask directly. The answer tells you what the advice is worth.",
        ],
        callout:
          "You are now making an investment decision that happens to carry residency, not a residency decision that happens to involve money. Diligence it as an investment.",
      },
      {
        heading: "Where an Indian applicant's file usually goes wrong",
        body: [
          "Source of funds. Portuguese authorities and the fund's own compliance will both trace your capital, and Indian documentation — property sales, business distributions, inherited assets — often needs more assembly than applicants expect. Start this early; it is slower than the application.",
          "Remittance route. Moving the sum out of India must comply with the Liberalised Remittance Scheme and its limits, which frequently means structuring across family members or across financial years. Plan it with a professional before you sign anything with a deadline.",
          "And timing the citizenship expectation. Five years is a statutory eligibility point, not an automatic outcome, and the conditions attached to it have themselves been debated. Build the plan on the residency being worth having on its own terms.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I still get a Portugal Golden Visa by buying property?",
        a: "No. Residential real-estate acquisition was removed as a qualifying investment by Portugal's 2023 housing legislation, along with the pure capital-transfer option. Anyone still offering a property pathway is working from outdated material.",
      },
      {
        q: "How much do I need to invest in Portugal now?",
        a: "It depends entirely on which remaining route you use, and the thresholds have been revised more than once since the reform. Verify the current figure for your chosen route against the Portuguese authority's own published requirements rather than any brochure — including this page.",
      },
      {
        q: "How long do I need to stay in Portugal each year?",
        a: "The presence requirement is deliberately light — an average of roughly seven days a year across the residence period. That is the programme's core attraction for applicants who do not intend to relocate.",
      },
      {
        q: "Does the Portugal Golden Visa lead to an EU passport?",
        a: "It leads to eligibility to apply for citizenship after five years of legal residence, subject to language and other statutory conditions being met at that time. Eligibility is not the same as a grant, and the conditions have been subject to political debate, so the residency should be worth having on its own terms.",
      },
    ],
    report: "due_diligence_report",
    reportPitch:
      "The route that fits your capital, the fund questions to ask before you wire anything, and a remittance plan that works under Indian rules.",
    tools: [
      { label: "Compare investment routes", href: "/xia-intelligence" },
      { label: "What it all costs", href: "/cost-estimator" },
      { label: "Check any consultant's licence", href: "/verify-immigration-consultant" },
    ],
    related: ["caribbean-citizenship-cost-from-india", "canada-pr-cost-from-india", "eb2-niw-from-india"],
  },

  /* ----------------------------------------------------------------- 11 */
  {
    slug: "caribbean-citizenship-cost-from-india",
    h1: "What Caribbean citizenship actually costs from India",
    title: "Caribbean Citizenship by Investment Cost from India (2026) | Itemised",
    description:
      "The headline contribution is roughly half the real bill. Every line — due diligence, government, legal, passport, remittance — itemised for an Indian family, plus what the 2024 price floor changed.",
    eyebrow: "Caribbean · Citizenship by investment",
    standfirst:
      "Nobody quotes you the second half of the invoice until you have already committed to the first.",
    intents: [
      "caribbean citizenship by investment cost from india",
      "st kitts citizenship cost india",
      "dominica grenada citizenship price",
      "cbi programme fees india",
    ],
    updated: UPDATED,
    readingMinutes: 9,
    sections: [
      {
        heading: "Five programmes, one recent agreement",
        body: [
          "Five Eastern Caribbean states run citizenship-by-investment programmes: Antigua and Barbuda, Dominica, Grenada, St Kitts and Nevis, and St Lucia. Each offers a non-refundable contribution to a national fund, and most offer an approved real-estate route as an alternative.",
          "In 2024 the five agreed a set of common principles including a minimum price floor, under sustained pressure from the United States and the European Union over due-diligence standards. The effect was to end the undercutting that had driven prices down for years, and to raise the floor for everyone.",
          "So a figure you were quoted two years ago is not a figure available today, and the gap between programmes is narrower than it used to be. [VERIFY current minimum contribution per programme before relying on any number]",
        ],
        callout:
          "Price is no longer the differentiator it was. Processing discipline, visa-free access and diligence reputation are.",
      },
      {
        heading: "The lines nobody puts in the brochure",
        body: [
          "The contribution is the headline. Underneath it sit due-diligence fees charged per applicant above a certain age — non-refundable, and charged whether or not you are approved. Government processing fees, again per applicant. Passport issuance fees. Certificate of naturalisation fees.",
          "Then the professional layer: an authorised local agent, which most programmes require you to use and cannot be bypassed, plus your own advisers. Document costs in India — police clearances, apostille, notarisation, translations, sworn affidavits for anything non-standard in your documentation.",
          "And the part almost nobody costs in: getting the money out of India lawfully. That is a professional exercise in itself under the Liberalised Remittance Scheme, and for a family-sized contribution it usually means structuring across individuals or financial years.",
        ],
        table: {
          caption: "Every line to budget for, family of four",
          rows: [
            ["National fund contribution", "The headline figure [VERIFY current floor]"],
            ["Due diligence, per applicant over the age threshold", "Non-refundable, charged regardless of outcome [VERIFY]"],
            ["Government processing fees", "Per applicant [VERIFY]"],
            ["Passport and naturalisation certificate fees", "Per applicant [VERIFY]"],
            ["Authorised local agent", "Mandatory in most programmes"],
            ["Indian document costs", "Police clearance, apostille, notarisation, translation"],
            ["Remittance structuring under LRS", "Professional cost, routinely overlooked"],
            ["Real-estate route instead of contribution", "Higher headline, plus holding period and exit risk"],
          ],
        },
      },
      {
        heading: "Contribution or real estate",
        body: [
          "The contribution is a payment you never see again, and that is its virtue: the cost is knowable on day one and the file is simpler.",
          "The real-estate route has a higher headline, a mandatory holding period, and an exit that depends on finding a buyer in a small market where almost every buyer is another applicant doing the same thing. The resale discount is real and is rarely discussed at the point of sale.",
          "For most Indian families the contribution is the honest choice unless there is a specific reason to want the asset. Treat any adviser pushing real estate hard as someone who may be earning from the developer, and ask them directly whether they are.",
        ],
      },
      {
        heading: "What you are actually buying",
        body: [
          "Visa-free or visa-on-arrival access to a large number of countries, which for an Indian passport holder is a substantial practical change — though the specific list moves, and several of these programmes have faced reviews of their access to particular regions.",
          "A second nationality that can be passed to children, a base outside India for tax and succession planning that must be structured properly with Indian advice, and a document that continues to function if something disrupts your primary one.",
          "What you are not buying is the right to live and work in Europe, and any presentation that implies otherwise is misrepresenting the product. Check the current visa-free list yourself rather than accepting a brochure map, because those maps date quickly.",
        ],
        callout:
          "Verify the visa-free list against a current source on the day you decide. It is the thing most likely to have changed since the brochure was printed.",
      },
      {
        heading: "The diligence that gets people refused",
        body: [
          "These programmes decline applicants, and a refusal costs you the due-diligence fees with nothing to show. The common causes are not exotic: an undisclosed prior visa refusal, a source of funds that cannot be traced to a lawful origin with documents, a business interest not declared, or an inconsistency between what was declared and what the diligence firm found.",
          "Disclose everything, early, to your own adviser. A refusal you mentioned upfront is a fact to be explained. The same refusal discovered by a diligence firm is a credibility problem, and credibility problems are what actually end these applications.",
          "Also check that the programme itself is in good standing at the moment you apply. These have been under international scrutiny and terms have shifted; that is a live variable, not a historical one.",
        ],
      },
    ],
    faq: [
      {
        q: "What is the cheapest Caribbean citizenship programme?",
        a: "Less varied than it used to be. The five programmes agreed a common minimum price floor in 2024 under international pressure, which ended the price competition between them. Verify current figures directly, and weigh processing reliability and diligence reputation at least as heavily as price.",
      },
      {
        q: "How much does it really cost beyond the contribution?",
        a: "Expect due-diligence fees per applicant, government processing fees, passport and naturalisation fees, a mandatory authorised agent, Indian document and apostille costs, and the professional cost of remitting the funds lawfully under the Liberalised Remittance Scheme. The total is materially above the headline.",
      },
      {
        q: "Can I get a Caribbean passport without visiting?",
        a: "Most of these programmes have historically not required residence, and some have had no visit requirement at all — but interview and presence requirements have been among the things tightened under international pressure. Confirm the current requirement for your chosen programme rather than assuming.",
      },
      {
        q: "Does Caribbean citizenship let me live in the EU?",
        a: "No. It has provided visa-free or visa-on-arrival travel to many countries, which is short-term travel, not residence or work rights. Anyone presenting it as a route to living in Europe is misrepresenting it.",
      },
    ],
    report: "due_diligence_report",
    reportPitch:
      "Every line itemised for your family size, the programmes your profile clears comfortably, and the disclosure issues to raise before a diligence firm finds them.",
    tools: [
      { label: "Compare citizenship routes", href: "/xia-intelligence" },
      { label: "What it all costs", href: "/cost-estimator" },
      { label: "Check any consultant's licence", href: "/verify-immigration-consultant" },
    ],
    related: ["portugal-golden-visa-from-india", "canada-pr-cost-from-india", "eb2-niw-from-india"],
  },

  /* ----------------------------------------------------------------- 12 */
  {
    slug: "eb2-niw-from-india",
    h1: "EB-2 NIW from India: what evidence actually clears",
    title: "EB-2 NIW from India (2026) | What Evidence Actually Clears",
    description:
      "The National Interest Waiver lets you self-petition without an employer or labour certification. The three-prong test, the evidence that works, and the retrogression nobody wants to discuss.",
    eyebrow: "United States · Employment-based",
    standfirst:
      "Approval and a green card are separated, for Indian nationals, by a queue measured in years.",
    intents: [
      "eb2 niw from india",
      "national interest waiver india evidence",
      "eb2 niw priority date india",
      "self petition green card india",
    ],
    updated: UPDATED,
    readingMinutes: 10,
    sections: [
      {
        heading: "What the NIW actually waives",
        body: [
          "EB-2 normally requires a job offer from a US employer and a labour certification proving no qualified American worker is available. The National Interest Waiver waives both. You petition for yourself, with no employer, no sponsorship and no labour certification.",
          "That is the whole attraction, and it is genuine. It means you are not tied to one employer, not exposed to that employer changing its mind, and not waiting on a labour-market test.",
          "It does not waive the EB-2 underlying requirement — an advanced degree or exceptional ability — and it does not waive the queue.",
        ],
        callout:
          "The NIW removes the employer from the equation. It does not remove the wait, and for Indian nationals the wait is the binding constraint.",
      },
      {
        heading: "The three-prong test, in the terms adjudicators use",
        body: [
          "Since Matter of Dhanasar, a petition must satisfy three prongs. First, that the proposed endeavour has both substantial merit and national importance. Second, that you are well positioned to advance it. Third, that on balance it would benefit the United States to waive the job-offer and labour-certification requirements.",
          "The first prong is about the endeavour, not about you. Describe what you will do in the United States — specifically, not as a field. “Advance machine learning” is a field. “Build fraud-detection systems for mid-size US banks, which currently rely on vendors that miss a particular class of attack” is an endeavour.",
          "The second prong is about you, and it is where evidence lives: your record, your qualifications, your plan, and the interest of others in what you are doing. The third is an argument, not a fact, and it is the one most petitions under-write — you have to say why waiting for an employer and a labour test would be against US interests in your specific case.",
        ],
      },
      {
        heading: "Evidence that works, and evidence that does not",
        body: [
          "What works: citations with context rather than a raw count, independent adoption of your work by parties with no connection to you, letters from people who do not know you personally but can speak to your impact, patents that are actually licensed or used, revenue or users attributable to something you built, and a plan concrete enough that an officer can picture it happening.",
          "What does not: a long publication list with low citation and no demonstrated use, recommendation letters from every former manager saying you were excellent, membership of associations that admit anyone who pays, media coverage in outlets that publish anything submitted, and a personal statement describing your field's importance rather than your endeavour's.",
          "The single most common failure among strong Indian applicants is a genuinely accomplished person submitting evidence of being accomplished, without connecting it to a specific US endeavour. Prong two is not “am I good”. It is “am I well positioned to advance this particular thing”.",
        ],
        table: {
          caption: "Where petitions are usually strong and usually weak",
          rows: [
            ["Advanced degree or exceptional ability", "Usually straightforward for this cohort"],
            ["Endeavour described specifically", "Frequently too broad — the commonest weakness"],
            ["Independent citation and adoption", "Strong when contextualised, weak as raw counts"],
            ["Independent expert letters", "Strong — and routinely all from known contacts instead"],
            ["Commercial or practical impact", "Strong, and under-used by academic applicants"],
            ["Prong three argument", "Usually the thinnest section of the petition"],
            ["Priority date wait for India", "Severe — the actual constraint [VERIFY current Visa Bulletin]"],
          ],
        },
      },
      {
        heading: "The retrogression conversation you should have first",
        body: [
          "For Indian nationals the EB-2 category is heavily retrogressed because of the per-country limits, and an approved petition does not give you a green card — it gives you a priority date and a place in line.",
          "This is the part agents skip, and it is the part that should come first. A petition approved this year may not be current for years. If your plan depends on being in the United States soon, the NIW alone does not deliver that; it usually needs to be paired with a non-immigrant status that lets you live and work while you wait.",
          "So the honest sequence is: check where the Visa Bulletin currently stands for EB-2 India, decide whether that timeline is acceptable, and only then decide whether to invest in the petition. Anyone who discusses the evidence before discussing the queue is selling you the part they are paid for. [VERIFY current EB-2 India final action date]",
        ],
        callout:
          "File early to hold the date, but plan your actual life around a non-immigrant status. The priority date is an option, not a plan.",
      },
      {
        heading: "Is it worth it anyway",
        body: [
          "For many people, yes — because the date is an asset. It starts running from filing, it can be retained across petitions, and a queue you joined three years ago is worth considerably more than one you join today.",
          "It is also a self-petition, which means no employer can withdraw it. For someone on employer-sponsored status, that independence has a value quite separate from the timeline.",
          "What it is not is a fast route, and any presentation that frames it as one is misrepresenting a real product. It is a good instrument, used early, alongside a plan that does not depend on it arriving soon.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I file an EB-2 NIW without a job offer?",
        a: "Yes — that is precisely what the waiver does. You self-petition, with no employer, no sponsorship and no labour certification. You must still meet the underlying EB-2 requirement of an advanced degree or exceptional ability.",
      },
      {
        q: "How long is the EB-2 NIW wait for Indians?",
        a: "The petition itself is adjudicated on its own timeline, but for Indian nationals the binding constraint is the priority-date queue, which is heavily retrogressed because of per-country limits. Check the current Visa Bulletin before deciding, because that number — not the petition — determines when you could actually immigrate.",
      },
      {
        q: "How many publications do I need for an NIW?",
        a: "There is no number, and treating it as a number is the commonest mistake. Adjudicators weigh independent impact — whether people unconnected to you have used, cited or built on your work — and how well positioned you are to advance a specific US endeavour. A short record with demonstrated adoption outperforms a long one without it.",
      },
      {
        q: "Is the NIW better than EB-1A?",
        a: "They are different standards, not a ladder. EB-1A has a higher evidentiary bar but a different, generally shorter queue for Indian nationals. A strong candidate should have both assessed against their actual record before choosing, and some file for both.",
      },
    ],
    report: "us_visa_report",
    reportPitch:
      "Your record scored against all three prongs, the specific evidence gaps to close before filing, and an honest view of the queue you would be joining.",
    tools: [
      { label: "Check every US route", href: "/us-visa-intelligence" },
      { label: "Compare against Canada and Australia", href: "/xia-intelligence" },
      { label: "What it all costs", href: "/cost-estimator" },
    ],
    related: ["canada-pr-for-software-engineers-from-india", "portugal-golden-visa-from-india", "caribbean-citizenship-cost-from-india"],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug) ?? null;
}
