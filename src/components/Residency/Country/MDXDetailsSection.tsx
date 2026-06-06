import * as React from "react";

export default function MDXDetailsSection({
  content,
}: {
  country: string;
  content: React.ReactNode;
}) {
  if (!content) return null;
  return (
    <section id="content" className="scroll-mt-28 ">
      <article className="prose max-w-none mt-3">{content}</article>
    </section>
  );
}
