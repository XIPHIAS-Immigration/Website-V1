// src/components/Contact/LeadTabs.tsx
"use client";

import * as React from "react";
import SectionCard from "@/components/Contact/SectionCard";
import ContactForm from "@/components/ContactForm";

export default function LeadTabs({
  id,
  emailTo,
  phoneFallback,
}: {
  id?: string;
  emailTo: string;
  phoneFallback?: string;
}) {
  return (
    <SectionCard
      id={id}
      className="p-0 overflow-hidden h-full flex flex-col bg-none"
      aria-labelledby={id ? `${id}-contact-form` : undefined}
    >
      <div
        className=" py-4  md:py-5 flex-1 flex flex-col bg-none"
        id={id ? `${id}-contact-form` : undefined}
      >
        <ContactForm />
      </div>
    </SectionCard>
  );
}