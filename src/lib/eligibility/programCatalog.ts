// src/lib/eligibility/programCatalog.ts
// Enriched, non-breaking catalog for use in suggestions and PDFs.
// NOTE: Thresholds/timelines vary by case and change often; treat as indicative.
// Keep `name` stable since other components may rely on it.

export const Programs = {
  residency: [
    {
      slug: "pt-alt-routes",
      name: "Portugal (Alt. routes)",
      country: "Portugal",
      pathway: "Residency by investment (funds/donation/arts/VC) or professional routes",
      minInvestmentUSD: "≈ 200k–500k+ (route dependent)",
      processingTime: "6–12 months (typical)",
      familyIncluded: true,
      requiresPhysicalPresence: "Low–Moderate (maintain ties; specifics vary by route)",
      notes:
        "Property route rules changed; alternative compliant options exist (funds, cultural, R&D). Residency can lead to citizenship subject to residence and language.",
    },
    {
      slug: "gr-property",
      name: "Greece Property Route",
      country: "Greece",
      pathway: "Residency by real estate investment",
      minInvestmentUSD: "≈ 250k–800k+ (region dependent)",
      processingTime: "3–6 months (typical after purchase)",
      familyIncluded: true,
      requiresPhysicalPresence: "Minimal (renewal conditions apply)",
      notes:
        "Threshold depends on municipality/region. Allows spouse and dependent children; long-term path to citizenship with residence & language.",
    },
    {
      slug: "uae-residency",
      name: "UAE Residency",
      country: "United Arab Emirates",
      pathway: "Employment, company setup, investor/real-estate, freelancer & remote worker routes",
      minInvestmentUSD: "Varies by route (company setup/real estate/fees)",
      processingTime: "1–8 weeks (route dependent)",
      familyIncluded: true,
      requiresPhysicalPresence: "Low (entry/medical/ID issuance required)",
      notes:
        "Multiple pathways with fast processing. Golden Visa available for qualifying investors/talents with longer validity.",
    },
  ],

  citizenship: [
    {
      slug: "it-jure-sanguinis",
      name: "Italy by Descent",
      country: "Italy",
      pathway: "Citizenship jure sanguinis (by descent)",
      minInvestmentUSD: "N/A",
      processingTime: "6–24+ months (municipality/consulate dependent)",
      familyIncluded: "Lineal descendants may benefit",
      requiresPhysicalPresence: "Varies (municipal processing/residency cases differ)",
      notes:
        "Eligibility depends on uninterrupted lineage and dates (no renunciation in the line). Documentation and legalization required.",
    },
    {
      slug: "ie-foreign-birth-register",
      name: "Ireland by Descent",
      country: "Ireland",
      pathway: "Citizenship by descent (Foreign Births Register)",
      minInvestmentUSD: "N/A",
      processingTime: "6–18+ months (batch dependent)",
      familyIncluded: "Passes to next generation once you’re registered (rules apply)",
      requiresPhysicalPresence: "No ongoing residence needed",
      notes:
        "Generally available if a parent/grandparent was an Irish citizen at your birth (documentation and FBR registration required).",
    },
    {
      slug: "caribbean-cbi",
      name: "Caribbean CBI",
      country: "Caribbean (program-dependent)",
      pathway: "Citizenship by investment (donation or real estate)",
      minInvestmentUSD: "≈ 200k+ (program/option dependent) + fees",
      processingTime: "3–8 months (enhanced due diligence)",
      familyIncluded: true,
      requiresPhysicalPresence: "Usually none",
      notes:
        "Program terms and minimums change periodically; strict due diligence applies. Choose by visa access, family add-ons, and timelines.",
    },
    {
      slug: "mt-exceptional-services",
      name: "Malta (Exceptional Services)",
      country: "Malta",
      pathway: "Citizenship for exceptional services by direct investment",
      minInvestmentUSD: "≈ 600k–750k+ contribution + property & donation",
      processingTime: "12–36 months (eligibility periods apply)",
      familyIncluded: true,
      requiresPhysicalPresence: "Residence period before eligibility",
      notes:
        "Structured multi-part contribution with mandatory residence period; rigorous due diligence and compliance requirements.",
    },
  ],

  corporate: [
    {
      slug: "ict-transfer",
      name: "Intra-Company Transfer",
      country: "Various (e.g., UK/EU, Canada, UAE, Singapore)",
      pathway: "Employer-sponsored transfer of key staff",
      minInvestmentUSD: "N/A (employer costs/fees apply)",
      processingTime: "2–12+ weeks (jurisdiction dependent)",
      familyIncluded: true,
      requiresPhysicalPresence: "Yes (work location)",
      notes:
        "Ideal for relocating managers/specialists within multinational groups; often requires qualifying relationship and salary thresholds.",
    },
    {
      slug: "entity-plus-visa",
      name: "Entity + Employer Visa",
      country: "Various",
      pathway: "Incorporation plus employer sponsorship privileges",
      minInvestmentUSD: "Setup & capitalization vary by jurisdiction",
      processingTime: "2–8 weeks for setup + visa timelines",
      familyIncluded: true,
      requiresPhysicalPresence: "Yes (sponsored employees on site)",
      notes:
        "Combine company formation with sponsor licence/establishment card to hire or relocate talent. Good for building a local presence.",
    },
    {
      slug: "uae-golden-visa",
      name: "UAE Golden Visa",
      country: "United Arab Emirates",
      pathway: "Long-term residence for investors/talents",
      minInvestmentUSD: "Real estate ≈ AED 2M+ (or other qualifying routes)",
      processingTime: "2–6 weeks (route dependent)",
      familyIncluded: true,
      requiresPhysicalPresence: "Low (entry/medical/ID issuance required)",
      notes:
        "10-year residence for qualifying investors and talents; flexible renewals and family sponsorship benefits.",
    },
  ],

  skilled: [
    {
      slug: "ca-express-entry",
      name: "Canada Express Entry",
      country: "Canada",
      pathway: "Points-based permanent residence (CRS)",
      minInvestmentUSD: "N/A",
      processingTime: "6–12 months after ITA (varies)",
      familyIncluded: true,
      requiresPhysicalPresence: "Settlement after landing (PR obligations apply)",
      notes:
        "CRS scores depend on age, education, language, experience; PNP nominations can boost scores. IELTS/CELPIP and ECA required.",
    },
    {
      slug: "au-skilled-189-190",
      name: "Australia Skilled (189/190)",
      country: "Australia",
      pathway: "Points-based skilled migration (independent or state nominated)",
      minInvestmentUSD: "N/A",
      processingTime: "Varies by round/state and occupation",
      familyIncluded: true,
      requiresPhysicalPresence: "Settlement in Australia (state commitments may apply)",
      notes:
        "Points from age, English, education, occupation; state nomination (190) increases competitiveness. Skills assessment required.",
    },
    {
      slug: "pnps-state-nominee",
      name: "Provincial/State Nominee",
      country: "Canada/Australia (regional programs)",
      pathway: "Nomination by province/state for in-demand occupations",
      minInvestmentUSD: "N/A",
      processingTime: "Varies by stream",
      familyIncluded: true,
      requiresPhysicalPresence: "Settlement in nominating region (conditions apply)",
      notes:
        "Useful when federal points are borderline. Prior ties, job offers, or study history can help eligibility.",
    },
  ],
} as const;
