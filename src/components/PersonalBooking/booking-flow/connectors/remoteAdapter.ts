// src/components/PersonalBooking/booking-flow/connectors/remoteAdapter.ts
"use client";

import type {
  BookingBackendAdapter,
  AvailabilityResp,
  DraftResp,
  RazorpayOrderInit,
  ConfirmResp,
  BookingInput,
} from "./adapter";

/**
 * BACKEND TODO:
 * Implement these endpoints server-side and then switch env:
 *   NEXT_PUBLIC_BOOKING_ADAPTER=remote
 *   NEXT_PUBLIC_BOOKING_API_BASE=https://api.yourdomain.com
 */
const BASE = process.env.NEXT_PUBLIC_BOOKING_API_BASE ?? "/api";

/** Accepts a Response OR a Promise<Response> and returns parsed JSON with errors surfaced. */
async function j<T>(resOrPromise: Response | Promise<Response>): Promise<T> {
  const res = await resOrPromise;
  if (!res.ok) {
    let msg = "";
    try {
      msg = await res.text();
    } catch {}
    throw new Error(`API ${res.status}: ${msg || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const remoteAdapter: BookingBackendAdapter = {
  getAvailability(dateISO, tz) {
    return j<AvailabilityResp>(
      fetch(
        `${BASE}/availability?date=${encodeURIComponent(
          dateISO
        )}&tz=${encodeURIComponent(tz)}`,
        { cache: "no-store" }
      )
    );
  },

  createDraft(input: BookingInput) {
    return j<DraftResp>(
      fetch(`${BASE}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },

  createRazorpayOrder(bookingId: string) {
    return j<RazorpayOrderInit>(
      fetch(`${BASE}/payments/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
    );
  },

  verifyPayment(bookingId, args) {
    return j<{ ok: true }>(
      fetch(`${BASE}/payments/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, ...args }),
      })
    );
  },

  confirm(bookingId) {
    return j<ConfirmResp>(
      fetch(`${BASE}/bookings/${encodeURIComponent(bookingId)}/confirm`, {
        method: "POST",
      })
    );
  },
};
