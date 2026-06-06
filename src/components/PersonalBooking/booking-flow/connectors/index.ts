"use client";

import type { BookingInput, ConfirmResp } from "./adapter";
import { mockAdapter } from "./mockAdapter";
import { remoteAdapter } from "./remoteAdapter";
import { openRazorpayCheckout } from "./razorpay";

/** Switch mock <-> remote via env var (no UI changes) */
const ADAPTER = (process.env.NEXT_PUBLIC_BOOKING_ADAPTER ?? "mock") === "remote"
  ? remoteAdapter
  : mockAdapter;

/** Expose to calendar to disable non-free slots */
export const getAvailability = ADAPTER.getAvailability;

/** Single function the UI calls on Review step */
export async function bookAndMaybePay(input: BookingInput): Promise<ConfirmResp> {
  // 1) hold slot
  const draft = await ADAPTER.createDraft(input);

  // 2) paid → order, checkout, verify
  if (draft.paymentRequired) {
    const init = await ADAPTER.createRazorpayOrder(draft.id);
    const proof = await openRazorpayCheckout(init);
    await ADAPTER.verifyPayment(draft.id, proof);
  }

  // 3) confirm (server will email, calendar, CRM)
  return ADAPTER.confirm(draft.id);
}

export type { BookingInput } from "./adapter";