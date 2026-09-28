import Image from "next/image";
import ContactForm from "@/components/ContactForm";

type Props = {
  /** Prefix for form field ids - keeps them unique per landing page. */
  idPrefix: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  intro: string;
  points: string[];
  proof: { value: string; label: string }[];
  formHeading?: string;
};

export default function CampaignShell({
  idPrefix, eyebrow, title, titleAccent, intro, points, proof, formHeading,
}: Props) {
  return (
    <main id="main" className="min-h-screen bg-slate-50">
      {/* Minimal bar - logo and phone only. No nav, nowhere to wander off to. */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Image src="/xiphias-immigration.png" alt="XIPHIAS Immigration"
            width={150} height={40} priority className="h-9 w-auto" />
          <a href="tel:+919019400500"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            +91 90194 00500
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_minmax(360px,0.9fr)] lg:gap-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {title}{" "}
              {titleAccent ? <span className="text-blue-700">{titleAccent}</span> : null}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-700">{intro}</p>

            <ul className="mt-7 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] text-slate-800">
                  <svg viewBox="0 0 20 20" aria-hidden="true"
                    className="mt-0.5 h-5 w-5 flex-none fill-blue-700">
                    <path d="M8.3 13.2 5.6 10.5l-1.2 1.2 3.9 3.9 7.3-7.3-1.2-1.2z" />
                  </svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-slate-200 pt-7">
              {proof.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-slate-600">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:sticky lg:top-8 lg:self-start">
            {/* Your existing ContactForm: honeypot, Turnstile, timing check, and it
                already feeds the CRM through /api/contact. Do not swap this for a
                hand-rolled form - the spam layer rejects anything without a token. */}
            <ContactForm
              variant="lead"
              apiEndpoint="/api/contact"
              idPrefix={idPrefix}
              heading={formHeading ?? "Check your eligibility"}
              subheading="A senior advisor will call you back. No cost, no obligation."
              onSuccessRedirect="/lp/thank-you"
              className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8"
            />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          XIPHIAS Immigration Pvt. Ltd. &middot; Koramangala, Bengaluru &middot;{" "}
          <a href="/privacy-policy" className="underline hover:text-slate-700">Privacy policy</a>
        </p>
      </footer>
    </main>
  );
}
