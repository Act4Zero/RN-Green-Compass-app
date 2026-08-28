import { execFileSync } from 'node:child_process';

const targets = ['app', 'src', 'ios', 'android', 'app.config.js', 'app.json'];
const pattern = String.raw`api\.mapbox\.com|mapbox://|EXPO_PUBLIC_MAPBOX|MAPBOX_DOWNLOADS_TOKEN|RNMAPBOX|@rnmapbox/maps|MapboxMaps`;

try {
  const output = execFileSync('rg', ['-n', '-i', pattern, ...targets], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  process.stderr.write(`Paid Mapbox runtime reference detected:\n${output}`);
  process.exit(1);
} catch (error) {
  if (error.status === 1) process.exit(0);
  process.stderr.write(error.stderr || error.message);
  process.exit(error.status || 2);
}
