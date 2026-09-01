import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { crmSql, getLiveCrmPool, isLiveCrmConfigured } from "@/lib/crm/live-sql";

/**
 * Writes one job applicant into HRMS (HRMS_Candidate) via dbo.hrms_SubmitCandidate.
 *
 * The proc de-duplicates on email/phone within 365 days, auto-assigns an HR owner
 * (an HR user currently clocked in, else the HR department / an admin) and raises
 * a candidate-review task, so HR sees the application in their queue.
 *
 * The resume is optional: the careers form attaches one, applications spotted in
 * the general contact/enquiry forms do not have a file.
 */

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type CandidateResume = {
  fileName: string;
  contentType: string;
  data: Buffer;
};

export type SaveCandidateInput = {
  name: string;
  email: string;
  phone: string;
  position: string;
  coverNote?: string;
  /** CAREERS for the job form, WEBSITE_ENQUIRY when spotted in a general enquiry. */
  source: "CAREERS" | "WEBSITE_ENQUIRY";
  ip?: string;
  requestId?: string;
  resume?: CandidateResume;
};

export async function saveCandidateToHrms(input: SaveCandidateInput): Promise<number | null> {
  if (!isLiveCrmConfigured()) {
    console.warn("[hrms] CRM not configured - candidate not saved:", input.email);
    return null;
  }

  const name = text(input.name);
  const email = text(input.email);
  const phone = text(input.phone);
  // The proc rejects these outright; fail here so the caller can fall back.
  if (name.length < 2 || phone.replace(/[^0-9]/g, "").length < 7 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.warn("[hrms] candidate rejected - incomplete details:", email || name);
    return null;
  }

  const position = text(input.position) || "General application";
  const pool = await getLiveCrmPool("india");
  const request = pool
    .request()
    .input("FullName", crmSql.NVarChar(120), name.slice(0, 120))
    .input("Email", crmSql.VarChar(150), email.slice(0, 150))
    .input("Phone", crmSql.VarChar(30), phone.slice(0, 30))
    .input("Position", crmSql.NVarChar(120), position.slice(0, 120))
    .input("CoverNote", crmSql.NVarChar(2000), text(input.coverNote).slice(0, 2000) || null)
    .input("Source", crmSql.VarChar(30), input.source)
    .input("RequestId", crmSql.UniqueIdentifier, input.requestId || randomUUID())
    .input("Consent", crmSql.Bit, true)
    .input("IpAddress", crmSql.VarChar(45), text(input.ip) || "unknown");

  if (input.resume) {
    request
      .input("FileName", crmSql.NVarChar(255), input.resume.fileName.slice(0, 255))
      .input("ContentType", crmSql.VarChar(100), input.resume.contentType.slice(0, 100))
      .input("FileHash", crmSql.VarChar(64), createHash("sha256").update(input.resume.data).digest("hex"))
      .input("FileData", crmSql.VarBinary(crmSql.MAX), input.resume.data);
  }

  const result = await request.execute("hrms_SubmitCandidate");
  const candidateId = Number(result.recordset?.[0]?.ID ?? 0) || null;
  console.log("[hrms] candidate captured:", candidateId, email, `(${input.source})`);
  return candidateId;
}
