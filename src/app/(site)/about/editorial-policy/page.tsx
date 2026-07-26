import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Immigration Content Editorial Policy | XIPHIAS",
  description:
    "How XIPHIAS researches, reviews, updates and corrects immigration information published on its website.",
  alternates: { canonical: "/about/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <main className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-bold uppercase text-primary dark:text-secondary">
          Content standards
        </p>
        <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">
          Immigration content editorial policy
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
          XIPHIAS publishes immigration information to help readers understand
          programmes, requirements and possible next steps. It is general
          information, not legal advice or a guarantee of approval.
        </p>

        <div className="mt-12 space-y-10 text-base leading-7 text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Research and sources</h2>
            <p className="mt-3">
              Programme pages and time-sensitive articles should rely on government
              immigration departments, legislation, official programme units and
              other primary sources. Where available, those sources are linked on
              the page so readers can verify current requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Review and updates</h2>
            <p className="mt-3">
              Content that discusses eligibility, fees, investment thresholds or
              processing steps is reviewed before publication. Pages display their
              author, update date and, where supplied, an expert reviewer and last
              review date. Material changes are prioritised when authorities amend
              a programme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Corrections</h2>
            <p className="mt-3">
              When information is outdated or materially inaccurate, we correct,
              consolidate or remove it and redirect readers to the most useful
              current page. Readers can report a concern through our contact team.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">Commercial independence</h2>
            <p className="mt-3">
              Programme comparisons should explain important eligibility and risk
              considerations. Commercial relationships must not be presented as
              government endorsement, and no page should promise a visa, residence
              permit, citizenship or investment outcome.
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-white/10">
          <Link
            href="/contact"
            className="font-bold text-primary underline underline-offset-4 dark:text-secondary"
          >
            Report a content concern
          </Link>
        </div>
      </div>
    </main>
  );
}
