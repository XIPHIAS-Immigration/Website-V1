import { NextResponse, type NextRequest } from "next/server";
import { isTrack, type Track } from "@/lib/eligibility/types";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";
import { normalizeEmail, normalizePhone, normalizeText } from "@/lib/platform/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function numberValue(value: unknown) {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function cleanDate(value: unknown) {
  const text = normalizeText(value, 20);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : undefined;
}

function resolveClientId(user: Awaited<ReturnType<typeof requirePortalUser>>, requested?: string) {
  if (user.role === "client") return user.clientId || `cli_${user.id}`;
  return normalizeText(requested, 80) || user.clientId || "";
}

export async function POST(req: NextRequest) {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const body = await req.json().catch(() => ({}));
  const repo = getPlatformRepository();
  const clientId = resolveClientId(user, body.clientId);

  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "A client profile needs a clientId." },
      { status: 400 },
    );
  }

  if (user.role === "client" && !user.clientId) {
    repo.updateUser(user.id, { clientId });
  }

  const preferredTrack: Track | undefined = isTrack(body.preferredTrack) ? body.preferredTrack : undefined;
  const existing = repo.getClientProfile(clientId);
  const profile = repo.upsertClientProfile(
    {
      clientId,
      userId: user.role === "client" ? user.id : existing?.userId,
      fullName: normalizeText(body.fullName, 140) || existing?.fullName || user.name,
      email: normalizeEmail(body.email) || existing?.email || user.email,
      phone: normalizePhone(body.phone) || existing?.phone,
      nationality: normalizeText(body.nationality, 80) || undefined,
      residenceCountry: normalizeText(body.residenceCountry, 80) || undefined,
      dateOfBirth: cleanDate(body.dateOfBirth),
      familyMembers: normalizeText(body.familyMembers, 180) || undefined,
      occupation: normalizeText(body.occupation, 120) || undefined,
      companyName: normalizeText(body.companyName, 120) || undefined,
      preferredTrack,
      targetCountry: normalizeText(body.targetCountry, 80) || undefined,
      targetProgram: normalizeText(body.targetProgram, 140) || undefined,
      budgetUsd: numberValue(body.budgetUsd),
      timelineMonths: numberValue(body.timelineMonths),
      sourceOfFunds: normalizeText(body.sourceOfFunds, 400) || undefined,
      notes: normalizeText(body.notes, 700) || undefined,
    },
    user.id,
  );

  const activeCase = repo.getCasesForUser(user).find((item) => item.clientId === clientId);
  repo.createConversation({
    leadId: activeCase?.leadId,
    caseId: activeCase?.id,
    channel: "portal",
    direction: "inbound",
    from: user.email,
    to: "XIPHIAS staff",
    body: `Client profile updated: ${[
      profile.targetCountry ? `target country ${profile.targetCountry}` : "",
      profile.targetProgram ? `programme ${profile.targetProgram}` : "",
      profile.budgetUsd ? `budget USD ${profile.budgetUsd}` : "",
      profile.timelineMonths ? `timeline ${profile.timelineMonths} months` : "",
    ]
      .filter(Boolean)
      .join(", ") || "profile details saved"}.`,
  });

  return NextResponse.json({ ok: true, profile });
}
