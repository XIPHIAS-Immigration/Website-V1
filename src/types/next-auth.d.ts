import type { DefaultSession, DefaultUser } from "next-auth";
import type { PortalRole } from "@/lib/platform/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: PortalRole;
      clientId?: string;
      partnerId?: string;
      organizationId?: string;
    };
  }

  interface User extends DefaultUser {
    role: PortalRole;
    clientId?: string;
    partnerId?: string;
    organizationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: PortalRole;
    clientId?: string;
    partnerId?: string;
    organizationId?: string;
  }
}

