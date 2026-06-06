import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Job = {
  id: string;
  title: string;
  slug: string;
  dept?: string;
  location: string;
  employmentType?: "Full-time" | "Part-time" | "Contract" | "Internship" | string;
  postedAt?: string;        // ISO
  validThrough?: string;    // ISO
  remote?: boolean;
  experienceMin?: number;
  experienceMax?: number;
  salaryCurrency?: string;
  salaryMin?: number;
  salaryMax?: number;
  summary?: string;
  hero?: string;
  heroAlt?: string;
  tags?: string[];
  programs?: string[];
  countries?: string[];
  benefits?: string[];
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  processSteps?: string[];
  contactEmail?: string;
  body?: string; // MDX body as plain text/markdown (we'll render simply)
};

const JOBS_DIR = path.join(process.cwd(), "content", "jobs");

function fileSlug(filename: string) {
  return filename.replace(/\.mdx?$/, "");
}

export function readAllJobFiles(): { meta: Job; body: string }[] {
  const files = fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((fname) => {
    const full = path.join(JOBS_DIR, fname);
    const raw = fs.readFileSync(full, "utf8");
    const { data, content } = matter(raw);
    const slug = (data.slug as string) || fileSlug(fname);
    const meta: Job = {
      id: String(data.id || slug),
      title: String(data.title || slug),
      slug,
      dept: data.dept,
      location: String(data.location || "Remote"),
      employmentType: data.employmentType,
      postedAt: data.postedAt,
      validThrough: data.validThrough,
      remote: Boolean(data.remote ?? /remote/i.test(String(data.location || ""))),
      experienceMin: data.experienceMin ? Number(data.experienceMin) : undefined,
      experienceMax: data.experienceMax ? Number(data.experienceMax) : undefined,
      salaryCurrency: data.salaryCurrency,
      salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
      summary: data.summary,
      hero: data.hero,
      heroAlt: data.heroAlt,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      programs: Array.isArray(data.programs) ? data.programs : undefined,
      countries: Array.isArray(data.countries) ? data.countries : undefined,
      benefits: Array.isArray(data.benefits) ? data.benefits : undefined,
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : undefined,
      requirements: Array.isArray(data.requirements) ? data.requirements : undefined,
      niceToHave: Array.isArray(data.niceToHave) ? data.niceToHave : undefined,
      processSteps: Array.isArray(data.processSteps) ? data.processSteps : undefined,
      contactEmail: data.contactEmail,
      body: content?.trim() || undefined,
    };
    return { meta, body: content };
  });
}

export function getAllJobs(): Job[] {
  return readAllJobFiles()
    .map(({ meta }) => meta)
    .sort((a, b) => new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime());
}

export function getJobBySlug(slug: string): Job | null {
  const found = readAllJobFiles().find(({ meta }) => meta.slug === slug);
  return found ? { ...found.meta, body: found.body } : null;
}

export function jobsStaticParams() {
  return getAllJobs().map((j) => ({ slug: j.slug }));
}

export function jobJsonLd(job: Job, site: string) {
  const tele = job.remote || /remote/i.test(job.location);
  const baseSalary = job.salaryMin || job.salaryMax ? {
    "@type": "MonetaryAmount",
    currency: job.salaryCurrency || "USD",
    value: {
      "@type": "QuantitativeValue",
      minValue: job.salaryMin,
      maxValue: job.salaryMax,
      unitText: "YEAR",
    },
  } : undefined;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.postedAt || new Date().toISOString(),
    validThrough: job.validThrough,
    description: job.summary || job.body || job.title,
    employmentType: job.employmentType || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "XIPHIAS Immigration",
      sameAs: site,
      logo: `${site}/favicon.ico`,
    },
    jobLocationType: tele ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: job.location,
    jobLocation: tele ? undefined : [{
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      }
    }],
    baseSalary,
    identifier: { "@type": "PropertyValue", name: "XIPHIAS Immigration", value: job.id },
    url: `${site}/careers/${job.slug}`,
  });
}