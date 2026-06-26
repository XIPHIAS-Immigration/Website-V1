import type { Metadata } from "next";
import SolutionPage from "@/components/Solutions/SolutionPage";
import { SOLUTIONS } from "@/lib/solutions";

const cfg = SOLUTIONS["for-entrepreneurs"];
export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${cfg.eyebrow} — Start-up & Entrepreneur Visas`,
  description: cfg.intro,
  alternates: { canonical: "/for-entrepreneurs" },
};

export default function Page() {
  return <SolutionPage slug="for-entrepreneurs" />;
}
