# XIPHIAS Frontend Design Skill

Use this project-level skill for new public pages, portals, and premium product flows.

## Design Direction
- Keep the XIPHIAS site language consistent: same font scale, line height, alignment rhythm, section spacing, and restrained corporate tone.
- Use the XIPHIAS palette as the base: deep blue, white, muted slate, and controlled gold accents. Gold is for priority actions, highlight lines, and premium signals, not large background fills.
- The intelligence-suite aesthetic is dark-gradient (`from-[#060b1a]`/`via-[#0a1530]`) with `#4f8cff` (electric blue) and `#e1b923` (gold) accents. New tools in that family should match it so they read as one suite.
- Design should feel premium and immigration-advisory focused, not like an AI toy. Avoid generic dashboards unless the page is truly an internal tool.
- When adapting inspiration from Mistral, Linear, Vercel, Stripe, Framer, React Bits, Motion, Aceternity, or similar sites, borrow motion *quality* and layout discipline only. Do not copy brand marks, wording, or proprietary visual systems.

## Motion System

This is an information-dense advisory site. Motion exists to **guide attention, signal interactivity, and add restrained premium polish** — never to decorate for its own sake. The failure mode to avoid is monotony: one fade-up idiom on every section. Variety comes from using the *right* pattern per context, not from adding more motion.

### Primitives already in `src/components/motion/`
Prefer these over hand-rolling. Several are **built but currently unused** — wire them up before writing anything new.

| Primitive | Status | Use for |
| --- | --- | --- |
| `Reveal` | Used heavily (over-used) | Default in-view fade. Now the **fallback**, not the universal idiom. Extend with a `from` prop (`up`/`left`/`right`/`scale`). |
| `Stagger` / `StaggerItem` | **Built, unused — wire up** | Cascade cards/rows in a grid or list. Highest-leverage swap to kill monotony. |
| `Parallax` | **Built, unused — wire up** | Subtle image drift (transform `y` only, ≤10% travel). |
| `Magnetic` | **Built, unused — wire up** | One primary CTA per page. Lower strength to ~0.15–0.2, cap offset ~8px. |
| `TextReveal` | **Built, unused — wire up** | Blur-in line reveal for one subhead per band (the calmest premium text idiom). |
| `ShinyText` | **Built, unused — wire up** | One-shot gloss sweep (e.g. logo wordmark on load). Never loop. |
| `Marquee` | **Built, used once** | Slow trust/accreditation logo loop, pause on hover, edge fade. One per viewport. |
| `CharReveal` | Used | Per-character headline rise (+optional blur). Short headlines only, one per section. |
| `Counter` | Used | KPI count-up on scroll-in. Confine to 3–4 hero stats per page; `tabular-nums` + reserved width. |
| `TiltCard` | Used | 3D pointer tilt. Ration to 1–2 feature cards, never a whole grid. Cap rotation ~6–8°. |
| `GradientText` | Used | Animated gradient on one accent word per page. |
| `ScrollProgress` | Used | Reading bar on long guide/article routes only. |

Smooth scroll (Lenis + GSAP) lives only in `SmoothScroll.tsx` — GSAP is plumbing, not a per-section animation system. Do not author GSAP timelines for content.

### The 5-tier motion map — *where* motion belongs
Match the tier to the surface. This is the core rule that prevents an info-heavy page from feeling busy.

- **Tier 1 — Hero / above the fold** (richest, but once per page, on first paint): staggered entrance + **one** animated headline (`CharReveal` or `TextReveal`, never both in view) + optional aurora ambient background + a single `Magnetic` primary CTA.
- **Tier 2 — Marketing "chapter" sections** (medium, scroll-triggered, once): `Stagger` for card grids; alternate directional/scale `Reveal` variants per row; at most one `Parallax` image per band; `Counter` confined to the KPI cluster. One entrance idiom per band — never nest reveals.
- **Tier 3 — Dense content / guides / tables / rankings** (motion = orientation only): plain in-view fade at most once per section; `ScrollProgress` on long routes; accordion height-fade for Q&A; card hover-lift + link underline. **No** parallax, aurora, per-char text, or tilt here — stillness is a feature.
- **Tier 4 — Interactive tools** (ProgrammeExplorer, GlobeExplorer, eligibility, comparison): motion = state feedback. Tab/filter active-indicator glide (`layoutId`), `AnimatePresence` enter/exit on panels and result lists, skeleton shimmer while loading. No scroll-entrance decoration competing with user-driven interaction.
- **Tier 5 — Forms & lead capture** (minimal, confidence-building): button press-scale (`whileTap` 0.97), modal scale-fade in/out, inline validation crossfade, accordion for optional fields. No ambient/decorative motion — every animation communicates a state change.
- **Global chrome** (all tiers): sticky-header condense on scroll and the trust `Marquee` strip live once, site-wide.

### Pattern catalogue by category
All implementations animate **`transform` / `opacity` / `filter` only.**

