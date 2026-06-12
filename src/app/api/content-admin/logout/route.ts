import { NextResponse } from "next/server";

import { CONTENT_ADMIN_COOKIE, contentAdminCookieOptions } from "@/lib/content-admin/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONTENT_ADMIN_COOKIE, "", {
    ...contentAdminCookieOptions(),
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  return response;
}
