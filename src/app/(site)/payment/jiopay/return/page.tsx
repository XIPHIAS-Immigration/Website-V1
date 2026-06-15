import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock3, FileText, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Status | XIPHIAS Immigration",
  description: "Jiopay payment return status for XIPHIAS Immigration.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || "";
}

export default async function JiopayReturnPage({ searchParams }: Props) {
  const params = (await searchParams) || {};
  const status = first(params.status);
  const verified = first(params.verified) === "1";
  const order = first(params.order);
  const success = status === "success";
  const failed = status === "failed";

  const Icon = success ? CheckCircle2 : failed ? ShieldAlert : Clock3;
  const title = success
    ? "Payment response received"
    : failed
      ? "Payment was not completed"
      : "Payment is being verified";
  const copy = success
    ? "Jiopay returned a successful browser response. XIPHIAS will confirm the final payment state through secure S2S/webhook verification before unlocking the report or case workflow."
    : failed
      ? "Jiopay returned a failed or cancelled payment response. If money was debited, please contact XIPHIAS with the reference shown below."
      : "We are waiting for Jiopay confirmation. Please do not retry immediately if your bank app shows a successful debit.";

  return (
    <main className="min-h-screen bg-[#eef3f9] px-4 py-16 text-[#071a3a]">
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#dbe7f3] bg-white p-8 shadow-[0_20px_60px_rgba(7,26,58,0.12)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#071a3a] text-[#d8b650]">
            <Icon className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4ea2]">Jiopay payment</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#536277]">{copy}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 rounded-xl border border-[#dbe7f3] bg-[#f8fbff] p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#536277]">Order</p>
            <p className="mt-2 break-all text-sm font-semibold">{order || "Pending"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#536277]">Browser response</p>
            <p className="mt-2 text-sm font-semibold capitalize">{status || "pending"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#536277]">Hash check</p>
            <p className="mt-2 text-sm font-semibold">{verified ? "Verified" : "Awaiting S2S"}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/xia-intelligence"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1f5fbc] px-5 py-3 text-sm font-semibold text-white"
          >
            <FileText className="size-4" aria-hidden="true" />
            Return to XIA Intelligence
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-[#dbe7f3] px-5 py-3 text-sm font-semibold text-[#071a3a]"
          >
            Contact XIPHIAS
          </Link>
        </div>
      </section>
    </main>
  );
}

