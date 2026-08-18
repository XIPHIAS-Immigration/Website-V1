import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText } from "lucide-react";
import { getPublicReportProducts } from "@/lib/payments/report-store";
import { ToolShell } from "@/components/XiaTools/ToolShell";

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
    <ToolShell
      eyebrow="XIA · Express Reports"
      title="Choose One Report and Go Straight to Its Form"
      subtitle="Choose the immigration report that matches your question, see its price before starting and complete one report-specific form. Missing facts remain clearly marked instead of being invented."
      steps={[
        { title: "Choose a report", description: "Compare the purpose, inclusions, page range and fixed price of every available report." },
        { title: "Enter the relevant information", description: "Complete the intake designed for that report—lower-priced reports request fewer details than Deep Analysis." },
        { title: "Pay securely and download", description: "Proceed through JioPay and receive the personalised PDF after payment verification." },
      ]}
      benefits={["Prices shown before selection", "Report-specific intake", "Secure payment and PDF delivery"]}
      contactContext="Express Reports"
      contactId="express-report-store"
    >
      <section className="!bg-transparent">
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
    </ToolShell>
  );
}
