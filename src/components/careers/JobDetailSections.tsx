// src/components/careers/JobDetailSections.tsx
import type { Job } from "@/lib/jobs";

export default function JobDetailSections({ job }: { job: Job }) {
  return (
    <div className="text-black dark:text-white">
      {/* Hero image (optional) */}

      {/* Summary */}
      {job.summary && (
        <Section title="Role summary">
          <p className="text-sm">
            {job.summary}
          </p>
        </Section>
      )}

      {/* About the role (raw body string kept lightweight) */}
      {job.body && (
        <Section title="About the role">
          <p className="text-sm">
            {job.body}
          </p>
        </Section>
      )}

      {/* Responsibilities / Requirements */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {job.responsibilities?.length ? (
          <Card title="Responsibilities">
            <ul className="mt-2 list-disc pl-5 text-sm">
              {job.responsibilities.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </Card>
        ) : null}

        {job.requirements?.length ? (
          <Card title="Requirements">
            <ul className="mt-2 list-disc pl-5 text-sm">
              {job.requirements.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      {/* Nice to have / Benefits */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {job.niceToHave?.length ? (
          <Card title="Nice to have">
            <ul className="mt-2 list-disc pl-5 text-sm">
              {job.niceToHave.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </Card>
        ) : null}

        {job.benefits?.length ? (
          <Card title="Benefits">
            <ul className="mt-2 list-disc pl-5 text-sm">
              {job.benefits.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>

      {/* Process + Profile */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {job.processSteps?.length ? (
          <Card title="Hiring process">
            <ol className="mt-2 list-decimal pl-5 text-sm">
              {job.processSteps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </Card>
        ) : null}

        {(job.experienceMin ||
          job.experienceMax ||
          job.tags?.length ||
          job.programs?.length ||
          job.countries?.length) ? (
          <Card title="Profile & focus">
            <ul className="mt-2 list-disc pl-5 text-sm">
              {job.experienceMin || job.experienceMax ? (
                <li>
                  Experience: {job.experienceMin ?? ""}
                  {job.experienceMax ? `–${job.experienceMax}` : ""} years
                </li>
              ) : null}
              {job.tags?.length ? <li>Tags: {job.tags.join(", ")}</li> : null}
              {job.programs?.length ? (
                <li>Programs: {job.programs.join(", ")}</li>
              ) : null}
              {job.countries?.length ? (
                <li>Countries: {job.countries.join(", ")}</li>
              ) : null}
            </ul>
          </Card>
        ) : null}
      </div>

      {/* Contact */}
      {job.contactEmail && (
        <p className="mt-6 text-sm">
          Questions? Email{" "}
          <a
            href={`mailto:${job.contactEmail}`}
            className="underline decoration-2 underline-offset-2"
          >
            {job.contactEmail}
          </a>
        </p>
      )}
    </div>
  );
}

/* ---------- tiny internal UI primitives (keep it simple & consistent) ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2">{children}</div>
      <hr className="mt-4 border-black/10 dark:border-white/10" />
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-4 ring-1 ring-black/5 dark:border-white/20 dark:bg-white/5 dark:ring-white/5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
