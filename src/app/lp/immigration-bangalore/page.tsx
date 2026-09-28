import type { Metadata } from "next";
import CampaignShell from "@/components/Campaign/CampaignShell";

export const metadata: Metadata = {
  title: "Immigration Consultants in Bangalore \u2014 Free Consultation | XIPHIAS",
  description:
    "Licensed immigration consultants in Koramangala, Bengaluru. Book a free assessment for Canada, Australia, the UK and more.",
  robots: { index: false, follow: false },
};

export default function BangaloreLandingPage() {
  return (
    <CampaignShell
      idPrefix="lp-blr"
      eyebrow="Bengaluru \u00b7 Koramangala"
      title="Immigration consultants in"
      titleAccent="Bangalore."
      intro="We are a licensed immigration consultancy with an office in Koramangala. Come in and sit with an advisor, or start with a call \u2014 either way you get a straight answer about which country and which route actually fit you."
      points={[
        "A real office in Koramangala you can walk into, not a call centre.",
        "Licensed consultants \u2014 we tell you plainly what a lawyer can do that we cannot, and when you need one.",
        "Canada, Australia, the UK, Germany, Portugal and the UAE under one roof.",
        "A written assessment you keep, whether or not you engage us.",
      ]}
      proof={[
        { value: "17 yrs", label: "In practice" },
        { value: "25,000+", label: "Clients advised" },
        { value: "60+", label: "Offices globally" },
      ]}
      formHeading="Book a free consultation"
    />
  );
}
