import type { Metadata } from "next";
import CampaignShell from "@/components/Campaign/CampaignShell";

export const metadata: Metadata = {
  title: "Canada PR from India \u2014 Free Eligibility Assessment | XIPHIAS",
  description:
    "Find out in one call whether you qualify for Canadian permanent residence through Express Entry or a provincial programme.",
  robots: { index: false, follow: false },
};

export default function CanadaPrLandingPage() {
  return (
    <CampaignShell
      idPrefix="lp-canada"
      eyebrow="Canada Permanent Residence"
      title="Find out if you qualify for"
      titleAccent="Canadian PR."
      intro="Express Entry scores you on age, education, language and work experience. We calculate where you actually stand, tell you honestly whether it is worth applying, and if it is, we handle the filing end to end."
      points={[
        "A real CRS score, calculated on your profile \u2014 not a generic calculator.",
        "Express Entry and every provincial route assessed together, so nothing is missed.",
        "Your spouse and dependent children included in the same application.",
        "Seventeen years of filings, and we tell you when a case is not worth running.",
      ]}
      proof={[
        { value: "17 yrs", label: "Advising on Canadian immigration" },
        { value: "25,000+", label: "Clients advised worldwide" },
        { value: "60+", label: "Offices globally" },
      ]}
      formHeading="Get your free CRS assessment"
    />
  );
}
