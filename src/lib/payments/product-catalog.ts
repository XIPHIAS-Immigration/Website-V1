// Single source of truth for paid products sold through the JioPay gateway.
//
// Used by:
//  - create-checkout: to enforce price server-side (clients cannot tamper amounts)
//    and to gate staff-only custom links.
//  - payment fulfillment: to decide which report to generate / how to fulfil.
//
// Keep this module dependency-light (no "server-only", no puppeteer/fs imports) so it
// can be safely imported from both API routes and shared libs. Prices are in INR and
// are intended to be edited here in one place.

export type FulfillmentKind = "report" | "registration" | "custom";

// Distinct report templates — one per product surface (see Phase 2 report builders).
export type ReportKind =
  | "premium_strategy" // Eligibility flagship — Personal Immigration Strategy Report
  | "route" // Route Intelligence
  | "deep_analysis" // Deep Analysis (high-skill profile)
  | "us_visa" // US Visa Intelligence
  | "cost" // Cost Estimator
  | "compare" // Compare Programs
  | "docs"; // Document Readiness

export type ProductConfig = {
  productType: string;
  /** Default product/display name (a request may override with a nicer, contextual label). */
  label: string;
  /** Fixed, server-enforced price in INR. Ignored for products where the amount is per-request (custom links). */
  priceInr: number;
  fulfillment: FulfillmentKind;
  reportKind?: ReportKind;
  /** Only staff/admin may create checkouts for this product (arbitrary-amount links). */
  requiresStaff?: boolean;
  /** Email subject used when the report/receipt is delivered. */
  emailSubject: string;
  /** Slug used to build the delivered PDF filename. */
  fileSlug: string;
};

// ── Test-price mode (env-toggled, no code change to flip) ────────────────────
// For end-to-end JioPay + PDF testing in production, set in the environment:
//   REPORTS_TEST_PRICING=true        → every catalog product is charged the test price
//   REPORTS_TEST_PRICE_INR=2         → the test amount (optional; default 2)
// IMPORTANT: JioPay rejects amounts below ₹2.00 (error P1006), so the test price is
// floored at ₹2 even if a lower value (e.g. 1) is configured. Set REPORTS_TEST_PRICING
// to false (or remove it) to restore the real prices before going live.
const TEST_MODE = /^(1|true|yes|on)$/i.test(process.env.REPORTS_TEST_PRICING ?? "");
const TEST_PRICE_INR = Math.max(2, Math.round(Number(process.env.REPORTS_TEST_PRICE_INR) || 2));
function priceOf(real: number): number {
  return TEST_MODE ? TEST_PRICE_INR : real;
}

/** Whether catalog prices are currently overridden to the test amount (for diagnostics/UI). */
export const IS_TEST_PRICING = TEST_MODE;

export const PRODUCT_CATALOG: Record<string, ProductConfig> = {
  premium_report: {
    productType: "premium_report",
    label: "XIPHIAS Personal Immigration Strategy Report",
    priceInr: priceOf(5000),
    fulfillment: "report",
    reportKind: "premium_strategy",
    emailSubject: "Your XIPHIAS Personal Immigration Strategy Report",
    fileSlug: "Personal-Immigration-Strategy-Report",
  },
  route_report: {
    productType: "route_report",
    label: "XIPHIAS Route Intelligence Report",
    priceInr: priceOf(1999),
    fulfillment: "report",
    reportKind: "route",
    emailSubject: "Your XIPHIAS Route Intelligence Report",
    fileSlug: "Route-Intelligence-Report",
  },
  deep_analysis_report: {
    productType: "deep_analysis_report",
    label: "XIPHIAS High-Skill Deep Analysis Report",
    priceInr: priceOf(3999),
    fulfillment: "report",
    reportKind: "deep_analysis",
    emailSubject: "Your XIPHIAS High-Skill Deep Analysis Report",
    fileSlug: "Deep-Analysis-Report",
  },
  us_visa_report: {
    productType: "us_visa_report",
    label: "XIPHIAS US Visa Strategy Report",
    priceInr: priceOf(4999),
    fulfillment: "report",
    reportKind: "us_visa",
    emailSubject: "Your XIPHIAS US Visa Strategy Report",
    fileSlug: "US-Visa-Strategy-Report",
  },
  cost_report: {
    productType: "cost_report",
    label: "XIPHIAS Cost & Budget Report",
    priceInr: priceOf(499),
    fulfillment: "report",
    reportKind: "cost",
    emailSubject: "Your XIPHIAS Cost & Budget Report",
    fileSlug: "Cost-Budget-Report",
  },
  compare_report: {
    productType: "compare_report",
    label: "XIPHIAS Programme Comparison Report",
    priceInr: priceOf(199),
    fulfillment: "report",
    reportKind: "compare",
    emailSubject: "Your XIPHIAS Programme Comparison Report",
    fileSlug: "Programme-Comparison-Report",
  },
  docs_report: {
    productType: "docs_report",
    label: "XIPHIAS Document Readiness Report",
    priceInr: priceOf(199),
    fulfillment: "report",
    reportKind: "docs",
    emailSubject: "Your XIPHIAS Document Readiness Report",
    fileSlug: "Document-Readiness-Report",
  },
  // Full X-Hub onboarding (legacy paid-registration flow). Fixed price closes the
  // arbitrary-amount tampering vector; adjust here if registration pricing changes.
  registration: {
    productType: "registration",
    label: "XIPHIAS Registration",
    priceInr: priceOf(10000),
    fulfillment: "registration",
    emailSubject: "Your X-Hub registration is ready",
    fileSlug: "Registration",
  },
  // Staff-created custom-amount links (X-Hub admin console). Amount comes from the request
  // and is only honoured when the caller is an authenticated staff/admin portal user.
  custom_payment: {
    productType: "custom_payment",
    label: "XIPHIAS custom payment",
    priceInr: 0,
    fulfillment: "custom",
    requiresStaff: true,
    emailSubject: "XIPHIAS payment confirmation",
    fileSlug: "Custom-Payment",
  },
};

export function getProductConfig(productType?: string | null): ProductConfig | undefined {
  if (!productType) return undefined;
  return PRODUCT_CATALOG[productType];
}

export function isReportProduct(productType?: string | null): boolean {
  return getProductConfig(productType)?.fulfillment === "report";
}

export type PriceResolution =
  | { ok: true; amountInr: number; enforced: boolean; config: ProductConfig }
  | { ok: false; reason: "unknown_product" | "staff_required" | "invalid_amount" };

/**
 * Resolve the amount to charge for a checkout.
 *  - Fixed-price catalog products: the server price is authoritative; any client-supplied
 *    amount is ignored. This prevents price tampering on public buttons (e.g. ₹5,000 → ₹1).
 *  - custom_payment: uses the per-request amount (must be > 0) and requires staff auth.
 *  - Unknown products are rejected outright (no arbitrary public products).
 */
export function resolveCheckoutPrice(
  productType: string | undefined,
  requestedAmountInr: number | undefined,
  opts: { isStaff: boolean },
): PriceResolution {
  const config = getProductConfig(productType);
  if (!config) return { ok: false, reason: "unknown_product" };

  if (config.requiresStaff) {
    if (!opts.isStaff) return { ok: false, reason: "staff_required" };
    const amount = Number(requestedAmountInr);
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "invalid_amount" };
    return { ok: true, amountInr: Math.round(amount * 100) / 100, enforced: false, config };
  }

  return { ok: true, amountInr: config.priceInr, enforced: true, config };
}
