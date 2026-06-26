import type { Metadata } from "next";
import SolutionPage from "@/components/Solutions/SolutionPage";
import { SOLUTIONS } from "@/lib/solutions";

const cfg = SOLUTIONS["for-professionals"];
export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${cfg.eyebrow} — Skilled Migration & Work Visas`,
  description: cfg.intro,
  alternates: { canonical: "/for-professionals" },
};

export default function Page() {
  return <SolutionPage slug="for-professionals" />;
}
