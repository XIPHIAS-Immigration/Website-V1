// src/components/MDX/registry.tsx
import type { MDXComponents } from "mdx/types";

import Section from "@/components/MDX/Section";
import ContentImage from "@/components/MDX/ContentImage";
import ButtonLink from "@/components/MDX/ButtonLink";
import Callout from "@/components/MDX/Callout";
import { Steps, Step } from "@/components/MDX/Steps";
import Video from "@/components/MDX/Video";
import Iframe from "@/components/MDX/Iframe";
import FAQSection from "@/components/Insights/FAQSection";

const mdxComponents = {
  Section,
  ContentImage,
  ButtonLink,
  Callout,
  Steps,
  Step,
  Video,
  iframe: Iframe,
  FAQSection,
} satisfies MDXComponents;

export default mdxComponents;