- **Entrance** — *Staggered hero entrance*: parent `staggerChildren` 0.06–0.08 + `delayChildren` 0.1; children `{opacity:0,y:12}`→`{opacity:1,y:0}`, ease `[0.16,1,0.3,1]`, ~0.5s. The only first-paint (non-scroll) entrance allowed.
- **Scroll** — *Staggered list/grid reveal* (`Stagger`): cards cascade, `staggerChildren` 0.08, `viewport once`. *Directional/scale `Reveal`*: alternate `x:±24` or `scale:0.96→1` per section so motion isn't always "rise from below" (cap x to 16px on mobile). *Image parallax* (`Parallax`): `y` only, ≤10% travel, never on text. *`ScrollProgress`*: `scaleX` bar, `transform-origin:left`.
- **Hover-micro** — *Card lift*: `transition: transform/box-shadow/border-color .2s`; `:hover translateY(-3px)` + brand-tint border + soft shadow (no layout props). *Link underline*: `::after` `scaleX(0)→1` from left. *`Magnetic` CTA* and *`TiltCard`* per the rationing rules above.
- **Text** — *`CharReveal`* (per-char rise, short headlines), *`TextReveal`* (blur-in line: `filter blur(8px)→0` + `y:6→0`; **skip blur under reduced-motion**), *`GradientText`*/*`ShinyText`* (one accent word, one-shot sweep).
- **Background-ambient** — *Aurora mesh*: 2–3 absolute radial-gradient divs, `filter:blur(80px)`, low opacity, slow 20–30s transform keyframes; behind the hero text layer only, ≤3 blobs. *`Marquee`* trust strip.
- **Layout** — *Active-indicator glide*: shared `layoutId` highlight, `spring` stiffness 350/damping 30; for tabs, filters, pricing toggles. *Accordion*: CSS `grid-template-rows 0fr→1fr` or `AnimatePresence height`, content fade + chevron rotate, exit ~20% faster.
- **Feedback** — *Modal scale-fade*: `AnimatePresence`, panel `{opacity:0,scale:0.96,y:8}`→`{1,1,0}`, backdrop fade, ~0.18s. *Button press* `whileTap scale:0.97`. *Skeleton shimmer*: boxes sized to final content (zero CLS), `background-position` sweep, crossfade to real content.

### Rejected — do not add to this site
WebGL/canvas particle or "beams"/"meteors"/sparkles backgrounds; scramble/"decrypted" text; a second pinned scroll-jacked narrative (one `HorizontalScroll` already exists with Lenis); cursor-follow spotlight on card grids; perpetual traveling border-beam; infinite shimmer on CTAs (reads as loading); whip/pop/rotate per-character text. These are either heavy, un-corporate, or attention-grabbing in a way that fights legibility on a compliance-focused advisory site.

### Anti-patterns — the "one idiom everywhere" fix
- The plain `Reveal` fade-up (`y:24`, ease `[0.22,1,0.36,1]`) is now a **fallback only**. Every section must justify why it isn't using `Stagger`, a directional variant, or no entrance at all. This is the exact complaint to fix.
- Never nest `Reveal` inside `Reveal`, or wrap every card/row in its own `Reveal`. One entrance trigger per section band; lists cascade via `Stagger`.
- Don't make everything rise from below — vary direction/scale deliberately across alternating sections.
- Don't animate on every section. Dense Tier-3 sections should often have **no** entrance animation.
- Don't stack ambient effects: max one aurora per page, one moving marquee per viewport, parallax on ≤2 images per page, no two looping animations in view at once.
- Don't overuse high-wow idioms: `Magnetic` = one per page; `TiltCard` = 1–2 cards; `CharReveal` = one headline per section. Spread variety, don't pile it.
- Don't animate text users must read immediately (legal disclaimers, eligibility results, pricing numbers) with entrance delays — show transactional text instantly.

## Performance Rules
- Animate only `transform`, `opacity`, `filter`, and `background-position`. Never animate `width`, `height`, `top`, `left`, `margin`, or text dimensions (CLS risk). Any layout-property animation is rejected.
- Every image, card, upload dropzone, and repeated tile must have stable dimensions via `aspect-ratio`, `min-height`, or responsive grid tracks. Reserve grid height before a `Stagger` cascade; use `tabular-nums` + reserved width for count-ups; size skeletons to final content exactly.
- Respect `prefers-reduced-motion` everywhere (global kill-switch in `globals.css` + per-component `useReducedMotion`): drop x/y offsets to 0, **skip blur entirely** (a known motion-sensitivity trigger — fade only), freeze aurora/marquee/parallax, render counters and gradient/shiny text at final state, make `layoutId` indicators jump instead of glide. Keep only tiny informative feedback (button press).
- Use `next/image` for local assets with `sizes`, `alt`, and stable containers.
- Keep LCP clean: one primary hero asset at most, no heavy animation above the fold, no runtime external image fetches.
- Lazy-load heavy or optional sections. Keep public pages independent from X-Hub/admin bundles.
- Do not introduce new animation libraries — everything above is `framer-motion`/CSS the project already ships. Conversely, dead carousel/animation deps (`aos` + `@types/aos`, `swiper`, `keen-slider`, `react-slick` + `slick-carousel`, `react-fast-marquee`) have zero imports in `src` and can be removed; `gsap` stays only as Lenis plumbing.
- Do not introduce decorative video, canvas, or 3D unless explicitly required and verified across desktop/mobile.

## Interaction Rules
- Use clear CTA hierarchy: primary action, secondary exploration, then support.
- Forms should feel guided, with short helper text and progress-style reassurance after submit.
- File upload controls must show accepted formats, size limits, selected file name, loading state, success state, and an accessible label.
- For info-heavy tools use progressive disclosure: free top-line result → gated detail behind the `LeadGate` pattern → paid PDF via JioPay. Don't show every column/metric at once; default to a few decisive numbers with expand-on-demand.
- Leads, assessments, and submissions should be connected to X-Hub whenever the user provides contact details. Use the single funnel: `/api/platform/lead` (soft capture) and `/api/payments/jiopay/create-checkout` (paid reports) — do not invent new endpoints.

## Copy Rules
- Write direct advisory copy: what XIPHIAS can review, what the client must provide, and what happens next.
- Do not imply job placement, guaranteed visas, or final eligibility decisions.
- Use language such as "permit route review", "document readiness", "advisor verification", and "next-step guidance".
- Show real numbers, but always pair them with the catalog's "indicative — varies by case, advisor review required" disclaimer. Never present residency-days or tax figures as precise when they are proxies or unsourced.
