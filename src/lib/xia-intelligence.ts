import "server-only";

import { getProgrammeExplorerData } from "@/lib/programme-explorer";
import { highSkillRoutes } from "@/lib/xia-intelligence-model";

export type XiaIntelligenceData = ReturnType<typeof getXiaIntelligenceData>;

export function getXiaIntelligenceData() {
  const programme = getProgrammeExplorerData();

  return {
    generatedAt: new Date().toISOString(),
    programme,
    highSkillRoutes,
    totals: {
      programmeRoutes: programme.totals.programmes,
      countries: programme.totals.countries,
      highSkillRoutes: highSkillRoutes.length,
      sitePages: programme.totals.siteContent,
    },
  };
}
