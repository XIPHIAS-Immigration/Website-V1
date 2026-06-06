import React from "react";

type Props = {
  taxNotes?: string[];
  residencyRequirement?: string;
  interviewRequired?: boolean;
  className?: string;
};

export default function TaxResidencyPanel({
  taxNotes = [],
  residencyRequirement,
  interviewRequired,
  className = "",
}: Props) {
  if (
    !taxNotes.length &&
    !residencyRequirement &&
    interviewRequired === undefined
  )
    return null;

  return (
    <section
      className={`rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 p-5 bg-white/80 dark:bg-neutral-900/40 ${className}`}
    >
      <h3 className="text-base font-semibold">Tax & Residency</h3>
      <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
        {taxNotes.map((t) => (
          <li key={t}>{t}</li>
        ))}
        {residencyRequirement ? (
          <li>Residency/visit: {residencyRequirement}</li>
        ) : null}
        {typeof interviewRequired === "boolean" ? (
          <li>Interview required: {interviewRequired ? "Yes" : "No"}</li>
        ) : null}
      </ul>
    </section>
  );
}
