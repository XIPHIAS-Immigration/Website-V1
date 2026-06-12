import { NextResponse, type NextRequest } from "next/server";

import { captureVisitorEvent } from "@/lib/platform/visitor-analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const event = await captureVisitorEvent(body, request.headers);
  return NextResponse.json({ ok: true, eventId: event.id });
}
