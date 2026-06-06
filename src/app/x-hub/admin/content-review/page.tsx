import type { Metadata } from "next";
import PortalShell from "@/components/Platform/PortalShell";
import ContentReviewClient from "@/components/Platform/ContentReviewClient";
import { requirePortalUser } from "@/lib/platform/auth";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Content Review | XIPHIAS",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ContentReviewPage() {
  const user = await requirePortalUser(["staff", "admin"]);
  const tasks = getPlatformRepository().listContentTasks();

  return (
    <PortalShell user={user} active="content">
      <ContentReviewClient initialTasks={tasks} />
    </PortalShell>
  );
}

