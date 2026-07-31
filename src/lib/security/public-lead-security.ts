import { createHash } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server.js";

type LeadSecurityInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  honeypot?: unknown;
  turnstileToken?: unknown;
  startedAt?: unknown;
  extra?: unknown[];
};

type GuardOptions = {
  endpoint: string;
  requireTurnstile?: boolean;
  ipLimit?: number;
  contactLimit?: number;
  duplicateWindowMs?: number;
};

type SecurityState = {
  buckets: Record<string, number[]>;
  fingerprints: Record<string, number>;
};

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

type CrmMirrorDecision =
  | { ok: true }
  | { ok: false; reason: string };

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * ONE_HOUR;
const MAX_STATE_KEYS = 5_000;

function clean(value: unknown, max = 2_000) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function getClientIp(req: Request) {
  return clean(
    req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown",
    100,
  );
}

function securityHash(value: string) {
  const salt =
    process.env.LEAD_SECURITY_HASH_SALT ||
    process.env.NEXTAUTH_SECRET ||
    "xiphias-public-lead-security";
  return createHash("sha256").update(`${salt}:${value.toLowerCase()}`).digest("hex").slice(0, 32);
}

function statePath() {
  if (process.env.LEAD_SECURITY_STORE_PATH) {
    return path.resolve(process.env.LEAD_SECURITY_STORE_PATH);
  }
  return path.join(process.cwd(), ".xiphias-platform", "lead-security.json");
}

function auditPath() {
  return path.join(path.dirname(statePath()), "lead-security-events.ndjson");
}

function emptyState(): SecurityState {
  return { buckets: {}, fingerprints: {} };
}

function loadState(): SecurityState {
  if (process.env.LEAD_SECURITY_STORAGE === "memory") return emptyState();
  try {
    if (!existsSync(statePath())) return emptyState();
    const parsed = JSON.parse(readFileSync(statePath(), "utf8")) as Partial<SecurityState>;
    return {
      buckets: parsed.buckets && typeof parsed.buckets === "object" ? parsed.buckets : {},
      fingerprints:
        parsed.fingerprints && typeof parsed.fingerprints === "object" ? parsed.fingerprints : {},
    };
  } catch {
    return emptyState();
  }
}

const globalSecurity = globalThis as typeof globalThis & {
  __xiphiasLeadSecurityState?: SecurityState;
};

function getState() {
  globalSecurity.__xiphiasLeadSecurityState ??= loadState();
  return globalSecurity.__xiphiasLeadSecurityState;
}

function pruneState(state: SecurityState, now: number) {
  for (const [key, values] of Object.entries(state.buckets)) {
    const current = values.filter((timestamp) => now - timestamp <= ONE_DAY);
    if (current.length) state.buckets[key] = current;
    else delete state.buckets[key];
  }
  for (const [key, timestamp] of Object.entries(state.fingerprints)) {
    if (now - timestamp > ONE_DAY) delete state.fingerprints[key];
  }

  const bucketKeys = Object.keys(state.buckets);
  if (bucketKeys.length > MAX_STATE_KEYS) {
    for (const key of bucketKeys.slice(0, bucketKeys.length - MAX_STATE_KEYS)) delete state.buckets[key];
  }
  const fingerprintKeys = Object.keys(state.fingerprints);
  if (fingerprintKeys.length > MAX_STATE_KEYS) {
    for (const key of fingerprintKeys.slice(0, fingerprintKeys.length - MAX_STATE_KEYS)) {
      delete state.fingerprints[key];
    }
  }
}

