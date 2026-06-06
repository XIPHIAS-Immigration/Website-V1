# Booking Flow — Front-end + Single-File Integration Adapter

This folder contains a **self-contained booking popup** for your Personal Paid Consultation pages. It is designed to:

- run **front-end only** today (mocked backend, zero errors)
- switch to **real APIs** later by changing **two env vars**
- keep **all backend connections in one place** (payments, emails, CRM, calendar, slot locking)
- be triggered **anywhere via a simple href** (`/booking?plan=paid`)
- avoid changes to your global layout

---

## 0) What ships today

- Modal with **5 steps**: Choose plan → Pick a slot → Your details → Review → Confirmation
- A dedicated route `/booking` that renders only the popup and then returns to the previous page
- **Mock adapter**: simulates slot hold, (paid) Razorpay checkout, and confirmation
- Tailwind UI; accessible; responsive; light and clean

---

## 1) Folder map

booking-flow/
BookingModal.tsx
index.ts
steps/
PlanStep.tsx
CalendarStep.tsx
DetailsStep.tsx
ReviewStep.tsx
ConfirmationStep.tsx
utils/
time.ts
connectors/
adapter.ts # contract (types + interface)
mockAdapter.ts # works now (no backend)
remoteAdapter.ts # minimal fetch wrappers; backend updates only URLs
razorpay.ts # front-end Razorpay opener (loads JS)
index.ts # single API the UI calls: bookAndMaybePay()
templates/
email/
userConfirmation.ts
adminNotification.ts
README.txt

src/app/booking/page.tsx
src/app/booking/route-client.tsx


---

## 2) Quick start (dev, no backend)

