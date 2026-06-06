import "server-only";

import type { PlatformLead } from "./types";

export type WhatsAppSendResult =
  | { status: "skipped"; reason: string }
  | { status: "sent"; providerMessageId?: string }
  | { status: "failed"; reason: string };

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function hasWhatsAppConfig() {
  return Boolean(
    process.env.META_WABA_TOKEN &&
      process.env.META_WABA_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_TO,
  );
}

export function getWhatsAppConfigStatus() {
  return {
    configured: hasWhatsAppConfig(),
    tokenConfigured: Boolean(process.env.META_WABA_TOKEN),
    phoneNumberIdConfigured: Boolean(process.env.META_WABA_PHONE_NUMBER_ID),
    defaultRecipientConfigured: Boolean(process.env.WHATSAPP_TO),
    webhookVerifyTokenConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
  };
}

export async function sendWhatsAppText(to: string, body: string): Promise<WhatsAppSendResult> {
  if (!hasWhatsAppConfig()) {
    return { status: "skipped", reason: "WhatsApp Cloud API env vars are not configured." };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${process.env.META_WABA_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_WABA_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalizePhone(to),
        type: "text",
        text: { body },
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      return { status: "failed", reason: text || response.statusText };
    }

    const data = (await response.json().catch(() => ({}))) as {
      messages?: { id?: string }[];
    };
    return { status: "sent", providerMessageId: data.messages?.[0]?.id };
  } catch (error) {
    return { status: "failed", reason: error instanceof Error ? error.message : "Unknown WhatsApp error" };
  }
}

export async function sendLeadAlert(lead: PlatformLead) {
  const body = [
    `New XIPHIAS lead (${lead.source})`,
    `Name: ${lead.name}`,
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.email ? `Email: ${lead.email}` : "",
    lead.track ? `Track: ${lead.track}` : "",
    lead.country ? `Country: ${lead.country}` : "",
    lead.program ? `Program: ${lead.program}` : "",
    lead.page ? `Page: ${lead.page}` : "",
    lead.message ? `Message: ${lead.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sendWhatsAppText(process.env.WHATSAPP_TO || "", body);
}
