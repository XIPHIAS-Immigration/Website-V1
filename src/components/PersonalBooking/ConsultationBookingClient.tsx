"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PAYMENTS_DISABLED, PAYMENTS_COMING_SOON_LABEL } from "@/lib/payments/payments-status";

type Slot = { timeISO: string; status: "available" | "held" | "booked" };
type AvailabilityDay = { dateISO: string; slots: Slot[] };
type AvailabilityResponse = {
  ok?: boolean;
  priceInr?: number;
  timezone?: string;
  durationMinutes?: number;
  holdMinutes?: number;
  firstDate?: string;
  lastDate?: string;
  days?: AvailabilityDay[];
  error?: string;
};

type Details = {
  name: string;
  email: string;
  phone: string;
  country: string;
  focus: string;
  notes: string;
  consent: boolean;
  company: string;
};

const EMPTY_DETAILS: Details = {
  name: "",
  email: "",
  phone: "",
  country: "",
  focus: "",
  notes: "",
  consent: false,
  company: "",
};

const FOCUS_OPTIONS = [
  "Skilled migration and permanent residency",
  "Residency or citizenship by investment",
  "Business or entrepreneur migration",
  "US visa strategy",
  "Family migration",
  "Compare countries or programmes",
  "Case risk or refusal review",
  "Other immigration strategy",
];

