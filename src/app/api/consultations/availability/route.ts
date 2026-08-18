import { NextResponse } from "next/server";
import { getConsultationAvailability } from "@/lib/consultations/store";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { CONSULTATION_PRODUCT_TYPE } from "@/lib/consultations/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const product = getProductConfig(CONSULTATION_PRODUCT_TYPE);
  return NextResponse.json(
    {
      ok: true,
      priceInr: product?.priceInr || 25_000,
      ...getConsultationAvailability(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

