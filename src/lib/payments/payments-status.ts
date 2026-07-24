// Public payment switch. Payments are enabled by default; production can set
// NEXT_PUBLIC_PAYMENTS_DISABLED=true as an emergency kill-switch and rebuild.
const ENV_FLAG = process.env.NEXT_PUBLIC_PAYMENTS_DISABLED;

export const PAYMENTS_DISABLED: boolean = ENV_FLAG != null ? ENV_FLAG === "true" : false;

export const PAYMENTS_COMING_SOON_LABEL = "Coming soon";
