// Shared motion primitives for the redesign. All are client components that
// honour `prefers-reduced-motion` (in addition to the global CSS rule in
// globals.css) and work in both light and dark themes.

// Scroll system
export { default as SmoothScroll } from "./SmoothScroll";
export { default as ScrollProgress } from "./ScrollProgress";
export { default as HorizontalScroll } from "./HorizontalScroll";

// Scroll-in / layout motion
export { default as Reveal } from "./Reveal";
export { Stagger, StaggerItem } from "./Stagger";
export { default as Parallax } from "./Parallax";
export { default as Marquee } from "./Marquee";

// Text effects
export { default as SplitText } from "./SplitText";
export { default as TextReveal } from "./TextReveal";
export { default as CharReveal } from "./CharReveal";
export { default as TextType } from "./TextType";
export { default as ShinyText } from "./ShinyText";
export { default as GradientText } from "./GradientText";
export { default as HighlightText } from "./HighlightText";
export { default as Counter } from "./Counter";

// Interaction
export { default as Magnetic } from "./Magnetic";
export { default as TiltCard } from "./TiltCard";
