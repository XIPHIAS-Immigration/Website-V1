import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ToolShell } from "@/components/XiaTools/ToolShell";
import { MeterBar } from "@/components/XiaTools/MeterBar";
import { INDEX_FACTORS, INDEX_DISCLAIMER } from "@/lib/program-index";

export const metadata: Metadata = {
  title: "Program Index Methodology — XIA Intelligence",
  description:
    "The transparent, documented composite weighting behind the XIPHIAS Program Index: affordability, speed, presence, family, due diligence and passport power.",
  alternates: { canonical: "/xiphias-program-index/methodology" },
};

const MAX_WEIGHT = Math.max(...INDEX_FACTORS.map((f) => f.weight));

export default function ProgramIndexMethodologyPage() {
  return (
    <ToolShell
      eyebrow="XIA · Program Index"
      title="How the Program Index is scored."
      subtitle="A transparent composite, published so advisors and clients can see exactly what drives each score. Sub-scores are 0–100; the index is their weighted average."
      actions={
        <Link
          href="/xiphias-program-index"
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="size-4" /> Back to the Index
        </Link>
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {INDEX_FACTORS.map((f) => (
          <div key={f.key} className="rounded-2xl border border-white/12 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-black text-white">{f.label}</h2>
              <span className="rounded-full border border-[#4f8cff]/40 bg-[#4f8cff]/10 px-3 py-1 text-[13px] font-black text-[#9cc0ff] tabular-nums">
                {f.weight}%
              </span>
            </div>
            <MeterBar value={f.weight} max={MAX_WEIGHT} className="mt-3" />
            <p className="mt-3 text-[13px] font-semibold text-[#9cc0ff]">{f.direction}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/12 bg-white/[0.03] p-6">
        <h2 className="text-[15px] font-black text-white">How the score is combined</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/65">
          Each factor produces a 0–100 sub-score from the parsed programme data. The index is the weight-multiplied
          average of those sub-scores (weights sum to 100). Destinations outside the passport snapshot use a neutral
          baseline for the passport-power factor, clearly flagged on each card.
        </p>
        <p className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-[12.5px] font-medium text-secondary">
          {INDEX_DISCLAIMER}
        </p>
      </div>
    </ToolShell>
  );
}
