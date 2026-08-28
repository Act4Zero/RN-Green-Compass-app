import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/generate-living-planet-relief.mjs <Natural Earth Prisma TIFF>');
await access(input);

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'assets/images/living-planet-relief.webp');

await sharp(input)
  .resize(2048, 1024, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
  .modulate({ brightness: 0.92, saturation: 1.18 })
  .sharpen({ sigma: 0.72 })
  .webp({ quality: 86, effort: 6 })
  .toFile(output);

console.log(`Generated ${output}`);
