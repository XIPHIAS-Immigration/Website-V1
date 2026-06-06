// src/components/careers/HiringSteps.tsx
export default function HiringSteps() {
  const steps = [
    { t: "Apply", d: "Share your resume and a few basic details.", time: "~5 min" },
    { t: "Intro Call", d: "15–20 min chat to align on role and expectations.", time: "~20 min" },
    { t: "Skill Interview", d: "Role-specific discussion or case/portfolio review.", time: "~45–60 min" },
    { t: "Assignment (Light)", d: "Only for some roles; practical, time-boxed task.", time: "~60–90 min" },
    { t: "Offer", d: "Compensation, start date, and onboarding next steps.", time: "~24–48 hrs" },
  ];

  return (
    <section aria-labelledby="hiring-steps">
      <div
        className={[
          "rounded-3xl p-6 sm:p-8",
          "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
          "dark:from-blue-950/30 dark:to-indigo-950/20 dark:ring-blue-900/40",
          "text-black dark:text-white",
        ].join(" ")}
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 id="hiring-steps" className="text-xl font-bold tracking-tight">
            Our hiring process
          </h2>
          <p className="text-sm">Typical timeline: 2–4 weeks</p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={s.t}
              className="rounded-2xl border border-black/10 bg-white/85 p-4 ring-1 ring-black/5 dark:border-white/20 dark:bg-white/5 dark:ring-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold">{s.t}</h3>
                {s.time && (
                  <span className="ml-auto inline-flex items-center rounded-full border border-black/20 bg-white px-2 py-0.5 text-[11px] font-medium dark:border-white/30 dark:bg-transparent">
                    {s.time}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs">
            We’re flexible on scheduling and can provide reasonable accommodations on request.
          </p>
          <a
            href="#apply"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Apply now
          </a>
        </div>
      </div>
    </section>
  );
}
