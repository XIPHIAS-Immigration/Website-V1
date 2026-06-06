"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import BookingModal from "@/components/PersonalBooking/booking-flow/BookingModal";
import { getLocalTimezone } from "@/components/PersonalBooking/booking-flow/utils/time";

export default function BookingRouteClient({ plan }: { plan: "free" | "paid" }) {
  const router = useRouter();

  // Optional: lock body scroll while modal is open (cleaned up on unmount)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function closeAndReturn() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const ref = typeof document !== "undefined" ? document.referrer : "";
    const backTo =
      ref && ref.startsWith(origin)
        ? new URL(ref).pathname + new URL(ref).search
        : "/";

    // Use replace so /booking isn't left in history
    router.replace(backTo, { scroll: true });
  }

  const defaultTimezone = useMemo(() => getLocalTimezone(), []);

  return (
    <BookingModal
      onCloseAction={closeAndReturn}
      initialPlan={plan}
      defaultTimezone={defaultTimezone}
    />
  );
}
