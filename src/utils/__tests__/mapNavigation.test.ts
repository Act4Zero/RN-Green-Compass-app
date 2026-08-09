import { Platform } from 'react-native';
import { getPlatformSpecificNavigationUrl } from '../mapUtils';

describe('map navigation URLs', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
  });

  it('builds an Apple Maps URL on iOS', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    expect(getPlatformSpecificNavigationUrl(42.7, 23.3, 'Sofia Central')).toBe(
      'maps:?q=Sofia%20Central&ll=42.7,23.3',
    );
  });

  it('builds a browser-safe Google Maps URL on web and Android', () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const url = getPlatformSpecificNavigationUrl(42.7, 23.3, 'Sofia Central', '1 Main St');
    expect(url).toContain('https://www.google.com/maps/search/?api=1');
    expect(url).toContain('query=42.7,23.3');
    expect(url).toContain('Sofia%20Central');
  });
});
