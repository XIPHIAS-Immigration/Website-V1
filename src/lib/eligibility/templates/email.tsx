import type { Result, Track, AnswerMap } from "@/lib/eligibility/types";

export function renderEligibilityEmailHTML({
  name,
  track,
  answers,
  result,
}: {
  name: string;
  track: Track;
  answers: AnswerMap;
  result: Result;
}) {
  const pretty = (v: any) => (typeof v === "object" ? JSON.stringify(v, null, 2) : String(v));
  return /* html */ `
  <div style="font-family:Arial,sans-serif;line-height:1.6">
    <h2>Your Eligibility Results</h2>
    <p>Hi ${name || "there"}, here is your preliminary assessment for <b>${track}</b>.</p>
    <p><b>${result.tier}</b> — ${result.summary}</p>
    <ul>
      ${result.programs.map((p) => `<li><b>${p.name}</b> — ${p.why}</li>`).join("")}
    </ul>
    <h3>Your Inputs</h3>
    <pre style="background:#f7f7f7;padding:12px;border-radius:8px">${Object.entries(answers)
      .map(([k, v]) => `${k}: ${pretty(v)}`)
      .join("\n")}</pre>
    <p>Next step: <a href="https://www.xiphiasimmigration.com/contact">Book a free consultation</a>.</p>
  </div>`;
}