1) **Use mock adapter**  
   Create or edit `.env.local`:
   ```dotenv
   NEXT_PUBLIC_BOOKING_ADAPTER=mock


Start

npm run dev


Open

http://localhost:3000/booking?plan=free

http://localhost:3000/booking?plan=paid

Next.js 15 note: searchParams is async; our page.tsx already awaits it.

3) Trigger from anywhere (no JS needed)

Import reusable routes and use plain <Link>:

import Link from "next/link";
import {
  BOOKING_FREE_ROUTE,
  BOOKING_PAID_ROUTE,
  BOOKING_ROUTE
} from "@/components/PersonalBooking/booking-flow";

<Link href={BOOKING_PAID_ROUTE}>Reserve Your Consultation</Link>
<Link href={BOOKING_FREE_ROUTE}>Book a Free Consultation</Link>
<Link href={BOOKING_ROUTE}>Book Now</Link>  {/* defaults to free */}


Close returns to the previous page (or /) and restores scroll.

4) Architecture — “single-file integration”

UI makes one call:

import { bookAndMaybePay } from "./connectors";
await bookAndMaybePay(bookingInput);


Internally, an adapter handles everything:

mockAdapter (today)

remoteAdapter (when backend is ready)

Switch via env:

# mock (default)
NEXT_PUBLIC_BOOKING_ADAPTER=mock

# go live
NEXT_PUBLIC_BOOKING_ADAPTER=remote
NEXT_PUBLIC_BOOKING_API_BASE=https://api.yourdomain.com


No other UI files change.

5) Backend contract (5 endpoints)

Backend devs only need this section. All calls live in connectors/remoteAdapter.ts.

5.1 GET /availability?date=YYYY-MM-DD&tz=Asia/Kolkata

Return slot statuses so UI can disable non-free times.

{
  "dateISO": "2025-11-01",
  "timezone": "Asia/Kolkata",
  "slots": [
    { "timeISO": "09:00", "status": "free" },
    { "timeISO": "11:00", "status": "booked" },
    { "timeISO": "14:00", "status": "held" },
    { "timeISO": "17:00", "status": "free" }
  ]
}

5.2 POST /bookings (create draft + hold slot)

Request (body is the user’s form):

{
  "plan": "free|paid",
  "durationMin": 60,
  "priceCents": 1250000,
  "timezone": "Asia/Kolkata",
  "dateISO": "2025-11-01",
  "timeISO": "14:00",
  "fullName": "Anish Kumar",
  "email": "anish@example.com",
  "phone": "+9198...",
  "notes": "Any notes"
}


Response:

{
  "id": "bk_123",
  "paymentRequired": true,
  "amountCents": 1250000,
  "holdExpiresAt": "2025-11-01T08:40:00Z"
}

5.3 POST /payments/razorpay/order
{ "bookingId": "bk_123" }

{
  "keyId": "rzp_live_xxx",
  "orderId": "order_ABC",
  "amount": 1250000,
  "currency": "INR",
  "customer": { "name": "Anish Kumar", "email": "anish@example.com", "contact": "+9198..." },
  "notes": { "bookingId": "bk_123" }
}

5.4 POST /payments/razorpay/verify
{
  "bookingId": "bk_123",
  "orderId": "order_ABC",
  "paymentId": "pay_DEF",
  "signature": "razorpay_signature_string"
}

{ "ok": true }

5.5 POST /bookings/:id/confirm

Server must:

validate slot; ensure payment captured for paid

send emails (user + admin)

create calendar invite .ics (and/or Google/Outlook event), return joinUrl

push to CRM

mark status booked

Response:

{
  "ok": true,
  "reference": "bk_123",
  "joinUrl": "https://meet.link/xyz",
  "icsUrl": "https://api.yourdomain.com/ics/bk_123.ics"
}


Webhook safety: also handle Razorpay payment.captured → confirm booking server-side.

6) Razorpay in the front-end

connectors/razorpay.ts dynamically loads https://checkout.razorpay.com/v1/checkout.js, opens checkout, and returns:

{ orderId: string; paymentId: string; signature: string }


Server verifies these in /payments/razorpay/verify.

Paid flow:

create draft (hold)

create order

open checkout (front-end)

verify on server

confirm (emails, calendar, CRM)

Free flow:

create draft (hold)

confirm immediately

7) Calendar availability (optional now, turnkey later)

CalendarStep.tsx calls getAvailability(dateISO, tz) from the adapter.
With mock it shows a simple list; when APIs are live it will disable held/booked slots automatically.

8) Email templates & calendar

Provided under templates/email/:

userConfirmation.ts — client email (attach .ics)

adminNotification.ts — internal notification

Backend should:

generate .ics for the confirmed slot

attach to user email

optionally create Google/Outlook event and return joinUrl via /confirm

You may use Resend / SendGrid / SES.

9) UX / accessibility

Modal uses role="dialog", locks body scroll while open, restores on unmount

Close navigates back (or /) using router.replace() so /booking isn’t left in history

Buttons are standard links (SEO-friendly); interactivity is client-side

10) Troubleshooting

A) “searchParams should be awaited” on /booking
Use the shipped page.tsx which does:

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: "free"|"paid" }> }) {
  const sp = await searchParams;
  // ...
}


B) “Processing…” stuck (Free)
You’re using the remote adapter without a backend. Set:

NEXT_PUBLIC_BOOKING_ADAPTER=mock


Restart npm run dev.

C) TS errors in remoteAdapter.ts
Use the included version where helper j<T> accepts a Promise<Response>.

D) Close freezes scroll
route-client.tsx sets document.body.style.overflow='hidden' on mount and restores on unmount; and it navigates away from /booking on close. If you override overflow elsewhere, restore it in cleanup.

11) Going live — checklist for backend

Implement the 5 endpoints exactly as in §5 (plus Razorpay webhook).

Emails & CRM updates run inside /bookings/:id/confirm (use provided templates).

Generate .ics; optionally create Google/Outlook event and return joinUrl.

Set env on front-end and redeploy:

NEXT_PUBLIC_BOOKING_ADAPTER=remote
NEXT_PUBLIC_BOOKING_API_BASE=https://api.yourdomain.com


Done — front-end needs no code changes.

12) OpenAPI sketch (optional, for backend scaffolding)
openapi: 3.0.0
info: { title: Booking API, version: 1.0.0 }
paths:
  /availability:
    get:
      parameters:
        - { name: date, in: query, required: true, schema: { type: string, format: date } }
        - { name: tz, in: query, required: true, schema: { type: string } }
      responses: { "200": { description: OK } }
  /bookings:
    post:
      requestBody: { required: true }
      responses: { "200": { description: Draft created } }
  /payments/razorpay/order:
    post:
      requestBody: { required: true }
      responses: { "200": { description: Order init } }
  /payments/razorpay/verify:
    post:
      requestBody: { required: true }
      responses: { "200": { description: Verified } }
  /bookings/{id}/confirm:
    post:
      parameters: [ { name: id, in: path, required: true, schema: { type: string } } ]
      responses: { "200": { description: Confirmed } }

13) Maintenance tips

All integration logic lives in connectors/. Changing backend behavior usually means touching only remoteAdapter.ts.

Price/duration defaults live in BookingModal.tsx:

const paidDefaults = { durationMin: 60, priceCents: 1250000 }; // ₹12,500
const freeDefaults = { durationMin: 15, priceCents: 0 };


Copy and micro-UX strings are local to each step component.

You’re good to go.
Mock mode works today; when APIs are ready, flip two env vars and the flow goes live (Razorpay + emails + CRM + calendar) with no UI changes.