function persistState(state: SecurityState) {
  if (process.env.LEAD_SECURITY_STORAGE === "memory") return;
  try {
    const target = statePath();
    mkdirSync(path.dirname(target), { recursive: true });
    const temporary = `${target}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify(state));
    renameSync(temporary, target);
  } catch (error) {
    console.warn("[lead-security] Could not persist rate-limit state.", error);
  }
}

function auditSecurityEvent(event: Record<string, unknown>) {
  const payload = JSON.stringify({ at: new Date().toISOString(), ...event });
  console.warn("[lead-security]", payload);
  if (process.env.LEAD_SECURITY_STORAGE === "memory") return;
  try {
    mkdirSync(path.dirname(auditPath()), { recursive: true });
    appendFileSync(auditPath(), `${payload}\n`);
  } catch (error) {
    console.warn("[lead-security] Could not write security audit event.", error);
  }
}

function claimRateLimit(key: string, limit: number, windowMs: number, now: number) {
  const state = getState();
  const recent = (state.buckets[key] || []).filter((timestamp) => now - timestamp <= windowMs);
  recent.push(now);
  state.buckets[key] = recent;
  return recent.length <= limit;
}

function claimFingerprint(key: string, windowMs: number, now: number) {
  const state = getState();
  const previous = state.fingerprints[key];
  state.fingerprints[key] = now;
  return !previous || now - previous > windowMs;
}

function countLinks(value: string) {
  return (value.match(/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|xyz|top|click)\b)/gi) || [])
    .length;
}

export function findLeadSpamSignals(input: LeadSecurityInput) {
  const name = clean(input.name, 160);
  const email = clean(input.email, 180).toLowerCase();
  const message = [clean(input.message, 4_000), ...(input.extra || []).map((item) => clean(item, 1_000))]
    .filter(Boolean)
    .join(" ");
  const reasons: string[] = [];
  let score = 0;

  if (clean(input.honeypot, 200)) {
    reasons.push("honeypot");
    score += 10;
  }

  const localPart = email.split("@")[0] || "";
  const localSegments = localPart.split(/[._-]+/).filter(Boolean);
  const shortSegments = localSegments.filter((part) => part.length <= 2).length;
  if (localSegments.length >= 6 && shortSegments >= 3) {
    reasons.push("fragmented-email");
    score += 3;
  }

  const letters = name.toLowerCase().replace(/[^a-z]/g, "");
  const words = name.split(/\s+/).filter(Boolean);
  const vowels = (letters.match(/[aeiou]/g) || []).length;
  if (words.length >= 2 && letters.length >= 12 && vowels / Math.max(letters.length, 1) < 0.2) {
    reasons.push("unlikely-name");
    score += 2;
  }

  if (/(.)\1{5,}/i.test(`${name} ${message}`)) {
    reasons.push("repeated-characters");
    score += 3;
  }

  if (countLinks(message) >= 3 || /\[(?:url|link)=|<a\s+href=/i.test(message)) {
    reasons.push("excessive-links");
    score += 4;
  }

  if (/\b(?:viagra|casino bonus|crypto giveaway|guest post service|seo backlinks?)\b/i.test(message)) {
    reasons.push("known-spam-phrase");
    score += 5;
  }

  const startedAt = Number(input.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < 1_200) {
    reasons.push("submitted-too-fast");
    // Autofill and password managers can make a real submission very fast.
    // Treat timing only as a supporting signal, never a standalone rejection.
    score += 1;
  }

  return { score, reasons };
}

function expectedOrigins(req: Request) {
  const configured = (process.env.LEAD_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (siteUrl) configured.push(siteUrl.replace(/\/$/, ""));

  const host = clean(req.headers.get("x-forwarded-host") || req.headers.get("host"), 200);
  if (host) {
    configured.push(`https://${host}`, `http://${host}`);
  }
  return new Set(configured);
}

function hasAllowedOrigin(req: Request) {
  const origin = clean(req.headers.get("origin"), 300).replace(/\/$/, "");
  if (!origin) return true;
  return expectedOrigins(req).has(origin);
}

async function verifyTurnstile(req: Request, token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true as const };
  if (!token) return { ok: false as const, reason: "missing-turnstile-token" };

  try {
    const body = new URLSearchParams({
      secret,
      response: token.slice(0, 2_048),
      remoteip: getClientIp(req),
    });
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8_000),
    });
    const result = (await response.json()) as TurnstileResponse;
    if (!response.ok || !result.success) {
      return { ok: false as const, reason: result["error-codes"]?.join(",") || "turnstile-failed" };
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: "turnstile-unavailable", unavailable: true };
  }
}

