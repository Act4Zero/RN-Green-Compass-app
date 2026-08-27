import { rankMarketplaceProducts, selectDailyMarketplacePick } from '../ranking';

const product = (id: string, category: string, featured = false) => ({
  id, slug: id, name: { en: id, bg: id }, summary: { en: '', bg: '' }, imageAlt: { en: '', bg: '' }, priceCents: 1000, currency: 'EUR' as const,
  stockQuantity: 5, productType: 'product' as const, sustainabilityRating: 4, reviewCount: 0, popularityScore: 20, featured,
  business: { id: 'b', slug: 'b', name: 'Business', summary: { en: '', bg: '' }, verified: true, sustainabilityRating: 4, shippingFeeCents: 0 },
  categories: [{ id: category, slug: category, name: { en: category, bg: category }, description: { en: '', bg: '' }, icon: 'leaf' }], certifications: [], impactClaims: [],
});

describe('marketplace ranking', () => {
  it('prioritizes profile and goal matches with explainable reasons', () => {
    const ranked = rankMarketplaceProducts([product('energy', 'clean-energy'), product('waste', 'zero-waste')], { interests: ['zero-waste'], goalCategories: ['zero-waste'], habitCategories: [], affinityCategories: [] });
    expect(ranked[0].product.id).toBe('waste');
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
  });

  it('keeps a daily pick stable and avoids recent products', () => {
    const ranked = rankMarketplaceProducts([product('one', 'reuse'), product('two', 'reuse'), product('three', 'reuse')], { interests: [], goalCategories: [], habitCategories: [], affinityCategories: [] });
    const first = selectDailyMarketplacePick(ranked, 'user', '2026-08-26', ['one']);
    const second = selectDailyMarketplacePick(ranked, 'user', '2026-08-26', ['one']);
    expect(first?.product.id).toBe(second?.product.id);
    expect(first?.product.id).not.toBe('one');
  });
});
