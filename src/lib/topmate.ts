// Legacy exports retained so older components keep compiling. All public
// consultation journeys now stay on the XIPHIAS-owned scheduler and JioPay.
export const BOOKING_ROUTE = "/personal-booking#schedule";
export const BOOKING_FREE_ROUTE = BOOKING_ROUTE;
export const BOOKING_PAID_ROUTE = BOOKING_ROUTE;
export const TOPMATE_BOOKING_URL = BOOKING_ROUTE;

export const TOPMATE_REGISTRATION_URL =
  process.env.NEXT_PUBLIC_TOPMATE_REGISTRATION_URL ||
  process.env.TOPMATE_REGISTRATION_URL ||
  "https://topmate.io/xiphias_varun_singh/2147420";

export const REGISTRATION_ROUTE = "/registration";
