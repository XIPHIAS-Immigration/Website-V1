import type { Metadata } from "next";
import SolutionPage from "@/components/Solutions/SolutionPage";
import { SOLUTIONS } from "@/lib/solutions";

const cfg = SOLUTIONS["for-families"];
export const revalidate = 86400;
export const metadata: Metadata = {
  title: `${cfg.eyebrow} — Migration for Your Whole Family`,
  description: cfg.intro,
  alternates: { canonical: "/for-families" },
};

export default function Page() {
  return <SolutionPage slug="for-families" />;
}
