// ==============================================
// components/seo/JsonLd.tsx – drop-in JSON-LD injector
// ==============================================
import React from "react";
export function JsonLd({ data }: { data: Record<string, any> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}