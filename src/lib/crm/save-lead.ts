import "server-only";

import { crmSql, getLiveCrmPool, isLiveCrmConfigured } from "@/lib/crm/live-sql";

// tbl_Enquiry.ENT_DATE is varchar(50), not a date column.
// Existing rows look like: 11-Nov-2025 09:35 AM  -- match that exactly.
// NOTE: this reads the server clock, so the server timezone must be IST.
function crmTimestamp(d = new Date()) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dd   = String(d.getDate()).padStart(2, "0");
  const mmm  = months[d.getMonth()];
  const yyyy = d.getFullYear();
  let hours  = d.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const hh = String(hours).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}-${mmm}-${yyyy} ${hh}:${mi} ${ampm}`;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Writes one lead into the legacy CRM (tbl_Enquiry) via the existing
 * sp_Enquiry stored procedure.
 *
 * Called fire-and-forget from PlatformRepository.createLead, so it must never
 * be relied on to block lead capture. Throws are caught by the caller.
 */
export async function saveLeadToCrm(lead: Record<string, any>): Promise<void> {
  if (!isLiveCrmConfigured()) {
    console.warn("[x-hub] CRM not configured - lead not mirrored:", lead?.id);
    return;
  }

  const name  = text(lead?.name);
  const email = text(lead?.email);

  // tbl_Enquiry has no NOT NULL on NAME/EMAIL, but a row with neither is useless.
  if (!name && !email) return;

  // ENQUIRY is the only free-text column, so fold the context into it.
  // This is what your staff will read in the CRM Enquiry list.
  const enquiryText = [
    text(lead?.message) || "(no message provided)",
    text(lead?.country) ? `Country: ${text(lead.country)}` : "",
    text(lead?.track) ? `Track: ${text(lead.track)}` : "",
    text(lead?.page) ? `Page: ${text(lead.page)}` : "",
    `Source: ${text(lead?.source) || "website"}`,
    Array.isArray(lead?.tags) && lead.tags.length ? `Tags: ${lead.tags.join(", ")}` : "",
    `x-hub id: ${text(lead?.id)}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const pool = await getLiveCrmPool("india");

  const response = await pool
    .request()
    // NAME and EMAIL are varchar(50) in tbl_Enquiry - trim or the insert throws.
    .input("NAME",     crmSql.VarChar(50),         name.slice(0, 50))
    .input("EMAIL",    crmSql.VarChar(50),         email.slice(0, 50))
    .input("PHONE",    crmSql.VarChar(crmSql.MAX), text(lead?.phone))
    .input("ENQUIRY",  crmSql.VarChar(crmSql.MAX), enquiryText)
    .input("ENT_DATE", crmSql.VarChar(50),         crmTimestamp())
    .input("CODE",     crmSql.VarChar(50),         null)
    .execute("sp_Enquiry");
  console.log(response)
  console.log("[x-hub] Lead mirrored to CRM:", lead?.id, email);
}