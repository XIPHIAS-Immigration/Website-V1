import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser } from "@/lib/platform/auth";
import type { JiopayOrder } from "@/lib/payments/jiopay-store";
import { getProductConfig } from "@/lib/payments/product-catalog";
import { generateReportPdf } from "@/lib/payments/report-router";
import { setRenderPngPage, setRenderProbe, setRenderPngScale } from "@/lib/reports/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Visual QA endpoint for paid report templates. Renders a sample report for any product
// from query params and returns it inline as a PDF.
//   /api/platform/admin/report-preview?product=route_report&country=Canada&track=residency
// Gated to staff/admin in production; open in non-production for local design review.

function buildSampleOrder(sp: URLSearchParams, productType: string, label: string, amountInr: number): JiopayOrder {
  const now = new Date().toISOString();
  // Pass every query param through into answers so any report can be richly customised
  // for QA, then layer in sensible defaults for the common fields.
  const answers: Record<string, string> = {};
  for (const [k, v] of sp.entries()) answers[k] = v;
  const withDefault = (k: string, d: string) => {
    if (!answers[k]) answers[k] = d;
  };
  withDefault("goal", "pr");
  withDefault("profile", "professional");
  withDefault("budget", "200000");
  withDefault("timeline", "12");
  withDefault("family", "true");
  withDefault("presence", "any");
  withDefault("priority", "stability");
  withDefault("notes", "Sample preview order for report design QA.");
  const targetCountries = (sp.get("targetCountries") || "").split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);
  const selectedProgrammes = (sp.get("selectedProgrammes") || "").split(/[,|;\n]+/).map((item) => item.trim()).filter(Boolean);

  return {
    merchantTxnNo: sp.get("ref") || "PREVIEW-0001",
    amountInr,
    productType,
    productName: label,
    customer: {
      name: sp.get("name") || "Sample Client",
      email: sp.get("email") || "preview@xiphias.in",
      phone: sp.get("phone") || undefined,
    },
    track: sp.get("track") || undefined,
    country: sp.get("country") || targetCountries[0] || undefined,
    program: sp.get("program") || selectedProgrammes[0] || undefined,
    answers,
    status: "paid",
    createdAt: now,
    updatedAt: now,
    events: [],
  };
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentPortalUser();
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
  }

  const sp = req.nextUrl.searchParams;
  const productType = sp.get("product") || "route_report";
  const config = getProductConfig(productType);
  if (!config?.reportKind) {
    return NextResponse.json({ ok: false, error: `No report template for product "${productType}".` }, { status: 400 });
  }

  const pngParam = sp.get("png");
  const asPng = pngParam != null;
  const asProbe = sp.get("probe") != null;
  try {
    const order = buildSampleOrder(sp, productType, config.label, config.priceInr);
    if (asProbe) setRenderProbe(true);
    else if (asPng) {
      setRenderPngPage(Number(pngParam) || 0);
      const dsf = sp.get("dsf");
      if (dsf) setRenderPngScale(Number(dsf) || 2);
    }
    const out = await generateReportPdf(config.reportKind, order);
    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": asProbe ? "application/json" : asPng ? "image/png" : "application/pdf",
        "Content-Disposition": `inline; filename="preview-${config.reportKind}.${asProbe ? "json" : asPng ? "png" : "pdf"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Report preview failed." },
      { status: 500 },
    );
  } finally {
    setRenderPngPage(null);
    setRenderProbe(false);
  }
}
