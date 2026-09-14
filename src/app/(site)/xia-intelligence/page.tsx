import type { Metadata } from "next";

import XiaWorkbench from "@/components/Xia/XiaWorkbench";

export const metadata: Metadata = {
  title: "XIA Route Intelligence | Check Which Immigration Programmes You Qualify For",
  description:
    "Check your profile against the published rules of every skilled, residency, citizenship and business programme XIPHIAS works on — naming what you clear, what is missing, and what is shut.",
  alternates: { canonical: "/xia-intelligence" },
  openGraph: {
    title: "XIA Route Intelligence — the routes you actually qualify for",
    description:
      "A rules engine, not keyword matching. Every card says whether you meet the published criterion, what is missing, or why the door is shut.",
    url: "https://www.xiphiasimmigration.com/xia-intelligence",
    type: "website",
  },
};

type PageSearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first.toLowerCase().trim() : undefined;
}

/** The canonical tool page. The focused variants preset it and say so. */
export default async function XiaIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  return (
    <XiaWorkbench
      focus="all"
      preset={{ destination: one(params.destination ?? params.country), goal: one(params.goal) }}
    />
  );
}
