import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Thank You | XIPHIAS Immigration",
  description: "We have received your details and an advisor will be in touch shortly.",
  robots: { index: false, follow: false },
};

// This URL is the Google Ads conversion goal. It is only ever reached after a
// form has been submitted successfully, so a visit here means a real lead.
export default function CampaignThankYouPage() {
  return (
    <main id="main" className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Image src="/xiphias-immigration.png" alt="XIPHIAS Immigration"
            width={150} height={40} priority className="h-9 w-auto" />
          <a href="tel:+919019400500" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            +91 90194 00500
          </a>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200 sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-7 w-7 fill-green-700">
              <path d="M8.3 13.2 5.6 10.5l-1.2 1.2 3.9 3.9 7.3-7.3-1.2-1.2z" />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Thank you &mdash; we have your details.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
            A senior advisor will call you within one working day. If your enquiry is urgent,
            call us directly and mention that you submitted the form online.
          </p>

          <a href="tel:+919019400500"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-blue-800">
            Call +91 90194 00500
          </a>

          <p className="mt-6 border-t border-slate-200 pt-5 text-sm text-slate-600">
            While you wait, you can{" "}
            <a href="/tools/crs-calculator" className="font-medium text-blue-700 underline hover:text-blue-900">
              score your Express Entry profile
            </a>{" "}
            or{" "}
            <a href="/residency" className="font-medium text-blue-700 underline hover:text-blue-900">
              browse residency programmes
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
