// src/utils/validate.ts
import type { Track, AnswerMap } from "@/lib/eligibility/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/;
const TRACKS: readonly Track[] = ["residency", "citizenship", "corporate", "skilled"] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && Object.prototype.toString.call(v) === "[object Object]";
}

export function validateSubmission(body: any): { ok: boolean; error?: string } {
  if (!isPlainObject(body)) return { ok: false, error: "Invalid payload" };

  const name = String(body.name ?? "").replace(/\s+/g, " ").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const track = body.track as Track | undefined;
  const answers = (body.answers ?? null) as AnswerMap | null;
  const phoneRaw = body.phone != null ? String(body.phone) : "";

  // name
  if (!name || name.length < 2) return { ok: false, error: "Name is required" };
  if (name.length > 120) return { ok: false, error: "Name is too long" };

  // email
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "Valid email is required" };
  if (email.length > 254) return { ok: false, error: "Email is too long" };

  // optional phone
  const phone = phoneRaw.trim();
  if (phone && !PHONE_RE.test(phone)) {
    return { ok: false, error: "Please enter a valid phone number" };
  }

  // track
  if (!track || !(TRACKS as readonly string[]).includes(track)) {
    return { ok: false, error: "Invalid track" };
  }

  // answers
  if (!isPlainObject(answers)) return { ok: false, error: "Answers missing" };
  const keys = Object.keys(answers);
  if (keys.length === 0) return { ok: false, error: "Answers missing" };

  // very large payloads → reject (basic abuse guard)
  try {
    const approxSize = JSON.stringify(answers).length;
    if (approxSize > 50_000) return { ok: false, error: "Answers payload too large" };
  } catch {
    return { ok: false, error: "Answers payload invalid" };
  }

  return { ok: true };
}

export { EMAIL_RE, PHONE_RE };
