import { formatLocalizedAddress, getLocalizedLocationName } from '../mapUtils';
import type { MapLocation } from '../../types/map';

const location = {
  id: 'place-1', name: 'Sofia Central', name_bg: 'Централна София', lat: 42.7, lng: 23.3,
  town: 'Sofia', state_or_province: 'Sofia City', address_line_1: 'bul. Tsar Osvoboditel 35b',
  address_line_2: null, postcode: '1000', country: 'Bulgaria', category: 'ev_charging',
  categories: ['ev_charging'], source: null, licence: null, connectors: [], credentials: [],
} as MapLocation;

describe('map catalogue localization', () => {
  it('uses the curated Bulgarian place name when available', () => {
    expect(getLocalizedLocationName(location, 'bg')).toBe('Централна София');
    expect(getLocalizedLocationName(location, 'en')).toBe('Sofia Central');
  });

  it('localizes Bulgarian address structure and known geographic names', () => {
    expect(formatLocalizedAddress(location, 'bg')).toBe('бул. Tsar Osvoboditel 35b, София, София-град 1000, България');
    expect(formatLocalizedAddress(location, 'en')).toContain('Sofia City 1000');
  });
});
