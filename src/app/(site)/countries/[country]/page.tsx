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
    description: 'A Caribbean nation offering one of the fastest citizenship-by-investment programs globally, granting visa-free access to 150+ countries.',
    programs: [
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/antigua-barbuda/business-investment', description: 'Invest in an approved business to qualify for citizenship.' },
      { category: 'CBI', title: 'National Development Fund', href: '/citizenship/antigua-barbuda/national-development-fund', description: 'Non-refundable contribution to the NDF from USD 100K.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/antigua-barbuda/real-estate', description: 'Purchase approved real estate from USD 200K.' },
    ],
  },
  'australia': {
    name: 'Australia',
    code: 'AU',
    description: 'Australia offers world-class skilled migration programs with permanent residency pathways for qualified professionals and sponsored workers.',
    programs: [
      { category: 'Skilled', title: 'Employer Nomination Scheme (186)', href: '/skilled/australia/employer-nomination-scheme-186', description: 'Employer-sponsored permanent residency.' },
      { category: 'Skilled', title: 'Global Talent Visa (858)', href: '/skilled/australia/global-talent-visa-858', description: 'For internationally recognised talent in target sectors.' },
      { category: 'Skilled', title: 'Skilled Independent (189)', href: '/skilled/australia/skilled-independent-189', description: 'Points-tested independent migration, no sponsorship needed.' },
      { category: 'Skilled', title: 'Skilled Nominated (190)', href: '/skilled/australia/skilled-nominated-190', description: 'State-nominated skilled migration visa.' },
      { category: 'Skilled', title: 'Skilled Work Regional (491)', href: '/skilled/australia/skilled-work-regional-491', description: 'Points-tested visa for regional Australia.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=australia', description: 'Employer nomination, points-tested skilled and regional options.' },
    ],
  },
  'bulgaria': {
    name: 'Bulgaria',
    code: 'BG',
    description: 'Bulgaria offers EU residency and a path to citizenship through AIF funds, government bonds and real estate investment.',
    programs: [
      { category: 'RBI', title: 'AIF Residency', href: '/residency/bulgaria/bulgaria-aif-residency', description: 'Invest in an Alternative Investment Fund for EU residency.' },
      { category: 'RBI', title: 'Government Bonds Residency', href: '/residency/bulgaria/bulgaria-government-bonds-residency', description: 'Government bonds route for Bulgarian residency.' },
      { category: 'RBI', title: 'Real Estate Residency', href: '/residency/bulgaria/bulgaria-real-estate-residency', description: 'Property investment qualifying for EU residency.' },
    ],
  },
  'canada': {
    name: 'Canada',
    code: 'CA',
    description: 'Canada is one of the world\'s top immigration destinations, offering entrepreneur visas, express entry, skilled migration and corporate transfer routes.',
    programs: [
      { category: 'RBI', title: 'Federal Start-Up Visa', href: '/residency/canada/federal-start-up-visa', description: 'For innovative startup founders backed by designated organisations.' },
      { category: 'RBI', title: 'BC Entrepreneur', href: '/residency/canada/british-columbia-entrepreneur-base', description: 'British Columbia entrepreneur immigration stream.' },
      { category: 'RBI', title: 'Ontario Entrepreneur', href: '/residency/canada/ontario-entrepreneur', description: 'Ontario Immigrant Nominee Program for entrepreneurs.' },
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
    description: 'Curacao offers Caribbean residency through active and passive investment routes with a low entry threshold.',
    programs: [
      { category: 'RBI', title: '3-Year Active Investor', href: '/residency/curacao/3-year-active-investor', description: 'Active business investment residency for 3 years.' },
      { category: 'RBI', title: 'Indefinite Investor Residency', href: '/residency/curacao/indefinite-investor-residency', description: 'Permanent residency through qualifying investment.' },
    ],
  },
  'cyprus': {
    name: 'Cyprus',
    code: 'CY',
    description: 'Cyprus offers EU residency through multiple investment routes including real estate and business funds, plus company formation services.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/cyprus/business-investment', description: 'Business investment route for Cyprus permanent residency.' },
      { category: 'RBI', title: 'Commercial Property', href: '/residency/cyprus/commercial-property', description: 'Commercial real estate investment for EU residency.' },
      { category: 'RBI', title: 'Fund Investment', href: '/residency/cyprus/fund-investment', description: 'Alternative Investment Fund qualifying for residency.' },
      { category: 'RBI', title: 'Residential Property', href: '/residency/cyprus/residential-property', description: 'Residential property purchase from EUR 300K.' },
      { category: 'Corporate', title: 'Company Setup', href: '/corporate/cyprus/company-setup', description: 'Cyprus company formation with EU benefits.' },
    ],
  },
  'dominica': {
    name: 'Dominica',
    code: 'DM',
    description: 'Dominica\'s CBI program is among the most affordable globally and grants visa-free access to 140+ countries.',
    programs: [
      { category: 'CBI', title: 'Real Estate CBI', href: '/citizenship/dominica/real-estate', description: 'Approved real estate investment from USD 200K.' },
      { category: 'CBI', title: 'Economic Diversification Fund', href: '/citizenship/dominica/economic-diversification-fund', description: 'Non-refundable donation from USD 100K (single).' },
    ],
  },
  'egypt': {
    name: 'Egypt',
    code: 'EG',
    description: 'Egypt offers one of the fastest citizenship-by-investment programs with a 3-month processing time and affordable investment options.',
    programs: [
      { category: 'CBI', title: 'Bank Deposit', href: '/citizenship/egypt/bank-deposit', description: 'Refundable bank deposit route for Egyptian citizenship.' },
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/egypt/business-investment', description: 'Business investment route for citizenship.' },
      { category: 'CBI', title: 'Donation', href: '/citizenship/egypt/donation', description: 'Direct donation to the Egyptian government.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/egypt/real-estate', description: 'Real estate acquisition qualifying for citizenship.' },
    ],
  },
  'germany': {
    name: 'Germany',
    code: 'DE',
    description: 'Germany offers skilled migration pathways including the EU Opportunity Card and Blue Card for qualified international professionals.',
    programs: [
      { category: 'Skilled', title: 'Job Seeker Visa', href: '/skilled/germany/germany-job-seeker-visa', description: 'Visa to enter Germany and search for skilled employment.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=germany', description: 'EU Blue Card, Opportunity Card and skilled worker residence.' },
    ],
  },
  'greece': {
    name: 'Greece',
    code: 'GR',
    description: 'Greece\'s Golden Visa is one of Europe\'s most popular, offering EU residency from EUR 250K through real estate or capital investment.',
    programs: [
      { category: 'RBI', title: 'Capital Investment', href: '/residency/greece/greece-capital-investment', description: 'Capital investment route for Greek Golden Visa.' },
      { category: 'RBI', title: 'Real Estate Investment', href: '/residency/greece/greece-real-estate-investment', description: 'Property purchase from EUR 250K for EU residency.' },
    ],
  },
  'grenada': {
    name: 'Grenada',
    code: 'GD',
    description: 'Grenada\'s CBI program is unique — it allows holders to apply for the US E-2 Investor Visa, making it highly strategic for US-bound investors.',
    programs: [
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/grenada/real-estate', description: 'Approved real estate investment from USD 220K.' },
      { category: 'CBI', title: 'National Transformation Fund', href: '/citizenship/grenada/national-transformation-fund', description: 'Contribution to the NTF from USD 150K.' },
    ],
  },
  'hong-kong': {
    name: 'Hong Kong',
    code: 'HK',
    description: 'Hong Kong offers globally competitive residency-by-investment routes including the GIP for business, fund, property and securities investors.',
    programs: [
      { category: 'RBI', title: 'Business Investment (GIP)', href: '/residency/hong-kong/hk-business-investment', description: 'GIP business investment for HK residency.' },
      { category: 'RBI', title: 'Fund Investment (GIP)', href: '/residency/hong-kong/hk-fund-investment', description: 'GIP fund investment route.' },
      { category: 'RBI', title: 'Property Investment (GIP)', href: '/residency/hong-kong/hk-property-investment', description: 'GIP property investment route.' },
      { category: 'RBI', title: 'Securities Investment (GIP)', href: '/residency/hong-kong/hk-securities-investment', description: 'GIP securities investment route.' },
    ],
  },
  'hungary': {
    name: 'Hungary',
    code: 'HU',
    description: 'Hungary\'s Guest Investor Program offers EU Schengen residency through real estate fund investment or donation routes.',
    programs: [
      { category: 'RBI', title: 'Donation — Public Trust', href: '/residency/hungary/hungary-donation-public-trust', description: 'Donation to a public trust fund for Hungarian residency.' },
      { category: 'RBI', title: 'Real Estate Fund', href: '/residency/hungary/hungary-real-estate-fund', description: 'Real estate fund investment for EU Schengen residency.' },
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
    description: 'Latvia offers EU Schengen residency through multiple investment routes with straightforward qualifying criteria.',
    programs: [
      { category: 'RBI', title: 'Bank Deposit', href: '/residency/latvia/latvia-bank-deposit', description: 'Bank deposit route for Latvian residency.' },
      { category: 'RBI', title: 'Business Investment', href: '/residency/latvia/latvia-business-investment', description: 'Business investment for EU residency.' },
      { category: 'RBI', title: 'Government Bonds', href: '/residency/latvia/latvia-government-bonds', description: 'Government bonds route for Latvian residency.' },
      { category: 'RBI', title: 'Real Estate Investment', href: '/residency/latvia/latvia-real-estate-investment', description: 'Property purchase qualifying for EU residency.' },
    ],
  },
  'malaysia': {
    name: 'Malaysia',
    code: 'MY',
    description: 'Malaysia\'s MM2H program allows foreign nationals to live long-term in Malaysia with property and financial investment routes.',
    programs: [
      { category: 'RBI', title: 'MM2H Property', href: '/residency/malaysia/malaysia-mm2h-property', description: 'MM2H program with property investment component.' },
      { category: 'RBI', title: 'MM2H Silver', href: '/residency/malaysia/malaysia-mm2h-silver', description: 'Standard tier of the MM2H long-stay visa.' },
      { category: 'RBI', title: 'MM2H Gold', href: '/residency/malaysia/malaysia-mm2h-gold', description: 'Premium tier of the MM2H program.' },
    ],
  },
  'malta': {
    name: 'Malta',
    code: 'MT',
    description: 'Malta\'s MPRP offers EU residency with a combination of government contribution, property and donation requirements.',
    programs: [
      { category: 'RBI', title: 'Government Contribution', href: '/residency/malta/malta-government-contribution', description: 'Government contribution route for Maltese residency.' },
      { category: 'RBI', title: 'Property Lease', href: '/residency/malta/malta-property-lease-residency', description: 'Property lease qualifying for residency.' },
      { category: 'RBI', title: 'Property Purchase', href: '/residency/malta/malta-property-purchase', description: 'Property purchase route for Maltese residency.' },
    ],
  },
  'mauritius': {
    name: 'Mauritius',
    code: 'MU',
    description: 'Mauritius is an emerging residency destination offering business, real estate, fund and retirement investment routes.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/mauritius/mauritius-business-investment', description: 'Business investment for Mauritian residency.' },
      { category: 'RBI', title: 'Strategic Fund Investment', href: '/residency/mauritius/mauritius-strategic-fund-investment', description: 'Strategic fund investment route.' },
      { category: 'RBI', title: 'Real Estate Investment', href: '/residency/mauritius/mauritius-real-estate-investment', description: 'Real estate qualifying for residency.' },
      { category: 'RBI', title: 'Retirement Transfer', href: '/residency/mauritius/mauritius-retirement-transfer', description: 'Retirement income transfer for residency.' },
    ],
  },
  'monaco': {
    name: 'Monaco',
    code: 'MC',
    description: 'Monaco residency is one of the world\'s most exclusive, requiring a bank deposit or property investment plus financial independence.',
    programs: [
      { category: 'RBI', title: 'Bank Deposit', href: '/residency/monaco/monaco-residency-bank-deposit', description: 'Bank deposit requirement for Monaco residency.' },
      { category: 'RBI', title: 'Property Investment', href: '/residency/monaco/monaco-residency-property-investment', description: 'Property purchase route for Monégasque residency.' },
    ],
  },
  'nauru': {
    name: 'Nauru',
    code: 'NR',
    description: 'Nauru offers a direct citizenship-by-investment route with a straightforward application and competitive investment threshold.',
    programs: [
      { category: 'CBI', title: 'Investment', href: '/citizenship/nauru/investment', description: 'Direct investment for Nauru citizenship.' },
    ],
  },
  'new-zealand': {
    name: 'New Zealand',
    code: 'NZ',
    description: 'New Zealand\'s Active Investor Plus Visa and Business Investor Visa provide residency routes for high-net-worth individuals.',
    programs: [
      { category: 'RBI', title: 'Active Investor Plus — Balanced', href: '/residency/new-zealand/active-investor-plus-balanced-category', description: 'Balanced investment category for NZ residency.' },
      { category: 'RBI', title: 'Active Investor Plus — Growth', href: '/residency/new-zealand/active-investor-plus-growth-category', description: 'Growth investment category for NZ residency.' },
      { category: 'RBI', title: 'Business Investor Visa', href: '/residency/new-zealand/business-investor-visa', description: 'Business investment for New Zealand residency.' },
    ],
  },
  'panama': {
    name: 'Panama',
    code: 'PA',
    description: 'Panama offers multiple affordable residency routes through real estate, bank deposits and stock market investment.',
    programs: [
      { category: 'RBI', title: 'RBI via Real Estate', href: '/residency/panama/panama-residency-real-estate', description: 'Real estate investment for Panamanian residency.' },
      { category: 'RBI', title: 'Residency — Bank Deposit', href: '/residency/panama/panama-residency-bank-deposit', description: 'Bank deposit route for Panama residency.' },
      { category: 'RBI', title: 'RBI Stock Market', href: '/residency/panama/panama-residency-stock-market', description: 'Stock market investment route for residency.' },
    ],
  },
  'portugal': {
    name: 'Portugal',
    code: 'PT',
    description: 'Portugal\'s Golden Visa and D2 Visa are among Europe\'s most sought-after — offering EU residency, citizenship pathways and business routes.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/portugal/portugal-business-investment', description: 'Business investment for Portugal Golden Visa.' },
      { category: 'RBI', title: 'Capital Transfer', href: '/residency/portugal/portugal-capital-transfer', description: 'Capital transfer route for EU residency.' },
      { category: 'Corporate', title: 'Portugal D2 Visa', href: '/corporate/portugal/portugal-d2-visa', description: 'Entrepreneur and company formation visa.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=portugal', description: 'Work residence, D2 direction and highly qualified activity.' },
    ],
  },
  'saint-kitts': {
    name: 'Saint Kitts & Nevis',
    code: 'KN',
    description: 'Saint Kitts & Nevis runs the world\'s oldest CBI program, offering a visa-free passport to 157+ countries.',
    programs: [
      { category: 'CBI', title: 'Approved Public Benefit Project', href: '/citizenship/saintkitts/approved-public-benefit-project', description: 'Contribution to an approved public benefit project.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/saintkitts/real-estate', description: 'Approved real estate purchase for citizenship.' },
      { category: 'CBI', title: 'Sustainable Island State Contribution', href: '/citizenship/saintkitts/sustainable-island-state-contribution', description: 'Non-refundable contribution to the SISC fund.' },
    ],
  },
  'saint-lucia': {
    name: 'Saint Lucia',
    code: 'LC',
    description: 'Saint Lucia\'s CBI program offers citizenship from USD 100K through fund contribution and USD 300K via real estate.',
    programs: [
      { category: 'CBI', title: 'National Economic Fund', href: '/citizenship/saint-lucia/national-economic-fund', description: 'Non-refundable contribution to the NEF from USD 100K.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/saint-lucia/real-estate', description: 'Approved real estate investment from USD 300K.' },
    ],
  },
  'saotome': {
    name: 'Sao Tome & Principe',
    code: 'ST',
    description: 'Sao Tome & Principe offers CBI through the National Trust Fund with an affordable entry point.',
    programs: [
      { category: 'CBI', title: 'National Trust Fund (NTF)', href: '/citizenship/saotome/ntf', description: 'Contribution to the NTF for Sao Tomean citizenship.' },
    ],
  },
  'singapore': {
    name: 'Singapore',
    code: 'SG',
    description: 'Singapore\'s Global Investor Program (GIP) offers one of Asia\'s most prestigious residency routes for business leaders and investors.',
    programs: [
      { category: 'RBI', title: 'GIP Business Investment', href: '/residency/singapore/singapore-gip-business-investment', description: 'Business investment track for Singapore PR via GIP.' },
      { category: 'RBI', title: 'GIP Fund Investment', href: '/residency/singapore/singapore-gip-fund-investment', description: 'GIP fund investment track.' },
      { category: 'RBI', title: 'GIP SFO Residency', href: '/residency/singapore/singapore-gip-sfo-residency', description: 'Single Family Office track for GIP residency.' },
    ],
  },
  'spain': {
    name: 'Spain',
    code: 'ES',
    description: 'Spain offers EU residency through the Digital Nomad Visa, entrepreneur formation and the Golden Visa for investors.',
    programs: [
      { category: 'Skilled', title: 'Spain Digital Nomad Visa', href: '/skilled/spain/spain-digital-nomad-visa', description: 'Remote worker visa for living in Spain.' },
      { category: 'Corporate', title: 'Entrepreneur Company Formation', href: '/corporate/spain/entrepreneur-company-formation', description: 'Business setup route for entrepreneurs in Spain.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=spain', description: 'Digital nomad, highly qualified and entrepreneur direction.' },
    ],
  },
  'switzerland': {
    name: 'Switzerland',
    code: 'CH',
    description: 'Switzerland offers residency through lump-sum taxation and business investment, catering to high-net-worth individuals seeking European stability.',
    programs: [
      { category: 'RBI', title: 'Business Investment', href: '/residency/switzerland/switzerland-business-investment', description: 'Business investment for Swiss residency.' },
      { category: 'RBI', title: 'Lump Sum Tax', href: '/residency/switzerland/switzerland-lump-sum-tax', description: 'Forfait fiscal route for Swiss residency.' },
    ],
  },
  'turkey': {
    name: 'Turkey',
    code: 'TR',
    description: 'Turkey\'s CBI program is one of the most affordable globally, offering citizenship from USD 400K real estate investment.',
    programs: [
      { category: 'CBI', title: 'Bank Deposit', href: '/citizenship/turkey/bank-deposit', description: 'Bank deposit route for Turkish citizenship.' },
      { category: 'CBI', title: 'Business Investment', href: '/citizenship/turkey/business-investment', description: 'Business investment for citizenship.' },
      { category: 'CBI', title: 'Fund Investment', href: '/citizenship/turkey/fund-investment', description: 'Investment fund route for citizenship.' },
      { category: 'CBI', title: 'Government Bonds', href: '/citizenship/turkey/government-bonds', description: 'Government bonds route.' },
      { category: 'CBI', title: 'Job Creation', href: '/citizenship/turkey/job-creation', description: 'Job creation qualifying for citizenship.' },
      { category: 'CBI', title: 'Real Estate', href: '/citizenship/turkey/real-estate', description: 'Real estate purchase from USD 400K.' },
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
    description: 'The UK offers skilled worker visas, global talent routes and self-sponsorship for entrepreneurs looking to operate in one of the world\'s major economies.',
    programs: [
      { category: 'Skilled', title: 'UK Global Talent Visa', href: '/skilled/united-kingdom/uk-global-talent-visa', description: 'For leaders and potential leaders in academia, research, arts and technology.' },
      { category: 'Corporate', title: 'Expansion Worker Visa', href: '/corporate/united-kingdom/expansion-worker-visa', description: 'For employees expanding an overseas business to the UK.' },
      { category: 'Corporate', title: 'Self Sponsorship Visa', href: '/corporate/united-kingdom/self-sponsorship-visa', description: 'Setup a UK company and self-sponsor your own work visa.' },
      { category: 'Work Permits', title: 'Work Permit Advisory', href: '/work-permits?country=united-kingdom', description: 'Skilled Worker, Global Talent and expansion worker planning.' },
    ],
  },
  'uruguay': {
    name: 'Uruguay',
    code: 'UY',
    description: 'Uruguay offers one of South America\'s most accessible residency programs through real estate and business investment.',
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
    description: 'Vanuatu runs one of the world\'s fastest CBI programs — citizenship can be obtained in as little as 30 days.',
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
