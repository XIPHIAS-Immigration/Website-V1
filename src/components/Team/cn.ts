// ==============================================
// lib/cn.ts – tiny className combiner
// ==============================================
export function cn(...parts: Array<string | undefined | false>) { return parts.filter(Boolean).join(" "); }