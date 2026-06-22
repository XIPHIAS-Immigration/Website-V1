import type { HeaderItem } from '../menu.types'

// ---------------------------
// Programs dropdown entries
// ---------------------------
const programItems: HeaderItem[] = [
  {
    label: 'Residency by Investment',
    href: '/residency',
    description: 'RBI programs across 20+ countries — real estate, funds & more',
  },
  {
    label: 'Citizenship by Investment',
    href: '/citizenship',
    description: 'CBI programs in 11+ jurisdictions with full passport rights',
  },
  {
    label: 'Golden Visa',
    href: '/residency?category=golden-visa',
    description: 'Fast-track residency via investment in UAE, Greece & more',
    badge: { text: 'Popular', tone: 'success' },
  },
  {
    label: 'Skilled Migration',
    href: '/skilled',
    description: 'Points-based and employer-sponsored migration pathways',
  },
  {
    label: 'Corporate Mobility',
    href: '/corporate',
    description: 'Business setup, company formation & intra-company transfers',
  },
  {
    label: 'Work Permits',
    href: '/work-permits',
    description: 'Employment-based visa pathways in 8+ countries',
    badge: { text: 'Resume Review', tone: 'info' },
  },
];

// ---------------------------
// Countries dropdown entries
// ---------------------------
const countryItems: HeaderItem[] = [
  { label: 'Antigua & Barbuda', href: '/countries/antigua-barbuda', meta: { code: 'AG' } },
  { label: 'Australia',          href: '/countries/australia',          meta: { code: 'AU' } },
  { label: 'Bulgaria',           href: '/countries/bulgaria',           meta: { code: 'BG' } },
  { label: 'Canada',             href: '/countries/canada',             meta: { code: 'CA' } },
  { label: 'Curacao',            href: '/countries/curacao',            meta: { code: 'CW' } },
  { label: 'Cyprus',             href: '/countries/cyprus',             meta: { code: 'CY' } },
  { label: 'Dominica',           href: '/countries/dominica',           meta: { code: 'DM' } },
  { label: 'Egypt',              href: '/countries/egypt',              meta: { code: 'EG' } },
  { label: 'Germany',            href: '/countries/germany',            meta: { code: 'DE' } },
  { label: 'Greece',             href: '/countries/greece',             meta: { code: 'GR' } },
  { label: 'Grenada',            href: '/countries/grenada',            meta: { code: 'GD' } },
  { label: 'Hong Kong',          href: '/countries/hong-kong',          meta: { code: 'HK' } },
  { label: 'Hungary',            href: '/countries/hungary',            meta: { code: 'HU' } },
  { label: 'Italy',              href: '/countries/italy',              meta: { code: 'IT' } },
  { label: 'Latvia',             href: '/countries/latvia',             meta: { code: 'LV' } },
  { label: 'Malaysia',           href: '/countries/malaysia',           meta: { code: 'MY' } },
  { label: 'Malta',              href: '/countries/malta',              meta: { code: 'MT' } },
  { label: 'Mauritius',          href: '/countries/mauritius',          meta: { code: 'MU' } },
  { label: 'Monaco',             href: '/countries/monaco',             meta: { code: 'MC' } },
  { label: 'Nauru',              href: '/countries/nauru',              meta: { code: 'NR' } },
  { label: 'New Zealand',        href: '/countries/new-zealand',        meta: { code: 'NZ' } },
  { label: 'Panama',             href: '/countries/panama',             meta: { code: 'PA' } },
  { label: 'Portugal',           href: '/countries/portugal',           meta: { code: 'PT' } },
  { label: 'Saint Kitts',        href: '/countries/saint-kitts',        meta: { code: 'KN' } },
  { label: 'Saint Lucia',        href: '/countries/saint-lucia',        meta: { code: 'LC' } },
  { label: 'Sao Tome',           href: '/countries/saotome',            meta: { code: 'ST' } },
  { label: 'Singapore',          href: '/countries/singapore',          meta: { code: 'SG' } },
  { label: 'Spain',              href: '/countries/spain',              meta: { code: 'ES' } },
  { label: 'Switzerland',        href: '/countries/switzerland',        meta: { code: 'CH' } },
  { label: 'Turkey',             href: '/countries/turkey',             meta: { code: 'TR' } },
  { label: 'UAE',                href: '/countries/uae',                meta: { code: 'AE' } },
  { label: 'United Kingdom',     href: '/countries/united-kingdom',     meta: { code: 'GB' } },
  { label: 'Uruguay',            href: '/countries/uruguay',            meta: { code: 'UY' } },
  { label: 'USA',                href: '/countries/usa',                meta: { code: 'US' } },
  { label: 'Vanuatu',            href: '/countries/vanuatu',            meta: { code: 'VU' } },
];

