"use client";

/** Shared types (single source of truth) */
export type SlotStatus = "free" | "held" | "booked";
export type Currency = "INR";
export type BookingPlan = "free" | "paid";

export type BookingInput = {
  plan: BookingPlan;
  durationMin: number;
  priceCents: number;
  timezone: string;
  dateISO: string;   // YYYY-MM-DD
  timeISO: string;   // HH:mm
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
};

export type AvailabilityResp = {
  dateISO: string;
  timezone: string;
  slots: { timeISO: string; status: SlotStatus }[];
};

export type DraftResp = {
  id: string;
  paymentRequired: boolean;
  amountCents: number;
  holdExpiresAt?: string;
};

export type RazorpayOrderInit = {
  keyId: string;
  orderId: string;
  amount: number; // paise
  currency: Currency;
  customer: { name: string; email: string; contact?: string };
  notes?: Record<string, string>;
};

export type ConfirmResp = {
  ok: true;
  reference: string;
  joinUrl?: string;
  icsUrl?: string;
};

/** Backend adapter contract — backend dev only needs these endpoints */
export interface BookingBackendAdapter {
  getAvailability(dateISO: string, tz: string): Promise<AvailabilityResp>;
  createDraft(input: BookingInput): Promise<DraftResp>;
  createRazorpayOrder(bookingId: string): Promise<RazorpayOrderInit>;
  verifyPayment(bookingId: string, args: {
    orderId: string; paymentId: string; signature: string;
  }): Promise<{ ok: true }>;
  confirm(bookingId: string): Promise<ConfirmResp>;
}
