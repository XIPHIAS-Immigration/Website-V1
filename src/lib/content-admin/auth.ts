import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

export const CONTENT_ADMIN_COOKIE = "xiphias_content_admin";

const SESSION_SECONDS = 60 * 60 * 12;

export type ContentAdminSession = {
  username: string;
  expiresAt: number;
};

function getAdminUsername() {
  return process.env.CONTENT_ADMIN_USERNAME?.trim() || "";
}

function getAdminPassword() {
  return process.env.CONTENT_ADMIN_PASSWORD || "";
}

function getSigningSecret() {
  return (
    process.env.CONTENT_ADMIN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-content-admin-secret"
  );
}

function safeEqual(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("base64url");
}

export function hasContentAdminConfig() {
  return Boolean(getAdminUsername() && getAdminPassword());
}

export function verifyContentAdminCredentials(username: string, password: string) {
  if (!hasContentAdminConfig()) return false;
  return safeEqual(username.trim(), getAdminUsername()) && safeEqual(password, getAdminPassword());
}

export function createContentAdminToken(username: string) {
  const session: ContentAdminSession = {
    username: username.trim(),
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

export function verifyContentAdminToken(token?: string): ContentAdminSession | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, signPayload(payload))) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as ContentAdminSession;
    if (!decoded.username || !decoded.expiresAt || decoded.expiresAt < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getContentAdminSession() {
  noStore();
  const cookieStore = await cookies();
  return verifyContentAdminToken(cookieStore.get(CONTENT_ADMIN_COOKIE)?.value);
}

export async function requireContentAdmin() {
  const session = await getContentAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export function contentAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production" && process.env.CONTENT_ADMIN_INSECURE_COOKIES !== "true",
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}
