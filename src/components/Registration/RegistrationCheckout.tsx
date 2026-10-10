"use client";

// src/components/Registration/RegistrationCheckout.tsx
// -----------------------------------------------------------------------------
// The ₹4,999 checkout. Arrives pre-filled: the route the visitor chose on the
// Start page or in XIA (`?route=<programmeId>`), and anything the case already
// knows — name, email, phone, destination, goal — so nobody is asked twice.
// -----------------------------------------------------------------------------

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { trackEvent } from "@/lib/eligibility/analytics";
import { programmeRuleById, type ProgrammeRule } from "@/lib/xia/programme-requirements";
import { openerLabel } from "@/lib/xia/script";

type RegistrationForm = {
  name: string;
  email: string;
  phone: string;
  country: string;
  goal: string;
  track: "skilled" | "residency" | "citizenship" | "corporate";
  consent: boolean;
  company: string;
};

const inputClass = "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0b4ea2] focus:ring-2 focus:ring-[#0b4ea2]/15";
const SNAPSHOT_KEY = "xia_case_snapshot";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-bold text-slate-900">{label}</span><span className="mt-2 block">{children}</span></label>;
}

type Snapshot = { name?: string; email?: string; phone?: string; destination?: string; goal?: string };

function readSnapshot(): Snapshot {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as Snapshot) : {};
  } catch {
    return {};
  }
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RegistrationCheckout({ priceInr }: { priceInr: number }) {
  return (
    <Suspense fallback={<CheckoutForm priceInr={priceInr} route={null} place={null} />}>
      <RoutedCheckout priceInr={priceInr} />
    </Suspense>
  );
}

const TRACKS: RegistrationForm["track"][] = ["skilled", "residency", "citizenship", "corporate"];

/** A country page's "Get started": the country and category, with the route still open. */
type Place = { country: string; track: RegistrationForm["track"] | null };

function RoutedCheckout({ priceInr }: { priceInr: number }) {
  const params = useSearchParams();
  const route = programmeRuleById.get(params.get("route") ?? "") ?? null;
  const country = (params.get("country") ?? "").trim().slice(0, 60);
  const trackParam = params.get("track") ?? "";
  const place: Place | null = !route && country ? { country, track: (TRACKS as string[]).includes(trackParam) ? (trackParam as RegistrationForm["track"]) : null } : null;
  return <CheckoutForm priceInr={priceInr} route={route} place={place} />;
}

