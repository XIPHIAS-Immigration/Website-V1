import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Country data: maps slug → { name, code, description, programs[] }
const COUNTRY_DATA: Record<string, {
  name: string;
  code: string;
  description: string;
  programs: { category: string; title: string; href: string; description: string }[];
}> = {
  'antigua-barbuda': {
    name: 'Antigua & Barbuda',
    code: 'AG',
    description: 'Antigua & Barbuda offers citizenship by investment from a USD 230,000 National Development Fund contribution, approved real estate from USD 300,000 or business investment from USD 1.5 million. The passport is visa-free to the UK with an ETA; US entry is partially suspended under Proclamation 10998.',
    programs: [
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/antigua-barbuda/business-investment', description: 'Approved business investment from USD 1.5 million as a sole investor.' },
      { category: 'CBI', title: 'National Development Fund', href: '/citizenship/antigua-barbuda/national-development-fund', description: 'Non-refundable NDF contribution of USD 230,000, the same for any family size.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/antigua-barbuda/real-estate', description: 'Purchase approved real estate from USD 300,000, held for five years.' },
    ],
  },
  'australia': {
    name: 'Australia',
    code: 'AU',
    description: 'Australia offers world-class skilled migration programs with permanent residency pathways for qualified professionals and sponsored workers.',
    programs: [
      { category: 'Skilled', title: 'Employer Nomination Scheme (186)', href: '/skilled/australia/employer-nomination-scheme-186', description: 'Employer-sponsored permanent residency.' },
      { category: 'Skilled', title: 'National Innovation Visa (858)', href: '/skilled/australia/national-innovation-visa-858', description: 'For an internationally recognised record of exceptional achievement. Renamed from Global Talent in Dec 2024.' },
      { category: 'Skilled', title: 'Skilled Independent (189)', href: '/skilled/australia/skilled-independent-189', description: 'Points-tested independent migration, no sponsorship needed.' },
      { category: 'Skilled', title: 'Skilled Nominated (190)', href: '/skilled/australia/skilled-nominated-190', description: 'State-nominated skilled migration visa.' },
      { category: 'Skilled', title: 'Skilled Work Regional (491)', href: '/skilled/australia/skilled-work-regional-491', description: 'Points-tested visa for regional Australia.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=australia', description: 'Employer nomination, points-tested skilled and regional options.' },
    ],
  },
  'bulgaria': {
    name: 'Bulgaria',
    code: 'BG',
    description: 'Bulgaria offers residence through AIF, government bond and real estate investment. Citizenship by investment was abolished in April 2022; Bulgaria joined Schengen in full on 1 January 2025.',
    programs: [
      { category: 'RBI', title: 'AIF Residency', href: '/residency/bulgaria/bulgaria-aif-residency', description: 'Invest in an Alternative Investment Fund for EU residency.' },
      { category: 'RBI', title: 'Government Bonds Residency', href: '/residency/bulgaria/bulgaria-government-bonds-residency', description: 'Government bonds route for Bulgarian residency.' },
      { category: 'RBI', title: 'Real Estate Residency', href: '/residency/bulgaria/bulgaria-real-estate-residency', description: 'Property investment qualifying for EU residency.' },
    ],
  },
  'canada': {
    name: 'Canada',
    code: 'CA',
    description: 'Canada is one of the world\'s top immigration destinations, offering Express Entry, provincial nominee and provincial entrepreneur streams, and corporate transfer routes.',
    programs: [
      { category: 'RBI', title: 'BC Entrepreneur – Regional', href: '/residency/canada/british-columbia-regional-pilot', description: 'Start a business in a smaller BC community from CAD $100,000.' },
      { category: 'RBI', title: 'BC Entrepreneur', href: '/residency/canada/british-columbia-entrepreneur-base', description: 'British Columbia entrepreneur immigration stream.' },
      { category: 'RBI', title: 'PEI Work Permit Stream', href: '/residency/canada/pei-work-permit', description: 'Prince Edward Island entrepreneur route from CAD $150,000.' },
      { category: 'Skilled', title: 'Express Entry', href: '/skilled/canada/express-entry', description: 'Points-based system covering FSW, FST and CEC.' },
      { category: 'Skilled', title: 'Provincial Nominee Program', href: '/skilled/canada/provincial-nominee-program', description: 'Province-specific streams for skilled workers.' },
      { category: 'Skilled', title: 'Global Talent Stream', href: '/skilled/canada/global-talent-stream', description: 'Fast-track work permit for unique talent and tech workers.' },
      { category: 'Corporate', title: 'Intra-Company Transfer', href: '/corporate/canada/intra-company-transfer', description: 'Transfer senior employees to a Canadian branch or subsidiary.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=canada', description: 'LMIA, ICT, GTS and employer-specific work permits.' },
    ],
  },
  'curacao': {
    name: 'Curacao',
    code: 'CW',
    description: 'Curaçao\'s Wealthy Investor permit runs in three tiers — three years, five years and indefinite — and naturalisation leads to Netherlands nationality.',
    programs: [
      { category: 'RBI', title: '3-Year Active Investor', href: '/residency/curacao/3-year-active-investor', description: 'Three-year renewable investor residence permit.' },
      { category: 'RBI', title: 'Indefinite Investor Residency', href: '/residency/curacao/indefinite-investor-residency', description: 'Indefinite residence through the top tier of the Wealthy Investor permit.' },
    ],
  },
  'cyprus': {
    name: 'Cyprus',
    code: 'CY',
    description: 'Cyprus offers permanent residence through property, business and fund investment, plus company formation services. Cyprus is in the EU but not in the Schengen area.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/cyprus/business-investment', description: 'Business investment route for Cyprus permanent residency.' },
      { category: 'RBI', title: 'Commercial Property', href: '/residency/cyprus/commercial-property', description: 'Commercial real estate investment for EU residency.' },
      { category: 'RBI', title: 'Fund Investment', href: '/residency/cyprus/fund-investment', description: 'Alternative Investment Fund qualifying for residency.' },
      { category: 'RBI', title: 'Residential Property', href: '/residency/cyprus/residential-property', description: 'Residential property route to Cyprus permanent residence.' },
      { category: 'Corporate', title: 'Company Setup', href: '/corporate/cyprus/company-setup', description: 'Cyprus company formation with EU benefits.' },
    ],
  },
  'dominica': {
    name: 'Dominica',
    code: 'DM',
    description: 'Dominica offers citizenship by investment through an Economic Diversification Fund contribution from USD 200,000 or approved real estate from USD 200,000 plus government fees. Every applicant aged 16 and over attends a mandatory interview.',
    programs: [
      { category: 'CBI', title: 'Real Estate CBI', href: '/citizenship/dominica/real-estate', description: 'Approved real estate from USD 200,000, plus government fees.' },
      { category: 'CBI', title: 'Economic Diversification Fund', href: '/citizenship/dominica/economic-diversification-fund', description: 'Non-refundable contribution from USD 200,000 (single applicant).' },
    ],
  },
  'egypt': {
    name: 'Egypt',
    code: 'EG',
    description: 'Egypt grants citizenship by investment under Law No. 140 of 2019, from a USD 250,000 contribution. The Cabinet\'s published processing standard is six to twelve months.',
    programs: [
      { category: 'CBI', title: 'Bank Deposit', href: '/citizenship/egypt/bank-deposit', description: 'USD 500,000 held at the Central Bank of Egypt for three years, interest-free, repaid in Egyptian pounds.' },
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/egypt/business-investment', description: 'USD 350,000 in an Egyptian project plus a USD 100,000 non-refundable payment.' },
      { category: 'CBI', title: 'Donation', href: '/citizenship/egypt/donation', description: 'USD 250,000 contribution to the state treasury.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/egypt/real-estate', description: 'Real estate from USD 300,000, funded from abroad.' },
    ],
  },
  'germany': {
    name: 'Germany',
    code: 'DE',
    description: 'Germany offers skilled migration pathways including the Opportunity Card (Chancenkarte) and the EU Blue Card for qualified international professionals.',
    programs: [
      { category: 'Skilled', title: 'Opportunity Card (Chancenkarte)', href: '/skilled/germany/germany-job-seeker-visa', description: 'Search for skilled work in Germany for up to a year. Replaced the Job Seeker visa on 1 June 2024.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=germany', description: 'EU Blue Card, Opportunity Card and skilled worker residence.' },
    ],
  },
  'greece': {
    name: 'Greece',
    code: 'GR',
    description: 'Greece\'s Golden Visa offers residence with Schengen access through real estate from EUR 400,000 (EUR 800,000 in Attica, Thessaloniki, Mykonos, Thira and larger islands; EUR 250,000 only for conversions and listed buildings) or capital investment.',
    programs: [
      { category: 'RBI', title: 'Capital Investment', href: '/residency/greece/greece-capital-investment', description: 'Capital investment route for Greek Golden Visa.' },
      { category: 'RBI', title: 'Real Estate Investment', href: '/residency/greece/greece-real-estate-investment', description: 'Property from EUR 400,000, or EUR 800,000 in the highest-demand areas.' },
    ],
  },
  'grenada': {
    name: 'Grenada',
    code: 'GD',
    description: 'Grenada is the only Eastern Caribbean CBI country with a US E-2 treaty, is not subject to US Proclamation 10998, and is visa-free to the UK with an ETA. Contributions start at USD 150,000.',
    programs: [
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/grenada/real-estate', description: 'Approved real estate from USD 220,000.' },
      { category: 'CBI', title: 'National Transformation Fund', href: '/citizenship/grenada/national-transformation-fund', description: 'Contribution to the NTF from USD 150,000 (single applicant).' },
    ],
  },
  'hong-kong': {
    name: 'Hong Kong',
    code: 'HK',
    description: 'Hong Kong\'s New Capital Investment Entrant Scheme (CIES) grants residence for HK$30 million in net assets — HK$27 million in permissible assets plus HK$3 million into the CIES Investment Portfolio.',
    programs: [
      { category: 'RBI', title: 'Business Investment (CIES)', href: '/residency/hong-kong/hk-business-investment', description: 'CIES route through listed equities and private funds.' },
      { category: 'RBI', title: 'Fund Investment (CIES)', href: '/residency/hong-kong/hk-fund-investment', description: 'CIES route through SFC-authorised funds.' },
      { category: 'RBI', title: 'Property Investment (CIES)', href: '/residency/hong-kong/hk-property-investment', description: 'CIES route with up to HK$15 million in real estate.' },
      { category: 'RBI', title: 'Securities Investment (CIES)', href: '/residency/hong-kong/hk-securities-investment', description: 'CIES route through listed equities and qualifying debt securities.' },
    ],
  },
  'hungary': {
    name: 'Hungary',
    code: 'HU',
    description: 'Hungary\'s Guest Investor Programme offers a residence permit of up to 10 years, extendable by another 10, for EUR 250,000 in a registered real estate fund or a EUR 1,000,000 donation.',
    programs: [
      { category: 'RBI', title: 'Donation — Public Trust', href: '/residency/hungary/hungary-donation-public-trust', description: 'EUR 1,000,000 donation to a higher education institution maintained by a public trust.' },
      { category: 'RBI', title: 'Real Estate Fund', href: '/residency/hungary/hungary-real-estate-fund', description: 'EUR 250,000 in an MNB-registered real estate fund.' },
    ],
  },
  'italy': {
    name: 'Italy',
    code: 'IT',
    description: 'Italy\'s Digital Nomad Visa allows remote workers to live and work in Italy with a valid employment or freelance contract.',
    programs: [
      { category: 'Skilled', title: 'Italy Digital Nomad Visa', href: '/skilled/italy/italy-digital-nomad-visa', description: 'Residency permit for remote workers employed by non-Italian companies.' },
    ],
  },
  'latvia': {
    name: 'Latvia',
    code: 'LV',
    description: 'Latvia abolished its real estate and bank investment routes on 15 September 2026, and the government bonds route had already closed. Only the company share-capital route remains, from EUR 50,000 plus a EUR 10,000 state fee.',
    programs: [
      { category: 'RBI', title: 'Bank Deposit (abolished)', href: '/residency/latvia/latvia-bank-deposit', description: 'Abolished on 15 September 2026 — no longer available.' },
      { category: 'RBI', title: 'Business Investment', href: '/residency/latvia/latvia-business-investment', description: 'Share capital from EUR 50,000 in a Latvian company, plus a EUR 10,000 state fee.' },
      { category: 'RBI', title: 'Government Bonds (closed)', href: '/residency/latvia/latvia-government-bonds', description: 'Route closed — no longer available.' },
      { category: 'RBI', title: 'Real Estate Investment (abolished)', href: '/residency/latvia/latvia-real-estate-investment', description: 'Abolished on 15 September 2026 — no longer available.' },
    ],
  },
  'malaysia': {
    name: 'Malaysia',
    code: 'MY',
    description: 'Malaysia\'s MM2H program allows foreign nationals to live long-term in Malaysia with property and financial investment routes.',
    programs: [
      { category: 'RBI', title: 'MM2H Property', href: '/residency/malaysia/malaysia-mm2h-property', description: 'Property purchase from MYR 600,000 (Silver tier).' },
      { category: 'RBI', title: 'MM2H Silver', href: '/residency/malaysia/malaysia-mm2h-silver', description: 'USD 150,000 fixed deposit plus a MYR 600,000 property purchase.' },
      { category: 'RBI', title: 'MM2H Gold', href: '/residency/malaysia/malaysia-mm2h-gold', description: 'USD 500,000 fixed deposit plus a MYR 1,000,000 property purchase.' },
    ],
  },
  'malta': {
    name: 'Malta',
    code: 'MT',
    description: 'Malta\'s MPRP offers EU residency with a combination of government contribution, property and donation requirements.',
    programs: [
      { category: 'RBI', title: 'Government Contribution', href: '/residency/malta/malta-government-contribution', description: 'EUR 37,000 government contribution and EUR 60,000 administrative fee.' },
      { category: 'RBI', title: 'Property Lease', href: '/residency/malta/malta-property-lease-residency', description: 'Qualifying property leased for at least EUR 14,000 a year.' },
      { category: 'RBI', title: 'Property Purchase', href: '/residency/malta/malta-property-purchase', description: 'Qualifying property bought for at least EUR 375,000.' },
    ],
  },
  'mauritius': {
    name: 'Mauritius',
    code: 'MU',
    description: 'Mauritius offers residence through the Investor Occupation Permit from USD 100,000, residential property above USD 375,000 and the retired non-citizen permit.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/mauritius/mauritius-business-investment', description: 'USD 100,000 initial investment for an Investor Occupation Permit.' },
      { category: 'RBI', title: 'Strategic Fund Investment', href: '/residency/mauritius/mauritius-strategic-fund-investment', description: 'A proposed USD 1 million Golden Visa — not yet in force.' },
      { category: 'RBI', title: 'Real Estate Investment', href: '/residency/mauritius/mauritius-real-estate-investment', description: 'Residential property above USD 375,000.' },
      { category: 'RBI', title: 'Retirement Transfer', href: '/residency/mauritius/mauritius-retirement-transfer', description: 'Retirement income transfer for residency.' },
    ],
  },
  'monaco': {
    name: 'Monaco',
    code: 'MC',
    description: 'Monaco residency has no legally prescribed minimum deposit or investment. The financial test is an attestation from a Monaco bank, which sets the sum it regards as sufficient.',
    programs: [
      { category: 'RBI', title: 'Bank Deposit', href: '/residency/monaco/monaco-residency-bank-deposit', description: 'Attestation from a Monaco bank that your means are sufficient.' },
      { category: 'RBI', title: 'Property Investment', href: '/residency/monaco/monaco-residency-property-investment', description: 'Property purchase route for Monégasque residency.' },
    ],
  },
  'nauru': {
    name: 'Nauru',
    code: 'NR',
    description: 'Nauru grants citizenship under the Economic and Climate Resilience Citizenship Act 2024 for a contribution from USD 90,000. The United Kingdom withdrew visa-free access in December 2025 because of the programme.',
    programs: [
      { category: 'CBI', title: 'Investment', href: '/citizenship/nauru/investment', description: 'Contribution from USD 90,000 for the principal applicant.' },
    ],
  },
  'new-zealand': {
    name: 'New Zealand',
    code: 'NZ',
    description: 'New Zealand\'s Active Investor Plus Visa and Business Investor Visa provide residency routes for high-net-worth individuals.',
    programs: [
      { category: 'RBI', title: 'Active Investor Plus — Balanced', href: '/residency/new-zealand/active-investor-plus-balanced-category', description: 'NZD 10 million in a diversified Balanced Category portfolio.' },
      { category: 'RBI', title: 'Active Investor Plus — Growth', href: '/residency/new-zealand/active-investor-plus-growth-category', description: 'NZD 5 million for 36 months in the Growth Category.' },
      { category: 'RBI', title: 'Business Investor Visa', href: '/residency/new-zealand/business-investor-visa', description: 'NZD 1 million in an established New Zealand business (NZD 2 million for fast-track residence).' },
    ],
  },
  'panama': {
    name: 'Panama',
    code: 'PA',
    description: 'Panama\'s Qualified Investor Visa grants permanent residence for USD 500,000 in real estate or securities, or a USD 750,000 fixed-term deposit.',
    programs: [
      { category: 'RBI', title: 'RBI via Real Estate', href: '/residency/panama/panama-residency-real-estate', description: 'Qualifying real estate from USD 500,000.' },
      { category: 'RBI', title: 'Residency — Bank Deposit', href: '/residency/panama/panama-residency-bank-deposit', description: 'Fixed-term deposit of USD 750,000.' },
      { category: 'RBI', title: 'RBI Stock Market', href: '/residency/panama/panama-residency-stock-market', description: 'Securities investment from USD 500,000.' },
    ],
  },
  'portugal': {
    name: 'Portugal',
    code: 'PT',
    description: 'Portugal offers residence through the Golden Visa (investment funds, company capitalisation, research or cultural support from EUR 250,000 — real estate no longer qualifies), the D7, the D8 and the D2 for entrepreneurs. Permanent residence after five years.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/portugal/portugal-business-investment', description: 'Company capitalisation of EUR 500,000 for the Portugal Golden Visa.' },
      { category: 'RBI', title: 'Capital Transfer', href: '/residency/portugal/portugal-capital-transfer', description: 'Investment funds or research (EUR 500,000), or cultural heritage support (EUR 250,000).' },
      { category: 'Corporate', title: 'Portugal D2 Visa', href: '/residency/portugal/portugal-d2-entrepreneur', description: 'Entrepreneur and company formation visa.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=portugal', description: 'Work residence, D2 direction and highly qualified activity.' },
    ],
  },
  'saint-kitts': {
    name: 'Saint Kitts & Nevis',
    code: 'KN',
    description: 'Saint Kitts & Nevis runs the world\'s first citizenship-by-investment programme (established 1984), with routes from USD 250,000, a mandatory interview for every main applicant, and visa-free UK access with an ETA.',
    programs: [
      { category: 'CBI', title: 'Approved Public Benefit Project', href: '/citizenship/saintkitts/approved-public-benefit-project', description: 'Investment from USD 250,000 in an approved public benefit project.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/saintkitts/real-estate', description: 'Approved real estate from USD 325,000, held for seven years.' },
      { category: 'CBI', title: 'Sustainable Island State Contribution', href: '/citizenship/saintkitts/sustainable-island-state-contribution', description: 'Non-refundable USD 250,000 contribution for a family of up to four.' },
    ],
  },
  'saint-lucia': {
    name: 'Saint Lucia',
    code: 'LC',
    description: 'Saint Lucia offers citizenship from a USD 240,000 National Economic Fund contribution or approved real estate from USD 300,000. Saint Lucia nationals have needed a visa for the UK since 5 March 2026.',
    programs: [
      { category: 'CBI', title: 'National Economic Fund', href: '/citizenship/saint-lucia/national-economic-fund', description: 'Non-refundable NEF contribution of USD 240,000 for an applicant with up to three qualifying dependants.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/saint-lucia/real-estate', description: 'Approved real estate from USD 300,000.' },
    ],
  },
  'saotome': {
    name: 'Sao Tome & Principe',
    code: 'ST',
    description: 'São Tomé and Príncipe grants nationality for a contribution from USD 90,000 under Decreto-Lei n.º 07/2025. There is no residence requirement, but no Schengen or UK visa-free access.',
    programs: [
      { category: 'CBI', title: 'National Transformation Fund (NTF)', href: '/citizenship/saotome/ntf', description: 'Non-refundable contribution from USD 90,000 (single applicant).' },
    ],
  },
  'singapore': {
    name: 'Singapore',
    code: 'SG',
    description: 'Singapore\'s Global Investor Programme (GIP) grants permanent residence for S$10 million in a business, S$25 million in a GIP-select fund, or a single family office with S$200 million in assets. Founders can also set up their own Singapore company and work in it on an Employment Pass.',
    programs: [
      { category: 'RBI', title: 'GIP Business Investment', href: '/residency/singapore/singapore-gip-business-investment', description: 'S$10 million in a new or existing business (Option A).' },
      { category: 'RBI', title: 'GIP Fund Investment', href: '/residency/singapore/singapore-gip-fund-investment', description: 'S$25 million in a GIP-select fund (Option B).' },
      { category: 'RBI', title: 'GIP SFO Residency', href: '/residency/singapore/singapore-gip-sfo-residency', description: 'Single family office with at least S$200 million in assets under management.' },
      { category: 'Corporate', title: 'Self-Employed Employment Pass', href: '/corporate/singapore/self-employed-employment-pass', description: 'Your own Singapore company employs you on an Employment Pass; qualifying salary from S$5,600 a month.' },
    ],
  },
  'spain': {
    name: 'Spain',
    code: 'ES',
    description: 'Spain offers residence through the Digital Nomad Visa and the entrepreneur route. Spain ended its Golden Visa on 3 April 2025.',
    programs: [
      { category: 'Skilled', title: 'Spain Digital Nomad Visa', href: '/skilled/spain/spain-digital-nomad-visa', description: 'Remote worker visa for living in Spain.' },
      { category: 'Corporate', title: 'Entrepreneur Company Formation', href: '/corporate/spain/entrepreneur-company-formation', description: 'Business setup route for entrepreneurs in Spain.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=spain', description: 'Digital nomad, highly qualified and entrepreneur direction.' },
    ],
  },
  'switzerland': {
    name: 'Switzerland',
    code: 'CH',
    description: 'Switzerland has no residency-by-investment programme. People who will not work use cantonal lump-sum taxation; founders can qualify by establishing and running a business.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/switzerland/switzerland-business-investment', description: 'Business investment for Swiss residency.' },
      { category: 'RBI', title: 'Lump Sum Tax', href: '/residency/switzerland/switzerland-lump-sum-tax', description: 'Forfait fiscal route for Swiss residency.' },
    ],
  },
  'turkey': {
    name: 'Turkey',
    code: 'TR',
    description: 'Turkey offers seven routes to citizenship by investment, from USD 400,000 in real estate held for three years, or USD 500,000 in the deposit, fund, bond, pension and business routes.',
    programs: [
      { category: 'CBI', title: 'Bank Deposit', href: '/citizenship/turkey/bank-deposit', description: 'Bank deposit route for Turkish citizenship.' },
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/turkey/business-investment', description: 'Business investment for citizenship.' },
      { category: 'CBI', title: 'Fund Investment', href: '/citizenship/turkey/fund-investment', description: 'Investment fund route for citizenship.' },
      { category: 'CBI', title: 'Government Bonds', href: '/citizenship/turkey/government-bonds', description: 'Government bonds route.' },
      { category: 'CBI', title: 'Job Creation', href: '/citizenship/turkey/job-creation', description: 'Job creation qualifying for citizenship.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/turkey/real-estate', description: 'Real estate purchase from USD 400,000, held for three years.' },
    ],
  },
  'uae': {
    name: 'United Arab Emirates',
    code: 'AE',
    description: 'The UAE Golden Visa offers 10-year residency for investors, talented professionals and entrepreneurs across the Emirates.',
    programs: [
      { category: 'RBI', title: 'UAE Golden Visa — Real Estate', href: '/residency/uae/uae-golden-visa', description: '10-year Golden Visa via real estate investment of AED 2M+.' },
      { category: 'RBI', title: 'UAE Specialized Talent', href: '/residency/uae/uae-specialized-talent', description: 'Golden Visa for doctors, scientists and exceptional talent.' },
      { category: 'Corporate', title: 'Dubai Freezone Visa', href: '/corporate/uae/dubai-freezone-visa', description: 'Business setup in UAE Free Zones.' },
      { category: 'Corporate', title: 'Dubai Investor Visa', href: '/corporate/uae/dubai-investor-visa', description: 'Investor residency through business contribution.' },
      { category: 'Corporate', title: 'Dubai Mainland Employment Visa', href: '/corporate/uae/dubai-mainland-employment-visa', description: 'Employment visa for mainland UAE companies.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=uae', description: 'Mainland, freezone, employment and professional mobility.' },
    ],
  },
  'united-kingdom': {
    name: 'United Kingdom',
    code: 'GB',
    description: 'The UK offers the Skilled Worker, Global Talent and Expansion Worker routes for professionals and businesses looking to operate in one of the world\'s major economies.',
    programs: [
      { category: 'Skilled', title: 'UK Global Talent Visa', href: '/skilled/united-kingdom/uk-global-talent-visa', description: 'For leaders and potential leaders in academia, research, arts and technology.' },
      { category: 'Corporate', title: 'Expansion Worker Visa', href: '/corporate/united-kingdom/expansion-worker-visa', description: 'For employees expanding an overseas business to the UK.' },
      { category: 'Corporate', title: 'Sponsoring Yourself Through a UK Company', href: '/corporate/united-kingdom/self-sponsorship-visa', description: 'How the Skilled Worker route works when the sponsor is a company you own — and where it fails.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=united-kingdom', description: 'Skilled Worker, Global Talent and expansion worker planning.' },
    ],
  },
  'uruguay': {
    name: 'Uruguay',
    code: 'UY',
    description: 'Uruguay sets no investment threshold for residency — only sufficient means of living. Real estate and business investment count towards tax residency.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/uruguay/uruguay-business-investment', description: 'Business investment for Uruguayan residency.' },
      { category: 'RBI', title: 'Real Estate Residency', href: '/residency/uruguay/uruguay-real-estate-residency', description: 'Real estate purchase qualifying for residency.' },
    ],
  },
  'usa': {
    name: 'United States of America',
    code: 'US',
    description: 'The USA offers investment-based Green Cards (EB-5), extraordinary ability visas and corporate transfer routes through the world\'s largest economy.',
    programs: [
      { category: 'RBI', title: 'EB-5 — Non-TEA', href: '/residency/usa/eb5-non-targeted-employment-area', description: 'EB-5 Green Card via USD 1.05M investment.' },
      { category: 'RBI', title: 'EB-5 — Targeted Employment Area', href: '/residency/usa/eb5-targeted-employment-area', description: 'EB-5 in rural or high-unemployment areas from USD 800K.' },
      { category: 'Skilled', title: 'EB-1A Extraordinary Ability', href: '/skilled/usa/eb1a-extraordinary-ability', description: 'Green Card for individuals with extraordinary ability.' },
      { category: 'Skilled', title: 'EB-2 National Interest Waiver', href: '/skilled/usa/eb2-national-interest-waiver', description: 'Self-petition Green Card for national interest work.' },
      { category: 'Skilled', title: 'H1-B Specialty Occupation', href: '/skilled/usa/h1b-specialty-occupation', description: 'Work visa for specialty occupation professionals.' },
      { category: 'Corporate', title: 'L-1 Corporate Transfer', href: '/corporate/usa/l1-corporate-transfer-visa', description: 'Intra-company transfer for managers and executives.' },
      { category: 'Corporate', title: 'O-1 Entrepreneur Visa', href: '/corporate/usa/o1-entrepreneur-visa', description: 'For individuals with extraordinary achievement.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=usa', description: 'H-1B, L-1, O-1, J-1 and sponsored work direction.' },
    ],
  },
  'vanuatu': {
    name: 'Vanuatu',
    code: 'VU',
    description: 'Vanuatu grants citizenship for a contribution from USD 130,000 with no residence requirement. The EU revoked its visa waiver from 3 February 2025, and the UK has required a visa since July 2023.',
    programs: [
      { category: 'CBI', title: 'VDSP Donation', href: '/citizenship/vanuatu/vdsp-donation', description: 'Non-refundable contribution to the VDSP from USD 130K.' },
    ],
  },
};