function formatPrice(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatDate(dateISO: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

function formatTime(timeISO: string) {
  const [hour, minute] = timeISO.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

function monthKey(dateISO: string) {
  return dateISO.slice(0, 7);
}

function monthLabel(key: string) {
  return formatDate(`${key}-01`, { month: "long", year: "numeric" });
}

function calendarCells(key: string) {
  const [year, month] = key.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1, 12));
  const count = new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
  const cells: Array<string | null> = Array.from({ length: first.getUTCDay() }, () => null);
  for (let day = 1; day <= count; day += 1) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}

function inputClass() {
  return "mt-2 min-h-12 w-full rounded-xl border border-[#c8daf0] bg-white px-4 text-[15px] text-[#071a3a] outline-none transition placeholder:text-slate-400 focus:border-[#1f5fbc] focus:ring-4 focus:ring-[#1f5fbc]/10";
}

export default function ConsultationBookingClient({
  initialPriceInr,
  initialDurationMinutes,
}: {
  initialPriceInr: number;
  initialDurationMinutes: number;
}) {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visibleMonth, setVisibleMonth] = useState("");
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [startedAt] = useState(() => Date.now());

  async function loadAvailability() {
    setLoadingAvailability(true);
    setAvailabilityError("");
    try {
      const response = await fetch("/api/consultations/availability", { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as AvailabilityResponse;
      if (!response.ok || !data.ok || !data.days?.length) {
        throw new Error(data.error || "Consultation availability could not be loaded.");
      }
      setAvailability(data);
      setVisibleMonth((current) => current || monthKey(data.firstDate || data.days![0].dateISO));
    } catch (error) {
      setAvailabilityError(error instanceof Error ? error.message : "Consultation availability could not be loaded.");
    } finally {
      setLoadingAvailability(false);
    }
  }

  useEffect(() => {
    void loadAvailability();
  }, []);

  const daysByDate = useMemo(
    () => new Map((availability?.days || []).map((day) => [day.dateISO, day])),
    [availability],
  );
  const months = useMemo(
    () => [...new Set((availability?.days || []).map((day) => monthKey(day.dateISO)))],
    [availability],
  );
  const selectedDay = selectedDate ? daysByDate.get(selectedDate) : undefined;
  const priceInr = availability?.priceInr || initialPriceInr;
  const durationMinutes = availability?.durationMinutes || initialDurationMinutes;
  const timezone = availability?.timezone || "Asia/Kolkata";
  const monthIndex = Math.max(0, months.indexOf(visibleMonth));
  const cells = visibleMonth ? calendarCells(visibleMonth) : [];

  const detailsValid =
    details.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(details.email.trim()) &&
    details.phone.replace(/\D/g, "").length >= 8 &&
    Boolean(details.country.trim()) &&
    Boolean(details.focus) &&
    details.consent;

  function updateDetails<K extends keyof Details>(key: K, value: Details[K]) {
    setDetails((current) => ({ ...current, [key]: value }));
  }

  async function proceedToPayment() {
    if (!selectedDate || !selectedTime || !detailsValid || submitting || PAYMENTS_DISABLED) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/payments/jiopay/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          phone: details.phone,
          consent: details.consent,
          company: details.company,
          startedAt,
          productType: "senior_consultation",
          page: "/personal-booking",
          country: details.country,
          answers: {
            dateISO: selectedDate,
            timeISO: selectedTime,
            country: details.country,
            focus: details.focus,
            notes: details.notes,
          },
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        checkoutUrl?: string;
        error?: string;
        code?: string;
      };
      if (!response.ok || !data.ok || !data.checkoutUrl) {
        if (response.status === 409 || data.code === "slot_unavailable") {
          setSelectedTime("");
          setStep(1);
          await loadAvailability();
        }
        throw new Error(data.error || "Secure checkout could not be created.");
      }
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Secure checkout could not be created.");
      setSubmitting(false);
    }
  }

  const stepCopy = [
    { number: 1, label: "Schedule" },
    { number: 2, label: "Your information" },
    { number: 3, label: "Review & pay" },
  ];

  return (
    <div className="min-h-screen bg-[#1551a0] pb-20 pt-24 text-white sm:pt-28">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f0c83f]">XIPHIAS Private Advisory</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Schedule your senior-advisor consultation
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            Choose a suitable time, tell us what you need to resolve, and complete the secure payment. Your appointment is confirmed only after JioPay verification.
          </p>
        </div>

        <section id="schedule" className="scroll-mt-28 overflow-hidden rounded-[28px] border border-white/15 bg-[#0f438f] shadow-[0_32px_90px_rgba(3,20,55,0.38)] lg:grid lg:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="relative min-h-[420px] overflow-hidden border-b border-white/10 lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <Image
              src="/images/avtar/varun-singh-md-xiphias.jpg"
              alt="Varun Singh, XIPHIAS senior advisor"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 390px"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071a3a] via-[#071a3a]/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f0c83f]/40 bg-[#071a3a]/65 px-3 py-1 text-xs font-bold text-[#f0c83f] backdrop-blur">
                <BadgeCheck className="size-4" /> Senior strategy session
              </span>
              <h2 className="mt-4 text-3xl font-black">Varun Singh</h2>
              <p className="mt-1 text-sm text-white/65">MD · Fellow IMC · Cert IMC</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  [Clock3, `${durationMinutes} minutes`],
                  [CreditCard, formatPrice(priceInr)],
                  [ShieldCheck, "Confidential"],
                  [CalendarDays, "Online session"],
                ].map(([Icon, label]) => {
                  const IconComponent = Icon as typeof Clock3;
                  return (
                    <div key={String(label)} className="rounded-xl border border-white/12 bg-white/8 p-3 backdrop-blur-sm">
                      <IconComponent className="size-4 text-[#f0c83f]" />
                      <p className="mt-2 text-xs font-semibold text-white/85">{String(label)}</p>
                    </div>
                  );
                })}
              </div>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {["Profile and objective review", "Country and route comparison", "Key risks and evidence gaps", "Practical next-step direction"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#f0c83f] text-[#071a3a]"><Check className="size-3" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="bg-[#f6f9fd] text-[#071a3a]">
            <div className="border-b border-[#dbe7f3] bg-white px-5 py-5 sm:px-8">
              <ol className="grid grid-cols-3 gap-2" aria-label="Booking progress">
                {stepCopy.map((item) => {
                  const active = step >= item.number;
                  return (
                    <li key={item.number} className="flex min-w-0 items-center gap-2">
                      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${active ? "bg-[#1551a0] text-white" : "bg-[#e8f0fa] text-[#6b7d94]"}`}>
                        {step > item.number ? <Check className="size-4" /> : item.number}
                      </span>
                      <span className={`hidden truncate text-xs font-bold sm:block ${active ? "text-[#071a3a]" : "text-[#7b8ba0]"}`}>{item.label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              {step === 1 ? (
                <div>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f5fbc]">Step 1</p>
                      <h2 className="mt-2 text-2xl font-black sm:text-3xl">Choose your date and time</h2>
                      <p className="mt-2 text-sm leading-6 text-[#61728a]">Available appointments are shown in India Standard Time ({timezone}).</p>
                    </div>
                    <span className="rounded-full bg-[#e8f0fa] px-3 py-1.5 text-xs font-bold text-[#1f5fbc]">Next {availability?.days?.length || 0} working days</span>
                  </div>

                  {loadingAvailability ? (
                    <div className="mt-10 flex min-h-80 items-center justify-center rounded-2xl border border-[#dbe7f3] bg-white">
                      <LoaderCircle className="size-7 animate-spin text-[#1f5fbc]" />
                      <span className="ml-3 text-sm font-semibold">Checking available appointments…</span>
                    </div>
                  ) : availabilityError ? (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
                      <p>{availabilityError}</p>
                      <button type="button" onClick={() => void loadAvailability()} className="mt-4 rounded-lg bg-[#1551a0] px-4 py-2 font-bold text-white">Try again</button>
                    </div>
                  ) : (
                    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                      <div className="rounded-2xl border border-[#dbe7f3] bg-white p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <button type="button" aria-label="Previous month" disabled={monthIndex <= 0} onClick={() => setVisibleMonth(months[monthIndex - 1])} className="grid size-10 place-items-center rounded-xl border border-[#dbe7f3] disabled:opacity-30"><ChevronLeft className="size-5" /></button>
                          <p className="text-lg font-black">{monthLabel(visibleMonth)}</p>
                          <button type="button" aria-label="Next month" disabled={monthIndex >= months.length - 1} onClick={() => setVisibleMonth(months[monthIndex + 1])} className="grid size-10 place-items-center rounded-xl border border-[#dbe7f3] disabled:opacity-30"><ChevronRight className="size-5" /></button>
                        </div>
                        <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-[#7b8ba0] sm:gap-2 sm:text-xs">
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <span key={day} className="py-2">{day}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                          {cells.map((dateISO, index) => {
                            if (!dateISO) return <span key={`empty-${index}`} className="aspect-square" />;
                            const day = daysByDate.get(dateISO);
                            const free = day?.slots.filter((slot) => slot.status === "available").length || 0;
                            const enabled = Boolean(day && free);
                            const selected = selectedDate === dateISO;
                            return (
                              <button
                                key={dateISO}
                                type="button"
                                disabled={!enabled}
                                aria-pressed={selected}
                                aria-label={`${formatDate(dateISO, { weekday: "long", day: "numeric", month: "long" })}${enabled ? `, ${free} times available` : ", unavailable"}`}
                                onClick={() => { setSelectedDate(dateISO); setSelectedTime(""); }}
                                className={`aspect-square rounded-xl border text-sm font-black transition sm:text-base ${selected ? "border-[#1551a0] bg-[#1551a0] text-white shadow-lg" : enabled ? "border-[#c8daf0] bg-[#f8fbff] text-[#071a3a] hover:border-[#1551a0] hover:bg-[#e8f0fa]" : "border-transparent bg-[#f4f6f9] text-[#b3becb]"}`}
                              >
                                {Number(dateISO.slice(-2))}
                                {enabled ? <span className={`mx-auto mt-1 block size-1 rounded-full ${selected ? "bg-[#f0c83f]" : "bg-emerald-500"}`} /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#dbe7f3] bg-white p-5">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1f5fbc]">Available times</p>
                        <h3 className="mt-2 font-black">{selectedDate ? formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long" }) : "Select a date"}</h3>
                        <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-1">
                          {(selectedDay?.slots || []).map((slot) => {
                            const enabled = slot.status === "available";
                            const selected = selectedTime === slot.timeISO;
                            return (
                              <button key={slot.timeISO} type="button" disabled={!enabled} onClick={() => setSelectedTime(slot.timeISO)} className={`min-h-12 rounded-xl border px-3 text-sm font-black transition ${selected ? "border-[#d8ad1f] bg-[#f0c83f] text-[#071a3a]" : enabled ? "border-[#c8daf0] text-[#1551a0] hover:border-[#1551a0]" : "border-[#e6ebf1] bg-[#f4f6f9] text-[#a4afbc] line-through"}`}>
                                {formatTime(slot.timeISO)}
                              </button>
                            );
                          })}
                        </div>
                        {!selectedDate ? <p className="mt-5 text-xs leading-5 text-[#7b8ba0]">Choose an available date to see its appointment times.</p> : null}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button type="button" disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d8ad1f] px-6 font-black text-[#071a3a] transition hover:bg-[#f0c83f] disabled:cursor-not-allowed disabled:opacity-40">
                      Continue with this slot <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f5fbc]">Step 2</p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">Tell the advisor what you need</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61728a]">Please enter the required information below. It helps the advisory team prepare before your session.</p>

                  <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (detailsValid) setStep(3); }}>
                    <label className="text-sm font-bold">Full name *<input className={inputClass()} autoComplete="name" value={details.name} onChange={(event) => updateDetails("name", event.target.value)} required /></label>
                    <label className="text-sm font-bold">Email address *<input className={inputClass()} type="email" autoComplete="email" value={details.email} onChange={(event) => updateDetails("email", event.target.value)} required /></label>
                    <label className="text-sm font-bold">Phone number *<input className={inputClass()} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" value={details.phone} onChange={(event) => updateDetails("phone", event.target.value)} required /></label>
                    <label className="text-sm font-bold">Country of residence *<input className={inputClass()} autoComplete="country-name" value={details.country} onChange={(event) => updateDetails("country", event.target.value)} required /></label>
                    <label className="text-sm font-bold sm:col-span-2">Primary discussion area *
                      <select className={inputClass()} value={details.focus} onChange={(event) => updateDetails("focus", event.target.value)} required>
                        <option value="">Select what you want to discuss</option>
                        {FOCUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-bold sm:col-span-2">Context or questions for the advisor
                      <textarea className={`${inputClass()} min-h-32 py-3`} maxLength={1000} placeholder="Share your target country, profile, programme, concern or decision you need help with." value={details.notes} onChange={(event) => updateDetails("notes", event.target.value)} />
                      <span className="mt-1 block text-right text-xs font-normal text-[#7b8ba0]">{details.notes.length}/1000</span>
                    </label>
                    <label className="hidden" aria-hidden="true">Company<input tabIndex={-1} autoComplete="off" value={details.company} onChange={(event) => updateDetails("company", event.target.value)} /></label>
                    <label className="flex items-start gap-3 rounded-xl border border-[#dbe7f3] bg-white p-4 text-sm leading-6 sm:col-span-2">
                      <input type="checkbox" checked={details.consent} onChange={(event) => updateDetails("consent", event.target.checked)} className="mt-1 size-4 accent-[#1551a0]" />
                      <span>I agree to be contacted about this consultation and understand that the appointment is confirmed only after successful payment verification.</span>
                    </label>
                    <div className="mt-2 flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-between">
                      <button type="button" onClick={() => setStep(1)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c8daf0] px-5 font-bold text-[#1551a0]"><ArrowLeft className="size-4" /> Back to calendar</button>
                      <button type="submit" disabled={!detailsValid} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d8ad1f] px-6 font-black text-[#071a3a] disabled:opacity-40">Review booking <ArrowRight className="size-4" /></button>
                    </div>
                  </form>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f5fbc]">Step 3</p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">Review and proceed to checkout</h2>
                  <p className="mt-2 text-sm leading-6 text-[#61728a]">Your selected appointment is held temporarily once secure JioPay checkout opens.</p>

                  <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[#dbe7f3] bg-white p-5">
                      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f0fa] text-[#1551a0]"><CalendarDays className="size-5" /></span><div><p className="text-xs font-black uppercase tracking-wider text-[#7b8ba0]">Appointment</p><p className="mt-1 font-black">{formatDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div></div>
                      <p className="mt-4 text-sm text-[#61728a]">{formatTime(selectedTime)} · {durationMinutes} minutes · {timezone}</p>
                    </div>
                    <div className="rounded-2xl border border-[#dbe7f3] bg-white p-5">
                      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e8f0fa] text-[#1551a0]"><UserRound className="size-5" /></span><div><p className="text-xs font-black uppercase tracking-wider text-[#7b8ba0]">Customer</p><p className="mt-1 font-black">{details.name}</p></div></div>
                      <p className="mt-4 break-all text-sm text-[#61728a]">{details.email}<br />{details.phone}<br />{details.country}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#dbe7f3] bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-[#7b8ba0]">Discussion preparation</p>
                    <p className="mt-2 font-bold">{details.focus}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#61728a]">{details.notes || "No additional notes provided."}</p>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#d8b650]/45 bg-[#fff9e8] p-5 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8a6a0a]">Total consultation fee</p>
                      <p className="mt-2 text-3xl font-black text-[#071a3a]">{formatPrice(priceInr)}</p>
                      <p className="mt-1 text-xs text-[#6e6550]">Server-enforced amount · Secure JioPay checkout</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1551a0] sm:mt-0"><LockKeyhole className="size-4" /> Payment details are entered on JioPay</div>
                  </div>

                  {submitError ? <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{submitError}</div> : null}
                  {PAYMENTS_DISABLED ? <div role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{PAYMENTS_COMING_SOON_LABEL}</div> : null}

                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button type="button" disabled={submitting} onClick={() => setStep(2)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#c8daf0] px-5 font-bold text-[#1551a0]"><ArrowLeft className="size-4" /> Edit information</button>
                    <button type="button" disabled={submitting || PAYMENTS_DISABLED} onClick={() => void proceedToPayment()} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#d8ad1f] px-7 text-base font-black text-[#071a3a] shadow-lg transition hover:bg-[#f0c83f] disabled:cursor-not-allowed disabled:opacity-50">
                      {submitting ? <><LoaderCircle className="size-5 animate-spin" /> Opening secure checkout…</> : <>Pay {formatPrice(priceInr)} with JioPay <ArrowRight className="size-5" /></>}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto mt-8 grid max-w-5xl gap-4 text-center text-sm text-white/65 sm:grid-cols-3">
          <p className="flex items-center justify-center gap-2"><ShieldCheck className="size-4 text-[#f0c83f]" /> Appointment confirmed after payment</p>
          <p className="flex items-center justify-center gap-2"><Mail className="size-4 text-[#f0c83f]" /> Email and calendar invitation</p>
          <p className="flex items-center justify-center gap-2"><LockKeyhole className="size-4 text-[#f0c83f]" /> Confidential information handling</p>
        </div>
      </div>
    </div>
  );
}
