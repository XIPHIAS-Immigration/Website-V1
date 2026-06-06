// src/app/booking/page.tsx
import { redirect } from "next/navigation";
import { TOPMATE_BOOKING_URL } from "@/components/PersonalBooking/booking-flow";

export default async function Page() {
  redirect(TOPMATE_BOOKING_URL);
}