const BADGE_COLORS: Record<string, string> = {
  RBI: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CBI: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Golden Visa': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Skilled: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  Corporate: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Work Permits': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
};

const FLAG_BASE = 'https://flagcdn.com/w80';

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const data = COUNTRY_DATA[country];
  if (!data) return { title: 'Country Not Found' };

  return {
    title: `${data.name} Immigration Programs – Residency, Citizenship & More | XIPHIAS`,
    description: `Explore all XIPHIAS immigration programs available in ${data.name}: ${data.programs.map(p => p.title).slice(0, 3).join(', ')} and more.`,
    alternates: { canonical: `/countries/${country}` },
    openGraph: {
      title: `${data.name} Immigration Programs`,
      description: data.description,
      url: `https://www.xiphiasimmigration.com/countries/${country}`,
      siteName: 'XIPHIAS Immigration',
      locale: 'en_US',
      type: 'website',
      images: [{ url: '/xiphias-immigration.png', width: 1200, height: 630, alt: `${data.name} Immigration` }],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(COUNTRY_DATA).map((country) => ({ country }));
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const data = COUNTRY_DATA[country];

  if (!data) notFound();

  const categories = [...new Set(data.programs.map((p) => p.category))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${data.name} Immigration Programs – XIPHIAS`,
    description: data.description,
    itemListElement: data.programs.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.title,
      url: `https://www.xiphiasimmigration.com${p.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#0A0B0F]">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0b2a6b] via-[#0f3a8a] to-[#1c57b4] px-4 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(255,255,255,0.05),transparent)]" />
          <div className="mx-auto max-w-screen-xl">
            <Link
              href="/countries"
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All Countries
            </Link>
            <div className="flex items-center gap-5 mt-4">
              <img
                src={`${FLAG_BASE}/${data.code.toLowerCase()}.png`}
                alt={`${data.name} flag`}
                width={80}
                height={56}
                className="h-14 w-20 rounded-lg object-cover shadow-lg shrink-0"
              />
              <div>
                <h1 className="text-4xl font-extrabold text-white md:text-5xl">{data.name}</h1>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[cat] ?? BADGE_COLORS['Work Permits']}`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-white/75">
              {data.description}
            </p>
          </div>
        </div>

        {/* Programs */}
        <div className="mx-auto max-w-screen-xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Available Programs in {data.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-white/50">
            {data.programs.length} program{data.programs.length !== 1 ? 's' : ''} available
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.programs.map((prog) => (
              <Link
                key={prog.href}
                href={prog.href}
                className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:border-primary/40"
              >
                <span
                  className={`mb-3 inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_COLORS[prog.category] ?? BADGE_COLORS['Work Permits']}`}
                >
                  {prog.category}
                </span>
                <h3 className="font-semibold text-zinc-900 group-hover:text-primary dark:text-white dark:group-hover:text-secondary transition-colors">
                  {prog.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-white/55">
                  {prog.description}
                </p>
                <div className="mt-auto pt-4 flex items-center gap-1 text-sm font-semibold text-primary dark:text-secondary">
                  View Program
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Ready to explore {data.name}?</h2>
            <p className="mt-2 text-white/80">
              Our advisors will assess your eligibility and walk you through the best programs step by step.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-primary hover:bg-[#f0cb3b] transition-colors"
              >
                Book Free Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/eligibility"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Check Eligibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
