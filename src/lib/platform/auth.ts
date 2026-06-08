import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import type { AuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
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
  const raw = process.env.XIPHIAS_PORTAL_USERS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CredentialUser[];
      return parsed.filter((user) => user.email && user.name && user.role);
    } catch {
      return [];
    }
  }

  if (process.env.NODE_ENV !== "production" || process.env.XIPHIAS_PORTAL_DEMO_MODE === "true") {
    return [
      {
        email: "admin@xiphias.local",
        password: "xiphias-admin",
        name: "XIPHIAS Admin",
        role: "admin",
      },
      {
        email: "client@xiphias.local",
        password: "xiphias-client",
        name: "Aarav Mehta",
        role: "client",
        clientId: "cli_aarav",
      },
      {
        email: "partner@xiphias.local",
        password: "xiphias-partner",
        name: "Partner Desk",
        role: "partner",
        partnerId: "ptr_global",
      },
      {
        email: "mobility@gov.local",
        password: "xiphias-b2g",
        name: "Institution Desk",
        role: "b2g",
        organizationId: "org_public",
      },
    ];
  }

  return [];
}

function verifyPassword(candidate: string, user: CredentialUser) {
  if (user.passwordSha256) return safeEqual(hashPassword(candidate), user.passwordSha256);
  if (user.password) return safeEqual(candidate, user.password);
  return false;
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "xiphias-local-dev-auth-secret-change-before-production"
      : undefined),
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
          return {
            id: existing?.id ?? `auth_${hashPassword(email).slice(0, 12)}`,
            email,
            name: configured.name,
            role: configured.role,
            clientId: configured.clientId ?? existing?.clientId,
            partnerId: configured.partnerId ?? existing?.partnerId,
            organizationId: configured.organizationId ?? existing?.organizationId,
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
  return {
    id: session.user.id || existing?.id || session.user.email,
    email: session.user.email,
    name: session.user.name || existing?.name || session.user.email,
    role: session.user.role,
    clientId: session.user.clientId ?? existing?.clientId,
    partnerId: session.user.partnerId ?? existing?.partnerId,
    organizationId: session.user.organizationId ?? existing?.organizationId,
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
