import { formatMarketplacePrice, normalizeMarketplaceFilters, validateCartQuantity, validateReturnDetails } from '../validation';

describe('marketplace validation', () => {
  it('normalizes filters and bounds page size', () => {
    expect(normalizeMarketplaceFilters({ query: '  bottle  ', categorySlugs: ['Zero-Waste', 'bad value!'], minPriceCents: -5, maxPriceCents: 100, limit: 100 })).toMatchObject({ query: 'bottle', categorySlugs: ['zero-waste'], minPriceCents: 0, maxPriceCents: 100, limit: 48 });
  });

  it('enforces integer quantities and available stock', () => {
    expect(validateCartQuantity(2, 4)).toBe(2);
    expect(() => validateCartQuantity(5, 4)).toThrow('not available');
    expect(() => validateCartQuantity(1.5, 4)).toThrow('whole number');
  });

  it('validates return details and formats EUR prices', () => {
    expect(validateReturnDetails('damaged', 'The item arrived damaged.')).toEqual({ reason: 'damaged', details: 'The item arrived damaged.' });
    expect(formatMarketplacePrice(1299, 'en')).toContain('12.99');
  });
});
