import fs from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
const outputPath =
  process.argv[3] ?? path.join(process.cwd(), "src", "data", "world-map-paths.ts");

if (!inputPath) {
  throw new Error("Usage: node scripts/generate-world-map-paths.mjs <natural-earth-geojson> [output]");
}

const width = 960;
const height = 520;
const skipCodes = new Set(["AQ"]);

function project(coord) {
  const [lon, lat] = coord;
  return [
    Number((((lon + 180) / 360) * width).toFixed(1)),
    Number((((90 - lat) / 180) * height).toFixed(1)),
  ];
}

function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function simplifyRing(coords) {
  if (!coords || coords.length < 3) return [];

  const projected = coords.map(project);
  const points = [];
  let last = null;

  for (const point of projected) {
    if (!last || distance(point, last) >= 1.8) {
      points.push(point);
      last = point;
    }
  }

  return points.length >= 3 ? points : projected.slice(0, Math.min(projected.length, 8));
}

function ringToPath(coords) {
  const points = simplifyRing(coords);
  if (points.length < 3) return "";

  const [first, ...rest] = points;
  return `M${first[0]} ${first[1]} ${rest.map(([x, y]) => `L${x} ${y}`).join(" ")}Z`;
}

function geometryToPath(geometry) {
  if (!geometry) return "";

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.type === "MultiPolygon"
        ? geometry.coordinates
        : [];

  return polygons
    .flatMap((polygon) => polygon.map(ringToPath).filter(Boolean))
    .join(" ");
}

const raw = await fs.readFile(inputPath, "utf8");
const geojson = JSON.parse(raw);

const countries = geojson.features
  .map((feature) => {
    const props = feature.properties ?? {};
    const code = props.ISO_A2_EH || props.ISO_A2 || props.ADM0_A3 || "";

    if (!code || code === "-99" || skipCodes.has(code)) return null;

    const pathData = geometryToPath(feature.geometry);
    if (!pathData) return null;

    return {
      code,
      name: props.NAME || props.ADMIN || code,
      path: pathData,
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.name.localeCompare(b.name));

const output = `export type WorldMapCountryPath = {
  code: string;
  name: string;
  path: string;
};

export const worldMapViewBox = "0 0 ${width} ${height}";

export const worldMapCountries: WorldMapCountryPath[] = ${JSON.stringify(countries)};
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, output, "utf8");

console.log(`Generated ${countries.length} countries -> ${outputPath}`);
