import type { Metadata } from "next";
import SolutionPage from "@/components/Solutions/SolutionPage";
import { SOLUTIONS } from "@/lib/solutions";

const cfg = SOLUTIONS["for-investors"];
export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${cfg.eyebrow} — Residency & Citizenship by Investment`,
  description: cfg.intro,
  alternates: { canonical: "/for-investors" },
};

export default function Page() {
  return <SolutionPage slug="for-investors" />;
}
