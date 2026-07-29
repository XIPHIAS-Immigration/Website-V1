import { NextResponse, type NextRequest } from "next/server";
import { getJiopayOrder, updateJiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig } from "@/lib/payments/product-catalog";
import {
  ensurePaidReportArtifact,
  verifyReportDownloadGrant,
} from "@/lib/payments/report-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const merchantTxnNo = req.nextUrl.searchParams.get("order")?.trim() || "";
  const token = req.nextUrl.searchParams.get("token")?.trim() || "";
  const expires = Number(req.nextUrl.searchParams.get("expires"));

  if (!merchantTxnNo || !token || !verifyReportDownloadGrant(merchantTxnNo, expires, token)) {
    return NextResponse.json({ ok: false, error: "Invalid or expired report link." }, { status: 403 });
  }

  const order = getJiopayOrder(merchantTxnNo);
  if (!order) {
    return NextResponse.json({ ok: false, error: "Payment order was not found." }, { status: 404 });
  }
  if (order.status !== "paid" && order.status !== "report_sent") {
    return NextResponse.json(
      { ok: false, pending: true, error: "Payment confirmation is still pending." },
      { status: 409, headers: { "Retry-After": "3" } },
    );
  }

  const product = getProductConfig(order.productType);
  if (!product || product.fulfillment !== "report" || !product.reportKind) {
    return NextResponse.json({ ok: false, error: "This purchase has no PDF report." }, { status: 400 });
  }

  try {
    const pdf = await ensurePaidReportArtifact(order, product);
    const filename = `XIPHIAS_${product.fileSlug}_${order.merchantTxnNo}.pdf`;
    updateJiopayOrder(order.merchantTxnNo, {}, {
      type: "report_downloaded",
      at: new Date().toISOString(),
      data: { productType: order.productType, filename },
    });
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "The report could not be generated.",
      },
      { status: 500 },
    );
  }
}
