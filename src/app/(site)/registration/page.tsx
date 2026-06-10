import { redirect } from "next/navigation";
import Link from "next/link";
import { TOPMATE_REGISTRATION_URL } from "@/lib/topmate";

export const dynamic = "force-dynamic";

function registrationUrl() {
  return TOPMATE_REGISTRATION_URL;
}

export default function RegistrationRedirectPage() {
  const target = registrationUrl();
  if (target) redirect(target);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <section className="mx-auto max-w-3xl rounded-lg border border-white/15 bg-white/8 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8b650]">XIPHIAS registration</p>
        <h1 className="mt-3 text-3xl font-black tracking-normal">Detailed assessment registration</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
          The INR 10,000 Topmate registration product is not configured yet. Create the product in Topmate, then set
          <strong> TOPMATE_REGISTRATION_URL</strong> in the deployment environment. The consultation booking flow remains separate.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/eligibility#start" className="rounded-md bg-[#d8b650] px-4 py-2.5 text-sm font-black text-slate-950">
            Start assessment
          </Link>
          <Link href="/contact" className="rounded-md border border-white/20 px-4 py-2.5 text-sm font-bold text-white">
            Contact XIPHIAS
          </Link>
        </div>
      </section>
    </main>
  );
}
