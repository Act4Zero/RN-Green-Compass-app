import { getLocalizedMapNameExpression, localizeMapStyle } from '../mapStyleLocale';

describe('MapLibre label localization', () => {
  const style = {
    version: 8,
    layers: [
      { id: 'city-label', type: 'symbol', layout: { 'text-field': ['get', 'name:latin'], 'text-size': 12 } },
      { id: 'road-shield', type: 'symbol', layout: { 'text-field': ['get', 'ref'] } },
      { id: 'water', type: 'fill', paint: { 'fill-color': '#00f' } },
    ],
  };

  it('uses local Cyrillic names first in Bulgarian', () => {
    const localized = localizeMapStyle(style, 'bg');
    expect(localized.layers?.[0].layout?.['text-field']).toEqual(getLocalizedMapNameExpression('bg'));
    expect(localized.layers?.[1]).toEqual(style.layers[1]);
  });

  it('uses English and Latin names first in English', () => {
    const localized = localizeMapStyle(style, 'en');
    expect(localized.layers?.[0].layout?.['text-field']).toEqual(getLocalizedMapNameExpression('en'));
    expect(localized.layers?.[2]).toEqual(style.layers[2]);
  });
});