// ---------------------------
// Solutions dropdown entries
// ---------------------------
const solutionItems: HeaderItem[] = [
  {
    label: 'For Investors',
    href: '/solutions/investors',
    description: 'RBI, CBI & Golden Visa strategies for wealth preservation',
  },
  {
    label: 'For Entrepreneurs',
    href: '/solutions/entrepreneurs',
    description: 'Startup visas, business formation & relocation advisory',
  },
  {
    label: 'For Professionals',
    href: '/solutions/professionals',
    description: 'Skilled migration & global talent pathways for specialists',
  },
  {
    label: 'For Businesses',
    href: '/solutions/businesses',
    description: 'Corporate mobility, ICT & enterprise expansion globally',
  },
  {
    label: 'For Families',
    href: '/solutions/families',
    description: 'Family reunification, relocation & second residency planning',
  },
];

// ---------------------------
// Insights dropdown entries
// ---------------------------
const insightItems: HeaderItem[] = [
  { label: 'Blog',               href: '/blog',     description: 'Expert commentary & migration news' },
  { label: 'Articles',           href: '/articles', description: 'In-depth analysis on programs & policy' },
  { label: 'News',               href: '/news',     description: 'Latest immigration industry updates' },
  { label: 'Media',              href: '/media',    description: 'Press coverage & XIPHIAS in the news' },
  { label: 'Guides & Resources', href: '/guide',    description: 'Step-by-step country & program guides' },
];

// ---------------------------
// Tools dropdown entries
// ---------------------------
const toolItems: HeaderItem[] = [
  {
    label: 'XIA Intelligence Suite',
    href: '/xia-intelligence',
    description: 'AI-powered immigration research & program matching',
  },
  {
    label: 'Cost Estimator',
    href: '/cost-estimator',
    description: 'Estimate total investment cost across programs',
  },
  {
    label: 'Compare Programmes',
    href: '/compare-programs',
    description: 'Side-by-side comparison of immigration programs',
  },
  {
    label: 'Program Index',
    href: '/xiphias-program-index',
    description: 'Complete index of all programs we advise on',
  },
  {
    label: 'Passport Power',
    href: '/passport-index',
    description: 'Global passport strength rankings & visa-free access',
  },
  {
    label: 'Eligibility Checker',
    href: '/eligibility',
    description: 'Check your eligibility for any program in minutes',
  },
  {
    label: 'X-Hub',
    href: '/x-hub',
    description: 'Client portal — track documents & case status',
  },
];

// ---------------------------
// About dropdown entries
// ---------------------------
const aboutItems: HeaderItem[] = [
  {
    label: 'Company',
    href: '/about',
    description: '17+ years, 10,000+ families relocated worldwide',
  },
  {
    label: 'Office Locations',
    href: '/about/locations',
    description: '6 offices across India, UAE, Qatar, Australia & Canada',
  },
  {
    label: 'Expertise & Leadership',
    href: '/about/leadership',
    description: 'Meet our MD and senior advisory team',
  },
];

// ---------------------------
// Top-level header menu
// ---------------------------
export const headerMenu: HeaderItem[] = [
  { label: 'Home', href: '/' },

  {
    label: 'Programs',
    href: '/programs',
    submenu: programItems,
  },

  {
    label: 'Countries',
    href: '/countries',
    submenu: countryItems,
  },

  {
    label: 'Solutions',
    href: '/solutions',
    submenu: solutionItems,
  },

  {
    label: 'Insights',
    href: '/insights',
    submenu: insightItems,
  },

  {
    label: 'Tools',
    href: '/xia-intelligence',
    submenu: toolItems,
  },

  {
    label: 'About',
    href: '/about',
    submenu: aboutItems,
  },
];
