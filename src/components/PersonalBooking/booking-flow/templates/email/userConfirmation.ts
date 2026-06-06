// BACKEND TODO: Send this HTML via your mail service (Resend/SES/SendGrid)
export function userConfirmationHtml(args: {
    fullName: string;
    plan: "free" | "paid";
    dateISO: string;
    timeISO: string;
    timezone: string;
    joinUrl?: string;
    priceINR: string; // e.g. ₹25,500.00
  }) {
    const title = "Your Consultation is Confirmed";
    const when = `${new Date(args.dateISO).toLocaleDateString()} at ${args.timeISO} (${args.timezone})`;
    const plan = args.plan === "free" ? "Free Discovery (15m)" : "Strategy Consultation (60m)";
    const price = args.priceINR;
    return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;">
      <h2>${title}</h2>
      <p>Hi ${args.fullName.split(" ")[0]},</p>
      <p>Thanks for booking with XIPHIAS Immigration. Here are your details:</p>
      <ul>
        <li><b>Plan:</b> ${plan}</li>
        <li><b>When:</b> ${when}</li>
        <li><b>Amount:</b> ${price}</li>
      </ul>
      ${args.joinUrl ? `<p><a href="${args.joinUrl}" style="background:#2563eb;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;">Join Meeting</a></p>` : ""}
      <p>We’ve attached a calendar invite (.ics). See you soon!</p>
      <hr/>
      <p style="color:#6b7280;font-size:12px;">Private Client Service · Discreet & Confidential</p>
    </body></html>`;
  }
  