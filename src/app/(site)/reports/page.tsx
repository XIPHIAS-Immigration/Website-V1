import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { getPublicReportProducts } from "@/lib/payments/report-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Immigration Reports from INR 499 | XIPHIAS",
  description: "Choose a focused XIPHIAS immigration report, complete only the relevant intake, pay securely and receive a personalised PDF.",
  alternates: { canonical: "/reports" },
};

function price(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}

export default function ReportsPage() {
  const products = getPublicReportProducts();

  return (
    <main className="min-h-screen bg-[#071a3a] pb-24 pt-24 text-white">
      <section className="border-b border-white/10 bg-[#071a3a]">
        <div className="mx-auto max-w-screen-2xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-secondary">
            <FileText className="size-4" /> XIPHIAS report store
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">Choose one report and go straight to its form.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/65">Prices are shown before you choose. Focused reports begin at INR 499, while the INR 4,999 Deep Analysis asks for more evidence because it produces the most detailed self-service assessment.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-bold text-white/60">
            {[
              "1. Select your report",
              "2. Enter the relevant information",
              "3. Pay and download the PDF",
            ].map((item) => <span key={item} className="rounded-full border border-white/15 px-4 py-2">{item}</span>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl bg-[#071a3a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <article key={product.productType} className={`flex flex-col rounded-2xl border p-6 ${product.featured ? "border-secondary bg-secondary/[0.10]" : "border-white/15 bg-white/[0.04]"}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-secondary"><FileText className="size-5" /></span>
                {product.featured ? <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black uppercase text-primary">Deepest</span> : null}
              </div>
              <h2 className="mt-5 text-xl font-black">{product.shortTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">{product.description}</p>
              <ul className="mt-5 space-y-2 text-xs leading-5 text-white/70">
                {product.includes.slice(0, 3).map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-secondary" />{item}</li>)}
              </ul>
              <div className="mt-auto pt-6">
                <p className="text-2xl font-black text-secondary">{price(product.priceInr)}</p>
                <p className="mt-1 text-[11px] text-white/40">{product.pageRange}</p>
                <Link href={`/express-reports?report=${product.productType}`} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-primary transition hover:bg-secondary">
                  Select this report <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