function CheckoutForm({ priceInr, route, place }: { priceInr: number; route: ProgrammeRule | null; place: Place | null }) {
  const [form, setForm] = useState<RegistrationForm>({
    name: "", email: "", phone: "", country: "", goal: "", track: route?.track ?? place?.track ?? "skilled", consent: false, company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const update = <K extends keyof RegistrationForm>(key: K, value: RegistrationForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  // Pre-fill from what XIA already knows. Only empty fields are touched, so a
  // visitor who has started typing is never overwritten.
  useEffect(() => {
    const snap = readSnapshot();
    const goalLabel = openerLabel("goal", snap.goal);
    const destination = snap.destination && snap.destination !== "not-sure" ? titleCase(snap.destination) : "";
    setForm((current) => ({
      ...current,
      name: current.name || snap.name || "",
      email: current.email || snap.email || "",
      phone: current.phone || snap.phone || "",
      country: current.country || route?.country || place?.country || destination,
      goal: current.goal || goalLabel,
      track: route?.track ?? place?.track ?? current.track,
    }));
  }, [route, place]);

  const submit = async () => {
    setError("");
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Enter your full name and a valid email address.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Enter a phone or WhatsApp number so the assessment team can reach you.");
      return;
    }
    if (!form.consent) {
      setError("Please accept the privacy and assessment-processing consent.");
      return;
    }
    setSubmitting(true);
    trackEvent("registration_checkout_started", { value: priceInr, currency: "INR" });
    try {
      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          consent: form.consent,
          startedAt,
          productType: "registration",
          productName: "XIPHIAS Full Assessment Registration and Deep Analysis",
          track: form.track,
          country: form.country,
          program: route ? `${route.title} (${route.country})` : place ? `${place.country} ${place.track ?? ""} routes`.trim() : form.goal || "Full immigration assessment",
          page: route ? `/registration?route=${route.id}` : place ? `/registration?country=${encodeURIComponent(place.country)}` : "/registration",
          answers: {
            goal: form.goal,
            targetCountry: form.country,
            chosenRoute: route ? route.id : undefined,
            chosenRouteTitle: route ? route.title : undefined,
            deepAnalysisIncluded: true,
            deferDetailedReport: true,
            onboardingStage: "registration_checkout",
          },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; checkoutUrl?: string; error?: string; filtered?: boolean };
      if (!response.ok || !data.ok || !data.checkoutUrl) {
        throw new Error(
          data.error ||
            (data.filtered
              ? "Your checkout was started a moment ago. Please wait a few seconds and press the button again."
              : "Secure checkout could not be started."),
        );
      }
      trackEvent("registration_checkout_redirect", { value: priceInr, currency: "INR" });
      window.location.assign(data.checkoutUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Secure checkout could not be started.");
      setSubmitting(false);
    }
  };

  return (
    <section id="registration-checkout" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 text-slate-950 shadow-[0_20px_60px_rgba(7,26,58,0.14)] sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b4ea2]">Step 1 of onboarding</p>
      <h2 className="mt-3 text-2xl font-black">Register and create your case</h2>
      {route ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#d8ad1f]/50 bg-[#fff9e8] px-4 py-3">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a6a0a]">Getting started on</span>
          <span className="text-[15px] font-black text-primary">{route.title}</span>
          <span className="text-[13px] font-bold text-primary/60">{route.country}</span>
          <Link href="/?xia=1" className="ml-auto text-[12.5px] font-bold text-primary underline-offset-4 hover:underline">Change route</Link>
        </div>
      ) : place ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#d8ad1f]/50 bg-[#fff9e8] px-4 py-3">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8a6a0a]">Getting started in</span>
          <span className="text-[15px] font-black text-primary">{place.country}</span>
          <span className="text-[13px] font-bold text-primary/60">The assessment team picks the route with you</span>
        </div>
      ) : null}
      <p className="mt-2 text-sm leading-6 text-slate-500">Only checkout essentials are required now. Your full profile and documents are completed securely after payment.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name"><input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} autoComplete="name" /></Field>
        <Field label="Email address"><input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" /></Field>
        <Field label="Phone / WhatsApp"><input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} autoComplete="tel" /></Field>
        <Field label="Immigration category"><select className={inputClass} value={form.track} onChange={(event) => update("track", event.target.value as RegistrationForm["track"])}><option value="skilled">Skilled migration</option><option value="residency">Residency</option><option value="citizenship">Citizenship</option><option value="corporate">Business / corporate mobility</option></select></Field>
        <Field label="Target country (if known)"><input className={inputClass} value={form.country} onChange={(event) => update("country", event.target.value)} placeholder="Open to suggestions" /></Field>
        <Field label="Primary goal"><input className={inputClass} value={form.goal} onChange={(event) => update("goal", event.target.value)} placeholder="For example permanent residence" /></Field>
        <input tabIndex={-1} aria-hidden="true" className="hidden" value={form.company} onChange={(event) => update("company", event.target.value)} autoComplete="off" />
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-6 text-slate-600"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#d8ad1f]" /><span>I agree to the <Link href="/privacy-policy" className="font-bold text-[#0b4ea2] underline">privacy policy</Link> and to XIPHIAS processing these details for payment, assessment onboarding, report preparation and relevant support.</span></label>
      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p> : null}
      <button type="button" onClick={submit} disabled={submitting} className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#d8ad1f] px-6 text-base font-black text-primary transition hover:bg-[#efc939] disabled:cursor-wait disabled:opacity-70">
        {submitting ? <LoaderCircle className="size-5 animate-spin" /> : <CreditCard className="size-5" />}
        {submitting ? "Starting secure checkout..." : `Register and pay ₹${priceInr.toLocaleString("en-IN")}`}
      </button>
      <p className="mt-3 text-center text-xs font-semibold text-slate-500">₹{priceInr.toLocaleString("en-IN")} including GST. Deep Analysis report included.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-400"><span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> Server-enforced price</span><span className="inline-flex items-center gap-1"><Check className="size-3.5" /> Secure JioPay checkout</span></div>
    </section>
  );
}
