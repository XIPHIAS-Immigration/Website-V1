import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import type { AuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import { unstable_noStore as noStore } from "next/cache";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { getPlatformRepository } from "./repository";
import type { PlatformUser, PortalRole } from "./types";

type CredentialUser = {
  email: string;
  name: string;
  role: PortalRole;
  password?: string;
  passwordSha256?: string;
  clientId?: string;
  partnerId?: string;
  organizationId?: string;
};

export function hashPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function parsePortalUsers(): CredentialUser[] {
  const users: CredentialUser[] = [];
  const raw = process.env.XIPHIAS_PORTAL_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CredentialUser[];
      users.push(...parsed.filter((user) => user.email && user.name && user.role));
    } catch {
      // Ignore malformed bulk config and still allow the single-admin env fallback below.
    }
  }

  const adminEmail = process.env.XIPHIAS_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.XIPHIAS_ADMIN_PASSWORD;
  const adminPasswordSha256 = process.env.XIPHIAS_ADMIN_PASSWORD_SHA256;
  if (adminEmail && (adminPassword || adminPasswordSha256)) {
    users.push({
      email: adminEmail,
      password: adminPassword,
      passwordSha256: adminPasswordSha256,
      name: process.env.XIPHIAS_ADMIN_NAME || "XIPHIAS Admin",
      role: "admin",
    });
  }

  return users;
}

function getConfiguredPortalUser(email: string) {
  const needle = email.trim().toLowerCase();
  return parsePortalUsers().find((user) => user.email.toLowerCase() === needle) ?? null;
}

function verifyPassword(candidate: string, user: CredentialUser) {
  if (user.passwordSha256) return safeEqual(hashPassword(candidate), user.passwordSha256);
  if (user.password) return safeEqual(candidate, user.password);
  return false;
}

function recordPortalSignIn(user: PlatformUser, authSource: "configured" | "provisioned") {
  const repo = getPlatformRepository();
  repo.audit("portal.viewed", "portal_session", user.id, user.id, {
    event: "sign_in",
    role: user.role,
    email: user.email,
    authSource,
  });

  if (user.role === "client") {
    const activeCase = repo.getCasesForUser(user)[0];
    if (activeCase) {
      repo.createConversation({
        caseId: activeCase.id,
        leadId: activeCase.leadId,
        channel: "portal",
        direction: "inbound",
        from: user.email,
        to: "X-Hub",
        body: `${user.name || user.email} signed in to X-Hub.`,
      });
    }
  }
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "xiphias-local-dev-auth-secret-change-before-production"
      : undefined),
  logger: {
    error(code, metadata) {
      if (code === "JWT_SESSION_ERROR") return; // caught gracefully by getCurrentPortalUser
      console.error("[next-auth]", code, metadata);
    },
  },
  pages: {
    signIn: "/x-hub/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "XIPHIAS Portal",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        const repo = getPlatformRepository();
        const configured = parsePortalUsers().find((user) => user.email.toLowerCase() === email);
        if (configured) {
          if (!verifyPassword(password, configured)) return null;

          const existing = repo.getUserByEmail(email);
          const stored =
            existing ??
            repo.createUser({
              email,
              name: configured.name,
              role: configured.role,
              clientId: configured.clientId,
              partnerId: configured.partnerId,
              organizationId: configured.organizationId,
              portalStatus: "active",
            });
          recordPortalSignIn(stored, "configured");

          return {
            id: stored.id,
            email,
            name: configured.name,
            role: configured.role,
            clientId: configured.clientId ?? stored.clientId,
            partnerId: configured.partnerId ?? stored.partnerId,
            organizationId: configured.organizationId ?? stored.organizationId,
          };
        }

        const provisioned = repo.getUserByEmail(email);
        if (
          !provisioned?.passwordSha256 ||
          provisioned.portalStatus === "disabled" ||
          !safeEqual(hashPassword(password), provisioned.passwordSha256)
        ) {
          return null;
        }

        recordPortalSignIn(provisioned, "provisioned");

        return {
          id: provisioned.id,
          email,
          name: provisioned.name,
          role: provisioned.role,
          clientId: provisioned.clientId,
          partnerId: provisioned.partnerId,
          organizationId: provisioned.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.clientId = user.clientId;
        token.partnerId = user.partnerId;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.sub ?? "");
        session.user.role = token.role as PortalRole;
        session.user.clientId = token.clientId as string | undefined;
        session.user.partnerId = token.partnerId as string | undefined;
        session.user.organizationId = token.organizationId as string | undefined;
      }
      return session;
    },
  },
};

export async function getCurrentPortalUser(): Promise<PlatformUser | null> {
  noStore();
  let session: Session | null = null;
  try {
    session = (await getServerSession(authOptions)) as Session | null;
  } catch (error) {
    console.warn(
      "[x-hub] Ignoring invalid auth session. Sign in again to refresh the portal cookie.",
      error,
    );
    return null;
  }

  if (!session?.user?.email || !session.user.role) return null;

  const existing = getPlatformRepository().getUserByEmail(session.user.email);
  const configured = getConfiguredPortalUser(session.user.email);
  if (!existing && !configured) return null;
  if (existing?.portalStatus === "disabled") return null;

  return {
    id: existing?.id || session.user.id || session.user.email,
    email: session.user.email,
    name: existing?.name || session.user.name || configured?.name || session.user.email,
    role: existing?.role || session.user.role,
    clientId: existing?.clientId ?? session.user.clientId ?? configured?.clientId,
    partnerId: existing?.partnerId ?? session.user.partnerId ?? configured?.partnerId,
    organizationId: existing?.organizationId ?? session.user.organizationId ?? configured?.organizationId,
    mustChangePassword: existing?.mustChangePassword,
    portalStatus: existing?.portalStatus,
    registrationPaymentRef: existing?.registrationPaymentRef,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: existing?.updatedAt,
  };
}

export async function requirePortalUser(allowedRoles?: PortalRole[]) {
  const user = await getCurrentPortalUser();
  if (!user) redirect("/x-hub/sign-in");
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) redirect("/x-hub");
  return user;
}

export function hasPortalUsersConfigured() {
  return parsePortalUsers().length > 0;
}
