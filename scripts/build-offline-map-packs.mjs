import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createReadStream, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const [sourceArg, outputArg = 'dist/offline-maps', version = new Date().toISOString().slice(0, 10), publicBaseArg = ''] = process.argv.slice(2);
if (!sourceArg) {
  process.stderr.write('Usage: npm run maps:build-offline -- <protomaps-source.pmtiles> [output] [version] [public-base-url]\n');
  process.exit(2);
}
const source = resolve(sourceArg);
const output = resolve(outputArg);
const pmtilesBin = process.env.PMTILES_BIN || 'pmtiles';
const publicBase = publicBaseArg.replace(/\/$/, '');
const packs = [
  ['bulgaria-overview', 'България — преглед', 'Bulgaria overview', [22.35, 41.23, 28.61, 44.22], 0, 10],
  ['sofia', 'София', 'Sofia', [22.98, 42.47, 23.72, 42.94], 11, 16],
  ['plovdiv', 'Пловдив', 'Plovdiv', [24.55, 42.0, 25.03, 42.29], 11, 16],
  ['varna', 'Варна', 'Varna', [27.68, 43.08, 28.17, 43.4], 11, 16],
  ['burgas', 'Бургас', 'Burgas', [27.17, 42.37, 27.75, 42.75], 11, 16],
  ['ruse', 'Русе', 'Ruse', [25.7, 43.72, 26.22, 44.03], 11, 16],
  ['stara-zagora', 'Стара Загора', 'Stara Zagora', [25.43, 42.27, 25.87, 42.59], 11, 16],
];
mkdirSync(output, { recursive: true });

function sha256(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash('sha256');
    createReadStream(path).on('error', reject).on('data', (chunk) => hash.update(chunk)).on('end', () => resolveHash(hash.digest('hex')));
  });
}

const manifest = [];
for (const [id, bg, en, bounds, minZoom, maxZoom] of packs) {
  const filename = `${id}-${version}.pmtiles`;
  const destination = join(output, filename);
  execFileSync(pmtilesBin, ['extract', source, destination, `--bbox=${bounds.join(',')}`, `--minzoom=${minZoom}`, `--maxzoom=${maxZoom}`], { stdio: 'inherit' });
  manifest.push({ id, name: { bg, en }, bounds, minZoom, maxZoom, version, byteSize: statSync(destination).size, sha256: await sha256(destination), downloadUrl: publicBase ? `${publicBase}/${basename(destination)}` : filename, attribution: '© OpenStreetMap contributors · Protomaps' });
}
writeFileSync(join(output, 'manifest.json'), `${JSON.stringify({ version, generatedAt: new Date().toISOString(), packs: manifest }, null, 2)}\n`);
process.stdout.write(`Built ${manifest.length} verified PMTiles packages in ${output}\n`);
