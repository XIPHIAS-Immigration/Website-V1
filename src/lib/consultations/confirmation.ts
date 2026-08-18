import "server-only";

import type { ConsultationBooking } from "@/lib/consultations/store";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function icsEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "");
}

function compactDate(dateISO: string) {
  return dateISO.replaceAll("-", "");
}

function endDateTime(dateISO: string, timeISO: string, durationMinutes: number) {
  const [hours, minutes] = timeISO.split(":").map(Number);
  const total = hours * 60 + minutes + durationMinutes;
  const extraDays = Math.floor(total / 1440);
  const endMinutes = total % 1440;
  const date = new Date(`${dateISO}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + extraDays);
  const endDate = date.toISOString().slice(0, 10);
  return {
    dateISO: endDate,
    timeISO: `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`,
  };
}

export function formatConsultationDate(dateISO: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

export function formatConsultationTime(timeISO: string) {
  const [hour, minute] = timeISO.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

export function consultationCalendarAttachment(booking: ConsultationBooking) {
  const end = endDateTime(booking.dateISO, booking.timeISO, booking.durationMinutes);
  const meetingUrl = process.env.CONSULTATION_MEETING_URL?.trim() || "";
  const description = meetingUrl
    ? `Your private XIPHIAS senior-advisor consultation. Join: ${meetingUrl}`
    : "Your private XIPHIAS senior-advisor consultation. Joining instructions will be sent by the advisory team.";
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//XIPHIAS Immigration//Senior Advisor Consultation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsEscape(booking.reference)}@xiphiasimmigration.com`,
    `DTSTAMP:${timestamp}`,
    `DTSTART;TZID=${icsEscape(booking.timezone)}:${compactDate(booking.dateISO)}T${booking.timeISO.replace(":", "")}00`,
    `DTEND;TZID=${icsEscape(booking.timezone)}:${compactDate(end.dateISO)}T${end.timeISO.replace(":", "")}00`,
    "SUMMARY:XIPHIAS Senior Advisor Strategy Consultation",
    `DESCRIPTION:${icsEscape(description)}`,
    meetingUrl ? `URL:${icsEscape(meetingUrl)}` : "",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    "DESCRIPTION:XIPHIAS consultation reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  return Buffer.from(content, "utf8");
}

export function consultationConfirmationEmailHtml(booking: ConsultationBooking, amountInr: number) {
  const meetingUrl = process.env.CONSULTATION_MEETING_URL?.trim() || "";
  return `
    <div style="margin:0;padding:24px;background:#eef3f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#071a3a;">
      <div style="max-width:720px;margin:auto;background:#fff;border:1px solid #dbe7f3;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(7,26,58,.14);">
        <div style="background:#1551a0;color:#fff;padding:30px;">
          <div style="font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#f4cf3a;">XIPHIAS Immigration</div>
          <h1 style="margin:9px 0 0;font-size:28px;line-height:1.2;color:#fff;">Your consultation is confirmed</h1>
          <p style="margin:12px 0 0;color:#dbe7f3;font-size:15px;line-height:1.7;">Your payment is verified and the selected time is reserved with our senior advisory team.</p>
        </div>
        <div style="padding:30px;">
          <p style="font-size:16px;line-height:1.7;margin:0 0 16px;">Dear <strong>${escapeHtml(booking.customer.name)}</strong>,</p>
          <table style="width:100%;border-collapse:collapse;background:#f8fbff;border:1px solid #dbe7f3;">
            <tr><td style="padding:11px;font-weight:800;border-bottom:1px solid #dbe7f3;">Consultation</td><td style="padding:11px;border-bottom:1px solid #dbe7f3;">Senior Advisor Strategy Consultation</td></tr>
            <tr><td style="padding:11px;font-weight:800;border-bottom:1px solid #dbe7f3;">Date</td><td style="padding:11px;border-bottom:1px solid #dbe7f3;">${escapeHtml(formatConsultationDate(booking.dateISO))}</td></tr>
            <tr><td style="padding:11px;font-weight:800;border-bottom:1px solid #dbe7f3;">Time</td><td style="padding:11px;border-bottom:1px solid #dbe7f3;">${escapeHtml(formatConsultationTime(booking.timeISO))} (${escapeHtml(booking.timezone)})</td></tr>
            <tr><td style="padding:11px;font-weight:800;border-bottom:1px solid #dbe7f3;">Duration</td><td style="padding:11px;border-bottom:1px solid #dbe7f3;">${booking.durationMinutes} minutes</td></tr>
            <tr><td style="padding:11px;font-weight:800;border-bottom:1px solid #dbe7f3;">Amount paid</td><td style="padding:11px;border-bottom:1px solid #dbe7f3;">₹${amountInr.toLocaleString("en-IN")}</td></tr>
            <tr><td style="padding:11px;font-weight:800;">Reference</td><td style="padding:11px;">${escapeHtml(booking.reference)}</td></tr>
          </table>
          ${meetingUrl
            ? `<p style="margin:24px 0;text-align:center;"><a href="${escapeHtml(meetingUrl)}" style="display:inline-block;border-radius:10px;background:#d8b650;color:#071a3a;text-decoration:none;font-weight:900;padding:14px 24px;">Open meeting link</a></p>`
            : `<p style="margin:22px 0 0;padding:14px 16px;border-left:4px solid #d8b650;background:#fff9e8;font-size:14px;line-height:1.7;">The advisory team will send the secure joining instructions to this email address before the consultation.</p>`}
          <p style="margin:20px 0 0;color:#536277;font-size:13px;line-height:1.7;">A calendar file is attached. Please add it to your calendar and join five minutes early. If you need scheduling assistance, reply to this email with your payment reference.</p>
        </div>
      </div>
    </div>`;
}

