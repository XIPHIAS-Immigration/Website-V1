// BACKEND TODO: Send to admin(s) on booking confirm
export function adminNotificationHtml(args: {
    bookingId: string;
    fullName: string;
    email: string;
    phone?: string;
    notes?: string;
    plan: "free" | "paid";
    dateISO: string;
    timeISO: string;
    timezone: string;
    paid: boolean;
    amountINR: string;
  }) {
    const when = `${new Date(args.dateISO).toLocaleDateString()} ${args.timeISO} (${args.timezone})`;
    return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;">
      <h3>New Booking: ${args.plan.toUpperCase()}</h3>
      <p><b>Ref:</b> ${args.bookingId}</p>
      <ul>
        <li><b>Name:</b> ${args.fullName}</li>
        <li><b>Email:</b> ${args.email}</li>
        ${args.phone ? `<li><b>Phone:</b> ${args.phone}</li>` : ""}
        <li><b>When:</b> ${when}</li>
        <li><b>Amount:</b> ${args.amountINR} (${args.paid ? "PAID" : "FREE"})</li>
        ${args.notes ? `<li><b>Notes:</b> ${args.notes}</li>` : ""}
      </ul>
    </body></html>`;
  }
  