// src/data/local-seo.ts
// -----------------------------------------------------------------------------
// Name / address / phone (NAP) and the local landing-page definitions.
//
// NAP RULE: these strings must match the Google Business Profile listing
// character for character. If the listing says "80 Feet Rd" the site must not
// say "80 Feet Road" — mismatched NAP is the single most common reason a local
// pack ignores an otherwise strong site. Change it here, once, and every page
// and every schema block follows.
// -----------------------------------------------------------------------------

export type NapOffice = {
  id: string;
  /** Legal / display name used in schema. */
  name: string;
  streetAddress?: string;
  locality: string;
  region?: string;
  postalCode?: string;
  country: string;
  countryCode: string;
  phones?: string[];
  email?: string;
  mapsQuery?: string;
  /** Only offices with a verified full street address emit LocalBusiness schema. */
  emitLocalBusiness: boolean;
  headquarters?: boolean;
};

export const napOffices: NapOffice[] = [
  {
    id: "bengaluru",
    name: "XIPHIAS Immigration — Bengaluru",
    streetAddress: "JK Nirmala Arcade, Plot no. 780, 80 Feet Rd, 4th Block, Koramangala",
    locality: "Bengaluru",
    region: "Karnataka",
    postalCode: "560034",
    country: "India",
    countryCode: "IN",
    phones: ["+918049768088", "+919021335577", "+919667520211"],
    email: "immigration@xiphias.in",
    mapsQuery: "XIPHIAS+Immigration+Koramangala+Bengaluru+560034",
    emitLocalBusiness: true,
    headquarters: true,
  },
  // City-level only until a verified street address is supplied for each. These
  // render as text, never as LocalBusiness schema — an address we cannot verify
  // does not belong in structured data.
  { id: "gurugram", name: "XIPHIAS Immigration — Gurugram", locality: "Gurugram", region: "Haryana", country: "India", countryCode: "IN", emitLocalBusiness: false },
  { id: "dubai", name: "XIPHIAS Immigration DMCC — Dubai", locality: "Dubai", region: "JLT", country: "United Arab Emirates", countryCode: "AE", emitLocalBusiness: false },
  { id: "doha", name: "XIPHIAS Immigration — Doha", locality: "Doha", country: "Qatar", countryCode: "QA", emitLocalBusiness: false },
  { id: "melbourne", name: "XIPHIAS Immigration — Melbourne", locality: "Melbourne", region: "Victoria", country: "Australia", countryCode: "AU", emitLocalBusiness: false },
  { id: "waterloo", name: "XIPHIAS Immigration — Waterloo", locality: "Waterloo", region: "Ontario", country: "Canada", countryCode: "CA", emitLocalBusiness: false },
];

export const headOffice = napOffices[0];

export const openingHours = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "10:00",
  closes: "18:30",
} as const;

/* -------------------------------------------------------------------------- */
/*  Landing-page definitions                                                    */
/* -------------------------------------------------------------------------- */

export type LocalSection = { heading: string; body: string[] };

export type LocalLanding = {
  slug: string;
  /** Page <h1>. Carries the target phrase without reading like a keyword string. */
  h1: string;
  title: string;
  description: string;
  eyebrow: string;
  /** The single sentence under the h1. */
  standfirst: string;
  /** Terms this page is built to answer. Used for internal-link anchors, not stuffing. */
  intents: string[];
  sections: LocalSection[];
  faq: Array<{ q: string; a: string }>;
  /** Slugs of sibling landings to cross-link. */
  related: string[];
};

const VERIFY_NOTE =
  "Every licence claim on this page links to the regulator's own public register, so you can check it yourself rather than take our word for it.";

