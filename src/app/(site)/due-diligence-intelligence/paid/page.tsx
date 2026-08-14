import type { Metadata } from "next";
import PaidDueDiligenceClient from "@/components/DueDiligence/PaidDueDiligenceClient";

export const metadata: Metadata = {
  title: "Paid Immigration Due Diligence | XIPHIAS Immigration",
  description: "Complete the secure paid intake for your XIPHIAS Immigration Due Diligence Report.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

export default async function PaidDueDiligencePage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  return (
    <PaidDueDiligenceClient
      order={first(params.order)}
      expires={first(params.expires)}
      token={first(params.token)}
    />
  );
}
