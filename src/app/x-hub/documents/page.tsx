import type { Metadata } from "next";
import DocumentIntelligenceClient from "@/components/Platform/DocumentIntelligenceClient";
import PortalShell from "@/components/Platform/PortalShell";
import { requirePortalUser } from "@/lib/platform/auth";
import { buildDocumentPlan } from "@/lib/platform/document-intelligence";
import { getPlatformRepository } from "@/lib/platform/repository";

export const metadata: Metadata = {
  title: "Document Intelligence | X-Hub",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requirePortalUser(["client", "staff", "admin"]);
  const snapshot = getPlatformRepository().snapshotForUser(user);
  const activeCase = snapshot.cases[0];
  const documents = activeCase
    ? snapshot.documents.filter((doc) => doc.caseId === activeCase.id)
    : snapshot.documents;
  const initialPlan = buildDocumentPlan({
    user,
    activeCase,
    documents,
  });

  return (
    <PortalShell user={user} active="documents">
      <DocumentIntelligenceClient initialPlan={initialPlan} />
    </PortalShell>
  );
}
