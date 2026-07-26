import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const APEX_HOST = "xiphiasimmigration.com";
const CANONICAL_HOST = "www.xiphiasimmigration.com";

function normalizeHosts(value: string | null): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((host) =>
      host
        .trim()
        .replace(/^host=/i, "")
        .replace(/^["']|["']$/g, "")
        .replace(/^https?:\/\//i, "")
        .replace(/:\d+$/, "")
        .replace(/\.$/, "")
        .toLowerCase(),
    )
    .filter(Boolean);
}

export function proxy(request: NextRequest) {
  const requestHosts = [
    ...normalizeHosts(request.headers.get("x-forwarded-host")),
    ...normalizeHosts(request.headers.get("x-original-host")),
    ...normalizeHosts(request.headers.get("host")),
    request.nextUrl.hostname.toLowerCase(),
  ];

  if (!requestHosts.includes(APEX_HOST)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.hostname = CANONICAL_HOST;
  destination.port = "";

  return NextResponse.redirect(destination, 308);
}

export const config = {
  matcher: "/:path*",
};
