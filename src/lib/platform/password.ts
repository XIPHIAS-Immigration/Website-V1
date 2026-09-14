// src/lib/platform/password.ts
// -----------------------------------------------------------------------------
// Portal password hashing.
//
// Bare SHA-256 is a digest, not a password hash: it is fast by design, unsalted,
// and a consumer GPU walks a leaked table of them in minutes. This module moves
// portal passwords onto scrypt — memory-hard, salted per user, and part of Node's
// standard library, so it needs no new dependency and no install step.
//
// Stored format:   scrypt$N$r$p$<salt-hex>$<derived-hex>
// Legacy format:   a bare 64-character hex SHA-256 digest
//
// Verification accepts both. Anything still on the legacy format is re-hashed
// transparently the next time the owner signs in successfully, so the migration
// needs no downtime and no password reset.
// -----------------------------------------------------------------------------

import { randomBytes, scryptSync, timingSafeEqual, createHash } from "node:crypto";

const SCRYPT = { N: 16384, r: 8, p: 1, keyLen: 64 } as const;
const LEGACY_SHA256 = /^[a-f0-9]{64}$/i;

/** Constant-time comparison that tolerates unequal lengths without leaking them. */
export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    // Still burn a comparison so the timing does not advertise a length mismatch.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/** Legacy digest. Exported only so existing records can still be read. */
export function legacySha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(plain: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, SCRYPT.keyLen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string | undefined | null) {
  if (!stored) return false;

  if (LEGACY_SHA256.test(stored)) {
    return safeEqual(legacySha256(plain), stored.toLowerCase());
  }

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltHex, expectedHex] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  let derived: Buffer;
  try {
    derived = scryptSync(plain, Buffer.from(saltHex, "hex"), expectedHex.length / 2, { N, r, p });
  } catch {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/** True when the stored value should be upgraded after a successful sign-in. */
export function needsRehash(stored: string | undefined | null) {
  if (!stored) return false;
  if (LEGACY_SHA256.test(stored)) return true;
  const parts = stored.split("$");
  return !(parts.length === 6 && parts[0] === "scrypt" && Number(parts[1]) >= SCRYPT.N);
}
