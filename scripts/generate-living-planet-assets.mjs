import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const topology = require('world-atlas/countries-110m.json');
const countries = feature(topology, topology.objects.countries);
const width = 2048;
const height = 1024;
const projection = geoEquirectangular().translate([width / 2, height / 2]).scale(width / (2 * Math.PI));
const path = geoPath(projection);
const landPath = path(countries) || '';
const reliefPath = resolve(root, 'assets/images/living-planet-relief.webp');
const cinematicSourcePath = resolve(root, 'assets/images/living-planet-texture-cinematic-source.png');
const continentLabels = [
  ['EUROPE', 33, 63], ['ASIA', 91, 49], ['AFRICA', 18, 2],
  ['NORTH AMERICA', -103, 47], ['SOUTH AMERICA', -61, -18], ['AUSTRALIA', 134, -25],
];
const cityLabels = [
  ['Sofia', 23.3219, 42.6977], ['London', -0.1276, 51.5072], ['Madrid', -3.7038, 40.4168],
  ['Rome', 12.4964, 41.9028], ['Cairo', 31.2357, 30.0444], ['New York', -74.006, 40.7128],
  ['Delhi', 77.1025, 28.7041], ['Beijing', 116.4074, 39.9042], ['Tokyo', 139.6917, 35.6895],
];
const bulgarianLabelNames = [
  'ЕВРОПА', 'АЗИЯ', 'АФРИКА', 'СЕВЕРНА АМЕРИКА', 'ЮЖНА АМЕРИКА', 'АВСТРАЛИЯ',
  'София', 'Лондон', 'Мадрид', 'Рим', 'Кайро', 'Ню Йорк', 'Делхи', 'Пекин', 'Токио',
];
const englishAtlasLabels = [
  ...continentLabels.map(([name]) => ({ name, kind: 'continent' })),
  ...cityLabels.map(([name]) => ({ name, kind: 'city' })),
];
const bulgarianAtlasLabels = englishAtlasLabels.map((label, index) => ({ ...label, name: bulgarianLabelNames[index] }));

const continentMarkup = continentLabels.map(([name, longitude, latitude]) => {
  const [x, y] = projection([longitude, latitude]);
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="1.2" fill="#F0F7E9" fill-opacity="0.72" stroke="#03151B" stroke-opacity="0.78" stroke-width="3" paint-order="stroke">${name}</text>`;
}).join('');
const cityMarkup = cityLabels.map(([name, longitude, latitude]) => {
  const [x, y] = projection([longitude, latitude]);
  const emphasized = name === 'Sofia';
  return `<circle cx="${x}" cy="${y}" r="${emphasized ? 4 : 3}" fill="${emphasized ? '#F5FFD7' : '#C6F177'}"/><text x="${x + 6}" y="${y - 4}" font-family="Arial, sans-serif" font-size="${emphasized ? 15 : 13}" font-weight="${emphasized ? 700 : 600}" fill="#F7FAEF" stroke="#03151B" stroke-opacity="0.9" stroke-width="2.5" paint-order="stroke">${name}</text>`;
}).join('');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="ocean" cx="43%" cy="36%" r="78%">
      <stop offset="0" stop-color="#147D9F"/>
      <stop offset="0.5" stop-color="#075171"/>
      <stop offset="1" stop-color="#021B2C"/>
    </radialGradient>
    <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5d9870"/>
      <stop offset="0.48" stop-color="#2f6e4e"/>
      <stop offset="1" stop-color="#173f31"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#ocean)"/>
  <path d="${landPath}" fill="#3d7d59" stroke="none" opacity="0.22"/>
  <path d="${landPath}" fill="url(#land)" stroke="#a2d9b3" stroke-width="0.42" opacity="0.98"/>
  <path d="${landPath}" fill="none" stroke="#d2f3bd" stroke-width="0.2" opacity="0.18"/>
</svg>`;

const overlays = [];
try {
  await access(reliefPath);
  const landMask = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <path d="${landPath}" fill="#fff"/>
    </svg>
  `);
  const reliefLand = await sharp(reliefPath)
    .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 0.88, saturation: 1.72 })
    .linear(1.14, -14)
    .sharpen({ sigma: 0.68 })
    .ensureAlpha()
    .composite([{ input: landMask, blend: 'dest-in' }])
    .png()
    .toBuffer();
  overlays.push({ input: reliefLand, blend: 'over' });
  overlays.push({
    input: Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <path d="${landPath}" fill="rgba(28,98,62,0.17)" stroke="#BDE9B4" stroke-width="0.42" opacity="0.38"/>
        <path d="${landPath}" fill="none" stroke="#E1F6C8" stroke-width="0.18" opacity="0.12"/>
      </svg>
    `),
    blend: 'over',
  });
  overlays.push({
    input: Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${continentMarkup}
        ${cityMarkup}
      </svg>
    `),
    blend: 'over',
  });
} catch {
  // The vector-only texture remains deterministic when the optional relief source is absent.
}

const texture = await sharp(Buffer.from(svg))
  .composite(overlays)
  .png({ compressionLevel: 9 })
  .toBuffer();

await Promise.all([
  sharp(texture).png({ compressionLevel: 9 }).toFile(resolve(root, 'assets/images/living-planet-texture.png')),
  sharp(texture).webp({ quality: 88, effort: 6 }).toFile(resolve(root, 'assets/images/living-planet-texture.webp')),
]);

const atlasColumns = 4;
const atlasRows = 4;
const atlasTileWidth = 256;
const atlasTileHeight = 128;
const writeLabelAtlas = async (labels, locale) => {
  const atlasMarkup = labels.map((label, index) => {
    const column = index % atlasColumns;
    const row = Math.floor(index / atlasColumns);
    const x = column * atlasTileWidth + atlasTileWidth / 2;
    const y = row * atlasTileHeight + atlasTileHeight / 2 + 10;
    const longContinent = label.kind === 'continent' && label.name.length > 12;
    const fontSize = label.kind === 'continent' ? (longContinent ? 18 : 22) : 27;
    const letterSpacing = label.kind === 'continent' ? (longContinent ? 0.5 : 1.4) : 0;
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="${letterSpacing}" fill="#FFFFFF" stroke="#03151B" stroke-opacity="0.9" stroke-width="5" paint-order="stroke">${label.name}</text>`;
  }).join('');
  await sharp(Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${atlasColumns * atlasTileWidth}" height="${atlasRows * atlasTileHeight}" viewBox="0 0 ${atlasColumns * atlasTileWidth} ${atlasRows * atlasTileHeight}">
      ${atlasMarkup}
    </svg>
  `)).png({ compressionLevel: 9 }).toFile(resolve(root, `assets/images/living-planet-label-atlas-${locale}.png`));
};
await Promise.all([
  writeLabelAtlas(englishAtlasLabels, 'en'),
  writeLabelAtlas(bulgarianAtlasLabels, 'bg'),
]);

try {
  await access(cinematicSourcePath);
  const cinematicLabels = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${continentMarkup}
      ${cityMarkup}
    </svg>
  `);
  const cinematicTexture = await sharp(cinematicSourcePath)
    .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .composite([{ input: cinematicLabels, blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
  await Promise.all([
    sharp(cinematicTexture).png({ compressionLevel: 9 }).toFile(resolve(root, 'assets/images/living-planet-texture-cinematic.png')),
    sharp(cinematicTexture).webp({ quality: 90, effort: 6 }).toFile(resolve(root, 'assets/images/living-planet-texture-cinematic.webp')),
  ]);
} catch {
  // The deterministic relief texture remains available when the optional cinematic source is absent.
}
console.log('Generated assets/images/living-planet-texture.png');
