import { existsSync, statSync } from "node:fs";
import path from "node:path";
import {
  getLegacyUploadRoot,
  legacySqlBackupSources,
  legacySqlDatabaseSources,
  legacyUploadFolders,
} from "@/lib/crm/legacy-data-sources";

export type LegacyPathStatus = {
  label: string;
  path: string;
  exists: boolean;
  sizeGb?: number;
  notes?: string;
};

export type LegacyCrmIntegrationSnapshot = {
  checkedAt: string;
  sqlSources: LegacyPathStatus[];
  sqlBackups: LegacyPathStatus[];
  uploadRoot: LegacyPathStatus;
  uploadFolders: LegacyPathStatus[];
  databaseUrlConfigured: boolean;
  prismaPullReady: boolean;
};

function getFileSizeGb(filePath: string) {
  try {
    return Math.round((statSync(filePath).size / 1024 / 1024 / 1024) * 100) / 100;
  } catch {
    return undefined;
  }
}

function checkPath(label: string, targetPath: string, notes?: string): LegacyPathStatus {
  const exists = existsSync(targetPath);
  return {
    label,
    path: targetPath,
    exists,
    sizeGb: exists ? getFileSizeGb(targetPath) : undefined,
    notes,
  };
}

export function getLegacyCrmIntegrationSnapshot(): LegacyCrmIntegrationSnapshot {
  const uploadRoot = getLegacyUploadRoot();
  const sqlSources = legacySqlDatabaseSources.map((source) =>
    checkPath(source.label, source.path, source.notes)
  );
  const sqlBackups = legacySqlBackupSources.map((source) =>
    checkPath(source.label, source.path, source.notes)
  );

  const uploadFolders = legacyUploadFolders.map((folder) =>
    checkPath(folder.label, path.join(uploadRoot, folder.folder), folder.dbColumns.join(", "))
  );

  const databaseUrlConfigured = Boolean(
    process.env.XIPHIAS_CRM_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  );

  return {
    checkedAt: new Date().toISOString(),
    sqlSources,
    sqlBackups,
    uploadRoot: checkPath("Private upload root", uploadRoot),
    uploadFolders,
    databaseUrlConfigured,
    prismaPullReady:
      databaseUrlConfigured &&
      (sqlSources.some((source) => source.exists) || sqlBackups.some((source) => source.exists)),
  };
}
