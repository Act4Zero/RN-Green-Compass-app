import { getUtcSunDirection, isSpherePointVisible, latLngToSphere, mapExperienceReducer, offlinePackContainsPoint } from '../livingPlanet';

describe('Living Planet helpers', () => {
  it('projects geographic coordinates to a stable sphere radius', () => {
    const point = latLngToSphere({ lat: 42.7, lng: 23.3 }, 2);
    expect(Math.hypot(...point)).toBeCloseTo(2, 6);
  });

  it('detects the visible hemisphere', () => {
    expect(isSpherePointVisible([0, 0, 1])).toBe(true);
    expect(isSpherePointVisible([0, 0, -1])).toBe(false);
  });

  it('uses explicit transition states', () => {
    expect(mapExperienceReducer('globe', { type: 'open-map' })).toBe('to-map');
    expect(mapExperienceReducer('to-map', { type: 'transition-complete' })).toBe('map');
    expect(mapExperienceReducer('map', { type: 'open-globe' })).toBe('to-globe');
    expect(mapExperienceReducer('to-globe', { type: 'transition-complete' })).toBe('globe');
  });

  it('selects offline packs by bounds and returns a normalized sun vector', () => {
    expect(offlinePackContainsPoint([22, 41, 29, 45], { lat: 42.7, lng: 23.3 })).toBe(true);
    expect(Math.hypot(...getUtcSunDirection(new Date('2026-06-21T12:00:00Z')))).toBeCloseTo(8, 6);
  });
});
