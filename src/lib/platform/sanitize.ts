export function normalizeText(value: unknown, max = 1000) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function normalizeEmail(value: unknown) {
  const email = normalizeText(value, 160).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function normalizePhone(value: unknown) {
  return normalizeText(value, 40).replace(/[^\d+()\-\s.]/g, "");
}

export function parseBoolean(value: unknown) {
  return value === true || value === "true" || value === "1" || value === "on";
}

