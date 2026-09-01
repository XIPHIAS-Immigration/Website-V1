/**
 * Pure classification, no server-only imports, so it can be unit tested the
 * same way public-lead-security is.
 *
 * Decides whether an inbound website lead is somebody applying for a job at
 * XIPHIAS (which belongs to HR in HRMS) rather than an immigration enquiry
 * (which belongs to sales in tbl_Enquiry).
 *
 * Deliberately conservative. Misrouting a paying immigration lead into the HR
 * queue is far more costly than leaving a job application in enquiries, so an
 * ambiguous message stays an enquiry.
 */

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The CRM enquiry text carries " | Page: /x | Source: y | Tags: z" appended to
 * the message. Classify on the message ONLY: page paths such as
 * /careers/visa-processing-officer or /blog/us-passport-visa-free-countries
 * otherwise trip the immigration keywords and hide real job applications.
 */
function messageBody(message: string): string {
  const marker = message.search(/\s\|\s(Page|Source|Tags|x-hub id):/i);
  return (marker >= 0 ? message.slice(0, marker) : message).toLowerCase();
}

/** Somebody is asking us for work. */
const JOB_INTENT = [
  "career application", "looking for a job", "looking for job", "need a job", "want a job",
  "searching for a job", "searching for new job", "apply for the post", "apply for the position",
  "wanted to apply", "want to apply for", "applying for the", "my resume", "my cv",
  "attached resume", "attaching my resume", "uploading the resume", "consider my resume",
  "hiring manager", "seeking employment", "seeking a role", "job application",
  "any vacancy in your company", "vacancy in your office", "another job", "new job opportunity",
];

/**
 * Somebody wants to MOVE somewhere. These override job intent: "I want work in
 * abroad, do you have any vacancy" is an immigration lead, not an application
 * to work at XIPHIAS.
 */
const IMMIGRATION_INTENT = [
  "visa", "immigrat", "permanent resid", "migrat", "work permit", "express entry",
  "passport", "citizenship", "pnp", " pr ", "pr process", "abroad", "overseas",
  "settle in", "study in", "move to", "relocate", "consultancy charge", "consultation fee",
];

export type JobApplicationVerdict = {
  isJobApplication: boolean;
  /** Role applied for, best effort - HRMS requires a non-empty position. */
  position: string;
  reason: string;
};

/** "/careers/accounts-executive" -> "Accounts Executive" */
function positionFromPage(page: string): string {
  const match = page.match(/\/careers\/([a-z0-9-]+)/i);
  if (!match) return "";
  return match[1]
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function classifyJobApplication(lead: Record<string, unknown>): JobApplicationVerdict {
  const tags = Array.isArray(lead?.tags) ? lead.tags.map((t) => String(t).toLowerCase()) : [];
  const page = text(lead?.page);
  const program = text(lead?.program);
  const body = messageBody(text(lead?.message));

  const rolePage = positionFromPage(page);
  const position = rolePage || (program && program !== "Career application" ? program : "") || "General application";

  // The careers form tags its own submissions. That is definitive - no keyword
  // guessing, and no immigration override.
  if (tags.includes("career-application")) {
    return { isJobApplication: true, position, reason: "careers-form" };
  }

  const immigration = IMMIGRATION_INTENT.find((word) => body.includes(word));
  if (immigration) {
    return { isJobApplication: false, position, reason: `immigration intent: "${immigration}"` };
  }

  const intent = JOB_INTENT.find((phrase) => body.includes(phrase));
  if (intent) {
    return { isJobApplication: true, position, reason: `job intent: "${intent}"` };
  }

  // Submitted from a job advert page with no immigration wording. Weaker than an
  // explicit phrase, but a /careers/<role> page is a deliberate destination.
  if (/\/careers(\/|$|\?)/i.test(page) && body.length > 0) {
    return { isJobApplication: true, position, reason: "submitted from a careers page" };
  }

  return { isJobApplication: false, position, reason: "no job intent detected" };
}
