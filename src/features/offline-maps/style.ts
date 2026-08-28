/** Label-free fallback style: glyphs and sprites are not needed in airplane mode. */
export function createOfflineMapStyle(localUri: string): Record<string, unknown> {
  return {
    version: 8,
    name: 'Green Compass Offline',
    sources: {
      protomaps: { type: 'vector', url: `pmtiles://${localUri}`, attribution: '© OpenStreetMap contributors · Protomaps' },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#DDE8D5' } },
      { id: 'earth', type: 'fill', source: 'protomaps', 'source-layer': 'earth', paint: { 'fill-color': '#DDE8D5' } },
      { id: 'landuse', type: 'fill', source: 'protomaps', 'source-layer': 'landuse', paint: { 'fill-color': ['match', ['get', 'kind'], 'park', '#B7D9A8', 'forest', '#A9D2A0', 'protected_area', '#B5DCAE', '#D7E4CF'], 'fill-opacity': 0.72 } },
      { id: 'water', type: 'fill', source: 'protomaps', 'source-layer': 'water', paint: { 'fill-color': '#9CCDD0' } },
      { id: 'buildings', type: 'fill', source: 'protomaps', 'source-layer': 'buildings', minzoom: 13, paint: { 'fill-color': '#CFD4C7', 'fill-outline-color': '#B4BDAE' } },
      { id: 'minor-roads', type: 'line', source: 'protomaps', 'source-layer': 'roads', minzoom: 11, filter: ['!', ['in', ['get', 'kind'], ['literal', ['highway', 'major_road', 'medium_road']]]], paint: { 'line-color': '#F7F5EA', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.6, 16, 3] } },
      { id: 'major-roads', type: 'line', source: 'protomaps', 'source-layer': 'roads', filter: ['in', ['get', 'kind'], ['literal', ['highway', 'major_road', 'medium_road']]], paint: { 'line-color': '#F1B979', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.7, 16, 5] } },
      { id: 'boundaries', type: 'line', source: 'protomaps', 'source-layer': 'boundaries', paint: { 'line-color': '#577667', 'line-width': 1, 'line-dasharray': [3, 2] } },
    ],
  };
}
