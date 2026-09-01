import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileSearch, FolderLock, Route, UserRoundCheck } from "lucide-react";
import RegistrationCheckout from "@/components/Registration/RegistrationCheckout";
import { getProductConfig } from "@/lib/payments/product-catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Full Immigration Assessment Registration | XIPHIAS",
  description: "Register for a full XIPHIAS immigration assessment, Deep Analysis and secure client CRM onboarding for ₹4,999 including GST.",
  robots: { index: false, follow: false },
};

export default function RegistrationPage() {
  const priceInr = getProductConfig("registration")?.priceInr ?? 5000;

  return (
    <main className="min-h-screen bg-[#eef3f9] pb-24 pt-24 text-[#071a3a]">
      <section className="bg-primary text-white">
        <div className="mx-auto grid max-w-screen-xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c83f]">XIPHIAS full assessment</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Register once. Get the analysis and your client CRM.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/65">For ₹4,999 including GST, start a structured immigration assessment, receive the included Deep Analysis and manage the next steps in the XIPHIAS client CRM.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Deep Analysis report included", "Secure client CRM access", "Registration and payment visible in CRM", "Advisor handoff and next-step plan"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-white/75"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="size-3" /></span>{item}</div>)}
            </div>
            <a href="#registration-checkout" className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-[#d8ad1f] px-7 text-base font-black text-primary">Register for ₹{priceInr.toLocaleString("en-IN")} <ArrowRight className="size-5" /></a>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [FileSearch, "Assessment", "Build the evidence-led profile"],
              [Route, "Deep Analysis", "Review route fit and gaps"],
              [FolderLock, "Client CRM", "Organise documents and milestones"],
              [UserRoundCheck, "Handoff", "Prepare the case for advisor review"],
            ].map(([Icon, title, copy], index) => {
              const ItemIcon = Icon as typeof FileSearch;
              return <div key={String(title)} className="rounded-2xl border border-white/15 bg-white/[0.055] p-5"><ItemIcon className="size-6 text-[#f0c83f]" /><p className="mt-4 text-xs font-black text-[#f0c83f]">0{index + 1}</p><h2 className="mt-1 text-lg font-black">{String(title)}</h2><p className="mt-1 text-sm leading-6 text-white/50">{String(copy)}</p></div>;
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-screen-xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0b4ea2]">What happens next</p>
          <ol className="mt-6 space-y-6">
            {[
              ["Pay securely", "Complete the short checkout form and pay through JioPay."],
              ["Open the client CRM", "Your CRM client ID, paid receipt and secure access are created after verified payment."],
              ["Complete the profile", "Add the full personal, education, employment and document history securely after payment."],
              ["Receive the assessment", "The Deep Analysis and advisor-ready next steps use the information actually supplied."],
            ].map(([title, copy], index) => <li key={title} className="flex gap-4"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#071a3a] text-xs font-black text-[#d8ad1f]">{index + 1}</span><div><h2 className="font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p></div></li>)}
          </ol>
          <p className="mt-7 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-500">Registration does not guarantee visa eligibility or approval. Supplied facts remain authoritative; missing information stays explicit until provided and verified.</p>
          <Link href="/reports" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0b4ea2]">Only need a standalone report? <ArrowRight className="size-4" /></Link>
        </aside>
        <RegistrationCheckout priceInr={priceInr} />
      </section>
    </main>
  );
}
