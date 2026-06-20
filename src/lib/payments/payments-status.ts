// Temporary kill-switch for live report payments.
//
// While the JioPay transaction-value limit (error P1006 — "Transaction value limit has
// exhausted") is being restored, every public "buy report" button is disabled and shows
// "Coming soon" on hover, and the checkout API refuses with a friendly message.
//
// TO RE-ENABLE PAYMENTS: set PAYMENTS_DISABLED back to `false` (or set the env var
// NEXT_PUBLIC_PAYMENTS_DISABLED=false), then rebuild + restart.
//
// An env override is supported so it can be toggled without a code edit; the constant is the
// default when the env var is unset.
const ENV_FLAG = process.env.NEXT_PUBLIC_PAYMENTS_DISABLED;

export const PAYMENTS_DISABLED: boolean = ENV_FLAG != null ? ENV_FLAG === "true" : true;

export const PAYMENTS_COMING_SOON_LABEL = "Coming soon";
