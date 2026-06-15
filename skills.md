# XIPHIAS Frontend Design Skill

Use this project-level skill for new public pages, portals, and premium product flows.

## Design Direction
- Keep the XIPHIAS site language consistent: same font scale, line height, alignment rhythm, section spacing, and restrained corporate tone.
- Use the XIPHIAS palette as the base: deep blue, white, muted slate, and controlled gold accents. Gold is for priority actions, highlight lines, and premium signals, not large background fills.
- Design should feel premium and immigration-advisory focused, not like an AI toy. Avoid generic dashboards unless the page is truly an internal tool.
- When adapting inspiration from Mistral, GSAP, Framer, React Bits, or similar sites, borrow motion quality and layout discipline only. Do not copy brand marks, wording, or proprietary visual systems.

## Motion Rules
- Prefer `framer-motion` for React interaction states because it is already installed in this project.
- Use CSS keyframes for lightweight decorative motion. Do not add GSAP or another animation library unless a page genuinely needs timeline-level choreography.
- Animate only `transform`, `opacity`, filters, and background-position where possible. Avoid animating width, height, top, left, margin, or content that can create CLS.
- Every image, card, upload dropzone, and repeated tile must have stable dimensions through `aspect-ratio`, `min-height`, or responsive grid tracks.
- Respect `prefers-reduced-motion`; motion should reduce gracefully to static states.

## Performance Rules
- Use `next/image` for local assets and provide `sizes`, `alt`, and stable containers.
- Keep LCP clean: one primary hero asset at most, no heavy animation above the fold, and no runtime external image fetches.
- Lazy-load heavy or optional sections. Keep public pages independent from X-Hub/admin bundles.
- Do not introduce decorative video, canvas, or 3D unless explicitly required and verified across desktop/mobile.

## Interaction Rules
- Use clear CTA hierarchy: primary action, secondary exploration, then support.
- Forms should feel guided, with short helper text and progress-style reassurance after submit.
- File upload controls must show accepted formats, size limits, selected file name, loading state, success state, and an accessible label.
- Leads, assessments, and submissions should be connected to X-Hub whenever the user provides contact details.

## Copy Rules
- Write direct advisory copy: what XIPHIAS can review, what the client must provide, and what happens next.
- Do not imply job placement, guaranteed visas, or final eligibility decisions.
- Use language such as "permit route review", "document readiness", "advisor verification", and "next-step guidance".
