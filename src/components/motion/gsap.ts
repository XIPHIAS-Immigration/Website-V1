// Central GSAP entrypoint: registers ScrollTrigger once (guarded for SSR) and
// re-exports the instances so components share a single registration.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
