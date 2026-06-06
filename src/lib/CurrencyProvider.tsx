"use client";
import * as React from "react";

type Currency = "INR" | "USD" | "AED" | "EUR";
type Rates = Record<Currency, number>; // per 1 USD (base)

const DEFAULT_RATES: Rates = {
  USD: 1,
  INR: 83,     // adjust to your preference
  AED: 3.67,
  EUR: 0.92,
};

const CurrencyCtx = React.createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Rates;
  setRates: (r: Rates) => void;
  convert: (amount: number, from: Currency, to: Currency) => number;
}>({
  currency: "INR",
  setCurrency: () => {},
  rates: DEFAULT_RATES,
  setRates: () => {},
  convert: (n) => n,
});

export function CurrencyProvider({
  children,
  defaultCurrency = "INR",
  initialRates = DEFAULT_RATES,
}: {
  children: React.ReactNode;
  defaultCurrency?: Currency;
  initialRates?: Rates;
}) {
  const [currency, setCurrency] = React.useState<Currency>(defaultCurrency);
  const [rates, setRates] = React.useState<Rates>(initialRates);

  const convert = React.useCallback(
    (amount: number, from: Currency, to: Currency) => {
      // All rates are per 1 USD; convert via USD
      const usd = amount / rates[from];     // to USD
      return usd * rates[to];               // to target
    },
    [rates]
  );

  return (
    <CurrencyCtx.Provider value={{ currency, setCurrency, rates, setRates, convert }}>
      {children}
    </CurrencyCtx.Provider>
  );
}

export function useCurrency() {
  return React.useContext(CurrencyCtx);
}
