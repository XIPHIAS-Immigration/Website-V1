import { NextResponse } from "next/server";

import { CONTENT_ADMIN_COOKIE } from "@/lib/content-admin/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CONTENT_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
