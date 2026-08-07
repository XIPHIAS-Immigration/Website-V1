import { Clock3, MessageSquareText, ShieldCheck } from "lucide-react";

import ContactForm from "@/components/ContactForm";

export function XiaContactPanel({
  context,
  idPrefix,
}: {
  context: string;
  idPrefix: string;
}) {
  return (
    <section
      aria-labelledby={`${idPrefix}-contact-heading`}
      className="mt-10 rounded-lg border border-white/25 bg-black/10 p-5 sm:p-7"
    >
      <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="type-caption inline-flex items-center gap-2 text-secondary">
            <MessageSquareText className="size-4" aria-hidden="true" />
            Advisor Support
          </span>
          <h2
            id={`${idPrefix}-contact-heading`}
            className="type-section-title mt-3 max-w-xl text-white"
          >
            Discuss Your {context} Results
          </h2>
          <p className="type-body mt-3 max-w-xl text-white/80">
            Share your number and a XIPHIAS advisor will help you understand the result, documentation requirements, and practical next steps.
          </p>
          <div className="type-small mt-5 flex flex-col gap-3 text-white/85 sm:flex-row sm:flex-wrap">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-secondary" aria-hidden="true" />
              Response Within One Business Day
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-secondary" aria-hidden="true" />
              Confidential Enquiry
            </span>
          </div>
        </div>

        <ContactForm
          variant="quick"
          idPrefix={idPrefix}
          heading="Talk to a XIPHIAS Advisor"
          subheading={`Request a callback about your ${context} results.`}
          className="max-w-none rounded-lg"
        />
      </div>
    </section>
  );
}
