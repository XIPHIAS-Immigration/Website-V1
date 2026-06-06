// ==============================================
// lib/formatDate.ts
// ==============================================
export function formatDate(input: string) {
    try { const d = new Date(input); return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return input; }
  }