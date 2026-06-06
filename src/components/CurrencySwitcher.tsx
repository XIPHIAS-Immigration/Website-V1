"use client";
import * as React from "react";
import { useCurrency } from "@/lib/CurrencyProvider";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="opacity-70">Currency:</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as any)}
        className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="INR">INR ₹</option>
        <option value="USD">USD $</option>
        <option value="AED">AED د.إ</option>
        <option value="EUR">EUR €</option>
      </select>
    </label>
  );
}
