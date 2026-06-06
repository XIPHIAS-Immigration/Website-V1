// src/components/careers/Hero.tsx
export default function Hero() {
  return (
    <header
      className={[
        "relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10",
        "bg-gradient-to-br from-sky-50 via-white to-indigo-50 ring-1 ring-blue-100/80",
        "dark:from-blue-950/30 dark:via-transparent dark:to-indigo-950/20 dark:ring-blue-900/40",
        "text-black dark:text-white",
      ].join(" ")}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-700/10" />
        <div className="absolute -bottom-28 -left-10 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-700/10" />
        <div className="absolute inset-0 opacity-40 dark:opacity-20 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent_80%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:22px_22px]" />
        </div>
      </div>

      <div className="relative">
        <p className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-medium ring-1 ring-blue-200 backdrop-blur dark:bg-white/5 dark:ring-blue-800">
          On-site roles
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          Careers at XIPHIAS Immigration
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 dark:text-slate-200">
          Help people move, work, and thrive across borders. Join our experts in
          citizenship, residency, skilled migration, and corporate immigration
          from our Bengaluru headquarters and branch offices.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="#open-roles"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            View open roles
          </a>
          <a
            href="#apply"
            className="rounded-xl border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Submit resume
          </a>
        </div>
      </div>
    </header>
  );
}