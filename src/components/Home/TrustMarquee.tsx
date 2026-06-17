"use client";

import { Award, Building2, Globe2, ShieldCheck, Star, Users } from "lucide-react";
import { Marquee } from "@/components/motion";

const ITEMS = [
  { icon: ShieldCheck, label: "ISO 9001:2015 Certified" },
  { icon: Award, label: "17+ Years of Excellence" },
  { icon: Users, label: "10,000+ Families Relocated" },
  { icon: Star, label: "98% Visa Success Rate" },
  { icon: Globe2, label: "50+ Countries Covered" },
  { icon: Building2, label: "Offices in India · UAE · Canada · Australia" },
  { icon: ShieldCheck, label: "Regulated, Compliant Advisory" },
  { icon: Star, label: "Featured in NDTV · Times of India · Money Control" },
];

/** Continuously scrolling trust/credential strip beneath the hero. */
export default function TrustMarquee() {
  return (
    <section className="border-y border-border bg-white py-4 dark:border-white/10 dark:bg-darkmode">
      <Marquee duration={38}>
        {ITEMS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="mx-5 inline-flex items-center gap-2.5 whitespace-nowrap text-[13.5px] font-semibold text-light_grey dark:text-white/70"
          >
            <Icon className="h-4 w-4 shrink-0 text-secondary" />
            {label}
            <span className="ml-5 text-border dark:text-white/15">•</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
