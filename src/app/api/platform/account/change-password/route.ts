import { NextResponse, type NextRequest } from "next/server";
import { getCurrentPortalUser, hashPassword, safeEqual } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(value: unknown, max = 240) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentPortalUser();
  if (!user?.email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const currentPassword = text(body.currentPassword, 240);
  const newPassword = text(body.newPassword, 240);

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: "Current password and new password are required." },
      { status: 400 },
    );
  }

  if (newPassword.length < 10) {
    return NextResponse.json(
      { ok: false, error: "Use at least 10 characters for the new password." },
      { status: 400 },
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { ok: false, error: "Choose a new password that is different from the temporary password." },
      { status: 400 },
    );
  }

  const repo = getPlatformRepository();
  const account = repo.getUserByEmail(user.email);
  if (!account?.passwordSha256) {
    return NextResponse.json(
      { ok: false, error: "This account is managed through configured portal credentials." },
      { status: 400 },
    );
  }

  if (!safeEqual(hashPassword(currentPassword), account.passwordSha256)) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 400 });
  }

  const updated = repo.updateUser(account.id, {
    passwordSha256: hashPassword(newPassword),
    mustChangePassword: false,
    portalStatus: "active",
  });
  repo.audit("password.changed", "user", account.id, account.id, { email: account.email });

  return NextResponse.json({
    ok: true,
    user: {
      email: updated?.email ?? account.email,
      portalStatus: updated?.portalStatus ?? "active",
      mustChangePassword: updated?.mustChangePassword ?? false,
    },
  });
}
