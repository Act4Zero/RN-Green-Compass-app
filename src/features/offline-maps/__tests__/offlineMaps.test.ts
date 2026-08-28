import { BUILTIN_OFFLINE_PACKS, isPackDownloadable, selectBestOfflinePack } from '../manifest';
import { createOfflineMapStyle } from '../style';

describe('offline map source selection', () => {
  it('prefers the most detailed installed pack containing the camera', () => {
    const selected = selectBestOfflinePack(
      BUILTIN_OFFLINE_PACKS,
      new Set(['bulgaria-overview', 'sofia']),
      { lat: 42.6977, lng: 23.3219 },
    );
    expect(selected?.id).toBe('sofia');
  });

  it('falls back to the Bulgaria overview outside an installed city pack', () => {
    const selected = selectBestOfflinePack(
      BUILTIN_OFFLINE_PACKS,
      new Set(['bulgaria-overview', 'sofia']),
      { lat: 43.2141, lng: 27.9147 },
    );
    expect(selected?.id).toBe('bulgaria-overview');
  });

  it('does not expose metadata-only fallback packs as downloadable', () => {
    expect(BUILTIN_OFFLINE_PACKS.every((pack) => !isPackDownloadable(pack))).toBe(true);
  });

  it('creates a local PMTiles source without remote glyph or sprite dependencies', () => {
    const style = createOfflineMapStyle('file:///maps/sofia.pmtiles') as any;
    expect(style.sources.protomaps.url).toBe('pmtiles://file:///maps/sofia.pmtiles');
    expect(style.glyphs).toBeUndefined();
    expect(style.sprite).toBeUndefined();
  });
});
