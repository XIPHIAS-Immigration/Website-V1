// Map PROGRAM href -> brochure URL (PDF). Put PDFs in /public/brochures/*.
const brochureMap: Record<string, string> = {
    // Residency → Bulgaria (examples)
    "/residency/bulgaria/bulgaria-aif-residency": "/images/residency/xiphias-corporate-mobility.pdf",
  
    // Residency → Canada
    "/residency/canada/startupvisa": "/images/residency/xiphias-corporate-mobility.pdf",
  
    // ...continue all programs from your menu
  };
  
  export function getBrochureUrl(programHref: string): string | null {
    return brochureMap[programHref] ?? null;
  }
  
  export type BrochureMap = typeof brochureMap;
  