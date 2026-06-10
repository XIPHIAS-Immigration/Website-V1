import { existsSync } from "node:fs";
import path from "node:path";
import { getLegacyUploadRoots, legacyUploadFolders } from "@/lib/crm/legacy-data-sources";

const allowedFolders = new Map(legacyUploadFolders.map((folder) => [folder.folder, folder]));

export function getLegacyUploadFolder(folderName: string) {
  return allowedFolders.get(folderName);
}

export function resolveLegacyFilePath(folderName: string, rawFileName: string) {
  const folder = getLegacyUploadFolder(folderName);
  if (!folder) return null;

  const fileName = path.basename(rawFileName);
  if (!fileName || fileName !== rawFileName || fileName.includes("..")) return null;

  const candidates = [
    ...getLegacyUploadRoots().map((root) => path.join(root, folder.folder, fileName)),
    ...(folder.alternatePaths ?? []).map((root) => path.join(root, fileName)),
  ];
  const filePath = candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];

  return {
    folder,
    fileName,
    filePath,
    exists: existsSync(filePath),
  };
}

export function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === ".csv") return "text/csv; charset=utf-8";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}
