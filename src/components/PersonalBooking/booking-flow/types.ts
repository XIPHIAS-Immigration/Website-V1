"use client";

export type BookingPlan = "free" | "paid";

export type BookingStep = "plan" | "calendar" | "details" | "review" | "done";

export interface BookingInput {
  plan: BookingPlan;
  durationMin: number;               // e.g. 15 or 60
  priceCents: number;                // 0 for free
  timezone: string;                  // IANA TZ
  dateISO?: string;                  // YYYY-MM-DD
  timeISO?: string;                  // HH:mm
  fullName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface BookingDraft {
  id: string;
  paymentRequired: boolean;
  amountCents: number;
}

export interface CheckoutSession {
  url: string;                       // redirect URL to your gateway
}
