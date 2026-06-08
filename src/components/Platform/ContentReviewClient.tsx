"use client";

import { useState } from "react";
import type { ContentReviewTask } from "@/lib/platform/types";
import StatusPill from "./StatusPill";

type Props = {
  initialTasks: ContentReviewTask[];
};

export default function ContentReviewClient({ initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/platform/content-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as { task?: ContentReviewTask };
    if (data.task) setTasks((prev) => [data.task!, ...prev]);
    setStatus(response.ok ? "Review task created." : "Could not create task.");
    if (response.ok) event.currentTarget.reset();
  }

  async function updateTask(id: string, nextStatus: string) {
    const response = await fetch("/api/platform/content-review", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus, reviewerNotes: notes[id] }),
    });
    const data = (await response.json()) as { task?: ContentReviewTask; error?: string };
    if (data.task) setTasks((prev) => prev.map((task) => (task.id === id ? data.task! : task)));
    setStatus(response.ok ? `Task ${nextStatus.replaceAll("_", " ")}.` : data.error || "Could not update task.");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Human-approved content updates</p>
        <h2 className="mt-1 text-xl font-bold">Content review queue</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Staff can stage source-backed update ideas, approve or reject them, and mark them published only after review. Nothing auto-publishes.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4">
          <input name="title" placeholder="Title" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <input name="sourceUrl" placeholder="Source URL" required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <input name="targetPath" placeholder="Target content path" className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <textarea name="changeSummary" placeholder="Change summary" rows={4} required className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <textarea name="sourceExcerpt" placeholder="Source excerpt" rows={4} className="rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">
            Create review task
          </button>
          {status ? <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{status}</p> : null}
        </div>
      </form>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p className="mt-1 break-all text-sm text-slate-500">{task.sourceUrl}</p>
              </div>
              <StatusPill tone={task.status === "approved" ? "green" : task.status === "rejected" ? "red" : "amber"}>
                {task.status.replaceAll("_", " ")}
              </StatusPill>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{task.suggestedSummary}</p>
            {task.targetPath ? <p className="mt-2 text-xs font-semibold text-slate-500">Target: {task.targetPath}</p> : null}
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {task.proposedChanges.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
            <textarea
              value={notes[task.id] ?? task.reviewerNotes ?? ""}
              onChange={(event) => setNotes((prev) => ({ ...prev, [task.id]: event.target.value }))}
              placeholder="Reviewer notes"
              rows={3}
              className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => updateTask(task.id, "approved")} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-bold text-white" type="button">
                Approve
              </button>
              <button
                onClick={() => updateTask(task.id, "published")}
                className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={task.status !== "approved"}
                type="button"
              >
                Mark published
              </button>
              <button onClick={() => updateTask(task.id, "rejected")} className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white" type="button">
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
      </div>
    </div>
  );
}
