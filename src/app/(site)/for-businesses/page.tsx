import type { Metadata } from "next";
import SolutionPage from "@/components/Solutions/SolutionPage";
import { SOLUTIONS } from "@/lib/solutions";

const cfg = SOLUTIONS["for-businesses"];
export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${cfg.eyebrow} — Corporate Mobility & Market Entry`,
  description: cfg.intro,
  alternates: { canonical: "/for-businesses" },
};

export default function Page() {
  return <SolutionPage slug="for-businesses" />;
}
