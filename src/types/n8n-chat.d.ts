// src/types/n8n-chat.d.ts
import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "n8n-chat": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "webhook-url"?: string;
      };
    }
  }
}

export {};