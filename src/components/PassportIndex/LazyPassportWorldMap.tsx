"use client";

import dynamic from "next/dynamic";
import type { PassportRecord } from "@/data/passport-index";

type Props = {
  records: PassportRecord[];
  highlightedCodes?: string[];
};

function PassportWorldMapSkeleton() {
  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-lg border border-[#d7b64a]/40 bg-[#061a33] text-white shadow-2xl shadow-[#071a3a]/30 lg:grid-cols-[340px_1fr]">
      <div className="border-b border-[#d7b64a]/25 bg-[#071a3a] p-4 lg:border-b-0 lg:border-r">
        <div className="h-11 rounded-md bg-[#e1b923]" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 rounded-md bg-white/10" />
          ))}
        </div>
      </div>
      <div className="relative min-h-[620px] bg-[#092a4a]">
        <div className="absolute inset-8 rounded-lg border border-[#8bd3ff]/20 bg-[#164b76]/20" />
        <div className="absolute left-1/2 top-1/2 h-28 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8bd3ff]/20 motion-safe:animate-pulse" />
        <div className="absolute bottom-5 right-5 h-64 w-96 max-w-[calc(100%-2.5rem)] rounded-lg bg-[#061a33]/85" />
      </div>
    </div>
  );
}

const PassportWorldMap = dynamic(() => import("@/components/PassportIndex/PassportWorldMap"), {
  ssr: false,
  loading: () => <PassportWorldMapSkeleton />,
});

export default function LazyPassportWorldMap(props: Props) {
  return <PassportWorldMap {...props} />;
}