export const localLandings: LocalLanding[] = [
  {
    slug: "immigration-consultants-in-bangalore",
    h1: "Immigration consultants in Bangalore",
    title: "Immigration Consultants in Bangalore | Licence R516194",
    description:
      "How to choose between immigration consultants in Bangalore \u2014 what to ask, and which licence numbers to check. Ours are CICC R516194 and MARA 1680615.",
    eyebrow: "Koramangala, Bengaluru",
    standfirst:
      "Seventeen years of files, six offices, and a licence number you can look up before you pay anyone a rupee.",
    intents: [
      "immigration consultants in bangalore",
      "best immigration consultants in bangalore",
      "top immigration consultants in bangalore",
      "how to choose an immigration consultant in bangalore",
      "immigration consultancy koramangala",
      "immigration office near me bangalore",
    ],
    sections: [
      {
        heading: "What an immigration consultant in Bangalore should be able to show you",
        body: [
          "Bangalore has more immigration offices than almost any Indian city, and almost none of them are regulated by the country you are actually applying to. That matters, because for Canada and Australia the destination government licenses the people permitted to represent you — and publishes the list.",
          "Before engaging anyone in this city, ask for three things: the licence number of the person who will handle your Canadian or Australian file, the register where that number can be checked, and a written fee schedule that separates government fees from professional fees. A firm that cannot produce all three in one email is not a firm you should send documents to.",
          VERIFY_NOTE,
        ],
      },
      {
        heading: "How to choose between the best immigration consultants in Bangalore",
        body: [
          "Nobody can honestly tell you which firm in this city is best for you, because it depends entirely on where you are going. A consultancy that is excellent at Canadian Express Entry may have handled four Portugal files in its history. Ask which of your two or three shortlisted destinations each firm actually runs volume on, and ask how many of those files they closed last year.",
          "Then apply four tests, in this order. One: is the person who will handle your file licensed by the destination country, and can you find their number on the regulator's own register? Two: does the written fee schedule separate government fees from professional fees, with a refund clause you can read? Three: will you be told, in writing, what does not work about your profile \u2014 or only what does? Four: is the person selling to you the person who will handle the file?",
          "Any firm that guarantees an outcome fails the test immediately, whatever else it gets right. The decision belongs to the destination country's immigration authority, and promising otherwise breaches the Canadian regulator's own conduct rules.",
        ],
      },
      {
        heading: "What we actually do from the Bangalore office",
        body: [
          "Residency and citizenship by investment — Portugal, Greece, the Caribbean programmes, UAE. Skilled migration — Canada Express Entry and the provincial streams, Australia's points-tested subclasses, the UK and New Zealand routes. Corporate mobility — intra-company transfers, business set-up and employer-sponsored placements.",
          "Assessment comes before advice. Age, education, language results, funds, family and any previous refusal are scored against the published criteria of the destination country before a single programme is recommended. Where nothing currently fits, we say so and explain what would have to change.",
        ],
      },
      {
        heading: "Visiting the Koramangala office",
        body: [
          "The office is on 80 Feet Road in 4th Block, Koramangala — walking distance from Forum Mall, and a short drive from Indiranagar, HSR Layout and the Outer Ring Road tech corridor. Appointments are preferred so a senior advisor is free when you arrive.",
          "If you are outside Bangalore, every consultation is available online and the written summary is identical.",
        ],
      },
    ],
    faq: [
      {
        q: "How do I check whether a Bangalore immigration consultant is genuine?",
        a: "For Canada, search the consultant's licence number on the College of Immigration and Citizenship Consultants public register and confirm the 'Entitled to Practise' column says Yes. For Australia, search the MARN on the OMARA register. If a firm cannot give you a number to search, it is not licensed by either regulator.",
      },
      {
        q: "Who are the best immigration consultants in Bangalore?",
        a: "There is no single answer, and any firm that tells you it is the best is asking you to take its word for something it cannot evidence. Judge on four checkable things instead: whether the person handling your file is licensed by the destination country and findable on that regulator's register, whether the fee schedule separates government from professional fees in writing, whether you are told what is weak about your profile as well as what is strong, and whether the person who sold to you is the person who will do the work.",
      },
      {
        q: "How do the top immigration consultants in Bangalore charge?",
        a: "Reputable firms quote professional fees separately from government fees, in writing, before work begins \u2014 because the two are paid to different people and only one of them is refundable. Be cautious of a single bundled figure, of large payments demanded before an eligibility assessment, and of any fee described as covering an outcome rather than a service.",
      },
      {
        q: "Do I have to pay before I know whether I am eligible?",
        a: "No. Eligibility against the published criteria can be established in a single consultation. Any engagement that follows is quoted separately, in writing, before work begins.",
      },
      {
        q: "Which countries do you handle from Bangalore?",
        a: "Canada, Australia, the United Kingdom, New Zealand, the United States, the UAE and the European residency and citizenship programmes, with offices in Dubai, Doha, Melbourne and Waterloo supporting files on the ground.",
      },
      {
        q: "How long does a typical case take?",
        a: "It depends entirely on the route — some Caribbean citizenship programmes run in months, Canadian permanent residence in quarters, and employer-sponsored routes on the employer's timetable. An advisor will give you the current published processing range for your specific route rather than an average.",
      },
    ],
    related: ["verified-immigration-consultants-bangalore", "rcic-registered-immigration-consultant-india", "australia-immigration-consultants-in-bangalore", "immigration-consultants-in-koramangala"],
  },
  {
    slug: "verified-immigration-consultants-bangalore",
    h1: "Verified immigration consultants in Bangalore",
    title: "Verified Immigration Consultants in Bangalore | Check Before You Pay",
    description:
      "How to verify an immigration consultant in Bangalore in under five minutes, and the public registers where XIPHIAS Immigration's own Canadian and Australian licences can be checked.",
    eyebrow: "Verification guide",
    standfirst:
      "Anyone can print a certificate. Only a regulator can publish a register. Here is how to use one.",
    intents: [
      "verified immigration consultants bangalore",
      "certified immigration consultant bangalore",
      "genuine immigration consultants in bangalore",
      "how to check immigration consultant is registered",
    ],
    sections: [
      {
        heading: "The five-minute check",
        body: [
          "Ask the firm for the licence number of the individual who will handle your file, then search it on the destination regulator's own website. Not a screenshot, not a PDF certificate, not a logo on a homepage — the regulator's live register.",
          "For Canada that is the College of Immigration and Citizenship Consultants. Search by College ID and read two columns: Status and Entitled to Practise. Only Active or Active – Practice Restricted, together with an Entitled to Practise value of Yes, means the person may legally advise you for a fee.",
          "For Australia it is the Office of the Migration Agents Registration Authority. Search the MARN and check the agent appears with a current registration and the business name you were given.",
        ],
      },
      {
        heading: "What the register will not tell you",
        body: [
          "A register confirms a person is licensed. It does not confirm the advice you were given is sound, that the fee is reasonable, or that the firm will still be answering the phone in eighteen months. Ask additionally for a written service agreement, a fee schedule that separates government charges from professional fees, and the name of the person who will actually be handling the file rather than the person who sold it to you.",
          "Be wary of anyone who guarantees an outcome. No consultant, anywhere, can guarantee a visa — the decision belongs to the destination country's immigration authority, and promising otherwise is itself a breach of the Canadian regulator's conduct rules.",
        ],
      },
      {
        heading: "Our own numbers, and where to check them",
        body: [
          "XIPHIAS Immigration's Canadian practice is delivered under RCIC licence R516194, listed on the CICC public register against XIPHIAS Immigration Pvt Ltd. Australian matters run under MARA registration 1680615. The Managing Director, Varun Singh, is a Fellow of the Investment Migration Council.",
          "Each of those is a link on this page to the issuing body's own database, not to a page we control. XIPHIAS provides immigration consulting and documentation support; it is not a law firm, and nothing here is legal advice.",
        ],
      },
    ],
    faq: [
      {
        q: "Is ICCRC the same as CICC?",
        a: "It is the same regulator under a new name. ICCRC was continued as the College of Immigration and Citizenship Consultants on 23 November 2021. A firm whose website still says 'ICCRC registered' has not updated its compliance copy in several years, which tells you something in itself.",
      },
      {
        q: "Can a company hold an RCIC licence?",
        a: "No. The College licenses individuals, not companies. A firm can employ or work with a licensed RCIC, and the register shows the company each licensee is associated with — which is exactly how you confirm the connection is real.",
      },
      {
        q: "What if the consultant says they work with a registered agent abroad?",
        a: "The regulator's own guidance is to contact that agent directly using the contact details shown on the public register, and to make sure your service agreement is signed with the licensed person.",
      },
      {
        q: "Does a licence mean my visa is more likely to be approved?",
        a: "It means your representative is accountable to a regulator and may legally act for you. It does not change the published criteria your application is judged against. Anyone suggesting otherwise is selling something.",
      },
    ],
    related: ["immigration-consultants-in-bangalore", "rcic-registered-immigration-consultant-india"],
  },
  {
    slug: "rcic-registered-immigration-consultant-india",
    h1: "RCIC-registered Canadian immigration consulting, from Bangalore",
    title: "ICCRC / CICC Registered Immigration Consultant in Bangalore | Licence R516194",
    description:
      "Canadian immigration files handled from India under RCIC licence R516194, listed on the College of Immigration and Citizenship Consultants public register against XIPHIAS Immigration Pvt Ltd.",
    eyebrow: "Canada practice",
    standfirst:
      "A Regulated Canadian Immigration Consultant is licensed by the Canadian government's regulator — wherever in the world they sit.",
    intents: [
      "rcic registered immigration consultant india",
      "iccrc registered consultant bangalore",
      "iccrc certified immigration consultant in bangalore",
      "cicc registered consultant india",
      "canada immigration consultant licence number",
      "licensed canada immigration consultant bangalore",
    ],
    sections: [
      {
        heading: "What RCIC actually means",
        body: [
          "A Regulated Canadian Immigration Consultant is licensed by the College of Immigration and Citizenship Consultants, the body created by the College of Immigration and Citizenship Consultants Act. Alongside Canadian lawyers and Quebec notaries, RCICs are the only people who may legally give Canadian immigration advice or representation for a fee.",
          "The licence follows the person, not the postcode. The College's rules apply to licensees residing outside Canada in exactly the same way — which is what makes it meaningful for an applicant sitting in Bangalore.",
          "Licence classes matter too. Class L1 and L2 are RCICs; Class L3 is an RCIC-IRB, authorised additionally before the Immigration and Refugee Board; Classes L4 and L5 are student advisors (RISIA), not full consultants.",
        ],
      },
      {
        heading: "ICCRC or CICC \u2014 which is it?",
        body: [
          "Both, at different times. The Immigration Consultants of Canada Regulatory Council (ICCRC) became the College of Immigration and Citizenship Consultants (CICC) on 23 November 2021, when the College of Immigration and Citizenship Consultants Act came into force. Licence numbers carried across unchanged.",
          "So a consultant describing themselves as \u201cICCRC certified\u201d is not necessarily behind the times \u2014 but the number they hold must be live on the CICC register today. That is the only part worth checking, and it takes about ten seconds.",
          "If you are comparing firms in Bangalore, this is the question that separates them: ask for the licence number, then look it up. Most cannot give you one at all.",
        ],
      },
      {
        heading: "Our licence",
        body: [
          "XIPHIAS Immigration's Canadian work is delivered under licence R516194 — a Class L2 RCIC, shown on the public register as entitled to practise and listed against XIPHIAS Immigration Pvt Ltd in India and XIPHIAS Immigration DMCC. The register entry was last confirmed on 13 September 2026.",
          "Your service agreement for a Canadian matter is signed with the licensed consultant. The Bangalore office handles assessment, documentation and case management around that relationship.",
        ],
      },
      {
        heading: "Canadian routes we work on",
        body: [
          "Express Entry — Federal Skilled Worker, Canadian Experience Class and the Federal Skilled Trades programme, including CRS scoring and the category-based draws. Provincial Nominee Programmes across Ontario, British Columbia, Alberta, Saskatchewan and the Atlantic provinces. Business routes — the Start-up Visa and provincial entrepreneur streams. Family sponsorship, study permits and post-graduation work permits.",
          "Assessment begins with your actual CRS score against the current draw cut-offs, not an optimistic estimate. Where the score is short, the advisor identifies which of the levers — language retake, education assessment, provincial nomination, spouse factors — moves it furthest for your profile.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I verify licence R516194 myself?",
        a: "Yes, and you should. Search 516194 in the 'College ID Contains' field on the CICC public register. The record shows the licensee, the associated companies, the licence class and whether they are entitled to practise.",
      },
      {
        q: "Is an RCIC the same as an immigration lawyer?",
        a: "No. Both may represent you for a fee in Canada, but they are regulated by different bodies and trained differently. XIPHIAS provides immigration consulting and documentation support and is not a law firm.",
      },
      {
        q: "Do I need an RCIC to apply to Canada?",
        a: "No — you may apply yourself, free of charge. You need an RCIC, a Canadian lawyer or a Quebec notary only if you want someone to advise or represent you for a fee. Anyone else charging for that is acting unlawfully.",
      },
      {
        q: "Does using an RCIC speed up processing?",
        a: "It does not. Processing times are set by IRCC and are identical whether you apply alone or through a representative. What representation changes is the quality and completeness of what you file.",
      },
    ],
    related: ["verified-immigration-consultants-bangalore", "immigration-consultants-in-bangalore"],
  },
  {
    slug: "australia-immigration-consultants-in-bangalore",
    h1: "Australia immigration consultants in Bangalore",
    title: "Australia Immigration Consultants in Bangalore | MARA 1680615",
    description:
      "Australian skilled migration, employer-sponsored and business visas handled from Bangalore under MARA registration 1680615, with points assessed against the current SkillSelect criteria.",
    eyebrow: "Australia practice",
    standfirst:
      "Australia's system is arithmetic before it is anything else. Get the points assessed honestly and the rest follows.",
    intents: [
      "australia immigration consultants in bangalore",
      "australia pr consultants bangalore",
      "mara agent bangalore",
      "australia skilled migration consultant india",
    ],
    sections: [
      {
        heading: "Start with the points, not the brochure",
        body: [
          "Subclasses 189, 190 and 491 are points-tested. Age, English, skilled employment, qualifications, partner skills and study in a regional area each carry a published value, and an invitation depends on where your total sits against the current round. Any advisor who quotes you a programme before calculating that total is guessing.",
          "The occupation list is the second gate. Your occupation must appear on the relevant list, and your skills must be assessed by the assessing authority named for that occupation — a step that takes months and is frequently underestimated.",
        ],
      },
      {
        heading: "Routes we handle",
        body: [
          "Skilled Independent (subclass 189) and State Nominated (190), Skilled Work Regional (491) with state and territory nomination, the Skills in Demand visa (subclass 482) for employer-sponsored roles, employer nomination for permanent residence, and the business innovation and investment streams.",
          "Australian matters are handled under MARA registration 1680615 — the Office of the Migration Agents Registration Authority publishes the register, and you can search the number there before engaging anyone.",
        ],
      },
      {
        heading: "Why Bangalore applicants stall",
        body: [
          "Three recurring problems: a skills assessment that does not match the nominated occupation, employment evidence that cannot demonstrate the required period at the required skill level, and an English result that costs ten points because the test was taken before preparation. All three are fixable before lodgement and expensive afterwards.",
          "The consultation covers your actual points total, the gap to the recent invitation rounds for your occupation, and which lever closes it fastest.",
        ],
      },
    ],
    faq: [
      {
        q: "How many points do I need for Australian PR?",
        a: "Sixty-five is the minimum to submit an expression of interest, but the score that actually receives an invitation depends on your occupation and the round — for competitive occupations it has run far higher. An advisor should show you the recent invitation cut-offs for your occupation rather than quote the floor.",
      },
      {
        q: "Is a MARA agent required to apply?",
        a: "No. You may lodge yourself. A registered migration agent is required only if someone is giving you Australian immigration assistance for a fee.",
      },
      {
        q: "How long does a skills assessment take?",
        a: "It varies by assessing authority and occupation, from several weeks to several months. It is usually the longest single step before lodgement, which is why it is started first.",
      },
      {
        q: "Can my partner's qualifications add points?",
        a: "Yes, where the partner meets the age, English and skills-assessment conditions. It is one of the most commonly missed sources of points on an otherwise borderline application.",
      },
    ],
    related: ["immigration-consultants-in-bangalore", "verified-immigration-consultants-bangalore"],
  },
  {
    // The office is genuinely on 80 Feet Road, so this page is not a doorway —
    // it is the nearest-office page for a city where people search by area.
    slug: "immigration-consultants-in-koramangala",
    h1: "Immigration consultants in Koramangala",
    title: "Immigration Consultants in Koramangala, Bangalore | R516194",
    description:
      "XIPHIAS Immigration is on 80 Feet Road, 4th Block Koramangala \u2014 Canada, Australia, UK and investment residency, under licences you can check before you visit.",
    eyebrow: "80 Feet Road, 4th Block",
    standfirst:
      "The office is a five-minute walk from Forum Mall. The licence number is CICC R516194, and you can check it before you come.",
    intents: [
      "immigration consultants in koramangala",
      "canada pr consultants koramangala",
      "immigration office koramangala bangalore",
      "visa consultants near forum mall koramangala",
    ],
    sections: [
      {
        heading: "Where we are, and what to expect when you arrive",
        body: [
          "XIPHIAS Immigration is at JK Nirmala Arcade, Plot no. 780, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034 \u2014 first floor, a few minutes on foot from Forum Mall and a short ride from Indiranagar, HSR Layout, BTM Layout and the Outer Ring Road tech corridor.",
          "Come with whatever you already have: degree certificates, any IELTS or PTE result, current CV, and passports for everyone who would move with you. None of it is required for a first conversation, but with it an advisor can score you against the published criteria in the meeting rather than after it.",
          "Appointments are preferred, because it means a senior advisor is free when you arrive rather than between calls. Weekdays 10:00 to 18:30.",
        ],
      },
      {
        heading: "Why the area matters more than you would think",
        body: [
          "A large share of the people we see in this office are engineers and product staff from the Koramangala and HSR startup belt, on H-1B waitlists or looking at Canadian permanent residence as the more predictable route. That concentration shapes what this office is good at: points-tested skilled migration where the profile is strong on education and experience but needs the score modelled properly before anything is filed.",
          "It also means we see the same avoidable mistakes repeatedly \u2014 an IELTS band left unimproved that was worth twenty-five CRS points, a spouse's qualifications never assessed, an ECA started too late. Those are all cheaper to fix before lodgement than after a refusal.",
        ],
      },
      {
        heading: "Before you walk into any office on this road",
        body: [
          "Koramangala has a lot of immigration signage and very little of it is regulated by the country you are applying to. Ask any firm here for the licence number of the individual who will handle your Canadian or Australian file, and search it on the regulator's own register while you are still sitting there.",
          "Ours are CICC R516194 for Canada and MARA 1680615 for Australia. Both are searchable on the College of Immigration and Citizenship Consultants and OMARA registers respectively, which are government databases, not pages we control.",
        ],
      },
    ],
    faq: [
      {
        q: "Where exactly is the Koramangala office?",
        a: "JK Nirmala Arcade, Plot no. 780, 80 Feet Road, 4th Block, Koramangala, Bengaluru 560034, on the first floor. It is walking distance from Forum Mall.",
      },
      {
        q: "Do I need an appointment?",
        a: "Not strictly, but it is worth booking. Without one you may wait, or see a junior advisor rather than the person who would handle your file.",
      },
      {
        q: "Is the first consultation chargeable?",
        a: "An eligibility assessment against the published criteria is not. Any engagement that follows is quoted separately, in writing, before work begins.",
      },
      {
        q: "Can I do everything online instead?",
        a: "Yes. Every consultation is available online and the written summary is identical \u2014 the office matters if you would rather hand over documents in person, which some people prefer for passports and originals.",
      },
    ],
    related: ["immigration-consultants-in-bangalore", "verified-immigration-consultants-bangalore", "rcic-registered-immigration-consultant-india"],
  },
];

export function getLocalLanding(slug: string) {
  return localLandings.find((landing) => landing.slug === slug);
}
