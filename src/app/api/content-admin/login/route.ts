import { NextResponse } from "next/server";

import {
  CONTENT_ADMIN_COOKIE,
  contentAdminCookieOptions,
  createContentAdminToken,
  hasContentAdminConfig,
  verifyContentAdminCredentials,
} from "@/lib/content-admin/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!hasContentAdminConfig()) {
    return NextResponse.json(
      { ok: false, message: "Content admin credentials are not configured." },
      { status: 503 },
    );
  }

  if (!verifyContentAdminCredentials(username, password)) {
    return NextResponse.json(
      { ok: false, message: "Invalid content admin credentials." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONTENT_ADMIN_COOKIE, createContentAdminToken(username), contentAdminCookieOptions());
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return response;
}
