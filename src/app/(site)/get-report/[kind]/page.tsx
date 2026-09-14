import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import GetReportClient from "@/components/Xia/GetReportClient";
import { CASE_COOKIE } from "@/lib/xia/case";
import { getCase } from "@/lib/xia/case-store";
import { REPORT_LABEL, type ReportProductType } from "@/lib/xia/report-for";
import { getProductConfig } from "@/lib/payments/product-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your report",
  robots: { index: false, follow: false },
};

/**
 * One click from a programme card to payment.
 *
 * The old path sent people to /express-reports where they re-chose a product and
 * re-typed everything the tool already knew. This page reads the case instead:
 * if we have their contact details the only thing left is the pay button.
 */
export default async function GetReportPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  const productType = kind as ReportProductType;
  if (!REPORT_LABEL[productType]) notFound();

  const cookieStore = await cookies();
  const item = getCase(cookieStore.get(CASE_COOKIE)?.value ?? "");
  const priceInr = getProductConfig(productType)?.priceInr ?? 499;

  return (
    <GetReportClient
      productType={productType}
      label={REPORT_LABEL[productType]}
      priceInr={priceInr}
      prefill={{
        name: item?.name ?? "",
        email: item?.email ?? "",
        phone: item?.phone ?? "",
        destination: item?.destination ?? "",
        goal: item?.goal ?? "",
        programmes: (item?.matches ?? []).slice(0, 4).map((match) => match.title),
        matches: (item?.matches ?? []).slice(0, 4),
      }}
    />
  );
}
