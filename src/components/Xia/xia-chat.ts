// src/components/Xia/xia-chat.ts
// -----------------------------------------------------------------------------
// Opening the assistant, from anywhere, without importing it.
//
// "Ask XIA" appears in the hero, in the nav, in the dock and in the band under
// the hero. If each of those imported the chat component, every page would pay
// for the chat's bundle whether or not anyone opened it. They dispatch an event
// instead; one host listens.
// -----------------------------------------------------------------------------

export const XIA_CHAT_EVENT = "xiphias-xia-chat-open";

export type XiaChatOpenDetail = {
  /** Whatever the visitor had already typed, so the chat opens mid-sentence. */
  seed?: string;
  /**
   * Go straight to the routes when the visitor has answered before. Only the
   * ways BACK to the options ("My routes", "← My options") set this; every
   * front door asks the three questions first.
   */
  resume?: boolean;
};

/**
 * Fired when XIA is dismissed without the visitor giving their details — the
 * chat closed, or the greeter waved away. The contact form listens for it.
 */
export const XIA_CLOSED_EVENT = "xiphias-xia-closed";

export function closeXiaChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(XIA_CLOSED_EVENT));
}

export function openXiaChat(options?: string | XiaChatOpenDetail) {
  if (typeof window === "undefined") return;
  const detail: XiaChatOpenDetail = typeof options === "string" ? { seed: options } : { ...options };
  window.dispatchEvent(new CustomEvent<XiaChatOpenDetail>(XIA_CHAT_EVENT, { detail }));
}
