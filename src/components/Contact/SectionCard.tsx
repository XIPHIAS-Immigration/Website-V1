// components/Contact/SectionCard.tsx
import * as React from "react";

type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<E>, "as" | "className" | "children">;

export default function SectionCard<E extends React.ElementType = "section">(
  { as, className, children, ...rest }: PolymorphicProps<E>
) {
  const Tag = (as ?? "section") as React.ElementType;
  const classes = [
    "rounded-3xl bg-white ring-1 ring-blue-100/80",
    "dark:bg-white/5 dark:ring-blue-900/30",
    "shadow-[0_1px_0_rgba(0,0,0,0.02)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // React.createElement avoids the React 19 "children: never" inference that
  // occurs when rendering a polymorphic React.ElementType via JSX.
  return React.createElement(Tag, { ...rest, className: classes }, children);
}
