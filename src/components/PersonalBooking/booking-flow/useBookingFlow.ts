"use client";

import { createContext, useContext } from "react";
import type { BookingPlan } from "./types";

export type OpenArgs = Partial<{
  plan: BookingPlan;  // "free" | "paid"
}>;

export const BookingFlowContext = createContext<{
  open: (args?: OpenArgs) => void;
  close: () => void;
} | null>(null);

export function useBookingFlow() {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error("BookingFlowProvider missing");
  return ctx;
}
