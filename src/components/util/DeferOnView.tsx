import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Estimated off-screen height used to keep layout stable. */
  minHeight?: string;
  /** Kept for compatibility with older call sites. */
  rootMargin?: string;
  className?: string;
};

/**
 * Keeps children in the server HTML while letting the browser skip layout and
 * paint work for off-screen sections until they approach the viewport.
 */
export default function DeferOnView({
  children,
  minHeight = "560px",
  className,
}: Props) {
  const style: CSSProperties = {
    contentVisibility: "auto",
    containIntrinsicSize: `auto ${minHeight}`,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