function filteredResponse() {
  return NextResponse.json(
    { ok: true, filtered: true },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}

export async function protectPublicLead(
  req: Request,
  input: LeadSecurityInput,
  options: GuardOptions,
) {
  const now = Date.now();
  const ipHash = securityHash(getClientIp(req));
  const endpoint = clean(options.endpoint, 100) || "unknown";
  const email = clean(input.email, 180).toLowerCase();
  const phone = clean(input.phone, 80).replace(/\D/g, "");
  const contact = email || phone;
  const message = clean(input.message, 4_000);

  if (!hasAllowedOrigin(req)) {
    auditSecurityEvent({ endpoint, outcome: "blocked", reason: "origin", ipHash });
    return NextResponse.json({ ok: false, error: "Invalid submission origin." }, { status: 403 });
  }

  const signals = findLeadSpamSignals(input);
  if (signals.score >= 4) {
    auditSecurityEvent({ endpoint, outcome: "filtered", reasons: signals.reasons, ipHash });
    return filteredResponse();
  }

  if (options.requireTurnstile && process.env.TURNSTILE_SECRET_KEY) {
    const token = clean(input.turnstileToken, 2_048);
    const turnstile = await verifyTurnstile(req, token);
    if (!turnstile.ok) {
      auditSecurityEvent({ endpoint, outcome: "blocked", reason: turnstile.reason, ipHash });
      return NextResponse.json(
        {
          ok: false,
          error: turnstile.unavailable
            ? "Security verification is temporarily unavailable. Please try again."
            : "Please complete the security verification and try again.",
        },
        { status: turnstile.unavailable ? 503 : 400, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  const ipAllowed = claimRateLimit(
    `ip:${endpoint}:${ipHash}`,
    options.ipLimit ?? 8,
    TEN_MINUTES,
    now,
  );
  const contactHash = contact ? securityHash(contact) : "";
  const contactAllowed = contactHash
    ? claimRateLimit(`contact:${endpoint}:${contactHash}`, options.contactLimit ?? 4, ONE_HOUR, now)
    : true;

  if (!ipAllowed || !contactAllowed) {
    auditSecurityEvent({ endpoint, outcome: "rate-limited", ipHash, contactHash: contactHash || undefined });
    pruneState(getState(), now);
    persistState(getState());
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please wait and try again." },
      { status: 429, headers: { "Retry-After": "600", "Cache-Control": "no-store" } },
    );
  }

  const fingerprint = securityHash(`${endpoint}|${contact}|${clean(input.name, 160)}|${message}`);
  if (!claimFingerprint(fingerprint, options.duplicateWindowMs ?? 30 * 60 * 1000, now)) {
    auditSecurityEvent({ endpoint, outcome: "duplicate", ipHash, contactHash: contactHash || undefined });
    pruneState(getState(), now);
    persistState(getState());
    return filteredResponse();
  }

  pruneState(getState(), now);
  persistState(getState());
  return null;
}

export function protectCrmMirror(lead: Record<string, unknown>): CrmMirrorDecision {
  const signals = findLeadSpamSignals({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    extra: [lead.country, lead.program, lead.page],
  });
  if (signals.score >= 4) {
    auditSecurityEvent({
      endpoint: "crm-mirror",
      outcome: "filtered",
      reasons: signals.reasons,
      leadId: clean(lead.id, 100),
    });
    return { ok: false, reason: signals.reasons.join(",") || "spam-signals" };
  }

  const email = clean(lead.email, 180).toLowerCase();
  const phone = clean(lead.phone, 80).replace(/\D/g, "");
  const contact = email || phone;
  if (!contact) return { ok: true };

  const now = Date.now();
  const contactHash = securityHash(contact);
  const allowed = claimRateLimit(`crm-contact:${contactHash}`, 6, ONE_DAY, now);
  const fingerprint = securityHash(
    `crm|${contact}|${clean(lead.name, 160)}|${clean(lead.message, 4_000)}|${clean(lead.program, 200)}`,
  );
  const unique = claimFingerprint(`crm:${fingerprint}`, ONE_HOUR, now);
  pruneState(getState(), now);
  persistState(getState());

  if (!allowed || !unique) {
    const reason = !allowed ? "contact-rate-limit" : "duplicate";
    auditSecurityEvent({
      endpoint: "crm-mirror",
      outcome: "filtered",
      reason,
      leadId: clean(lead.id, 100),
      contactHash,
    });
    return { ok: false, reason };
  }
  return { ok: true };
}

export function resetLeadSecurityForTests() {
  globalSecurity.__xiphiasLeadSecurityState = emptyState();
}
