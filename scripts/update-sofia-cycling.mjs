import { readFile, writeFile, rename } from 'node:fs/promises';
import { buildCyclingSnapshot, SOFIA_CYCLING_BOUNDS } from './lib/sofia-cycling.mjs';
const [west, south, east, north] = SOFIA_CYCLING_BOUNDS;
const box = `(${south},${west},${north},${east})`;
const query = `[out:json][timeout:25][maxsize:134217728];(way[highway=cycleway]${box};way[highway~"^(path|footway|pedestrian)$"][bicycle=designated]${box};way[highway][~"^cycleway(:left|:right|:both)?$"~"^(lane|track|opposite_lane|opposite_track|shared_lane|share_busway)$"]${box};node[amenity~"^(bicycle_parking|drinking_water)$"]${box};);out tags geom;`;
const input = process.argv[2];
let raw;
if (input) raw = JSON.parse(await readFile(input, 'utf8'));
else {
  const response = await fetch(`https://overpass-api.de/api/interpreter?${new URLSearchParams({data: query})}`, { signal: AbortSignal.timeout(65000) });
  if (!response.ok) throw new Error(`OpenStreetMap query failed: ${response.status}`);
  raw = await response.json();
}
const snapshot = buildCyclingSnapshot(raw);
const output = new URL('../src/features/cycling/data/sofia-cycling.json', import.meta.url);
const temporary = new URL('../src/features/cycling/data/sofia-cycling.next.json', import.meta.url);
await writeFile(temporary, JSON.stringify(snapshot));
await rename(temporary, output);
console.log(JSON.stringify({ updatedAt: snapshot.metadata.dataUpdatedAt, counts: snapshot.features.reduce((counts, feature) => ({ ...counts, [feature.properties.kind]: (counts[feature.properties.kind] || 0) + 1 }), {}) }));
