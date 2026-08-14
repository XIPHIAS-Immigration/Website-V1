import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sourcePath = "C:/Users/Adyanta Dubey/Downloads/Mohammed_Abdul_Azim_Australia_Assessment (2).xlsx";
const outputDir = "E:/Website-V1/tmp/candidate-report/workbook-preview";

await fs.mkdir(outputDir, { recursive: true });
const source = await FileBlob.load(sourcePath);
const workbook = await SpreadsheetFile.importXlsx(source);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 20,
  tableMaxCols: 12,
  tableMaxCellChars: 300,
});
await fs.writeFile(`${outputDir}/summary.ndjson`, summary.ndjson, "utf8");

const sheetSummary = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 4000 });
await fs.writeFile(`${outputDir}/sheets.ndjson`, sheetSummary.ndjson, "utf8");

const sheetNames = [];
for (let index = 0; ; index += 1) {
  try {
    const sheet = workbook.worksheets.getItemAt(index);
    if (!sheet) break;
    sheetNames.push(sheet.name);
  } catch {
    break;
  }
}

for (const sheetName of sheetNames) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const usedRange = sheet.getUsedRange();
  const values = usedRange ? usedRange.values : [];
  await fs.writeFile(
    `${outputDir}/${sheetName.replace(/[^a-z0-9_-]+/gi, "-")}-values.json`,
    JSON.stringify(values, null, 2),
    "utf8",
  );
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1.5, format: "png" });
  await fs.writeFile(
    `${outputDir}/${sheetName.replace(/[^a-z0-9_-]+/gi, "-")}.png`,
    new Uint8Array(await preview.arrayBuffer()),
  );
}

console.log(JSON.stringify({ sheetNames, outputDir }, null, 2));
