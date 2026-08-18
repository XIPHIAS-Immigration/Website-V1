import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("senior consultation price is fixed in the server product catalogue", () => {
  const catalog = read("src/lib/payments/product-catalog.ts");
  assert.match(catalog, /senior_consultation:\s*\{/);
  assert.match(catalog, /priceInr:\s*priceOf\(25000\)/);
  assert.match(catalog, /fulfillment:\s*["']consultation["']/);
});

test("consultation checkout holds a validated slot before opening JioPay", () => {
  const checkout = read("src/app/api/payments/jiopay/create-checkout/route.ts");
  assert.match(checkout, /holdConsultationSlot\(\{/);
  assert.match(checkout, /slot_unavailable/);
  assert.match(checkout, /releaseConsultationSlot\(consultationReference/);
  assert.match(checkout, /initiateJiopaySale/);
});

test("verified consultation payments confirm the booking and send calendar email", () => {
  const fulfillment = read("src/lib/payments/fulfillment.ts");
  const confirmation = read("src/lib/consultations/confirmation.ts");
  assert.match(fulfillment, /confirmConsultationSlot\(order\.merchantTxnNo\)/);
  assert.match(fulfillment, /consultation_confirmed/);
  assert.match(fulfillment, /consultationCalendarAttachment/);
  assert.match(confirmation, /BEGIN:VCALENDAR/);
  assert.match(confirmation, /text\/calendar|calendar file is attached/i);
});

test("public consultation links remain on the XIPHIAS scheduler", () => {
  const routes = read("src/lib/topmate.ts");
  const bookingPage = read("src/app/(site)/booking/page.tsx");
  assert.match(routes, /BOOKING_ROUTE\s*=\s*["']\/personal-booking#schedule["']/);
  assert.match(bookingPage, /redirect\(["']\/personal-booking#schedule["']\)/);
  assert.doesNotMatch(routes, /TOPMATE_BOOKING_URL\s*=\s*\n?\s*process\.env/);
});

test("booking interface contains calendar, required intake and JioPay handoff", () => {
  const client = read("src/components/PersonalBooking/ConsultationBookingClient.tsx");
  assert.match(client, /Choose your date and time/);
  assert.match(client, /Country of residence/);
  assert.match(client, /Primary discussion area/);
  assert.match(client, /productType:\s*["']senior_consultation["']/);
  assert.match(client, /Pay \{formatPrice\(priceInr\)\} with JioPay/);
});

test("the generic enquiry popup does not interrupt the paid scheduler", () => {
  const popup = read("src/components/QuickEnquiryPopup.tsx");
  assert.match(popup, /p\.startsWith\(["']\/personal-booking["']\)/);
});
