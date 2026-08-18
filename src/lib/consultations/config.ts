export const CONSULTATION_PRODUCT_TYPE = "senior_consultation";

export const CONSULTATION_TIMEZONE =
  process.env.CONSULTATION_TIMEZONE?.trim() || "Asia/Kolkata";

export const CONSULTATION_DURATION_MINUTES = Math.max(
  30,
  Math.min(180, Number(process.env.CONSULTATION_DURATION_MINUTES) || 60),
);

export const CONSULTATION_DAYS_AHEAD = Math.max(
  7,
  Math.min(90, Number(process.env.CONSULTATION_DAYS_AHEAD) || 45),
);

export const CONSULTATION_HOLD_MINUTES = Math.max(
  10,
  Math.min(60, Number(process.env.CONSULTATION_HOLD_MINUTES) || 25),
);

function numberList(value: string | undefined, fallback: number[]) {
  const parsed = (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item));
  return parsed.length ? parsed : fallback;
}

function timeList(value: string | undefined) {
  const parsed = (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^([01]\d|2[0-3]):[0-5]\d$/.test(item));
  return parsed.length ? [...new Set(parsed)].sort() : ["10:00", "11:30", "14:30", "16:00"];
}

export const CONSULTATION_WORKING_DAYS = numberList(
  process.env.CONSULTATION_WORKING_DAYS,
  [1, 2, 3, 4, 5, 6],
).filter((day) => day >= 0 && day <= 6);

export const CONSULTATION_SLOT_TIMES = timeList(process.env.CONSULTATION_SLOT_TIMES);

export function addIsoDays(dateISO: string, days: number) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

export function todayInConsultationTimezone(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONSULTATION_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function consultationWeekday(dateISO: string) {
  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
}

export function consultationDateRange(now = new Date()) {
  const today = todayInConsultationTimezone(now);
  return {
    first: addIsoDays(today, 1),
    last: addIsoDays(today, CONSULTATION_DAYS_AHEAD),
  };
}

export function validateConsultationSlot(dateISO: string, timeISO: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !CONSULTATION_SLOT_TIMES.includes(timeISO)) {
    return { ok: false as const, reason: "invalid_slot" };
  }
  const range = consultationDateRange(now);
  if (dateISO < range.first || dateISO > range.last) {
    return { ok: false as const, reason: "outside_booking_window" };
  }
  if (!CONSULTATION_WORKING_DAYS.includes(consultationWeekday(dateISO))) {
    return { ok: false as const, reason: "closed_day" };
  }
  return { ok: true as const };
}
