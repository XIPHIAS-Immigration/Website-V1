"use client";

export type RazorpayProof = { orderId: string; paymentId: string; signature: string };

/** Front-end Razorpay opener. Backend not involved here. */
export async function openRazorpayCheckout(init: {
  keyId: string; orderId: string; amount: number; currency: "INR";
  customer: { name: string; email: string; contact?: string };
  notes?: Record<string,string>;
}): Promise<RazorpayProof> {
  await ensureScript();
  return new Promise((resolve, reject) => {
    const rz = new (window as any).Razorpay({
      key: init.keyId,
      order_id: init.orderId,
      amount: init.amount,
      currency: init.currency,
      name: "XIPHIAS Immigration",
      prefill: init.customer,
      notes: init.notes,
      handler: (res: any) => resolve({
        orderId: res.razorpay_order_id,
        paymentId: res.razorpay_payment_id,
        signature: res.razorpay_signature,
      }),
      modal: { ondismiss: () => reject(new Error("Payment dismissed")) },
      theme: { color: "#2563eb" },
    });
    rz.open();
  });
}

async function ensureScript() {
  if (typeof window === "undefined") return;
  if ((window as any).Razorpay) return;
  await new Promise<void>((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}
