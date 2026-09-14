import type { Metadata } from "next";

import XiaWorkbench from "@/components/Xia/XiaWorkbench";

export const metadata: Metadata = {
  title: "Deep Analysis | Evidence-led routes for researchers and founders",
  description:
    "Extraordinary-ability and national-interest routes are judged on evidence, not points. Deep Analysis shows which evidence you already have and what each route still requires.",
  alternates: { canonical: "/deep-analysis" },
};

type PageSearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined) {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first.toLowerCase().trim() : undefined;
}

export default async function DeepAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const params = await searchParams;
  return (
    <XiaWorkbench
      focus="high-skill"
      preset={{ destination: one(params.destination ?? params.country), goal: one(params.goal) }}
    />
  );
}
