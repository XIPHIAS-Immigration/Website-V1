import Link from "next/link";
import { ArrowRight, BadgeCheck, Fingerprint, Globe2, Plane } from "lucide-react";
import type { PassportRecord } from "@/data/passport-index";
import { worldMapCountries, worldMapViewBox } from "@/data/world-map-paths";

function pathBounds(path: string) {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const xs: number[] = [];
  const ys: number[] = [];

  for (let index = 0; index < values.length; index += 2) {
    xs.push(values[index]);
    ys.push(values[index + 1]);
  }

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.max(10, maxX - minX);
  const height = Math.max(10, maxY - minY);
  const padding = Math.max(width, height) * 0.22;

  return `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
}

export default function PassportCountryShowcase({ record }: { record: PassportRecord }) {
  const country = worldMapCountries.find((item) => item.code === record.code);
  const viewBox = country ? pathBounds(country.path) : worldMapViewBox;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 pb-10 md:px-6">
      <div className="overflow-hidden rounded-lg border border-[#e1b923]/45 bg-[#061a33] text-white shadow-2xl shadow-[#071a3a]/25">
        <style>{`
          @keyframes xiphiasCountryTrace {
            from { stroke-dashoffset: 1200; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes xiphiasPassportFloat {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          .country-showcase-outline {
            stroke-dasharray: 1200;
            animation: xiphiasCountryTrace 1.8s ease-out both;
          }
          .country-passport-float {
            animation: xiphiasPassportFloat 5s ease-in-out infinite;
          }
        `}</style>

        <div className="grid gap-8 p-5 md:p-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e1b923]/45 bg-[#e1b923]/12 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#f6d86d]">
              <Globe2 className="size-4" />
              Country mobility profile
            </div>
            <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
              {record.country}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">{record.xiphiasLens}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f6d86d]">Rank</p>
                <p className="mt-2 text-3xl font-black">{record.rank}</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f6d86d]">Access</p>
                <p className="mt-2 text-3xl font-black">{record.score}</p>
              </div>
              <div className="rounded-md border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#f6d86d]">Band</p>
                <p className="mt-2 text-xl font-black">{record.band}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {record.pathways.slice(0, 2).map((pathway) => (
                <Link
                  key={pathway.href}
                  href={pathway.href}
                  className="inline-flex items-center gap-2 rounded-md bg-[#e1b923] px-4 py-3 text-sm font-black text-[#071a3a] transition hover:bg-[#f0cb3b]"
                >
                  {pathway.label}
                  <ArrowRight className="size-4" />
                </Link>
              ))}
              <Link
                href="/passport-index/compare"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              >
                Compare passport
              </Link>
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden rounded-lg border border-[#e1b923]/35 bg-[#092a4a] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(71,213,200,0.22),transparent_48%)]" />
            <svg
              viewBox={viewBox}
              aria-label={`${record.country} country outline`}
              role="img"
              className="relative z-10 h-[330px] w-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              {country ? (
                <>
                  <path d={country.path} fill="rgba(242,201,76,0.2)" stroke="#f2c94c" strokeWidth="5" vectorEffect="non-scaling-stroke" />
                  <path className="country-showcase-outline" d={country.path} fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </>
              ) : null}
            </svg>

            <div className="country-passport-float absolute bottom-7 right-7 z-20 w-52 rounded-lg border border-[#e1b923]/50 bg-[#071a3a] p-4 shadow-2xl shadow-black/30">
              <div className="rounded-md border border-[#e1b923]/35 p-4">
                <div className="flex items-center justify-between">
                  <Fingerprint className="size-8 text-[#f6d86d]" />
                  <span className="rounded-full bg-[#e1b923] px-3 py-1 text-xs font-black text-[#071a3a]">{record.code}</span>
                </div>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#f6d86d]">XIPHIAS</p>
                <p className="mt-1 text-lg font-black">Mobility Pass</p>
              </div>
            </div>

            <div className="absolute left-5 top-5 z-20 grid gap-2">
              {[BadgeCheck, Plane].map((Icon, index) => (
                <span key={index} className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[#f6d86d] backdrop-blur">
                  <Icon className="size-5" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
