import "server-only";

import nodemailer from "nodemailer";

export type PlatformEmailResult =
  | { status: "skipped"; reason: string }
  | { status: "sent" }
  | { status: "failed"; reason: string };

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getPlatformRecipient(kind: "partner" | "b2g" | "general") {
  if (kind === "partner") {
    return process.env.PARTNER_EMAIL_TO || process.env.EMAIL_TO || process.env.SMTP_USER || "immigration@xiphias.in";
  }
  if (kind === "b2g") {
    return process.env.B2G_EMAIL_TO || process.env.EMAIL_TO || process.env.SMTP_USER || "immigration@xiphias.in";
  }
  return process.env.EMAIL_TO || process.env.SMTP_USER || "immigration@xiphias.in";
}

export function getPlatformEmailStatus() {
  return {
    configured: Boolean(process.env.SMTP_HOST && (process.env.EMAIL_FROM || process.env.SMTP_USER)),
    hostConfigured: Boolean(process.env.SMTP_HOST),
    userConfigured: Boolean(process.env.SMTP_USER),
    fromConfigured: Boolean(process.env.EMAIL_FROM || process.env.SMTP_USER),
    generalRecipient: getPlatformRecipient("general"),
    partnerRecipient: getPlatformRecipient("partner"),
    b2gRecipient: getPlatformRecipient("b2g"),
  };
}

export async function sendPlatformEmail(args: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  label?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}): Promise<PlatformEmailResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || smtpUser;

  if (!smtpHost || !from) {
    return { status: "skipped", reason: "SMTP env vars are not configured." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
    });

    await transporter.sendMail({
      from: `"${args.label || "XIPHIAS Immigration"}" <${from}>`,
      to: args.to,
      replyTo: args.replyTo,
      subject: args.subject,
      html: args.html,
      attachments: args.attachments,
    });

    return { status: "sent" };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown SMTP error" };
  }
}

export function keyValueHtml(rows: [string, string | undefined][]) {
  return `
    <table style="width:100%;border-collapse:collapse;">
      ${rows
        .filter(([, value]) => Boolean(value))
        .map(
          ([label, value]) =>
            `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${escapeHtml(
              label,
            )}</strong></td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value || "")}</td></tr>`,
        )
        .join("")}
    </table>
  `;
}
