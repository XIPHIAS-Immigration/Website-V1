// src/lib/platform/signin-throttle.ts
// -----------------------------------------------------------------------------
// Sign-in rate limiting and lockout.
//
// Without this, /api/auth/callback/credentials is an unlimited password oracle.
// Counters live in process memory: correct for the current single-instance IIS
// deployment, and deliberately simple. If the portal is ever load-balanced this
// must move to the shared store — the comment is here so that is not a surprise.
// -----------------------------------------------------------------------------

import "server-only";

type Attempt = { count: number; firstAt: number; lockedUntil: number };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_TRACKED = 5_000;

const attempts = new Map<string, Attempt>();

function prune(now: number) {
  if (attempts.size < MAX_TRACKED) return;
  for (const [key, value] of attempts) {
    if (value.lockedUntil < now && now - value.firstAt > WINDOW_MS) attempts.delete(key);
  }
}

/** Call before checking a password. Returns false when the identity is locked out. */
export function canAttemptSignIn(identity: string, now = Date.now()) {
  const record = attempts.get(identity.toLowerCase());
  if (!record) return true;
  if (record.lockedUntil > now) return false;
  if (now - record.firstAt > WINDOW_MS) {
    attempts.delete(identity.toLowerCase());
    return true;
  }
  return record.count < MAX_ATTEMPTS;
}

export function recordFailedSignIn(identity: string, now = Date.now()) {
  const key = identity.toLowerCase();
  prune(now);
  const record = attempts.get(key);

  if (!record || now - record.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, lockedUntil: 0 });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function clearSignInAttempts(identity: string) {
  attempts.delete(identity.toLowerCase());
}

export const signInThrottleConfig = { WINDOW_MS, MAX_ATTEMPTS, LOCKOUT_MS } as const;
