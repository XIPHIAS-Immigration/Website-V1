"use client";
import type {
  BookingBackendAdapter, AvailabilityResp, DraftResp,
  RazorpayOrderInit, ConfirmResp, BookingInput
} from "./adapter";

const delay = (ms:number)=>new Promise(res=>setTimeout(res,ms));

export const mockAdapter: BookingBackendAdapter = {
  async getAvailability(dateISO, tz): Promise<AvailabilityResp> {
    return {
      dateISO, timezone: tz,
      slots: ["09:00","11:00","14:00","17:00"].map((t,i)=>({ timeISO:t, status: i===1?"booked":"free" }))
    };
  },
  async createDraft(input: BookingInput): Promise<DraftResp> {
    await delay(300);
    return {
      id: `bk_${Date.now()}`,
      paymentRequired: input.priceCents > 0,
      amountCents: input.priceCents,
      holdExpiresAt: new Date(Date.now()+10*60*1000).toISOString(),
    };
  },
  async createRazorpayOrder(bookingId: string): Promise<RazorpayOrderInit> {
    await delay(200);
    return {
      keyId: "rzp_test_xxx",
      orderId: `order_${Date.now()}`,
      amount: 1250000,
      currency: "INR",
      customer: { name: "Guest", email: "guest@example.com" },
      notes: { bookingId },
    };
  },
  async verifyPayment() { await delay(200); return { ok: true }; },
  async confirm(bookingId: string): Promise<ConfirmResp> {
    await delay(300);
    return { ok: true, reference: bookingId, joinUrl: "https://meet.example.com/xyz", icsUrl: "/mock.ics" };
  },
};
