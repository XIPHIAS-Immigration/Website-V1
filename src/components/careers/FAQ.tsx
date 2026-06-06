// src/components/careers/FAQ.tsx
export default function FAQ() {
  const faqs = [
    {
      q: "Do you offer remote roles?",
      a: "We are currently hiring for work-from-office positions from our Bengaluru headquarters and branch offices in India.",
    },
    {
      q: "What documents should I prepare?",
      a: "A current resume, LinkedIn profile, and any portfolio or case samples relevant to the role.",
    },
    {
      q: "Do you support career growth?",
      a: "We offer certification reimbursements, mentorship, and role-specific learning and development support.",
    },
    {
      q: "What’s the typical timeline?",
      a: "We aim to complete the process within 2–4 weeks depending on the role and availability.",
    },
    {
      q: "What if I don’t see a matching role?",
      a: "You can still share your resume via Quick Apply and we’ll contact you when a suitable role opens.",
    },
  ];

  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <section aria-labelledby="faq">
      {/* SEO: FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd }}
      />

      <div
        className={[
          "rounded-3xl p-6 sm:p-8",
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
          "dark:from-blue-950/30 dark:to-indigo-950/20 dark:ring-blue-900/40",
          "text-black dark:text-white",
        ].join(" ")}
      >
        <h2 id="faq" className="text-xl font-bold tracking-tight">
          FAQ
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-black/10 bg-white/85 p-4 ring-1 ring-black/5 open:bg-white dark:border-white/20 dark:bg-white/5 dark:ring-white/5"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-black outline-none dark:text-white">
                {f.q}
                {/* plus/minus icon that flips when open */}
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/20 text-black dark:border-white/30 dark:text-white"
                >
                  {/* plus */}
                  <svg
                    className="h-3.5 w-3.5 group-open:hidden"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 4v12M4 10h12" />
                  </svg>
                  {/* minus */}
                  <svg
                    className="hidden h-3.5 w-3.5 group-open:block"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 10h12" />
                  </svg>
                </span>
              </summary>
              <p className="mt-2 text-sm">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs opacity-80">
            Still have questions?{" "}
            <a
              href="mailto:hr@xiphias.in"
              className="underline decoration-2 underline-offset-2"
            >
              hr@xiphias.in
            </a>
          </p>
          <a
            href="#apply"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Quick Apply
          </a>
        </div>
      </div>
    </section>
  );
}