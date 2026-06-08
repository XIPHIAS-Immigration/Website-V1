import "server-only";

import { getAllContentCached } from "@/lib/content";
import type { AnyDoc } from "@/lib/content/types";
import type { Track } from "@/lib/eligibility/types";
import type { ContentReviewTask, MigrationCase } from "./types";

export type RegulationSignal = {
  id: string;
  title: string;
  summary: string;
  href: string;
  country?: string;
  tracks: Track[];
  priority: "watch" | "review" | "urgent";
  reason: string;
  sourceType: "website-content" | "review-task";
  updatedAt?: string;
};

export type RegulationRadarResult = {
  generatedAt: string;
  focusCountry?: string;
  focusTrack?: Track;
  signals: RegulationSignal[];
  watchlist: {
    title: string;
    detail: string;
    owner: "content" | "advisor" | "operations";
  }[];
};

const TRACKS: Track[] = ["residency", "citizenship", "skilled", "corporate"];

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleCaseSlug(value?: string) {
  if (!value) return undefined;
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function docTracks(doc: AnyDoc): Track[] {
  if (doc.kind === "program") return [doc.vertical];
  return (doc.verticals ?? []).filter((vertical): vertical is Track => TRACKS.includes(vertical as Track));
}

function docCountry(doc: AnyDoc) {
  if (doc.kind === "program") return titleCaseSlug(doc.country);
  return titleCaseSlug(doc.countries?.[0]);
}

function parseTime(value?: string) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function stripMdx(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`{}[\]|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function priorityFromText(text: string): RegulationSignal["priority"] {
  if (/\b(suspend|suspended|ban|banned|closure|closed|halt|rejected|denied|crackdown|fee hike|threshold hike|blocked)\b/.test(text)) {
    return "urgent";
  }
  if (/\b(change|changed|new rule|update|deadline|quota|backlog|delay|due diligence|compliance|tax|policy)\b/.test(text)) {
    return "review";
  }
  return "watch";
}

function signalReason(text: string, focusCountry?: string, focusTrack?: Track) {
  const reasons: string[] = [];
  if (focusCountry && text.includes(normalize(focusCountry))) reasons.push(`matches ${focusCountry}`);
  if (focusTrack && text.includes(focusTrack)) reasons.push(`matches ${focusTrack}`);
  if (/\bfee|threshold|investment|capital\b/.test(text)) reasons.push("pricing or investment language");
  if (/\bdelay|backlog|processing|timeline\b/.test(text)) reasons.push("timeline language");
  if (/\bdue diligence|compliance|risk|sanction|pep\b/.test(text)) reasons.push("risk or due diligence language");
  if (/\bnew|change|updated|rule|policy\b/.test(text)) reasons.push("rule-change language");
  return reasons.length ? reasons.join(", ") : "content should stay in periodic advisor review";
}

function scoreSignal(signal: RegulationSignal, focusCountry?: string, focusTrack?: Track) {
  let score = signal.priority === "urgent" ? 90 : signal.priority === "review" ? 70 : 48;
  if (focusCountry && normalize(signal.country).includes(normalize(focusCountry))) score += 30;
  if (focusTrack && signal.tracks.includes(focusTrack)) score += 20;
  score += Math.min(20, Math.floor(parseTime(signal.updatedAt) / 10_000_000_000_000));
  return score;
}

function createContentSignals(docs: AnyDoc[], focusCountry?: string, focusTrack?: Track): RegulationSignal[] {
  return docs
    .map((doc, index) => {
      const tracks = docTracks(doc);
      const country = docCountry(doc);
      if (focusTrack && tracks.length && !tracks.includes(focusTrack)) return null;

      const text = normalize([doc.title, doc.summary, doc.tags?.join(" "), stripMdx(doc.body).slice(0, 1200)].join(" "));
      const priority = priorityFromText(text);
      const countryMatches = focusCountry ? text.includes(normalize(focusCountry)) || normalize(country).includes(normalize(focusCountry)) : true;
      const hasPolicyLanguage = priority !== "watch" || /\b2025|2026|visa|residency|citizenship|immigration|golden|passport\b/.test(text);

      if (!countryMatches && focusCountry) return null;
      if (!hasPolicyLanguage) return null;

      return {
        id: `content-${index}`,
        title: doc.title,
        summary: doc.summary || stripMdx(doc.body).slice(0, 180),
        href: doc.url,
        country,
        tracks,
        priority,
        reason: signalReason(text, focusCountry, focusTrack),
        sourceType: "website-content" as const,
        updatedAt: doc.updatedAt,
      };
    })
    .filter(Boolean) as RegulationSignal[];
}

function createReviewTaskSignals(tasks: ContentReviewTask[], focusCountry?: string, focusTrack?: Track): RegulationSignal[] {
  return tasks
    .map((task) => {
      const text = normalize([task.title, task.suggestedSummary, task.proposedChanges.join(" "), task.targetPath, task.sourceUrl].join(" "));
      if (focusCountry && !text.includes(normalize(focusCountry))) return null;
      if (focusTrack && !text.includes(focusTrack)) return null;

      return {
        id: `task-${task.id}`,
        title: task.title,
        summary: task.suggestedSummary,
        href: task.sourceUrl || "/x-hub/admin/content-review",
        country: focusCountry,
        tracks: focusTrack ? [focusTrack] : [],
        priority: task.status === "needs_review" ? "review" : "watch",
        reason: `content review task is ${task.status.replaceAll("_", " ")}`,
        sourceType: "review-task" as const,
        updatedAt: task.updatedAt,
      };
    })
    .filter(Boolean) as RegulationSignal[];
}

function dedupe(signals: RegulationSignal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${normalize(signal.title)}:${signal.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildRegulationRadar(args: {
  activeCase?: MigrationCase | null;
  contentTasks?: ContentReviewTask[];
  focusCountry?: string;
  focusTrack?: Track;
  limit?: number;
}): RegulationRadarResult {
  const activeCase = args.activeCase ?? null;
  const focusCountry = args.focusCountry || activeCase?.country;
  const focusTrack = args.focusTrack || activeCase?.track;
  const docs = getAllContentCached();
  const tasks = args.contentTasks ?? [];

  const signals = dedupe([
    ...createReviewTaskSignals(tasks, focusCountry, focusTrack),
    ...createContentSignals(docs, focusCountry, focusTrack),
  ])
    .sort((a, b) => scoreSignal(b, focusCountry, focusTrack) - scoreSignal(a, focusCountry, focusTrack))
    .slice(0, args.limit ?? 6);

  return {
    generatedAt: new Date().toISOString(),
    focusCountry,
    focusTrack,
    signals,
    watchlist: [
      {
        title: "Source-backed rule monitoring",
        detail: "Keep route pages, article updates, and staff-created content tasks tied to affected countries and programs.",
        owner: "content",
      },
      {
        title: "Affected-client review",
        detail: "When a high-priority signal appears, operations can list matching clients once CRM sync is added.",
        owner: "operations",
      },
      {
        title: "Advisor approval before publishing",
        detail: "Regulation language should remain draft-only until a staff member confirms the rule, fee, and timeline.",
        owner: "advisor",
      },
    ],
  };
}
