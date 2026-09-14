// src/lib/xia/events.ts
// -----------------------------------------------------------------------------
// Browser events the XIA surfaces use to talk to each other without importing
// each other's bundles. A constant lives here so the concierge does not have to
// pull the contact modal (and react-hot-toast with it) into its chunk.
// -----------------------------------------------------------------------------

/** Fired when the hero contact gate is out of the way and XIA may take over. */
export const XIA_UNLOCK_EVENT = "xiphias-xia-unlock";

export type XiaUnlockDetail = {
  /** Present only when the visitor actually gave it. Never guessed. */
  name?: string;
  /** True when we now hold contact details — checkout can skip its form. */
  captured: boolean;
};
