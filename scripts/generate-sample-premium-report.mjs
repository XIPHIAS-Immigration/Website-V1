import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "public", "samples", "xiphias-premium-report-sample.pdf");

const modulePath = pathToFileURL(path.join(root, "src", "lib", "platform", "premium-report.js")).href;
const { writeSamplePremiumReport } = await import(modulePath);

await writeSamplePremiumReport(outputPath);
console.log(outputPath);
