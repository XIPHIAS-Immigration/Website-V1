import { NextResponse } from "next/server";
import { headerMenu } from "@/components/Layout/Header/Navigation/menu.data";
import { getBrochureUrl } from "@/components/guid/brochures";

function extract(sectionLabel: string) {
  const section = headerMenu.find((s) => s.label === sectionLabel);
  if (!section?.submenu) return [] as any[];
  const out: any[] = [];
  for (const country of section.submenu) {
    for (const prog of country.submenu ?? []) {
      out.push({
        service: sectionLabel,
        country: country.label,
        countryHref: country.href,
        countryCode: (country as any).meta?.code,
        program: prog.label,
        href: prog.href,
        brochureUrl: getBrochureUrl(prog.href),
      });
    }
  }
  return out;
}

export async function GET() {
  const services = ["Residency", "Citizenship", "Corporate", "Skilled"];
  const items = services.flatMap(extract);
  return NextResponse.json({ count: items.length, items });
}
