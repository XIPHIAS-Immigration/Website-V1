import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getJiopayStorePath } from "@/lib/payments/jiopay-store";
import {
  CONSULTATION_DAYS_AHEAD,
  CONSULTATION_DURATION_MINUTES,
  CONSULTATION_HOLD_MINUTES,
  CONSULTATION_SLOT_TIMES,
  CONSULTATION_TIMEZONE,
  CONSULTATION_WORKING_DAYS,
  addIsoDays,
  consultationDateRange,
  consultationWeekday,
  validateConsultationSlot,
} from "@/lib/consultations/config";

export type ConsultationBookingStatus =
  | "held"
  | "confirmed"
  | "released"
  | "conflict";

export type ConsultationBooking = {
  reference: string;
  status: ConsultationBookingStatus;
  dateISO: string;
  timeISO: string;
  timezone: string;
  durationMinutes: number;
  holdExpiresAt: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  country?: string;
  focus?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  releaseReason?: string;
  emailStatus?: string;
};

type ConsultationStore = { bookings: ConsultationBooking[] };

function storePath() {
  if (process.env.CONSULTATION_STORE_PATH) {
    return path.resolve(process.env.CONSULTATION_STORE_PATH);
  }
  return path.join(path.dirname(getJiopayStorePath()), "consultation-bookings.json");
}

function readStore(): ConsultationStore {
  try {
    const target = storePath();
    if (!existsSync(target)) return { bookings: [] };
    const parsed = JSON.parse(readFileSync(target, "utf8")) as Partial<ConsultationStore>;
    return { bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [] };
  } catch (error) {
    console.warn("[consultations] Could not read booking store.", error);
    return { bookings: [] };
  }
}

function writeStore(store: ConsultationStore) {
  const target = storePath();
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(store, null, 2));
}

function nowIso(now = new Date()) {
  return now.toISOString();
}

function blocksSlot(booking: ConsultationBooking, now: Date) {
  if (booking.status === "confirmed") return true;
  return booking.status === "held" && Date.parse(booking.holdExpiresAt) > now.getTime();
}

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function getConsultationBooking(reference: string) {
  return readStore().bookings.find((booking) => booking.reference === reference.trim()) || null;
}

export function holdConsultationSlot(args: {
  reference: string;
  dateISO: string;
  timeISO: string;
  customer: { name: string; email: string; phone?: string };
  country?: string;
  focus?: string;
  notes?: string;
  now?: Date;
}) {
  const now = args.now || new Date();
  const validation = validateConsultationSlot(args.dateISO, args.timeISO, now);
  if (!validation.ok) return { ok: false as const, reason: validation.reason };

  const store = readStore();
  const occupied = store.bookings.some(
    (booking) =>
      booking.reference !== args.reference &&
      booking.dateISO === args.dateISO &&
      booking.timeISO === args.timeISO &&
      blocksSlot(booking, now),
  );
  if (occupied) return { ok: false as const, reason: "slot_unavailable" };

  const timestamp = nowIso(now);
  const booking: ConsultationBooking = {
    reference: clean(args.reference, 100),
    status: "held",
    dateISO: args.dateISO,
    timeISO: args.timeISO,
    timezone: CONSULTATION_TIMEZONE,
    durationMinutes: CONSULTATION_DURATION_MINUTES,
    holdExpiresAt: new Date(now.getTime() + CONSULTATION_HOLD_MINUTES * 60_000).toISOString(),
    customer: {
      name: clean(args.customer.name, 120),
      email: clean(args.customer.email, 180).toLowerCase(),
      phone: clean(args.customer.phone, 40) || undefined,
    },
    country: clean(args.country, 80) || undefined,
    focus: clean(args.focus, 140) || undefined,
    notes: clean(args.notes, 1_000) || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const existing = store.bookings.findIndex((item) => item.reference === booking.reference);
  if (existing >= 0) store.bookings[existing] = booking;
  else store.bookings.unshift(booking);
  writeStore(store);
  return { ok: true as const, booking };
}

export function releaseConsultationSlot(reference: string, reason: string) {
  const store = readStore();
  const booking = store.bookings.find((item) => item.reference === reference.trim());
  if (!booking || booking.status === "confirmed") return booking || null;
  booking.status = "released";
  booking.releaseReason = clean(reason, 160);
  booking.updatedAt = nowIso();
  writeStore(store);
  return booking;
}

export function confirmConsultationSlot(reference: string, now = new Date()) {
  const store = readStore();
  const booking = store.bookings.find((item) => item.reference === reference.trim());
  if (!booking) return { ok: false as const, reason: "missing_booking" };
  if (booking.status === "confirmed") return { ok: true as const, booking, alreadyConfirmed: true };

  const conflict = store.bookings.some(
    (item) =>
      item.reference !== booking.reference &&
      item.dateISO === booking.dateISO &&
      item.timeISO === booking.timeISO &&
      blocksSlot(item, now),
  );
  if (conflict) {
    booking.status = "conflict";
    booking.updatedAt = nowIso(now);
    writeStore(store);
    return { ok: false as const, reason: "slot_conflict", booking };
  }

  booking.status = "confirmed";
  booking.confirmedAt = nowIso(now);
  booking.updatedAt = booking.confirmedAt;
  writeStore(store);
  return { ok: true as const, booking, alreadyConfirmed: false };
}

export function updateConsultationEmailStatus(reference: string, emailStatus: string) {
  const store = readStore();
  const booking = store.bookings.find((item) => item.reference === reference.trim());
  if (!booking) return null;
  booking.emailStatus = clean(emailStatus, 240);
  booking.updatedAt = nowIso();
  writeStore(store);
  return booking;
}

export function getConsultationAvailability(now = new Date()) {
  const store = readStore();
  const range = consultationDateRange(now);
  const days = Array.from({ length: CONSULTATION_DAYS_AHEAD }, (_, index) => addIsoDays(range.first, index))
    .filter((dateISO) => CONSULTATION_WORKING_DAYS.includes(consultationWeekday(dateISO)))
    .map((dateISO) => ({
      dateISO,
      slots: CONSULTATION_SLOT_TIMES.map((timeISO) => {
        const booking = store.bookings.find(
          (item) => item.dateISO === dateISO && item.timeISO === timeISO && blocksSlot(item, now),
        );
        return {
          timeISO,
          status: booking?.status === "confirmed" ? ("booked" as const) : booking ? ("held" as const) : ("available" as const),
        };
      }),
    }));

  return {
    timezone: CONSULTATION_TIMEZONE,
    durationMinutes: CONSULTATION_DURATION_MINUTES,
    holdMinutes: CONSULTATION_HOLD_MINUTES,
    firstDate: range.first,
    lastDate: range.last,
    days,
  };
}

