import type { MarketplaceFilters } from './types';

export const MARKETPLACE_PAGE_SIZE = 24;

export function normalizeMarketplaceFilters(filters: MarketplaceFilters): MarketplaceFilters {
  const bounded = (value: number | undefined) => value == null ? undefined : Math.max(0, Math.round(value));
  const minPriceCents = bounded(filters.minPriceCents);
  const maxPriceCents = bounded(filters.maxPriceCents);
  return {
    query: filters.query?.trim().slice(0, 120) || undefined,
    categorySlugs: uniqueSlugs(filters.categorySlugs),
    certificationSlugs: uniqueSlugs(filters.certificationSlugs),
    minPriceCents,
    maxPriceCents: maxPriceCents != null && minPriceCents != null ? Math.max(minPriceCents, maxPriceCents) : maxPriceCents,
    dealsOnly: Boolean(filters.dealsOnly),
    sort: filters.sort || 'recommended',
    cursor: filters.cursor || null,
    limit: Math.min(48, Math.max(1, Math.round(filters.limit || MARKETPLACE_PAGE_SIZE))),
  };
}

export function validateCartQuantity(quantity: number, stockQuantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a positive whole number.');
  if (quantity > Math.min(stockQuantity, 20)) throw new Error('The requested quantity is not available.');
  return quantity;
}

export function validateReturnDetails(reason: string, details: string) {
  const cleanReason = reason.trim();
  const cleanDetails = details.trim();
  if (!cleanReason || cleanReason.length > 80) throw new Error('Choose a valid return reason.');
  if (cleanDetails.length < 10 || cleanDetails.length > 1000) throw new Error('Return details must be between 10 and 1,000 characters.');
  return { reason: cleanReason, details: cleanDetails };
}

export function formatMarketplacePrice(cents: number, locale: 'en' | 'bg' = 'en'): string {
  return new Intl.NumberFormat(locale === 'bg' ? 'bg-BG' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function uniqueSlugs(values: string[] | undefined): string[] {
  return Array.from(new Set((values || []).map((value) => value.trim().toLowerCase()).filter((value) => /^[a-z0-9-]{1,64}$/.test(value))));
}
