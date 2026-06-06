// Use these anywhere as <Link href={BOOKING_PAID_ROUTE} />
export const BOOKING_ROUTE = "/booking";
export const BOOKING_FREE_ROUTE = "/booking?plan=free";
export const BOOKING_PAID_ROUTE = "/booking?plan=paid";

// Third-party booking — all booking actions redirect here
export const TOPMATE_BOOKING_URL = "https://topmate.io/xiphias_varun_singh/2083711";

// re-export (optional)
export { default as BookingModal } from "./BookingModal";
