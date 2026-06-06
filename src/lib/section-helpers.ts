// src/lib/section-helpers.ts
export type Vertical = "residency" | "citizenship" | "skilled" | "corporate";

export function baseFromCategory(cat?: Vertical) {
  switch (cat) {
    case "citizenship":
      return "/citizenship";
    case "skilled":
      return "/skilled";
    case "corporate":
      return "/corporate";
    case "residency":
    default:
      return "/residency";
  }
}

export function pickSectionKey(
  sections: Record<string, unknown>,
  aliases: string[],
): string | null {
  for (const k of aliases) if (k in sections) return k;
  return null;
}

export const verticalLabel: Record<Vertical, string> = {
  residency: "Residency",
  citizenship: "Citizenship",
  skilled: "Skilled Migration",
  corporate: "Corporate Services",
};

export const investmentLabel: Record<Vertical, string> = {
  residency: "Investment",
  citizenship: "Investment",
  skilled: "Compensation",
  corporate: "Service Scope",
};
